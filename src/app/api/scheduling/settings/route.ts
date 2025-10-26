import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

/**
 * GET - Obter configurações globais de agendamento
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('scheduling_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single()

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings: data })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar configurações globais de agendamento
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      min_advance_hours,
      max_advance_days,
      default_start_time,
      default_end_time,
      slot_duration_minutes,
      default_working_days,
      blocked_dates,
      send_confirmation_email,
      send_reminder_email,
      reminder_hours_before,
      updated_by
    } = body

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
      updated_by
    }

    if (min_advance_hours !== undefined) updateData.min_advance_hours = min_advance_hours
    if (max_advance_days !== undefined) updateData.max_advance_days = max_advance_days
    if (default_start_time) updateData.default_start_time = default_start_time
    if (default_end_time) updateData.default_end_time = default_end_time
    if (slot_duration_minutes) updateData.slot_duration_minutes = slot_duration_minutes
    if (default_working_days) updateData.default_working_days = default_working_days
    if (blocked_dates) updateData.blocked_dates = blocked_dates
    if (send_confirmation_email !== undefined) updateData.send_confirmation_email = send_confirmation_email
    if (send_reminder_email !== undefined) updateData.send_reminder_email = send_reminder_email
    if (reminder_hours_before !== undefined) updateData.reminder_hours_before = reminder_hours_before

    const { data, error } = await supabase
      .from('scheduling_settings')
      .update(updateData)
      .eq('id', SETTINGS_ID)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configurações:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      settings: data
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
