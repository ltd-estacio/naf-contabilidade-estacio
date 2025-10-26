import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar serviços NAF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const popular = searchParams.get('popular')
    const status = searchParams.get('status') || 'ativo'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('naf_services')
      .select('*')
      .eq('status', status)
      .order('priority_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtros opcionais
    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (popular === 'true') {
      query = query.eq('is_popular', true)
    }

    const { data: services, error, count } = await query

    if (error) {
      console.error('Erro ao buscar serviços NAF:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      services,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    })

  } catch (error) {
    console.error('Erro na API de serviços NAF:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      slug,
      description,
      detailed_description,
      category,
      subcategory,
      difficulty = 'basico',
      is_featured = false,
      is_popular = false,
      priority_order = 0,
      estimated_duration_minutes,
      required_documents,
      prerequisites,
      icon_name,
      color_scheme = 'blue',
      process_steps
    } = body

    if (!name || !slug || !description || !category) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, slug, description, category' },
        { status: 400 }
      )
    }

    const { data: service, error } = await supabase
      .from('naf_services')
      .insert({
        name,
        slug,
        description,
        detailed_description,
        category,
        subcategory,
        difficulty,
        is_featured,
        is_popular,
        priority_order,
        estimated_duration_minutes,
        required_documents,
        prerequisites,
        icon_name,
        color_scheme,
        process_steps
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar serviço NAF:', error)
      return NextResponse.json(
        { error: 'Erro ao criar serviço', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(service, { status: 201 })

  } catch (error) {
    console.error('Erro na criação de serviço NAF:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}