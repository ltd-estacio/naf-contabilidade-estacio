import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
  studentId: string
  email: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, stepByStep, stages, summary } = body

    if (!appointmentId || !stepByStep || !stages || !summary) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se o atendimento existe e está no status correto
    const { data: appointment, error: appointmentError } = await supabase
      .from('fiscal_appointments')
      .select('id, status, assigned_student_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Atendimento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o estudante é o responsável pelo atendimento
    if (appointment.assigned_student_id !== decoded.studentId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para registrar anotações neste atendimento' },
        { status: 403 }
      )
    }

    // Criar o registro de anotações
    const { data: note, error: noteError } = await supabase
      .from('fiscal_appointment_notes')
      .insert({
        appointment_id: appointmentId,
        student_id: decoded.studentId,
        note_type: 'REGISTRO_INICIAL',
        step_by_step: stepByStep,
        stages: stages,
        summary: summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (noteError) {
      console.error('Erro ao criar anotação:', noteError)
      return NextResponse.json(
        { error: 'Erro ao salvar registro' },
        { status: 500 }
      )
    }

    // Atualizar o status do atendimento para EM_ANDAMENTO
    const { error: updateError } = await supabase
      .from('fiscal_appointments')
      .update({
        status: 'EM_ANDAMENTO',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      // Não retorna erro porque a anotação foi salva com sucesso
    }

    return NextResponse.json({
      success: true,
      note: note
    })

  } catch (error) {
    console.error('Erro ao processar registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do atendimento não fornecido' },
        { status: 400 }
      )
    }

    // Buscar anotações do atendimento
    const { data: notes, error: notesError } = await supabase
      .from('fiscal_appointment_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('student_id', decoded.studentId)
      .order('created_at', { ascending: true })

    if (notesError) {
      console.error('Erro ao buscar anotações:', notesError)
      return NextResponse.json(
        { error: 'Erro ao buscar registros' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notes: notes || []
    })

  } catch (error) {
    console.error('Erro ao buscar registros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { noteId, stepByStep, stages, summary } = body

    if (!noteId) {
      return NextResponse.json(
        { error: 'ID da anotação não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se a anotação pertence ao estudante
    const { data: note, error: noteError } = await supabase
      .from('fiscal_appointment_notes')
      .select('id, student_id')
      .eq('id', noteId)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      )
    }

    if (note.student_id !== decoded.studentId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta anotação' },
        { status: 403 }
      )
    }

    // Atualizar a anotação
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (stepByStep !== undefined) updateData.step_by_step = stepByStep
    if (stages !== undefined) updateData.stages = stages
    if (summary !== undefined) updateData.summary = summary

    const { data: updatedNote, error: updateError } = await supabase
      .from('fiscal_appointment_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar anotação:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar registro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      note: updatedNote
    })

  } catch (error) {
    console.error('Erro ao atualizar registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
