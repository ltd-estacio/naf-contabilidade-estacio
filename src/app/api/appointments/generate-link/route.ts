import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

// POST - Gerar link único para atendimento
export async function POST(request: NextRequest) {
  try {
    const {
      appointment_id,
      student_id,
      expires_in_hours = 48 // Padrão: 48 horas
    } = await request.json()

    if (!appointment_id || !student_id) {
      return NextResponse.json(
        { error: 'appointment_id e student_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar token único e seguro
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000)

    try {
      // Verificar se o atendimento existe e pertence ao estudante
      const { data: appointment, error: checkError } = await supabaseAdmin
        .from('fiscal_appointments')
        .select('*')
        .eq('id', appointment_id)
        .eq('assigned_student_id', student_id)
        .single()

      if (checkError || !appointment) {
        return NextResponse.json(
          { error: 'Atendimento não encontrado ou você não tem permissão' },
          { status: 404 }
        )
      }

      // Verificar se já existe um link válido
      if (appointment.chat_link_token &&
          appointment.chat_link_expires_at &&
          new Date(appointment.chat_link_expires_at) > new Date()) {

        const existingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/atendimento/${appointment.chat_link_token}`

        return NextResponse.json({
          success: true,
          token: appointment.chat_link_token,
          link: existingLink,
          expires_at: appointment.chat_link_expires_at,
          message: 'Link existente ainda válido'
        })
      }

      // Atualizar o atendimento com o novo token
      const { data: updatedAppointment, error: updateError } = await supabaseAdmin
        .from('fiscal_appointments')
        .update({
          chat_link_token: token,
          chat_link_generated_at: new Date().toISOString(),
          chat_link_expires_at: expiresAt.toISOString(),
          chat_link_used: false
        })
        .eq('id', appointment_id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/atendimento/${token}`

      return NextResponse.json({
        success: true,
        token,
        link,
        expires_at: expiresAt.toISOString(),
        appointment: updatedAppointment
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema mock:', supabaseError)

      // Fallback: armazenar em memória (apenas para desenvolvimento)
      if (!global.appointmentLinks) {
        global.appointmentLinks = new Map()
      }

      global.appointmentLinks.set(token, {
        appointment_id,
        student_id,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })

      const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/atendimento/${token}`

      return NextResponse.json({
        success: true,
        token,
        link,
        expires_at: expiresAt.toISOString(),
        message: 'Link gerado (modo simulado)'
      })
    }

  } catch (error) {
    console.error('Erro ao gerar link:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
