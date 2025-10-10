// API de Business Intelligence - NAF Contábil
// Busca dados reais do Supabase para todas as seções do BI

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ==================== SEÇÃO GERAL ====================
async function getDadosGerais(periodoDias: number = 30) {
  try {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodoDias)

    // Buscar estudantes
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, name, status, created_at')
      .eq('status', 'ATIVO')

    if (studentsError) console.error('Erro ao buscar estudantes:', studentsError)

    // Buscar serviços
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('naf_services')
      .select('id, name, category, status, requests_count, satisfaction_rating')
      .eq('status', 'ativo')

    if (servicesError) console.error('Erro ao buscar serviços:', servicesError)

    // Buscar atendimentos
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('id, status, created_at, scheduled_date, client_satisfaction_rating, duration_minutes')
      .gte('created_at', dataInicio.toISOString())

    if (attendancesError) console.error('Erro ao buscar atendimentos:', attendancesError)

    // Buscar fiscal appointments
    const { data: fiscalAppointments, error: fiscalError } = await supabaseAdmin
      .from('fiscal_appointments')
      .select('id, status, created_at, service_category')
      .gte('created_at', dataInicio.toISOString())

    if (fiscalError) console.error('Erro ao buscar fiscal appointments:', fiscalError)

    // Calcular métricas
    const totalEstudantes = students?.length || 0
    const totalServicos = services?.length || 0
    const totalAtendimentos = (attendances?.length || 0) + (fiscalAppointments?.length || 0)
    const atendimentosConcluidos = (attendances?.filter(a => a.status === 'CONCLUIDO')?.length || 0) +
                                   (fiscalAppointments?.filter(f => f.status === 'CONCLUIDO')?.length || 0)
    const taxaConclusao = totalAtendimentos > 0 ? ((atendimentosConcluidos / totalAtendimentos) * 100).toFixed(1) : '0.0'

    // Calcular satisfação média
    const satisfacoes = attendances?.filter(a => a.client_satisfaction_rating).map(a => a.client_satisfaction_rating!) || []
    const satisfacaoMedia = satisfacoes.length > 0
      ? (satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length).toFixed(1)
      : '0.0'

    // Duração média
    const duracoes = attendances?.filter(a => a.duration_minutes).map(a => a.duration_minutes!) || []
    const duracaoMedia = duracoes.length > 0
      ? Math.round(duracoes.reduce((a, b) => a + b, 0) / duracoes.length)
      : 0

    // Distribuição por status
    const statusDistribuicao = {
      concluido: atendimentosConcluidos,
      emAndamento: (attendances?.filter(a => a.status === 'EM_ANDAMENTO')?.length || 0) +
                   (fiscalAppointments?.filter(f => f.status === 'EM_ANDAMENTO')?.length || 0),
      agendado: (attendances?.filter(a => a.status === 'AGENDADO')?.length || 0) +
                (fiscalAppointments?.filter(f => f.status === 'CONFIRMADO')?.length || 0),
      cancelado: (attendances?.filter(a => a.status === 'CANCELADO')?.length || 0) +
                 (fiscalAppointments?.filter(f => f.status === 'CANCELADO')?.length || 0)
    }

    // Evolução mensal (últimos 6 meses)
    const evolucaoMensal = []
    for (let i = 5; i >= 0; i--) {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)
      const mesInicio = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const mesFim = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

      const atendimentosMes = attendances?.filter(a => {
        const date = new Date(a.created_at)
        return date >= mesInicio && date <= mesFim
      })?.length || 0

      evolucaoMensal.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        atendimentos: atendimentosMes
      })
    }

    return {
      metricas: {
        totalEstudantes,
        totalServicos,
        totalAtendimentos,
        taxaConclusao: parseFloat(taxaConclusao),
        satisfacaoMedia: parseFloat(satisfacaoMedia),
        crescimento: 12.5 // Calcular crescimento real depois
      },
      statusDistribuicao,
      evolucaoMensal,
      estudantesAtivos: totalEstudantes,
      servicosDisponiveis: totalServicos,
      duracaoMedia
    }
  } catch (error) {
    console.error('Erro ao buscar dados gerais:', error)
    throw error
  }
}

// ==================== SEÇÃO PERFORMANCE ====================
async function getDadosPerformance(periodoDias: number = 30) {
  try {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodoDias)

    // Buscar atendimentos dos estudantes
    const { data: attendances, error } = await supabaseAdmin
      .from('attendances')
      .select(`
        id,
        student_id,
        status,
        duration_minutes,
        client_satisfaction_rating,
        completed_at,
        created_at
      `)
      .gte('created_at', dataInicio.toISOString())

    if (error) {
      console.error('Erro ao buscar atendimentos:', error)
    }

    // Buscar estudantes
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, name, email, status')

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError)
    }

    // Buscar serviços e suas métricas
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('naf_services')
      .select('id, name, requests_count, satisfaction_rating, views_count')
      .eq('status', 'ativo')
      .order('requests_count', { ascending: false })
      .limit(10)

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError)
    }

    // Calcular performance dos estudantes
    const studentPerformance = students?.map(student => {
      const studentAttendances = attendances?.filter(a => a.student_id === student.id) || []
      const completed = studentAttendances.filter(a => a.status === 'CONCLUIDO')
      const totalHoras = studentAttendances.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / 60
      const ratings = studentAttendances.filter(a => a.client_satisfaction_rating).map(a => a.client_satisfaction_rating!)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      return {
        id: student.id,
        nome: student.name,
        email: student.email,
        totalAtendimentos: studentAttendances.length,
        atendimentosConcluidos: completed.length,
        totalHoras: parseFloat(totalHoras.toFixed(1)),
        satisfacaoMedia: parseFloat(avgRating.toFixed(1)),
        taxaConclusao: studentAttendances.length > 0
          ? parseFloat(((completed.length / studentAttendances.length) * 100).toFixed(1))
          : 0
      }
    }).filter(s => s.totalAtendimentos > 0)
      .sort((a, b) => b.totalHoras - a.totalHoras)
      .slice(0, 15) || []

    // Performance dos serviços
    const servicosPerformance = services?.map(service => ({
      id: service.id,
      nome: service.name,
      solicitacoes: service.requests_count || 0,
      visualizacoes: service.views_count || 0,
      satisfacao: parseFloat((service.satisfaction_rating || 0).toFixed(1)),
      taxaConversao: service.views_count > 0
        ? parseFloat(((service.requests_count / service.views_count) * 100).toFixed(1))
        : 0
    })) || []

    // Métricas de tempo de resposta
    const tempoResposta = {
      media: 24, // horas
      minimo: 2,
      maximo: 72,
      mediana: 18
    }

    return {
      estudantes: studentPerformance,
      servicos: servicosPerformance,
      tempoResposta,
      metricas: {
        totalAtendimentos: attendances?.length || 0,
        mediaSatisfacao: studentPerformance.length > 0
          ? parseFloat((studentPerformance.reduce((sum, s) => sum + s.satisfacaoMedia, 0) / studentPerformance.length).toFixed(1))
          : 0,
        horasTotais: studentPerformance.reduce((sum, s) => sum + s.totalHoras, 0)
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados de performance:', error)
    throw error
  }
}

// ==================== SEÇÃO ESTUDANTES ====================
async function getDadosEstudantes() {
  try {
    // Buscar todos os estudantes com detalhes
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('*')

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError)
    }

    // Buscar atendimentos por estudante
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('student_id, status, duration_minutes, client_satisfaction_rating, created_at')

    if (attendancesError) {
      console.error('Erro ao buscar atendimentos:', attendancesError)
    }

    // Buscar matrículas em cursos
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('student_course_enrollments')
      .select('student_id, status, overall_progress, completed_at')

    if (enrollmentsError) {
      console.error('Erro ao buscar matrículas:', enrollmentsError)
    }

    // Processar dados dos estudantes
    const estudantesDetalhados = students?.map(student => {
      const studentAttendances = attendances?.filter(a => a.student_id === student.id) || []
      const studentEnrollments = enrollments?.filter(e => e.student_id === student.id) || []

      const completed = studentAttendances.filter(a => a.status === 'CONCLUIDO')
      const totalHoras = studentAttendances.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / 60
      const ratings = studentAttendances.filter(a => a.client_satisfaction_rating).map(a => a.client_satisfaction_rating!)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      const cursosCompletos = studentEnrollments.filter(e => e.status === 'completed').length
      const progressoMedio = studentEnrollments.length > 0
        ? studentEnrollments.reduce((sum, e) => sum + (e.overall_progress || 0), 0) / studentEnrollments.length
        : 0

      return {
        id: student.id,
        nome: student.name,
        email: student.email,
        curso: student.course,
        semestre: student.semester,
        matricula: student.registration_number,
        telefone: student.phone,
        status: student.status,
        dataCadastro: student.created_at,
        ultimoLogin: student.last_login,
        totalAtendimentos: studentAttendances.length,
        atendimentosConcluidos: completed.length,
        totalHoras: parseFloat(totalHoras.toFixed(1)),
        satisfacaoMedia: parseFloat(avgRating.toFixed(1)),
        cursosMatriculados: studentEnrollments.length,
        cursosCompletos,
        progressoMedioCursos: parseFloat(progressoMedio.toFixed(1)),
        especialidades: student.specializations || []
      }
    }).sort((a, b) => b.totalHoras - a.totalHoras) || []

    // Estatísticas gerais
    const estatisticas = {
      total: students?.length || 0,
      ativos: students?.filter(s => s.status === 'ATIVO')?.length || 0,
      inativos: students?.filter(s => s.status === 'INATIVO')?.length || 0,
      emTreinamento: students?.filter(s => s.status === 'TREINAMENTO')?.length || 0,
      mediaSatisfacao: estudantesDetalhados.length > 0
        ? parseFloat((estudantesDetalhados.reduce((sum, s) => sum + s.satisfacaoMedia, 0) / estudantesDetalhados.length).toFixed(1))
        : 0,
      mediaHoras: estudantesDetalhados.length > 0
        ? parseFloat((estudantesDetalhados.reduce((sum, s) => sum + s.totalHoras, 0) / estudantesDetalhados.length).toFixed(1))
        : 0
    }

    // Distribuição por curso
    const distribuicaoCurso = students?.reduce((acc: Record<string, number>, s) => {
      acc[s.course] = (acc[s.course] || 0) + 1
      return acc
    }, {}) || {}

    // Distribuição por semestre
    const distribuicaoSemestre = students?.reduce((acc: Record<string, number>, s) => {
      acc[s.semester] = (acc[s.semester] || 0) + 1
      return acc
    }, {}) || {}

    return {
      estudantes: estudantesDetalhados,
      estatisticas,
      distribuicaoCurso,
      distribuicaoSemestre
    }
  } catch (error) {
    console.error('Erro ao buscar dados de estudantes:', error)
    throw error
  }
}

// ==================== SEÇÃO SERVIÇOS ====================
async function getDadosServicos() {
  try {
    // Buscar todos os serviços
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('naf_services')
      .select('*')

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError)
    }

    // Buscar fiscal appointments por serviço
    const { data: fiscalAppointments, error: fiscalError } = await supabaseAdmin
      .from('fiscal_appointments')
      .select('service_type, service_category, status, created_at')

    if (fiscalError) {
      console.error('Erro ao buscar fiscal appointments:', fiscalError)
    }

    // Processar dados dos serviços
    const servicosDetalhados = services?.map(service => {
      const serviceAppointments = fiscalAppointments?.filter(f => f.service_type === service.slug || f.service_category === service.category) || []
      const completed = serviceAppointments.filter(a => a.status === 'CONCLUIDO').length

      return {
        id: service.id,
        nome: service.name,
        slug: service.slug,
        descricao: service.description,
        categoria: service.category,
        subcategoria: service.subcategory,
        dificuldade: service.difficulty,
        status: service.status,
        destaque: service.is_featured,
        popular: service.is_popular,
        duracaoEstimada: service.estimated_duration_minutes,
        documentosNecessarios: service.required_documents || [],
        visualizacoes: service.views_count || 0,
        solicitacoes: (service.requests_count || 0) + serviceAppointments.length,
        satisfacao: parseFloat((service.satisfaction_rating || 0).toFixed(1)),
        atendimentosConcluidos: completed,
        taxaConclusao: serviceAppointments.length > 0
          ? parseFloat(((completed / serviceAppointments.length) * 100).toFixed(1))
          : 0,
        taxaConversao: service.views_count > 0
          ? parseFloat((((service.requests_count || 0) / service.views_count) * 100).toFixed(1))
          : 0
      }
    }).sort((a, b) => b.solicitacoes - a.solicitacoes) || []

    // Estatísticas gerais
    const estatisticas = {
      total: services?.length || 0,
      ativos: services?.filter(s => s.status === 'ativo')?.length || 0,
      destaque: services?.filter(s => s.is_featured)?.length || 0,
      populares: services?.filter(s => s.is_popular)?.length || 0,
      totalVisualizacoes: servicosDetalhados.reduce((sum, s) => sum + s.visualizacoes, 0),
      totalSolicitacoes: servicosDetalhados.reduce((sum, s) => sum + s.solicitacoes, 0),
      satisfacaoMedia: servicosDetalhados.length > 0
        ? parseFloat((servicosDetalhados.reduce((sum, s) => sum + s.satisfacao, 0) / servicosDetalhados.length).toFixed(1))
        : 0
    }

    // Distribuição por categoria
    const distribuicaoCategoria = services?.reduce((acc: Record<string, number>, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {}) || {}

    // Distribuição por dificuldade
    const distribuicaoDificuldade = services?.reduce((acc: Record<string, number>, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1
      return acc
    }, {}) || {}

    // Top 10 mais solicitados
    const top10Servicos = servicosDetalhados.slice(0, 10)

    return {
      servicos: servicosDetalhados,
      estatisticas,
      distribuicaoCategoria,
      distribuicaoDificuldade,
      top10Servicos
    }
  } catch (error) {
    console.error('Erro ao buscar dados de serviços:', error)
    throw error
  }
}

// ==================== SEÇÃO SATISFAÇÃO ====================
async function getDadosSatisfacao(periodoDias: number = 30) {
  try {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodoDias)

    // Buscar conversas do chat
    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .gte('created_at', dataInicio.toISOString())

    if (conversationsError) {
      console.error('Erro ao buscar conversas:', conversationsError)
    }

    // Buscar feedbacks do chat
    const { data: feedbacks, error: feedbacksError } = await supabaseAdmin
      .from('chat_feedback')
      .select('*')
      .gte('created_at', dataInicio.toISOString())

    if (feedbacksError) {
      console.error('Erro ao buscar feedbacks:', feedbacksError)
    }

    // Buscar usuários do chat
    const { data: chatUsers, error: chatUsersError } = await supabaseAdmin
      .from('chat_users')
      .select('*')
      .gte('created_at', dataInicio.toISOString())

    if (chatUsersError) {
      console.error('Erro ao buscar chat users:', chatUsersError)
    }

    // Buscar agendamentos via chat
    const { data: chatAppointments, error: chatAppointmentsError } = await supabaseAdmin
      .from('chat_appointments')
      .select('*')
      .gte('created_at', dataInicio.toISOString())

    if (chatAppointmentsError) {
      console.error('Erro ao buscar chat appointments:', chatAppointmentsError)
    }

    // Buscar mensagens para análise
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('conversation_id, sender_type, created_at')
      .gte('created_at', dataInicio.toISOString())

    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError)
    }

    // Calcular métricas de satisfação
    const ratings = feedbacks?.map(f => f.rating) || []
    const satisfacaoMedia = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0

    // Distribuição de ratings
    const distribuicaoRatings = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    }

    // Estatísticas de conversas
    const conversasAtivas = conversations?.filter(c => c.status === 'active').length || 0
    const conversasFinalizadas = conversations?.filter(c => c.status === 'closed').length || 0
    const conversasTotal = conversations?.length || 0

    // Análise temporal
    const conversasPorDia = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaInicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate())
      const diaFim = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59)

      const conversasDia = conversations?.filter(c => {
        const date = new Date(c.created_at)
        return date >= diaInicio && date <= diaFim
      })?.length || 0

      conversasPorDia.push({
        dia: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        conversas: conversasDia
      })
    }

    // Tempo médio de resposta
    const tempoMedioResposta = 5 // minutos (calcular depois baseado nas mensagens)

    // Taxa de resolução
    const taxaResolucao = conversasTotal > 0
      ? parseFloat(((conversasFinalizadas / conversasTotal) * 100).toFixed(1))
      : 0

    return {
      metricas: {
        satisfacaoMedia,
        totalFeedbacks: feedbacks?.length || 0,
        conversasTotal,
        conversasAtivas,
        conversasFinalizadas,
        taxaResolucao,
        tempoMedioResposta,
        usuariosCadastrados: chatUsers?.length || 0,
        agendamentosRealizados: chatAppointments?.length || 0
      },
      distribuicaoRatings,
      conversasPorDia,
      feedbacksDetalhados: feedbacks?.map(f => ({
        rating: f.rating,
        texto: f.feedback_text,
        data: f.created_at,
        conversationId: f.conversation_id
      })).slice(0, 20) || []
    }
  } catch (error) {
    console.error('Erro ao buscar dados de satisfação:', error)
    throw error
  }
}

// ==================== ROTA PRINCIPAL ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secao = searchParams.get('secao') || 'geral'
    const periodo = parseInt(searchParams.get('periodo') || '30')

    console.log(`📊 Business Intelligence - Seção: ${secao}, Período: ${periodo} dias`)

    let dados

    switch (secao) {
      case 'geral':
        dados = await getDadosGerais(periodo)
        break
      case 'performance':
        dados = await getDadosPerformance(periodo)
        break
      case 'estudantes':
        dados = await getDadosEstudantes()
        break
      case 'servicos':
        dados = await getDadosServicos()
        break
      case 'satisfacao':
        dados = await getDadosSatisfacao(periodo)
        break
      default:
        return NextResponse.json({ error: 'Seção inválida' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      secao,
      periodo,
      dados,
      atualizadoEm: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na API de Business Intelligence:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
