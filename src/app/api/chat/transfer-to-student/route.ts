import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Transferir chat para estudante
export async function POST(request: NextRequest) {
  try {
    const {
      conversation_id,
      from_coordinator_id,
      to_student_id,
      from_coordinator_name,
      to_student_name,
      reason,
      message
    } = await request.json()

    if (!conversation_id || !from_coordinator_id || !to_student_id) {
      return NextResponse.json(
        { error: 'conversation_id, from_coordinator_id e to_student_id são obrigatórios' },
        { status: 400 }
      )
    }

    try {
      // Verificar se a conversa existe e pertence ao coordenador atual
      const { data: conversation, error: checkError } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .eq('id', conversation_id)
        .eq('coordinator_id', from_coordinator_id)
        .eq('status', 'active_human')
        .single()

      if (checkError || !conversation) {
        return NextResponse.json(
          { error: 'Conversa não encontrada ou você não tem permissão para transferi-la' },
          { status: 404 }
        )
      }

      // Criar solicitação de transferência para o estudante
      const transferRequest = {
        id: `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id,
        from_coordinator_id,
        from_coordinator_name: from_coordinator_name || 'Coordenador',
        to_student_id,
        to_student_name: to_student_name || 'Estudante',
        reason: reason || 'Transferência de atendimento',
        message: message || `Olá! O coordenador ${from_coordinator_name || 'responsável'} gostaria de transferir este atendimento para você. Você aceita assumir este chat?`,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // Expira em 10 minutos
      }

      try {
        // Tentar inserir no Supabase
        const { error: insertError } = await supabaseAdmin
          .from('chat_transfer_requests')
          .insert(transferRequest)

        if (insertError) {
          throw insertError
        }
      } catch (supabaseError) {
        console.log('Erro do Supabase, usando sistema de armazenamento local:', supabaseError)

        // Fallback: armazenar localmente no processo
        if (!global.transferRequests) {
          global.transferRequests = new Map()
        }
        global.transferRequests.set(transferRequest.id, transferRequest)
      }

      // Adicionar mensagem informando sobre a solicitação de transferência
      const notificationMessage = {
        conversation_id,
        content: `🔄 **Solicitação de Transferência Enviada**\n\n**Para:** ${to_student_name || 'Estudante'}\n**Motivo:** ${reason || 'Transferência de atendimento'}\n\n⏳ Aguardando resposta do estudante...`,
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
          .insert(notificationMessage)
      } catch (msgError) {
        console.log('Erro ao inserir mensagem de notificação:', msgError)
      }

      // Adicionar log da solicitação de transferência
      try {
        await supabaseAdmin
          .from('chat_transfer_logs')
          .insert({
            conversation_id,
            from_coordinator_id,
            to_student_id,
            request_type: 'to_student',
            reason,
            requested_at: new Date().toISOString(),
            status: 'pending'
          })
      } catch (logError) {
        console.log('Erro ao registrar log de transferência:', logError)
      }

      return NextResponse.json({
        success: true,
        transfer_request: transferRequest,
        message: 'Solicitação de transferência enviada ao estudante'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema mock:', supabaseError)

      // Fallback: simular transferência
      const mockTransferRequest = {
        id: `transfer-${Date.now()}-mock`,
        conversation_id,
        from_coordinator_id,
        from_coordinator_name: from_coordinator_name || 'Coordenador',
        to_student_id,
        to_student_name: to_student_name || 'Estudante',
        reason: reason || 'Transferência de atendimento',
        message: message || `Olá! O coordenador ${from_coordinator_name || 'responsável'} gostaria de transferir este atendimento para você. Você aceita assumir este chat?`,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      }

      // Armazenar localmente
      if (!global.transferRequests) {
        global.transferRequests = new Map()
      }
      global.transferRequests.set(mockTransferRequest.id, mockTransferRequest)

      return NextResponse.json({
        success: true,
        transfer_request: mockTransferRequest,
        message: 'Solicitação de transferência enviada ao estudante (modo simulado)'
      })
    }

  } catch (error) {
    console.error('Erro ao solicitar transferência para estudante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar solicitações de transferência para um estudante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json(
        { error: 'student_id é obrigatório' },
        { status: 400 }
      )
    }

    try {
      // Buscar solicitações pendentes no Supabase
      const { data: requests, error } = await supabaseAdmin
        .from('chat_transfer_requests')
        .select('*')
        .eq('to_student_id', studentId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        transfer_requests: requests || []
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: buscar no sistema local
      const localRequests = []
      if (global.transferRequests) {
        for (const [id, request] of global.transferRequests) {
          if (request.to_student_id === studentId &&
              request.status === 'pending' &&
              new Date(request.expires_at) > new Date()) {
            localRequests.push(request)
          }
        }
      }

      return NextResponse.json({
        transfer_requests: localRequests
      })
    }

  } catch (error) {
    console.error('Erro ao buscar solicitações de transferência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}