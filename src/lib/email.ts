import nodemailer from 'nodemailer'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface DemandEmailData {
  userName: string
  userEmail: string
  serviceName: string
  protocolNumber: string
  description: string
  estimatedTime?: number
}

interface AttendanceEmailData {
  userName: string
  userEmail: string
  attendanceDescription: string
  hours: number
  isValidated: boolean
  validationNotes?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Configuração para desenvolvimento (usar serviço real em produção)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'naf.contabil@gmail.com',
        pass: process.env.SMTP_PASS || 'senha_app_gmail'
      }
    })
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"NAF Contábil" <naf.contabil@gmail.com>',
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || data.html.replace(/<[^>]*>/g, '') // Remove HTML tags for text version
      })

      console.log('Email enviado:', info.messageId)
      return true
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  async sendDemandConfirmation(data: DemandEmailData): Promise<boolean> {
    const subject = `Solicitação Recebida - Protocolo ${data.protocolNumber}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .protocol { background: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .steps { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .step { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .step:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ NAF - Núcleo de Apoio Contábil Fiscal</h1>
            <p>Sua solicitação foi recebida com sucesso!</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${data.userName}!</h2>
            
            <p>Recebemos sua solicitação de atendimento e nossa equipe já está analisando. Confira os detalhes abaixo:</p>
            
            <div class="protocol">
              📋 PROTOCOLO: ${data.protocolNumber}
            </div>
            
            <div class="info-box">
              <h3>📝 Detalhes da Solicitação</h3>
              <p><strong>Serviço:</strong> ${data.serviceName}</p>
              <p><strong>Descrição:</strong> ${data.description}</p>
              ${data.estimatedTime ? `<p><strong>Tempo estimado:</strong> ${data.estimatedTime} minutos</p>` : ''}
              <p><strong>Status:</strong> Pendente de análise</p>
            </div>
            
            <div class="steps">
              <h3>🚀 Próximos Passos</h3>
              <div class="step">
                <strong>1. Análise da Solicitação</strong><br>
                Nossa equipe irá analisar sua demanda (1-2 dias úteis)
              </div>
              <div class="step">
                <strong>2. Agendamento</strong><br>
                Entraremos em contato para agendar seu atendimento
              </div>
              <div class="step">
                <strong>3. Atendimento</strong><br>
                Atendimento presencial ou online com nossos especialistas
              </div>
              <div class="step">
                <strong>4. Acompanhamento</strong><br>
                Suporte contínuo até a resolução completa
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/demands" class="btn">
                📱 Acompanhar Solicitação
              </a>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">
                🏠 Ir para Dashboard
              </a>
            </div>
            
            <div class="info-box">
              <h3>📞 Precisa de Ajuda?</h3>
              <p>Se tiver dúvidas ou precisar de informações adicionais:</p>
              <p>
                📧 Email: naf.contabil@gmail.com<br>
                📱 WhatsApp: (11) 99999-9999<br>
                🕐 Horário: Segunda a Sexta, 8h às 17h
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema NAF. Não responda este email.</p>
            <p>© 2025 NAF - Núcleo de Apoio Contábil Fiscal</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: data.userEmail,
      subject,
      html
    })
  }

  async sendAttendanceNotification(data: AttendanceEmailData): Promise<boolean> {
    const subject = data.isValidated 
      ? `✅ Atendimento Validado - ${data.hours}h computadas`
      : `📝 Novo Atendimento Registrado - ${data.hours}h`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.isValidated ? '#059669' : '#f59e0b'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .hours-box { background: ${data.isValidated ? '#059669' : '#f59e0b'}; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${data.isValidated ? '#059669' : '#f59e0b'}; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.isValidated ? '✅' : '📝'} NAF - Atendimento ${data.isValidated ? 'Validado' : 'Registrado'}</h1>
            <p>${data.isValidated ? 'Suas horas foram validadas!' : 'Novo atendimento registrado!'}</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${data.userName}!</h2>
            
            <p>${data.isValidated 
              ? 'Temos boas notícias! Seu atendimento foi validado e as horas foram computadas em seu histórico.'
              : 'Um novo atendimento foi registrado em seu nome e está aguardando validação.'
            }</p>
            
            <div class="hours-box">
              ⏰ ${data.hours} HORA${data.hours !== 1 ? 'S' : ''} ${data.isValidated ? 'VALIDADA' : 'REGISTRADA'}${data.hours !== 1 ? 'S' : ''}
            </div>
            
            <div class="info-box">
              <h3>📋 Detalhes do Atendimento</h3>
              <p><strong>Descrição:</strong> ${data.attendanceDescription}</p>
              <p><strong>Horas:</strong> ${data.hours}h</p>
              <p><strong>Status:</strong> ${data.isValidated ? 'Validado ✅' : 'Aguardando validação ⏳'}</p>
              ${data.validationNotes ? `<p><strong>Observações:</strong> ${data.validationNotes}</p>` : ''}
            </div>
            
            ${data.isValidated ? `
              <div class="info-box">
                <h3>🎉 Parabéns!</h3>
                <p>Suas horas foram validadas e já estão computadas em seu histórico acadêmico. Continue prestando excelentes atendimentos!</p>
              </div>
            ` : `
              <div class="info-box">
                <h3>⏳ Aguardando Validação</h3>
                <p>Seu atendimento foi registrado e está aguardando validação de um professor ou coordenador. Você será notificado assim que for validado.</p>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/attendances" class="btn">
                📊 Ver Atendimentos
              </a>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">
                🏠 Dashboard
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema NAF. Não responda este email.</p>
            <p>© 2025 NAF - Núcleo de Apoio Contábil Fiscal</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: data.userEmail,
      subject,
      html
    })
  }

  async sendWelcomeEmail(userName: string, userEmail: string, userRole: string): Promise<boolean> {
    const roleNames: Record<string, string> = {
      'COORDINATOR': 'Coordenador',
      'TEACHER': 'Professor',
      'STUDENT': 'Aluno',
      'USER': 'Usuário'
    }

    const subject = `Bem-vindo ao NAF - ${roleNames[userRole] || 'Usuário'}!`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; text-align: center; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .feature { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .feature:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao NAF!</h1>
            <p>Núcleo de Apoio Contábil Fiscal</p>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2>Olá, ${userName}!</h2>
              <p>É um prazer ter você conosco como <strong>${roleNames[userRole] || 'Usuário'}</strong> do NAF.</p>
              <p>Nosso sistema foi desenvolvido para facilitar o acesso aos serviços contábeis e fiscais.</p>
            </div>
            
            <div class="features">
              <h3>🚀 O que você pode fazer</h3>
              ${this.getFeaturesByRole(userRole)}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">
                🏠 Acessar Dashboard
              </a>
              <a href="${process.env.NEXTAUTH_URL}/services" class="btn">
                🛠️ Ver Serviços
              </a>
            </div>
            
            <div class="features">
              <h3>📞 Suporte</h3>
              <p>Se precisar de ajuda, nossa equipe está sempre disponível:</p>
              <p>
                📧 Email: naf.contabil@gmail.com<br>
                📱 WhatsApp: (11) 99999-9999<br>
                🕐 Horário: Segunda a Sexta, 8h às 17h
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2025 NAF - Núcleo de Apoio Contábil Fiscal</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  private getFeaturesByRole(role: string): string {
    const features: Record<string, string[]> = {
      'COORDINATOR': [
        '👁️ Visualizar todas as estatísticas do sistema',
        '⚙️ Gerenciar serviços e configurações',
        '✅ Validar atendimentos automaticamente',
        '📊 Gerar relatórios completos',
        '👥 Gerenciar usuários e permissões'
      ],
      'TEACHER': [
        '👨‍🎓 Supervisionar atendimentos de alunos',
        '✅ Validar horas de estudantes',
        '📋 Acompanhar demandas em supervisão',
        '📊 Gerar relatórios de turma',
        '💬 Sistema de comunicação integrado'
      ],
      'STUDENT': [
        '📝 Registrar seus atendimentos',
        '📊 Visualizar estatísticas pessoais',
        '🎯 Criar demandas para prática',
        '⏳ Acompanhar validações pendentes',
        '🏆 Acessar certificados e histórico'
      ],
      'USER': [
        '📋 Solicitar atendimentos especializados',
        '👀 Acompanhar suas solicitações',
        '🛠️ Explorar catálogo de serviços',
        '💬 Chat de suporte integrado',
        '📱 Agendar atendimentos'
      ]
    }

    const roleFeatures = features[role] || features['USER']
    return roleFeatures.map(feature => `<div class="feature">${feature}</div>`).join('')
  }
}

export const emailService = new EmailService()
