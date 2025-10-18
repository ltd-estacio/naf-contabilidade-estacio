import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Contar mensagens não lidas para coordenador ou usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coordinatorId = searchParams.get('coordinator_id')
    const userId = searchParams.get('user_id')
    const conversationId = searchParams.get('conversation_id')

    if (!coordinatorId && !userId) {
      return NextResponse.json(
        { error: 'coordinator_id ou user_id é obrigatório' },
        { status: 400 }
      )
    }

    let unreadCount = 0

    if (coordinatorId) {
      // Contar mensagens não lidas recebidas pelo coordenador

      // 1. Contar solicitações de chat pendentes
      const { data: pendingChats, error: pendingError } = await supabaseAdmin
        .from('chat_conversations')
        .select('id')
        .eq('human_requested', true)
        .is('chat_accepted_by', null)
        .eq('status', 'active')

      if (pendingError) {
        console.error('Erro ao buscar chats pendentes:', pendingError)
      }

      const pendingCount = pendingChats?.length || 0

      // 2. Contar mensagens não lidas em chats ativos do coordenador
      const { data: conversations, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .select(`
          id,
          messages:chat_messages(
            id,
            sender_type,
            is_read,
            created_at
          )
        `)
        .eq('coordinator_id', coordinatorId)
        .eq('status', 'active_human')

      if (convError) {
        console.error('Erro ao buscar conversas:', convError)
      }

      let unreadMessages = 0
      if (conversations) {
        conversations.forEach((conv: unknown) => {
          const userUnreadMessages = conv.messages?.filter(
            (msg: unknown) => msg.sender_type === 'user' && !msg.is_read
          ) || []
          unreadMessages += userUnreadMessages.length
        })
      }

      unreadCount = pendingCount + unreadMessages

      console.log('📊 Contagem para coordenador:', {
        coordinatorId,
        pendingChats: pendingCount,
        unreadMessages,
        total: unreadCount
      })

    } else if (userId) {
      // Contar mensagens não lidas recebidas pelo usuário
      let whereClause: unknown = { user_id: userId }

      if (conversationId) {
        whereClause = { id: conversationId }
      }

      const { data: conversations, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .select(`
          id,
          status,
          coordinator_id,
          messages:chat_messages(
            id,
            sender_type,
            is_read,
            created_at
          )
        `)
        .match(whereClause)
        .order('created_at', { ascending: false })

      if (convError) {
        console.error('Erro ao buscar conversas do usuário:', convError)
      }

      if (conversations && conversations.length > 0) {
        conversations.forEach((conv: unknown) => {
          // Contar mensagens não lidas do coordenador ou assistente
          const coordUnreadMessages = conv.messages?.filter(
            (msg: unknown) => (msg.sender_type === 'coordinator' || msg.sender_type === 'assistant') && !msg.is_read
          ) || []
          unreadCount += coordUnreadMessages.length
        })
      }

      console.log('📊 Contagem para usuário:', {
        userId,
        conversationId,
        unreadCount
      })
    }

    return NextResponse.json({
      success: true,
      unread_count: unreadCount,
      coordinator_id: coordinatorId,
      user_id: userId,
      conversation_id: conversationId
    })

  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Marcar mensagens como lidas
export async function POST(request: NextRequest) {
  try {
    const { coordinator_id, user_id, conversation_id, mark_all } = await request.json()

    if (!coordinator_id && !user_id) {
      return NextResponse.json(
        { error: 'coordinator_id ou user_id é obrigatório' },
        { status: 400 }
      )
    }

    let updateResult

    if (coordinator_id) {
      // Marcar mensagens como lidas para o coordenador
      if (conversation_id) {
        // Marcar mensagens de uma conversa específica
        updateResult = await supabaseAdmin
          .from('chat_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversation_id)
          .eq('sender_type', 'user')
          .eq('is_read', false)
      } else if (mark_all) {
        // Marcar todas as mensagens do coordenador como lidas
        const { data: conversations } = await supabaseAdmin
          .from('chat_conversations')
          .select('id')
          .eq('coordinator_id', coordinator_id)

        if (conversations) {
          const conversationIds = conversations.map(c => c.id)
          updateResult = await supabaseAdmin
            .from('chat_messages')
            .update({ is_read: true })
            .in('conversation_id', conversationIds)
            .eq('sender_type', 'user')
            .eq('is_read', false)
        }
      }
    } else if (user_id) {
      // Marcar mensagens como lidas para o usuário
      if (conversation_id) {
        updateResult = await supabaseAdmin
          .from('chat_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversation_id)
          .in('sender_type', ['coordinator', 'assistant'])
          .eq('is_read', false)
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: updateResult?.data?.length || 0,
      message: 'Mensagens marcadas como lidas'
    })

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}