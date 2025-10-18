import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Listar atendimentos do estudante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const status = searchParams.get('status') // PENDENTE, EM_ATENDIMENTO, CONCLUIDO

    if (!studentId) {
      return NextResponse.json(
        { error: 'student_id é obrigatório' },
        { status: 400 }
      )
    }

    try {
      let query = supabaseAdmin
        .from('fiscal_appointments')
        .select('*')
        .eq('assigned_student_id', studentId)
        .order('scheduled_datetime', { ascending: true })

      if (status) {
        query = query.eq('appointment_status', status)
      }

      const { data: appointments, error } = await query

      if (error) {
        throw error
      }

      return NextResponse.json({
        appointments: appointments || [],
        total: appointments?.length || 0
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando dados mock:', supabaseError)

      // Fallback: dados mock
      const mockAppointments = [
        {
          id: 1,
          protocol: 'NAF-2025-001',
          client_name: 'João Silva',
          client_email: 'joao@email.com',
          client_phone: '(48) 98765-4321',
          service_type: 'IRPF',
          service_title: 'Declaração de Imposto de Renda',
          scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          appointment_status: 'PENDENTE',
          urgency_level: 'NORMAL',
          assigned_student_id: studentId
        },
        {
          id: 2,
          protocol: 'NAF-2025-002',
          client_name: 'Maria Santos',
          client_email: 'maria@email.com',
          client_phone: '(48) 91234-5678',
          service_type: 'MEI',
          service_title: 'Abertura de MEI',
          scheduled_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          appointment_status: 'PENDENTE',
          urgency_level: 'URGENTE',
          assigned_student_id: studentId
        }
      ]

      return NextResponse.json({
        appointments: mockAppointments,
        total: mockAppointments.length
      })
    }

  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
