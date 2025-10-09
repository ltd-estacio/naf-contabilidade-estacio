import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ReportData {
  attendances: unknown[]
  students: unknown[]
  services: unknown[]
  conversations: unknown[]
  appointments: unknown[]
  performance: unknown[]
  activity_logs: unknown[]
}

interface ReportMetrics {
  totalAttendances: number
  totalStudents: number
  totalConversations: number
  avgSatisfaction: number
  completionRate: number
  monthlyGrowth: number
  activeStudents: number
  chatEngagement: number
}

interface ChartData {
  attendancesByDay: Array<{ day: string; count: number }>
  servicesByCategory: Array<{ category: string; count: number; percentage: number }>
  studentsByMonth: Array<{ month: string; new: number; active: number }>
  satisfactionTrend: Array<{ date: string; rating: number }>
  topServices: Array<{ name: string; requests: number; completion: number }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'general'
    const format = searchParams.get('format') || 'json'
    const period = searchParams.get('period') || '30'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    console.log(`📊 Generating ${type} report in ${format} format for last ${period} days`)

    // Fetch data from Supabase
    const reportData = await fetchReportData(startDate, endDate)

    // Generate metrics
    const metrics = calculateMetrics(reportData)

    // Generate charts data
    const charts = generateChartsData(reportData)

    const report = {
      type,
      period: `${period} days`,
      generatedAt: new Date().toISOString(),
      data: reportData,
      metrics,
      charts,
      summary: {
        title: getReportTitle(type),
        description: getReportDescription(type),
        insights: generateInsights(reportData, metrics)
      }
    }

    // Return different formats
    switch (format) {
      case 'csv':
        return generateCSVReport(report)
      case 'pdf':
        return generatePDFReport(report)
      case 'excel':
        return generateExcelReport(report)
      case 'powerbi':
        return generatePowerBIData(report)
      default:
        return NextResponse.json(report)
    }

  } catch (error) {
    console.error('❌ Error generating report:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}

async function fetchReportData(startDate: Date, endDate: Date): Promise<ReportData> {
  try {
    // Fetch students data
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (studentsError) {
      console.log('⚠️ Students query error (using mock):', studentsError)
    }

    // Fetch chat conversations
    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from('chat_conversations')
      .select(`
        *,
        messages:chat_messages(*)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (conversationsError) {
      console.log('⚠️ Conversations query error (using mock):', conversationsError)
    }

    // Fetch student performance
    const { data: performance, error: performanceError } = await supabaseAdmin
      .from('student_performance')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (performanceError) {
      console.log('⚠️ Performance query error (using mock):', performanceError)
    }

    // Fetch activity logs
    const { data: activity_logs, error: activityError } = await supabaseAdmin
      .from('student_activity_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (activityError) {
      console.log('⚠️ Activity logs query error (using mock):', activityError)
    }

    // Generate mock data for missing tables
    const mockAttendances = generateMockAttendances(50)
    const mockServices = generateMockServices()
    const mockAppointments = generateMockAppointments(30)

    return {
      attendances: mockAttendances,
      students: students || [],
      services: mockServices,
      conversations: conversations || [],
      appointments: mockAppointments,
      performance: performance || [],
      activity_logs: activity_logs || []
    }

  } catch (error) {
    console.error('Error fetching report data:', error)

    // Return comprehensive mock data if database fails
    return {
      attendances: generateMockAttendances(50),
      students: generateMockStudents(25),
      services: generateMockServices(),
      conversations: generateMockConversations(15),
      appointments: generateMockAppointments(30),
      performance: generateMockPerformance(25),
      activity_logs: generateMockActivityLogs(100)
    }
  }
}

function calculateMetrics(data: ReportData): ReportMetrics {
  const totalAttendances = data.attendances.length
  const totalStudents = data.students.length
  const totalConversations = data.conversations.length

  // Calculate average satisfaction
  const satisfactionRatings = data.attendances
    .filter(a => a.rating)
    .map(a => a.rating)
  const avgSatisfaction = satisfactionRatings.length > 0
    ? satisfactionRatings.reduce((a, b) => a + b, 0) / satisfactionRatings.length
    : 4.5

  // Calculate completion rate
  const completedAttendances = data.attendances.filter(a => a.status === 'COMPLETED').length
  const completionRate = totalAttendances > 0 ? (completedAttendances / totalAttendances) * 100 : 85

  // Calculate monthly growth (mock calculation)
  const monthlyGrowth = 12.5

  // Calculate active students
  const activeStudents = data.activity_logs
    .filter(log => {
      const logDate = new Date(log.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return logDate >= weekAgo
    })
    .map(log => log.student_id)
    .filter((value, index, self) => self.indexOf(value) === index).length

  // Calculate chat engagement
  const totalMessages = data.conversations.reduce((total, conv) => {
    return total + (conv.messages?.length || 0)
  }, 0)
  const chatEngagement = totalConversations > 0 ? totalMessages / totalConversations : 0

  return {
    totalAttendances,
    totalStudents,
    totalConversations,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10,
    monthlyGrowth,
    activeStudents,
    chatEngagement: Math.round(chatEngagement * 10) / 10
  }
}

function generateChartsData(data: ReportData): ChartData {
  // Attendances by day of week
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const attendancesByDay = dayNames.map((day, index) => ({
    day,
    count: data.attendances.filter(a => new Date(a.created_at).getDay() === index).length
  }))

  // Services by category
  const serviceCategories = ['Tributário', 'Empresarial', 'Trabalhista', 'Previdenciário']
  const servicesByCategory = serviceCategories.map(category => {
    const count = data.services.filter(s => s.category === category).length
    return {
      category,
      count,
      percentage: data.services.length > 0 ? Math.round((count / data.services.length) * 100) : 0
    }
  })

  // Students by month (last 6 months)
  const studentsByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })

    return {
      month: monthName,
      new: Math.floor(Math.random() * 10) + 3,
      active: Math.floor(Math.random() * 20) + 8
    }
  }).reverse()

  // Satisfaction trend (last 30 days)
  const satisfactionTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split('T')[0],
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10
    }
  }).reverse()

  // Top services
  const topServices = data.services
    .sort((a, b) => b.requests_count - a.requests_count)
    .slice(0, 5)
    .map(service => ({
      name: service.service_name,
      requests: service.requests_count,
      completion: Math.round((service.completed_count / service.requests_count) * 100)
    }))

  return {
    attendancesByDay,
    servicesByCategory,
    studentsByMonth,
    satisfactionTrend,
    topServices
  }
}

function generateInsights(data: ReportData, metrics: ReportMetrics): string[] {
  const insights = []

  if (metrics.completionRate > 90) {
    insights.push('🎯 Excelente taxa de conclusão de atendimentos (acima de 90%)')
  } else if (metrics.completionRate < 70) {
    insights.push('⚠️ Taxa de conclusão baixa - requer atenção especial')
  }

  if (metrics.avgSatisfaction >= 4.5) {
    insights.push('⭐ Alta satisfação dos clientes - mantenha o padrão de qualidade')
  }

  if (metrics.activeStudents > metrics.totalStudents * 0.8) {
    insights.push('📈 Alto engajamento dos estudantes - ótima participação')
  }

  if (metrics.chatEngagement > 5) {
    insights.push('💬 Sistema de chat muito ativo - boa interação com clientes')
  }

  if (metrics.monthlyGrowth > 10) {
    insights.push('🚀 Crescimento mensal acelerado - expandir capacidade se necessário')
  }

  return insights
}

function getReportTitle(type: string): string {
  const titles = {
    general: 'Relatório Geral do NAF',
    performance: 'Relatório de Performance',
    students: 'Relatório de Estudantes',
    services: 'Relatório de Serviços',
    satisfaction: 'Relatório de Satisfação',
    financial: 'Relatório Financeiro'
  }
  return titles[type] || 'Relatório Personalizado'
}

function getReportDescription(type: string): string {
  const descriptions = {
    general: 'Visão completa de todas as atividades e métricas do NAF',
    performance: 'Análise detalhada do desempenho de estudantes e serviços',
    students: 'Estatísticas e métricas específicas dos estudantes',
    services: 'Performance e utilização dos serviços oferecidos',
    satisfaction: 'Avaliação da satisfação e qualidade do atendimento',
    financial: 'Análise financeira e de custos operacionais'
  }
  return descriptions[type] || 'Relatório customizado conforme solicitação'
}

async function generateCSVReport(report: unknown): Promise<NextResponse> {
  const csvData = []

  // Add metrics as CSV rows
  csvData.push(['Métrica', 'Valor'])
  csvData.push(['Total de Atendimentos', report.metrics.totalAttendances])
  csvData.push(['Total de Estudantes', report.metrics.totalStudents])
  csvData.push(['Satisfação Média', report.metrics.avgSatisfaction])
  csvData.push(['Taxa de Conclusão (%)', report.metrics.completionRate])
  csvData.push(['Crescimento Mensal (%)', report.metrics.monthlyGrowth])

  const csvContent = csvData.map(row => row.join(',')).join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=relatorio-naf.csv'
    }
  })
}

async function generatePDFReport(report: unknown): Promise<NextResponse> {
  // Mock PDF generation - in production would use a PDF library
  const pdfContent = `
    Relatório NAF - ${report.summary.title}

    Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}
    Período: ${report.period}

    MÉTRICAS PRINCIPAIS:
    - Total de Atendimentos: ${report.metrics.totalAttendances}
    - Total de Estudantes: ${report.metrics.totalStudents}
    - Satisfação Média: ${report.metrics.avgSatisfaction}/5.0
    - Taxa de Conclusão: ${report.metrics.completionRate}%

    INSIGHTS:
    ${report.summary.insights.join('\n')}
  `

  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=relatorio-naf.pdf'
    }
  })
}

async function generateExcelReport(report: unknown): Promise<NextResponse> {
  // Mock Excel generation - in production would use exceljs or similar
  const excelData = {
    worksheets: [
      {
        name: 'Métricas',
        data: [
          ['Métrica', 'Valor'],
          ['Total de Atendimentos', report.metrics.totalAttendances],
          ['Total de Estudantes', report.metrics.totalStudents],
          ['Satisfação Média', report.metrics.avgSatisfaction],
          ['Taxa de Conclusão (%)', report.metrics.completionRate]
        ]
      },
      {
        name: 'Gráficos',
        data: report.charts.attendancesByDay.map(item => [item.day, item.count])
      }
    ]
  }

  return NextResponse.json(excelData, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=relatorio-naf.xlsx'
    }
  })
}

async function generatePowerBIData(report: unknown): Promise<NextResponse> {
  // Format data specifically for Power BI consumption
  const powerBIData = {
    tables: [
      {
        name: 'Metrics',
        columns: [
          { name: 'MetricName', dataType: 'String' },
          { name: 'Value', dataType: 'Double' },
          { name: 'Date', dataType: 'DateTime' }
        ],
        rows: [
          ['TotalAttendances', report.metrics.totalAttendances, report.generatedAt],
          ['TotalStudents', report.metrics.totalStudents, report.generatedAt],
          ['AvgSatisfaction', report.metrics.avgSatisfaction, report.generatedAt],
          ['CompletionRate', report.metrics.completionRate, report.generatedAt]
        ]
      },
      {
        name: 'DailyAttendances',
        columns: [
          { name: 'Day', dataType: 'String' },
          { name: 'Count', dataType: 'Int64' },
          { name: 'Date', dataType: 'DateTime' }
        ],
        rows: report.charts.attendancesByDay.map(item => [
          item.day,
          item.count,
          report.generatedAt
        ])
      },
      {
        name: 'ServicePerformance',
        columns: [
          { name: 'ServiceName', dataType: 'String' },
          { name: 'Requests', dataType: 'Int64' },
          { name: 'Completion', dataType: 'Double' },
          { name: 'Date', dataType: 'DateTime' }
        ],
        rows: report.charts.topServices.map(service => [
          service.name,
          service.requests,
          service.completion,
          report.generatedAt
        ])
      }
    ],
    metadata: {
      title: report.summary.title,
      description: report.summary.description,
      generatedAt: report.generatedAt,
      period: report.period
    }
  }

  return NextResponse.json(powerBIData)
}

// Mock data generators
function generateMockAttendances(count: number) {
  const services = ['Declaração IR', 'Orientação MEI', 'Consulta Tributária', 'CNPJ', 'Simples Nacional']
  const statuses = ['COMPLETED', 'PENDING', 'IN_PROGRESS', 'CANCELLED']

  return Array.from({ length: count }, (_, i) => ({
    id: `attendance-${i + 1}`,
    student_id: `student-${Math.floor(Math.random() * 20) + 1}`,
    service_name: services[Math.floor(Math.random() * services.length)],
    client_name: `Cliente ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    duration_minutes: Math.floor(Math.random() * 90) + 30,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockStudents(count: number) {
  const courses = ['Ciências Contábeis', 'Administração', 'Economia', 'Direito']

  return Array.from({ length: count }, (_, i) => ({
    id: `student-${i + 1}`,
    name: `Estudante ${i + 1}`,
    email: `estudante${i + 1}@naf.edu.br`,
    course: courses[Math.floor(Math.random() * courses.length)],
    semester: Math.floor(Math.random() * 8) + 1,
    total_attendances: Math.floor(Math.random() * 20) + 5,
    avg_rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockServices() {
  return [
    {
      service_name: 'Declaração de Imposto de Renda',
      category: 'Tributário',
      requests_count: 45,
      completed_count: 38,
      avg_rating: 4.8
    },
    {
      service_name: 'Orientação MEI',
      category: 'Empresarial',
      requests_count: 32,
      completed_count: 28,
      avg_rating: 4.5
    },
    {
      service_name: 'Consulta Tributária',
      category: 'Tributário',
      requests_count: 28,
      completed_count: 25,
      avg_rating: 4.6
    }
  ]
}

function generateMockConversations(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `conversation-${i + 1}`,
    user_id: `user-${i + 1}`,
    user_name: `Cliente ${i + 1}`,
    status: Math.random() > 0.7 ? 'active' : 'completed',
    messages: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, j) => ({
      id: `message-${i}-${j}`,
      content: `Mensagem ${j + 1}`,
      sender_type: j % 2 === 0 ? 'user' : 'coordinator',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })),
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockAppointments(count: number) {
  const services = ['Declaração IR', 'Orientação MEI', 'Consulta CNPJ', 'Simples Nacional']
  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  return Array.from({ length: count }, (_, i) => ({
    id: `appointment-${i + 1}`,
    protocol: `NAF-2025-${String(i + 1).padStart(3, '0')}`,
    client_name: `Cliente ${i + 1}`,
    service_title: services[Math.floor(Math.random() * services.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    urgency_level: Math.random() > 0.8 ? 'URGENT' : 'NORMAL',
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockPerformance(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `performance-${i + 1}`,
    student_id: `student-${i + 1}`,
    metric_type: 'monthly_summary',
    attendances_count: Math.floor(Math.random() * 15) + 5,
    avg_rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    improvement_score: Math.floor(Math.random() * 40) + 60,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockActivityLogs(count: number) {
  const activities = ['login', 'attendance_start', 'attendance_complete', 'chat_message', 'service_view']

  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i + 1}`,
    student_id: `student-${Math.floor(Math.random() * 25) + 1}`,
    activity_type: activities[Math.floor(Math.random() * activities.length)],
    description: `Atividade ${i + 1}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}
