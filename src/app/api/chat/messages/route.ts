import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Buscar mensagens de uma conversa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      )
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Enviar nova mensagem
export async function POST(request: NextRequest) {
  try {
    const {
      conversation_id,
      content,
      sender_type,
      sender_id,
      sender_name,
      is_ai_response = false
    } = await request.json()

    if (!conversation_id || !content || !sender_type) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Determinar se deve marcar como lida
    // Mensagens do usuário ficam como não lidas para o coordenador
    // Mensagens do coordenador/assistente ficam como não lidas para o usuário
    const isRead = false // Por padrão, sempre não lida para o destinatário

    // Inserir mensagem
    const { data: message, error: messageError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id,
        content,
        sender_type,
        sender_id,
        sender_name: sender_name || (sender_type === 'user' ? 'Usuário' : 'Assistente'),
        is_ai_response,
        is_read: isRead
      })
      .select()
      .single()

    console.log('💾 Resultado da inserção da mensagem:', { data: message, error: messageError })

    if (messageError) {
      console.error('❌ Erro ao inserir mensagem:', messageError)
      throw messageError
    }

    if (!message) {
      console.error('❌ Nenhuma mensagem retornada')
      return NextResponse.json(
        { error: 'Erro ao inserir mensagem - dados não retornados' },
        { status: 500 }
      )
    }

    // Atualizar timestamp da conversa
    await supabaseAdmin
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation_id)

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Marcar mensagens como lidas
export async function PATCH(request: NextRequest) {
  try {
    const { message_id, message_ids, conversation_id, sender_type, is_read } = await request.json()

    // Marcar mensagem específica como lida
    if (message_id) {
      const { error } = await supabaseAdmin
        .from('chat_messages')
        .update({ is_read: is_read !== undefined ? is_read : true })
        .eq('id', message_id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Marcar múltiplas mensagens como lidas
    if (message_ids && Array.isArray(message_ids)) {
      const { error } = await supabaseAdmin
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', message_ids)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Marcar todas as mensagens de um tipo em uma conversa como lidas
    if (conversation_id && sender_type) {
      const { error } = await supabaseAdmin
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation_id)
        .eq('sender_type', sender_type)
        .eq('is_read', false)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Parâmetros obrigatórios não fornecidos' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}