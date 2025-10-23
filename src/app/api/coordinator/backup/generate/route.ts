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

    // Buscar dados da tabela ATTENDANCES
    console.log('📊 Buscando dados da tabela ATTENDANCES...')
    let queryAttendances = (supabaseAdmin as any).from('attendances').select('*')

    // Aplicar filtros de status para attendances
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      console.log('Aplicando filtro de status em attendances:', filters.status)
      queryAttendances = queryAttendances.in('status', filters.status)
    }

    // Aplicar filtros de data para attendances
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).toISOString()
      console.log('Aplicando filtro de data inicial em attendances:', startDate)
      queryAttendances = queryAttendances.gte('created_at', startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).toISOString()
      console.log('Aplicando filtro de data final em attendances:', endDate)
      queryAttendances = queryAttendances.lte('created_at', endDate)
    }

    queryAttendances = queryAttendances.order('created_at', { ascending: false })

    console.log('🔄 Executando query em ATTENDANCES...')
    const { data: attendancesData, error: attendancesError } = await queryAttendances

    if (attendancesError) {
      console.error('❌ Erro ao buscar attendances:', attendancesError)
      throw new Error(`Erro ao buscar attendances: ${attendancesError.message}`)
    }

    console.log(`✅ ${attendancesData?.length || 0} registros encontrados em ATTENDANCES`)

    // Buscar dados da tabela FISCAL_APPOINTMENTS
    console.log('📊 Buscando dados da tabela FISCAL_APPOINTMENTS...')
    let queryFiscal = (supabaseAdmin as any).from('fiscal_appointments').select('*')

    // Aplicar filtros de status para fiscal_appointments
    // Status possíveis: PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
    const fiscalStatusMap: Record<string, string> = {
      'AGENDADO': 'PENDENTE',
      'EM_ANDAMENTO': 'EM_ANDAMENTO',
      'CONCLUIDO': 'CONCLUIDO',
      'CANCELADO': 'CANCELADO',
      'NAO_COMPARECEU': 'CANCELADO'
    }

    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      const fiscalStatuses = filters.status.map((s: string) => fiscalStatusMap[s] || s)
      console.log('Aplicando filtro de status em fiscal_appointments:', fiscalStatuses)
      queryFiscal = queryFiscal.in('status', fiscalStatuses)
    }

    // Aplicar filtros de data para fiscal_appointments
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).toISOString()
      console.log('Aplicando filtro de data inicial em fiscal_appointments:', startDate)
      queryFiscal = queryFiscal.gte('created_at', startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).toISOString()
      console.log('Aplicando filtro de data final em fiscal_appointments:', endDate)
      queryFiscal = queryFiscal.lte('created_at', endDate)
    }

    queryFiscal = queryFiscal.order('created_at', { ascending: false })

    console.log('🔄 Executando query em FISCAL_APPOINTMENTS...')
    const { data: fiscalData, error: fiscalError } = await queryFiscal

    if (fiscalError) {
      console.error('❌ Erro ao buscar fiscal_appointments:', fiscalError)
      throw new Error(`Erro ao buscar fiscal_appointments: ${fiscalError.message}`)
    }

    console.log(`✅ ${fiscalData?.length || 0} registros encontrados em FISCAL_APPOINTMENTS`)

    // Combinar os dados das duas tabelas
    const allAttendances = [
      ...(attendancesData || []).map((att: any) => ({ ...att, _source: 'attendances' })),
      ...(fiscalData || []).map((fiscal: any) => ({ ...fiscal, _source: 'fiscal_appointments' }))
    ]

    console.log(`📊 Total combinado: ${allAttendances.length} registros (${attendancesData?.length || 0} attendances + ${fiscalData?.length || 0} fiscal)`)

    const attendances = allAttendances

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

    // Buscar informações dos estudantes relacionados
    console.log('👨‍🎓 Buscando informações dos estudantes...')
    const studentIds = [...new Set(
      attendances
        .map((att: any) => att.student_id || att.assigned_student_id)
        .filter((id: any) => id)
    )]

    console.log(`Encontrados ${studentIds.length} estudantes únicos`)

    let studentsMap: Record<string, any> = {}
    if (studentIds.length > 0) {
      const { data: studentsData, error: studentsError } = await (supabaseAdmin as any)
        .from('students')
        .select('id, name, email, course, semester, registration_number')
        .in('id', studentIds)

      if (!studentsError && studentsData) {
        studentsMap = studentsData.reduce((acc: any, student: any) => {
          acc[student.id] = student
          return acc
        }, {})
        console.log(`✅ Informações de ${Object.keys(studentsMap).length} estudantes carregadas`)
      } else {
        console.warn('⚠️ Não foi possível carregar informações dos estudantes:', studentsError)
      }
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

      const source = att._source
      const studentId = att.student_id || att.assigned_student_id
      const student = studentId ? studentsMap[studentId] : null

      // Dados base comuns
      const baseData: Record<string, any> = {
        // Origem do registro
        origem_tabela: sanitizeValue(source),
        
        // Dados básicos do atendimento
        id: sanitizeValue(att.id),
        protocolo: sanitizeValue(att.protocol),
        status: sanitizeValue(att.status),
        
        // Informações do Cliente
        cliente_nome: sanitizeValue(att.client_name),
        cliente_email: sanitizeValue(att.client_email),
        cliente_telefone: sanitizeValue(att.client_phone),
        cliente_documento: sanitizeValue(att.client_cpf || att.client_document),
        cliente_categoria: sanitizeValue(att.client_category),
        
        // Informações do Estudante
        estudante_id: sanitizeValue(studentId),
        estudante_nome: student ? sanitizeValue(student.name) : sanitizeValue(att.student_name),
        estudante_email: student ? sanitizeValue(student.email) : sanitizeValue(att.assigned_student_email),
        estudante_curso: student ? sanitizeValue(student.course) : 'N/A',
        estudante_semestre: student ? sanitizeValue(student.semester) : 'N/A',
        estudante_matricula: student ? sanitizeValue(student.registration_number) : 'N/A'
      }

      // Adicionar campos específicos baseado na origem
      if (source === 'fiscal_appointments') {
        Object.assign(baseData, {
          // Serviço Fiscal
          tipo_servico: sanitizeValue(att.service_type),
          titulo_servico: sanitizeValue(att.service_title),
          categoria_servico: sanitizeValue(att.service_category),
          detalhes_servico: sanitizeValue(JSON.stringify(att.service_details)),
          
          // Urgência e Prioridade
          nivel_urgencia: sanitizeValue(att.urgency_level),
          
          // Endereço do Cliente
          endereco_rua: sanitizeValue(att.address_street),
          endereco_numero: sanitizeValue(att.address_number),
          endereco_complemento: sanitizeValue(att.address_complement),
          endereco_bairro: sanitizeValue(att.address_neighborhood),
          endereco_cidade: sanitizeValue(att.address_city),
          endereco_estado: sanitizeValue(att.address_state),
          endereco_cep: sanitizeValue(att.address_zipcode),
          
          // Preferências de Agendamento
          data_preferida: formatDate(att.preferred_date),
          hora_preferida: sanitizeValue(att.preferred_time),
          periodo_preferido: sanitizeValue(att.preferred_period),
          
          // Avaliação
          avaliacao_satisfacao: sanitizeValue(att.client_satisfaction_rating),
          
          // Observações
          observacoes_cliente: sanitizeValue(att.client_notes),
          observacoes_internas: sanitizeValue(att.internal_notes),
          
          // Datas
          data_criacao: formatDate(att.created_at),
          data_atualizacao: formatDate(att.updated_at),
          data_confirmacao: formatDate(att.confirmed_at),
          data_agendamento: formatDate(att.scheduled_at),
          data_conclusao: formatDate(att.completed_at)
        })
      } else {
        // Tabela attendances
        Object.assign(baseData, {
          // Tipo de Serviço
          tipo_servico: sanitizeValue(att.service_type),
          descricao_servico: sanitizeValue(att.service_description),
          
          // Agendamento
          data_agendada: sanitizeValue(att.scheduled_date),
          hora_agendada: sanitizeValue(att.scheduled_time),
          duracao_minutos: sanitizeValue(att.duration_minutes),
          
          // Modalidade
          online: att.is_online ? 'Sim' : 'Nao',
          link_reuniao: sanitizeValue(att.meeting_link),
          local: sanitizeValue(att.location),
          
          // Urgência
          urgencia: sanitizeValue(att.urgency),
          
          // Avaliação e Feedback
          avaliacao_satisfacao: sanitizeValue(att.client_satisfaction_rating),
          feedback_cliente: sanitizeValue(att.client_feedback),
          notas_estudante: sanitizeValue(att.student_notes),
          
          // Validação
          validado_supervisor: att.supervisor_validation ? 'Sim' : 'Nao',
          supervisor_id: sanitizeValue(att.supervisor_id),
          
          // Documentos
          documentos: sanitizeValue(JSON.stringify(att.documents)),
          
          // Cancelamento
          motivo_cancelamento: sanitizeValue(att.cancellation_reason),
          
          // Datas
          data_criacao: formatDate(att.created_at),
          data_conclusao: formatDate(att.completed_at),
          data_cancelamento: formatDate(att.cancelled_at),
          data_validacao: formatDate(att.validated_at)
        })
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
