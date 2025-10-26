import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractStudentId, verifyStudentToken } from '../_utils'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

const isMissingTableError = (error: { message?: string; code?: string } | null | undefined, tableName: string) => {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  const normalizedTable = tableName.toLowerCase()
  return (
    error.code === '42P01' ||
    (message.includes(normalizedTable) && (
      message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('undefined table') ||
      message.includes('relation')
    ))
  )
}

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

    const isValidUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

    if (!isValidUUID(appointmentId)) {
      return NextResponse.json({ message: 'appointmentId inválido' }, { status: 400 })
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

      if (isMissingTableError(notesError, 'fiscal_appointment_notes')) {
        return NextResponse.json({
          notes: [],
          schemaMissing: true,
          message: 'Tabela fiscal_appointment_notes não encontrada. Execute src/sql/create_fiscal_appointment_notes.sql no banco.'
        })
      }

      return NextResponse.json({
        message: 'Erro ao buscar notas',
        details: notesError.message,
        hint: notesError.hint,
        code: notesError.code
      }, { status: 500 })
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

    const isValidUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

    if (!isValidUUID(appointmentId)) {
      return NextResponse.json({ message: 'appointmentId inválido' }, { status: 400 })
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

    const normalizeStudentId = (value: string | undefined) => {
      if (!value || typeof value !== 'string') {
        return null
      }
      return isValidUUID(value) ? value : null
    }

    const getStudentNameFromTable = async (table: 'users' | 'students'): Promise<string | null> => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('name')
          .eq('id', studentId)
          .maybeSingle()

        if (error) {
          if (isMissingTableError(error, table)) {
            return null
          }
          console.error(`Erro ao buscar nome do estudante na tabela ${table}:`, error)
          return null
        }

        return data?.name || null
      } catch (fetchError) {
        console.error(`Falha ao consultar a tabela ${table} para obter o nome do estudante:`, fetchError)
        return null
      }
    }

    if (!studentName) {
      studentName = await getStudentNameFromTable('users') || await getStudentNameFromTable('students') || undefined
    }

    const baseInsertPayload = {
      appointment_id: appointmentId,
      student_id: normalizeStudentId(studentId),
      student_name: studentName,
      note: sanitizedNote
    }

    const execInsert = async (payload: typeof baseInsertPayload) => {
      return supabase
        .from('fiscal_appointment_notes')
        .insert(payload)
        .select()
        .single()
    }

    let insertedNote = null
    let insertError = null

    const firstAttempt = await execInsert(baseInsertPayload)

    const shouldRetryWithoutStudent = firstAttempt.error &&
      ['23503', '23505', '22P02'].includes(firstAttempt.error.code ?? '')

    if (shouldRetryWithoutStudent && !isMissingTableError(firstAttempt.error, 'fiscal_appointment_notes')) {
      console.warn('Repetindo inserção de nota sem student_id devido ao erro:', firstAttempt.error)
      const fallbackAttempt = await execInsert({
        ...baseInsertPayload,
        student_id: null
      })
      insertedNote = fallbackAttempt.data
      insertError = fallbackAttempt.error
    } else {
      insertedNote = firstAttempt.data
      insertError = firstAttempt.error
    }

    if (insertError || !insertedNote) {
      console.error('Erro ao registrar nota de atendimento:', insertError)

      if (isMissingTableError(insertError, 'fiscal_appointment_notes')) {
        return NextResponse.json({
          message: 'Tabela fiscal_appointment_notes não encontrada. Execute src/sql/create_fiscal_appointment_notes.sql no banco antes de registrar notas.',
          code: insertError?.code
        }, { status: 503 })
      }

      return NextResponse.json({
        message: 'Erro ao salvar anotação',
        details: insertError?.message,
        hint: insertError?.hint,
        code: insertError?.code
      }, { status: 500 })
    }

    return NextResponse.json({
      note: {
        id: insertedNote.id,
        appointment_id: insertedNote.appointment_id,
        student_id: insertedNote.student_id,
        student_name: insertedNote.student_name,
        note: insertedNote.note,
        created_at: insertedNote.created_at,
        updated_at: insertedNote.updated_at
      }
    })
  } catch (error) {
    console.error('Erro ao registrar nota de atendimento:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
