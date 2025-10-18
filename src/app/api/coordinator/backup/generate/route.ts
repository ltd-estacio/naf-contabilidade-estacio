import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type StudentInfo = {
  id: string
  name: string | null
  email: string | null
  course: string | null
  semester: string | null
}

export const dynamic = 'force-dynamic'

/**
 * POST - Gerar backup de atendimentos fiscais em múltiplos formatos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      coordinatorId,
      coordinatorName,
      coordinatorEmail,
      format = 'csv',
      filters = {},
      dateRange = {},
      includeFeeback = true
    } = body

    if (!coordinatorId || !coordinatorName || !coordinatorEmail) {
      return NextResponse.json(
        { error: 'Dados do coordenador são obrigatórios' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Construir query com filtros
    let query = supabase
      .from('fiscal_appointments')
      .select('*')
      .order('created_at', { ascending: false })

    // Aplicar filtros de status
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    // Aplicar filtros de data
    if (dateRange.start) {
      query = query.gte('created_at', dateRange.start)
    }
    if (dateRange.end) {
      query = query.lte('created_at', dateRange.end)
    }

    // Aplicar filtro de estudante
    if (filters.studentId) {
      query = query.eq('assigned_student_id', filters.studentId)
    }

    // Aplicar filtro de categoria
    if (filters.category) {
      query = query.eq('service_category', filters.category)
    }

    const { data: appointments, error: appointmentsError } = await query

    if (appointmentsError) {
      console.error('Erro ao buscar atendimentos:', appointmentsError)
      return NextResponse.json(
        { error: 'Erro ao buscar atendimentos' },
        { status: 500 }
      )
    }

    // Buscar dados dos estudantes associados aos atendimentos
    let studentsMap: Record<string, StudentInfo> = {}
    const studentIds = Array.from(
      new Set(
        (appointments || [])
          .map(apt => apt.assigned_student_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    if (studentIds.length > 0) {
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email, course, semester')
        .in('id', studentIds)

      if (studentsError) {
        console.error('Erro ao buscar estudantes para o backup:', studentsError)
      } else if (students) {
        studentsMap = students.reduce((acc: Record<string, StudentInfo>, student) => {
          acc[student.id] = student
          return acc
        }, {})
      }
    }

    // Buscar feedbacks se solicitado
    let feedbacksMap: Record<string, any> = {}
    if (includeFeeback && appointments && appointments.length > 0) {
      const appointmentIds = appointments.map(apt => apt.id)
      const { data: feedbacks } = await supabase
        .from('fiscal_appointment_feedbacks')
        .select('*')
        .in('appointment_id', appointmentIds)

      if (feedbacks) {
        feedbacks.forEach(feedback => {
          feedbacksMap[feedback.appointment_id] = feedback
        })
      }
    }

    // Preparar dados para exportação
    const exportData = appointments?.map(apt => {
      const feedback = feedbacksMap[apt.id]
      const assignedStudent = apt.assigned_student_id ? studentsMap[apt.assigned_student_id] : undefined
      return {
        // Dados básicos do atendimento
        protocolo: apt.protocol || 'N/A',
        status: apt.status,
        servico: apt.service_title,
        categoria: apt.service_category,
        tipo_servico: apt.service_type,

        // Dados do cliente
        cliente_nome: apt.client_name,
        cliente_email: apt.client_email,
        cliente_telefone: apt.client_phone,
        cliente_cpf: apt.client_cpf || 'N/A',
        cliente_nascimento: apt.client_birth_date || 'N/A',

        // Endereço
        endereco_completo: `${apt.address_street}, ${apt.address_number}${apt.address_complement ? ' - ' + apt.address_complement : ''} - ${apt.address_neighborhood}, ${apt.address_city}/${apt.address_state}`,
        cep: apt.address_zipcode || 'N/A',

        // Dados de agendamento
        urgencia: apt.urgency_level,
        data_preferencia: apt.preferred_date || 'N/A',
        horario_preferencia: apt.preferred_time || 'N/A',
        periodo_preferencia: apt.preferred_period || 'N/A',

        // Estudante responsável
        estudante_nome: assignedStudent?.name || 'Não atribuído',
        estudante_email: assignedStudent?.email || 'N/A',
        estudante_curso: assignedStudent?.course || 'N/A',
        estudante_semestre: assignedStudent?.semester || 'N/A',

        // Datas importantes
        data_criacao: new Date(apt.created_at).toLocaleString('pt-BR'),
        data_atualizacao: apt.updated_at ? new Date(apt.updated_at).toLocaleString('pt-BR') : 'N/A',
        data_confirmacao: apt.confirmed_at ? new Date(apt.confirmed_at).toLocaleString('pt-BR') : 'N/A',
        data_agendamento: apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleString('pt-BR') : 'N/A',
        data_conclusao: apt.completed_at ? new Date(apt.completed_at).toLocaleString('pt-BR') : 'N/A',

        // Observações
        observacoes_cliente: apt.client_notes || 'Nenhuma',
        observacoes_internas: apt.internal_notes || 'Nenhuma',

        // Feedback (se disponível)
        ...(feedback ? {
          avaliacao_geral: feedback.rating || 'N/A',
          qualidade_atendimento: feedback.attendance_quality || 'N/A',
          pontualidade: feedback.punctuality || 'N/A',
          profissionalismo: feedback.professionalism || 'N/A',
          resolucao_problema: feedback.problem_resolution || 'N/A',
          recomendaria: feedback.would_recommend ? 'Sim' : 'Não',
          comentarios_feedback: feedback.feedback_text || 'Nenhum',
          comentarios_adicionais: feedback.additional_comments || 'Nenhum',
          data_feedback: new Date(feedback.created_at).toLocaleString('pt-BR')
        } : {
          avaliacao_geral: 'Sem feedback',
          qualidade_atendimento: 'N/A',
          pontualidade: 'N/A',
          profissionalismo: 'N/A',
          resolucao_problema: 'N/A',
          recomendaria: 'N/A',
          comentarios_feedback: 'Sem feedback',
          comentarios_adicionais: 'N/A',
          data_feedback: 'N/A'
        })
      }
    }) || []

    // Gerar arquivo no formato solicitado
    let fileContent: string
    let mimeType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        fileContent = generateCSV(exportData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break

      case 'json':
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        fileExtension = 'json'
        break

      case 'txt':
        fileContent = generateTXT(exportData)
        mimeType = 'text/plain'
        fileExtension = 'txt'
        break

      case 'excel':
        // Para Excel, vamos gerar um CSV que pode ser aberto no Excel
        fileContent = generateCSV(exportData)
        mimeType = 'application/vnd.ms-excel'
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

    // Registrar log de backup
    const { error: logError } = await supabase
      .from('backup_logs')
      .insert({
        coordinator_id: coordinatorId,
        coordinator_name: coordinatorName,
        coordinator_email: coordinatorEmail,
        backup_type: 'download',
        export_format: format,
        file_size_kb: fileSizeKB,
        total_records: exportData.length,
        filter_applied: filters,
        date_range: dateRange,
        status_filter: filters.status || [],
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: true,
        execution_time_ms: executionTime
      })

    if (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    // Retornar arquivo como base64 para download no frontend
    const base64Content = Buffer.from(fileContent, 'utf8').toString('base64')

    return NextResponse.json({
      success: true,
      data: {
        content: base64Content,
        fileName: `backup_atendimentos_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
        mimeType,
        fileSize: fileSizeKB,
        totalRecords: exportData.length,
        executionTime
      }
    })

  } catch (error) {
    console.error('Erro ao gerar backup:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Funções auxiliares para gerar diferentes formatos

function generateCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = []

  // Header
  csvRows.push(headers.join(','))

  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      const escaped = ('' + value).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

function generateTXT(data: any[]): string {
  if (data.length === 0) return 'Nenhum registro encontrado.'

  let content = '========================================\n'
  content += '   BACKUP DE ATENDIMENTOS FISCAIS\n'
  content += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
  content += `   Total de registros: ${data.length}\n`
  content += '========================================\n\n'

  data.forEach((record, index) => {
    content += `\n--- REGISTRO ${index + 1} ---\n`
    Object.entries(record).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').toUpperCase()
      content += `${label}: ${value}\n`
    })
    content += '\n' + '-'.repeat(50) + '\n'
  })

  return content
}
