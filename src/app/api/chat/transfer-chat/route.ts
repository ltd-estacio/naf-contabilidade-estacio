import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Criar solicitação de transferência para outro coordenador
export async function POST(request: NextRequest) {
  try {
    const {
      conversation_id,
      from_coordinator_id,
      to_coordinator_id,
      from_coordinator_name,
      to_coordinator_name,
      reason
    } = await request.json()

    if (!conversation_id || !from_coordinator_id || !to_coordinator_id) {
      return NextResponse.json(
        { error: 'conversation_id, from_coordinator_id e to_coordinator_id são obrigatórios' },
        { status: 400 }
      )
    }

    if (from_coordinator_id === to_coordinator_id) {
      return NextResponse.json(
        { error: 'Não é possível transferir para o mesmo coordenador' },
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

      // Criar solicitação de transferência para o coordenador
      const transferRequest = {
        id: `transfer-coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id,
        from_coordinator_id,
        from_coordinator_name: from_coordinator_name || 'Coordenador',
        to_coordinator_id,
        to_coordinator_name: to_coordinator_name || 'Coordenador',
        transfer_type: 'to_coordinator',
        reason: reason || 'Transferência de atendimento',
        message: `Olá! O coordenador ${from_coordinator_name || 'responsável'} gostaria de transferir este atendimento para você. Você aceita assumir este chat?`,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Expira em 30 minutos
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
        content: `🔄 **Solicitação de Transferência Enviada**\n\n**Para:** ${to_coordinator_name || 'Coordenador'}\n**Motivo:** ${reason || 'Transferência de atendimento'}\n\n⏳ Aguardando resposta do coordenador...`,
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
            to_coordinator_id,
            request_type: 'to_coordinator',
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
        message: 'Solicitação de transferência enviada ao coordenador'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema mock:', supabaseError)

      // Fallback: simular transferência
      const mockTransferRequest = {
        id: `transfer-coord-${Date.now()}-mock`,
        conversation_id,
        from_coordinator_id,
        from_coordinator_name: from_coordinator_name || 'Coordenador',
        to_coordinator_id,
        to_coordinator_name: to_coordinator_name || 'Coordenador',
        transfer_type: 'to_coordinator',
        reason: reason || 'Transferência de atendimento',
        message: `Olá! O coordenador ${from_coordinator_name || 'responsável'} gostaria de transferir este atendimento para você. Você aceita assumir este chat?`,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      // Armazenar localmente
      if (!global.transferRequests) {
        global.transferRequests = new Map()
      }
      global.transferRequests.set(mockTransferRequest.id, mockTransferRequest)

      return NextResponse.json({
        success: true,
        transfer_request: mockTransferRequest,
        message: 'Solicitação de transferência enviada ao coordenador (modo simulado)'
      })
    }

  } catch (error) {
    console.error('Erro ao solicitar transferência para coordenador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar coordenadores disponíveis OU buscar solicitações de transferência
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentCoordinatorId = searchParams.get('exclude_id')
    const coordinatorId = searchParams.get('coordinator_id')

    // Se coordinator_id estiver presente, buscar solicitações de transferência
    if (coordinatorId) {
      try {
        // Buscar solicitações pendentes no Supabase
        const { data: requests, error } = await supabaseAdmin
          .from('chat_transfer_requests')
          .select('*')
          .eq('to_coordinator_id', coordinatorId)
          .eq('status', 'pending')
          .eq('transfer_type', 'to_coordinator')
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
            if (request.to_coordinator_id === coordinatorId &&
                request.status === 'pending' &&
                request.transfer_type === 'to_coordinator' &&
                new Date(request.expires_at) > new Date()) {
              localRequests.push(request)
            }
          }
        }

        return NextResponse.json({
          transfer_requests: localRequests
        })
      }
    }

    // Caso contrário, listar coordenadores disponíveis
    try {
      // Buscar coordenadores ativos
      let query = supabaseAdmin
        .from('coordinator_users')
        .select('id, email, is_active, created_at')
        .eq('is_active', true)

      if (currentCoordinatorId) {
        query = query.neq('id', currentCoordinatorId)
      }

      const { data: coordinators, error } = await query

      if (error) {
        throw error
      }

      // Mapear para formato mais amigável
      const coordinatorList = coordinators?.map(coord => ({
        id: coord.id,
        name: coord.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: coord.email,
        specialties: getCoordinatorSpecialties(coord.email),
        is_online: Math.random() > 0.3, // Simular status online
        status: 'active'
      })) || []

      return NextResponse.json({
        coordinators: coordinatorList
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando coordenadores mock:', supabaseError)

      // Fallback: coordenadores mock
      const mockCoordinators = [
        {
          id: '5f3fa043-f3f6-4322-a1e4-874677cdee58',
          name: 'Dr. Carlos Silva',
          email: 'admin@naf.com',
          specialties: ['Imposto de Renda', 'Tributário'],
          is_online: true,
          status: 'active'
        },
        {
          id: '6774c415-d927-47af-af90-dd30e41d9783',
          name: 'Coordenador Principal',
          email: 'coordenador.estacio.ltd2025@developer.com.br',
          specialties: ['MEI', 'Empresarial'],
          is_online: true,
          status: 'active'
        }
      ].filter(coord => coord.id !== currentCoordinatorId)

      return NextResponse.json({
        coordinators: mockCoordinators
      })
    }

  } catch (error) {
    console.error('Erro ao buscar coordenadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para determinar especialidades baseadas no email
function getCoordinatorSpecialties(email: string): string[] {
  if (email.includes('admin')) {
    return ['Imposto de Renda', 'Tributário', 'Gestão']
  } else if (email.includes('ana')) {
    return ['MEI', 'Empresarial', 'e-Social']
  } else if (email.includes('roberto')) {
    return ['ITR', 'Rural', 'Contabilidade']
  } else {
    return ['Consultoria Geral', 'Atendimento']
  }
}