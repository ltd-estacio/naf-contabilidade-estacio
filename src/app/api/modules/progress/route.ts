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

// POST - Atualizar progresso do módulo
export async function POST(request: NextRequest) {
  try {
    console.log('📈 Module Progress - Atualizando progresso do módulo')

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
    const { moduleId, courseId, status, timeSpent, completedAt } = body

    if (!moduleId || !courseId || !status) {
      return NextResponse.json(
        { message: 'moduleId, courseId e status são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📊 Dados do progresso:', { studentId, moduleId, courseId, status, timeSpent })

    // Para desenvolvimento, simular salvamento bem-sucedido
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Modo desenvolvimento - Simulando salvamento no banco')

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockProgress = {
        id: `progress-${studentId}-${moduleId}`,
        student_id: studentId,
        module_id: moduleId,
        status: status,
        time_spent: timeSpent,
        completed_at: status === 'completed' ? (completedAt || new Date().toISOString()) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('✅ Progresso simulado salvo:', mockProgress)

      return NextResponse.json({
        message: 'Progresso salvo com sucesso (desenvolvimento)',
        progress: mockProgress
      })
    }

    // 1. Buscar se já existe progresso para este módulo
    const { data: existingProgress, error: progressError } = await supabaseAdmin
      .from('student_module_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .maybeSingle()

    if (progressError) {
      console.error('❌ Erro ao buscar progresso existente:', progressError)
      return NextResponse.json(
        { message: 'Erro ao buscar progresso existente' },
        { status: 500 }
      )
    }

    let progressData = {
      student_id: studentId,
      module_id: moduleId,
      status: status,
      time_spent: timeSpent || 0,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      progressData = {
        ...progressData,
        completed_at: completedAt || new Date().toISOString()
      }
    }

    let result
    if (existingProgress) {
      // Atualizar progresso existente
      const { data: updatedProgress, error: updateError } = await supabaseAdmin
        .from('student_module_progress')
        .update(progressData)
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar progresso:', updateError)
        return NextResponse.json(
          { message: 'Erro ao atualizar progresso', error: updateError.message },
          { status: 500 }
        )
      }

      result = updatedProgress
    } else {
      // Criar novo progresso
      const { data: newProgress, error: createError } = await supabaseAdmin
        .from('student_module_progress')
        .insert(progressData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Erro ao criar progresso:', createError)
        return NextResponse.json(
          { message: 'Erro ao criar progresso', error: createError.message },
          { status: 500 }
        )
      }

      result = newProgress
    }

    // 2. Se o módulo foi concluído, atualizar progresso do tema
    if (status === 'completed') {
      // Buscar todos os módulos do tema
      const { data: themeModules, error: themeModulesError } = await supabaseAdmin
        .from('theme_modules')
        .select('id, theme_id')
        .eq('theme_id', `theme-${courseId}-${moduleId.split('-')[2]}`)

      if (!themeModulesError && themeModules) {
        // Verificar quantos módulos do tema estão concluídos
        const { data: completedModules, error: completedModulesError } = await supabaseAdmin
          .from('student_module_progress')
          .select('id')
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .in('module_id', themeModules.map(m => m.id))

        if (!completedModulesError) {
          const themeProgress = Math.round((completedModules.length / themeModules.length) * 100)

          // Atualizar progresso do tema
          await supabaseAdmin
            .from('student_theme_progress')
            .upsert({
              student_id: studentId,
              theme_id: `theme-${courseId}-${moduleId.split('-')[2]}`,
              progress: themeProgress,
              status: themeProgress === 100 ? 'completed' : 'in_progress',
              updated_at: new Date().toISOString()
            })
        }
      }

      // 3. Atualizar progresso geral do curso
      // Buscar todos os módulos do curso
      const { data: courseModules, error: courseModulesError } = await supabaseAdmin
        .from('theme_modules tm')
        .select('tm.id')
        .join('course_themes ct', 'tm.theme_id = ct.id')
        .eq('ct.course_id', courseId)

      if (!courseModulesError && courseModules) {
        // Verificar quantos módulos do curso estão concluídos
        const { data: completedCourseModules, error: completedCourseModulesError } = await supabaseAdmin
          .from('student_module_progress')
          .select('id')
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .in('module_id', courseModules.map(m => m.id))

        if (!completedCourseModulesError) {
          const courseProgress = Math.round((completedCourseModules.length / courseModules.length) * 100)

          // Atualizar progresso do curso
          await supabaseAdmin
            .from('student_course_enrollments')
            .update({
              overall_progress: courseProgress,
              status: courseProgress === 100 ? 'completed' : 'enrolled',
              updated_at: new Date().toISOString()
            })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
        }
      }
    }

    console.log('✅ Progresso salvo com sucesso:', result)

    return NextResponse.json({
      message: 'Progresso salvo com sucesso',
      progress: result
    })

  } catch (error) {
    console.error('💥 Erro ao salvar progresso:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// GET - Buscar progresso do módulo
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

    const studentId = studentAuth.studentId || studentAuth.id
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const courseId = searchParams.get('courseId')

    if (!moduleId) {
      return NextResponse.json(
        { message: 'moduleId é obrigatório' },
        { status: 400 }
      )
    }

    const { data: progress, error } = await supabaseAdmin
      .from('student_module_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .maybeSingle()

    if (error) {
      console.error('❌ Erro ao buscar progresso:', error)
      return NextResponse.json(
        { message: 'Erro ao buscar progresso' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      progress: progress || null
    })

  } catch (error) {
    console.error('💥 Erro ao buscar progresso:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}