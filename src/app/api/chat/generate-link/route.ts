import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, expirationHours = 24 } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome do link é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate unique token and slug
    const token = randomBytes(32).toString('hex')
    const slug = randomBytes(8).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expirationHours)

    // Store link in database using existing chat_access_links table
    const { data, error } = await supabase
      .from('chat_access_links')
      .insert({
        link_token: token,
        link_slug: slug,
        title: name,
        description: `Link de acesso gerado para ${name}`,
        custom_message: 'Bem-vindo ao Chat NAF! Como posso ajudá-lo hoje?',
        expires_at: expiresAt.toISOString(),
        is_active: true,
        max_uses: null, // unlimited uses
        current_uses: 0,
        total_conversations_started: 0,
        created_by_coordinator: true,
        created_by_student_name: 'Coordenador'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chat access link:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar link de acesso' },
        { status: 500 }
      )
    }

    // Generate full URL with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const linkUrl = `${baseUrl}?chat_token=${token}`

    return NextResponse.json({
      success: true,
      link: {
        url: linkUrl,
        token,
        slug,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in generate-link API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
