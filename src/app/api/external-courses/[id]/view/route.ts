import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    // Incrementar contador de visualizações
    const { data, error } = await supabase.rpc('increment_course_views', {
      course_id: parseInt(courseId)
    })

    // Se a função RPC não existir, fazer manualmente
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      const { data: course, error: fetchError } = await supabase
        .from('external_courses')
        .select('views_count')
        .eq('id', courseId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const { error: updateError } = await supabase
        .from('external_courses')
        .update({ views_count: (course.views_count || 0) + 1 })
        .eq('id', courseId)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({ success: true })
    }

    if (error) {
      console.error('Erro ao incrementar views:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar visualização' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
