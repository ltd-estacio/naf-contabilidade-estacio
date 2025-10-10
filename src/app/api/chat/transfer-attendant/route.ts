import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      session_id, // conversation_id
      from_user_id,
      from_user_type,
      from_user_name,
      to_user_id,
      to_user_type,
      to_user_name,
      transfer_reason,
      transfer_notes
    } = await request.json()

    if (!session_id || !from_user_id || !to_user_id) {
      return NextResponse.json(
        { success: false, message: 'session_id, from_user_id e to_user_id são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('🔄 Iniciando transferência:', {
      session_id,
      from_user_id,
      to_user_id,
      to_user_type,
      transfer_reason
    })

    try {
      // 1. Buscar conversa atual com todas as mensagens
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .select('*, chat_messages(*)')
        .eq('id', session_id)
        .single()

      if (convError || !conversation) {
        console.error('Conversa não encontrada:', convError)
        return NextResponse.json(
          { success: false, message: 'Conversa não encontrada' },
          { status: 404 }
        )
      }

      console.log(`📋 Conversa encontrada com ${conversation.chat_messages?.length || 0} mensagens`)

      // 2. Criar registro de transferência
      const transferId = `transfer-${Date.now()}`
      const transferRecord = {
        id: transferId,
        conversation_id: session_id,
        from_user_id,
        from_user_type: from_user_type || 'client',
        from_user_name: from_user_name || 'Cliente',
        to_user_id,
        to_user_type: to_user_type || 'coordinator',
        to_user_name: to_user_name || 'Atendente',
        transfer_reason: transfer_reason || 'Solicitação de transferência',
        transfer_notes: transfer_notes || '',
        status: 'pending',
        transferred_at: new Date().toISOString(),
        accepted_at: null,
        created_at: new Date().toISOString()
      }

      // Tentar salvar no Supabase
      const { error: transferError } = await supabaseAdmin
        .from('chat_transfer_requests')
        .insert(transferRecord)

      if (transferError) {
        console.warn('Erro ao salvar transferência no Supabase, usando fallback:', transferError)
      }

      // 3. Atualizar conversa com informações da transferência
      const updatedConversation: any = {
        status: 'waiting_transfer',
        transferred_from: from_user_name,
        transfer_pending: true,
        updated_at: new Date().toISOString()
      }

      // Atribuir ao novo atendente baseado no tipo
      if (to_user_type === 'coordinator') {
        updatedConversation.coordinator_id = to_user_id
        updatedConversation.coordinator_name = to_user_name
      } else if (to_user_type === 'student') {
        updatedConversation.student_id = to_user_id
        updatedConversation.student_name = to_user_name
      }

      // Atualizar no Supabase
      const { error: updateError } = await supabaseAdmin
        .from('chat_conversations')
        .update(updatedConversation)
        .eq('id', session_id)

      if (updateError) {
        console.error('Erro ao atualizar conversa:', updateError)
      }

      // 4. Adicionar mensagem de sistema informando sobre a transferência
      const transferMessage = {
        conversation_id: session_id,
        content: `🔄 **Transferência Solicitada**

**De:** ${from_user_name} (${from_user_type === 'coordinator' ? 'Coordenador' : from_user_type === 'student' ? 'Estudante' : 'Cliente'})
**Para:** ${to_user_name} (${to_user_type === 'coordinator' ? 'Coordenador' : 'Estudante'})

**Motivo:** ${transfer_reason}
${transfer_notes ? `**Observações:** ${transfer_notes}` : ''}

⏳ Aguardando aceitação do novo atendente...

📋 **Histórico completo da conversa está disponível** - ${conversation.chat_messages?.length || 0} mensagens anteriores`,
        sender_type: 'system',
        sender_id: 'system',
        sender_name: 'Sistema NAF',
        is_ai_response: false,
        is_read: false,
        created_at: new Date().toISOString()
      }

      const { error: msgError } = await supabaseAdmin
        .from('chat_messages')
        .insert(transferMessage)

      if (msgError) {
        console.warn('Erro ao inserir mensagem de transferência:', msgError)
      }

      // 5. Notificar novo atendente (criar notificação)
      try {
        await supabaseAdmin
          .from('chat_notifications')
          .insert({
            user_id: to_user_id,
            user_type: to_user_type,
            conversation_id: session_id,
            notification_type: 'transfer_request',
            title: 'Nova solicitação de transferência',
            message: `${from_user_name} solicitou transferência de atendimento para você`,
            data: {
              transfer_id: transferId,
              from_user_name,
              transfer_reason,
              message_count: conversation.chat_messages?.length || 0
            },
            is_read: false,
            created_at: new Date().toISOString()
          })
      } catch (notifError) {
        console.warn('Erro ao criar notificação:', notifError)
      }

      console.log('✅ Transferência processada com sucesso')

      return NextResponse.json({
        success: true,
        transfer: transferRecord,
        session: {
          id: session_id,
          ...updatedConversation,
          message_count: conversation.chat_messages?.length || 0
        },
        message: `Transferência solicitada com sucesso. ${to_user_name} será notificado.`
      })

    } catch (supabaseError) {
      console.error('Erro do Supabase:', supabaseError)

      // Fallback: usar sistema em memória
      if (!global.chatTransfers) {
        global.chatTransfers = new Map()
      }

      const fallbackTransfer = {
        id: `transfer-${Date.now()}`,
        session_id,
        from_user_id,
        from_user_type,
        from_user_name,
        to_user_id,
        to_user_type,
        to_user_name,
        transfer_reason,
        transfer_notes,
        status: 'pending',
        transferred_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      global.chatTransfers.set(fallbackTransfer.id, fallbackTransfer)

      return NextResponse.json({
        success: true,
        transfer: fallbackTransfer,
        message: 'Transferência processada (modo fallback)'
      })
    }

  } catch (error) {
    console.error('Erro ao processar transferência:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')

    let transfers = []

    if (global.chatTransfers) {
      transfers = Array.from(global.chatTransfers.values())

      // Aplicar filtros
      if (sessionId) {
        transfers = transfers.filter(t => t.session_id === sessionId)
      }
      if (userId) {
        transfers = transfers.filter(t => t.from_user_id === userId || t.to_user_id === userId)
      }
      if (status) {
        transfers = transfers.filter(t => t.status === status)
      }

      // Ordenar por data de transferência (mais recente primeiro)
      transfers.sort((a, b) => new Date(b.transferred_at).getTime() - new Date(a.transferred_at).getTime())
    }

    return NextResponse.json({
      success: true,
      transfers,
      total: transfers.length
    })

  } catch (error) {
    console.error('Erro ao buscar transferências:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      transfer_id,
      status,
      notes
    } = await request.json()

    if (!transfer_id || !status) {
      return NextResponse.json(
        { success: false, message: 'transfer_id e status são obrigatórios' },
        { status: 400 }
      )
    }

    if (!global.chatTransfers || !global.chatTransfers.has(transfer_id)) {
      return NextResponse.json(
        { success: false, message: 'Transferência não encontrada' },
        { status: 404 }
      )
    }

    const transfer = global.chatTransfers.get(transfer_id)
    const updatedTransfer = {
      ...transfer,
      status,
      notes: notes || transfer.notes,
      updated_at: new Date().toISOString()
    }

    if (status === 'accepted') {
      updatedTransfer.accepted_at = new Date().toISOString()
    } else if (status === 'completed') {
      updatedTransfer.completed_at = new Date().toISOString()
    }

    global.chatTransfers.set(transfer_id, updatedTransfer)

    // Se a transferência foi aceita/completada, atualizar a sessão
    if (status === 'accepted' || status === 'completed') {
      if (global.chatSessions && global.chatSessions.has(transfer.session_id)) {
        const session = global.chatSessions.get(transfer.session_id)
        const updatedSession = {
          ...session,
          status: status === 'completed' ? 'active' : 'transferred',
          updated_at: new Date().toISOString()
        }
        global.chatSessions.set(transfer.session_id, updatedSession)
      }
    }

    return NextResponse.json({
      success: true,
      transfer: updatedTransfer,
      message: `Transferência ${status === 'accepted' ? 'aceita' : status === 'completed' ? 'completada' : 'atualizada'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao atualizar transferência:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}