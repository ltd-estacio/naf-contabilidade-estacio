import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuração de Email com Nodemailer
const EMAIL_DESTINO = 'souzaestevam925@gmail.com'

// Criar transporter para envio de emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Pode ser alterado para outro serviço
  auth: {
    user: process.env.EMAIL_USER || 'souzaestevam925@gmail.com', // Configurar no .env
    pass: process.env.EMAIL_PASSWORD || 'kczj vzqk nlse iddy', // Senha de app do Gmail
  },
})

// Log de auditoria
async function logAuditAction(action: string, coordinatorId: string, success: boolean, details?: string) {
  try {
    await supabase.from('audit_logs').insert({
      action_type: action,
      user_id: coordinatorId,
      success,
      details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error)
  }
}

// Criar backup automático antes de operações destrutivas
async function createAutomaticBackup() {
  try {
    const tables = ['fiscal_appointments', 'attendances', 'appointments', 'attendance_feedback']
    const backupData: Record<string, unknown[]> = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      if (!error && data) {
        backupData[table] = data
      }
    }

    // Armazenar backup com timestamp
    const backupRecord = {
      backup_date: new Date().toISOString(),
      backup_type: 'automatic_danger_zone',
      data: JSON.stringify(backupData),
      tables_count: Object.keys(backupData).length,
      records_count: Object.values(backupData).reduce((sum, records) => sum + records.length, 0)
    }

    const { data: insertedBackup, error: insertError } = await supabase
      .from('system_backups')
      .insert(backupRecord)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao inserir backup:', insertError)
      return { success: false, message: 'Falha ao salvar backup' }
    }

    return { 
      success: true, 
      message: 'Backup automático criado com sucesso',
      backupData,
      backupRecord: insertedBackup
    }
  } catch (error) {
    console.error('Erro ao criar backup automático:', error)
    return { success: false, message: 'Falha ao criar backup automático' }
  }
}

// Função para enviar email de backup usando Nodemailer
async function sendBackupEmail(backupData: any, backupRecord: any, coordinatorName: string, coordinatorEmail: string) {
  try {
    console.log('📧 Iniciando envio de email de backup...')
    
    // Ler o template HTML
    const templatePath = path.join(process.cwd(), 'email-backup-template.html')
    console.log('📄 Lendo template de:', templatePath)
    
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
    console.log('✅ Template carregado, tamanho:', htmlTemplate.length, 'caracteres')

    // Formatar data e hora
    const backupDate = new Date(backupRecord.backup_date || new Date())
    const formattedDate = backupDate.toLocaleDateString('pt-BR')
    const formattedTime = backupDate.toLocaleTimeString('pt-BR')

    // Contar registros e estudantes
    let totalRecords = 0
    let tablesCount = 0
    const studentNames = new Set()

    for (const [tableName, records] of Object.entries(backupData)) {
      if (Array.isArray(records) && records.length > 0) {
        tablesCount++
        totalRecords += records.length
        
        // Extrair nomes de estudantes
        records.forEach((record: any) => {
          if (record.student_name) studentNames.add(record.student_name)
          if (record.name) studentNames.add(record.name)
        })
      }
    }

    // Criar lista de estudantes para o email
    const studentBadges = Array.from(studentNames)
      .slice(0, 10)
      .map(name => `<span class="badge" style="display: inline-block; padding: 6px 12px; margin: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 12px; font-weight: 500;">${name}</span>`)
      .join('')

    // Criar lista de tabelas detalhada
    const tablesList = Object.entries(backupData)
      .map(([tableName, records]) => {
        if (!Array.isArray(records)) return ''
        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; color: #374151; font-weight: 500;">${tableName}</td>
            <td style="padding: 12px; text-align: center; color: #6366f1; font-weight: 600;">${records.length}</td>
          </tr>
        `
      })
      .join('')

    console.log('📋 Tables List HTML gerado:', tablesList.substring(0, 200))

    // Criar link de download (usando o ID do backup)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const backupIdFromRecord = backupRecord.id || backupRecord.backup_id || 'unknown'
    const downloadLink = `${baseUrl}/api/backup/download/${backupIdFromRecord}`

    console.log('🔑 Backup Record ID:', backupIdFromRecord)
    console.log('📦 Backup Record completo:', JSON.stringify(backupRecord, null, 2))

    // Criar ID legível do backup
    const backupId = `BKP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${backupIdFromRecord.toString().substring(0, 8)}`

    console.log('🎫 Backup ID legível:', backupId)

    // Substituir variáveis no template
    console.log('🔄 Iniciando substituição de variáveis no template...')
    
    htmlTemplate = htmlTemplate
      .replace(/{{backup_date}}/g, formattedDate)
      .replace(/{{backup_time}}/g, formattedTime)
      .replace(/{{total_records}}/g, totalRecords.toString())
      .replace(/{{tables_count}}/g, tablesCount.toString())
      .replace(/{{students_count}}/g, studentNames.size.toString())
      .replace(/{{coordinator_name}}/g, coordinatorName)
      .replace(/{{coordinator_email}}/g, coordinatorEmail)
      .replace(/{{students_badges}}/g, studentBadges || '<span style="color: #9ca3af;">Nenhum estudante encontrado</span>')
      .replace(/{{tables_list}}/g, tablesList)
      .replace(/{{download_link}}/g, downloadLink)
      .replace(/{{backup_id}}/g, backupId)
      .replace(/{{backup_status}}/g, '✅ Concluído com Sucesso')
      .replace(/{{status_class}}/g, 'status-success')

    console.log('✅ Template preenchido com dados')
    console.log('📥 Link de download:', downloadLink)
    console.log('🎫 Backup ID no email:', backupId)
    console.log('📊 Total de registros:', totalRecords)
    console.log('📋 Número de tabelas:', tablesCount)
    
    // Verificar se as variáveis foram substituídas
    const hasPlaceholders = htmlTemplate.includes('{{')
    if (hasPlaceholders) {
      console.warn('⚠️ AVISO: Ainda existem placeholders não substituídos no template!')
      const remainingPlaceholders = htmlTemplate.match(/{{[^}]+}}/g)
      console.warn('⚠️ Placeholders restantes:', remainingPlaceholders)
    } else {
      console.log('✅ Todas as variáveis foram substituídas com sucesso!')
    }

    // Configurar email
    const mailOptions = {
      from: `"Sistema NAF" <${process.env.EMAIL_USER || 'naf@sistema.com'}>`,
      to: EMAIL_DESTINO,
      subject: `🛡️ Backup Automático de Dados - ${formattedDate}`,
      html: htmlTemplate,
    }

    console.log('📤 Enviando email para:', EMAIL_DESTINO)

    // Enviar email
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email de backup enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📧 Response:', info.response)
    
    return { 
      success: true, 
      message: `Email enviado com sucesso para ${EMAIL_DESTINO}`,
      messageId: info.messageId
    }

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao enviar email de backup')
    console.error('❌ Tipo do erro:', typeof error)
    console.error('❌ Nome do erro:', (error as any)?.name)
    console.error('❌ Mensagem:', (error as Error).message)
    console.error('❌ Stack:', (error as Error).stack)
    
    if (error && typeof error === 'object') {
      console.error('❌ Erro completo (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    }

        throw new Error(`Erro ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`)
  }
}

// Função principal do endpoint POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, twoFactorCode, coordinatorId } = body

    // Validar código 2FA (em produção, isso seria feito com um serviço real de 2FA)
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      return NextResponse.json(
        { error: 'Código 2FA inválido' },
        { status: 400 }
      )
    }

    // Validar coordenador
    if (!coordinatorId) {
      return NextResponse.json(
        { error: 'Coordenador não identificado' },
        { status: 401 }
      )
    }

    let result: { success: boolean; message: string; data?: unknown }

    switch (action) {
      case 'delete':
        // Criar backup antes de deletar
        const backupResult = await createAutomaticBackup()
        if (!backupResult.success) {
          await logAuditAction('DANGER_DELETE_FAILED', coordinatorId, false, 'Falha no backup automático')
          return NextResponse.json(
            { error: 'Não foi possível criar backup de segurança. Operação cancelada.' },
            { status: 500 }
          )
        }

        // Enviar backup por email
        console.log('🔄 Iniciando processo de envio de email...')
        console.log('📦 Dados do backup prontos:', {
          tables: Object.keys(backupResult.backupData || {}),
          records: backupResult.backupRecord?.records_count,
          coordinatorEmail: body.coordinatorEmail || 'coordenador@naf.com',
          coordinatorName: body.coordinatorName || 'Coordenador NAF'
        })
        
        const emailResult = await sendBackupEmail(
          backupResult.backupData!,
          backupResult.backupRecord!,
          body.coordinatorEmail || 'coordenador@naf.com',
          body.coordinatorName || 'Coordenador NAF'
        )

        console.log('📧 Resultado do envio de email:', emailResult)

        if (!emailResult.success) {
          console.error('❌ ERRO AO ENVIAR EMAIL:', emailResult.message)
          console.warn('⚠️ Aviso: Backup criado mas email não enviado:', emailResult.message)
          // Continua mesmo se o email falhar
        } else {
          console.log('✅✅✅ EMAIL DE BACKUP ENVIADO COM SUCESSO!')
          console.log('📧 Email enviado para: souzaestevam925@gmail.com')
        }

        // Deletar dados de atendimentos
        try {
          const tablesToClear = ['fiscal_appointments', 'attendance_feedback', 'appointments']
          let totalDeleted = 0
          
          for (const table of tablesToClear) {
            // Obter todos os IDs primeiro
            const { data: records, error: selectError } = await supabase
              .from(table)
              .select('id')
            
            if (selectError) {
              console.warn(`Aviso ao selecionar da tabela ${table}:`, selectError.message)
              continue
            }

            if (records && records.length > 0) {
              // Deletar todos os registros
              const { error: deleteError, count } = await supabase
                .from(table)
                .delete()
                .in('id', records.map(r => r.id))
              
              if (deleteError) {
                throw new Error(`Erro ao limpar tabela ${table}: ${deleteError.message}`)
              }
              
              totalDeleted += count || 0
            }
          }

          const successMessage = emailResult.success 
            ? `✅ Dados apagados com sucesso! ${totalDeleted} registros removidos.\n\n📧 Email de backup enviado para ${body.coordinatorEmail || 'coordenador@naf.com'}\n💾 Backup automático criado.`
            : `✅ Dados apagados com sucesso! ${totalDeleted} registros removidos.\n\n⚠️ Email não enviado: ${emailResult.message}\n💾 Backup automático criado.`

          await logAuditAction('DANGER_DELETE_SUCCESS', coordinatorId, true, `Dados removidos (${totalDeleted} registros). Email: ${emailResult.success ? 'Enviado' : 'Falhou'}`)
          result = {
            success: true,
            message: successMessage
          }
        } catch (error) {
          await logAuditAction('DANGER_DELETE_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro ao apagar dados: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      case 'confirm':
        // Verificar integridade dos dados
        try {
          const checks = []
          
          // Verificar fiscal_appointments
          const { count: fiscalCount, error: fiscalError } = await supabase
            .from('fiscal_appointments')
            .select('*', { count: 'exact', head: true })
          
          if (!fiscalError) {
            checks.push({ table: 'fiscal_appointments', count: fiscalCount || 0, status: 'OK' })
          }

          // Verificar attendances
          const { count: attendanceCount, error: attendanceError } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
          
          if (!attendanceError) {
            checks.push({ table: 'attendances', count: attendanceCount || 0, status: 'OK' })
          }

          // Verificar backup recente
          const { data: recentBackup, error: backupError } = await supabase
            .from('system_backups')
            .select('*')
            .order('backup_date', { ascending: false })
            .limit(1)

          const backupAge = recentBackup?.[0] 
            ? Math.floor((Date.now() - new Date(recentBackup[0].backup_date).getTime()) / (1000 * 60 * 60 * 24))
            : null

          await logAuditAction('DANGER_CONFIRM_SUCCESS', coordinatorId, true, JSON.stringify(checks))
          
          result = {
            success: true,
            message: `✅ Verificação concluída!\n\n${checks.map(c => `• ${c.table}: ${c.count} registros - ${c.status}`).join('\n')}\n\nÚltimo backup: ${backupAge !== null ? `${backupAge} dias atrás` : 'Nenhum backup encontrado'}`,
            data: { checks, backupAge }
          }
        } catch (error) {
          await logAuditAction('DANGER_CONFIRM_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro na verificação: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      case 'view':
        // Visualizar dados sensíveis
        try {
          const statistics = {
            fiscal_appointments: 0,
            attendances: 0,
            students: 0,
            total_records: 0
          }

          // Contar registros
          const { count: fiscalCount } = await supabase
            .from('fiscal_appointments')
            .select('*', { count: 'exact', head: true })
          
          const { count: attendanceCount } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
          
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })

          statistics.fiscal_appointments = fiscalCount || 0
          statistics.attendances = attendanceCount || 0
          statistics.students = studentCount || 0
          statistics.total_records = (fiscalCount || 0) + (attendanceCount || 0) + (studentCount || 0)

          await logAuditAction('DANGER_VIEW_SUCCESS', coordinatorId, true, 'Dados sensíveis acessados')
          
          result = {
            success: true,
            message: `✅ Dados carregados!\n\n• Agendamentos Fiscais: ${statistics.fiscal_appointments}\n• Atendimentos: ${statistics.attendances}\n• Estudantes: ${statistics.students}\n• Total: ${statistics.total_records} registros`,
            data: statistics
          }
        } catch (error) {
          await logAuditAction('DANGER_VIEW_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro ao visualizar dados: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no endpoint danger-zone:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
