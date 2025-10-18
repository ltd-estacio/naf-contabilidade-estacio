import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Estudante ou Coordenador aceita ou rejeita solicitação de transferência
export async function POST(request: NextRequest) {
  try {
    const {
      transfer_request_id,
      student_id,
      student_name,
      coordinator_id,
      coordinator_name,
      action, // 'accept' ou 'reject'
      message
    } = await request.json()

    const acceptorId = coordinator_id || student_id
    const acceptorName = coordinator_name || student_name
    const acceptorType = coordinator_id ? 'coordinator' : 'student'

    if (!transfer_request_id || !acceptorId || !action) {
      return NextResponse.json(
        { error: 'transfer_request_id, (student_id ou coordinator_id) e action são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action deve ser "accept" ou "reject"' },
        { status: 400 }
      )
    }

    let transferRequest = null

    try {
      // Buscar a solicitação de transferência no Supabase
      let query = supabaseAdmin
        .from('chat_transfer_requests')
        .select('*')
        .eq('id', transfer_request_id)
        .eq('status', 'pending')

      // Filtrar pelo tipo correto de destinatário
      if (acceptorType === 'student') {
        query = query.eq('to_student_id', acceptorId)
      } else {
        query = query.eq('to_coordinator_id', acceptorId)
      }

      const { data: request, error: requestError } = await query.single()

      if (requestError) {
        throw requestError
      }

      transferRequest = request

    } catch (supabaseError) {
      console.log('Erro do Supabase, buscando no sistema local:', supabaseError)

      // Fallback: buscar no sistema local
      if (global.transferRequests && global.transferRequests.has(transfer_request_id)) {
        const localRequest = global.transferRequests.get(transfer_request_id)
        const matchesRecipient = acceptorType === 'student'
          ? localRequest.to_student_id === acceptorId
          : localRequest.to_coordinator_id === acceptorId

        if (matchesRecipient && localRequest.status === 'pending') {
          transferRequest = localRequest
        }
      }
    }

    if (!transferRequest) {
      return NextResponse.json(
        { error: 'Solicitação de transferência não encontrada ou expirada' },
        { status: 404 }
      )
    }

    // Verificar se ainda não expirou
    if (new Date(transferRequest.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Solicitação de transferência expirou' },
        { status: 410 }
      )
    }

    if (action === 'accept') {
      try {
        // Atualizar a conversa para o novo responsável (estudante ou coordenador)
        const updateData: any = {
          coordinator_id: acceptorId,
          chat_accepted_by: acceptorId,
          chat_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Status baseado no tipo de aceitação
        if (acceptorType === 'student') {
          updateData.status = 'active_student'
        } else {
          updateData.status = 'active_human'
        }

        const { data: updatedConversation, error: updateError } = await supabaseAdmin
          .from('chat_conversations')
          .update(updateData)
          .eq('id', transferRequest.conversation_id)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        // Atualizar status da solicitação
        try {
          await supabaseAdmin
            .from('chat_transfer_requests')
            .update({
              status: 'accepted',
              responded_at: new Date().toISOString(),
              response_message: message
            })
            .eq('id', transfer_request_id)
        } catch (updateRequestError) {
          console.log('Erro ao atualizar solicitação:', updateRequestError)
          // Atualizar no sistema local se necessário
          if (global.transferRequests && global.transferRequests.has(transfer_request_id)) {
            const localRequest = global.transferRequests.get(transfer_request_id)
            localRequest.status = 'accepted'
            localRequest.responded_at = new Date().toISOString()
            localRequest.response_message = message
          }
        }

        // Adicionar mensagem informando sobre a aceitação
        const acceptMessage = {
          conversation_id: transferRequest.conversation_id,
          content: `✅ **Transferência Aceita**\n\n**${acceptorName || (acceptorType === 'student' ? 'Estudante' : 'Coordenador')}** aceitou assumir este atendimento.\n\n${message ? `**Mensagem:** ${message}\n\n` : ''}Olá! Agora sou eu quem vai ajudá-lo. Como posso ajudar?`,
          sender_type: acceptorType,
          sender_id: acceptorId,
          sender_name: acceptorName || (acceptorType === 'student' ? 'Estudante' : 'Coordenador'),
          is_ai_response: false,
          is_read: false,
          created_at: new Date().toISOString()
        }

        try {
          await supabaseAdmin
            .from('chat_messages')
            .insert(acceptMessage)
        } catch (msgError) {
          console.log('Erro ao inserir mensagem de aceitação:', msgError)
        }

        // Atualizar log de transferência
        try {
          let logQuery = supabaseAdmin
            .from('chat_transfer_logs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('conversation_id', transferRequest.conversation_id)
            .eq('status', 'pending')

          if (acceptorType === 'student') {
            logQuery = logQuery.eq('to_student_id', acceptorId)
          } else {
            logQuery = logQuery.eq('to_coordinator_id', acceptorId)
          }

          await logQuery
        } catch (logError) {
          console.log('Erro ao atualizar log:', logError)
        }

        return NextResponse.json({
          success: true,
          conversation: updatedConversation,
          message: 'Transferência aceita com sucesso'
        })

      } catch (supabaseError) {
        console.log('Erro do Supabase, simulando aceitação:', supabaseError)

        // Fallback: simular aceitação
        if (global.transferRequests && global.transferRequests.has(transfer_request_id)) {
          const localRequest = global.transferRequests.get(transfer_request_id)
          localRequest.status = 'accepted'
          localRequest.responded_at = new Date().toISOString()
          localRequest.response_message = message
        }

        const mockConversation = {
          id: transferRequest.conversation_id,
          coordinator_id: student_id,
          chat_accepted_by: student_id,
          chat_accepted_at: new Date().toISOString(),
          status: 'active_student',
          transferred_to_student: true
        }

        return NextResponse.json({
          success: true,
          conversation: mockConversation,
          message: 'Transferência aceita com sucesso (modo simulado)'
        })
      }

    } else if (action === 'reject') {
      try {
        // Atualizar status da solicitação
        await supabaseAdmin
          .from('chat_transfer_requests')
          .update({
            status: 'rejected',
            responded_at: new Date().toISOString(),
            response_message: message
          })
          .eq('id', transfer_request_id)

      } catch (supabaseError) {
        console.log('Erro do Supabase ao rejeitar:', supabaseError)
        // Atualizar no sistema local
        if (global.transferRequests && global.transferRequests.has(transfer_request_id)) {
          const localRequest = global.transferRequests.get(transfer_request_id)
          localRequest.status = 'rejected'
          localRequest.responded_at = new Date().toISOString()
          localRequest.response_message = message
        }
      }

      // Adicionar mensagem informando sobre a rejeição
      const rejectMessage = {
        conversation_id: transferRequest.conversation_id,
        content: `❌ **Transferência Recusada**\n\n**${acceptorName || (acceptorType === 'student' ? 'Estudante' : 'Coordenador')}** não pode assumir este atendimento no momento.\n\n${message ? `**Motivo:** ${message}\n\n` : ''}O atendimento continua com o coordenador responsável.`,
        sender_type: 'system',
        sender_id: 'system',
        sender_name: 'Sistema NAF',
        is_ai_response: false,
        is_read: true,
        created_at: new Date().toISOString()
      }

      try {
        await supabaseAdmin
          .from('chat_messages')
          .insert(rejectMessage)
      } catch (msgError) {
        console.log('Erro ao inserir mensagem de rejeição:', msgError)
      }

      // Atualizar log de transferência
      try {
        let logQuery = supabaseAdmin
          .from('chat_transfer_logs')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString()
          })
          .eq('conversation_id', transferRequest.conversation_id)
          .eq('status', 'pending')

        if (acceptorType === 'student') {
          logQuery = logQuery.eq('to_student_id', acceptorId)
        } else {
          logQuery = logQuery.eq('to_coordinator_id', acceptorId)
        }

        await logQuery
      } catch (logError) {
        console.log('Erro ao atualizar log:', logError)
      }

      return NextResponse.json({
        success: true,
        message: 'Transferência recusada'
      })
    }

  } catch (error) {
    console.error('Erro ao processar resposta de transferência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}