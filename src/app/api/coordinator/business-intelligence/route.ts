/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck - Supabase MockQuery types conflict with actual implementation
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Definir tipos para os dados
interface Student {
  id: string
  name: string
  email: string
  course: string
  semester?: string
  status: string
  created_at: string
  [key: string]: any
}

interface Attendance {
  id: string
  student_id?: string
  status: string
  service_type: string
  client_satisfaction_rating?: number
  client_feedback?: string
  duration_minutes?: number
  client_category?: string
  client_name?: string
  scheduled_date?: string
  preferred_date?: string
  created_at: string
  completed_at?: string
  [key: string]: any
}

interface FiscalAppointment {
  id: string
  assigned_student_id?: string
  status: string
  service_type: string
  client_category?: string
  scheduled_date?: string
  preferred_date?: string
  created_at: string
  [key: string]: any
}

interface Feedback {
  rating: number
  feedback_text?: string
  created_at: string
  [key: string]: any
}

interface ChatUser {
  id: string
  name?: string
  email?: string
  phone?: string
  city?: string
  occupation?: string
  service_interest?: string
  status?: string
  created_at: string
  [key: string]: any
}

interface ChatConversation {
  id: string
  status?: string
  chat_accepted_at?: string
  created_at: string
  [key: string]: any
}

interface ChatFeedback {
  rating: number
  feedback_text?: string
  created_at: string
  [key: string]: any
}

interface ChatAppointment {
  id: string
  status?: string
  created_at: string
  [key: string]: any
}

interface ChatHistory {
  duration_minutes?: number
  total_messages?: number
  created_at: string
  [key: string]: any
}

interface NAFService {
  id: string
  name: string
  slug: string
  description?: string
  category?: string
  subcategory?: string
  difficulty?: string
  status: string
  views_count?: number
  is_featured?: boolean
  estimated_duration_minutes?: number
  required_documents?: string[]
  priority_order?: number
  created_at: string
  [key: string]: any
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Business Intelligence API - Iniciando coleta de dados')

    // Extrair parâmetros de filtro da URL
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const studentId = searchParams.get('studentId')
    const statusFilters = searchParams.getAll('status')
    const minRating = searchParams.get('minRating')
    const serviceType = searchParams.get('serviceType')
    const course = searchParams.get('course')
    const semester = searchParams.get('semester')
    const hasFeedback = searchParams.get('hasFeedback')

    console.log('🔍 Filtros aplicados:', {
      startDate,
      endDate,
      studentId,
      statusFilters,
      minRating,
      serviceType,
      course,
      semester,
      hasFeedback
    })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // ==================== ESTUDANTES ====================
    let studentsQuery = supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    // Aplicar filtros de estudantes
    if (studentId) {
      studentsQuery = studentsQuery.eq('id', studentId)
    }
    if (course) {
      studentsQuery = studentsQuery.filter('course', 'ilike', `%${course}%`)
    }
    if (semester) {
      studentsQuery = studentsQuery.eq('semester', semester)
    }

    const { data: students, error: studentsError } = await studentsQuery as { data: Student[] | null; error: any }

    if (studentsError) console.error('Erro ao buscar estudantes:', studentsError)

    // Estatísticas detalhadas de cada estudante
    const studentsWithStats = await Promise.all(
      (students || []).map(async (student: Student) => {
        // Buscar atendimentos normais com filtros
        let attendancesQuery = supabase
          .from('attendances')
          .select('*')
          .eq('student_id', student.id)

        if (startDate) {
          attendancesQuery = attendancesQuery.gte('created_at', startDate)
        }
        if (endDate) {
          attendancesQuery = attendancesQuery.lte('created_at', endDate)
        }
        if (statusFilters.length > 0) {
          attendancesQuery = attendancesQuery.in('status', statusFilters)
        }
        if (serviceType) {
          attendancesQuery = attendancesQuery.filter('service_type', 'ilike', `%${serviceType}%`)
        }

        const { data: studentAttendances } = await attendancesQuery as { data: Attendance[] | null }

        // Buscar atendimentos fiscais com filtros
        let fiscalQuery = supabase
          .from('fiscal_appointments')
          .select('*')
          .eq('assigned_student_id', student.id)

        if (startDate) {
          fiscalQuery = fiscalQuery.gte('created_at', startDate)
        }
        if (endDate) {
          fiscalQuery = fiscalQuery.lte('created_at', endDate)
        }
        if (statusFilters.length > 0) {
          fiscalQuery = fiscalQuery.in('status', statusFilters)
        }
        if (serviceType) {
          fiscalQuery = fiscalQuery.filter('service_type', 'ilike', `%${serviceType}%`)
        }

        const { data: fiscalAttendances } = await fiscalQuery as { data: FiscalAppointment[] | null }

        // Buscar feedbacks de atendimentos fiscais
        let feedbackQuery = supabase
          .from('fiscal_appointment_feedbacks')
          .select('rating, fiscal_appointments!inner(assigned_student_id)')
          .eq('fiscal_appointments.assigned_student_id', student.id)

        if (minRating) {
          feedbackQuery = feedbackQuery.gte('rating', parseInt(minRating))
        }

        const { data: fiscalFeedbacks } = await feedbackQuery as { data: Feedback[] | null }

        const { data: chatConversations } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('coordinator_id', student.id)

        // Total de atendimentos (normal + fiscal)
        const totalAttendances = (studentAttendances?.length || 0) + (fiscalAttendances?.length || 0)
        const completedAttendances = (studentAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0) +
                                      (fiscalAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0)

        // Calcular média de avaliação (normal + fiscal)
        const normalRatings = studentAttendances?.filter(a => a.client_satisfaction_rating) || []
        const sumNormal = normalRatings.reduce((sum, a) => sum + a.client_satisfaction_rating, 0)
        const sumFiscal = fiscalFeedbacks?.reduce((sum, f) => sum + (f.rating || 0), 0) || 0
        const totalRatings = normalRatings.length + (fiscalFeedbacks?.length || 0)
        const avgRating = totalRatings > 0 ? (sumNormal + sumFiscal) / totalRatings : 0

        // Calcular produtividade (atendimentos por semana)
        const weeksActive = Math.max(1, Math.ceil((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)))
        const productivity = totalAttendances / weeksActive

        // Serviços mais atendidos (incluindo atendimentos fiscais)
        const serviceCount: Record<string, number> = {}
        studentAttendances?.forEach((att) => {
          serviceCount[att.service_type] = (serviceCount[att.service_type] || 0) + 1
        })
        fiscalAttendances?.forEach((att) => {
          serviceCount[att.service_type] = (serviceCount[att.service_type] || 0) + 1
        })
        const topServices = Object.entries(serviceCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([service]) => service)

        // Calcular horas logadas (normal + fiscal - estimativa 60min por atendimento fiscal)
        const hoursNormal = studentAttendances?.reduce((sum, a) => sum + (a.duration_minutes || 60), 0) || 0
        const hoursFiscal = (fiscalAttendances?.length || 0) * 60 // 60 min por atendimento fiscal
        const totalHours = hoursNormal + hoursFiscal

        return {
          student_id: student.id,
          student_name: student.name,
          email: student.email,
          course: student.course,
          semester: student.semester || 'N/A',
          status: student.status,
          total_attendances: totalAttendances,
          completed_attendances: completedAttendances,
          completion_rate: totalAttendances > 0 ? (completedAttendances / totalAttendances) * 100 : 0,
          avg_rating: Math.round(avgRating * 10) / 10,
          total_chat_conversations: chatConversations?.length || 0,
          productivity_score: Math.round(productivity * 10) / 10,
          specialties: topServices,
          created_at: student.created_at,
          last_activity: studentAttendances?.[0]?.created_at || fiscalAttendances?.[0]?.created_at || student.created_at,
          hours_logged: totalHours
        }
      })
    )

    // ==================== SERVIÇOS NAF ====================
    const { data: nafServices, error: nafServicesError } = await supabase
      .from('naf_services')
      .select('*')
      .order('priority_order', { ascending: true })

    if (nafServicesError) console.error('Erro ao buscar serviços NAF:', nafServicesError)

    // Contar uso de cada serviço
    const servicesWithStats = await Promise.all(
      (nafServices || []).map(async (service) => {
        const { data: attendancesByService } = await supabase
          .from('attendances')
          .select('*')
          .eq('service_type', service.name)

        const { data: fiscalAppointmentsByService } = await supabase
          .from('fiscal_appointments')
          .select('*')
          .eq('service_type', service.name)

        const totalRequests = (attendancesByService?.length || 0) + (fiscalAppointmentsByService?.length || 0)
        const completedCount = (attendancesByService?.filter(a => a.status === 'CONCLUIDO').length || 0) +
                               (fiscalAppointmentsByService?.filter(a => a.status === 'CONCLUIDO').length || 0)

        const avgRating = attendancesByService?.filter(a => a.client_satisfaction_rating)
          .reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / (attendancesByService?.filter(a => a.client_satisfaction_rating).length || 1) || 0

        const avgDuration = attendancesByService?.filter(a => a.duration_minutes)
          .reduce((sum, a) => sum + a.duration_minutes, 0) / (attendancesByService?.filter(a => a.duration_minutes).length || 1) || service.estimated_duration_minutes || 60

        return {
          service_id: service.id,
          service_name: service.name,
          service_slug: service.slug,
          description: service.description,
          category: service.category,
          subcategory: service.subcategory,
          difficulty: service.difficulty,
          status: service.status,
          total_requests: totalRequests,
          completed_count: completedCount,
          pending_count: totalRequests - completedCount,
          completion_rate: totalRequests > 0 ? (completedCount / totalRequests) * 100 : 0,
          avg_rating: Math.round(avgRating * 10) / 10,
          avg_duration_minutes: Math.round(avgDuration),
          views_count: service.views_count || 0,
          is_featured: service.is_featured || false,
          estimated_duration: service.estimated_duration_minutes,
          required_documents: service.required_documents || [],
          created_at: service.created_at
        }
      })
    )

    // ==================== ATENDIMENTOS ====================
    const { data: allAttendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (attendancesError) console.error('Erro ao buscar atendimentos:', attendancesError)

    // ==================== AGENDAMENTOS FISCAIS ====================
    const { data: fiscalAppointments, error: fiscalError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (fiscalError) console.error('Erro ao buscar agendamentos fiscais:', fiscalError)

    // ==================== CHAT & SATISFAÇÃO ====================

    // Usuários do chat
    const { data: chatUsers, error: chatUsersError } = await supabase
      .from('chat_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (chatUsersError) console.error('Erro ao buscar usuários do chat:', chatUsersError)

    // Conversas do chat
    const { data: chatConversations, error: chatConversationsError } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (chatConversationsError) console.error('Erro ao buscar conversas:', chatConversationsError)

    // Feedbacks do chat
    const { data: chatFeedback, error: chatFeedbackError } = await supabase
      .from('chat_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (chatFeedbackError) console.error('Erro ao buscar feedbacks:', chatFeedbackError)

    // Agendamentos via chat
    const { data: chatAppointments, error: chatAppointmentsError } = await supabase
      .from('chat_appointments')
      .select('*')
      .order('created_at', { ascending: false })

    if (chatAppointmentsError) console.error('Erro ao buscar agendamentos chat:', chatAppointmentsError)

    // Histórico de conversas
    const { data: chatHistory, error: chatHistoryError } = await supabase
      .from('chat_conversation_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (chatHistoryError) console.error('Erro ao buscar histórico:', chatHistoryError)

    // ==================== ESTATÍSTICAS GERAIS ====================

    // Por categoria de cliente
    const clientCategoryStats: Record<string, any> = {}
    ;[...allAttendances || [], ...fiscalAppointments || []].forEach((item) => {
      const category = item.client_category || 'Não informado'
      if (!clientCategoryStats[category]) {
        clientCategoryStats[category] = {
          total: 0,
          completed: 0,
          cancelled: 0,
          ratings: []
        }
      }
      clientCategoryStats[category].total++
      if (item.status === 'CONCLUIDO') clientCategoryStats[category].completed++
      if (item.status === 'CANCELADO') clientCategoryStats[category].cancelled++
      if (item.client_satisfaction_rating) clientCategoryStats[category].ratings.push(item.client_satisfaction_rating)
    })

    const categoryBreakdown = Object.entries(clientCategoryStats).map(([category, stats]: [string, any]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      cancelled: stats.cancelled,
      completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      avg_rating: stats.ratings.length > 0 ? stats.ratings.reduce((a: number, b: number) => a + b, 0) / stats.ratings.length : 0
    }))

    // Por dia da semana
    const weekdayStats = Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      weekdayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
      total: 0,
      completed: 0,
      cancelled: 0
    }))

    ;[...allAttendances || [], ...fiscalAppointments || []].forEach((item) => {
      const date = new Date(item.scheduled_date || item.preferred_date)
      const weekday = date.getDay()
      weekdayStats[weekday].total++
      if (item.status === 'CONCLUIDO') weekdayStats[weekday].completed++
      if (item.status === 'CANCELADO') weekdayStats[weekday].cancelled++
    })

    // Por mês (últimos 12 meses)
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        monthName: date.toLocaleString('pt-BR', { month: 'short' }),
        total: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0
      }
    }).reverse()

    ;[...allAttendances || [], ...fiscalAppointments || []].forEach((item) => {
      const date = new Date(item.created_at)
      const monthIndex = monthlyStats.findIndex(m =>
        m.month === date.getMonth() && m.year === date.getFullYear()
      )
      if (monthIndex !== -1) {
        monthlyStats[monthIndex].total++
        if (item.status === 'CONCLUIDO') monthlyStats[monthIndex].completed++
        if (item.status === 'CANCELADO') monthlyStats[monthIndex].cancelled++
      }
    })

    // ==================== SATISFAÇÃO DO CLIENTE ====================

    // Satisfação geral
    const allRatings = [
      ...(allAttendances?.filter(a => a.client_satisfaction_rating)?.map(a => a.client_satisfaction_rating) || []),
      ...(chatFeedback?.map(f => f.rating) || [])
    ]

    const satisfactionDistribution = {
      rating_1: allRatings.filter(r => r === 1).length,
      rating_2: allRatings.filter(r => r === 2).length,
      rating_3: allRatings.filter(r => r === 3).length,
      rating_4: allRatings.filter(r => r === 4).length,
      rating_5: allRatings.filter(r => r === 5).length,
      total_ratings: allRatings.length,
      avg_rating: allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0,
      nps_score: calculateNPS(allRatings)
    }

    // Feedback textual mais recente
    const recentFeedback = [
      ...(allAttendances?.filter(a => a.client_feedback)?.map(a => ({
        source: 'attendance',
        rating: a.client_satisfaction_rating,
        feedback: a.client_feedback,
        created_at: a.completed_at || a.created_at,
        client_name: a.client_name
      })) || []),
      ...(chatFeedback?.filter(f => f.feedback_text)?.map(f => ({
        source: 'chat',
        rating: f.rating,
        feedback: f.feedback_text,
        created_at: f.created_at,
        client_name: 'Cliente do Chat'
      })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    // ==================== PERFORMANCE DE TEMPO ====================

    const performanceStats = {
      avg_attendance_duration: allAttendances?.filter(a => a.duration_minutes)
        .reduce((sum, a) => sum + a.duration_minutes, 0) / (allAttendances?.filter(a => a.duration_minutes).length || 1) || 60,

      avg_response_time_hours: chatConversations?.filter(c => c.chat_accepted_at && c.created_at)
        .reduce((sum, c) => {
          const diff = new Date(c.chat_accepted_at!).getTime() - new Date(c.created_at).getTime()
          return sum + (diff / (1000 * 60 * 60))
        }, 0) / (chatConversations?.filter(c => c.chat_accepted_at).length || 1) || 0,

      avg_conversation_duration_minutes: chatHistory?.filter(h => h.duration_minutes)
        .reduce((sum, h) => sum + h.duration_minutes, 0) / (chatHistory?.filter(h => h.duration_minutes).length || 1) || 0,

      avg_time_to_schedule: 0 // Pode ser calculado se tivermos timestamps adequados
    }

    // ==================== TAXAS DE CONVERSÃO ====================

    const conversionStats = {
      chat_to_appointment: {
        total_conversations: chatConversations?.length || 0,
        conversations_with_appointment: chatAppointments?.length || 0,
        conversion_rate: chatConversations?.length > 0
          ? (chatAppointments?.length || 0) / chatConversations.length * 100
          : 0
      },
      chat_to_registration: {
        total_conversations: chatConversations?.length || 0,
        total_registrations: chatUsers?.length || 0,
        conversion_rate: chatConversations?.length > 0
          ? (chatUsers?.length || 0) / chatConversations.length * 100
          : 0
      },
      appointment_to_completion: {
        total_appointments: (allAttendances?.length || 0) + (fiscalAppointments?.length || 0),
        completed_appointments: (allAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0) +
                                (fiscalAppointments?.filter(a => a.status === 'CONCLUIDO').length || 0),
        conversion_rate: ((allAttendances?.length || 0) + (fiscalAppointments?.length || 0)) > 0
          ? ((allAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0) +
             (fiscalAppointments?.filter(a => a.status === 'CONCLUIDO').length || 0)) /
            ((allAttendances?.length || 0) + (fiscalAppointments?.length || 0)) * 100
          : 0
      }
    }

    // ==================== CRESCIMENTO ====================

    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Atendimentos dos últimos 30 dias
    const appointmentsLast30Days = [...allAttendances || [], ...fiscalAppointments || []].filter(a =>
      new Date(a.created_at).getTime() >= thirtyDaysAgo.getTime()
    ).length

    // Atendimentos dos 30 dias anteriores (31-60 dias atrás)
    const appointmentsPrevious30Days = [...allAttendances || [], ...fiscalAppointments || []].filter(a => {
      const createdAt = new Date(a.created_at).getTime()
      return createdAt >= sixtyDaysAgo.getTime() && createdAt < thirtyDaysAgo.getTime()
    }).length

    // Calcular taxa de crescimento
    const growthRate = appointmentsPrevious30Days > 0
      ? ((appointmentsLast30Days - appointmentsPrevious30Days) / appointmentsPrevious30Days) * 100
      : appointmentsLast30Days > 0 ? 100 : 0

    const growthStats = {
      new_users_last_7_days: chatUsers?.filter(u =>
        new Date(u.created_at).getTime() >= sevenDaysAgo.getTime()
      ).length || 0,
      new_users_last_30_days: chatUsers?.filter(u =>
        new Date(u.created_at).getTime() >= thirtyDaysAgo.getTime()
      ).length || 0,
      new_appointments_last_7_days: [...allAttendances || [], ...fiscalAppointments || []].filter(a =>
        new Date(a.created_at).getTime() >= sevenDaysAgo.getTime()
      ).length,
      new_appointments_last_30_days: appointmentsLast30Days,
      appointments_previous_30_days: appointmentsPrevious30Days,
      growth_rate: growthRate,
      active_students_current_month: studentsWithStats.filter(s =>
        s.status === 'ATIVO' && new Date(s.last_activity).getTime() >= thirtyDaysAgo.getTime()
      ).length
    }

    // ==================== RESPOSTA ====================

    console.log('✅ Business Intelligence - Dados coletados com sucesso')

    return NextResponse.json({
      // Geral
      general: {
        students: studentsWithStats,
        services: servicesWithStats,
        attendances: allAttendances,
        fiscalAppointments: fiscalAppointments,
        categoryBreakdown,
        weekdayStats,
        monthlyStats,
        totals: {
          total_students: students?.length || 0,
          active_students: students?.filter(s => s.status === 'ATIVO').length || 0,
          total_services: nafServices?.length || 0,
          active_services: nafServices?.filter(s => s.status === 'ativo').length || 0,
          total_attendances: (allAttendances?.length || 0) + (fiscalAppointments?.length || 0),
          completed_attendances: (allAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0) +
                                 (fiscalAppointments?.filter(a => a.status === 'CONCLUIDO').length || 0),
          total_chat_users: chatUsers?.length || 0,
          total_conversations: chatConversations?.length || 0
        }
      },

      // Performance
      performance: {
        students: studentsWithStats.sort((a, b) => b.productivity_score - a.productivity_score).slice(0, 10),
        services: servicesWithStats.sort((a, b) => b.total_requests - a.total_requests).slice(0, 10),
        performanceStats,
        topPerformers: {
          students: studentsWithStats.filter(s => s.total_attendances > 0)
            .sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5),
          services: servicesWithStats.filter(s => s.total_requests > 0)
            .sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5)
        }
      },

      // Estudantes detalhado
      students: {
        all: studentsWithStats,
        byStatus: {
          active: studentsWithStats.filter(s => s.status === 'ATIVO'),
          inactive: studentsWithStats.filter(s => s.status === 'INATIVO'),
          suspended: studentsWithStats.filter(s => s.status === 'SUSPENSO')
        },
        byCourse: groupBy(studentsWithStats, 'course'),
        bySemester: groupBy(studentsWithStats, 'semester'),
        statistics: {
          total: studentsWithStats.length,
          avg_productivity: studentsWithStats.reduce((sum, s) => sum + s.productivity_score, 0) / studentsWithStats.length || 0,
          avg_rating: studentsWithStats.reduce((sum, s) => sum + s.avg_rating, 0) / studentsWithStats.length || 0,
          total_hours: studentsWithStats.reduce((sum, s) => sum + s.hours_logged, 0)
        }
      },

      // Serviços detalhado
      services: {
        all: servicesWithStats,
        byCategory: groupBy(servicesWithStats, 'category'),
        byDifficulty: groupBy(servicesWithStats, 'difficulty'),
        byStatus: groupBy(servicesWithStats, 'status'),
        topRequested: servicesWithStats.sort((a, b) => b.total_requests - a.total_requests).slice(0, 10),
        topRated: servicesWithStats.filter(s => s.avg_rating > 0)
          .sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 10),
        statistics: {
          total: servicesWithStats.length,
          total_requests: servicesWithStats.reduce((sum, s) => sum + s.total_requests, 0),
          avg_completion_rate: servicesWithStats.reduce((sum, s) => sum + s.completion_rate, 0) / servicesWithStats.length || 0,
          avg_rating: servicesWithStats.filter(s => s.avg_rating > 0)
            .reduce((sum, s) => sum + s.avg_rating, 0) / servicesWithStats.filter(s => s.avg_rating > 0).length || 0
        }
      },

      // Satisfação (Chat)
      satisfaction: {
        chatUsers: chatUsers?.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          city: u.city,
          occupation: u.occupation,
          service_interest: u.service_interest,
          status: u.status,
          created_at: u.created_at
        })),
        conversations: chatConversations,
        feedback: chatFeedback,
        appointments: chatAppointments,
        history: chatHistory,
        satisfactionDistribution,
        recentFeedback,
        statistics: {
          total_users: chatUsers?.length || 0,
          active_users: chatUsers?.filter(u => u.status === 'active').length || 0,
          total_conversations: chatConversations?.length || 0,
          active_conversations: chatConversations?.filter(c => c.status === 'active').length || 0,
          total_feedback: chatFeedback?.length || 0,
          avg_feedback_rating: chatFeedback?.reduce((sum, f) => sum + f.rating, 0) / (chatFeedback?.length || 1) || 0,
          total_appointments: chatAppointments?.length || 0,
          completed_appointments: chatAppointments?.filter(a => a.status === 'completed').length || 0
        },
        userGrowth: {
          daily: calculateDailyGrowth(chatUsers || [], 30),
          weekly: calculateWeeklyGrowth(chatUsers || [], 12),
          monthly: calculateMonthlyGrowth(chatUsers || [], 6)
        },
        conversationMetrics: {
          avg_messages_per_conversation: chatHistory?.reduce((sum, h) => sum + h.total_messages, 0) / (chatHistory?.length || 1) || 0,
          avg_conversation_duration: performanceStats.avg_conversation_duration_minutes,
          avg_response_time: performanceStats.avg_response_time_hours
        }
      },

      // Taxas de conversão
      conversion: conversionStats,

      // Crescimento
      growth: growthStats,

      // Metadados
      metadata: {
        generated_at: new Date().toISOString(),
        period: {
          start: ninetyDaysAgo.toISOString(),
          end: now.toISOString(),
          days: 90
        },
        data_sources: [
          'students',
          'naf_services',
          'attendances',
          'fiscal_appointments',
          'chat_users',
          'chat_conversations',
          'chat_feedback',
          'chat_appointments',
          'chat_conversation_history'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro na Business Intelligence API:', error)
    return NextResponse.json(
      {
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Funções auxiliares
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key] || 'Não informado')
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

function calculateNPS(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const promoters = ratings.filter(r => r >= 4).length
  const detractors = ratings.filter(r => r <= 2).length
  return ((promoters - detractors) / ratings.length) * 100
}

function calculateDailyGrowth(users: any[], days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    return {
      date: date.toISOString().split('T')[0],
      count: users.filter(u => {
        const createdAt = new Date(u.created_at)
        return createdAt >= date && createdAt < nextDate
      }).length
    }
  }).reverse()
}

function calculateWeeklyGrowth(users: any[], weeks: number) {
  return Array.from({ length: weeks }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (i * 7))
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 7)

    return {
      week: `Semana ${weeks - i}`,
      count: users.filter(u => {
        const createdAt = new Date(u.created_at)
        return createdAt >= date && createdAt < nextDate
      }).length
    }
  }).reverse()
}

function calculateMonthlyGrowth(users: any[], months: number) {
  return Array.from({ length: months }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    date.setDate(1)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setMonth(nextDate.getMonth() + 1)

    return {
      month: date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
      count: users.filter(u => {
        const createdAt = new Date(u.created_at)
        return createdAt >= date && createdAt < nextDate
      }).length
    }
  }).reverse()
}
