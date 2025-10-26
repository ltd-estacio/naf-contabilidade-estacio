import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('naf_services')
      .select('*')
      .eq('status', 'ativo')
      .order('priority_order', { ascending: true })

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar serviços' },
        { status: 500 }
      )
    }

    // Retornar diretamente o array para compatibilidade
    return NextResponse.json(services || [])
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, category, requirements, duration } = body

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Nome, descrição e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: service, error } = await supabase
      .from('naf_services')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        category,
        required_documents: requirements ? [requirements] : [],
        estimated_duration_minutes: duration || 60,
        status: 'ativo'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar serviço:', error)
      return NextResponse.json(
        { error: 'Erro ao criar serviço' },
        { status: 500 }
      )
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, category, requirements, duration, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }

    const { data: service, error } = await supabase
      .from('naf_services')
      .update({
        name,
        description,
        category,
        required_documents: requirements ? [requirements] : [],
        estimated_duration_minutes: duration,
        status: isActive ? 'ativo' : 'inativo'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar serviço:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar serviço' },
        { status: 500 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }

    // Desativar em vez de deletar para manter histórico
    const { data: service, error } = await supabase
      .from('naf_services')
      .update({ status: 'inativo' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao desativar serviço:', error)
      return NextResponse.json(
        { error: 'Erro ao desativar serviço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Serviço desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao desativar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
