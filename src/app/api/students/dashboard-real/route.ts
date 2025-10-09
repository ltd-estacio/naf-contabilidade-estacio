import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId && !decoded.id && decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎓 Student Dashboard - Iniciando busca de dados reais')

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

    const studentId = studentAuth.studentId || studentAuth.id

    // 1. Buscar dados do perfil do estudante
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('❌ Erro ao buscar estudante:', studentError)
      return NextResponse.json(
        { message: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    console.log('👤 Estudante encontrado:', student.name)

    // 2. Buscar atendimentos do estudante
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })

    if (attendancesError) {
      console.error('❌ Erro ao buscar atendimentos:', attendancesError)
    }

    console.log(`📋 Encontrados ${attendances?.length || 0} atendimentos`)

    // 3. Buscar progresso em treinamentos
    const { data: trainingProgress, error: trainingError } = await supabaseAdmin
      .from('student_training_progress')
      .select(`
        *,
        trainings:training_id (
          id,
          title,
          description,
          duration_minutes,
          difficulty,
          topics,
          is_mandatory
        )
      `)
      .eq('student_id', studentId)

    if (trainingError) {
      console.error('❌ Erro ao buscar treinamentos:', trainingError)
    }

    console.log(`📚 Encontrados ${trainingProgress?.length || 0} progressos de treinamento`)

    // 4. Buscar avaliações recentes
    const { data: evaluations, error: evaluationsError } = await supabaseAdmin
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })
      .limit(5)

    if (evaluationsError) {
      console.error('❌ Erro ao buscar avaliações:', evaluationsError)
    }

    console.log(`⭐ Encontradas ${evaluations?.length || 0} avaliações`)

    // 5. Calcular estatísticas
    const totalAttendances = attendances?.length || 0
    const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const avgRating = attendances?.filter(a => a.client_satisfaction_rating)
      .reduce((sum, a, _, arr) => {
        const total = sum + (a.client_satisfaction_rating || 0)
        return arr.length > 0 ? total / arr.length : 0
      }, 0) || 0

    const totalTrainings = trainingProgress?.length || 0
    const completedTrainings = trainingProgress?.filter(tp => tp.is_completed).length || 0

    const avgPerformanceScore = evaluations?.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
      : 0

    const successRate = totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0

    // 6. Formatar dados para o frontend
    const formattedAttendances = attendances?.map(attendance => ({
      id: attendance.id,
      protocol: attendance.protocol,
      client_name: attendance.client_name,
      client_email: attendance.client_email,
      client_phone: attendance.client_phone,
      service_type: attendance.service_type,
      service_description: attendance.service_description,
      scheduled_date: attendance.scheduled_date,
      scheduled_time: attendance.scheduled_time,
      status: attendance.status,
      urgency: attendance.urgency,
      is_online: attendance.is_online,
      client_satisfaction_rating: attendance.client_satisfaction_rating,
      supervisor_validation: attendance.supervisor_validation
    })) || []

    const formattedTrainings = trainingProgress?.map(progress => ({
      id: progress.id,
      training_id: progress.training_id,
      is_completed: progress.is_completed,
      score: progress.score,
      started_at: progress.started_at,
      completed_at: progress.completed_at,
      training: {
        id: progress.trainings?.id,
        title: progress.trainings?.title,
        description: progress.trainings?.description,
        duration_minutes: progress.trainings?.duration_minutes,
        difficulty: progress.trainings?.difficulty,
        topics: progress.trainings?.topics || [],
        is_mandatory: progress.trainings?.is_mandatory
      }
    })) || []

    const result = {
      profile: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        semester: student.semester,
        registrationNumber: student.registration_number,
        specializations: student.specializations || [],
        status: student.status,
        document: student.document,
        university: student.university,
        lastLogin: student.last_login,
        createdAt: student.created_at
      },
      stats: {
        totalAttendances,
        completedAttendances,
        avgRating: Math.round(avgRating * 10) / 10,
        completedTrainings,
        totalTrainings,
        avgPerformanceScore: Math.round(avgPerformanceScore * 10) / 10,
        successRate
      },
      attendances: formattedAttendances,
      trainings: formattedTrainings,
      recentEvaluations: evaluations || []
    }

    console.log('✅ Dashboard do estudante processado:', {
      studentName: student.name,
      totalAttendances,
      completedAttendances,
      successRate: `${successRate}%`,
      avgRating: avgRating.toFixed(1),
      totalTrainings,
      completedTrainings
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro no dashboard do estudante:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
