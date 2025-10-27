import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Configuração do Nodemailer com credenciais corretas
// Nota: A senha de app do Gmail pode ter espaços
const emailUser = process.env.EMAIL_USER || 'souzaestevam925@gmail.com'
const emailPassword = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || 'kcvzqknlseiddy').replace(/\s/g, '') // Remove espaços

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword
  }
})

console.log('📧 Nodemailer configurado:', {
  user: emailUser,
  passwordLength: emailPassword.length
})

/**
 * POST - Enviar backup por e-mail
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API /api/backup/send-email CHAMADA!')
  console.log('🚀 Environment vars:', {
    hasEmailUser: !!process.env.EMAIL_USER,
    emailUser: process.env.EMAIL_USER || 'souzaestevam925@gmail.com',
    hasEmailAppPassword: !!process.env.EMAIL_APP_PASSWORD,
    hasEmailPass: !!process.env.EMAIL_PASS,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
  
  try {
    console.log('📧 ========================================')
    console.log('📧 Iniciando envio de backup por e-mail...')
    console.log('📧 ========================================')

    const body = await request.json()
    console.log('📦 Body recebido:', {
      hasCoordinatorEmail: !!body.coordinatorEmail,
      hasCoordinatorName: !!body.coordinatorName,
      hasBackupData: !!body.backupData,
      studentsCount: body.students?.length || 0
    })

    const {
      coordinatorEmail,
      coordinatorName,
      backupData,
      students = []
    } = body

    // Validações
    if (!coordinatorEmail) {
      console.error('❌ E-mail do coordenador não fornecido')
      return NextResponse.json(
        { error: 'E-mail do coordenador é obrigatório' },
        { status: 400 }
      )
    }

    if (!backupData) {
      console.error('❌ Dados do backup não fornecidos')
      return NextResponse.json(
        { error: 'Dados do backup são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Criar backup no banco de dados
    console.log('💾 Salvando backup no banco de dados...')
    
    const totalRecords = Object.keys(backupData).reduce((total, key) => {
      const data = backupData[key]
      return total + (Array.isArray(data) ? data.length : 0)
    }, 0)

    const backupRecord = {
      created_at: new Date().toISOString(),
      coordinator_email: coordinatorEmail,
      coordinator_name: coordinatorName || 'Coordenador',
      total_records: totalRecords,
      tables: Object.keys(backupData).length,
      students_count: students.length,
      status: 'completed',
      backup_type: 'email',
      data: backupData
    }

    console.log('💾 Dados do backup:', {
      totalRecords,
      tables: Object.keys(backupData).length,
      studentsCount: students.length
    })

    let backupId: string
    try {
      const { data: savedBackup, error: saveError } = await supabase
        .from('backups')
        .insert(backupRecord)
        .select()
        .single()

      if (saveError) {
        console.warn('⚠️ Erro ao salvar no banco, usando ID temporário:', saveError.message)
        backupId = `backup-${Date.now()}`
      } else {
        backupId = savedBackup?.id || `backup-${Date.now()}`
        console.log('✅ Backup salvo com ID:', backupId)
      }
    } catch (dbError: any) {
      console.warn('⚠️ Erro no banco de dados, continuando:', dbError.message)
      backupId = `backup-${Date.now()}`
    }

    // 2. Preparar dados para o email
    console.log('📝 Preparando dados do e-mail...')
    
    const now = new Date()
    const backupDate = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const backupTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const tablesCount = Object.keys(backupData).length
    const studentsCount = students.length

    // 3. Gerar nome do arquivo
    const filename = `backup_naf_${now.toISOString().split('T')[0]}_${backupId}.json`

    // 4. Criar o arquivo JSON do backup
    console.log('📦 Criando arquivo JSON do backup...')
    
    const backupContent = JSON.stringify({
      metadata: {
        version: '1.0',
        backup_id: backupId,
        exported_at: now.toISOString(),
        coordinator: {
          name: coordinatorName,
          email: coordinatorEmail
        },
        total_records: totalRecords,
        tables_count: tablesCount,
        students_count: studentsCount
      },
      data: backupData,
      students: students
    }, null, 2)

    console.log('✅ Arquivo JSON criado:', {
      filename,
      sizeKB: (Buffer.byteLength(backupContent, 'utf8') / 1024).toFixed(2)
    })

    // 5. Ler o template de email
    console.log('📄 Lendo template de e-mail...')
    
    let emailHTML: string
    try {
      const templatePath = path.join(process.cwd(), 'email-backup-template-old.html')
      console.log('📄 Caminho do template:', templatePath)
      
      emailHTML = await fs.readFile(templatePath, 'utf-8')
      console.log('✅ Template lido com sucesso')
    } catch (templateError: any) {
      console.error('❌ Erro ao ler template:', templateError.message)
      
      // Fallback: template HTML simples
      console.log('📄 Usando template fallback...')
      emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Backup NAF</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #0057B8;">🛡️ Backup NAF Contabilidade</h1>
          <p>Backup gerado em: <strong>${backupDate} às ${backupTime}</strong></p>
          <p>Total de registros: <strong>${totalRecords}</strong></p>
          <p>Tabelas incluídas: <strong>${tablesCount}</strong></p>
          <p>Estudantes: <strong>${studentsCount}</strong></p>
          <p>ID do backup: <code>${backupId}</code></p>
          <hr>
          <p>O arquivo JSON está anexado a este e-mail.</p>
          <p><small>Este é um e-mail automático do sistema NAF.</small></p>
        </body>
        </html>
      `
    }

    // 6. Substituir placeholders no template (se não for fallback)
    if (emailHTML.includes('{{backup_date}}')) {
      console.log('🔄 Substituindo placeholders no template...')
      
      const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://naf.ltdestacio.com.br'}/api/backup/download/${backupId}`

      // Criar lista de tabelas
      const tablesList = Object.keys(backupData)
        .map(table => `<li>${table}</li>`)
        .join('\n')

      // Criar badges de estudantes
      const studentsBadges = students
        .map((student: any) => `<span class="student-badge">${student.name || student.email || 'Estudante'}</span>`)
        .join('\n')

      // Substituir todos os placeholders
      emailHTML = emailHTML
        .replace(/{{backup_date}}/g, backupDate)
        .replace(/{{backup_time}}/g, backupTime)
        .replace(/{{total_records}}/g, totalRecords.toString())
        .replace(/{{backup_status}}/g, 'SUCESSO')
        .replace(/{{status_class}}/g, 'status-success')
        .replace(/{{tables_list}}/g, tablesList)
        .replace(/{{students_badges}}/g, studentsBadges || '<span class="student-badge">Nenhum estudante</span>')
        .replace(/{{download_link}}/g, downloadLink)
        .replace(/{{backup_id}}/g, backupId)
        .replace(/{{coordinator_name}}/g, coordinatorName || 'Coordenador')
        .replace(/{{coordinator_email}}/g, coordinatorEmail)

      console.log('✅ Placeholders substituídos')
    }

    // 7. Enviar e-mail com anexo
    console.log('📧 ========================================')
    console.log('📧 Enviando e-mail...')
    console.log('📧 Para:', coordinatorEmail)
    console.log('📧 Assunto:', `🛡️ Backup NAF - ${backupDate} às ${backupTime}`)
    console.log('📧 ========================================')

    const mailOptions = {
      from: {
        name: 'NAF Contabilidade - Sistema de Backup',
        address: process.env.EMAIL_USER || 'souzaestevam925@gmail.com'
      },
      to: coordinatorEmail,
      subject: `🛡️ Backup NAF - ${backupDate} às ${backupTime}`,
      html: emailHTML,
      attachments: [
        {
          filename: filename,
          content: backupContent,
          contentType: 'application/json'
        }
      ]
    }

    let emailInfo
    try {
      emailInfo = await transporter.sendMail(mailOptions)
      console.log('✅ E-mail enviado com sucesso!')
      console.log('✅ Message ID:', emailInfo.messageId)
    } catch (emailError: any) {
      console.error('❌ Erro ao enviar e-mail:', emailError)
      throw new Error(`Erro no envio de e-mail: ${emailError.message}`)
    }

    // 8. Retornar resposta de sucesso
    console.log('📧 ========================================')
    console.log('📧 Processo concluído com sucesso!')
    console.log('📧 ========================================')

    return NextResponse.json({
      success: true,
      message: 'Backup enviado por e-mail com sucesso',
      data: {
        backup_id: backupId,
        filename: filename,
        email_sent_to: coordinatorEmail,
        message_id: emailInfo.messageId,
        total_records: totalRecords,
        tables_count: tablesCount,
        students_count: studentsCount,
        download_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://naf.ltdestacio.com.br'}/api/backup/download/${backupId}`
      }
    })

  } catch (error: any) {
    console.error('❌ ========================================')
    console.error('❌ ERRO CRÍTICO ao enviar backup por e-mail')
    console.error('❌ ========================================')
    console.error('❌ Erro:', error)
    console.error('❌ Mensagem:', error.message)
    console.error('❌ Stack:', error.stack)
    console.error('❌ ========================================')
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao enviar backup por e-mail',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
