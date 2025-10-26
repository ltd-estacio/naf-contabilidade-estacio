import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

async function verifyToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    return decoded
  } catch (error) {
    return null
  }
}

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Notifications - Buscando notificações')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userType = searchParams.get('user_type') || 'student'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { message: 'user_id é obrigatório' },
        { status: 400 }
      )
    }

    // Construir query base
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .eq('recipient_type', userType)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filtrar por status se especificado
    if (status) {
      query = query.eq('status', status)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar notificações:', error)
      return NextResponse.json(
        { message: 'Erro ao buscar notificações', error: error.message },
        { status: 500 }
      )
    }

    // Contar notificações não lidas
    const { count: unreadCount, error: countError } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('recipient_type', userType)
      .eq('status', 'unread')

    if (countError) {
      console.error('❌ Erro ao contar não lidas:', countError)
    }

    console.log(`✅ Encontradas ${notifications?.length || 0} notificações (${unreadCount || 0} não lidas)`)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      total: notifications?.length || 0
    })

  } catch (error) {
    console.error('💥 Erro ao buscar notificações:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Notifications - Criando nova notificação')

    const body = await request.json()
    const {
      recipient_id,
      recipient_type = 'student',
      recipient_email,
      title,
      message,
      notification_type = 'info',
      priority = 'medium',
      metadata = {},
      icon,
      color,
      action_url,
      action_label,
      send_email = false,
      send_push = false,
      send_sms = false,
      is_persistent = false,
      expires_hours,
      related_appointment_id,
      related_training_id,
      created_by
    } = body

    // Validações básicas
    if (!recipient_id || !title || !message) {
      return NextResponse.json(
        { message: 'recipient_id, title e message são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular data de expiração se especificada
    let expires_at = null
    if (expires_hours) {
      const now = new Date()
      expires_at = new Date(now.getTime() + (expires_hours * 60 * 60 * 1000)).toISOString()
    }

    // Inserir notificação
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id,
        recipient_type,
        recipient_email,
        title,
        message,
        notification_type,
        priority,
        metadata,
        icon,
        color,
        action_url,
        action_label,
        send_email,
        send_push,
        send_sms,
        status: 'unread',
        is_persistent,
        expires_at,
        related_appointment_id,
        related_training_id,
        created_by
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar notificação:', error)
      return NextResponse.json(
        { message: 'Erro ao criar notificação', error: error.message },
        { status: 500 }
      )
    }

    // Aqui você pode adicionar lógica para enviar email/push/sms se necessário
    if (send_email || send_push || send_sms) {
      console.log('📧 Notificação programada para envio:', {
        email: send_email,
        push: send_push,
        sms: send_sms
      })
      // TODO: Implementar envio real de notificações
    }

    console.log('✅ Notificação criada:', notification.title)

    return NextResponse.json({
      message: 'Notificação criada com sucesso',
      notification
    })

  } catch (error) {
    console.error('💥 Erro ao criar notificação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status da notificação
export async function PUT(request: NextRequest) {
  try {
    console.log('🔔 Notifications - Atualizando status')

    const body = await request.json()
    const { notification_id, status, action } = body

    if (!notification_id) {
      return NextResponse.json(
        { message: 'notification_id é obrigatório' },
        { status: 400 }
      )
    }

    let updateData: unknown = {}

    if (action === 'mark_read') {
      updateData = {
        status: 'read',
        read_at: new Date().toISOString()
      }
    } else if (action === 'mark_unread') {
      updateData = {
        status: 'unread',
        read_at: null
      }
    } else if (action === 'archive') {
      updateData = {
        status: 'archived',
        archived_at: new Date().toISOString()
      }
    } else if (status) {
      updateData.status = status
      if (status === 'read' && !updateData.read_at) {
        updateData.read_at = new Date().toISOString()
      }
    } else {
      return NextResponse.json(
        { message: 'action ou status é obrigatório' },
        { status: 400 }
      )
    }

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .update(updateData)
      .eq('id', notification_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar notificação:', error)
      return NextResponse.json(
        { message: 'Erro ao atualizar notificação', error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Notificação atualizada:', notification.title, 'Status:', notification.status)

    return NextResponse.json({
      message: 'Notificação atualizada com sucesso',
      notification
    })

  } catch (error) {
    console.error('💥 Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Deletar notificação
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔔 Notifications - Deletando notificação')

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { message: 'ID da notificação é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('❌ Erro ao deletar notificação:', error)
      return NextResponse.json(
        { message: 'Erro ao deletar notificação', error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Notificação deletada:', notificationId)

    return NextResponse.json({
      message: 'Notificação deletada com sucesso'
    })

  } catch (error) {
    console.error('💥 Erro ao deletar notificação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}