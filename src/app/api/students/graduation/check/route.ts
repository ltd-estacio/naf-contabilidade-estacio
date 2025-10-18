import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Executar a função que verifica e marca estudantes graduados
    const { data, error } = await supabase.rpc('check_and_mark_graduated_students')

    if (error) {
      console.error('Erro ao verificar estudantes graduados:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      studentsProcessed: data || [],
      totalProcessed: data?.length || 0
    })
  } catch (error) {
    console.error('Erro ao processar verificação de graduados:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar verificação' },
      { status: 500 }
    )
  }
}
