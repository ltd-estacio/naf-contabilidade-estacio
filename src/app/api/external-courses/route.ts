import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Listar todos os cursos externos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') !== 'false'

    let query = supabase
      .from('external_courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar cursos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar cursos externos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ courses: data || [] })
  } catch (error) {
    console.error('Erro no GET:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo curso externo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      course_url,
      platform,
      category,
      difficulty_level,
      duration,
      thumbnail_url,
      created_by
    } = body

    // Validações
    if (!title || !course_url) {
      return NextResponse.json(
        { error: 'Título e URL são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(course_url)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('external_courses')
      .insert({
        title,
        description,
        course_url,
        platform,
        category,
        difficulty_level,
        duration,
        thumbnail_url,
        created_by: created_by || 'system',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar curso:', error)
      return NextResponse.json(
        { error: 'Erro ao criar curso externo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ course: data }, { status: 201 })
  } catch (error) {
    console.error('Erro no POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar curso externo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do curso é obrigatório' },
        { status: 400 }
      )
    }

    // Se estiver atualizando URL, validar
    if (updates.course_url) {
      try {
        new URL(updates.course_url)
      } catch {
        return NextResponse.json(
          { error: 'URL inválida' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('external_courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar curso:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar curso externo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ course: data })
  } catch (error) {
    console.error('Erro no PUT:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover curso externo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do curso é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('external_courses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar curso:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar curso externo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Curso removido com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
