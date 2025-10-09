import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      session_id,
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

    // Mock data para desenvolvimento - em produção, salvar no banco de dados
    const transferId = `transfer-${Date.now()}`

    const transferData = {
      id: transferId,
      session_id,
      from_user_id,
      from_user_type: from_user_type || 'student',
      from_user_name: from_user_name || 'Atendente Anterior',
      to_user_id,
      to_user_type: to_user_type || 'coordinator',
      to_user_name: to_user_name || 'Novo Atendente',
      transfer_reason: transfer_reason || 'Solicitação de especialista',
      transfer_notes: transfer_notes || '',
      status: 'pending',
      transferred_at: new Date().toISOString(),
      accepted_at: null,
      completed_at: null,
      created_at: new Date().toISOString()
    }

    // Simular persistência (em produção seria salvo no banco)
    if (!global.chatTransfers) {
      global.chatTransfers = new Map()
    }
    global.chatTransfers.set(transferId, transferData)

    // Atualizar sessão do chat
    if (!global.chatSessions) {
      global.chatSessions = new Map()
    }

    const currentSession = global.chatSessions.get(session_id) || {
      id: session_id,
      status: 'active',
      user_id: from_user_id,
      assigned_coordinator_id: null,
      assigned_student_id: null,
      transferred_from_user_id: null,
      transferred_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Atualizar com informações da transferência
    const updatedSession = {
      ...currentSession,
      status: 'transferred',
      transferred_from_user_id: from_user_id,
      transferred_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (to_user_type === 'coordinator') {
      updatedSession.assigned_coordinator_id = to_user_id
    } else if (to_user_type === 'student') {
      updatedSession.assigned_student_id = to_user_id
    }

    global.chatSessions.set(session_id, updatedSession)

    return NextResponse.json({
      success: true,
      transfer: transferData,
      session: updatedSession,
      message: `Atendimento transferido de ${from_user_name} para ${to_user_name}`
    })

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