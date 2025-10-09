import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Recebendo agendamento:', JSON.stringify(body, null, 2))

    const {
      // Dados pessoais
      clientName,
      clientEmail,
      clientPhone,
      clientCpf,
      clientBirthDate,

      // Endereço
      addressStreet,
      addressNumber,
      addressComplement,
      addressNeighborhood,
      addressCity,
      addressState,
      addressZipcode,

      // Serviço
      serviceType,
      serviceTitle,
      serviceCategory,
      urgencyLevel,

      // Agendamento
      preferredDate,
      preferredTime,
      preferredPeriod,

      // Observações
      clientNotes,

      // Campos específicos do serviço
      serviceDetails
    } = body

    // Validações básicas
    if (!clientName || !clientEmail || !clientPhone || !serviceType || !addressCity || !addressState) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se email já tem agendamento pendente para o mesmo serviço
    const { data: existingAppointment } = await supabase
      .from('fiscal_appointments')
      .select('id')
      .eq('client_email', clientEmail)
      .eq('service_type', serviceType)
      .in('status', ['PENDENTE', 'CONFIRMADO'])
      .single()

    if (existingAppointment) {
      return NextResponse.json(
        { message: 'Você já possui um agendamento pendente para este serviço. Aguarde o contato da equipe.' },
        { status: 409 }
      )
    }

    // Gerar protocolo único
    const now = new Date()
    const protocolId = `FAP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

    // Preparar dados para inserção
    const appointmentData = {
      service_type: serviceType,
      service_title: serviceTitle,
      service_category: serviceCategory,

      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_cpf: clientCpf || null,
      client_birth_date: clientBirthDate || null,
      // client_category removido - não existe na tabela
      // A categoria do cliente está salva em service_details.clientCategory

      address_street: addressStreet || null,
      address_number: addressNumber || null,
      address_complement: addressComplement || null,
      address_neighborhood: addressNeighborhood || null,
      address_city: addressCity,
      address_state: addressState,
      address_zipcode: addressZipcode || null,

      service_details: serviceDetails || {},
      urgency_level: urgencyLevel || 'NORMAL',

      preferred_date: preferredDate || null,
      preferred_time: preferredTime || null,
      preferred_period: preferredPeriod || null,

      client_notes: clientNotes || null,

      status: 'PENDENTE',
      protocol: protocolId
    }

    console.log('📤 Dados para inserção no Supabase:', JSON.stringify(appointmentData, null, 2))

    // Inserir agendamento
    const { data: appointment, error: insertError } = await supabase
      .from('fiscal_appointments')
      .insert(appointmentData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ ========== ERRO AO INSERIR AGENDAMENTO ==========')
      console.error('❌ Erro completo:', insertError)
      console.error('❌ Code:', insertError.code)
      console.error('❌ Message:', insertError.message)
      console.error('❌ Details:', insertError.details)
      console.error('❌ Hint:', insertError.hint)

      return NextResponse.json(
        {
          message: 'Erro ao criar agendamento',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          // Retornar dados completos em desenvolvimento
          debug: process.env.NODE_ENV === 'development' ? {
            errorMessage: insertError.message,
            errorCode: insertError.code,
            sentData: appointmentData
          } : undefined
        },
        { status: 500 }
      )
    }

    // Resposta de sucesso
    return NextResponse.json({
      message: 'Agendamento solicitado com sucesso!',
      protocol: appointment.protocol,
      appointment: {
        id: appointment.id,
        protocol: appointment.protocol,
        service_title: appointment.service_title,
        status: appointment.status,
        created_at: appointment.created_at
      }
    })

  } catch (error) {
    console.error('Erro no endpoint de agendamentos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const serviceType = searchParams.get('service_type')

    let query = supabase
      .from('fiscal_appointments')
      .select(`
        id,
        service_type,
        service_title,
        service_category,
        client_name,
        client_email,
        client_phone,
        service_details,
        address_city,
        address_state,
        urgency_level,
        preferred_date,
        preferred_time,
        preferred_period,
        status,
        protocol,
        client_notes,
        internal_notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (serviceType) {
      query = query.eq('service_type', serviceType)
    }

    const { data: appointments, error } = await query

    if (error) {
      throw error
    }

    // Processar appointments para extrair client_category do service_details
    const processedAppointments = (appointments || []).map(apt => ({
      ...apt,
      client_category: apt.service_details?.clientCategory || apt.service_category || null
    }))

    // Buscar estatísticas gerais
    const { data: stats } = await supabase
      .from('fiscal_appointments_summary')
      .select('*')

    return NextResponse.json({
      appointments: processedAppointments,
      stats: stats || [],
      pagination: {
        limit,
        offset,
        hasMore: (appointments?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointment_id, status, notes, coordinator_id } = body

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'ID do agendamento não fornecido' },
        { status: 400 }
      )
    }

    // Mapear status do painel para status do banco
    const statusMap: Record<string, string> = {
      'scheduled': 'PENDENTE',
      'confirmed': 'CONFIRMADO',
      'in_progress': 'EM_ANDAMENTO',
      'completed': 'CONCLUIDO',
      'cancelled': 'CANCELADO',
      'no_show': 'CANCELADO'
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = statusMap[status] || status
    }

    if (notes !== undefined) {
      updateData.internal_notes = notes
    }

    if (coordinator_id) {
      updateData.assigned_coordinator_id = coordinator_id
    }

    // Adicionar campos de timestamp baseado no status
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'in_progress') {
      updateData.scheduled_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('fiscal_appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar agendamento fiscal:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar agendamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Agendamento atualizado com sucesso',
      appointment: data
    })

  } catch (error) {
    console.error('Erro no PUT de fiscal-appointments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointment_id')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do agendamento não fornecido' },
        { status: 400 }
      )
    }

    // Ao invés de deletar, apenas cancelar o agendamento
    const { data, error } = await supabase
      .from('fiscal_appointments')
      .update({
        status: 'CANCELADO',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao cancelar agendamento fiscal:', error)
      return NextResponse.json(
        { error: 'Erro ao cancelar agendamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Agendamento cancelado com sucesso',
      appointment: data
    })

  } catch (error) {
    console.error('Erro no DELETE de fiscal-appointments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}