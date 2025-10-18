import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar todos os estudantes com informações adicionais
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        total_attendances:attendances(count),
        completed_attendances:attendances!inner(count)
      `)
      .eq('attendances.status', 'CONCLUIDO')
      .order('name', { ascending: true })

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError)
      return NextResponse.json(
        { success: false, error: studentsError.message },
        { status: 500 }
      )
    }

    // Para cada estudante, buscar estatísticas detalhadas
    const studentsWithStats = await Promise.all(
      (students || []).map(async (student) => {
        // Buscar atendimentos totais da tabela attendances
        const { count: totalAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)

        // Buscar atendimentos fiscais totais
        const { count: totalFiscalAppointments } = await supabase
          .from('fiscal_appointments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_student_id', student.id)

        // Buscar média de avaliação de attendances
        const { data: avgRatingData } = await supabase
          .from('attendances')
          .select('client_satisfaction_rating')
          .eq('student_id', student.id)
          .not('client_satisfaction_rating', 'is', null)

        // Buscar média de avaliação de fiscal feedbacks
        const { data: fiscalFeedbacks } = await supabase
          .from('fiscal_appointment_feedbacks')
          .select('rating, fiscal_appointments!inner(assigned_student_id)')
          .eq('fiscal_appointments.assigned_student_id', student.id)

        // Calcular média combinada
        const sumAttendances = avgRatingData?.reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) || 0
        const sumFiscal = fiscalFeedbacks?.reduce((sum, f) => sum + (f.rating || 0), 0) || 0
        const totalRatings = (avgRatingData?.length || 0) + (fiscalFeedbacks?.length || 0)

        const avgRating = totalRatings > 0 ? (sumAttendances + sumFiscal) / totalRatings : 0

        // Calcular número do semestre
        const semesterNumber = parseInt(student.semester?.replace(/\D/g, '') || '1')

        // Calcular duração do curso
        const courseDuration = (() => {
          if (['Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
               'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
               'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo'].includes(student.course)) {
            return 10
          }
          if (['Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
               'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
               'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
               'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico'].includes(student.course)) {
            return 4
          }
          if (student.course === 'Análise e Desenvolvimento de Sistemas') {
            return 5
          }
          return 8
        })()

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          document: student.document,
          course: student.course,
          semester: student.semester,
          semesterNumber,
          courseDuration,
          registrationNumber: student.registration_number,
          status: student.status,
          isGraduated: student.is_graduated || false,
          graduationDate: student.graduation_date || null,
          registrationYear: student.registration_year || new Date().getFullYear(),
          registrationSemester: student.registration_semester || 1,
          totalAttendances: (totalAttendances || 0) + (totalFiscalAppointments || 0),
          avgRating: Math.round(avgRating * 10) / 10,
          birthDate: student.birth_date,
          address: student.address,
          emergencyContact: student.emergency_contact,
          specializations: student.specializations || [],
          profilePictureUrl: student.profile_picture_url,
          createdAt: student.created_at,
          lastLogin: student.last_login,
          isLastSemester: semesterNumber === courseDuration,
          semestersRemaining: courseDuration - semesterNumber
        }
      })
    )

    return NextResponse.json({
      success: true,
      students: studentsWithStats
    })
  } catch (error) {
    console.error('Erro ao listar estudantes:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar estudantes' },
      { status: 500 }
    )
  }
}
