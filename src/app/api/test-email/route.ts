import { NextRequest, NextResponse } from 'next/server'
import emailjs from '@emailjs/browser'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const EMAILJS_CONFIG = {
      serviceId: 'service_xehr3ta',
      templateId: 'template_ofyjueh',
      publicKey: 'nGm0I7osOMW7psoqF',
    }

    // Inicializar EmailJS
    emailjs.init(EMAILJS_CONFIG.publicKey)

    const templateParams = {
      to_email: body.email || 'teste@exemplo.com',
      to_name: body.name || 'Cliente Teste',
      protocol: 'FAP-20251003-1430',
      clientName: body.name || 'Cliente Teste',
      clientEmail: body.email || 'teste@exemplo.com',
      clientPhone: '(48) 98461-4449',
      serviceType: 'Declaração de Imposto de Renda',
      clientCategory: 'Pessoa Física Hipossuficiente',
      preferredDate: 'sexta-feira, 3 de outubro de 2025',
      preferredTime: '14:00',
      modality: 'Presencial',
    }

    console.log('📧 Tentando enviar email com os seguintes dados:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      publicKey: EMAILJS_CONFIG.publicKey,
      to_email: templateParams.to_email
    })

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    )

    console.log('✅ Email enviado com sucesso:', response)

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso!',
      response
    })

  } catch (error) {
    console.error('❌ Erro detalhado ao enviar email:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    }, { status: 500 })
  }
}
