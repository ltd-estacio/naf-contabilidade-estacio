import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = 'AIzaSyCRfarEDTrIlXNPdonkf-KNAU414KrGnEQ'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export const dynamic = 'force-dynamic'

const NAF_CONTEXT = `
Você é um assistente virtual do NAF (Núcleo de Apoio Fiscal) da Estácio Florianópolis.

INFORMAÇÕES SOBRE O NAF:
- O NAF é um programa de extensão universitária em parceria com a Receita Federal
- Oferece serviços gratuitos de orientação fiscal e contábil
- Atende principalmente microempreendedores, MEI e pessoas de baixa renda
- Funciona de segunda a sexta, das 8h às 18h
- Telefone: (48) 98461-4449

SERVIÇOS OFERECIDOS:
- Declaração de Imposto de Renda (orientação)
- Formalização MEI
- Orientação para abertura de CNPJ
- Consultoria fiscal básica
- Educação fiscal
- Planejamento tributário simples

VALORES E PRAZOS ATUAIS (2024):
- DAS MEI: R$ 67,00 (Comércio/Indústria), R$ 71,00 (Serviços), R$ 72,00 (Comércio e Serviços)
- IR 2024: Prazo até 31 de maio, limite de obrigatoriedade R$ 30.639,90
- MEI: Limite de faturamento R$ 81.000/ano
- Declaração anual MEI (DASN-SIMEI): até 31 de maio

INSTRUÇÕES:
- Seja sempre cordial e profissional
- Forneça informações precisas sobre serviços fiscais
- Use markdown para formatar respostas quando apropriado
- Se não souber algo específico, sugira agendamento ou contato
- Mantenha respostas concisas mas informativas
- Use linguagem acessível, evitando jargões desnecessários
`

export async function POST(request: NextRequest) {
  let message = ''

  try {
    const data = await request.json()
    message = data.message
    const conversationHistory = data.conversationHistory || []

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Preparar histórico da conversa para contexto
    const conversationContext = conversationHistory
      .slice(-10) // Últimas 10 mensagens para contexto
      .map((msg: unknown) => `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n')

    const prompt = `
    ${NAF_CONTEXT}

    ${conversationContext ? `HISTÓRICO DA CONVERSA:\n${conversationContext}\n\n` : ''}

    PERGUNTA DO USUÁRIO: ${message}

    Responda de forma útil e precisa, usando markdown quando apropriado. Se a pergunta não for relacionada aos serviços do NAF, redirecione educadamente para temas fiscais e contábeis.
    `

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const geminiData = await response.json()

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini')
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na API do Gemini:', error)

    // Fallback inteligente baseado na mensagem
    const aiResponse = generateFallbackResponse(message)

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
}

// Função para gerar respostas de fallback inteligentes
function generateFallbackResponse(message: string): string {
  const messageContent = message.toLowerCase()

  // Respostas para CNPJ - verificar primeiro para evitar conflito com IR
  if (messageContent.includes('cnpj') || messageContent.includes('empresa') || messageContent.includes('abrir')) {
    return `🏢 **Abertura de CNPJ**

**Modalidades empresariais:**
• MEI: até R$ 81.000/ano
• Microempresa (ME): até R$ 360.000/ano
• Empresa de Pequeno Porte (EPP): até R$ 4.800.000/ano

**Documentos necessários:**
• RG e CPF do responsável
• Comprovante de endereço
• Contrato social (se sociedade)
• Consulta de viabilidade municipal

**Passos principais:**
1. Definir atividade e regime tributário
2. Consulta prévia na prefeitura
3. Registro na Junta Comercial
4. Inscrições nos órgãos competentes

Quer orientação sobre qual modalidade escolher?`
  }

  // Respostas para MEI
  if (messageContent.includes('mei') || messageContent.includes('microempreendedor')) {
    return `📋 **MEI - Microempreendedor Individual**

O MEI é uma modalidade empresarial para pequenos negócios com faturamento até **R$ 81.000/ano**.

**Principais benefícios:**
• CNPJ gratuito
• Aposentadoria por idade ou invalidez
• Auxílio-doença e salário-maternidade
• Emissão de notas fiscais

**Valor do DAS MEI 2024:**
• Comércio/Indústria: R$ 67,00
• Serviços: R$ 71,00
• Comércio e Serviços: R$ 72,00

**Como posso ajudar:**
• Orientação para formalização
• Esclarecimentos sobre obrigações
• Ajuda com a Declaração Anual (DASN-SIMEI)

Precisa de mais informações específicas sobre MEI?`
  }

  // Respostas para Imposto de Renda
  if (messageContent.includes('imposto de renda') || messageContent.includes('ir') || messageContent.includes('declaração')) {
    return `💰 **Declaração do Imposto de Renda 2024**

**Quem deve declarar:**
• Renda anual acima de R$ 30.639,90
• Posse de bens acima de R$ 300.000,00
• Operações na bolsa de valores
• MEI com faturamento acima do limite

**Prazo:** Até 31 de maio de 2024

**Documentos necessários:**
• CPF e título de eleitor
• Comprovantes de rendimentos
• Informes de gastos médicos e educação
• Extratos bancários

**Como o NAF pode ajudar:**
• Orientação para preenchimento
• Esclarecimento de dúvidas
• Verificação de documentos

Tem dúvidas específicas sobre sua declaração?`
  }


  // Respostas gerais sobre saudações
  if (messageContent.includes('olá') || messageContent.includes('oi') || messageContent.includes('bom dia') || messageContent.includes('boa tarde')) {
    return `👋 Olá! Bem-vindo ao NAF Estácio Florianópolis!

Sou seu assistente virtual e estou aqui para ajudar com questões fiscais e contábeis:

**Nossos principais serviços:**
• 📋 **Orientação MEI** - Formalização e declarações
• 💰 **Imposto de Renda** - Orientação para preenchimento
• 🏢 **Abertura de CNPJ** - Modalidades empresariais
• 📊 **Consultoria fiscal básica**
• 📚 **Educação fiscal**

**Horário de atendimento:**
• Segunda a sexta: 8h às 18h
• Telefone: (48) 98461-4449

Como posso ajudar você hoje? 😊`
  }

  // Resposta padrão
  return `💬 Olá! Sou o assistente virtual do NAF.

Posso ajudar com questões sobre:
• **MEI** - Formalização e declarações
• **Imposto de Renda** - Orientações gerais
• **CNPJ** - Abertura de empresas
• **Consultoria fiscal básica**

**Para atendimento personalizado:**
📞 Telefone: (48) 98461-4449
🕒 Horário: Segunda a sexta, 8h às 18h

Ou se preferir, posso conectá-lo com um de nossos especialistas para atendimento humano!

Como posso ajudar você hoje?`
}