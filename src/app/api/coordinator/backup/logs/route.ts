import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET - Buscar logs de backup do coordenador com estatísticas
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

    // Buscar logs do banco de dados
    const [logs, totalCount] = await Promise.all([
      prisma.backupLog.findMany({
        where: {
          coordinatorId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.backupLog.count({
        where: {
          coordinatorId
        }
      })
    ])

    // Calcular estatísticas
    const allLogs = await prisma.backupLog.findMany({
      where: {
        coordinatorId
      }
    })

    const statistics = {
      total_backups: allLogs.length,
      total_downloads: allLogs.filter(log => log.backupType === 'download').length,
      total_emails: allLogs.filter(log => log.backupType === 'email').length,
      total_previews: allLogs.filter(log => log.backupType === 'preview').length,
      total_records_exported: allLogs.reduce((sum, log) => sum + log.totalRecords, 0),
      total_size_kb: allLogs.reduce((sum, log) => sum + log.fileSizeKb, 0),
      avg_execution_time_ms: allLogs.length > 0 
        ? allLogs.reduce((sum, log) => sum + log.executionTimeMs, 0) / allLogs.length 
        : 0,
      last_backup_date: allLogs.length > 0 ? allLogs[0].createdAt.toISOString() : null,
      failed_backups: allLogs.filter(log => !log.success).length
    }

    // Formatar logs para o frontend
    const formattedLogs = logs.map(log => ({
      id: log.id,
      backup_type: log.backupType,
      export_format: log.exportFormat,
      file_size_kb: log.fileSizeKb,
      total_records: log.totalRecords,
      created_at: log.createdAt.toISOString(),
      success: log.success,
      email_sent_to: log.emailSentTo,
      execution_time_ms: log.executionTimeMs,
      ip_address: log.ipAddress,
      error_message: log.errorMessage
    }))

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
        total: totalCount,
        statistics
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
  } finally {
    await prisma.$disconnect()
  }
}

