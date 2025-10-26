import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET - Dados gerais para Business Intelligence
 * Busca informações de estudantes, serviços e atendimentos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // dias

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Buscar total de estudantes
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, status, created_at, course, semester')

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError)
    }

    // Buscar total de serviços
    const { data: services, error: servicesError } = await supabase
      .from('naf_services')
      .select('id, name, category, status, requests_count, satisfaction_rating')

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError)
    }

    // Buscar atendimentos fiscais
    const { data: appointments, error: appointmentsError } = await supabase
      .from('fiscal_appointments')
      .select('id, status, urgency_level, created_at, completed_at, service_category')
      .gte('created_at', startDate.toISOString())

    if (appointmentsError) {
      console.error('Erro ao buscar atendimentos:', appointmentsError)
    }

    // Buscar usuários do chat
    const { data: chatUsers, error: chatUsersError } = await supabase
      .from('chat_users')
      .select('id, status, created_at')

    if (chatUsersError) {
      console.error('Erro ao buscar usuários chat:', chatUsersError)
    }

    // Calcular métricas de estudantes
    const totalStudents = students?.length || 0
    const activeStudents = students?.filter(s => s.status === 'ATIVO').length || 0
    const newStudentsInPeriod = students?.filter(s =>
      new Date(s.created_at) >= startDate
    ).length || 0

    // Agrupar estudantes por curso
    const studentsByCourse: Record<string, number> = {}
    students?.forEach(student => {
      const course = student.course || 'Não especificado'
      studentsByCourse[course] = (studentsByCourse[course] || 0) + 1
    })

    // Agrupar estudantes por semestre
    const studentsBySemester: Record<string, number> = {}
    students?.forEach(student => {
      const semester = student.semester || 'Não especificado'
      studentsBySemester[semester] = (studentsBySemester[semester] || 0) + 1
    })

    // Calcular métricas de serviços
    const totalServices = services?.length || 0
    const activeServices = services?.filter(s => s.status === 'ativo').length || 0
    const totalRequests = services?.reduce((sum, s) => sum + (s.requests_count || 0), 0) || 0
    const avgSatisfaction = services?.length
      ? services.reduce((sum, s) => sum + (parseFloat(s.satisfaction_rating) || 0), 0) / services.length
      : 0

    // Agrupar serviços por categoria
    const servicesByCategory: Record<string, number> = {}
    services?.forEach(service => {
      const category = service.category || 'Outros'
      servicesByCategory[category] = (servicesByCategory[category] || 0) + 1
    })

    // Calcular métricas de atendimentos
    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter(a => a.status === 'CONCLUIDO').length || 0
    const pendingAppointments = appointments?.filter(a => a.status === 'PENDENTE').length || 0
    const inProgressAppointments = appointments?.filter(a => a.status === 'EM_ANDAMENTO').length || 0

    const completionRate = totalAppointments > 0
      ? (completedAppointments / totalAppointments) * 100
      : 0

    // Agrupar atendimentos por categoria
    const appointmentsByCategory: Record<string, number> = {}
    appointments?.forEach(apt => {
      const category = apt.service_category || 'Outros'
      appointmentsByCategory[category] = (appointmentsByCategory[category] || 0) + 1
    })

    // Agrupar atendimentos por urgência
    const appointmentsByUrgency: Record<string, number> = {}
    appointments?.forEach(apt => {
      const urgency = apt.urgency_level || 'NORMAL'
      appointmentsByUrgency[urgency] = (appointmentsByUrgency[urgency] || 0) + 1
    })

    // Calcular tempo médio de conclusão
    const completedWithTime = appointments?.filter(a =>
      a.status === 'CONCLUIDO' && a.created_at && a.completed_at
    ) || []

    let avgCompletionTime = 0
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce((sum, apt) => {
        const created = new Date(apt.created_at).getTime()
        const completed = new Date(apt.completed_at!).getTime()
        return sum + (completed - created)
      }, 0)
      avgCompletionTime = totalTime / completedWithTime.length / (1000 * 60 * 60) // em horas
    }

    // Métricas de chat
    const totalChatUsers = chatUsers?.length || 0
    const activeChatUsers = chatUsers?.filter(u => u.status === 'active').length || 0
    const newChatUsersInPeriod = chatUsers?.filter(u =>
      new Date(u.created_at) >= startDate
    ).length || 0

    // Dados para gráficos temporais
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    const appointmentsByDay = last30Days.map(date => {
      const count = appointments?.filter(a =>
        a.created_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    const studentsByDay = last30Days.map(date => {
      const count = students?.filter(s =>
        s.created_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    return NextResponse.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        newInPeriod: newStudentsInPeriod,
        byCourse: studentsByCourse,
        bySemester: studentsBySemester,
        growthRate: totalStudents > 0 ? (newStudentsInPeriod / totalStudents) * 100 : 0
      },
      services: {
        total: totalServices,
        active: activeServices,
        totalRequests,
        avgSatisfaction: parseFloat(avgSatisfaction.toFixed(2)),
        byCategory: servicesByCategory
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
        inProgress: inProgressAppointments,
        completionRate: parseFloat(completionRate.toFixed(2)),
        avgCompletionTimeHours: parseFloat(avgCompletionTime.toFixed(2)),
        byCategory: appointmentsByCategory,
        byUrgency: appointmentsByUrgency,
        byDay: appointmentsByDay
      },
      chat: {
        totalUsers: totalChatUsers,
        activeUsers: activeChatUsers,
        newUsersInPeriod: newChatUsersInPeriod
      },
      timeline: {
        appointments: appointmentsByDay,
        students: studentsByDay
      },
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados gerais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
