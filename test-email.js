// Teste simples de envio de email com EmailJS
const emailjs = require('@emailjs/nodejs')

const EMAILJS_SERVICE_ID = 'service_xehr3ta'
const EMAILJS_TEMPLATE_ID = 'template_d2rfx39'
const EMAILJS_PUBLIC_KEY = 'nGm0I7osOMW7psoqF'
const EMAILJS_PRIVATE_KEY = '4g4E-Tn6ALnBMtuKLTa5-'

async function testeEmail() {
  console.log('🧪 Iniciando teste de envio de email...')
  console.log('📧 Service ID:', EMAILJS_SERVICE_ID)
  console.log('📧 Template ID:', EMAILJS_TEMPLATE_ID)
  console.log('📧 Public Key:', EMAILJS_PUBLIC_KEY)
  console.log('📧 Private Key:', EMAILJS_PRIVATE_KEY)
  
  try {
    const templateParams = {
      to_email: 'souzaestevam925@gmail.com',
      to_name: 'Teste',
      from_name: 'Sistema NAF - Teste',
      subject: '🧪 Teste de Email - Sistema NAF',
      message: '<h1>Teste</h1><p>Este é um email de teste do sistema NAF.</p>',
      backup_date: new Date().toLocaleDateString('pt-BR'),
      backup_time: new Date().toLocaleTimeString('pt-BR'),
      total_records: '0',
      tables_count: '0',
      students_count: '0',
      coordinator_name: 'Teste',
      coordinator_email: 'teste@naf.com'
    }

    console.log('📤 Enviando email de teste...')
    console.log('📧 Parâmetros:', JSON.stringify(templateParams, null, 2))

    // Para Node.js, use publicKey E privateKey
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    )

    console.log('✅ Email enviado com sucesso!')
    console.log('📧 Response:', response)
    console.log('📧 Status:', response.status)
    console.log('📧 Text:', response.text)

  } catch (error) {
    console.error('❌ Erro ao enviar email de teste')
    console.error('❌ Tipo:', typeof error)
    console.error('❌ Mensagem:', error.message)
    console.error('❌ Stack:', error.stack)
    
    if (error && typeof error === 'object') {
      console.error('❌ Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      if (error.status) {
        console.error('❌ Status HTTP:', error.status)
      }
      if (error.text) {
        console.error('❌ Resposta:', error.text)
      }
    }
  }
}

testeEmail()
