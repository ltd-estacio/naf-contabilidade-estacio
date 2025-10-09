import emailjs from '@emailjs/browser'

// Configurações do EmailJS
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_xehr3ta',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_ofyjueh',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'nGm0I7osOMW7psoqF',
}

console.log('🔧 EmailJS Config:', {
  serviceId: EMAILJS_CONFIG.serviceId,
  templateId: EMAILJS_CONFIG.templateId,
  publicKey: EMAILJS_CONFIG.publicKey.substring(0, 5) + '...',
})

interface AppointmentEmailParams {
  protocol: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceType: string
  clientCategory: string
  preferredDate: string
  preferredTime: string
  modality: string
}

// Inicializar EmailJS (chamado automaticamente)
let isInitialized = false

const initializeEmailJS = () => {
  if (typeof window === 'undefined') {
    return false
  }

  if (!isInitialized) {
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey)
      isInitialized = true
      console.log('✅ EmailJS inicializado com sucesso!')
      return true
    } catch (error) {
      console.error('❌ Erro ao inicializar EmailJS:', error)
      return false
    }
  }
  return true
}

export const sendAppointmentConfirmationEmail = async (params: AppointmentEmailParams) => {
  try {
    // Verificar se está rodando no browser
    if (typeof window === 'undefined') {
      console.warn('⚠️ EmailJS só funciona no browser (client-side)')
      return { success: false, error: 'EmailJS requer execução no browser' }
    }

    // Inicializar EmailJS se ainda não foi
    if (!initializeEmailJS()) {
      return { success: false, error: 'Falha ao inicializar EmailJS' }
    }

    console.log('📧 ========== INICIANDO ENVIO DE EMAIL ==========')
    console.log('📧 Service ID:', EMAILJS_CONFIG.serviceId)
    console.log('📧 Template ID:', EMAILJS_CONFIG.templateId)
    console.log('📧 Public Key:', EMAILJS_CONFIG.publicKey.substring(0, 5) + '...')
    console.log('📧 Destinatário:', params.clientEmail)
    console.log('📧 Nome:', params.clientName)

    const templateParams = {
      // Campos padrão do EmailJS para destinatário
      to_email: params.clientEmail,
      to_name: params.clientName,
      reply_to: params.clientEmail,

      // Tentando TODAS as variações possíveis
      protocol: params.protocol,

      // Nome
      clientName: params.clientName,
      client_name: params.clientName,
      name: params.clientName,

      // Email
      clientEmail: params.clientEmail,
      client_email: params.clientEmail,
      email: params.clientEmail,

      // Telefone
      clientPhone: params.clientPhone,
      client_phone: params.clientPhone,
      phone: params.clientPhone,

      // Categoria
      clientCategory: params.clientCategory,
      client_category: params.clientCategory,
      category: params.clientCategory,

      // Serviço
      serviceType: params.serviceType,
      service_type: params.serviceType,
      service: params.serviceType,

      // Data
      preferredDate: params.preferredDate,
      preferred_date: params.preferredDate,
      date: params.preferredDate,

      // Hora
      preferredTime: params.preferredTime,
      preferred_time: params.preferredTime,
      time: params.preferredTime,

      // Modalidade
      modality: params.modality,
    }

    console.log('📤 Parâmetros do template:', JSON.stringify(templateParams, null, 2))

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    )

    console.log('✅ ========== EMAIL ENVIADO COM SUCESSO! ==========')
    console.log('✅ Status:', response.status)
    console.log('✅ Text:', response.text)
    console.log('✅ Response completa:', response)

    return { success: true, response }
  } catch (error) {
    console.error('❌ ========== ERRO AO ENVIAR EMAIL ==========')
    console.error('❌ Error completo:', error)
    console.error('❌ Error type:', typeof error)

    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }

    if (typeof error === 'object' && error !== null) {
      console.error('❌ Error keys:', Object.keys(error))
      console.error('❌ Error string:', JSON.stringify(error, null, 2))
    }

    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
