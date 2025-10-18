import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET - Buscar logs de backup do coordenador
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coordinatorId = searchParams.get('coordinatorId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!coordinatorId) {
      return NextResponse.json(
        { error: 'ID do coordenador é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar logs
    const { data: logs, error: logsError, count } = await supabase
      .from('backup_logs')
      .select('*', { count: 'exact' })
      .eq('coordinator_id', coordinatorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (logsError) {
      console.error('Erro ao buscar logs:', logsError)
      return NextResponse.json(
        { error: 'Erro ao buscar logs' },
        { status: 500 }
      )
    }

    // Buscar estatísticas
    const { data: stats } = await supabase
      .from('vw_backup_statistics')
      .select('*')
      .eq('coordinator_id', coordinatorId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        logs: logs || [],
        total: count || 0,
        statistics: stats || {
          total_backups: 0,
          total_downloads: 0,
          total_emails: 0,
          total_previews: 0,
          total_records_exported: 0,
          total_size_kb: 0,
          avg_execution_time_ms: 0,
          last_backup_date: null,
          failed_backups: 0
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
