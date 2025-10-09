import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

async function verifyStudentToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as any

    if (!decoded.studentId && !decoded.id) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

// POST - Atribuir atendimentos disponíveis ao estudante
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Atribuindo atendimentos ao estudante...')

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

    // Buscar atendimentos SEM estudante atribuído
    const { data: availableAppointments, error: fetchError } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .is('assigned_student_id', null)
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('Erro ao buscar atendimentos:', fetchError)
      return NextResponse.json(
        { message: 'Erro ao buscar atendimentos', error: fetchError.message },
        { status: 500 }
      )
    }

    if (!availableAppointments || availableAppointments.length === 0) {
      return NextResponse.json(
        { message: 'Não há atendimentos disponíveis para atribuição', count: 0 },
        { status: 200 }
      )
    }

    // Atribuir os atendimentos ao estudante
    const appointmentIds = availableAppointments.map(a => a.id)

    const { data: updated, error: updateError } = await supabase
      .from('fiscal_appointments')
      .update({
        assigned_student_id: studentId,
        updated_at: new Date().toISOString()
      })
      .in('id', appointmentIds)
      .select()

    if (updateError) {
      console.error('Erro ao atribuir atendimentos:', updateError)
      return NextResponse.json(
        { message: 'Erro ao atribuir atendimentos', error: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ ${updated?.length} atendimentos atribuídos com sucesso`)

    return NextResponse.json({
      message: `${updated?.length} atendimentos foram atribuídos a você!`,
      count: updated?.length,
      appointments: updated
    })

  } catch (error) {
    console.error('Erro ao atribuir atendimentos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
