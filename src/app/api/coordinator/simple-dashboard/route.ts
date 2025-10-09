import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Dashboard API - Iniciando busca de dados reais do Supabase')

    // 1. MÉTRICAS PRINCIPAIS - Dados reais dos atendimentos
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Buscar todos os atendimentos dos últimos 30 dias
    const { data: allAttendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (attendancesError) {
      console.error('Erro ao buscar atendimentos:', attendancesError)
    }

    console.log(`📊 Encontrados ${allAttendances?.length || 0} atendimentos`)

    // 1.5. BUSCAR AGENDAMENTOS FISCAIS PRIMEIRO (para incluir nos gráficos)
    const { data: fiscalAppointments, error: fiscalError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (fiscalError) {
      console.error('Erro ao buscar agendamentos fiscais:', fiscalError)
    }

    console.log(`📊 Encontrados ${fiscalAppointments?.length || 0} agendamentos fiscais`)

    // 1.6. BUSCAR FEEDBACKS DOS ATENDIMENTOS FISCAIS
    const { data: fiscalFeedbacks, error: feedbacksError } = await supabase
      .from('fiscal_appointment_feedbacks')
      .select('rating, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (feedbacksError) {
      console.error('Erro ao buscar feedbacks fiscais:', feedbacksError)
    }

    console.log(`⭐ Encontrados ${fiscalFeedbacks?.length || 0} feedbacks de atendimentos fiscais`)

    // Calcular métricas principais (INCLUINDO agendamentos fiscais)
    const totalAtendimentos = (allAttendances?.length || 0) + (fiscalAppointments?.length || 0)

    const completedAttendances = allAttendances?.filter(a => a.status === 'CONCLUIDO') || []
    const completedFiscalAppointments = fiscalAppointments?.filter(a => a.status === 'CONCLUIDO') || []
    const totalCompleted = completedAttendances.length + completedFiscalAppointments.length

    const taxaConclusao = totalAtendimentos > 0 ? (totalCompleted / totalAtendimentos) * 100 : 0

    // Calcular tempo médio (baseado na duração dos atendimentos)
    const tempoMedio = completedAttendances.length > 0
      ? completedAttendances.reduce((sum, a) => sum + (a.duration_minutes || 60), 0) / completedAttendances.length
      : 60

    // Calcular satisfação média (INCLUINDO feedbacks de atendimentos fiscais)
    const ratingsAtendimentos = allAttendances?.filter(a => a.client_satisfaction_rating) || []
    const ratingsFiscais = fiscalFeedbacks || []

    const sumAtendimentos = ratingsAtendimentos.reduce((sum, a) => sum + a.client_satisfaction_rating, 0)
    const sumFiscais = ratingsFiscais.reduce((sum, f) => sum + f.rating, 0)
    const totalRatings = ratingsAtendimentos.length + ratingsFiscais.length

    const satisfacaoMedia = totalRatings > 0
      ? (sumAtendimentos + sumFiscais) / totalRatings
      : 0

    console.log('📈 Métricas calculadas:', {
      totalAtendimentos,
      totalCompleted,
      taxaConclusao,
      tempoMedio,
      satisfacaoMedia,
      attendances: allAttendances?.length || 0,
      fiscalAppointments: fiscalAppointments?.length || 0
    })

    // 2. DADOS SEMANAIS REAIS - Agrupar atendimentos E agendamentos fiscais por dia da semana
    const weeklyData = []
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    for (let i = 0; i < 7; i++) {
      // Atendimentos da tabela attendances
      const dayAttendances = allAttendances?.filter(a => {
        const date = new Date(a.scheduled_date)
        return date.getDay() === i
      }) || []

      // Agendamentos da tabela fiscal_appointments
      const dayFiscalAppointments = fiscalAppointments?.filter(a => {
        const date = new Date(a.preferred_date)
        return date.getDay() === i
      }) || []

      const agendados = dayAttendances.filter(a => a.status === 'AGENDADO').length +
                       dayFiscalAppointments.filter(a => a.status === 'PENDENTE').length

      const realizados = dayAttendances.filter(a => ['CONCLUIDO', 'EM_ANDAMENTO'].includes(a.status)).length +
                        dayFiscalAppointments.filter(a => ['CONCLUIDO', 'CONFIRMADO', 'EM_ANDAMENTO'].includes(a.status)).length

      const cancelados = dayAttendances.filter(a => a.status === 'CANCELADO').length +
                        dayFiscalAppointments.filter(a => a.status === 'CANCELADO').length

      const naoCompareceu = dayAttendances.filter(a => a.status === 'NAO_COMPARECEU').length

      const totalDay = dayAttendances.length + dayFiscalAppointments.length

      weeklyData.push({
        day: daysOfWeek[i],
        atendimentos: realizados,
        agendamentos: agendados,
        cancelados,
        naoCompareceu,
        total: totalDay,
        taxaEfetivacao: totalDay > 0 ? (realizados / totalDay) * 100 : 0
      })
    }

    // 3. ESTUDANTES REAIS
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'ATIVO')
      .order('created_at', { ascending: false })
      .limit(20)

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError)
    }

    console.log(`👥 Encontrados ${students?.length || 0} estudantes ativos`)

    // Buscar estatísticas detalhadas de cada estudante
    const studentsWithStats = await Promise.all(
      (students || []).map(async (student) => {
        const { data: studentAttendances } = await supabase
          .from('attendances')
          .select('id, status, client_satisfaction_rating, duration_minutes, created_at, service_type')
          .eq('student_id', student.id)

        // Buscar conversas de chat do estudante
        const { data: chatConversations } = await supabase
          .from('chat_conversations')
          .select('id, status, created_at')
          .eq('student_id', student.id)

        const totalAttendances = studentAttendances?.length || 0
        const completedAttendances = studentAttendances?.filter(a => a.status === 'CONCLUIDO').length || 0
        const ratingsSum = studentAttendances
          ?.filter(a => a.client_satisfaction_rating)
          .reduce((sum, a) => sum + a.client_satisfaction_rating, 0) || 0
        const ratingsCount = studentAttendances?.filter(a => a.client_satisfaction_rating).length || 0
        const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

        // Calcular produtividade (atendimentos por semana)
        const weeksActive = Math.max(1, Math.ceil((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)))
        const productivity = totalAttendances / weeksActive

        // Especialidades (serviços mais atendidos)
        const serviceCount: unknown = {}
        studentAttendances?.forEach((att: unknown) => {
          serviceCount[att.service_type] = (serviceCount[att.service_type] || 0) + 1
        })
        const topServices = Object.entries(serviceCount)
          .sort(([,a]: unknown, [,b]: unknown) => b - a)
          .slice(0, 3)
          .map(([service]) => service)

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
          last_activity: studentAttendances?.[0]?.created_at || student.created_at
        }
      })
    )

    // Estatísticas gerais do portal estudantil
    const studentPortalStats = {
      totalActiveStudents: studentsWithStats.length,
      avgProductivity: studentsWithStats.length > 0
        ? studentsWithStats.reduce((sum, s) => sum + s.productivity_score, 0) / studentsWithStats.length
        : 0,
      avgSatisfaction: studentsWithStats.length > 0
        ? studentsWithStats.reduce((sum, s) => sum + s.avg_rating, 0) / studentsWithStats.length
        : 0,
      topPerformers: studentsWithStats
        .filter(s => s.total_attendances > 0)
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, 5),
      newStudents: studentsWithStats.filter(s => {
        const createdDate = new Date(s.created_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return createdDate > thirtyDaysAgo
      }).length
    }

    // 4. SERVIÇOS REAIS - Baseado nos atendimentos
    const serviceGroups: unknown = {}

    // Buscar serviços NAF cadastrados
    const { data: nafServices, error: nafServicesError } = await supabase
      .from('naf_services')
      .select('*')
      .eq('status', 'ativo')
      .order('priority_order', { ascending: true })

    if (nafServicesError) {
      console.warn('Erro ao buscar serviços NAF:', nafServicesError)
    }

    console.log(`🛠️ Encontrados ${nafServices?.length || 0} serviços NAF`)

    // Agrupar atendimentos por tipo de serviço
    if (allAttendances) {
      allAttendances.forEach((attendance: unknown) => {
        const serviceType = attendance.service_type

        if (!serviceGroups[serviceType]) {
          serviceGroups[serviceType] = {
            service_name: serviceType,
            service_id: null,
            service_description: `Serviço de ${serviceType}`,
            service_category: 'outros',
            service_difficulty: 'intermediario',
            is_featured: false,
            requests_count: 0,
            completed_count: 0,
            pending_count: 0,
            avg_duration_minutes: 60,
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

        if (attendance.duration_minutes) {
          serviceGroups[serviceType].avg_duration_minutes =
            (serviceGroups[serviceType].avg_duration_minutes + attendance.duration_minutes) / 2
        }
      })
    }

    // Calcular média de satisfação e performance dos serviços
    const services = Object.values(serviceGroups).map((service: unknown) => {
      const avgSatisfaction = service.ratings.length > 0
        ? service.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / service.ratings.length
        : 0

      const completionRate = service.requests_count > 0 ? (service.completed_count / service.requests_count) * 100 : 0
      const efficiency = service.avg_duration_minutes > 0 ? Math.min((60 / service.avg_duration_minutes) * 100, 100) : 0

      return {
        ...service,
        satisfaction_rating: Math.round(avgSatisfaction * 10) / 10,
        avg_duration_minutes: Math.round(service.avg_duration_minutes),
        completion_rate: Math.round(completionRate * 10) / 10,
        efficiency_score: Math.round(efficiency * 10) / 10,
        performance_score: Math.round(((avgSatisfaction * 20) + completionRate + efficiency) / 3 * 10) / 10
      }
    }).sort((a: unknown, b: unknown) => b.performance_score - a.performance_score)

    // Estatísticas gerais de performance dos serviços
    const servicePerformance = {
      totalServices: services.length,
      avgSatisfaction: services.length > 0
        ? services.reduce((sum: number, s: unknown) => sum + s.satisfaction_rating, 0) / services.length
        : 0,
      avgCompletionRate: services.length > 0
        ? services.reduce((sum: number, s: unknown) => sum + s.completion_rate, 0) / services.length
        : 0,
      topPerformingServices: services.slice(0, 5),
      underperformingServices: services.filter((s: unknown) => s.performance_score < 60).slice(0, 3)
    }

    console.log(`🛠️ Processados ${services.length} tipos de serviços`)

    // 5. PÚBLICO-ALVO REAL - Baseado na categoria dos clientes (attendances + fiscal_appointments)
    const clientCategories: unknown = {}
    const clientAgeGroups: unknown = {}
    const clientGenderDistribution: unknown = { 'M': 0, 'F': 0, 'Não informado': 0 }

    // Processar atendimentos da tabela attendances
    allAttendances?.forEach((attendance: unknown) => {
      const category = attendance.client_category || 'Não informado'
      const ageGroup = attendance.client_age ?
        (attendance.client_age < 25 ? '18-24' :
         attendance.client_age < 35 ? '25-34' :
         attendance.client_age < 50 ? '35-49' :
         attendance.client_age < 65 ? '50-64' : '65+') : 'Não informado'
      const gender = attendance.client_gender || 'Não informado'

      // Categorias
      if (!clientCategories[category]) {
        clientCategories[category] = {
          total: 0,
          concluidos: 0,
          satisfacaoMedia: 0,
          ratings: []
        }
      }
      clientCategories[category].total++
      if (attendance.status === 'CONCLUIDO') {
        clientCategories[category].concluidos++
      }
      if (attendance.client_satisfaction_rating) {
        clientCategories[category].ratings.push(attendance.client_satisfaction_rating)
      }

      // Faixas etárias
      clientAgeGroups[ageGroup] = (clientAgeGroups[ageGroup] || 0) + 1

      // Distribuição por gênero
      clientGenderDistribution[gender] = (clientGenderDistribution[gender] || 0) + 1
    })

    // Processar agendamentos da tabela fiscal_appointments
    fiscalAppointments?.forEach((appointment: unknown) => {
      // Mapear client_category do fiscal_appointments para categorias do gráfico
      const categoryMap: Record<string, string> = {
        'PESSOA_FISICA': 'Pessoa Física',
        'MEI': 'Microempreendedor Individual',
        'RURAL': 'Produtor Rural',
        'OSC': 'Organização da Sociedade Civil'
      }

      const category = categoryMap[appointment.client_category] || appointment.client_category || 'Não informado'

      // Categorias
      if (!clientCategories[category]) {
        clientCategories[category] = {
          total: 0,
          concluidos: 0,
          satisfacaoMedia: 0,
          ratings: []
        }
      }
      clientCategories[category].total++
      if (appointment.status === 'CONCLUIDO') {
        clientCategories[category].concluidos++
      }
      // fiscal_appointments não tem rating por enquanto, mas preparar para o futuro
      if (appointment.client_satisfaction_rating) {
        clientCategories[category].ratings.push(appointment.client_satisfaction_rating)
      }
    })

    console.log('📊 Categorias processadas:', Object.keys(clientCategories))
    console.log('📊 Total de clientes por categoria:', clientCategories)

    // Calcular satisfação média por categoria
    Object.keys(clientCategories).forEach(category => {
      const data = clientCategories[category]
      data.satisfacaoMedia = data.ratings.length > 0
        ? data.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / data.ratings.length
        : 0
      data.taxaConclusao = data.total > 0 ? (data.concluidos / data.total) * 100 : 0
    })

    const totalClients = Object.values(clientCategories).reduce((sum: unknown, data: unknown) => sum + data.total, 0)
    const publicoAlvo = {
      categorias: Object.entries(clientCategories).map(([categoria, data]: [string, unknown]) => ({
        categoria,
        quantidade: data.total,
        percentual: totalClients > 0 ? Math.round((data.total / totalClients) * 100 * 10) / 10 : 0,
        taxaConclusao: Math.round(data.taxaConclusao * 10) / 10,
        satisfacaoMedia: Math.round(data.satisfacaoMedia * 10) / 10
      })).sort((a, b) => b.quantidade - a.quantidade),

      faixasEtarias: Object.entries(clientAgeGroups).map(([faixa, quantidade]: [string, unknown]) => ({
        faixa,
        quantidade,
        percentual: totalClients > 0 ? Math.round((quantidade / totalClients) * 100 * 10) / 10 : 0
      })).sort((a, b) => b.quantidade - a.quantidade),

      distribuicaoGenero: Object.entries(clientGenderDistribution).map(([genero, quantidade]: [string, unknown]) => ({
        genero: genero === 'M' ? 'Masculino' : genero === 'F' ? 'Feminino' : 'Não informado',
        quantidade,
        percentual: totalClients > 0 ? Math.round((quantidade / totalClients) * 100 * 10) / 10 : 0
      })).sort((a, b) => b.quantidade - a.quantidade),

      totalClientes: totalClients
    }

    // 6. AGENDAMENTOS FISCAIS REAIS (já buscados anteriormente na linha 52)
    console.log(`📋 Processando ${fiscalAppointments?.length || 0} agendamentos fiscais para estatísticas`)

    // 7. ALERTAS E NOTIFICAÇÕES REAIS
    const alertsData = {
      urgentAppointments: fiscalAppointments?.filter(apt => apt.urgency_level === 'URGENTE').length || 0,
      pendingTransfers: 0,
      unreadMessages: 0,
      systemAlerts: []
    }

    // Buscar transferências pendentes
    const { data: pendingTransfers, error: transfersError } = await supabase
      .from('chat_transfer_requests')
      .select('*')
      .eq('status', 'PENDENTE')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (!transfersError) {
      alertsData.pendingTransfers = pendingTransfers?.length || 0
    }

    // Buscar mensagens não lidas
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('status', 'ATIVO')
      .eq('has_unread_messages', true)

    if (!messagesError) {
      alertsData.unreadMessages = unreadMessages?.length || 0
    }

    // Gerar alertas do sistema baseados nos dados
    if (alertsData.urgentAppointments > 0) {
      alertsData.systemAlerts.push({
        type: 'urgent',
        title: 'Agendamentos Urgentes',
        message: `${alertsData.urgentAppointments} agendamento(s) fiscal(is) marcado(s) como urgente`,
        count: alertsData.urgentAppointments,
        action: 'fiscal-appointments'
      })
    }

    if (alertsData.pendingTransfers > 0) {
      alertsData.systemAlerts.push({
        type: 'warning',
        title: 'Transferências Pendentes',
        message: `${alertsData.pendingTransfers} solicitação(ões) de transferência aguardando`,
        count: alertsData.pendingTransfers,
        action: 'chat-transfers'
      })
    }

    if (alertsData.unreadMessages > 0) {
      alertsData.systemAlerts.push({
        type: 'info',
        title: 'Mensagens Não Lidas',
        message: `${alertsData.unreadMessages} conversa(s) com mensagens não lidas`,
        count: alertsData.unreadMessages,
        action: 'chat-conversations'
      })
    }

    // Alertas baseados em performance
    const lowPerformanceStudents = studentsWithStats.filter(s => s.avg_rating < 3.0 && s.total_attendances > 0)
    if (lowPerformanceStudents.length > 0) {
      alertsData.systemAlerts.push({
        type: 'warning',
        title: 'Estudantes com Baixa Avaliação',
        message: `${lowPerformanceStudents.length} estudante(s) com avaliação abaixo de 3.0`,
        count: lowPerformanceStudents.length,
        action: 'student-performance'
      })
    }

    console.log(`🔔 Processados ${alertsData.systemAlerts.length} alertas do sistema`)

    // Processar estatísticas dos agendamentos fiscais
    const fiscalStats = {
      totalAppointments: fiscalAppointments?.length || 0,
      pendingAppointments: fiscalAppointments?.filter(apt => apt.status === 'PENDENTE').length || 0,
      confirmedAppointments: fiscalAppointments?.filter(apt => apt.status === 'CONFIRMADO').length || 0,
      completedAppointments: fiscalAppointments?.filter(apt => apt.status === 'CONCLUIDO').length || 0,
      urgentAppointments: fiscalAppointments?.filter(apt => apt.urgency_level === 'URGENTE').length || 0,

      // Agrupamento por tipo de serviço fiscal (sem percentuais)
      serviceBreakdown: fiscalAppointments?.reduce((acc: unknown, apt) => {
        if (!acc[apt.service_type]) {
          acc[apt.service_type] = {
            service_type: apt.service_type,
            service_title: apt.service_title,
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            urgent: 0,
            ranking: 0,
            demandLevel: 'baixo'
          }
        }

        acc[apt.service_type].total++

        if (apt.status === 'PENDENTE') acc[apt.service_type].pending++
        if (apt.status === 'CONFIRMADO') acc[apt.service_type].confirmed++
        if (apt.status === 'CONCLUIDO') acc[apt.service_type].completed++
        if (apt.urgency_level === 'URGENTE') acc[apt.service_type].urgent++

        return acc
      }, {}) || {},

      // Serviços mais solicitados com ranking e nível de demanda (sem percentuais)
      topRequestedServices: Object.values(fiscalAppointments?.reduce((acc: unknown, apt) => {
        if (!acc[apt.service_type]) {
          acc[apt.service_type] = {
            service_type: apt.service_type,
            service_title: apt.service_title,
            requests_count: 0,
            monthly_average: 0,
            trend: 'estável',
            urgency_count: 0,
            completion_count: 0
          }
        }

        acc[apt.service_type].requests_count++
        if (apt.urgency_level === 'URGENTE') acc[apt.service_type].urgency_count++
        if (apt.status === 'CONCLUIDO') acc[apt.service_type].completion_count++

        return acc
      }, {}) || {})
        .map((service: unknown, index: number) => ({
          ...service,
          ranking: index + 1,
          monthly_average: Math.round(service.requests_count / 12 * 10) / 10,
          demand_level: service.requests_count > 50 ? 'alta' :
                       service.requests_count > 20 ? 'média' : 'baixa',
          efficiency_indicator: service.requests_count > 0 ?
            Math.round((service.completion_count / service.requests_count) * 100) : 0
        }))
        .sort((a: unknown, b: unknown) => b.requests_count - a.requests_count)
        .slice(0, 10),

      // Últimos agendamentos
      recentAppointments: fiscalAppointments?.slice(0, 10).map(apt => ({
        protocol: apt.protocol,
        client_name: apt.client_name,
        client_email: apt.client_email,
        service_title: apt.service_title,
        status: apt.status,
        urgency_level: apt.urgency_level,
        created_at: apt.created_at
      })) || []
    }

    console.log('✅ Dashboard API - Dados processados com sucesso')

    return NextResponse.json({
      mainMetrics: {
        atendimentosMensais: totalAtendimentos,
        taxaConclusao: Math.round(taxaConclusao * 10) / 10,
        tempoMedio: Math.round(tempoMedio),
        satisfacao: Math.round(satisfacaoMedia * 10) / 10,
        pendentes: fiscalStats.pendingAppointments,
        urgentes: fiscalStats.urgentAppointments,
        estudantesAtivos: studentsWithStats.length
      },

      // Visão Geral
      weeklyData, // Atendimentos por Dia da Semana com comparativos detalhados
      publicoAlvo, // Distribuição do Público-Alvo com segmentação visual e estatísticas
      alertsAndNotifications: alertsData, // Alertas e Notificações

      // Serviços
      services: services.slice(0, 10), // Performance dos Serviços
      servicePerformance, // Estatísticas gerais de performance

      // Equipe Estudantil
      students: studentsWithStats, // Portal Integrado dos Estudantes
      studentPortalStats, // Estatísticas gerais do portal estudantil

      // Fiscal
      fiscalAppointments: fiscalStats, // Inclui topRequestedServices sem percentuais

      // Metadados
      lastUpdated: new Date().toISOString(),
      dataSource: 'Supabase - Dados Reais',
      tablesUsed: [
        'attendances',
        'students',
        'naf_services',
        'fiscal_appointments',
        'chat_transfer_requests',
        'chat_conversations',
        'chat_messages'
      ]
    })

  } catch (error) {
    console.error('❌ Erro na Dashboard API:', error)
    return NextResponse.json(
      {
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
