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
        // Buscar atendimentos totais
        const { count: totalAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)

        // Buscar média de avaliação
        const { data: avgRatingData } = await supabase
          .from('attendances')
          .select('client_satisfaction_rating')
          .eq('student_id', student.id)
          .not('client_satisfaction_rating', 'is', null)

        const avgRating =
          avgRatingData && avgRatingData.length > 0
            ? avgRatingData.reduce((sum, a) => sum + (a.client_satisfaction_rating || 0), 0) /
              avgRatingData.length
            : 0

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
          totalAttendances: totalAttendances || 0,
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
