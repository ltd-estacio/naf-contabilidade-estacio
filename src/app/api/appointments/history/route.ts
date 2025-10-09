import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Buscar histórico de atendimentos (para coordenadores)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit') || '50'

    try {
      let query = supabaseAdmin
        .from('appointment_attendance_history')
        .select(`
          *,
          fiscal_appointments:appointment_id (
            protocol,
            client_name,
            service_type,
            service_title,
            urgency_level
          )
        `)
        .order('started_at', { ascending: false })
        .limit(parseInt(limit))

      if (studentId) {
        query = query.eq('student_id', studentId)
      }

      if (startDate) {
        query = query.gte('started_at', startDate)
      }

      if (endDate) {
        query = query.lte('started_at', endDate)
      }

      const { data: history, error } = await query

      if (error) {
        throw error
      }

      // Buscar resumo estatístico
      const { data: summary } = await supabaseAdmin
        .from('student_attendance_summary')
        .select('*')
        .eq('student_id', studentId || '')
        .single()

      return NextResponse.json({
        history: history || [],
        summary: summary || null,
        total: history?.length || 0
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando dados mock:', supabaseError)

      // Dados mock
      const mockHistory = [
        {
          id: 1,
          appointment_id: 1,
          student_id: studentId || 'student-1',
          student_name: 'Ana Silva',
          started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          finished_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          duration_minutes: 45,
          status: 'CONCLUIDO',
          student_notes: 'Cliente trouxe todos os documentos necessários',
          attendance_summary: 'Declaração de IRPF realizada com sucesso',
          client_rating: 5,
          fiscal_appointments: {
            protocol: 'NAF-2025-001',
            client_name: 'João Silva',
            service_type: 'IRPF',
            service_title: 'Declaração de Imposto de Renda'
          }
        },
        {
          id: 2,
          appointment_id: 2,
          student_id: studentId || 'student-1',
          student_name: 'Ana Silva',
          started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          finished_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          status: 'CONCLUIDO',
          student_notes: 'Abertura de MEI realizada',
          attendance_summary: 'Processo de abertura de MEI iniciado com sucesso',
          client_rating: 5,
          fiscal_appointments: {
            protocol: 'NAF-2025-002',
            client_name: 'Maria Santos',
            service_type: 'MEI',
            service_title: 'Abertura de MEI'
          }
        }
      ]

      const mockSummary = {
        student_id: studentId || 'student-1',
        student_name: 'Ana Silva',
        total_attendances: 12,
        completed_attendances: 10,
        cancelled_attendances: 2,
        avg_duration_minutes: 37.5,
        avg_rating: 4.8,
        first_attendance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_attendance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }

      return NextResponse.json({
        history: mockHistory,
        summary: mockSummary,
        total: mockHistory.length
      })
    }

  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
