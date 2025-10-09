import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET - Dados de performance para Business Intelligence
 * Análise de performance de serviços e estudantes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Buscar serviços com métricas
    const { data: services, error: servicesError } = await supabase
      .from('naf_services')
      .select('*')

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError)
    }

    // Buscar atendimentos fiscais com estudantes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('fiscal_appointments')
      .select('*, assigned_student_id')
      .gte('created_at', startDate.toISOString())

    if (appointmentsError) {
      console.error('Erro ao buscar atendimentos:', appointmentsError)
    }

    // Buscar feedbacks de atendimentos
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('fiscal_appointment_feedbacks')
      .select(`
        *,
        fiscal_appointments!inner (
          assigned_student_id,
          created_at
        )
      `)

    if (feedbacksError) {
      console.error('Erro ao buscar feedbacks:', feedbacksError)
    }

    // Buscar conversas do chat com avaliações
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_conversation_history')
      .select('satisfaction_rating, coordinator_id, duration_minutes, created_at')
      .gte('created_at', startDate.toISOString())

    if (chatError) {
      console.error('Erro ao buscar histórico de chat:', chatError)
    }

    // === PERFORMANCE DE SERVIÇOS ===

    // Top serviços mais solicitados
    const topServices = services
      ?.sort((a, b) => (b.requests_count || 0) - (a.requests_count || 0))
      .slice(0, 10)
      .map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        requests: s.requests_count || 0,
        rating: parseFloat(s.satisfaction_rating) || 0
      })) || []

    // Serviços por categoria com métricas
    const servicesCategoryPerformance: Record<string, any> = {}
    services?.forEach(service => {
      const category = service.category || 'Outros'
      if (!servicesCategoryPerformance[category]) {
        servicesCategoryPerformance[category] = {
          count: 0,
          totalRequests: 0,
          avgRating: 0,
          totalRating: 0
        }
      }
      servicesCategoryPerformance[category].count++
      servicesCategoryPerformance[category].totalRequests += service.requests_count || 0
      servicesCategoryPerformance[category].totalRating += parseFloat(service.satisfaction_rating) || 0
    })

    // Calcular média de rating por categoria
    Object.keys(servicesCategoryPerformance).forEach(category => {
      const data = servicesCategoryPerformance[category]
      data.avgRating = data.count > 0 ? data.totalRating / data.count : 0
    })

    // === PERFORMANCE DE ESTUDANTES ===

    // Agrupar atendimentos por estudante
    const studentPerformance: Record<string, any> = {}

    appointments?.forEach(apt => {
      const studentId = apt.assigned_student_id
      if (!studentId) return

      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          studentId,
          totalAppointments: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          cancelled: 0,
          ratings: [],
          avgRating: 0,
          completionRate: 0
        }
      }

      studentPerformance[studentId].totalAppointments++

      if (apt.status === 'CONCLUIDO') studentPerformance[studentId].completed++
      else if (apt.status === 'PENDENTE') studentPerformance[studentId].pending++
      else if (apt.status === 'EM_ANDAMENTO') studentPerformance[studentId].inProgress++
      else if (apt.status === 'CANCELADO') studentPerformance[studentId].cancelled++
    })

    // Adicionar feedbacks aos estudantes
    feedbacks?.forEach((feedback: any) => {
      const studentId = feedback.fiscal_appointments?.assigned_student_id
      if (!studentId || !studentPerformance[studentId]) return

      studentPerformance[studentId].ratings.push(feedback.rating)
    })

    // Calcular métricas finais dos estudantes
    Object.values(studentPerformance).forEach((perf: any) => {
      if (perf.ratings.length > 0) {
        perf.avgRating = perf.ratings.reduce((sum: number, r: number) => sum + r, 0) / perf.ratings.length
      }
      perf.completionRate = perf.totalAppointments > 0
        ? (perf.completed / perf.totalAppointments) * 100
        : 0
    })

    // Top 10 estudantes
    const topStudents = Object.values(studentPerformance)
      .sort((a: any, b: any) => b.avgRating - a.avgRating)
      .slice(0, 10)

    // === PERFORMANCE DE CHAT/COORDENADORES ===

    const chatPerformance = {
      totalConversations: chatHistory?.length || 0,
      avgSatisfaction: 0,
      avgDuration: 0,
      satisfactionDistribution: {
        rating1: 0,
        rating2: 0,
        rating3: 0,
        rating4: 0,
        rating5: 0
      }
    }

    if (chatHistory && chatHistory.length > 0) {
      const withRating = chatHistory.filter(c => c.satisfaction_rating)
      const totalRating = withRating.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0)
      chatPerformance.avgSatisfaction = withRating.length > 0 ? totalRating / withRating.length : 0

      const withDuration = chatHistory.filter(c => c.duration_minutes)
      const totalDuration = withDuration.reduce((sum, c) => sum + (c.duration_minutes || 0), 0)
      chatPerformance.avgDuration = withDuration.length > 0 ? totalDuration / withDuration.length : 0

      // Distribuição de satisfação
      withRating.forEach(c => {
        const rating = c.satisfaction_rating || 0
        if (rating === 1) chatPerformance.satisfactionDistribution.rating1++
        else if (rating === 2) chatPerformance.satisfactionDistribution.rating2++
        else if (rating === 3) chatPerformance.satisfactionDistribution.rating3++
        else if (rating === 4) chatPerformance.satisfactionDistribution.rating4++
        else if (rating === 5) chatPerformance.satisfactionDistribution.rating5++
      })
    }

    // === MÉTRICAS GERAIS DE PERFORMANCE ===

    const overallPerformance = {
      totalInteractions: (appointments?.length || 0) + (chatHistory?.length || 0),
      avgAppointmentRating: feedbacks && feedbacks.length > 0
        ? feedbacks.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedbacks.length
        : 0,
      totalFeedbacks: feedbacks?.length || 0,
      serviceUtilization: services && services.length > 0
        ? (services.filter(s => (s.requests_count || 0) > 0).length / services.length) * 100
        : 0
    }

    // Taxa de crescimento
    const currentMonth = new Date().getMonth()
    const currentAppointments = appointments?.filter(a =>
      new Date(a.created_at).getMonth() === currentMonth
    ).length || 0

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthAppointments = appointments?.filter(a =>
      new Date(a.created_at).getMonth() === lastMonth
    ).length || 0

    const growthRate = lastMonthAppointments > 0
      ? ((currentAppointments - lastMonthAppointments) / lastMonthAppointments) * 100
      : 0

    return NextResponse.json({
      services: {
        top: topServices,
        byCategory: servicesCategoryPerformance,
        utilization: overallPerformance.serviceUtilization
      },
      students: {
        performance: studentPerformance,
        top: topStudents,
        totalActive: Object.keys(studentPerformance).length
      },
      chat: chatPerformance,
      overall: {
        ...overallPerformance,
        growthRate: parseFloat(growthRate.toFixed(2))
      },
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados de performance:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
