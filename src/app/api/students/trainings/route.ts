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

// GET - Listar treinamentos disponíveis e progresso do estudante
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Student Trainings - Buscando treinamentos disponíveis')

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

    // 1. Buscar todos os cursos disponíveis com seus temas e módulos
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_themes (
          *,
          theme_modules (
            id,
            title,
            description,
            module_order,
            module_type,
            estimated_duration
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('❌ Erro ao buscar cursos:', coursesError)
      return NextResponse.json(
        { message: 'Erro ao buscar cursos', error: coursesError.message },
        { status: 500 }
      )
    }

    console.log(`📚 Encontrados ${courses?.length || 0} cursos disponíveis`)

    // 2. Buscar progresso do estudante em cada curso
    const { data: progress, error: progressError } = await supabaseAdmin
      .from('student_course_progress')
      .select('*')
      .eq('student_id', studentId)

    if (progressError) {
      console.error('❌ Erro ao buscar progresso:', progressError)
    }

    console.log(`📊 Encontrados ${progress?.length || 0} progressos registrados`)

    // 3. Combinar dados de cursos com progresso
    const coursesWithProgress = courses?.map(course => {
      const studentProgress = progress?.find(p => p.course_id === course.id)

      // Calcular total de módulos no curso
      const totalModules = course.course_themes?.reduce((sum: number, theme: unknown) => {
        return sum + (theme.theme_modules?.length || 0)
      }, 0) || 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        type: course.type,
        cover_image: course.cover_image,
        difficulty_level: course.difficulty_level,
        estimated_duration: course.estimated_duration,
        is_mandatory: course.is_mandatory,
        external_url: course.external_url,
        instructor_name: course.instructor_name,
        skills_learned: course.skills_learned || [],
        prerequisites: course.prerequisites || [],
        status: course.status,
        created_at: course.created_at,
        updated_at: course.updated_at,
        // Estrutura do curso
        themes_count: course.course_themes?.length || 0,
        modules_count: totalModules,
        course_themes: course.course_themes || [],
        // Dados do progresso do estudante
        progress: studentProgress ? {
          id: studentProgress.id,
          enrollment_date: studentProgress.enrollment_date,
          started_at: studentProgress.started_at,
          completed_at: studentProgress.completed_at,
          current_theme_id: studentProgress.current_theme_id,
          current_module_id: studentProgress.current_module_id,
          overall_progress: studentProgress.overall_progress,
          total_time_spent: studentProgress.total_time_spent,
          status: studentProgress.status,
          certificate_issued: studentProgress.certificate_issued
        } : null
      }
    }) || []

    // 4. Separar cursos por categoria
    const internalCourses = coursesWithProgress.filter(c => c.category === 'internal')
    const externalCourses = coursesWithProgress.filter(c => c.category === 'external')
    const manuals = coursesWithProgress.filter(c => c.category === 'manual')

    // 5. Calcular estatísticas gerais
    const totalCourses = coursesWithProgress.length
    const enrolledCourses = coursesWithProgress.filter(c => c.progress).length
    const completedCourses = coursesWithProgress.filter(c => c.progress?.status === 'completed').length
    const mandatoryCourses = coursesWithProgress.filter(c => c.is_mandatory).length
    const completedMandatoryCourses = coursesWithProgress.filter(c => c.is_mandatory && c.progress?.status === 'completed').length

    const stats = {
      totalCourses,
      enrolledCourses,
      completedCourses,
      mandatoryCourses,
      completedMandatoryCourses,
      progressPercentage: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
      mandatoryProgressPercentage: mandatoryCourses > 0 ? Math.round((completedMandatoryCourses / mandatoryCourses) * 100) : 0,
      // Estatísticas por categoria
      internalCoursesCount: internalCourses.length,
      externalCoursesCount: externalCourses.length,
      manualsCount: manuals.length
    }

    const result = {
      courses: coursesWithProgress,
      internalCourses,
      externalCourses,
      manuals,
      stats,
      // Compatibilidade com a API antiga
      trainings: coursesWithProgress,
      totalTrainings: totalCourses,
      completedTrainings: completedCourses
    }

    console.log('✅ Cursos processados:', {
      total: totalCourses,
      internos: internalCourses.length,
      externos: externalCourses.length,
      manuais: manuals.length,
      matriculados: enrolledCourses,
      concluidos: completedCourses,
      obrigatorios: mandatoryCourses,
      obrigatoriosConcluidos: completedMandatoryCourses
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro ao buscar treinamentos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Iniciar ou atualizar progresso em um treinamento
export async function POST(request: NextRequest) {
  try {
    console.log('📚 Student Trainings - Atualizando progresso')

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
    const body = await request.json()
    const { training_id, action, score, notes } = body

    if (!training_id || !action) {
      return NextResponse.json(
        { message: 'training_id e action são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o treinamento existe
    const { data: training, error: trainingError } = await supabaseAdmin
      .from('trainings')
      .select('*')
      .eq('id', training_id)
      .eq('is_active', true)
      .single()

    if (trainingError || !training) {
      return NextResponse.json(
        { message: 'Treinamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe progresso para este treinamento
    const { data: existingProgress, error: progressError } = await supabaseAdmin
      .from('student_training_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('training_id', training_id)
      .maybeSingle()

    if (progressError) {
      console.error('❌ Erro ao verificar progresso:', progressError)
      return NextResponse.json(
        { message: 'Erro ao verificar progresso' },
        { status: 500 }
      )
    }

    let result
    const now = new Date().toISOString()

    if (action === 'start' && !existingProgress) {
      // Iniciar novo treinamento
      const { data, error } = await supabaseAdmin
        .from('student_training_progress')
        .insert({
          student_id: studentId,
          training_id: training_id,
          started_at: now,
          attempts: 1,
          time_spent_minutes: 0,
          is_completed: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao iniciar treinamento:', error)
        return NextResponse.json(
          { message: 'Erro ao iniciar treinamento', error: error.message },
          { status: 500 }
        )
      }

      result = data
      console.log('✅ Treinamento iniciado:', training.title)

    } else if (action === 'complete' && existingProgress) {
      // Completar treinamento
      const { data, error } = await supabaseAdmin
        .from('student_training_progress')
        .update({
          completed_at: now,
          is_completed: true,
          score: score || null,
          notes: notes || null
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao completar treinamento:', error)
        return NextResponse.json(
          { message: 'Erro ao completar treinamento', error: error.message },
          { status: 500 }
        )
      }

      result = data
      console.log('✅ Treinamento concluído:', training.title, 'Score:', score)

    } else if (action === 'update_progress' && existingProgress) {
      // Atualizar progresso (tempo gasto, tentativas, etc.)
      const { data, error } = await supabaseAdmin
        .from('student_training_progress')
        .update({
          time_spent_minutes: body.time_spent_minutes || existingProgress.time_spent_minutes,
          attempts: body.attempts || existingProgress.attempts,
          notes: notes || existingProgress.notes
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar progresso:', error)
        return NextResponse.json(
          { message: 'Erro ao atualizar progresso', error: error.message },
          { status: 500 }
        )
      }

      result = data
      console.log('✅ Progresso atualizado:', training.title)

    } else {
      return NextResponse.json(
        { message: 'Ação inválida ou treinamento já iniciado/concluído' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Progresso atualizado com sucesso',
      progress: result
    })

  } catch (error) {
    console.error('💥 Erro ao atualizar progresso:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
