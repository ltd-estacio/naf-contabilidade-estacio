import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Server-Sent Events para notificações em tempo real
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const coordinatorId = searchParams.get('coordinator_id')

  if (!coordinatorId) {
    return NextResponse.json(
      { error: 'coordinator_id é obrigatório' },
      { status: 400 }
    )
  }

  // Configurar headers para Server-Sent Events
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  // Criar stream
  const stream = new ReadableStream({
    start(controller) {
      // Função para enviar notificação
      const sendNotification = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(new TextEncoder().encode(message))
      }

      // Enviar mensagem inicial
      sendNotification({
        type: 'connected',
        message: 'Conectado ao sistema de notificações',
        timestamp: new Date().toISOString()
      })

      // Verificar novas solicitações de chat e mensagens a cada 3 segundos
      const interval = setInterval(async () => {
        try {
          await checkForNewChatRequests(coordinatorId, sendNotification)
          await checkForNewMessages(coordinatorId, sendNotification)
        } catch (error) {
          console.error('Erro ao verificar notificações:', error)
        }
      }, 3000)

      // Notificações removidas - apenas dados reais

      // Cleanup quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, { headers })
}

// POST - Marcar notificação como lida
export async function POST(request: NextRequest) {
  try {
    const { notification_id, coordinator_id } = await request.json()

    if (!notification_id || !coordinator_id) {
      return NextResponse.json(
        { error: 'notification_id e coordinator_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Simular marcar como lida
    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    })

  } catch (error) {
    console.error('Erro ao marcar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para verificar novas solicitações de chat
async function checkForNewChatRequests(coordinatorId: string, sendNotification: Function) {
  try {
    // Buscar conversas pendentes
    const { data: conversations, error } = await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .eq('human_requested', true)
      .is('chat_accepted_by', null)
      .eq('status', 'active')
      .order('human_request_timestamp', { ascending: false })
      .limit(5)

    if (error) {
      throw error
    }

    if (conversations && conversations.length > 0) {
      // Enviar notificação para cada conversa pendente
      conversations.forEach(conv => {
        sendNotification({
          type: 'pending_chat_request',
          conversation_id: conv.id,
          user_name: conv.user_name || 'Cliente',
          user_email: conv.user_email || '',
          message: `${conv.user_name || 'Cliente'} está aguardando atendimento`,
          timestamp: conv.human_request_timestamp,
          urgency: getRequestUrgency(conv.human_request_timestamp),
          waiting_time: getWaitingTime(conv.human_request_timestamp)
        })
      })

      // Enviar resumo
      sendNotification({
        type: 'chat_summary',
        total_pending: conversations.length,
        message: `${conversations.length} cliente(s) aguardando atendimento`,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.log('Erro ao verificar chats:', error)
    // Apenas log do erro - sem dados mock
  }
}

// Função para determinar urgência baseada no tempo de espera
function getRequestUrgency(requestTime: string): string {
  const now = new Date()
  const requested = new Date(requestTime)
  const waitingMinutes = (now.getTime() - requested.getTime()) / (1000 * 60)

  if (waitingMinutes > 10) return 'high'
  if (waitingMinutes > 5) return 'medium'
  return 'normal'
}

// Função para verificar novas mensagens em chats ativos do coordenador
async function checkForNewMessages(coordinatorId: string, sendNotification: Function) {
  try {
    // Buscar conversas onde o coordenador está ativo
    const { data: conversations, error } = await supabaseAdmin
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
      .eq('coordinator_id', coordinatorId)
      .eq('status', 'active_human')
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    if (conversations && conversations.length > 0) {
      conversations.forEach((conv: unknown) => {
        // Verificar se há mensagens não lidas do usuário
        const unreadUserMessages = conv.messages?.filter(
          (msg: unknown) => msg.sender_type === 'user' && !msg.is_read
        ) || []

        if (unreadUserMessages.length > 0) {
          const latestMessage = unreadUserMessages[unreadUserMessages.length - 1] // Última mensagem não lida
          sendNotification({
            type: 'new_message',
            conversation_id: conv.id,
            user_name: conv.user_name || 'Cliente',
            message_content: latestMessage.content,
            message_preview: latestMessage.content.substring(0, 50) + (latestMessage.content.length > 50 ? '...' : ''),
            unread_count: unreadUserMessages.length,
            timestamp: latestMessage.created_at
          })
        }
      })
    }

  } catch (error) {
    console.log('Erro ao verificar mensagens:', error)
  }
}

// Função para calcular tempo de espera
function getWaitingTime(requestTime: string): string {
  const now = new Date()
  const requested = new Date(requestTime)
  const waitingMinutes = Math.floor((now.getTime() - requested.getTime()) / (1000 * 60))

  if (waitingMinutes < 1) return 'menos de 1 minuto'
  if (waitingMinutes === 1) return '1 minuto'
  if (waitingMinutes < 60) return `${waitingMinutes} minutos`

  const hours = Math.floor(waitingMinutes / 60)
  const remainingMinutes = waitingMinutes % 60

  if (hours === 1 && remainingMinutes === 0) return '1 hora'
  if (hours === 1) return `1 hora e ${remainingMinutes} minutos`
  if (remainingMinutes === 0) return `${hours} horas`
  return `${hours} horas e ${remainingMinutes} minutos`
}