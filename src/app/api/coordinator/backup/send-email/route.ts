import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST - Enviar backup por e-mail
 * Nota: Esta é uma versão simplificada. Em produção, você deve usar um serviço como SendGrid, AWS SES, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      coordinatorId,
      coordinatorName,
      coordinatorEmail,
      recipientEmail,
      format = 'csv',
      filters = {},
      dateRange = {},
      includeFeeback = true,
      message = ''
    } = body

    if (!coordinatorId || !coordinatorName || !coordinatorEmail || !recipientEmail) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Gerar o backup (reutilizar lógica da rota generate)
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/coordinator/backup/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinatorId,
        coordinatorName,
        coordinatorEmail,
        format,
        filters,
        dateRange,
        includeFeeback
      })
    })

    if (!generateResponse.ok) {
      throw new Error('Erro ao gerar backup')
    }

    const generateData = await generateResponse.json()
    const executionTime = Date.now() - startTime

    // Em produção, aqui você enviaria o e-mail com o anexo usando um serviço de e-mail
    // Por enquanto, vamos apenas simular o envio e registrar o log

    console.log(`📧 Simulando envio de e-mail para: ${recipientEmail}`)
    console.log(`📎 Arquivo: ${generateData.data.fileName}`)
    console.log(`📊 Tamanho: ${generateData.data.fileSize.toFixed(2)} KB`)
    console.log(`📝 Mensagem: ${message || 'Sem mensagem'}`)

    // Registrar log de backup via e-mail
    const { error: logError } = await supabase
      .from('backup_logs')
      .insert({
        coordinator_id: coordinatorId,
        coordinator_name: coordinatorName,
        coordinator_email: coordinatorEmail,
        backup_type: 'email',
        export_format: format,
        file_size_kb: generateData.data.fileSize,
        total_records: generateData.data.totalRecords,
        filter_applied: filters,
        date_range: dateRange,
        status_filter: filters.status || [],
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        email_sent_to: recipientEmail,
        success: true,
        execution_time_ms: executionTime
      })

    if (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'E-mail enviado com sucesso (simulado)',
      data: {
        recipientEmail,
        fileName: generateData.data.fileName,
        fileSize: generateData.data.fileSize,
        totalRecords: generateData.data.totalRecords,
        executionTime
      }
    })

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)

    // Registrar log de falha
    try {
      await supabase.from('backup_logs').insert({
        coordinator_id: request.body ? JSON.parse(await request.text()).coordinatorId : 'unknown',
        coordinator_name: 'Error',
        coordinator_email: 'error@error.com',
        backup_type: 'email',
        export_format: 'csv',
        total_records: 0,
        success: false,
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
        execution_time_ms: 0
      })
    } catch {}

    return NextResponse.json(
      {
        error: 'Erro ao enviar e-mail',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
