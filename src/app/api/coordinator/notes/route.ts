import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // TODO: Pegar coordinator_id da sessão
    const coordinator_id = 'coordinator@estacio.br' // Placeholder

    const { data, error } = await supabase
      .from('coordinator_notes')
      .select('*')
      .eq('coordinator_id', coordinator_id)
      .eq('status', 'ACTIVE')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ notes: data || [] })
  } catch (error) {
    console.error('Erro ao buscar anotações:', error)
    return NextResponse.json({ error: 'Erro ao buscar anotações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, priority, tags, is_private } = body

    // TODO: Pegar coordinator_id e dados da sessão
    const coordinator_id = 'coordinator@estacio.br'
    const coordinator_name = 'Coordenador NAF'
    const coordinator_email = 'coordinator@estacio.br'

    // Calcular word count e reading time
    const word_count = content.split(/\s+/).filter(Boolean).length
    const reading_time_minutes = Math.ceil(word_count / 200)

    const { data, error } = await supabase
      .from('coordinator_notes')
      .insert({
        coordinator_id,
        coordinator_name,
        coordinator_email,
        title,
        content,
        category,
        priority,
        tags,
        is_private,
        word_count,
        reading_time_minutes,
        note_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, note: data })
  } catch (error) {
    console.error('Erro ao criar anotação:', error)
    return NextResponse.json({ error: 'Erro ao criar anotação' }, { status: 500 })
  }
}
