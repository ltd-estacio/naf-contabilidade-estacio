import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Sistema de cache simples para melhorar performance
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

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

async function getStudentData(studentId: string) {
  const cacheKey = `student_${studentId}`
  const cached = cache.get(cacheKey)

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }

  try {
    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    // Buscar atendimentos do estudante
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })
      .limit(10)

    if (attendancesError) throw attendancesError

    // Buscar progresso em treinamentos
    const { data: trainingProgress, error: trainingError } = await supabaseAdmin
      .from('student_training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('student_id', studentId)

    if (trainingError) throw trainingError

    // Buscar avaliações do estudante
    const { data: evaluations, error: evaluationsError } = await supabaseAdmin
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })
      .limit(5)

    if (evaluationsError) throw evaluationsError

    // Calcular estatísticas
    const totalAttendances = attendances?.length || 0
    const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const ratingsWithValues = attendances?.filter(a => a.client_satisfaction_rating) || []
    const avgRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / ratingsWithValues.length
      : 0

    const completedTrainings = trainingProgress?.filter(t => t.is_completed).length || 0
    const totalTrainings = trainingProgress?.length || 0

    // Calcular performance geral das avaliações
    const avgOverallScore = evaluations?.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
      : 0

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
        availableHours: student.available_hours || [],
        lastLogin: student.last_login
      },
      stats: {
        totalAttendances,
        completedAttendances,
        avgRating: Math.round(avgRating * 10) / 10,
        completedTrainings,
        totalTrainings,
        avgPerformanceScore: Math.round(avgOverallScore * 100) / 100,
        successRate: totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0
      },
      attendances: attendances || [],
      trainings: trainingProgress || [],
      recentEvaluations: evaluations || []
    }

    // Cache do resultado
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return result

  } catch (error) {
    console.error('Erro ao buscar dados do estudante:', error)
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

    // Buscar dados completos do estudante
    const studentData = await getStudentData(studentAuth.studentId)

    if (!studentData.profile) {
      return NextResponse.json(
        { message: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // Registrar atividade de acesso
    await supabaseAdmin
      .from('student_activity_logs')
      .insert({
        student_id: studentAuth.studentId,
        activity_type: 'DASHBOARD_ACCESS',
        activity_data: {
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get('user-agent')
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

    return NextResponse.json(studentData)

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
