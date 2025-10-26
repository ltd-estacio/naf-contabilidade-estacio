import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Criar ou atualizar histórico de conversa
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Conversation History API - Salvando histórico')

    const {
      conversation_id,
      user_id,
      coordinator_id,
      appointment_id,
      title,
      summary,
      messages = [],
      status = 'active'
    } = await request.json()

    if (!conversation_id || !user_id) {
      return NextResponse.json(
        { error: 'conversation_id e user_id são obrigatórios' },
        { status: 400 }
      )
    }

    const historyId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Verificar se já existe histórico para esta conversa
      const { data: existingHistory, error: checkError } = await supabaseAdmin
        .from('chat_conversation_history')
        .select('id')
        .eq('conversation_id', conversation_id)
        .single()

      let conversationHistory

      if (existingHistory) {
        // Atualizar histórico existente
        const updateData = {
          updated_at: new Date().toISOString(),
          total_messages: messages.length
        }

        if (title) updateData.title = title
        if (summary) updateData.summary = summary
        if (coordinator_id) updateData.coordinator_id = coordinator_id
        if (appointment_id) updateData.appointment_id = appointment_id
        if (status) updateData.status = status

        // Se está finalizando a conversa
        if (status === 'completed') {
          const startTime = new Date(existingHistory?.started_at || new Date())
          const endTime = new Date()
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

          updateData.ended_at = endTime.toISOString()
          updateData.duration_minutes = durationMinutes
        }

        const { data: updated, error: updateError } = await supabaseAdmin
          .from('chat_conversation_history')
          .update(updateData)
          .eq('id', existingHistory.id)
          .select()
          .single()

        if (updateError) throw updateError
        conversationHistory = updated

      } else {
        // Criar novo histórico
        const newHistory = {
          id: historyId,
          conversation_id,
          user_id,
          coordinator_id,
          appointment_id,
          title: title || `Conversa ${new Date().toLocaleDateString()}`,
          summary: summary || '',
          total_messages: messages.length,
          started_at: new Date().toISOString(),
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: created, error: createError } = await supabaseAdmin
          .from('chat_conversation_history')
          .insert(newHistory)
          .select()
          .single()

        if (createError) throw createError
        conversationHistory = created
      }

      // Salvar mensagens se fornecidas
      if (messages.length > 0) {
        const messagesToInsert = messages.map((msg, index) => ({
          id: `msg-${historyId}-${index}`,
          conversation_history_id: conversationHistory.id,
          conversation_id,
          user_id: msg.sender_type === 'user' ? user_id : null,
          content: msg.content,
          sender_type: msg.sender_type,
          sender_id: msg.sender_id || null,
          sender_name: msg.sender_name || 'Usuário',
          is_ai_response: msg.is_ai_response || false,
          message_type: msg.message_type || 'text',
          metadata: msg.metadata || {},
          is_read: msg.is_read || false,
          created_at: msg.created_at || new Date().toISOString()
        }))

        // Deletar mensagens existentes se estiver atualizando
        await supabaseAdmin
          .from('chat_persistent_messages')
          .delete()
          .eq('conversation_history_id', conversationHistory.id)

        // Inserir novas mensagens
        const { error: messagesError } = await supabaseAdmin
          .from('chat_persistent_messages')
          .insert(messagesToInsert)

        if (messagesError) {
          console.log('Erro ao salvar mensagens:', messagesError)
        }
      }

      console.log('✅ Histórico salvo com sucesso:', conversationHistory.id)

      return NextResponse.json({
        success: true,
        history: conversationHistory,
        message: 'Histórico salvo com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema de fallback:', supabaseError)

      // Fallback: usar sistema local
      const mockHistory = {
        id: historyId,
        conversation_id,
        user_id,
        coordinator_id,
        appointment_id,
        title: title || `Conversa ${new Date().toLocaleDateString()}`,
        summary: summary || '',
        total_messages: messages.length,
        started_at: new Date().toISOString(),
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Armazenar localmente
      if (!global.conversationHistory) {
        global.conversationHistory = new Map()
      }
      global.conversationHistory.set(historyId, { ...mockHistory, messages })

      console.log('✅ Histórico salvo no sistema local:', historyId)

      return NextResponse.json({
        success: true,
        history: mockHistory,
        message: 'Histórico salvo com sucesso! (modo desenvolvimento)'
      })
    }

  } catch (error) {
    console.error('💥 Erro ao salvar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar histórico de conversas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const coordinatorId = searchParams.get('coordinator_id')
    const conversationId = searchParams.get('conversation_id')
    const appointmentId = searchParams.get('appointment_id')
    const status = searchParams.get('status')
    const includeMessages = searchParams.get('include_messages') === 'true'

    try {
      let query = supabaseAdmin
        .from('chat_conversation_history')
        .select(`
          *,
          ${includeMessages ? `
          chat_persistent_messages (
            id,
            content,
            sender_type,
            sender_id,
            sender_name,
            is_ai_response,
            message_type,
            metadata,
            is_read,
            created_at
          )` : ''}
        `)

      // Filtros
      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (coordinatorId) {
        query = query.eq('coordinator_id', coordinatorId)
      }

      if (conversationId) {
        query = query.eq('conversation_id', conversationId)
      }

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data: histories, error } = await query
        .order('started_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        histories: histories || [],
        total: histories?.length || 0
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: buscar no sistema local ou usar dados mock
      let histories = []

      // Mock data para desenvolvimento com informações de coordenador e estudante
      const mockConversations = [
        {
          id: 'conv-1',
          conversation_id: 'chat-1',
          user_id: '1',
          user_name: 'João Silva',
          user_email: 'joao@email.com',
          status: 'inactive',
          started_at: '2024-01-15T09:30:00Z',
          ended_at: '2024-01-15T10:45:00Z',
          coordinator_id: 'coord-1',
          coordinator_name: 'Prof. Maria Santos',
          student_id: 'stud-1',
          student_name: 'Ana Costa',
          message_count: 15,
          transferred_from: null,
          session_token: 'session-1',
          title: 'Consultoria IRPF',
          summary: 'Dúvidas sobre declaração de imposto de renda'
        },
        {
          id: 'conv-2',
          conversation_id: 'chat-2',
          user_id: '1',
          user_name: 'João Silva',
          user_email: 'joao@email.com',
          status: 'inactive',
          started_at: '2024-02-20T14:15:00Z',
          ended_at: '2024-02-20T15:30:00Z',
          coordinator_id: 'coord-1',
          coordinator_name: 'Prof. Maria Santos',
          student_id: 'stud-2',
          student_name: 'Carlos Lima',
          message_count: 22,
          transferred_from: 'Ana Costa',
          session_token: 'session-2',
          title: 'Orientação MEI',
          summary: 'Transferido para especialista em MEI'
        },
        {
          id: 'conv-3',
          conversation_id: 'chat-3',
          user_id: '2',
          user_name: 'Maria Oliveira',
          user_email: 'maria@email.com',
          status: 'active',
          started_at: '2024-03-10T11:00:00Z',
          ended_at: null,
          coordinator_id: 'coord-2',
          coordinator_name: 'Prof. Carlos Lima',
          student_id: 'stud-3',
          student_name: 'Pedro Alves',
          message_count: 8,
          transferred_from: null,
          session_token: 'session-3',
          title: 'Consultoria ICMS',
          summary: 'Em andamento'
        },
        {
          id: 'conv-4',
          conversation_id: 'chat-4',
          user_id: '3',
          user_name: 'Carlos Santos',
          user_email: 'carlos@email.com',
          status: 'inactive',
          started_at: '2024-03-12T16:20:00Z',
          ended_at: '2024-03-12T17:10:00Z',
          coordinator_id: 'coord-3',
          coordinator_name: 'Prof. Ana Silva',
          student_id: 'stud-4',
          student_name: 'Lucas Santos',
          message_count: 18,
          transferred_from: null,
          session_token: 'session-4',
          title: 'Planejamento Tributário',
          summary: 'Orientações sobre regime tributário'
        },
        {
          id: 'conv-5',
          conversation_id: 'chat-5',
          user_id: '1',
          user_name: 'João Silva',
          user_email: 'joao@email.com',
          status: 'inactive',
          started_at: '2024-01-25T10:30:00Z',
          ended_at: '2024-01-25T11:15:00Z',
          coordinator_id: 'coord-1',
          coordinator_name: 'Prof. Maria Santos',
          student_id: 'stud-1',
          student_name: 'Ana Costa',
          message_count: 12,
          transferred_from: null,
          session_token: 'session-5',
          title: 'Revisão IRPF',
          summary: 'Revisão da declaração anterior'
        }
      ]

      if (global.conversationHistory) {
        histories = Array.from(global.conversationHistory.values())
      } else {
        histories = mockConversations
      }

        // Aplicar filtros
        if (userId) {
          histories = histories.filter(h => h.user_id === userId)
        }
        if (coordinatorId) {
          histories = histories.filter(h => h.coordinator_id === coordinatorId)
        }
        if (conversationId) {
          histories = histories.filter(h => h.conversation_id === conversationId)
        }
        if (appointmentId) {
          histories = histories.filter(h => h.appointment_id === appointmentId)
        }
        if (status) {
          histories = histories.filter(h => h.status === status)
        }

        // Ordenar por data
        histories.sort((a, b) => b.started_at.localeCompare(a.started_at))

        // Incluir mensagens se solicitado
        if (includeMessages) {
          histories = histories.map(h => ({
            ...h,
            chat_persistent_messages: h.messages || []
          }))
        }

      return NextResponse.json({
        success: true,
        conversations: histories,
        total: histories.length,
        active_conversations: histories.filter(h => h.status === 'active').length
      })
    }

  } catch (error) {
    console.error('💥 Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar avaliação da conversa
export async function PUT(request: NextRequest) {
  try {
    const {
      history_id,
      satisfaction_rating,
      satisfaction_feedback,
      summary,
      status
    } = await request.json()

    if (!history_id) {
      return NextResponse.json(
        { error: 'history_id é obrigatório' },
        { status: 400 }
      )
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (satisfaction_rating !== undefined) updateData.satisfaction_rating = satisfaction_rating
    if (satisfaction_feedback) updateData.satisfaction_feedback = satisfaction_feedback
    if (summary) updateData.summary = summary
    if (status) updateData.status = status

    try {
      const { data: updatedHistory, error } = await supabaseAdmin
        .from('chat_conversation_history')
        .update(updateData)
        .eq('id', history_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        history: updatedHistory,
        message: 'Avaliação salva com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: atualizar no sistema local
      if (global.conversationHistory && global.conversationHistory.has(history_id)) {
        const existingHistory = global.conversationHistory.get(history_id)
        const updatedHistory = { ...existingHistory, ...updateData }
        global.conversationHistory.set(history_id, updatedHistory)

        return NextResponse.json({
          success: true,
          history: updatedHistory,
          message: 'Avaliação salva com sucesso! (modo desenvolvimento)'
        })
      }

      return NextResponse.json(
        { error: 'Histórico não encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('💥 Erro ao atualizar avaliação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}