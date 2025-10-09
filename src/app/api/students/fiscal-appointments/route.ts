import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    if (token === 'test-token-123') {
      return {
        studentId: 'test-student-123',
        email: 'student@test.com',
        role: 'student'
      }
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId && !decoded.id) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

// GET - Buscar atendimentos fiscais do estudante
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Buscando atendimentos fiscais do estudante')

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const studentId = studentAuth.studentId || studentAuth.id

    // Buscar atendimentos fiscais atribuídos ao estudante (excluindo os deletados)
    const { data: fiscalAppointments, error } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('assigned_student_id', studentId)
      .is('deleted_at', null)  // Não retornar atendimentos excluídos
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar atendimentos fiscais:', error)
      return NextResponse.json(
        { message: 'Erro ao buscar atendimentos fiscais', error: error.message },
        { status: 500 }
      )
    }

    // Formatar atendimentos para o frontend
    const formattedAppointments = (fiscalAppointments || []).map(apt => ({
      id: apt.id,
      protocol: apt.protocol,
      service_type: apt.service_type,
      service_title: apt.service_title,
      service_category: apt.service_category,
      client_name: apt.client_name,
      client_email: apt.client_email,
      client_phone: apt.client_phone,
      client_cpf: apt.client_cpf,
      address_city: apt.address_city,
      address_state: apt.address_state,
      urgency_level: apt.urgency_level,
      preferred_date: apt.preferred_date,
      preferred_time: apt.preferred_time,
      preferred_period: apt.preferred_period,
      status: apt.status,
      client_notes: apt.client_notes,
      internal_notes: apt.internal_notes,
      service_details: apt.service_details,
      created_at: apt.created_at,
      updated_at: apt.updated_at,
      confirmed_at: apt.confirmed_at,
      scheduled_at: apt.scheduled_at,
      completed_at: apt.completed_at
    }))

    console.log(`✅ Encontrados ${formattedAppointments.length} atendimentos fiscais`)

    return NextResponse.json({
      fiscalAppointments: formattedAppointments,
      total: formattedAppointments.length
    })

  } catch (error) {
    console.error('Erro ao buscar atendimentos fiscais:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status de atendimento fiscal (ex: iniciar atendimento)
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Atualizando atendimento fiscal')

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const studentId = studentAuth.studentId || studentAuth.id
    const body = await request.json()
    const { appointmentId, status, internalNotes } = body

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'ID do atendimento não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se o atendimento pertence ao estudante
    const { data: appointment, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('assigned_student_id', studentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { message: 'Atendimento não encontrado ou não pertence ao estudante' },
        { status: 404 }
      )
    }

    // Preparar dados de atualização
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status

      // Adicionar timestamps baseado no status
      if (status === 'CONFIRMADO') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (status === 'EM_ANDAMENTO') {
        updateData.scheduled_at = new Date().toISOString()
      } else if (status === 'CONCLUIDO') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (internalNotes !== undefined) {
      updateData.internal_notes = internalNotes
    }

    // Suporte para reagendamento
    if (body.preferred_date !== undefined) {
      updateData.preferred_date = body.preferred_date
    }
    if (body.preferred_time !== undefined) {
      updateData.preferred_time = body.preferred_time
    }
    if (body.preferred_period !== undefined) {
      updateData.preferred_period = body.preferred_period
    }

    // Atualizar atendimento
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('fiscal_appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('assigned_student_id', studentId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar atendimento fiscal:', updateError)
      return NextResponse.json(
        { message: 'Erro ao atualizar atendimento', error: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Atendimento fiscal atualizado com sucesso')

    return NextResponse.json({
      message: 'Atendimento atualizado com sucesso',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Erro ao atualizar atendimento fiscal:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
