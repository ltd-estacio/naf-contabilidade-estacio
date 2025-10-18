import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractStudentId, verifyStudentToken } from '../_utils'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const studentId = extractStudentId(studentAuth)
    if (!studentId) {
      return NextResponse.json({ message: 'Estudante não identificado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json({ message: 'appointmentId é obrigatório' }, { status: 400 })
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('fiscal_appointments')
      .select('id')
      .eq('id', appointmentId)
      .eq('assigned_student_id', studentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ message: 'Atendimento não encontrado' }, { status: 404 })
    }

    const { data: notes, error: notesError } = await supabase
      .from('fiscal_appointment_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })

    if (notesError) {
      console.error('Erro ao buscar notas do atendimento:', notesError)
      return NextResponse.json({ message: 'Erro ao buscar notas' }, { status: 500 })
    }

    return NextResponse.json({
      notes: (notes || []).map(note => ({
        id: note.id,
        appointment_id: note.appointment_id,
        student_id: note.student_id,
        student_name: note.student_name,
        note: note.note,
        created_at: note.created_at,
        updated_at: note.updated_at
      }))
    })
  } catch (error) {
    console.error('Erro ao listar notas de atendimento:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const studentId = extractStudentId(studentAuth)
    if (!studentId) {
      return NextResponse.json({ message: 'Estudante não identificado' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, note } = body

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json({ message: 'appointmentId é obrigatório' }, { status: 400 })
    }

    const sanitizedNote = (note || '').toString().trim()
    if (!sanitizedNote) {
      return NextResponse.json({ message: 'A anotação não pode estar vazia' }, { status: 400 })
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('fiscal_appointments')
      .select('id, status, assigned_student_id')
      .eq('id', appointmentId)
      .eq('assigned_student_id', studentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ message: 'Atendimento não encontrado' }, { status: 404 })
    }

    if (appointment.status !== 'EM_ANDAMENTO') {
      return NextResponse.json({ message: 'As anotações só podem ser registradas com o atendimento em andamento' }, { status: 409 })
    }

    let studentName = studentAuth.name as string | undefined

    if (!studentName) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', studentId)
        .single()

      studentName = userProfile?.name || null
    }

    const insertPayload = {
      appointment_id: appointmentId,
      student_id: studentId,
      student_name: studentName,
      note: sanitizedNote
    }

    const { data: inserted, error: insertError } = await supabase
      .from('fiscal_appointment_notes')
      .insert(insertPayload)
      .select()
      .single()

    if (insertError || !inserted) {
      console.error('Erro ao registrar nota de atendimento:', insertError)
      return NextResponse.json({ message: 'Erro ao salvar anotação' }, { status: 500 })
    }

    return NextResponse.json({
      note: {
        id: inserted.id,
        appointment_id: inserted.appointment_id,
        student_id: inserted.student_id,
        student_name: inserted.student_name,
        note: inserted.note,
        created_at: inserted.created_at,
        updated_at: inserted.updated_at
      }
    })
  } catch (error) {
    console.error('Erro ao registrar nota de atendimento:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

