import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ReportFilters {
  period?: string // 7d|30d|90d|365d|all
  startDate?: string
  endDate?: string
  serviceType?: string
  status?: string
  studentId?: string
  category?: string
}

interface ComprehensiveReportData {
  // Relatório Geral
  generalStats: {
    totalAttendances: number
    totalStudents: number
    totalServices: number
    totalFiscalAppointments: number
    completionRate: number
    averageSatisfaction: number
    averageDuration: number
    monthlyGrowth: number
  }

  // Performance
  performanceMetrics: {
    topPerformingServices: unknown[]
    underperformingServices: unknown[]
    studentPerformance: unknown[]
    serviceEfficiency: unknown[]
    satisfactionTrends: unknown[]
  }

  // Estudantes
  studentReports: {
    activeStudents: unknown[]
    studentRankings: unknown[]
    productivityAnalysis: unknown[]
    specialtyDistribution: unknown[]
  }

  // Serviços
  serviceReports: {
    servicePopularity: unknown[]
    serviceEffectiveness: unknown[]
    categoryBreakdown: unknown[]
    demandAnalysis: unknown[]
  }

  // Satisfação
  satisfactionAnalysis: {
    overallSatisfaction: number
    satisfactionByService: unknown[]
    satisfactionByStudent: unknown[]
    satisfactionTrends: unknown[]
    ratingDistribution: unknown[]
  }

  // Power BI Data
  powerBICompatibleData: {
    attendances: unknown[]
    students: unknown[]
    services: unknown[]
    fiscalAppointments: unknown[]
    aggregatedMetrics: unknown[]
  }
}

class AdvancedReportsService {

  async generateComprehensiveReport(filters: ReportFilters = {}): Promise<ComprehensiveReportData> {
    try {
      console.log('🚀 Generating comprehensive report with filters:', filters)

      const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
      const client = hasServiceKey ? supabaseAdmin : supabase

      // Calculate date range
      let startDateISO: string | undefined
      let endDateISO: string | undefined

      if (filters.period && filters.period !== 'all') {
        const now = new Date()
        const days = filters.period === '7d' ? 7 :
                    filters.period === '30d' ? 30 :
                    filters.period === '90d' ? 90 :
                    filters.period === '365d' ? 365 : 30

        startDateISO = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
        endDateISO = now.toISOString()
      } else if (filters.startDate && filters.endDate) {
        startDateISO = filters.startDate
        endDateISO = filters.endDate
      }

      // 1. FETCH ALL DATA
      console.log('📊 Fetching attendances data...')
      let attendancesQuery = client
        .from('attendances')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDateISO) attendancesQuery = attendancesQuery.gte('created_at', startDateISO)
      if (endDateISO) attendancesQuery = attendancesQuery.lte('created_at', endDateISO)
      if (filters.status) attendancesQuery = attendancesQuery.eq('status', filters.status)
      if (filters.category) attendancesQuery = attendancesQuery.eq('service_type', filters.category)

      const { data: attendances, error: attendancesError } = await attendancesQuery

      console.log('👥 Fetching students data...')
      const { data: students, error: studentsError } = await client
        .from('students')
        .select('*')
        .eq('status', 'ATIVO')
        .order('created_at', { ascending: false })

      console.log('🛠️ Fetching services data...')
      const { data: services, error: servicesError } = await client
        .from('naf_services')
        .select('*')
        .eq('status', 'ativo')

      console.log('📋 Fetching fiscal appointments...')
      let fiscalQuery = client
        .from('fiscal_appointments')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDateISO) fiscalQuery = fiscalQuery.gte('created_at', startDateISO)
      if (endDateISO) fiscalQuery = fiscalQuery.lte('created_at', endDateISO)

      const { data: fiscalAppointments, error: fiscalError } = await fiscalQuery

      // Handle errors
      if (attendancesError) console.error('❌ Attendances error:', attendancesError)
      if (studentsError) console.error('❌ Students error:', studentsError)
      if (servicesError) console.error('❌ Services error:', servicesError)
      if (fiscalError) console.error('❌ Fiscal error:', fiscalError)

      // Log data counts
      console.log(`📊 Data fetched - Attendances: ${attendances?.length || 0}, Students: ${students?.length || 0}, Services: ${services?.length || 0}, Fiscal: ${fiscalAppointments?.length || 0}`)

      // 2. PROCESS GENERAL STATISTICS
      console.log('📈 Processing general statistics...')

      // Combinar atendimentos de ambas as tabelas
      const totalAttendancesFromAttendances = attendances?.length || 0
      const totalAttendancesFromFiscal = fiscalAppointments?.length || 0
      const totalAttendances = totalAttendancesFromAttendances + totalAttendancesFromFiscal

      console.log(`📊 Total de Atendimentos: ${totalAttendances} (${totalAttendancesFromAttendances} da tabela attendances + ${totalAttendancesFromFiscal} da tabela fiscal_appointments)`)

      // Contar atendimentos concluídos de ambas as tabelas
      const completedFromAttendances = attendances?.filter(a => a.status === 'CONCLUIDO') || []
      const completedFromFiscal = fiscalAppointments?.filter(fa => fa.status === 'CONCLUIDO') || []
      const totalCompleted = completedFromAttendances.length + completedFromFiscal.length
      const completionRate = totalAttendances > 0 ? (totalCompleted / totalAttendances) * 100 : 0

      console.log(`✅ Atendimentos Concluídos: ${totalCompleted} (${completedFromAttendances.length} attendances + ${completedFromFiscal.length} fiscal)`)

      // Avaliações (só na tabela attendances por enquanto)
      const ratingsData = attendances?.filter(a => a.client_satisfaction_rating && a.client_satisfaction_rating > 0) || []
      const averageSatisfaction = ratingsData.length > 0
        ? ratingsData.reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / ratingsData.length
        : 0

      console.log(`⭐ Satisfação: ${ratingsData.length} avaliações, média ${averageSatisfaction.toFixed(2)}`)

      // Duração média (só na tabela attendances por enquanto)
      const durationData = completedFromAttendances.filter(a => a.duration_minutes)
      const averageDuration = durationData.length > 0
        ? durationData.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / durationData.length
        : 0

      console.log(`⏱️ Duração Média: ${averageDuration.toFixed(0)} min (baseado em ${durationData.length} atendimentos)`)

      // Calculate monthly growth (simplified) - combinar ambas as tabelas
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

      const currentMonthAttendances = attendances?.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length || 0
      const currentMonthFiscal = fiscalAppointments?.filter(fa => new Date(fa.created_at) >= thirtyDaysAgo).length || 0
      const currentMonth = currentMonthAttendances + currentMonthFiscal

      const previousMonthAttendances = attendances?.filter(a => {
        const date = new Date(a.created_at)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      }).length || 0
      const previousMonthFiscal = fiscalAppointments?.filter(fa => {
        const date = new Date(fa.created_at)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      }).length || 0
      const previousMonth = previousMonthAttendances + previousMonthFiscal

      const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

      console.log(`📈 Crescimento: ${monthlyGrowth.toFixed(1)}% (Mês atual: ${currentMonth}, Mês anterior: ${previousMonth})`)

      const generalStats = {
        totalAttendances,
        totalStudents: students?.length || 0,
        totalServices: services?.length || 0,
        totalFiscalAppointments: fiscalAppointments?.length || 0,
        completionRate: Math.round(completionRate * 10) / 10,
        averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
        averageDuration: Math.round(averageDuration),
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
      }

      // 3. PROCESS PERFORMANCE METRICS
      console.log('⚡ Processing performance metrics...')

      // Service performance analysis
      const serviceGroups: Record<string, unknown> = {}
      attendances?.forEach((attendance: unknown) => {
        const serviceType = attendance.service_type || 'OUTROS'
        if (!serviceGroups[serviceType]) {
          serviceGroups[serviceType] = {
            service_name: serviceType,
            requests_count: 0,
            completed_count: 0,
            pending_count: 0,
            ratings: [],
            total_duration: 0,
            duration_count: 0
          }
        }

        serviceGroups[serviceType].requests_count++
        if (attendance.status === 'CONCLUIDO') serviceGroups[serviceType].completed_count++
        if (['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE'].includes(attendance.status)) {
          serviceGroups[serviceType].pending_count++
        }
        if (attendance.client_satisfaction_rating) {
          serviceGroups[serviceType].ratings.push(attendance.client_satisfaction_rating)
        }
        if (attendance.duration_minutes) {
          serviceGroups[serviceType].total_duration += attendance.duration_minutes
          serviceGroups[serviceType].duration_count++
        }
      })

      const processedServices = Object.values(serviceGroups).map((service: unknown) => {
        const avgSatisfaction = service.ratings.length > 0
          ? service.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / service.ratings.length
          : 0
        const avgDuration = service.duration_count > 0 ? service.total_duration / service.duration_count : 0
        const completionRate = service.requests_count > 0 ? (service.completed_count / service.requests_count) * 100 : 0
        const efficiency = avgDuration > 0 ? Math.min((60 / avgDuration) * 100, 100) : 0

        return {
          ...service,
          avg_satisfaction: Math.round(avgSatisfaction * 10) / 10,
          avg_duration: Math.round(avgDuration),
          completion_rate: Math.round(completionRate * 10) / 10,
          efficiency_score: Math.round(efficiency * 10) / 10,
          performance_score: Math.round(((avgSatisfaction * 20) + completionRate + efficiency) / 3 * 10) / 10
        }
      })

      const topPerformingServices = processedServices
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, 10)

      const underperformingServices = processedServices
        .filter(s => s.performance_score < 60)
        .sort((a, b) => a.performance_score - b.performance_score)
        .slice(0, 5)

      // Student performance analysis
      console.log(`👨‍🎓 Processing performance for ${students?.length || 0} students...`)
      const studentPerformanceData = await Promise.all(
        (students || []).map(async (student: unknown) => {
          // Buscar atendimentos da tabela attendances
          const studentAttendances = attendances?.filter(a => a.student_id === student.id) || []

          // Buscar atendimentos da tabela fiscal_appointments usando assigned_student_id
          const studentFiscalAppointments = fiscalAppointments?.filter(fa => fa.assigned_student_id === student.id) || []

          // Combinar ambos os tipos de atendimentos
          const totalAttendances = studentAttendances.length + studentFiscalAppointments.length

          // Contar atendimentos concluídos de ambas as tabelas
          const completedAttendances = studentAttendances.filter(a => a.status === 'CONCLUIDO').length +
                                       studentFiscalAppointments.filter(fa => fa.status === 'CONCLUIDO').length

          // Avaliações só existem na tabela attendances por enquanto
          const studentRatings = studentAttendances.filter(a => a.client_satisfaction_rating && a.client_satisfaction_rating > 0)
          const avgRating = studentRatings.length > 0
            ? studentRatings.reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / studentRatings.length
            : 0

          const weeksActive = Math.max(1, Math.ceil((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)))
          const productivity = totalAttendances / weeksActive

          const performanceData = {
            student_id: student.id,
            student_name: student.name,
            email: student.email,
            course: student.course || 'Não informado',
            semester: student.semester || '-',
            total_attendances: totalAttendances,
            completed_attendances: completedAttendances,
            completion_rate: totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100 * 10) / 10 : 0,
            avg_rating: Math.round(avgRating * 10) / 10,
            productivity_score: Math.round(productivity * 10) / 10,
            performance_level: avgRating >= 4.5 ? 'Excelente' :
                             avgRating >= 4.0 ? 'Muito Bom' :
                             avgRating >= 3.5 ? 'Bom' :
                             avgRating >= 3.0 ? 'Regular' :
                             totalAttendances > 0 ? 'Precisa Melhorar' : 'Sem Avaliações'
          }

          if (totalAttendances > 0) {
            console.log(`   ${student.name}: ${totalAttendances} atendimentos (${studentAttendances.length} attendances + ${studentFiscalAppointments.length} fiscal), ${avgRating.toFixed(1)} ⭐`)
          }

          return performanceData
        })
      )

      const studentsWithAttendances = studentPerformanceData.filter(s => s.total_attendances > 0)
      console.log(`✅ ${studentsWithAttendances.length} estudantes com atendimentos encontrados`)

      const performanceMetrics = {
        topPerformingServices,
        underperformingServices,
        studentPerformance: studentPerformanceData,
        serviceEfficiency: processedServices.sort((a, b) => b.efficiency_score - a.efficiency_score).slice(0, 10),
        satisfactionTrends: [] // Will be populated with trend data
      }

      // 4. STUDENT REPORTS
      console.log('👨‍🎓 Processing student reports...')
      const activeStudentsData = studentPerformanceData.filter(s => s.total_attendances > 0)

      const studentReports = {
        activeStudents: activeStudentsData,
        studentRankings: studentPerformanceData
          .filter(s => s.total_attendances > 0) // Apenas estudantes com atendimentos
          .sort((a, b) => {
            // Ordenar por número de atendimentos, depois por avaliação
            if (b.total_attendances !== a.total_attendances) {
              return b.total_attendances - a.total_attendances
            }
            return b.avg_rating - a.avg_rating
          })
          .slice(0, 20),
        productivityAnalysis: studentPerformanceData
          .filter(s => s.productivity_score > 0)
          .sort((a, b) => b.productivity_score - a.productivity_score)
          .slice(0, 15),
        specialtyDistribution: [] // Service specialties by student
      }

      console.log(`📊 Rankings - Ativos: ${activeStudentsData.length}, Top 20: ${studentReports.studentRankings.length}, Top Produtivos: ${studentReports.productivityAnalysis.length}`)

      // 5. SERVICE REPORTS
      console.log('🛠️ Processing service reports...')
      const serviceReports = {
        servicePopularity: processedServices
          .sort((a, b) => b.requests_count - a.requests_count)
          .slice(0, 15),
        serviceEffectiveness: processedServices
          .sort((a, b) => b.completion_rate - a.completion_rate)
          .slice(0, 10),
        categoryBreakdown: [], // Will be populated with category analysis
        demandAnalysis: processedServices.map(s => ({
          service_name: s.service_name,
          demand_level: s.requests_count > 50 ? 'Alta' :
                       s.requests_count > 20 ? 'Média' : 'Baixa',
          growth_trend: 'Estável', // Simplified
          requests_count: s.requests_count
        }))
      }

      // 6. SATISFACTION ANALYSIS
      console.log('😊 Processing satisfaction analysis...')
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratingsData.filter(a => a.client_satisfaction_rating === rating).length,
        percentage: ratingsData.length > 0
          ? Math.round((ratingsData.filter(a => a.client_satisfaction_rating === rating).length / ratingsData.length) * 100 * 10) / 10
          : 0
      }))

      const satisfactionByService = processedServices
        .filter(s => s.avg_satisfaction > 0)
        .sort((a, b) => b.avg_satisfaction - a.avg_satisfaction)
        .slice(0, 10)

      const satisfactionByStudent = studentPerformanceData
        .filter(s => s.avg_rating > 0)
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, 15)

      const satisfactionAnalysis = {
        overallSatisfaction: averageSatisfaction,
        satisfactionByService,
        satisfactionByStudent,
        satisfactionTrends: [], // Monthly trends
        ratingDistribution
      }

      // 7. POWER BI COMPATIBLE DATA
      console.log('💾 Preparing Power BI data...')
      const powerBICompatibleData = {
        attendances: (attendances || []).slice(0, 5000), // Limit for performance
        students: studentPerformanceData,
        services: processedServices,
        fiscalAppointments: (fiscalAppointments || []).slice(0, 1000),
        aggregatedMetrics: [
          {
            metric_type: 'general_stats',
            data: generalStats,
            generated_at: new Date().toISOString()
          },
          {
            metric_type: 'performance_summary',
            data: {
              top_services: topPerformingServices.slice(0, 5),
              top_students: studentReports.studentRankings.slice(0, 10),
              satisfaction_avg: averageSatisfaction
            },
            generated_at: new Date().toISOString()
          }
        ]
      }

      console.log('✅ Comprehensive report generated successfully')

      return {
        generalStats,
        performanceMetrics,
        studentReports,
        serviceReports,
        satisfactionAnalysis,
        powerBICompatibleData
      }

    } catch (error) {
      console.error('❌ Error generating comprehensive report:', error)
      throw error
    }
  }

  async exportToPDF(data: ComprehensiveReportData, title: string = 'Relatório Completo NAF'): Promise<Uint8Array> {
    try {
      const doc: unknown = new (jsPDF as unknown)('p', 'pt', 'a4')
      const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() }
      const pad = 24

      // Header
      const drawHeader = () => {
        doc.setFillColor(236, 253, 245)
        doc.rect(0, 0, page.w, 80, 'F')
        doc.setFontSize(20)
        doc.setTextColor(16, 185, 129)
        doc.text(title, pad, 40)
        doc.setFontSize(12)
        doc.setTextColor(31, 41, 55)
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pad, 58)
      }

      drawHeader()
      let currentY = 100

      // General Statistics
      doc.setFontSize(16)
      doc.setTextColor(31, 41, 55)
      doc.text('Estatísticas Gerais', pad, currentY)
      currentY += 20

      const generalTable = [
        ['Métrica', 'Valor'],
        ['Total de Atendimentos', data.generalStats.totalAttendances.toString()],
        ['Estudantes Ativos', data.generalStats.totalStudents.toString()],
        ['Serviços Disponíveis', data.generalStats.totalServices.toString()],
        ['Taxa de Conclusão', `${data.generalStats.completionRate}%`],
        ['Satisfação Média', `${data.generalStats.averageSatisfaction}/5`],
        ['Duração Média', `${data.generalStats.averageDuration} min`],
        ['Crescimento Mensal', `${data.generalStats.monthlyGrowth}%`]
      ]

      autoTable(doc, {
        startY: currentY,
        head: [generalTable[0]],
        body: generalTable.slice(1),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      })

      currentY = ((doc as unknown).lastAutoTable?.finalY ?? (currentY + 40)) + 20

      // Top Performing Services
      if (currentY + 100 > page.h - 80) {
        doc.addPage()
        drawHeader()
        currentY = 100
      }

      doc.setFontSize(16)
      doc.text('Top 5 Serviços por Performance', pad, currentY)
      currentY += 20

      const servicesTable = [
        ['Serviço', 'Solicitações', 'Taxa Conclusão', 'Satisfação', 'Score'],
        ...data.performanceMetrics.topPerformingServices.slice(0, 5).map(s => [
          s.service_name,
          s.requests_count.toString(),
          `${s.completion_rate}%`,
          `${s.avg_satisfaction}/5`,
          s.performance_score.toString()
        ])
      ]

      autoTable(doc, {
        startY: currentY,
        head: [servicesTable[0]],
        body: servicesTable.slice(1),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
      })

      currentY = ((doc as unknown).lastAutoTable?.finalY ?? (currentY + 40)) + 20

      // Top Students
      if (currentY + 100 > page.h - 80) {
        doc.addPage()
        drawHeader()
        currentY = 100
      }

      doc.setFontSize(16)
      doc.text('Top 10 Estudantes', pad, currentY)
      currentY += 20

      const studentsTable = [
        ['Estudante', 'Atendimentos', 'Taxa Conclusão', 'Avaliação', 'Nível'],
        ...data.studentReports.studentRankings.slice(0, 10).map(s => [
          s.student_name,
          s.total_attendances.toString(),
          `${Math.round(s.completion_rate)}%`,
          `${s.avg_rating}/5`,
          s.performance_level
        ])
      ]

      autoTable(doc, {
        startY: currentY,
        head: [studentsTable[0]],
        body: studentsTable.slice(1),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] }
      })

      // Add page numbers
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(`Página ${i} de ${pageCount}`, pad, page.h - 24)
      }

      const buffer = doc.output('arraybuffer') as ArrayBuffer
      return new Uint8Array(buffer)

    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw error
    }
  }

  async exportToExcel(data: ComprehensiveReportData): Promise<Buffer> {
    try {
      const workbook = XLSX.utils.book_new()

      // General Stats Sheet
      const generalStatsSheet = XLSX.utils.json_to_sheet([data.generalStats])
      XLSX.utils.book_append_sheet(workbook, generalStatsSheet, 'Estatísticas Gerais')

      // Services Performance Sheet
      const servicesSheet = XLSX.utils.json_to_sheet(data.performanceMetrics.topPerformingServices)
      XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Performance Serviços')

      // Students Performance Sheet
      const studentsSheet = XLSX.utils.json_to_sheet(data.studentReports.studentRankings)
      XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Ranking Estudantes')

      // Satisfaction Analysis Sheet
      const satisfactionSheet = XLSX.utils.json_to_sheet(data.satisfactionAnalysis.ratingDistribution)
      XLSX.utils.book_append_sheet(workbook, satisfactionSheet, 'Análise Satisfação')

      // Power BI Data Sheet
      const powerbiSheet = XLSX.utils.json_to_sheet(data.powerBICompatibleData.aggregatedMetrics)
      XLSX.utils.book_append_sheet(workbook, powerbiSheet, 'Dados Power BI')

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      return buffer

    } catch (error) {
      console.error('Error exporting to Excel:', error)
      throw error
    }
  }
}

const advancedReportsService = new AdvancedReportsService()

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Advanced Coordinator Reports API - Processing request')

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'general'
    const format = searchParams.get('format') || 'json'
    const period = searchParams.get('period') || '30d'

    const rawService = searchParams.get('serviceType') || undefined
    const rawStatus = searchParams.get('status') || undefined
    const rawStudent = searchParams.get('studentId') || undefined
    const rawCategory = searchParams.get('category') || undefined

    const filters: ReportFilters = {
      period,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      serviceType: rawService && rawService.toLowerCase() !== 'all' ? rawService : undefined,
      status: rawStatus && rawStatus.toUpperCase() !== 'ALL' ? rawStatus : undefined,
      studentId: rawStudent && rawStudent.toLowerCase() !== 'all' ? rawStudent : undefined,
      category: rawCategory && rawCategory.toLowerCase() !== 'all' ? rawCategory : undefined
    }

    console.log(`📊 Report type: ${type}, Format: ${format}, Period: ${period}`)

    const reportData = await advancedReportsService.generateComprehensiveReport(filters)

    switch (format) {
      case 'pdf':
        const pdfBuffer = await advancedReportsService.exportToPDF(
          reportData,
          `Relatório ${type === 'general' ? 'Geral' :
                      type === 'performance' ? 'de Performance' :
                      type === 'students' ? 'de Estudantes' :
                      type === 'services' ? 'de Serviços' :
                      type === 'satisfaction' ? 'de Satisfação' : 'Completo'} NAF`
        )
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="relatorio-${type}-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })

      case 'excel':
        const excelBuffer = await advancedReportsService.exportToExcel(reportData)
        return new NextResponse(excelBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx"`
          }
        })

      case 'json':
      default:
        // Return specific section based on type
        let responseData: unknown = {}

        switch (type) {
          case 'general':
            responseData = {
              generalStats: reportData.generalStats,
              summary: {
                topServices: reportData.performanceMetrics.topPerformingServices.slice(0, 5),
                topStudents: reportData.studentReports.studentRankings.slice(0, 5),
                overallSatisfaction: reportData.satisfactionAnalysis.overallSatisfaction
              }
            }
            break
          case 'performance':
            responseData = reportData.performanceMetrics
            break
          case 'students':
            responseData = reportData.studentReports
            break
          case 'services':
            responseData = reportData.serviceReports
            break
          case 'satisfaction':
            responseData = reportData.satisfactionAnalysis
            break
          case 'powerbi':
            responseData = reportData.powerBICompatibleData
            break
          default:
            responseData = reportData
        }

        return NextResponse.json({
          success: true,
          data: responseData,
          metadata: {
            type,
            format,
            period,
            filters,
            generatedAt: new Date().toISOString()
          }
        })
    }

  } catch (error) {
    console.error('❌ Error in Advanced Coordinator Reports API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
