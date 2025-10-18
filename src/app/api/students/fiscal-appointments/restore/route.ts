import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * POST /api/students/fiscal-appointments/restore
 *
 * Restaurar um atendimento fiscal excluído
 * Remove a marcação de soft delete
 */
export async function POST(request: NextRequest) {
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
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do atendimento não fornecido' },
        { status: 400 }
      )
    }

    console.log(`♻️ Tentando restaurar atendimento ${appointmentId} pelo estudante ${studentId}`)

    // 3. Verificar se o atendimento existe e pertence ao estudante
    const { data: appointment, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('id, protocol, status, assigned_student_id, deleted_at, deleted_by')
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
        { error: 'Você não tem permissão para restaurar este atendimento' },
        { status: 403 }
      )
    }

    // 5. Verificar se o atendimento está excluído
    if (!appointment.deleted_at) {
      return NextResponse.json(
        { error: 'Este atendimento não está excluído' },
        { status: 400 }
      )
    }

    // 6. Restaurar atendimento (remover soft delete)
    const { error: restoreError } = await supabase
      .from('fiscal_appointments')
      .update({
        deleted_at: null,
        deleted_by: null,
        internal_notes: `${appointment.internal_notes || ''}\n\n[RESTAURADO em ${new Date().toLocaleString('pt-BR')}]`
      })
      .eq('id', appointmentId)

    if (restoreError) {
      console.error('Erro ao restaurar atendimento:', restoreError)
      return NextResponse.json(
        { error: 'Erro ao restaurar atendimento' },
        { status: 500 }
      )
    }

    console.log(`✅ Atendimento ${appointment.protocol} restaurado com sucesso`)

    return NextResponse.json({
      success: true,
      message: 'Atendimento restaurado com sucesso',
      detail: 'O atendimento foi recuperado da lixeira e está novamente ativo.',
      restoredAppointment: {
        id: appointment.id,
        protocol: appointment.protocol,
        status: appointment.status
      }
    })

  } catch (error) {
    console.error('Erro ao processar restauração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/students/fiscal-appointments/restore
 *
 * Excluir PERMANENTEMENTE um atendimento da lixeira
 * ATENÇÃO: Esta ação é irreversível!
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
    const { appointmentId, confirmPermanentDelete } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do atendimento não fornecido' },
        { status: 400 }
      )
    }

    if (!confirmPermanentDelete) {
      return NextResponse.json(
        { error: 'Confirmação de exclusão permanente não fornecida' },
        { status: 400 }
      )
    }

    console.log(`⚠️ Tentando EXCLUIR PERMANENTEMENTE atendimento ${appointmentId}`)

    // 3. Verificar se o atendimento existe, está excluído e pertence ao estudante
    const { data: appointment, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('id, protocol, assigned_student_id, deleted_at')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Atendimento não encontrado' },
        { status: 404 }
      )
    }

    if (appointment.assigned_student_id !== studentId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este atendimento' },
        { status: 403 }
      )
    }

    if (!appointment.deleted_at) {
      return NextResponse.json(
        { error: 'Este atendimento não está na lixeira. Use a API de soft delete primeiro.' },
        { status: 400 }
      )
    }

    // 4. EXCLUIR PERMANENTEMENTE (hard delete)
    const { error: deleteError } = await supabase
      .from('fiscal_appointments')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Erro ao excluir permanentemente:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir permanentemente o atendimento' },
        { status: 500 }
      )
    }

    console.log(`⚠️ Atendimento ${appointment.protocol} EXCLUÍDO PERMANENTEMENTE`)

    return NextResponse.json({
      success: true,
      message: 'Atendimento excluído permanentemente',
      detail: 'O atendimento foi removido definitivamente do banco de dados.',
      deletedAppointmentId: appointment.id
    })

  } catch (error) {
    console.error('Erro ao processar exclusão permanente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
