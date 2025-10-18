import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ReportService, ReportData, ReportTemplate } from '@/lib/reportService'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId || decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

async function getStudentReportData(studentId: string): Promise<ReportData> {
  try {
    // Buscar informações do estudante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      throw new Error('Estudante não encontrado')
    }

    // Buscar atendimentos regulares
    const { data: attendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })

    if (attendancesError) {
      console.error('Erro ao buscar atendimentos:', attendancesError)
    }

    // Buscar atendimentos fiscais com feedback
    const { data: fiscalAppointments, error: fiscalError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('student_id', studentId)
      .order('appointment_date', { ascending: false })

    if (fiscalError) {
      console.error('Erro ao buscar atendimentos fiscais:', fiscalError)
    }

    // Buscar feedbacks dos atendimentos fiscais
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('fiscal_appointment_feedback')
      .select('*')
      .in('appointment_id', (fiscalAppointments || []).map(a => a.id))

    if (feedbacksError) {
      console.error('Erro ao buscar feedbacks:', feedbacksError)
    }

    // Buscar progresso de treinamentos
    const { data: trainings, error: trainingsError } = await supabase
      .from('student_training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('student_id', studentId)

    if (trainingsError) {
      console.error('Erro ao buscar treinamentos:', trainingsError)
    }

    // Buscar avaliações
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })

    if (evaluationsError) {
      console.error('Erro ao buscar avaliações:', evaluationsError)
    }

    // Calcular estatísticas detalhadas
    const totalAttendances = attendances?.length || 0
    const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const cancelledAttendances = attendances?.filter(a => a.status === 'CANCELADO').length || 0
    const scheduledAttendances = attendances?.filter(a => a.status === 'AGENDADO').length || 0
    const inProgressAttendances = attendances?.filter(a => a.status === 'EM_ANDAMENTO').length || 0
    const noShowAttendances = attendances?.filter(a => a.status === 'NAO_COMPARECEU').length || 0

    const avgRating = attendances?.length ?
      attendances.reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) / attendances.filter(a => a.client_satisfaction_rating).length || 0 : 0

    const totalFiscalAppointments = fiscalAppointments?.length || 0
    const completedFiscalAppointments = fiscalAppointments?.filter(a => a.status === 'CONCLUIDO' || a.status === 'FINALIZADO').length || 0

    const completedTrainings = trainings?.filter(t => t.is_completed).length || 0
    const totalTrainings = trainings?.length || 0

    const avgPerformanceScore = evaluations?.length ?
      evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length : 0

    // Calcular média de feedbacks
    const totalFeedbacks = feedbacks?.length || 0
    const avgFeedbackRating = feedbacks?.length ?
      feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length : 0

    const successRate = totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0
    const fiscalSuccessRate = totalFiscalAppointments > 0 ? Math.round((completedFiscalAppointments / totalFiscalAppointments) * 100) : 0

    // Preparar dados do relatório
    const reportData: ReportData = {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        semester: student.semester,
        registrationNumber: student.registration_number || 'N/A',
        university: student.university || 'N/A'
      },
      stats: {
        totalAttendances,
        completedAttendances,
        cancelledAttendances,
        scheduledAttendances,
        inProgressAttendances,
        noShowAttendances,
        successRate,
        avgRating,
        avgPerformanceScore,
        completedTrainings,
        totalTrainings,
        totalFeedbacks,
        avgFeedbackRating
      },
      attendances: attendances?.map(att => ({
        id: att.id,
        protocol: att.protocol,
        client_name: att.client_name,
        service_type: att.service_type,
        status: att.status,
        scheduled_date: att.scheduled_date,
        scheduled_time: att.scheduled_time,
        urgency: att.urgency,
        is_online: att.is_online,
        client_satisfaction_rating: att.client_satisfaction_rating,
        feedback: att.feedback || undefined
      })) || [],
      fiscalAppointments: fiscalAppointments?.map(fiscal => {
        const appointmentFeedback = feedbacks?.find(f => f.appointment_id === fiscal.id)
        return {
          id: fiscal.id,
          protocol: fiscal.protocol,
          client_name: fiscal.client_name,
          service_description: fiscal.service_description,
          status: fiscal.status,
          appointment_date: fiscal.appointment_date,
          student_name: student.name,
          feedback: appointmentFeedback ? {
            rating: appointmentFeedback.rating || 0,
            comment: appointmentFeedback.comment || '',
            strengths: appointmentFeedback.strengths ? JSON.parse(appointmentFeedback.strengths) : [],
            improvements: appointmentFeedback.improvements ? JSON.parse(appointmentFeedback.improvements) : []
          } : undefined
        }
      }) || [],
      trainings: trainings?.map(training => ({
        id: training.training_id,
        title: training.training?.title || 'N/A',
        difficulty: training.training?.difficulty || 'N/A',
        duration_minutes: training.training?.duration_minutes || 0,
        is_completed: training.is_completed,
        score: training.score,
        completed_at: training.completed_at
      })) || [],
      evaluations: evaluations?.map(evaluation => ({
        evaluation_date: evaluation.evaluation_date,
        technical_score: evaluation.technical_score,
        communication_score: evaluation.communication_score,
        punctuality_score: evaluation.punctuality_score,
        professionalism_score: evaluation.professionalism_score,
        overall_score: evaluation.overall_score,
        feedback: evaluation.feedback || ''
      })) || []
    }

    return reportData
  } catch (error) {
    console.error('Erro ao obter dados do relatório:', error)
    throw error
  }
}

function createTemplate(templateType: string = 'complete'): ReportTemplate {
  const templates: { [key: string]: ReportTemplate } = {
    complete: {
      title: 'Relatório Completo de Desempenho do Estudante',
      subtitle: 'Sistema NAF - Núcleo de Apoio Contábil e Fiscal',
      includeSummary: true,
      includeAttendances: true,
      includeTrainings: true,
      includeEvaluations: true,
      includeCharts: false
    },
    performance: {
      title: 'Relatório de Performance',
      subtitle: 'Análise de Desempenho - Sistema NAF',
      includeSummary: true,
      includeAttendances: false,
      includeTrainings: true,
      includeEvaluations: true,
      includeCharts: true
    },
    attendances: {
      title: 'Relatório de Atendimentos',
      subtitle: 'Histórico Detalhado de Atendimentos - Sistema NAF',
      includeSummary: true,
      includeAttendances: true,
      includeTrainings: false,
      includeEvaluations: false,
      includeCharts: false
    },
    trainings: {
      title: 'Relatório de Treinamentos',
      subtitle: 'Progresso em Capacitação - Sistema NAF',
      includeSummary: false,
      includeAttendances: false,
      includeTrainings: true,
      includeEvaluations: false,
      includeCharts: false
    }
  }

  return templates[templateType] || templates.complete
}

async function saveReportHistory(
  studentId: string,
  studentName: string,
  studentEmail: string,
  reportData: ReportData,
  reportType: 'quick' | 'custom',
  template: string,
  format: string,
  customTemplate: ReportTemplate | null,
  fileSize: number
) {
  try {
    console.log('📊 Salvando histórico de relatório:', {
      studentId,
      studentName,
      reportType,
      template,
      format,
      fileSize
    })

    // Gerar um ID único usando timestamp + random
    const generateId = () => {
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 15)
      return `${timestamp}-${randomStr}`
    }

    const historyData = {
      id: generateId(),
      student_id: studentId,
      student_name: studentName,
      student_email: studentEmail,
      report_type: reportType,
      template: template,
      format: format,
      custom_template: customTemplate,
      stats: reportData.stats,
      total_attendances: reportData.stats.totalAttendances,
      completed_attendances: reportData.stats.completedAttendances,
      total_trainings: reportData.stats.totalTrainings,
      completed_trainings: reportData.stats.completedTrainings,
      success_rate: reportData.stats.successRate,
      avg_rating: reportData.stats.avgRating,
      file_size: fileSize
    }

    const { data, error } = await supabase
      .from('report_history')
      .insert(historyData)
      .select()

    if (error) {
      console.error('❌ Erro ao salvar histórico do relatório:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      console.log('✅ Histórico de relatório salvo com sucesso:', data)
    }
  } catch (error) {
    console.error('❌ Exceção ao salvar histórico do relatório:', error)
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'
    const templateType = searchParams.get('template') || 'complete'

    // Validar formato
    const validFormats = ['pdf', 'docx', 'csv', 'excel', 'txt', 'json']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { message: `Formato inválido. Use: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Obter dados do relatório
    const reportData = await getStudentReportData(studentAuth.studentId)
    const template = createTemplate(templateType)

    let blob: Blob
    let contentType: string
    let filename: string

    // Gerar relatório no formato solicitado
    switch (format) {
      case 'pdf':
        blob = await ReportService.generatePDF(reportData, template)
        contentType = 'application/pdf'
        filename = `relatorio-${templateType}-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
        break

      case 'docx':
        blob = await ReportService.generateDOCX(reportData, template)
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        filename = `relatorio-${templateType}-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`
        break

      case 'csv':
        blob = await ReportService.generateCSV(reportData)
        contentType = 'text/csv;charset=utf-8'
        filename = `relatorio-${templateType}-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'excel':
        blob = await ReportService.generateExcel(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `relatorio-${templateType}-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`
        break

      case 'txt':
        blob = await ReportService.generateTXT(reportData, template)
        contentType = 'text/plain;charset=utf-8'
        filename = `relatorio-${templateType}-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
        break

      case 'json':
        return NextResponse.json({
          success: true,
          data: reportData,
          template: template,
          generatedAt: new Date().toISOString(),
          metadata: {
            studentId: studentAuth.studentId,
            format,
            templateType
          }
        })

      default:
        return NextResponse.json(
          { message: 'Formato não suportado' },
          { status: 400 }
        )
    }

    // Converter blob para buffer
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Salvar histórico do relatório
    await saveReportHistory(
      studentAuth.studentId,
      reportData.student.name,
      reportData.student.email,
      reportData,
      'quick',
      templateType,
      format,
      null,
      buffer.length
    )

    // Retornar arquivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório avançado:', error)
    return NextResponse.json(
      {
        message: 'Erro interno do servidor ao gerar relatório',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Obter dados do corpo da requisição
    const body = await request.json()
    const { format = 'pdf', template: customTemplate } = body

    // Usar template customizado se fornecido
    const template = customTemplate || createTemplate('complete')

    // Validar formato
    const validFormats = ['pdf', 'docx', 'csv', 'excel', 'txt', 'json']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { message: `Formato inválido. Use: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Obter dados do relatório
    const reportData = await getStudentReportData(studentAuth.studentId)

    let blob: Blob
    let contentType: string
    let filename: string

    // Gerar relatório no formato solicitado
    switch (format) {
      case 'pdf':
        blob = await ReportService.generatePDF(reportData, template)
        contentType = 'application/pdf'
        filename = `relatorio-customizado-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
        break

      case 'docx':
        blob = await ReportService.generateDOCX(reportData, template)
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        filename = `relatorio-customizado-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`
        break

      case 'csv':
        blob = await ReportService.generateCSV(reportData)
        contentType = 'text/csv;charset=utf-8'
        filename = `relatorio-customizado-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'excel':
        blob = await ReportService.generateExcel(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `relatorio-customizado-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`
        break

      case 'txt':
        blob = await ReportService.generateTXT(reportData, template)
        contentType = 'text/plain;charset=utf-8'
        filename = `relatorio-customizado-${reportData.student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
        break

      case 'json':
        return NextResponse.json({
          success: true,
          data: reportData,
          template: template,
          generatedAt: new Date().toISOString(),
          metadata: {
            studentId: studentAuth.studentId,
            format,
            isCustom: true
          }
        })

      default:
        return NextResponse.json(
          { message: 'Formato não suportado' },
          { status: 400 }
        )
    }

    // Converter blob para buffer
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Salvar histórico do relatório customizado
    await saveReportHistory(
      studentAuth.studentId,
      reportData.student.name,
      reportData.student.email,
      reportData,
      'custom',
      customTemplate ? 'custom' : 'complete',
      format,
      customTemplate,
      buffer.length
    )

    // Retornar arquivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório customizado:', error)
    return NextResponse.json(
      {
        message: 'Erro interno do servidor ao gerar relatório customizado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}