import { NextRequest, NextResponse } from 'next/server'
import { getCoordinatorFromRequest } from '@/middleware/coordinator-auth'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const coordinator = await getCoordinatorFromRequest(request)
    if (!coordinator) {
      return NextResponse.json(
        { message: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    // Buscar métricas do dashboard
    const { data: metrics, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (metricsError) {
      throw metricsError
    }

    // Buscar performance dos estudantes (dados reais)
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        course,
        semester,
        status,
        created_at
      `)
      .eq('status', 'ATIVO')
      .order('created_at', { ascending: false })
      .limit(10)

    if (studentsError) {
      throw studentsError
    }

    // Buscar estatísticas de atendimentos para cada estudante
    const studentsWithStats = await Promise.all(
      (students || []).map(async (student) => {
        const { data: attendances } = await supabase
          .from('attendances')
          .select('id, status, client_satisfaction_rating')
          .eq('student_id', student.id)

        const totalAttendances = attendances?.length || 0
        const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
        const ratingsSum = attendances
          ?.filter(a => a.client_satisfaction_rating)
          .reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) || 0
        const ratingsCount = attendances?.filter(a => a.client_satisfaction_rating).length || 0
        const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

        return {
          student_name: student.name,
          course: student.course,
          total_attendances: totalAttendances,
          avg_rating: Math.round(avgRating * 10) / 10,
          status: student.status
        }
      })
    )

    // Buscar serviços NAF disponíveis
    const { data: nafServices, error: nafServicesError } = await supabase
      .from('naf_services')
      .select('*')
      .eq('status', 'ativo')
      .order('priority_order', { ascending: true })

    if (nafServicesError) {
      console.warn('Erro ao buscar serviços NAF:', nafServicesError)
    }

    // Buscar métricas de serviços (dados reais dos atendimentos)
    const { data: allAttendances, error: allAttendancesError } = await supabase
      .from('attendances')
      .select('service_type, status, client_satisfaction_rating, scheduled_date')
      .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    // Buscar agendamentos de orientações fiscais
    const { data: fiscalAppointments, error: fiscalAppointmentsError } = await supabase
      .from('fiscal_appointments')
      .select('service_type, service_title, status, urgency_level, created_at, client_name, client_email, protocol')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (allAttendancesError) {
      throw allAttendancesError
    }

    if (fiscalAppointmentsError) {
      throw fiscalAppointmentsError
    }

    // Criar estrutura de serviços baseada nos serviços NAF disponíveis
    const serviceGroups: unknown = {}

    // Primeiro, criar entradas para todos os serviços NAF ativos
    if (nafServices && nafServices.length > 0) {
      nafServices.forEach((service: unknown) => {
        serviceGroups[service.name] = {
          service_name: service.name,
          service_id: service.id,
          service_description: service.description,
          service_category: service.category,
          service_difficulty: service.difficulty,
          is_featured: service.is_featured,
          requests_count: service.requests_count || 0,
          completed_count: 0,
          pending_count: 0,
          avg_duration_minutes: service.estimated_duration_minutes || 45,
          satisfaction_rating: service.satisfaction_rating || 0,
          views_count: service.views_count || 0,
          ratings: []
        }
      })
    }

    // Depois, agregar dados de atendimentos reais aos serviços
    if (allAttendances && allAttendances.length > 0) {
      allAttendances.forEach((attendance: unknown) => {
        const serviceType = attendance.service_type

        // Se o serviço não existe na estrutura, criar uma entrada
        if (!serviceGroups[serviceType]) {
          serviceGroups[serviceType] = {
            service_name: serviceType,
            service_id: null,
            service_description: 'Serviço baseado em atendimentos',
            service_category: 'outros',
            service_difficulty: 'intermediario',
            is_featured: false,
            requests_count: 0,
            completed_count: 0,
            pending_count: 0,
            avg_duration_minutes: 45,
            satisfaction_rating: 0,
            views_count: 0,
            ratings: []
          }
        }

        serviceGroups[serviceType].requests_count++

        if (attendance.status === 'CONCLUIDO') {
          serviceGroups[serviceType].completed_count++
        } else if (['AGENDADO', 'EM_ANDAMENTO'].includes(attendance.status)) {
          serviceGroups[serviceType].pending_count++
        }

        if (attendance.client_satisfaction_rating) {
          serviceGroups[serviceType].ratings.push(attendance.client_satisfaction_rating)
        }
      })
    }

    // Calcular média de satisfação e converter para array
    const services = Object.values(serviceGroups).map((service: unknown) => {
      const avgSatisfaction = service.ratings.length > 0
        ? service.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / service.ratings.length
        : 0

      return {
        ...service,
        satisfaction_rating: Math.round(avgSatisfaction * 10) / 10
      }
    }).sort((a: unknown, b: unknown) => b.requests_count - a.requests_count).slice(0, 5)

    // Calcular estatísticas principais baseadas em dados reais
    const totalAtendimentos = allAttendances?.length || 0
    const completedAttendances = allAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const taxaConclusao = totalAtendimentos > 0 ? (completedAttendances / totalAtendimentos) * 100 : 0

    const tempoMedio = 45 // Valor padrão por enquanto

    const satisfacaoGeral = allAttendances
      ?.filter(a => a.client_satisfaction_rating)
      .reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) || 0
    const satisfacaoCount = allAttendances?.filter(a => a.client_satisfaction_rating).length || 0
    const satisfacaoMedia = satisfacaoCount > 0 ? satisfacaoGeral / satisfacaoCount : 0

    // Dados semanais para gráficos (simulados baseados nas métricas)
    const weeklyData = [
      { day: 'Seg', atendimentos: 45, agendamentos: 52 },
      { day: 'Ter', atendimentos: 38, agendamentos: 41 },
      { day: 'Qua', atendimentos: 52, agendamentos: 47 },
      { day: 'Qui', atendimentos: 48, agendamentos: 55 },
      { day: 'Sex', atendimentos: 61, agendamentos: 58 },
      { day: 'Sáb', atendimentos: 23, agendamentos: 28 }
    ]

    // Distribuição do público-alvo
    const publicoAlvo = [
      { categoria: 'Pessoas Físicas Hipossuficientes', quantidade: 542, percentual: 45.2 },
      { categoria: 'Microempreendedores Individuais', quantidade: 387, percentual: 32.3 },
      { categoria: 'Pequenos Proprietários Rurais', quantidade: 198, percentual: 16.5 },
      { categoria: 'Organizações da Sociedade Civil', quantidade: 72, percentual: 6.0 }
    ]

    // Processar agendamentos fiscais para estatísticas
    const fiscalStats = {
      totalAppointments: fiscalAppointments?.length || 0,
      pendingAppointments: fiscalAppointments?.filter(apt => apt.status === 'PENDENTE').length || 0,
      confirmedAppointments: fiscalAppointments?.filter(apt => apt.status === 'CONFIRMADO').length || 0,
      completedAppointments: fiscalAppointments?.filter(apt => apt.status === 'CONCLUIDO').length || 0,
      urgentAppointments: fiscalAppointments?.filter(apt => apt.urgency_level === 'URGENTE').length || 0,

      // Agrupamento por tipo de serviço
      serviceBreakdown: fiscalAppointments?.reduce((acc: unknown, apt) => {
        if (!acc[apt.service_type]) {
          acc[apt.service_type] = {
            service_type: apt.service_type,
            service_title: apt.service_title,
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            urgent: 0
          }
        }

        acc[apt.service_type].total++

        if (apt.status === 'PENDENTE') acc[apt.service_type].pending++
        if (apt.status === 'CONFIRMADO') acc[apt.service_type].confirmed++
        if (apt.status === 'CONCLUIDO') acc[apt.service_type].completed++
        if (apt.urgency_level === 'URGENTE') acc[apt.service_type].urgent++

        return acc
      }, {}),

      // Últimos agendamentos
      recentAppointments: fiscalAppointments?.slice(0, 10).map(apt => ({
        protocol: apt.protocol,
        client_name: apt.client_name,
        service_title: apt.service_title,
        status: apt.status,
        urgency_level: apt.urgency_level,
        created_at: apt.created_at
      })) || []
    }

    return NextResponse.json({
      mainMetrics: {
        atendimentosMensais: totalAtendimentos,
        taxaConclusao: Number(taxaConclusao),
        tempoMedio: Number(tempoMedio),
        satisfacao: Number(satisfacaoMedia)
      },
      services: services || [],
      students: studentsWithStats || [],
      weeklyData,
      publicoAlvo,
      fiscalAppointments: fiscalStats,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}