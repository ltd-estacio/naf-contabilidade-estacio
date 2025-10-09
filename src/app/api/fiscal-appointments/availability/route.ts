import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar todos os agendamentos para a data específica
    const { data: appointments, error } = await supabase
      .from('fiscal_appointments')
      .select('preferred_time, status')
      .eq('preferred_date', date)
      .in('status', ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'])

    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar disponibilidade' },
        { status: 500 }
      )
    }

    // Horários disponíveis do NAF
    const allTimeSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ]

    // Criar conjunto de horários ocupados
    const occupiedTimes = new Set(
      appointments?.map(apt => apt.preferred_time) || []
    )

    // Criar array de slots com status de disponibilidade
    const timeSlots = allTimeSlots.map(time => ({
      time,
      available: !occupiedTimes.has(time),
      status: occupiedTimes.has(time) ? 'ocupado' : 'disponivel'
    }))

    return NextResponse.json({
      date,
      slots: timeSlots,
      totalSlots: allTimeSlots.length,
      availableSlots: timeSlots.filter(s => s.available).length,
      occupiedSlots: timeSlots.filter(s => !s.available).length
    })

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
