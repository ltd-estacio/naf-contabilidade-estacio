import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Listar links do estudante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'ID do estudante é obrigatório' }, { status: 400 })
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Buscar links do estudante
    const { data: links, error } = await client
      .from('chat_access_links')
      .select('*')
      .eq('created_by_student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar links:', error)
      return NextResponse.json({ error: 'Erro ao buscar links' }, { status: 500 })
    }

    // Buscar estatísticas de uso
    const { data: stats, error: statsError } = await client
      .from('chat_link_statistics')
      .select('*')
      .eq('created_by_student_id', studentId)

    if (statsError) {
      console.error('Erro ao buscar estatísticas:', statsError)
    }

    // Combinar dados
    const linksWithStats = links.map(link => {
      const stat = stats?.find(s => s.id === link.id)
      return {
        ...link,
        statistics: stat || {
          total_accesses: 0,
          unique_users: 0,
          conversations_created: 0,
          last_access_date: null
        }
      }
    })

    return NextResponse.json({ links: linksWithStats }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao listar links:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar novo link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      studentName,
      title,
      description,
      customMessage,
      maxUses,
      expiresInDays
    } = body

    if (!studentId || !studentName) {
      return NextResponse.json(
        { error: 'ID e nome do estudante são obrigatórios' },
        { status: 400 }
      )
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Gerar token único
    const { data: tokenData, error: tokenError } = await client
      .rpc('generate_chat_link_token')

    if (tokenError) {
      console.error('Erro ao gerar token:', tokenError)
      return NextResponse.json({ error: 'Erro ao gerar token' }, { status: 500 })
    }

    const linkToken = tokenData as string

    // Gerar slug amigável
    const { data: slugData, error: slugError } = await client
      .rpc('generate_chat_link_slug', { student_name: studentName })

    if (slugError) {
      console.error('Erro ao gerar slug:', slugError)
      return NextResponse.json({ error: 'Erro ao gerar slug' }, { status: 500 })
    }

    const linkSlug = slugData as string

    // Calcular data de expiração
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + expiresInDays)
      expiresAt = expireDate.toISOString()
    }

    // Criar link
    const { data: newLink, error: createError } = await client
      .from('chat_access_links')
      .insert({
        link_token: linkToken,
        link_slug: linkSlug,
        created_by_student_id: studentId,
        created_by_student_name: studentName,
        title: title || 'Chat NAF - Assistente Virtual',
        description: description || null,
        custom_message: customMessage || null,
        max_uses: maxUses || null,
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar link:', createError)
      return NextResponse.json({ error: 'Erro ao criar link' }, { status: 500 })
    }

    console.log('✅ Link criado:', newLink)

    // Gerar URLs completas
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const linkUrl = `${baseUrl}/chat?link=${linkToken}`
    const slugUrl = `${baseUrl}/chat/${linkSlug}`

    return NextResponse.json({
      success: true,
      link: {
        ...newLink,
        linkUrl,
        slugUrl
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar link:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

// PATCH - Atualizar link
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      linkId,
      studentId,
      isActive,
      title,
      description,
      maxUses
    } = body

    if (!linkId || !studentId) {
      return NextResponse.json(
        { error: 'ID do link e estudante são obrigatórios' },
        { status: 400 }
      )
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Verificar se o link pertence ao estudante
    const { data: existingLink, error: checkError } = await client
      .from('chat_access_links')
      .select('*')
      .eq('id', linkId)
      .eq('created_by_student_id', studentId)
      .single()

    if (checkError || !existingLink) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
    }

    // Atualizar link
    const updateData: any = {}
    if (typeof isActive === 'boolean') updateData.is_active = isActive
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (maxUses !== undefined) updateData.max_uses = maxUses

    const { data: updatedLink, error: updateError } = await client
      .from('chat_access_links')
      .update(updateData)
      .eq('id', linkId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar link:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar link' }, { status: 500 })
    }

    return NextResponse.json({ success: true, link: updatedLink }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao atualizar link:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Deletar link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    const studentId = searchParams.get('studentId')

    if (!linkId || !studentId) {
      return NextResponse.json(
        { error: 'ID do link e estudante são obrigatórios' },
        { status: 400 }
      )
    }

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Verificar se o link pertence ao estudante
    const { data: existingLink, error: checkError } = await client
      .from('chat_access_links')
      .select('*')
      .eq('id', linkId)
      .eq('created_by_student_id', studentId)
      .single()

    if (checkError || !existingLink) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
    }

    // Deletar link
    const { error: deleteError } = await client
      .from('chat_access_links')
      .delete()
      .eq('id', linkId)

    if (deleteError) {
      console.error('Erro ao deletar link:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar link' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Link deletado com sucesso' }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao deletar link:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
