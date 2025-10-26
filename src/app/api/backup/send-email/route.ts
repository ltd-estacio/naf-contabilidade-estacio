import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'naf.contabilidade@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
})

/**
 * POST - Enviar backup por e-mail
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📧 Iniciando envio de backup por e-mail...')

    const body = await request.json()
    const {
      coordinatorEmail,
      coordinatorName,
      backupData,
      students = []
    } = body

    if (!coordinatorEmail) {
      return NextResponse.json(
        { error: 'E-mail do coordenador é obrigatório' },
        { status: 400 }
      )
    }

    if (!backupData) {
      return NextResponse.json(
        { error: 'Dados do backup são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Criar backup no banco de dados
    const backupRecord = {
      created_at: new Date().toISOString(),
      coordinator_email: coordinatorEmail,
      coordinator_name: coordinatorName || 'Coordenador',
      total_records: Object.keys(backupData).reduce((total, key) => {
        const data = backupData[key]
        return total + (Array.isArray(data) ? data.length : 0)
      }, 0),
      tables: Object.keys(backupData).length,
      students_count: students.length,
      status: 'completed',
      backup_type: 'email',
      data: backupData
    }

    const { data: savedBackup, error: saveError } = await supabase
      .from('backups')
      .insert(backupRecord)
      .select()
      .single()

    const backupId = savedBackup?.id || `backup-${Date.now()}`
    console.log('💾 Backup salvo:', backupId)

    // 2. Preparar dados para o email
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

    const totalRecords = backupRecord.total_records
    const tablesCount = backupRecord.tables
    const studentsCount = students.length

    // 3. Gerar nome do arquivo
    const filename = `backup_naf_${now.toISOString().split('T')[0]}_${backupId}.json`

    // 4. Criar o arquivo JSON do backup
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

    // 5. Ler o template de email
    const templatePath = path.join(process.cwd(), 'email-backup-template-old.html')
    let emailHTML = await fs.readFile(templatePath, 'utf-8')

    // 6. Substituir placeholders no template
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

    // 7. Enviar e-mail com anexo
    console.log('📧 Enviando e-mail para:', coordinatorEmail)

    const mailOptions = {
      from: {
        name: 'NAF Contabilidade - Sistema de Backup',
        address: process.env.EMAIL_USER || 'naf.contabilidade@gmail.com'
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

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ E-mail enviado:', info.messageId)

    // 8. Retornar resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Backup enviado por e-mail com sucesso',
      data: {
        backup_id: backupId,
        filename: filename,
        email_sent_to: coordinatorEmail,
        message_id: info.messageId,
        total_records: totalRecords,
        tables_count: tablesCount,
        students_count: studentsCount,
        download_link: downloadLink
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao enviar backup por e-mail:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao enviar backup por e-mail',
        details: error.message
      },
      { status: 500 }
    )
  }
}
