import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET - Verificar slots disponíveis para uma data específica
 * Considera os agendamentos já existentes e o limite de vagas
 */
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

    console.log('🔍 Verificando slots para data:', date)

    // 1. Buscar configurações de disponibilidade
    const dateObj = new Date(date + 'T00:00:00')
    const dayOfWeek = dateObj.getDay() // 0=Domingo, 6=Sábado

    const { data: availabilityConfig, error: availError } = await supabase
      .from('scheduling_availability')
      .select('*')
      .eq('is_active', true)

    if (availError) {
      console.error('Erro ao buscar disponibilidade:', availError)
      return NextResponse.json(
        { error: 'Erro ao buscar disponibilidade' },
        { status: 500 }
      )
    }

    console.log('📊 Configurações encontradas:', availabilityConfig?.length || 0)

    // 2. Verificar se o dia está bloqueado
    const dateBlock = availabilityConfig?.find(
      (config) =>
        config.type === 'blocked' &&
        config.specific_date === date &&
        config.is_active
    )

    const dayBlock = availabilityConfig?.find(
      (config) =>
        config.type === 'blocked' &&
        config.day_of_week === dayOfWeek &&
        !config.specific_date &&
        config.is_active
    )

    if (dateBlock || dayBlock) {
      const blockInfo = dateBlock || dayBlock
      console.log('🚫 Dia bloqueado:', blockInfo.reason)
      return NextResponse.json({
        isBlocked: true,
        reason: blockInfo.reason || 'Data indisponível para agendamentos',
        timeSlots: []
      })
    }

    // 3. Buscar horários configurados para este dia
    const availableConfigs = availabilityConfig?.filter(
      (config) =>
        config.type === 'available' &&
        ((config.specific_date === date) ||
          (config.day_of_week === dayOfWeek && !config.specific_date))
    )

    console.log('✅ Configurações disponíveis:', availableConfigs?.length || 0)

    // 4. Buscar todos os agendamentos existentes para esta data
    const { data: existingAppointments, error: appointError } = await supabase
      .from('fiscal_appointments')
      .select('preferred_date, preferred_time, status')
      .eq('preferred_date', dateObj.toISOString().split('T')[0])
      .in('status', ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'])
      .eq('is_deleted', false)

    if (appointError) {
      console.error('Erro ao buscar agendamentos:', appointError)
    }

    console.log('📅 Agendamentos existentes:', existingAppointments?.length || 0)

    // 5. Gerar slots de horário
    const timeSlots = []
    const defaultTimes = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30'
    ]

    for (const time of defaultTimes) {
      // Verificar se há configuração específica para este horário
      const config = availableConfigs?.find((c) => {
        const slotTime = time
        return slotTime >= c.start_time && slotTime < c.end_time
      })

      // Se não há configuração disponível, o horário não está disponível
      if (!config) {
        continue
      }

      // Contar quantos agendamentos já existem para este horário
      const appointmentsAtTime = existingAppointments?.filter(
        (app) => app.preferred_time === time
      ).length || 0

      // Determinar o número máximo de vagas
      const maxSlots = config.max_appointments || 1

      // Calcular vagas restantes
      const slotsRemaining = Math.max(0, maxSlots - appointmentsAtTime)

      console.log(`⏰ ${time}: ${appointmentsAtTime}/${maxSlots} ocupados, ${slotsRemaining} restantes`)

      timeSlots.push({
        time,
        is_available: slotsRemaining > 0,
        slots_remaining: slotsRemaining,
        reason: slotsRemaining === 0 ? 'Horário totalmente ocupado' : null,
        max_appointments: maxSlots,
        current_appointments: appointmentsAtTime
      })
    }

    // Se não há slots configurados, usar horários padrão com limite de 1 vaga
    if (timeSlots.length === 0) {
      console.log('⚠️ Nenhum slot configurado, usando horários padrão')
      
      for (const time of defaultTimes) {
        // Verificar se o horário está dentro do horário comercial padrão
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a Sexta
          const appointmentsAtTime = existingAppointments?.filter(
            (app) => app.preferred_time === time
          ).length || 0

          const slotsRemaining = appointmentsAtTime === 0 ? 1 : 0

          timeSlots.push({
            time,
            is_available: slotsRemaining > 0,
            slots_remaining: slotsRemaining,
            reason: slotsRemaining === 0 ? 'Horário já ocupado' : null,
            max_appointments: 1,
            current_appointments: appointmentsAtTime
          })
        }
      }
    }

    console.log(`✅ Total de slots gerados: ${timeSlots.length}`)
    console.log(`✅ Slots disponíveis: ${timeSlots.filter(s => s.is_available).length}`)

    return NextResponse.json({
      isBlocked: false,
      timeSlots: timeSlots.filter(slot => slot.is_available || slot.current_appointments > 0) // Retornar também os ocupados para mostrar ao usuário
    })

  } catch (error: any) {
    console.error('❌ Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
