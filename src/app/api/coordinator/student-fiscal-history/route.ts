import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

// GET - Buscar histórico de atendimentos fiscais por estudante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('📚 Buscando histórico de atendimentos fiscais do estudante:', studentId)

    // Se não foi fornecido student_id, retornar todos os atendimentos com informações dos estudantes
    if (!studentId) {
      const { data: appointments, error } = await supabase
        .from('fiscal_appointments')
        .select(`
          *,
          students:assigned_student_id (
            id,
            name,
            email,
            course,
            semester,
            university
          )
        `)
        .not('assigned_student_id', 'is', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Erro ao buscar atendimentos fiscais:', error)
        return NextResponse.json(
          { message: 'Erro ao buscar atendimentos fiscais', error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        appointments: appointments || [],
        total: appointments?.length || 0
      })
    }

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { message: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // Buscar atendimentos fiscais do estudante
    const { data: appointments, error: appointmentsError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('assigned_student_id', studentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (appointmentsError) {
      console.error('Erro ao buscar atendimentos fiscais do estudante:', appointmentsError)
      return NextResponse.json(
        { message: 'Erro ao buscar atendimentos', error: appointmentsError.message },
        { status: 500 }
      )
    }

    // Buscar feedbacks dos atendimentos concluídos
    const appointmentIds = appointments?.map(a => a.id) || []
    let feedbacks: any[] = []

    if (appointmentIds.length > 0) {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('fiscal_appointment_feedbacks')
        .select('*')
        .in('appointment_id', appointmentIds)

      if (!feedbackError) {
        feedbacks = feedbackData || []
      }
    }

    // Mapear feedbacks para os atendimentos
    const appointmentsWithFeedback = appointments?.map(apt => ({
      ...apt,
      feedback: feedbacks.find(f => f.appointment_id === apt.id) || null
    }))

    // Calcular estatísticas
    const stats = {
      total: appointments?.length || 0,
      pendentes: appointments?.filter(a => a.status === 'PENDENTE').length || 0,
      confirmados: appointments?.filter(a => a.status === 'CONFIRMADO').length || 0,
      emAndamento: appointments?.filter(a => a.status === 'EM_ANDAMENTO').length || 0,
      concluidos: appointments?.filter(a => a.status === 'CONCLUIDO').length || 0,
      cancelados: appointments?.filter(a => a.status === 'CANCELADO').length || 0
    }

    // Agrupar por categoria de serviço
    const serviceCategories: Record<string, number> = {}
    appointments?.forEach(apt => {
      const category = apt.service_category || 'Outros'
      serviceCategories[category] = (serviceCategories[category] || 0) + 1
    })

    // Calcular média de avaliações
    const ratingsAverage = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0

    console.log(`✅ Encontrados ${stats.total} atendimentos fiscais para o estudante ${student.name}`)

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        semester: student.semester,
        university: student.university
      },
      appointments: appointmentsWithFeedback || [],
      stats,
      serviceCategories,
      feedbacks: {
        total: feedbacks.length,
        average_rating: ratingsAverage,
        list: feedbacks
      }
    })

  } catch (error) {
    console.error('Erro ao buscar histórico de atendimentos fiscais:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
