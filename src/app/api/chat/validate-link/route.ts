import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Validar link de acesso ao chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkToken = searchParams.get('token')
    const linkSlug = searchParams.get('slug')

    if (!linkToken && !linkSlug) {
      return NextResponse.json(
        { valid: false, error: 'Token ou slug é obrigatório' },
        { status: 400 }
      )
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Buscar link
    let query = client
      .from('chat_access_links')
      .select('*')

    if (linkToken) {
      query = query.eq('link_token', linkToken)
    } else if (linkSlug) {
      query = query.eq('link_slug', linkSlug)
    }

    const { data: link, error } = await query.single()

    if (error || !link) {
      return NextResponse.json({
        valid: false,
        error: 'Link não encontrado'
      }, { status: 404 })
    }

    // Verificar se o link está ativo
    if (!link.is_active) {
      return NextResponse.json({
        valid: false,
        error: 'Link desativado',
        reason: 'inactive'
      }, { status: 403 })
    }

    // Verificar se o link expirou
    if (link.expires_at) {
      const expirationDate = new Date(link.expires_at)
      const now = new Date()
      if (now > expirationDate) {
        return NextResponse.json({
          valid: false,
          error: 'Link expirado',
          reason: 'expired',
          expiredAt: link.expires_at
        }, { status: 403 })
      }
    }

    // Verificar limite de usos
    if (link.max_uses !== null && link.current_uses >= link.max_uses) {
      return NextResponse.json({
        valid: false,
        error: 'Limite de usos atingido',
        reason: 'max_uses_reached',
        maxUses: link.max_uses,
        currentUses: link.current_uses
      }, { status: 403 })
    }

    // Link válido!
    return NextResponse.json({
      valid: true,
      link: {
        id: link.id,
        token: link.link_token,
        slug: link.link_slug,
        title: link.title,
        description: link.description,
        customMessage: link.custom_message,
        studentName: link.created_by_student_name,
        createdAt: link.created_at
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao validar link:', error)
    return NextResponse.json({
      valid: false,
      error: error.message || 'Erro interno'
    }, { status: 500 })
  }
}

// POST - Registrar uso do link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      linkToken,
      linkSlug,
      userIp,
      userAgent,
      userId,
      conversationId
    } = body

    if (!linkToken && !linkSlug) {
      return NextResponse.json(
        { error: 'Token ou slug é obrigatório' },
        { status: 400 }
      )
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Buscar link
    let query = client
      .from('chat_access_links')
      .select('*')

    if (linkToken) {
      query = query.eq('link_token', linkToken)
    } else if (linkSlug) {
      query = query.eq('link_slug', linkSlug)
    }

    const { data: link, error: linkError } = await query.single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
    }

    // Registrar uso
    const { error: logError } = await client
      .from('chat_link_usage_logs')
      .insert({
        link_id: link.id,
        link_token: link.link_token,
        user_ip: userIp || null,
        user_agent: userAgent || null,
        user_id: userId || null,
        conversation_id: conversationId || null
      })

    if (logError) {
      console.error('Erro ao registrar uso do link:', logError)
      // Não retornar erro, apenas logar
    }

    // Atualizar contadores do link
    const { error: updateError } = await client
      .from('chat_access_links')
      .update({
        current_uses: (link.current_uses || 0) + 1,
        last_used_at: new Date().toISOString(),
        total_conversations_started: conversationId
          ? (link.total_conversations_started || 0) + 1
          : link.total_conversations_started
      })
      .eq('id', link.id)

    if (updateError) {
      console.error('Erro ao atualizar contadores do link:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Uso registrado com sucesso'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao registrar uso do link:', error)
    return NextResponse.json({
      error: error.message || 'Erro interno'
    }, { status: 500 })
  }
}
