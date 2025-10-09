import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // Buscar atendimentos do estudante
    const { data: attendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })

    // Buscar avaliações do estudante
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })

    // Buscar progresso em treinamentos
    const { data: trainings, error: trainingsError } = await supabase
      .from('student_training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('student_id', studentId)

    // Calcular estatísticas
    const totalAttendances = attendances?.length || 0
    const completedAttendances = attendances?.filter(a => a.status === 'CONCLUIDO').length || 0
    const avgRating = attendances && attendances.length > 0
      ? attendances
          .filter(a => a.client_satisfaction_rating)
          .reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) /
        attendances.filter(a => a.client_satisfaction_rating).length
      : 0

    const completedTrainings = trainings?.filter(t => t.is_completed).length || 0
    const totalTrainingsTime = trainings?.reduce((sum, t) => sum + (t.time_spent_minutes || 0), 0) || 0

    return NextResponse.json({
      success: true,
      profile: {
        ...student,
        statistics: {
          totalAttendances,
          completedAttendances,
          cancelledAttendances: attendances?.filter(a => a.status === 'CANCELADO').length || 0,
          avgRating: Math.round(avgRating * 10) / 10,
          completedTrainings,
          totalTrainingsTime,
          evaluationsReceived: evaluations?.length || 0,
          avgEvaluationScore: evaluations && evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
            : 0
        },
        recentAttendances: attendances?.slice(0, 5) || [],
        recentEvaluations: evaluations?.slice(0, 3) || [],
        trainingsProgress: trainings || []
      }
    })
  } catch (error) {
    console.error('Erro ao buscar perfil do estudante:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}
