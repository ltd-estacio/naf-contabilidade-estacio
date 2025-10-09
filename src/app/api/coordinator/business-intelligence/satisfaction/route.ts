import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET - Dados de satisfação para Business Intelligence
 * Análise completa de chat, feedbacks, usuários e conversas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Buscar usuários do chat
    const { data: chatUsers, error: usersError } = await supabase
      .from('chat_users')
      .select('*')

    if (usersError) {
      console.error('Erro ao buscar usuários do chat:', usersError)
    }

    // Buscar agendamentos do chat
    const { data: chatAppointments, error: appointmentsError } = await supabase
      .from('chat_appointments')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError)
    }

    // Buscar histórico de conversas
    const { data: conversations, error: conversationsError } = await supabase
      .from('chat_conversation_history')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (conversationsError) {
      console.error('Erro ao buscar conversas:', conversationsError)
    }

    // Buscar mensagens
    const { data: messages, error: messagesError } = await supabase
      .from('chat_persistent_messages')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError)
    }

    // === MÉTRICAS DE USUÁRIOS ===

    const totalUsers = chatUsers?.length || 0
    const activeUsers = chatUsers?.filter(u => u.status === 'active').length || 0
    const newUsersInPeriod = chatUsers?.filter(u =>
      new Date(u.created_at) >= startDate
    ).length || 0

    // Usuários por cidade
    const usersByCity: Record<string, number> = {}
    chatUsers?.forEach(user => {
      const city = user.city || 'Não informado'
      usersByCity[city] = (usersByCity[city] || 0) + 1
    })

    // Usuários por estado
    const usersByState: Record<string, number> = {}
    chatUsers?.forEach(user => {
      const state = user.state || 'Não informado'
      usersByState[state] = (usersByState[state] || 0) + 1
    })

    // Usuários por ocupação
    const usersByOccupation: Record<string, number> = {}
    chatUsers?.forEach(user => {
      const occupation = user.occupation || 'Não informado'
      usersByOccupation[occupation] = (usersByOccupation[occupation] || 0) + 1
    })

    // Usuários por faixa de renda
    const usersByIncome: Record<string, number> = {}
    chatUsers?.forEach(user => {
      const income = user.income_range || 'Não informado'
      usersByIncome[income] = (usersByIncome[income] || 0) + 1
    })

    // Cadastros ao longo do tempo
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    const usersByDay = last30Days.map(date => {
      const count = chatUsers?.filter(u =>
        u.created_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    // === MÉTRICAS DE AGENDAMENTOS ===

    const totalAppointments = chatAppointments?.length || 0
    const scheduledAppointments = chatAppointments?.filter(a => a.status === 'scheduled').length || 0
    const completedAppointments = chatAppointments?.filter(a => a.status === 'completed').length || 0
    const cancelledAppointments = chatAppointments?.filter(a => a.status === 'cancelled').length || 0
    const noShowAppointments = chatAppointments?.filter(a => a.status === 'no_show').length || 0

    // Taxa de comparecimento
    const attendanceRate = totalAppointments > 0
      ? ((completedAppointments / (completedAppointments + noShowAppointments + cancelledAppointments)) * 100) || 0
      : 0

    // Agendamentos por tipo de serviço
    const appointmentsByService: Record<string, number> = {}
    chatAppointments?.forEach(apt => {
      const service = apt.service_type || 'Não especificado'
      appointmentsByService[service] = (appointmentsByService[service] || 0) + 1
    })

    // Agendamentos por prioridade
    const appointmentsByPriority: Record<string, number> = {}
    chatAppointments?.forEach(apt => {
      const priority = apt.priority || 'normal'
      appointmentsByPriority[priority] = (appointmentsByPriority[priority] || 0) + 1
    })

    // Agendamentos por dia
    const appointmentsByDay = last30Days.map(date => {
      const count = chatAppointments?.filter(a =>
        a.created_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    // === MÉTRICAS DE CONVERSAS ===

    const totalConversations = conversations?.length || 0
    const activeConversations = conversations?.filter(c => c.status === 'active').length || 0
    const completedConversations = conversations?.filter(c => c.status === 'completed').length || 0

    // Conversas com avaliação
    const conversationsWithRating = conversations?.filter(c => c.satisfaction_rating) || []
    const avgSatisfactionRating = conversationsWithRating.length > 0
      ? conversationsWithRating.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0) / conversationsWithRating.length
      : 0

    // Distribuição de satisfação
    const satisfactionDistribution = {
      rating1: conversationsWithRating.filter(c => c.satisfaction_rating === 1).length,
      rating2: conversationsWithRating.filter(c => c.satisfaction_rating === 2).length,
      rating3: conversationsWithRating.filter(c => c.satisfaction_rating === 3).length,
      rating4: conversationsWithRating.filter(c => c.satisfaction_rating === 4).length,
      rating5: conversationsWithRating.filter(c => c.satisfaction_rating === 5).length
    }

    // Duração média das conversas
    const conversationsWithDuration = conversations?.filter(c => c.duration_minutes) || []
    const avgDuration = conversationsWithDuration.length > 0
      ? conversationsWithDuration.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / conversationsWithDuration.length
      : 0

    // Total de mensagens por conversa
    const avgMessagesPerConversation = conversations && conversations.length > 0
      ? conversations.reduce((sum, c) => sum + (c.total_messages || 0), 0) / conversations.length
      : 0

    // Conversas por dia
    const conversationsByDay = last30Days.map(date => {
      const count = conversations?.filter(c =>
        c.started_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    // Conversas por dia da semana
    const conversationsByWeekday: Record<string, number> = {
      'Domingo': 0,
      'Segunda': 0,
      'Terça': 0,
      'Quarta': 0,
      'Quinta': 0,
      'Sexta': 0,
      'Sábado': 0
    }

    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    conversations?.forEach(conv => {
      const day = new Date(conv.started_at).getDay()
      conversationsByWeekday[weekdays[day]]++
    })

    // Conversas por hora do dia
    const conversationsByHour: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      conversationsByHour[i] = 0
    }

    conversations?.forEach(conv => {
      const hour = new Date(conv.started_at).getHours()
      conversationsByHour[hour]++
    })

    // === MÉTRICAS DE MENSAGENS ===

    const totalMessages = messages?.length || 0
    const userMessages = messages?.filter(m => m.sender_type === 'user').length || 0
    const coordinatorMessages = messages?.filter(m => m.sender_type === 'coordinator').length || 0
    const aiMessages = messages?.filter(m => m.is_ai_response).length || 0

    // Tempo médio de resposta (em minutos)
    let avgResponseTime = 0
    if (conversations && conversations.length > 0) {
      const conversationsWithMessages = conversations.filter(c => c.total_messages && c.total_messages > 1)
      if (conversationsWithMessages.length > 0 && conversationsWithDuration.length > 0) {
        avgResponseTime = conversationsWithDuration.reduce((sum, c) => {
          const messagesCount = c.total_messages || 1
          return sum + ((c.duration_minutes || 0) / messagesCount)
        }, 0) / conversationsWithDuration.length
      }
    }

    // === FEEDBACKS TEXTUAIS ===

    const feedbacksWithText = conversations?.filter(c => c.satisfaction_feedback && c.satisfaction_feedback.trim() !== '') || []
    const recentFeedbacks = feedbacksWithText
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(c => ({
        rating: c.satisfaction_rating,
        feedback: c.satisfaction_feedback,
        date: c.created_at
      }))

    // === ANÁLISE DE SENTIMENTO (SIMPLIFICADA) ===

    const positiveFeedbacks = conversationsWithRating.filter(c => (c.satisfaction_rating || 0) >= 4).length
    const neutralFeedbacks = conversationsWithRating.filter(c => c.satisfaction_rating === 3).length
    const negativeFeedbacks = conversationsWithRating.filter(c => (c.satisfaction_rating || 0) <= 2).length

    const sentimentAnalysis = {
      positive: positiveFeedbacks,
      neutral: neutralFeedbacks,
      negative: negativeFeedbacks,
      positiveRate: conversationsWithRating.length > 0
        ? (positiveFeedbacks / conversationsWithRating.length) * 100
        : 0
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newInPeriod: newUsersInPeriod,
        byCity: usersByCity,
        byState: usersByState,
        byOccupation: usersByOccupation,
        byIncome: usersByIncome,
        timeline: usersByDay,
        growthRate: totalUsers > 0 ? (newUsersInPeriod / totalUsers) * 100 : 0
      },
      appointments: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        byService: appointmentsByService,
        byPriority: appointmentsByPriority,
        timeline: appointmentsByDay
      },
      conversations: {
        total: totalConversations,
        active: activeConversations,
        completed: completedConversations,
        withRating: conversationsWithRating.length,
        avgSatisfaction: parseFloat(avgSatisfactionRating.toFixed(2)),
        satisfactionDistribution,
        avgDuration: parseFloat(avgDuration.toFixed(2)),
        avgMessages: parseFloat(avgMessagesPerConversation.toFixed(2)),
        timeline: conversationsByDay,
        byWeekday: conversationsByWeekday,
        byHour: conversationsByHour
      },
      messages: {
        total: totalMessages,
        byUser: userMessages,
        byCoordinator: coordinatorMessages,
        byAI: aiMessages,
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2))
      },
      feedbacks: {
        recent: recentFeedbacks,
        total: conversationsWithRating.length,
        withText: feedbacksWithText.length
      },
      sentiment: sentimentAnalysis,
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados de satisfação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
