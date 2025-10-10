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

    // Buscar atendimentos do estudante (tabela attendances)
    const { data: attendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_date', { ascending: false })

    console.log(`📋 Atendimentos (attendances) encontrados: ${attendances?.length || 0}`)

    // Buscar atendimentos fiscais do estudante (tabela fiscal_appointments)
    const { data: fiscalAppointments, error: fiscalError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('assigned_student_id', studentId)
      .order('created_at', { ascending: false })

    console.log(`📋 Atendimentos fiscais encontrados: ${fiscalAppointments?.length || 0}`)

    // Buscar feedbacks dos atendimentos fiscais
    const fiscalAppointmentIds = fiscalAppointments?.map(a => a.id) || []
    let fiscalFeedbacks: any[] = []

    if (fiscalAppointmentIds.length > 0) {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('fiscal_appointment_feedbacks')
        .select('*')
        .in('appointment_id', fiscalAppointmentIds)

      if (!feedbackError) {
        fiscalFeedbacks = feedbackData || []
      }
      console.log(`⭐ Feedbacks fiscais encontrados: ${fiscalFeedbacks.length}`)
    }

    // Combinar atendimentos fiscais com seus feedbacks
    const fiscalWithFeedback = fiscalAppointments?.map(apt => ({
      ...apt,
      type: 'fiscal',
      service_type: apt.service_title || apt.service_type,
      scheduled_date: apt.preferred_date,
      scheduled_time: apt.preferred_time,
      client_name: apt.client_name,
      client_satisfaction_rating: fiscalFeedbacks.find(f => f.appointment_id === apt.id)?.rating || null,
      feedback_comment: fiscalFeedbacks.find(f => f.appointment_id === apt.id)?.comment || null
    })) || []

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

    // Calcular estatísticas (INCLUINDO atendimentos fiscais)
    const totalAttendances = (attendances?.length || 0) + (fiscalAppointments?.length || 0)
    const completedAttendances = (attendances?.filter(a => a.status === 'CONCLUIDO').length || 0) +
                                 (fiscalAppointments?.filter(a => a.status === 'CONCLUIDO').length || 0)

    // Calcular média de avaliações (INCLUINDO feedbacks fiscais)
    const attendanceRatings = attendances?.filter(a => a.client_satisfaction_rating).map(a => a.client_satisfaction_rating) || []
    const fiscalRatings = fiscalFeedbacks.map(f => f.rating) || []
    const allRatings = [...attendanceRatings, ...fiscalRatings]

    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 0

    const completedTrainings = trainings?.filter(t => t.is_completed).length || 0
    const totalTrainingsTime = trainings?.reduce((sum, t) => sum + (t.time_spent_minutes || 0), 0) || 0

    // Combinar todos os atendimentos
    const allAttendances = [
      ...(attendances || []).map(a => ({ ...a, type: 'regular' })),
      ...fiscalWithFeedback
    ].sort((a, b) => {
      const dateA = new Date(a.scheduled_date || a.created_at)
      const dateB = new Date(b.scheduled_date || b.created_at)
      return dateB.getTime() - dateA.getTime()
    })

    console.log(`✅ Total de atendimentos combinados: ${allAttendances.length}`)

    const cancelledCount = (attendances?.filter(a => a.status === 'CANCELADO').length || 0) +
                          (fiscalAppointments?.filter(a => a.status === 'CANCELADO').length || 0)

    return NextResponse.json({
      success: true,
      profile: {
        ...student,
        statistics: {
          totalAttendances,
          completedAttendances,
          cancelledAttendances: cancelledCount,
          avgRating: Math.round(avgRating * 10) / 10,
          completedTrainings,
          totalTrainingsTime,
          evaluationsReceived: evaluations?.length || 0,
          avgEvaluationScore: evaluations && evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
            : 0
        },
        recentAttendances: allAttendances.slice(0, 10) || [],
        recentEvaluations: evaluations?.slice(0, 3) || [],
        trainingsProgress: trainings || [],
        fiscalFeedbacks: fiscalFeedbacks || []
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
