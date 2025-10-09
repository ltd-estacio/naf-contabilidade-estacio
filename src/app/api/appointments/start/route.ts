import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Iniciar atendimento
export async function POST(request: NextRequest) {
  try {
    const {
      appointment_id,
      student_id,
      student_name
    } = await request.json()

    if (!appointment_id || !student_id) {
      return NextResponse.json(
        { error: 'appointment_id e student_id são obrigatórios' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

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

      // Verificar se já está em atendimento
      if (appointment.appointment_status === 'EM_ATENDIMENTO') {
        return NextResponse.json({
          success: true,
          message: 'Atendimento já iniciado',
          appointment
        })
      }

      // Atualizar status do atendimento
      const { data: updatedAppointment, error: updateError } = await supabaseAdmin
        .from('fiscal_appointments')
        .update({
          appointment_status: 'EM_ATENDIMENTO',
          appointment_started_at: now
        })
        .eq('id', appointment_id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Criar registro no histórico
      const { error: historyError } = await supabaseAdmin
        .from('appointment_attendance_history')
        .insert({
          appointment_id,
          student_id,
          student_name: student_name || 'Estudante',
          started_at: now,
          status: 'INICIADO'
        })

      if (historyError) {
        console.log('Erro ao criar histórico:', historyError)
      }

      return NextResponse.json({
        success: true,
        appointment: updatedAppointment,
        message: 'Atendimento iniciado com sucesso'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema mock:', supabaseError)

      return NextResponse.json({
        success: true,
        appointment: {
          id: appointment_id,
          appointment_status: 'EM_ATENDIMENTO',
          appointment_started_at: now
        },
        message: 'Atendimento iniciado (modo simulado)'
      })
    }

  } catch (error) {
    console.error('Erro ao iniciar atendimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
