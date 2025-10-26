import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET - Listar todas as configurações de disponibilidade
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type') // 'available' ou 'blocked'

    let query = supabase
      .from('scheduling_availability')
      .select('*')
      .eq('is_active', true)
      .order('specific_date', { ascending: true, nullsFirst: false })
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar disponibilidade' },
        { status: 500 }
      )
    }

    // Se uma data foi especificada, também retornar os slots disponíveis
    if (date) {
      const { data: slotsData, error: slotsError } = await supabase
        .rpc('get_available_time_slots', { p_date: date })

      if (slotsError) {
        console.error('Erro ao buscar slots disponíveis:', slotsError)
      }

      return NextResponse.json({
        availability: data,
        timeSlots: slotsData || []
      })
    }

    return NextResponse.json({ availability: data })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar nova configuração de disponibilidade
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/scheduling/availability - Iniciando...')
    
    const body = await request.json()
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2))
    
    const {
      type,
      specific_date,
      day_of_week,
      start_time,
      end_time,
      reason,
      max_appointments,
      created_by
    } = body

    // Validações
    if (!type || !['available', 'blocked'].includes(type)) {
      console.log('❌ Tipo inválido:', type)
      return NextResponse.json(
        { error: 'Tipo inválido. Use "available" ou "blocked"' },
        { status: 400 }
      )
    }

    if (!start_time || !end_time) {
      console.log('❌ Horários faltando:', { start_time, end_time })
      return NextResponse.json(
        { error: 'Horários de início e fim são obrigatórios' },
        { status: 400 }
      )
    }

    if (!specific_date && day_of_week === undefined) {
      console.log('❌ Data/dia da semana faltando:', { specific_date, day_of_week })
      return NextResponse.json(
        { error: 'Forneça uma data específica ou dia da semana' },
        { status: 400 }
      )
    }

    // Preparar dados para inserção
    const insertData = {
      type,
      specific_date: specific_date || null,
      day_of_week: day_of_week !== undefined ? parseInt(day_of_week) : null,
      start_time,
      end_time,
      reason: reason || null,
      max_appointments: max_appointments || 1,
      created_by: created_by || null,
      is_active: true
    }
    
    console.log('💾 Dados a inserir:', JSON.stringify(insertData, null, 2))
    console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'FALTANDO')
    console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'FALTANDO')

    // Inserir novo registro
    const { data, error } = await supabase
      .from('scheduling_availability')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Erro ao criar disponibilidade', 
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Disponibilidade criada com sucesso:', data)
    return NextResponse.json({
      success: true,
      message: 'Disponibilidade criada com sucesso',
      availability: data
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar requisição:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar configuração de disponibilidade
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID da configuração não fornecido' },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('scheduling_availability')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar disponibilidade', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Disponibilidade atualizada com sucesso',
      data
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remover (desativar) configuração de disponibilidade
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID da configuração não fornecido' },
        { status: 400 }
      )
    }

    // Soft delete - apenas desativar
    const { data, error } = await supabase
      .from('scheduling_availability')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao remover disponibilidade:', error)
      return NextResponse.json(
        { error: 'Erro ao remover disponibilidade', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Disponibilidade removida com sucesso',
      data
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
