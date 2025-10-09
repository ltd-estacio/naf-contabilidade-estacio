import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    console.log('📅 Appointments API - Criando agendamento')

    const {
      user_id,
      conversation_id,
      scheduled_date,
      scheduled_time,
      service_type,
      service_description,
      priority = 'normal',
      notes
    } = await request.json()

    // Validações básicas
    if (!user_id || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: 'user_id, scheduled_date e scheduled_time são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar data não pode ser no passado
    const appointmentDate = new Date(`${scheduled_date}T${scheduled_time}`)
    if (appointmentDate <= new Date()) {
      return NextResponse.json(
        { error: 'Data/hora do agendamento deve ser no futuro' },
        { status: 400 }
      )
    }

    const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Verificar se já existe agendamento para o mesmo horário
      const { data: existingAppointment, error: checkError } = await supabaseAdmin
        .from('chat_appointments')
        .select('id')
        .eq('scheduled_date', scheduled_date)
        .eq('scheduled_time', scheduled_time)
        .eq('status', 'scheduled')
        .single()

      if (existingAppointment) {
        return NextResponse.json(
          { error: 'Já existe um agendamento para este horário' },
          { status: 409 }
        )
      }

      // Criar novo agendamento
      const newAppointment = {
        id: appointmentId,
        user_id,
        conversation_id,
        scheduled_date,
        scheduled_time,
        scheduled_datetime: appointmentDate.toISOString(),
        service_type: service_type || 'Consultoria Geral',
        service_description: service_description || '',
        priority,
        notes: notes || '',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdAppointment, error: insertError } = await supabaseAdmin
        .from('chat_appointments')
        .insert(newAppointment)
        .select(`
          *,
          chat_users!inner(id, name, email, phone)
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      console.log('✅ Agendamento criado com sucesso:', appointmentId)

      return NextResponse.json({
        success: true,
        appointment: createdAppointment,
        message: 'Agendamento criado com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema de fallback:', supabaseError)

      // Fallback: usar sistema local
      const mockAppointment = {
        id: appointmentId,
        user_id,
        conversation_id,
        scheduled_date,
        scheduled_time,
        scheduled_datetime: appointmentDate.toISOString(),
        service_type: service_type || 'Consultoria Geral',
        service_description: service_description || '',
        priority,
        notes: notes || '',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user_id,
          name: 'Usuário Teste',
          email: 'teste@exemplo.com',
          phone: '(48) 99999-9999'
        }
      }

      // Armazenar localmente
      if (!global.chatAppointments) {
        global.chatAppointments = new Map()
      }
      global.chatAppointments.set(appointmentId, mockAppointment)

      console.log('✅ Agendamento criado no sistema local:', appointmentId)

      return NextResponse.json({
        success: true,
        appointment: mockAppointment,
        message: 'Agendamento criado com sucesso! (modo desenvolvimento)'
      })
    }

  } catch (error) {
    console.error('💥 Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const coordinatorId = searchParams.get('coordinator_id')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'

    try {
      let query = supabaseAdmin
        .from('chat_appointments')
        .select(`
          *,
          chat_users!inner(id, name, email, phone, cpf, city, state)
        `)

      // Filtros
      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (coordinatorId) {
        query = query.eq('coordinator_id', coordinatorId)
      }

      if (date) {
        query = query.eq('scheduled_date', date)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (upcoming) {
        query = query.gte('scheduled_datetime', new Date().toISOString())
      }

      const { data: appointments, error } = await query
        .order('scheduled_datetime', { ascending: true })

      if (error) {
        throw error
      }

      return NextResponse.json({
        appointments: appointments || [],
        total: appointments?.length || 0
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: buscar no sistema local
      let appointments = []
      if (global.chatAppointments) {
        appointments = Array.from(global.chatAppointments.values())

        // Aplicar filtros
        if (userId) {
          appointments = appointments.filter(appt => appt.user_id === userId)
        }
        if (coordinatorId) {
          appointments = appointments.filter(appt => appt.coordinator_id === coordinatorId)
        }
        if (date) {
          appointments = appointments.filter(appt => appt.scheduled_date === date)
        }
        if (status) {
          appointments = appointments.filter(appt => appt.status === status)
        }
        if (upcoming) {
          const now = new Date().toISOString()
          appointments = appointments.filter(appt => appt.scheduled_datetime >= now)
        }

        // Ordenar por data
        appointments.sort((a, b) => a.scheduled_datetime.localeCompare(b.scheduled_datetime))
      }

      return NextResponse.json({
        appointments,
        total: appointments.length
      })
    }

  } catch (error) {
    console.error('💥 Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const {
      appointment_id,
      coordinator_id,
      status,
      notes,
      scheduled_date,
      scheduled_time,
      service_type,
      service_description
    } = await request.json()

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id é obrigatório' },
        { status: 400 }
      )
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Adicionar campos que foram fornecidos
    if (coordinator_id) updateData.coordinator_id = coordinator_id
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (service_type) updateData.service_type = service_type
    if (service_description !== undefined) updateData.service_description = service_description

    // Se mudou data/hora, validar e atualizar
    if (scheduled_date && scheduled_time) {
      const appointmentDate = new Date(`${scheduled_date}T${scheduled_time}`)
      if (appointmentDate <= new Date()) {
        return NextResponse.json(
          { error: 'Data/hora do agendamento deve ser no futuro' },
          { status: 400 }
        )
      }
      updateData.scheduled_date = scheduled_date
      updateData.scheduled_time = scheduled_time
      updateData.scheduled_datetime = appointmentDate.toISOString()
    }

    try {
      const { data: updatedAppointment, error } = await supabaseAdmin
        .from('chat_appointments')
        .update(updateData)
        .eq('id', appointment_id)
        .select(`
          *,
          chat_users!inner(id, name, email, phone)
        `)
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        appointment: updatedAppointment,
        message: 'Agendamento atualizado com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: atualizar no sistema local
      if (global.chatAppointments && global.chatAppointments.has(appointment_id)) {
        const existingAppointment = global.chatAppointments.get(appointment_id)
        const updatedAppointment = { ...existingAppointment, ...updateData }
        global.chatAppointments.set(appointment_id, updatedAppointment)

        return NextResponse.json({
          success: true,
          appointment: updatedAppointment,
          message: 'Agendamento atualizado com sucesso! (modo desenvolvimento)'
        })
      }

      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('💥 Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointment_id')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointment_id é obrigatório' },
        { status: 400 }
      )
    }

    try {
      // Atualizar status para cancelado ao invés de deletar
      const { data: cancelledAppointment, error } = await supabaseAdmin
        .from('chat_appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        appointment: cancelledAppointment,
        message: 'Agendamento cancelado com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: cancelar no sistema local
      if (global.chatAppointments && global.chatAppointments.has(appointmentId)) {
        const appointment = global.chatAppointments.get(appointmentId)
        appointment.status = 'cancelled'
        appointment.updated_at = new Date().toISOString()

        return NextResponse.json({
          success: true,
          appointment,
          message: 'Agendamento cancelado com sucesso! (modo desenvolvimento)'
        })
      }

      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('💥 Erro ao cancelar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}