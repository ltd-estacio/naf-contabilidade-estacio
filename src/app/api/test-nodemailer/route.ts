import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de teste para verificar configuração do Nodemailer
 * GET /api/test-nodemailer
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 ========================================')
    console.log('🧪 TESTE NODEMAILER - Iniciando...')
    console.log('🧪 ========================================')

    // 1. Verificar variáveis de ambiente
    console.log('🔍 Verificando environment variables...')
    
    const envCheck = {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : undefined,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS
    }

    console.log('📋 Environment check:', envCheck)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Variáveis EMAIL_USER ou EMAIL_PASS não configuradas!')
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        details: {
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASS: !!process.env.EMAIL_PASS,
          message: 'Configure EMAIL_USER e EMAIL_PASS nas variáveis de ambiente'
        }
      }, { status: 500 })
    }

    // 2. Criar transporter
    console.log('📧 Criando transporter do Nodemailer...')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    console.log('✅ Transporter criado')

    // 3. Verificar conexão SMTP
    console.log('🔌 Testando conexão SMTP...')
    
    try {
      await transporter.verify()
      console.log('✅ Conexão SMTP verificada com sucesso!')
    } catch (verifyError: any) {
      console.error('❌ Erro na verificação SMTP:', verifyError)
      return NextResponse.json({
        success: false,
        error: 'Falha na conexão SMTP',
        details: {
          message: verifyError.message,
          code: verifyError.code,
          command: verifyError.command,
          possibleCauses: [
            'Senha de aplicativo incorreta',
            'Autenticação de 2 fatores não configurada',
            'Acesso de apps menos seguros bloqueado',
            'Firewall bloqueando porta 587/465'
          ]
        }
      }, { status: 500 })
    }

    // 4. Enviar email de teste
    console.log('📨 Enviando e-mail de teste...')
    
    const testEmail = process.env.EMAIL_USER

    const mailOptions = {
      from: {
        name: 'NAF - Teste Nodemailer',
        address: process.env.EMAIL_USER
      },
      to: testEmail,
      subject: '🧪 Teste Nodemailer - NAF Backup System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #0057B8; margin-top: 0; }
            .success { color: #28a745; font-weight: bold; font-size: 18px; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .check { list-style: none; padding: 0; }
            .check li { padding: 8px 0; }
            .check li:before { content: '✅ '; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #d63384; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Teste de Nodemailer - Sistema NAF</h1>
            <p class="success">✅ Configuração funcionando perfeitamente!</p>
            
            <div class="info">
              <p><strong>📊 Informações do Teste:</strong></p>
              <ul>
                <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                <li><strong>Servidor SMTP:</strong> Gmail (smtp.gmail.com)</li>
                <li><strong>Usuário:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Status da Conexão:</strong> <span style="color: #28a745;">ATIVA</span></li>
                <li><strong>Transporter:</strong> Nodemailer</li>
              </ul>
            </div>

            <p><strong>Este teste confirma que:</strong></p>
            <ul class="check">
              <li>Variáveis de ambiente <code>EMAIL_USER</code> e <code>EMAIL_PASS</code> estão configuradas</li>
              <li>Conexão SMTP com o Gmail está funcionando</li>
              <li>Autenticação está correta</li>
              <li>Nodemailer consegue enviar e-mails</li>
              <li>Sistema está pronto para enviar backups por e-mail</li>
            </ul>

            <p style="margin-top: 20px;">
              <strong>🚀 Próximo passo:</strong> O sistema de backup por e-mail deve funcionar corretamente agora!
            </p>

            <div class="footer">
              <p>Este é um e-mail automático de teste do sistema NAF Backup.</p>
              <p>Endpoint: <code>GET /api/test-nodemailer</code></p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    console.log('📧 Enviando para:', testEmail)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ ========================================')
    console.log('✅ E-mail enviado com SUCESSO!')
    console.log('✅ Message ID:', info.messageId)
    console.log('✅ Accepted:', info.accepted)
    console.log('✅ Rejected:', info.rejected)
    console.log('✅ ========================================')

    return NextResponse.json({
      success: true,
      message: '🎉 E-mail de teste enviado com sucesso! Verifique sua caixa de entrada.',
      data: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        sentTo: testEmail,
        timestamp: new Date().toISOString(),
        smtpServer: 'smtp.gmail.com',
        environment: {
          hasEmailUser: true,
          hasEmailPass: true,
          emailUser: process.env.EMAIL_USER
        }
      }
    })

  } catch (error: any) {
    console.error('❌ ========================================')
    console.error('❌ ERRO no teste de Nodemailer')
    console.error('❌ ========================================')
    console.error('❌ Tipo:', error.constructor.name)
    console.error('❌ Mensagem:', error.message)
    console.error('❌ Code:', error.code)
    console.error('❌ Command:', error.command)
    console.error('❌ Stack:', error.stack)
    console.error('❌ ========================================')

    return NextResponse.json({
      success: false,
      error: 'Erro ao testar configuração do Nodemailer',
      details: {
        type: error.constructor.name,
        message: error.message,
        code: error.code,
        command: error.command,
        possibleSolutions: [
          'Verificar se EMAIL_USER e EMAIL_PASS estão configurados corretamente',
          'Usar senha de aplicativo do Gmail (não a senha normal)',
          'Ativar autenticação de 2 fatores no Gmail',
          'Verificar se o acesso está liberado no Google Account',
          'Checar logs do servidor para mais detalhes'
        ]
      }
    }, { status: 500 })
  }
}
