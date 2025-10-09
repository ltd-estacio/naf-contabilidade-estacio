import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId || decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { status, notes } = await request.json()
    const attendanceId = params.id

    // Verificar se o atendimento pertence ao estudante
    const { data: attendance, error: findError } = await supabase
      .from('attendances')
      .select('*')
      .eq('id', attendanceId)
      .eq('student_id', studentAuth.studentId)
      .single()

    if (findError || !attendance) {
      return NextResponse.json(
        { message: 'Atendimento não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: unknown = {
      status,
      updated_at: new Date().toISOString()
    }

    if (notes) {
      updateData.student_notes = notes
    }

    if (status === 'CONCLUIDO') {
      updateData.completed_at = new Date().toISOString()
    }

    // Atualizar atendimento
    const { data: updatedAttendance, error: updateError } = await supabase
      .from('attendances')
      .update(updateData)
      .eq('id', attendanceId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log da atividade
    await supabase
      .from('student_activity_logs')
      .insert({
        student_id: studentAuth.studentId,
        activity_type: `ATTENDANCE_${status}`,
        activity_data: {
          attendance_id: attendanceId,
          protocol: attendance.protocol,
          status_change: {
            from: attendance.status,
            to: status
          },
          timestamp: new Date().toISOString()
        },
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || ''
      })

    // Se foi concluído, atualizar estatísticas na tabela student_performance
    if (status === 'CONCLUIDO') {
      await supabase
        .from('student_performance')
        .upsert({
          student_name: attendance.student_name,
          course: '', // Será atualizado por trigger ou processo separado
          total_attendances: attendance.completed_at ? 1 : 0, // Incrementar via SQL
          avg_rating: 0, // Será calculado quando houver avaliação
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'student_name'
        })
    }

    return NextResponse.json({
      message: 'Atendimento atualizado com sucesso',
      attendance: updatedAttendance
    })

  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
