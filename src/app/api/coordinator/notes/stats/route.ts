import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const coordinator_id = 'coordinator@estacio.br'

    const { data, error } = await supabase
      .rpc('get_coordinator_notes_stats', { p_coordinator_id: coordinator_id })

    if (error) throw error

    return NextResponse.json({ stats: data || {} })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
