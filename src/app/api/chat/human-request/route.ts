import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Solicitar atendimento humano
export async function POST(request: NextRequest) {
  try {
    const { conversation_id, user_id } = await request.json()

    if (!conversation_id || !user_id) {
      return NextResponse.json(
        { error: 'conversation_id e user_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar conversa para marcar que foi solicitado atendimento humano
    const { data: conversation, error } = await supabaseAdmin
      .from('chat_conversations')
      .update({
        human_requested: true,
        human_request_timestamp: new Date().toISOString(),
        status: 'waiting_human'
      })
      .eq('id', conversation_id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) throw error

    // Adicionar mensagem do sistema informando que a solicitação foi feita
    const { error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id,
        content: '🤝 **Solicitação de Atendimento Humano Enviada**\n\nSua solicitação foi enviada para nossos coordenadores. Em breve um especialista entrará neste chat para ajudá-lo.',
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        is_ai_response: false,
        is_read: true
      })

    if (msgError) throw msgError

    return NextResponse.json({
      success: true,
      conversation,
      message: 'Solicitação de atendimento humano enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao solicitar atendimento humano:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar solicitações de atendimento humano pendentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coordinatorId = searchParams.get('coordinator_id')

    // Buscar conversas com solicitação de atendimento humano pendente
    const query = supabaseAdmin
      .from('chat_conversations')
      .select(`
        *,
        messages:chat_messages(
          id,
          content,
          sender_type,
          sender_name,
          created_at,
          is_read
        )
      `)
      .eq('human_requested', true)
      .is('chat_accepted_by', null)
      .eq('status', 'waiting_human')
      .order('human_request_timestamp', { ascending: true })

    const { data: pendingRequests, error } = await query

    if (error) throw error

    // Calcular mensagens não lidas e pegar última mensagem
    const requestsWithDetails = pendingRequests?.map(conv => {
      const sortedMessages = conv.messages?.sort((a: unknown, b: unknown) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || []

      const unreadCount = conv.messages?.filter(
        (msg: unknown) => msg.sender_type === 'user' && !msg.is_read
      ).length || 0

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: sortedMessages[0] || null,
        messages: sortedMessages
      }
    }) || []

    return NextResponse.json({ pendingRequests: requestsWithDetails })

  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}