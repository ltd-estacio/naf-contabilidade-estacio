import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * API para transferir atendimento de um estudante para outro
 * POST /api/fiscal-appointments/transfer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      appointment_id, 
      from_student_id, 
      to_student_id,
      coordinator_id,
      reason 
    } = body

    console.log('📤 Transferência de atendimento:', {
      appointment_id,
      from_student_id,
      to_student_id,
      coordinator_id
    })

    // Validações
    if (!appointment_id) {
      return NextResponse.json(
        { error: 'ID do agendamento não fornecido' },
        { status: 400 }
      )
    }

    if (!to_student_id) {
      return NextResponse.json(
        { error: 'ID do novo estudante não fornecido' },
        { status: 400 }
      )
    }

    // 1. Buscar o agendamento atual
    const { data: appointment, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('id', appointment_id)
      .single()

    if (fetchError || !appointment) {
      console.error('❌ Erro ao buscar agendamento:', fetchError)
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // 2. Verificar se o atendimento já foi iniciado ou está em andamento
    const allowedStatuses = ['CONFIRMADO', 'EM_ANDAMENTO', 'AGENDADO']
    if (!allowedStatuses.includes(appointment.status)) {
      return NextResponse.json(
        { 
          error: 'Só é possível transferir atendimentos confirmados ou em andamento',
          current_status: appointment.status 
        },
        { status: 400 }
      )
    }

    // 3. Buscar informações do novo estudante
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, status')
      .eq('id', to_student_id)
      .single()

    if (studentError || !newStudent) {
      console.error('❌ Erro ao buscar estudante:', studentError)
      return NextResponse.json(
        { error: 'Estudante não encontrado ou inativo' },
        { status: 404 }
      )
    }

    // 4. Verificar se o estudante está ativo
    if (newStudent.status !== 'active' && newStudent.status !== 'ATIVO') {
      return NextResponse.json(
        { error: 'Estudante não está ativo no sistema' },
        { status: 400 }
      )
    }

    // 5. Criar registro de auditoria
    const auditLog = {
      appointment_id,
      action: 'TRANSFER_STUDENT',
      from_student_id: from_student_id || appointment.assigned_student_id,
      to_student_id,
      coordinator_id: coordinator_id || appointment.assigned_coordinator_id,
      reason: reason || 'Transferência manual pelo coordenador',
      timestamp: new Date().toISOString()
    }

    // Inserir log de auditoria (se a tabela existir)
    try {
      await supabase
        .from('appointment_audit_logs')
        .insert(auditLog)
    } catch (error) {
      console.warn('⚠️ Tabela de auditoria não existe, pulando:', error)
    }

    // 6. Atualizar o agendamento com o novo estudante
    const updateData: Record<string, unknown> = {
      assigned_student_id: to_student_id,
      updated_at: new Date().toISOString(),
      internal_notes: appointment.internal_notes 
        ? `${appointment.internal_notes}\n\n[${new Date().toLocaleString('pt-BR')}] Atendimento transferido para: ${newStudent.name} (${newStudent.email}). Motivo: ${reason || 'Transferência manual'}`
        : `[${new Date().toLocaleString('pt-BR')}] Atendimento transferido para: ${newStudent.name} (${newStudent.email}). Motivo: ${reason || 'Transferência manual'}`
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('fiscal_appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select(`
        *,
        students:assigned_student_id (
          id,
          name,
          email,
          phone,
          course
        )
      `)
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar agendamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao transferir atendimento', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Atendimento transferido com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Atendimento transferido com sucesso',
      appointment: updatedAppointment,
      transfer: {
        from: from_student_id || appointment.assigned_student_id,
        to: to_student_id,
        new_student: newStudent
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao transferir atendimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * API para buscar estudantes disponíveis para transferência
 * GET /api/fiscal-appointments/transfer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentStudentId = searchParams.get('current_student_id')

    console.log('🔍 Buscando estudantes disponíveis...')

    // Buscar todos os estudantes ativos
    let query = supabase
      .from('students')
      .select('id, name, email, phone, course, semester, status')
      .in('status', ['active', 'ATIVO', 'enrolled'])
      .order('name', { ascending: true })

    // Excluir o estudante atual se fornecido
    if (currentStudentId) {
      query = query.neq('id', currentStudentId)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar estudantes:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar estudantes disponíveis' },
        { status: 500 }
      )
    }

    console.log(`✅ Encontrados ${students?.length || 0} estudantes disponíveis`)

    return NextResponse.json({
      students: students || [],
      total: students?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Erro ao buscar estudantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
