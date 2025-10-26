import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import emailjs from '@emailjs/nodejs'
import fs from 'fs'
import path from 'path'

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuração EmailJS
const EMAILJS_SERVICE_ID = 'service_xehr3ta'
const EMAILJS_TEMPLATE_ID = 'template_d2rfx39'
const EMAILJS_PUBLIC_KEY = 'nGm0I7osOMW7psoqF'

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

    await supabase.from('system_backups').insert(backupRecord)

    return { 
      success: true, 
      message: 'Backup automático criado com sucesso',
      backupData,
      backupRecord
    }
  } catch (error) {
    console.error('Erro ao criar backup automático:', error)
    return { success: false, message: 'Falha ao criar backup automático' }
  }
}

// Função para enviar backup por email usando EmailJS
async function sendBackupEmail(
  backupData: Record<string, unknown[]>,
  backupRecord: { backup_date: string; tables_count: number; records_count: number },
  coordinatorEmail: string,
  coordinatorName: string
) {
  try {
    // Ler o template HTML
    const templatePath = path.join(process.cwd(), 'email-backup-template.html')
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

    // Extrair nomes de estudantes únicos
    const studentNames = new Set<string>()
    if (backupData.attendances) {
      backupData.attendances.forEach((attendance: any) => {
        if (attendance.student_name) {
          studentNames.add(attendance.student_name)
        }
      })
    }

    // Formatar data e hora
    const backupDate = new Date(backupRecord.backup_date)
    const formattedDate = backupDate.toLocaleDateString('pt-BR')
    const formattedTime = backupDate.toLocaleTimeString('pt-BR')

    // Criar lista de tabelas
    const tablesList = Object.keys(backupData)
      .map(table => `<li>${table} (${backupData[table].length} registros)</li>`)
      .join('')

    // Criar badges de estudantes
    const studentsBadges = Array.from(studentNames)
      .map(name => `<span class="student-badge">${name}</span>`)
      .join('')

    // Criar link de download (mock - em produção seria um link real)
    const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/api/backup/download/${Date.now()}`

    // Substituir variáveis no template
    htmlTemplate = htmlTemplate
      .replace('{{backup_date}}', formattedDate)
      .replace('{{backup_time}}', formattedTime)
      .replace('{{total_records}}', backupRecord.records_count.toString())
      .replace('{{backup_status}}', '✅ Sucesso')
      .replace('{{status_class}}', 'status-success')
      .replace('{{tables_list}}', tablesList)
      .replace('{{students_badges}}', studentsBadges || '<span class="student-badge">Nenhum estudante encontrado</span>')
      .replace('{{download_link}}', downloadLink)
      .replace('{{backup_id}}', `BKP-${Date.now()}`)
      .replace('{{coordinator_name}}', coordinatorName)
      .replace('{{coordinator_email}}', coordinatorEmail)

    // Preparar dados para EmailJS
    const templateParams = {
      to_email: coordinatorEmail,
      to_name: coordinatorName,
      subject: `🛡️ Backup Automático de Dados - ${formattedDate}`,
      html_content: htmlTemplate,
      backup_date: formattedDate,
      backup_time: formattedTime,
      total_records: backupRecord.records_count.toString(),
      tables_count: backupRecord.tables_count.toString(),
      students_count: studentNames.size.toString(),
      backup_status: 'Concluído com sucesso'
    }

    // Enviar email via EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    )

    console.log('✅ Email de backup enviado com sucesso:', response)
    return { success: true, message: 'Email enviado com sucesso' }

  } catch (error) {
    console.error('❌ Erro ao enviar email de backup:', error)
    return { 
      success: false, 
      message: `Erro ao enviar email: ${(error as Error).message}` 
    }
  }
}

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
        const emailResult = await sendBackupEmail(
          backupResult.backupData!,
          backupResult.backupRecord!,
          body.coordinatorEmail || 'coordenador@naf.com',
          body.coordinatorName || 'Coordenador NAF'
        )

        if (!emailResult.success) {
          console.warn('⚠️ Aviso: Backup criado mas email não enviado:', emailResult.message)
          // Continua mesmo se o email falhar
        } else {
          console.log('✅ Email de backup enviado com sucesso!')
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
