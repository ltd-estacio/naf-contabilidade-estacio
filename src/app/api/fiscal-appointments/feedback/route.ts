import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST - Salvar feedback de atendimento fiscal
 * Body:
 * - appointment_id: ID do atendimento
 * - client_name: Nome do cliente
 * - client_email: Email do cliente
 * - rating: Avaliação geral (1-5)
 * - feedback_text: Texto do feedback (opcional)
 * - service_quality: Avaliação da qualidade do serviço (1-5, opcional)
 * - student_attention: Avaliação da atenção do estudante (1-5, opcional)
 * - problem_resolution: Avaliação da resolução do problema (1-5, opcional)
 * - would_recommend: Se recomendaria o serviço (boolean, opcional)
 * - additional_comments: Comentários adicionais (opcional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Recebendo feedback de atendimento fiscal:', body)

    const {
      appointment_id,
      client_name,
      client_email,
      rating,
      feedback_text,
      service_quality,
      student_attention,
      problem_resolution,
      would_recommend,
      additional_comments
    } = body

    // Validações
    if (!appointment_id || !client_name || !client_email || !rating) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos (appointment_id, client_name, client_email, rating)' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'A avaliação deve estar entre 1 e 5' },
        { status: 400 }
      )
    }

    // Verificar se o atendimento existe
    const { data: appointment, error: appointmentError } = await supabase
      .from('fiscal_appointments')
      .select('id, status, client_name, client_email')
      .eq('id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Atendimento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o atendimento foi concluído
    if (appointment.status !== 'CONCLUIDO') {
      return NextResponse.json(
        { error: 'Só é possível avaliar atendimentos concluídos' },
        { status: 400 }
      )
    }

    // Verificar se já existe feedback para este atendimento
    const { data: existingFeedback } = await supabase
      .from('fiscal_appointment_feedbacks')
      .select('id')
      .eq('appointment_id', appointment_id)
      .single()

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Já existe um feedback para este atendimento' },
        { status: 409 }
      )
    }

    // Preparar dados para inserção
    const feedbackData = {
      appointment_id,
      client_name,
      client_email,
      rating,
      feedback_text: feedback_text || null,
      service_quality: service_quality || null,
      student_attention: student_attention || null,
      problem_resolution: problem_resolution || null,
      would_recommend: would_recommend !== undefined ? would_recommend : true,
      additional_comments: additional_comments || null,
      created_at: new Date().toISOString()
    }

    // Inserir feedback
    const { data: feedback, error: insertError } = await supabase
      .from('fiscal_appointment_feedbacks')
      .insert(feedbackData)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao salvar feedback:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar feedback', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ Feedback salvo com sucesso')

    return NextResponse.json({
      message: 'Feedback enviado com sucesso! Obrigado pela sua avaliação.',
      feedback
    })

  } catch (error) {
    console.error('Erro ao processar feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET - Buscar feedbacks
 * Query params:
 * - appointment_id: ID do atendimento (opcional)
 * - student_id: ID do estudante (opcional) - retorna feedbacks dos atendimentos do estudante
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointment_id')
    const studentId = searchParams.get('student_id')

    if (appointmentId) {
      // Buscar feedback específico de um atendimento
      const { data: feedback, error } = await supabase
        .from('fiscal_appointment_feedbacks')
        .select(`
          *,
          fiscal_appointments:appointment_id (
            protocol,
            service_title,
            assigned_student_id
          )
        `)
        .eq('appointment_id', appointmentId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar feedback:', error)
        return NextResponse.json(
          { error: 'Erro ao buscar feedback' },
          { status: 500 }
        )
      }

      return NextResponse.json({ feedback: feedback || null })
    }

    if (studentId) {
      // Buscar todos os feedbacks dos atendimentos de um estudante
      const { data: feedbacks, error } = await supabase
        .from('fiscal_appointment_feedbacks')
        .select(`
          *,
          fiscal_appointments!inner (
            protocol,
            service_title,
            assigned_student_id
          )
        `)
        .eq('fiscal_appointments.assigned_student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar feedbacks:', error)
        return NextResponse.json(
          { error: 'Erro ao buscar feedbacks' },
          { status: 500 }
        )
      }

      return NextResponse.json({ feedbacks: feedbacks || [] })
    }

    // Buscar todos os feedbacks (para coordenadores)
    const { data: feedbacks, error } = await supabase
      .from('fiscal_appointment_feedbacks')
      .select(`
        *,
        fiscal_appointments (
          protocol,
          service_title,
          assigned_student_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar feedbacks:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar feedbacks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ feedbacks: feedbacks || [] })

  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
