import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type StudentInfo = {
  id: string
  name: string | null
  email: string | null
  course: string | null
  semester: string | null
}

export const dynamic = 'force-dynamic'

// Função para remover acentos e caracteres especiais
function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^a-zA-Z0-9\s,.:;!?@#$%&*()[\]{}<>+=\-_/\\|'"]/g, '') // Remove outros caracteres especiais
    .trim()
}

// Função para sanitizar valores para CSV/TXT
function sanitizeValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  const stringValue = String(value)
  return removeAccents(stringValue)
}

/**
 * POST - Gerar backup de atendimentos fiscais em múltiplos formatos
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API de backup chamada')
  console.log('Método:', request.method)
  console.log('URL:', request.url)
  
  try {
    console.log('📝 Lendo body da requisição...')
    const body = await request.json()
    console.log('Body recebido:', JSON.stringify(body, null, 2))
    
    const {
      coordinatorId,
      coordinatorName,
      coordinatorEmail,
      format = 'csv',
      filters = {},
      dateRange = {},
      includeFeeback = true,
      includeMetadata = true,
      compressed = false
    } = body

    console.log('Parâmetros extraídos:', {
      coordinatorId,
      coordinatorName,
      coordinatorEmail,
      format,
      hasFilters: Object.keys(filters).length > 0,
      hasDateRange: Object.keys(dateRange).length > 0
    })

    if (!coordinatorId || !coordinatorName || !coordinatorEmail) {
      console.log('❌ Validação falhou: dados do coordenador ausentes')
      return NextResponse.json(
        { error: 'Dados do coordenador são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('✅ Validação passou')

    const startTime = Date.now()

    console.log('🔍 Iniciando backup de atendimentos...')
    console.log('Filtros:', JSON.stringify(filters))
    console.log('Range de datas:', JSON.stringify(dateRange))

    // Construir query simplificada usando Supabase
    let query = (supabaseAdmin as any).from('attendances').select('*')

    // Aplicar filtros de status
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      console.log('Aplicando filtro de status:', filters.status)
      query = query.in('status', filters.status)
    }

    // Aplicar filtros de data
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).toISOString()
      console.log('Aplicando filtro de data inicial:', startDate)
      query = query.gte('created_at', startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).toISOString()
      console.log('Aplicando filtro de data final:', endDate)
      query = query.lte('created_at', endDate)
    }

    // Ordenar por data de criação
    query = query.order('created_at', { ascending: false })

    console.log('🔄 Executando query...')

    // Executar query
    const { data: attendances, error: queryError } = await query

    if (queryError) {
      console.error('❌ Erro ao buscar atendimentos:', queryError)
      console.error('Detalhes do erro:', JSON.stringify(queryError, null, 2))
      throw new Error(`Erro ao buscar atendimentos: ${queryError.message || JSON.stringify(queryError)}`)
    }

    console.log(`✅ Query executada com sucesso. ${attendances?.length || 0} atendimentos encontrados`)

    // Se não houver atendimentos, retornar arquivo vazio mas válido
    if (!attendances || attendances.length === 0) {
      const emptyContent = format === 'json' 
        ? '[]' 
        : format === 'txt'
        ? 'Nenhum atendimento encontrado para os filtros especificados.'
        : 'Nenhum atendimento encontrado para os filtros especificados.'

      const base64Content = Buffer.from(emptyContent, 'utf8').toString('base64')

      return NextResponse.json({
        success: true,
        data: {
          content: base64Content,
          fileName: `backup_atendimentos_NAF_${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : format === 'txt' ? 'txt' : 'csv'}`,
          mimeType: format === 'json' ? 'application/json' : format === 'txt' ? 'text/plain' : 'text/csv',
          fileSize: Buffer.byteLength(emptyContent, 'utf8') / 1024,
          totalRecords: 0,
          executionTime: Date.now() - startTime
        }
      })
    }

    // Preparar dados para exportação com sanitização
    const exportData = attendances.map((att: any) => {
      // Função helper para converter data
      const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A'
        try {
          return new Date(dateStr).toLocaleString('pt-BR')
        } catch {
          return 'N/A'
        }
      }

      const baseData = {
        // Dados básicos do atendimento
        id: sanitizeValue(att.id),
        protocolo: sanitizeValue(att.protocol),
        status: sanitizeValue(att.status),
        categoria: sanitizeValue(att.category),
        tema: sanitizeValue(att.theme),
        subtema: sanitizeValue(att.subtheme),
        tipo: sanitizeValue(att.type),
        
        // Horas e validação
        horas_prestadas: sanitizeValue(att.hours),
        validado: att.is_validated || att.isValidated ? 'Sim' : 'Nao',
        validado_por: sanitizeValue(att.validated_by || att.validatedBy),
        
        // Descrição e observações
        descricao: sanitizeValue(att.description),
        observacoes: sanitizeValue(att.observations),
        notas_validacao: sanitizeValue(att.validation_notes || att.validationNotes),
        
        // Certificado
        requer_certificado: att.requires_cert || att.requiresCert ? 'Sim' : 'Nao',
        certificado_emitido: att.cert_issued || att.certIssued ? 'Sim' : 'Nao',
        
        // IDs de relacionamento
        usuario_id: sanitizeValue(att.user_id || att.userId),
        demanda_id: sanitizeValue(att.demand_id || att.demandId),
        
        // Datas importantes (suporta snake_case e camelCase)
        data_criacao: formatDate(att.created_at || att.createdAt),
        data_atualizacao: formatDate(att.updated_at || att.updatedAt),
        data_agendamento: formatDate(att.scheduled_at || att.scheduledAt),
        data_conclusao: formatDate(att.completed_at || att.completedAt),
        data_validacao: formatDate(att.validated_at || att.validatedAt)
      }

      return baseData
    })

    console.log(`📊 ${exportData.length} registros preparados para exportação`)

    // Gerar arquivo no formato solicitado
    let fileContent: string
    let mimeType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        fileContent = generateCSV(exportData)
        mimeType = 'text/csv;charset=utf-8'
        fileExtension = 'csv'
        break

      case 'json':
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json;charset=utf-8'
        fileExtension = 'json'
        break

      case 'txt':
        fileContent = generateTXT(exportData)
        mimeType = 'text/plain;charset=utf-8'
        fileExtension = 'txt'
        break

      case 'excel':
        // Para Excel, vamos gerar um CSV que pode ser aberto no Excel
        fileContent = generateCSV(exportData)
        mimeType = 'application/vnd.ms-excel;charset=utf-8'
        fileExtension = 'csv'
        break

      default:
        return NextResponse.json(
          { error: 'Formato não suportado' },
          { status: 400 }
        )
    }

    const executionTime = Date.now() - startTime
    const fileSizeKB = Buffer.byteLength(fileContent, 'utf8') / 1024

    // Registrar log de backup no banco de dados
    try {
      await (supabaseAdmin as any).from('backup_logs').insert({
        coordinator_id: coordinatorId,
        coordinator_name: coordinatorName,
        coordinator_email: coordinatorEmail,
        backup_type: 'download',
        export_format: format,
        total_records: exportData.length,
        file_size_kb: fileSizeKB,
        execution_time_ms: executionTime,
        filters: filters,
        include_metadata: includeMetadata,
        compressed,
        success: true,
        ip_address: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      })
    } catch (logError) {
      console.error('Erro ao registrar log de backup:', logError)
      // Não falha a requisição se o log não puder ser salvo
    }

    // Retornar arquivo como base64 para download no frontend
    const base64Content = Buffer.from(fileContent, 'utf8').toString('base64')

    return NextResponse.json({
      success: true,
      data: {
        content: base64Content,
        fileName: `backup_atendimentos_NAF_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
        mimeType,
        fileSize: fileSizeKB,
        totalRecords: exportData.length,
        executionTime
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar backup:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorDetails = {
      message: errorMessage,
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }

    console.error('Detalhes completos do erro:', JSON.stringify(errorDetails, null, 2))
    
    // Tentar registrar erro no log
    try {
      await (supabaseAdmin as any).from('backup_logs').insert({
        coordinator_id: 'unknown',
        coordinator_name: 'unknown',
        coordinator_email: 'unknown',
        backup_type: 'download',
        export_format: 'csv',
        total_records: 0,
        file_size_kb: 0,
        execution_time_ms: 0,
        success: false,
        error_message: errorMessage,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      })
    } catch (logError) {
      console.error('Erro ao registrar log de erro:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

// Funções auxiliares para gerar diferentes formatos

function generateCSV(data: any[]): string {
  if (data.length === 0) return 'Nenhum registro encontrado'

  const headers = Object.keys(data[0])
  const csvRows = []

  // Header (já sanitizado)
  csvRows.push(headers.map(h => `"${h}"`).join(','))

  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Valores já estão sanitizados, apenas escapar aspas
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

function generateTXT(data: any[]): string {
  if (data.length === 0) return 'Nenhum registro encontrado.'

  let content = '='.repeat(60) + '\n'
  content += '   BACKUP DE ATENDIMENTOS FISCAIS NAF\n'
  content += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
  content += `   Total de registros: ${data.length}\n`
  content += '='.repeat(60) + '\n\n'

  data.forEach((record, index) => {
    content += `\n${'='.repeat(60)}\n`
    content += `REGISTRO ${index + 1} de ${data.length}\n`
    content += '='.repeat(60) + '\n\n'
    
    Object.entries(record).forEach(([key, value]) => {
      const label = key
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      content += `${label}:\n  ${value}\n\n`
    })
  })

  content += '\n' + '='.repeat(60) + '\n'
  content += 'FIM DO BACKUP\n'
  content += '='.repeat(60) + '\n'

  return content
}
