import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    // Para desenvolvimento, aceitar mock token
    if (token.endsWith('.mock')) {
      return {
        studentId: 'student-1',
        id: 'student-1',
        role: 'student',
        name: 'Aluno Teste'
      }
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId && !decoded.id && decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch (error) {
    // Para desenvolvimento, retornar um user mock em caso de erro
    if (process.env.NODE_ENV === 'development') {
      return {
        studentId: 'student-1',
        id: 'student-1',
        role: 'student',
        name: 'Aluno Teste'
      }
    }
    return null
  }
}

// GET - Listar todos os cursos disponíveis com progresso do estudante
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Courses API - Buscando cursos disponíveis')

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

    // Para desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Modo desenvolvimento - Retornando dados simulados')

      // Verificar matrículas salvas
      const enrollments = []
      const enrollment1 = process.env[`enrollment_${studentId}_1`]
      const enrollment2 = process.env[`enrollment_${studentId}_2`]
      const enrollment3 = process.env[`enrollment_${studentId}_3`]

      if (enrollment1) enrollments.push(JSON.parse(enrollment1))
      if (enrollment2) enrollments.push(JSON.parse(enrollment2))
      if (enrollment3) enrollments.push(JSON.parse(enrollment3))

      const mockData = {
        courses: [
          {
            id: '1',
            title: 'Aprenda sobre Power BI',
            description: 'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais.',
            category: 'internal',
            type: 'internal',
            cover_image: null,
            difficulty_level: 'Iniciante',
            estimated_duration: '8h',
            is_mandatory: true,
            external_url: null,
            instructor_name: 'Prof. Ana Silva - Especialista em BI',
            skills_learned: ['Power BI', 'Dashboards', 'Análise de Dados'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 4,
            modules_count: 24,
            completed_modules: 0,
            enrollment: enrollments.find(e => e.course_id === '1') || null,
            is_enrolled: !!enrollments.find(e => e.course_id === '1'),
            overall_progress: 0,
            enrollment_status: enrollments.find(e => e.course_id === '1') ? 'enrolled' : 'not_enrolled'
          },
          {
            id: '2',
            title: 'Cadastro de CPF',
            description: 'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF.',
            category: 'internal',
            type: 'internal',
            cover_image: null,
            difficulty_level: 'Iniciante',
            estimated_duration: '6h',
            is_mandatory: true,
            external_url: null,
            instructor_name: 'Prof. Carlos Oliveira - Especialista Tributário',
            skills_learned: ['CPF', 'Legislação', 'Procedimentos'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 4,
            modules_count: 24,
            completed_modules: 0,
            enrollment: enrollments.find(e => e.course_id === '2') || null,
            is_enrolled: !!enrollments.find(e => e.course_id === '2'),
            overall_progress: 0,
            enrollment_status: enrollments.find(e => e.course_id === '2') ? 'enrolled' : 'not_enrolled'
          },
          {
            id: '3',
            title: 'Imposto de Renda',
            description: 'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física.',
            category: 'internal',
            type: 'internal',
            cover_image: null,
            difficulty_level: 'Intermediário',
            estimated_duration: '9h',
            is_mandatory: true,
            external_url: null,
            instructor_name: 'Profa. Maria Santos - Contadora e Consultora Tributária',
            skills_learned: ['Imposto de Renda', 'Declaração', 'Tributação'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 4,
            modules_count: 24,
            completed_modules: 0,
            enrollment: enrollments.find(e => e.course_id === '3') || null,
            is_enrolled: !!enrollments.find(e => e.course_id === '3'),
            overall_progress: 0,
            enrollment_status: enrollments.find(e => e.course_id === '3') ? 'enrolled' : 'not_enrolled'
          },
          // Cursos Externos
          {
            id: '4',
            title: 'Contabilidade com foco na gestão da informação contábil',
            description: 'Curso oferecido pela Escola Virtual do Governo Federal sobre gestão da informação contábil.',
            category: 'external',
            type: 'external',
            cover_image: null,
            difficulty_level: 'Intermediário',
            estimated_duration: '5h',
            is_mandatory: false,
            external_url: 'https://www.escolavirtual.gov.br/curso/548',
            instructor_name: 'Escola Virtual Gov.br',
            skills_learned: ['Contabilidade', 'Gestão de Informação'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          {
            id: '5',
            title: 'Contabilidade pública e conformidade na gestão',
            description: 'Curso sobre contabilidade pública e procedimentos de conformidade.',
            category: 'external',
            type: 'external',
            cover_image: null,
            difficulty_level: 'Avançado',
            estimated_duration: '6h',
            is_mandatory: false,
            external_url: 'https://www.escolavirtual.gov.br/curso/480',
            instructor_name: 'Escola Virtual Gov.br',
            skills_learned: ['Contabilidade Pública', 'Conformidade'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          {
            id: '6',
            title: 'Contabilidade com Foco na Gestão do Patrimônio Público',
            description: 'Gestão e controle do patrimônio público através da contabilidade.',
            category: 'external',
            type: 'external',
            cover_image: null,
            difficulty_level: 'Intermediário',
            estimated_duration: '4h',
            is_mandatory: false,
            external_url: 'https://www.escolavirtual.gov.br/curso/342',
            instructor_name: 'Escola Virtual Gov.br',
            skills_learned: ['Gestão Patrimonial', 'Setor Público'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          {
            id: '7',
            title: 'Conceitos Básicos de Finanças e Contabilidade para Empresas Estatais',
            description: 'Curso sobre conceitos fundamentais de finanças e contabilidade aplicados ao setor público.',
            category: 'external',
            type: 'external',
            cover_image: null,
            difficulty_level: 'Intermediário',
            estimated_duration: '6h',
            is_mandatory: false,
            external_url: 'https://www.escolavirtual.gov.br/curso/1345',
            instructor_name: 'Escola Virtual Gov.br',
            skills_learned: ['Finanças Públicas', 'Empresas Estatais'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          {
            id: '8',
            title: 'Contabilidade Empresarial',
            description: 'Curso abrangente sobre contabilidade aplicada ao ambiente empresarial.',
            category: 'external',
            type: 'external',
            cover_image: null,
            difficulty_level: 'Avançado',
            estimated_duration: '8h',
            is_mandatory: false,
            external_url: 'https://www.ev.org.br/cursos/contabilidade-empresarial',
            instructor_name: 'Escola Virtual - EV',
            skills_learned: ['Contabilidade Empresarial', 'Gestão Financeira'],
            prerequisites: ['Conhecimentos básicos de contabilidade'],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          // Manuais
          {
            id: '9',
            title: 'Manual de Atendimentos',
            description: 'Manual oficial da Receita Federal para procedimentos de atendimento no NAF.',
            category: 'manual',
            type: 'manual',
            cover_image: null,
            difficulty_level: 'Iniciante',
            estimated_duration: '1h',
            is_mandatory: true,
            external_url: 'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-NAF/manual',
            instructor_name: 'Receita Federal do Brasil',
            skills_learned: ['Atendimento', 'Procedimentos NAF'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          },
          {
            id: '10',
            title: 'Manual do Referencial NAF',
            description: 'Manual de referência para funcionamento e gestão do Núcleo de Apoio Contábil e Fiscal.',
            category: 'manual',
            type: 'manual',
            cover_image: null,
            difficulty_level: 'Intermediário',
            estimated_duration: '1.5h',
            is_mandatory: true,
            external_url: 'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/referencial-naf',
            instructor_name: 'Receita Federal do Brasil',
            skills_learned: ['Gestão NAF', 'Referencial Técnico'],
            prerequisites: [],
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            themes_count: 0,
            modules_count: 0,
            completed_modules: 0,
            enrollment: null,
            is_enrolled: false,
            overall_progress: 0,
            enrollment_status: 'not_enrolled'
          }
        ],
        internalCourses: [],
        externalCourses: [],
        manuals: [],
        stats: {
          totalCourses: 10,
          enrolledCourses: enrollments.length,
          completedCourses: 0,
          mandatoryCourses: 5,
          completedMandatoryCourses: 0,
          progressPercentage: 0,
          mandatoryProgressPercentage: 0,
          internalCoursesCount: 3,
          externalCoursesCount: 5,
          manualsCount: 2
        },
        student_id: studentId
      }

      // Separar cursos por categoria
      mockData.internalCourses = mockData.courses.filter(c => c.category === 'internal')
      mockData.externalCourses = mockData.courses.filter(c => c.category === 'external')
      mockData.manuals = mockData.courses.filter(c => c.category === 'manual')

      console.log('✅ Dados simulados gerados:', {
        totalCursos: mockData.courses.length,
        matriculados: enrollments.length
      })

      return NextResponse.json(mockData)
    }

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

    // 2. Buscar matrículas e progresso do estudante
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('student_course_enrollments')
      .select('*')
      .eq('student_id', studentId)

    if (enrollmentsError) {
      console.error('❌ Erro ao buscar matrículas:', enrollmentsError)
    }

    console.log(`📊 Encontradas ${enrollments?.length || 0} matrículas`)

    // 3. Buscar progresso em temas
    const { data: themeProgress, error: themeProgressError } = await supabaseAdmin
      .from('student_theme_progress')
      .select('*')
      .eq('student_id', studentId)

    // 4. Buscar progresso em módulos
    const { data: moduleProgress, error: moduleProgressError } = await supabaseAdmin
      .from('student_module_progress')
      .select('*')
      .eq('student_id', studentId)

    // 5. Combinar dados de cursos com progresso
    const coursesWithProgress = courses?.map(course => {
      const enrollment = enrollments?.find(e => e.course_id === course.id)

      // Calcular total de módulos no curso
      const totalModules = course.course_themes?.reduce((sum: number, theme: unknown) => {
        return sum + (theme.theme_modules?.length || 0)
      }, 0) || 0

      // Calcular módulos completados
      const completedModules = course.course_themes?.reduce((sum: number, theme: unknown) => {
        const themeModules = theme.theme_modules || []
        const completedInTheme = themeModules.filter((module: unknown) => {
          return moduleProgress?.find(mp => mp.module_id === module.id && mp.status === 'completed')
        }).length
        return sum + completedInTheme
      }, 0) || 0

      // Mapear temas com progresso
      const themesWithProgress = course.course_themes?.map((theme: unknown) => {
        const themeProgressData = themeProgress?.find(tp => tp.theme_id === theme.id)

        // Mapear módulos com progresso
        const modulesWithProgress = theme.theme_modules?.map((module: unknown) => {
          const moduleProgressData = moduleProgress?.find(mp => mp.module_id === module.id)
          return {
            ...module,
            progress: moduleProgressData || null
          }
        })

        return {
          ...theme,
          theme_modules: modulesWithProgress,
          progress: themeProgressData || null
        }
      })

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
        completed_modules: completedModules,
        course_themes: themesWithProgress || [],
        // Dados de matrícula e progresso do estudante
        enrollment: enrollment || null,
        is_enrolled: !!enrollment,
        overall_progress: enrollment?.overall_progress || 0,
        enrollment_status: enrollment?.status || 'not_enrolled'
      }
    }) || []

    // 6. Separar cursos por categoria
    const internalCourses = coursesWithProgress.filter(c => c.category === 'internal')
    const externalCourses = coursesWithProgress.filter(c => c.category === 'external')
    const manuals = coursesWithProgress.filter(c => c.category === 'manual')

    // 7. Calcular estatísticas gerais
    const totalCourses = coursesWithProgress.length
    const enrolledCourses = coursesWithProgress.filter(c => c.is_enrolled).length
    const completedCourses = coursesWithProgress.filter(c => c.enrollment_status === 'completed').length
    const mandatoryCourses = coursesWithProgress.filter(c => c.is_mandatory).length
    const completedMandatoryCourses = coursesWithProgress.filter(c => c.is_mandatory && c.enrollment_status === 'completed').length

    const stats = {
      totalCourses,
      enrolledCourses,
      completedCourses,
      mandatoryCourses,
      completedMandatoryCourses,
      progressPercentage: enrolledCourses > 0 ? Math.round(coursesWithProgress.reduce((sum, course) => sum + (course.overall_progress || 0), 0) / enrolledCourses) : 0,
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
      student_id: studentId
    }

    console.log('✅ Cursos processados:', {
      total: totalCourses,
      internos: internalCourses.length,
      externos: externalCourses.length,
      manuais: manuals.length,
      matriculados: enrolledCourses,
      concluidos: completedCourses
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro ao buscar cursos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}