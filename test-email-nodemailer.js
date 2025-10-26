// Teste de envio de email com Nodemailer
const nodemailer = require('nodemailer')

const EMAIL_USER = 'souzaestevam925@gmail.com'
const EMAIL_PASSWORD = 'kczj vzqk nlse iddy'
const EMAIL_DESTINO = 'souzaestevam925@gmail.com'

async function testeEmail() {
  console.log('🧪 Iniciando teste de envio de email com Nodemailer...')
  console.log('📧 Email remetente:', EMAIL_USER)
  console.log('📧 Email destino:', EMAIL_DESTINO)
  
  try {
    // Criar transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    })

    console.log('✅ Transporter criado')

    // Configurar email
    const mailOptions = {
      from: `"Sistema NAF - Teste" <${EMAIL_USER}>`,
      to: EMAIL_DESTINO,
      subject: '🧪 Teste de Email - Sistema NAF com Nodemailer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px;">🎉 Teste de Email</h1>
            <p style="font-size: 16px; color: #333;">Este é um email de teste do Sistema NAF.</p>
            <p style="font-size: 16px; color: #333;">Se você recebeu este email, significa que o sistema de envio está funcionando corretamente!</p>
            <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #1e40af; border-radius: 5px;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">✅ Sistema de Email Configurado com Sucesso!</p>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Data: ${new Date().toLocaleDateString('pt-BR')}<br>
              Hora: ${new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      `,
    }

    console.log('📤 Enviando email de teste...')

    // Enviar email
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📧 Response:', info.response)
    console.log('📧 Accepted:', info.accepted)
    console.log('📧 Rejected:', info.rejected)

  } catch (error) {
    console.error('❌ Erro ao enviar email de teste')
    console.error('❌ Tipo:', typeof error)
    console.error('❌ Mensagem:', error.message)
    console.error('❌ Stack:', error.stack)
    
    if (error && typeof error === 'object') {
      console.error('❌ Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    }
  }
}

testeEmail()
