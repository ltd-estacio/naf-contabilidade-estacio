import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

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
  } catch {
    return null
  }
}

async function generateStudentReport(studentId: string, _format: string = 'json') {
  try {
    // Buscar dados completos do estudante
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    // Buscar todos os atendimentos
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })

    if (attendancesError) throw attendancesError

    // Buscar todos os treinamentos
    const { data: trainings, error: trainingsError } = await supabaseAdmin
      .from('student_training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('student_id', studentId)

    if (trainingsError) throw trainingsError

    // Buscar todas as avaliações
    const { data: evaluations, error: evaluationsError } = await supabaseAdmin
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })

    if (evaluationsError) throw evaluationsError

    // Buscar logs de atividade recentes
    const { data: activityLogs, error: logsError } = await supabaseAdmin
      .from('student_activity_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (logsError) throw logsError

    // Calcular estatísticas detalhadas
    const totalAttendances = attendances?.length || 0
    const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const cancelledAttendances = attendances?.filter(a => a.status === 'CANCELADO').length || 0
    const inProgressAttendances = attendances?.filter(a => a.status === 'EM_ANDAMENTO').length || 0

    const ratingsWithValues = attendances?.filter(a => a.client_satisfaction_rating) || []
    const avgRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / ratingsWithValues.length
      : 0

    const completedTrainings = trainings?.filter(t => t.is_completed).length || 0
    const totalTrainings = trainings?.length || 0
    const avgTrainingScore = trainings?.filter(t => t.is_completed && t.score)
      .reduce((sum, t) => sum + t.score, 0) / (trainings?.filter(t => t.is_completed && t.score).length || 1) || 0

    const avgOverallScore = evaluations?.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
      : 0

    const report = {
      studentInfo: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        semester: student.semester,
        university: student.university,
        registrationNumber: student.registration_number,
        document: student.document,
        specializations: student.specializations || [],
        status: student.status,
        createdAt: student.created_at,
        lastLogin: student.last_login
      },
      performanceStats: {
        totalAttendances,
        completedAttendances,
        cancelledAttendances,
        inProgressAttendances,
        successRate: totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0,
        avgClientRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratingsWithValues.length,
        totalTrainings,
        completedTrainings,
        trainingCompletionRate: totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0,
        avgTrainingScore: Math.round(avgTrainingScore * 10) / 10,
        avgPerformanceScore: Math.round(avgOverallScore * 100) / 100,
        totalEvaluations: evaluations?.length || 0
      },
      attendancesDetails: attendances?.map(a => ({
        protocol: a.protocol,
        clientName: a.client_name,
        clientCategory: a.client_category,
        serviceType: a.service_type,
        scheduledDate: a.scheduled_date,
        scheduledTime: a.scheduled_time,
        status: a.status,
        urgency: a.urgency,
        isOnline: a.is_online,
        duration: a.duration_minutes,
        clientRating: a.client_satisfaction_rating,
        supervisorValidation: a.supervisor_validation,
        completedAt: a.completed_at
      })) || [],
      trainingsDetails: trainings?.map(t => ({
        trainingTitle: t.training?.title,
        difficulty: t.training?.difficulty,
        duration: t.training?.duration_minutes,
        isCompleted: t.is_completed,
        score: t.score,
        startedAt: t.started_at,
        completedAt: t.completed_at,
        timeSpent: t.time_spent_minutes,
        attempts: t.attempts
      })) || [],
      evaluationsDetails: evaluations?.map(e => ({
        evaluationDate: e.evaluation_date,
        technicalScore: e.technical_score,
        communicationScore: e.communication_score,
        punctualityScore: e.punctuality_score,
        professionalismScore: e.professionalism_score,
        overallScore: e.overall_score,
        feedback: e.feedback,
        strengths: e.strengths,
        improvementAreas: e.improvement_areas
      })) || [],
      recentActivity: activityLogs?.map(log => ({
        activityType: log.activity_type,
        timestamp: log.created_at,
        data: log.activity_data
      })) || [],
      generatedAt: new Date().toISOString()
    }

    return report

  } catch (error) {
    console.error('Erro ao gerar relatório do estudante:', error)
    throw error
  }
}

async function exportToExcel(reportData: unknown): Promise<Buffer> {
  try {
    const workbook = XLSX.utils.book_new()

    // Aba 1: Informações do Estudante
    const studentInfo = [
      ['Nome', reportData.studentInfo.name],
      ['Email', reportData.studentInfo.email],
      ['Telefone', reportData.studentInfo.phone],
      ['Curso', reportData.studentInfo.course],
      ['Semestre', reportData.studentInfo.semester],
      ['Universidade', reportData.studentInfo.university],
      ['Matrícula', reportData.studentInfo.registrationNumber],
      ['Status', reportData.studentInfo.status],
      ['Data de Cadastro', new Date(reportData.studentInfo.createdAt).toLocaleDateString('pt-BR')],
      ['Último Login', reportData.studentInfo.lastLogin ? new Date(reportData.studentInfo.lastLogin).toLocaleDateString('pt-BR') : 'Nunca']
    ]
    const studentSheet = XLSX.utils.aoa_to_sheet(studentInfo)
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Informações do Estudante')

    // Aba 2: Estatísticas de Performance
    const performanceStats = [
      ['Métrica', 'Valor'],
      ['Total de Atendimentos', reportData.performanceStats.totalAttendances],
      ['Atendimentos Concluídos', reportData.performanceStats.completedAttendances],
      ['Taxa de Sucesso (%)', reportData.performanceStats.successRate],
      ['Avaliação Média dos Clientes', reportData.performanceStats.avgClientRating],
      ['Total de Treinamentos', reportData.performanceStats.totalTrainings],
      ['Treinamentos Concluídos', reportData.performanceStats.completedTrainings],
      ['Taxa de Conclusão de Treinamentos (%)', reportData.performanceStats.trainingCompletionRate],
      ['Nota Média em Treinamentos', reportData.performanceStats.avgTrainingScore],
      ['Score de Performance Geral', reportData.performanceStats.avgPerformanceScore]
    ]
    const performanceSheet = XLSX.utils.aoa_to_sheet(performanceStats)
    XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Estatísticas')

    // Aba 3: Detalhes dos Atendimentos
    if (reportData.attendancesDetails.length > 0) {
      const attendancesData = reportData.attendancesDetails.map((a: unknown) => ({
        'Protocolo': a.protocol,
        'Cliente': a.clientName,
        'Categoria': a.clientCategory,
        'Tipo de Serviço': a.serviceType,
        'Data': new Date(a.scheduledDate).toLocaleDateString('pt-BR'),
        'Horário': a.scheduledTime,
        'Status': a.status,
        'Urgência': a.urgency,
        'Modalidade': a.isOnline ? 'Online' : 'Presencial',
        'Duração (min)': a.duration,
        'Avaliação Cliente': a.clientRating || 'N/A',
        'Validado': a.supervisorValidation ? 'Sim' : 'Não'
      }))
      const attendancesSheet = XLSX.utils.json_to_sheet(attendancesData)
      XLSX.utils.book_append_sheet(workbook, attendancesSheet, 'Atendimentos')
    }

    // Aba 4: Detalhes dos Treinamentos
    if (reportData.trainingsDetails.length > 0) {
      const trainingsData = reportData.trainingsDetails.map((t: unknown) => ({
        'Treinamento': t.trainingTitle,
        'Dificuldade': t.difficulty,
        'Duração (min)': t.duration,
        'Status': t.isCompleted ? 'Concluído' : 'Em Andamento',
        'Nota': t.score || 'N/A',
        'Iniciado em': new Date(t.startedAt).toLocaleDateString('pt-BR'),
        'Concluído em': t.completedAt ? new Date(t.completedAt).toLocaleDateString('pt-BR') : 'N/A',
        'Tempo Gasto (min)': t.timeSpent,
        'Tentativas': t.attempts
      }))
      const trainingsSheet = XLSX.utils.json_to_sheet(trainingsData)
      XLSX.utils.book_append_sheet(workbook, trainingsSheet, 'Treinamentos')
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
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
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const reportData = await generateStudentReport(studentAuth.studentId, format)

    // Registrar geração de relatório
    await supabaseAdmin
      .from('student_activity_logs')
      .insert({
        student_id: studentAuth.studentId,
        activity_type: 'REPORT_GENERATED',
        activity_data: {
          timestamp: new Date().toISOString(),
          format: format,
          user_agent: request.headers.get('user-agent')
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

    if (format === 'excel') {
      const buffer = await exportToExcel(reportData)
      return new NextResponse(buffer as unknown, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio-estudante-${reportData.studentInfo.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Erro ao gerar relatório do estudante:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
