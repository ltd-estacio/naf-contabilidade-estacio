import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * DELETE /api/students/fiscal-appointments/delete
 *
 * Soft delete de um atendimento fiscal
 * Marca o atendimento como excluído sem removê-lo do banco
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const studentId = decoded.studentId

    // 2. Obter ID do atendimento do corpo da requisição
    const body = await request.json()
    const { appointmentId, deleteReason } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do atendimento não fornecido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Tentando excluir atendimento ${appointmentId} pelo estudante ${studentId}`)

    // 3. Verificar se o atendimento existe e pertence ao estudante
    const { data: appointment, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('id, protocol, status, assigned_student_id, deleted_at')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Atendimento não encontrado' },
        { status: 404 }
      )
    }

    // 4. Verificar se o atendimento pertence ao estudante
    if (appointment.assigned_student_id !== studentId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este atendimento' },
        { status: 403 }
      )
    }

    // 5. Verificar se já foi excluído
    if (appointment.deleted_at) {
      return NextResponse.json(
        { error: 'Este atendimento já foi excluído' },
        { status: 400 }
      )
    }

    // 6. Verificar se o atendimento está CONCLUÍDO
    // (Opcional: você pode permitir exclusão apenas de atendimentos concluídos)
    if (appointment.status !== 'CONCLUIDO') {
      return NextResponse.json(
        {
          error: 'Apenas atendimentos concluídos podem ser excluídos',
          detail: 'Para cancelar atendimentos em andamento, use o botão "Cancelar"'
        },
        { status: 400 }
      )
    }

    // 7. Realizar soft delete
    const { error: deleteError } = await supabase
      .from('fiscal_appointments')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: studentId,
        internal_notes: `${appointment.internal_notes || ''}\n\n[EXCLUÍDO em ${new Date().toLocaleString('pt-BR')}]${deleteReason ? `\nMotivo: ${deleteReason}` : ''}`
      })
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Erro ao excluir atendimento:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir atendimento' },
        { status: 500 }
      )
    }

    console.log(`✅ Atendimento ${appointment.protocol} excluído com sucesso`)

    return NextResponse.json({
      success: true,
      message: 'Atendimento excluído com sucesso',
      detail: 'O atendimento foi movido para a lixeira e pode ser recuperado a qualquer momento.',
      deletedAppointment: {
        id: appointment.id,
        protocol: appointment.protocol
      }
    })

  } catch (error) {
    console.error('Erro ao processar exclusão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/students/fiscal-appointments/delete
 *
 * Listar atendimentos excluídos (lixeira)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const studentId = decoded.studentId

    console.log(`🗑️ Buscando atendimentos excluídos do estudante ${studentId}`)

    // 2. Buscar atendimentos excluídos
    const { data: deletedAppointments, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .eq('assigned_student_id', studentId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (fetchError) {
      console.error('Erro ao buscar atendimentos excluídos:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar atendimentos excluídos' },
        { status: 500 }
      )
    }

    console.log(`✅ Encontrados ${deletedAppointments?.length || 0} atendimentos excluídos`)

    return NextResponse.json({
      success: true,
      deletedAppointments: deletedAppointments || [],
      count: deletedAppointments?.length || 0
    })

  } catch (error) {
    console.error('Erro ao buscar atendimentos excluídos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
