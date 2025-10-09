import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Validar link de atendimento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'token é obrigatório', valid: false },
        { status: 400 }
      )
    }

    try {
      // Buscar atendimento pelo token
      const { data: appointment, error } = await supabaseAdmin
        .from('fiscal_appointments')
        .select('*')
        .eq('chat_link_token', token)
        .single()

      if (error || !appointment) {
        return NextResponse.json({
          valid: false,
          error: 'Link inválido ou não encontrado'
        })
      }

      // Verificar se o link expirou
      if (new Date(appointment.chat_link_expires_at) <= new Date()) {
        return NextResponse.json({
          valid: false,
          error: 'Link expirado',
          expired: true
        })
      }

      // Registrar acesso ao link
      try {
        const ipAddress = request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         'unknown'

        const userAgent = request.headers.get('user-agent') || 'unknown'

        await supabaseAdmin
          .from('appointment_link_access_logs')
          .insert({
            appointment_id: appointment.id,
            chat_link_token: token,
            ip_address: ipAddress,
            user_agent: userAgent,
            access_granted: true
          })
      } catch (logError) {
        console.log('Erro ao registrar log de acesso:', logError)
      }

      // Marcar link como usado (se ainda não foi)
      if (!appointment.chat_link_used) {
        await supabaseAdmin
          .from('fiscal_appointments')
          .update({
            chat_link_used: true,
            chat_link_used_at: new Date().toISOString()
          })
          .eq('id', appointment.id)
      }

      return NextResponse.json({
        valid: true,
        appointment: {
          id: appointment.id,
          protocol: appointment.protocol,
          service_type: appointment.service_type,
          service_title: appointment.service_title,
          scheduled_datetime: appointment.scheduled_datetime,
          student_id: appointment.assigned_student_id
        }
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, verificando sistema mock:', supabaseError)

      // Fallback: verificar em memória
      if (global.appointmentLinks && global.appointmentLinks.has(token)) {
        const linkData = global.appointmentLinks.get(token)

        if (new Date(linkData.expires_at) <= new Date()) {
          return NextResponse.json({
            valid: false,
            error: 'Link expirado',
            expired: true
          })
        }

        return NextResponse.json({
          valid: true,
          appointment: {
            id: linkData.appointment_id,
            protocol: `NAF-MOCK-${linkData.appointment_id}`,
            service_type: 'IRPF',
            service_title: 'Atendimento Fiscal',
            scheduled_datetime: new Date().toISOString(),
            student_id: linkData.student_id
          }
        })
      }

      return NextResponse.json({
        valid: false,
        error: 'Link não encontrado'
      })
    }

  } catch (error) {
    console.error('Erro ao validar link:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', valid: false },
      { status: 500 }
    )
  }
}
