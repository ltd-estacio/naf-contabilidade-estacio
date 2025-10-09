import { NextRequest, NextResponse } from 'next/server'

// Simulando dados de legislações contábeis
const legislations = [
  {
    id: '1',
    title: 'Lei Geral do MEI - Microempreendedor Individual',
    description: 'Regulamentação completa sobre MEI, DAS e obrigações',
    content: `
## Lei Complementar nº 128/2008 - MEI

### Definição
O Microempreendedor Individual (MEI) é a pessoa que trabalha por conta própria e que se legaliza como pequeno empresário.

### Características
- Faturamento máximo de R$ 81.000,00 por ano
- Pode ter no máximo 1 (um) empregado contratado
- Atividades permitidas conforme lista do CNAE

### DAS - Documento de Arrecadação do Simples Nacional
- Valor fixo mensal baseado no salário mínimo
- Vencimento todo dia 20 do mês seguinte
- Inclui INSS, ICMS e ISS

### Obrigações
- Pagamento mensal do DAS
- Relatório mensal das receitas brutas
- Declaração anual do MEI (DASN-SIMEI)

### Benefícios
- Registro no CNPJ
- Possibilidade de emitir nota fiscal
- Acesso a benefícios previdenciários
- Abertura de conta jurídica
    `,
    category: 'MEI',
    tags: ['mei', 'das', 'microempreendedor', 'individual', 'cnpj'],
    isActive: true,
    sourceUrl: 'http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp128.htm',
    lastUpdate: '2025-09-01T00:00:00Z',
    validFrom: '2008-12-19T00:00:00Z'
  },
  {
    id: '2',
    title: 'Declaração de Imposto de Renda Pessoa Física',
    description: 'Regras e orientações para DIRPF',
    content: `
## Declaração de Imposto de Renda Pessoa Física - DIRPF

### Obrigatoriedade
Está obrigado a apresentar a DIRPF quem:
- Recebeu rendimentos tributáveis superiores a R$ 30.639,90
- Recebeu rendimentos isentos superiores a R$ 200.000,00
- Teve ganho de capital ou realizou operações em bolsa
- Optou pela isenção do IR na venda de imóvel residencial

### Prazo de Entrega
- Período: março a maio (31 de maio)
- Multa por atraso: mínimo R$ 165,74

### Documentos Necessários
- Informe de rendimentos dos pagadores
- Comprovantes de despesas dedutíveis
- Recibos de doações
- Documentos de dependentes

### Deduções Permitidas
- Gastos com saúde (sem limite)
- Gastos com educação (até R$ 3.561,50 por pessoa)
- Pensão alimentícia judicial
- Contribuição previdenciária oficial
    `,
    category: 'Imposto de Renda',
    tags: ['ir', 'dirpf', 'declaração', 'pessoa física', 'receita federal'],
    isActive: true,
    sourceUrl: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda',
    lastUpdate: '2025-08-15T00:00:00Z',
    validFrom: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Cadastro de Pessoa Física - CPF',
    description: 'Normas para inscrição e regularização do CPF',
    content: `
## Cadastro de Pessoa Física - CPF

### Obrigatoriedade
É obrigatório ter CPF:
- Brasileiro maior de 16 anos
- Estrangeiro residente no Brasil
- Para abertura de conta bancária
- Para emissão de documentos

### Documentos para Inscrição
- Documento de identidade original
- Comprovante de residência
- Para menores: certidão de nascimento

### Regularização de CPF
CPF pode ser suspenso por:
- Falta de apresentação da DIRPF obrigatória
- Divergências cadastrais
- Indícios de uso irregular

### Como Regularizar
1. Identificar a pendência no site da RFB
2. Providenciar documentação exigida
3. Apresentar declaração em atraso (se aplicável)
4. Acompanhar processamento
    `,
    category: 'Cadastros',
    tags: ['cpf', 'cadastro', 'pessoa física', 'regularização', 'receita federal'],
    isActive: true,
    sourceUrl: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cpf',
    lastUpdate: '2025-08-01T00:00:00Z'
  }
]

const faqs = [
  {
    id: '1',
    question: 'Como emitir o DAS do MEI?',
    answer: `Para emitir o DAS do MEI:

1. Acesse o Portal do Empreendedor (gov.br/empreendedor)
2. Clique em "Já sou MEI"
3. Entre com seu CNPJ e código de acesso
4. Vá em "Guias para Pagamento" > "Emitir Guia de Pagamento (DAS)"
5. Selecione o período desejado
6. Baixe e imprima o documento
7. Pague até o dia 20 do mês seguinte

**Importante:** O DAS deve ser pago mensalmente, mesmo que não tenha tido faturamento no mês.`,
    category: 'MEI',
    tags: ['das', 'mei', 'emissão', 'pagamento'],
    isActive: true,
    viewCount: 1250,
    helpfulCount: 1180
  },
  {
    id: '2',
    question: 'Quais documentos preciso para regularizar meu CPF?',
    answer: `Para regularizar o CPF, você precisará:

**Documentos Básicos:**
- RG original e cópia
- Comprovante de residência atualizado (últimos 3 meses)
- Título de eleitor (se tiver)

**Se a pendência for por falta de IR:**
- Prepare a declaração em atraso
- Pague as multas correspondentes
- Apresente via e-CAC ou Receita Federal

**Passos:**
1. Consulte a situação no site da Receita Federal
2. Identifique a pendência específica
3. Providencie a documentação
4. Protocole presencialmente ou online

**Dica:** Agende atendimento na Receita Federal pelo site gov.br`,
    category: 'Cadastros',
    tags: ['cpf', 'regularização', 'documentos', 'receita federal'],
    isActive: true,
    viewCount: 890,
    helpfulCount: 820
  },
  {
    id: '3',
    question: 'Quando devo declarar Imposto de Renda?',
    answer: `Você deve declarar IR se:

**Renda:**
- Recebeu mais de R$ 30.639,90 em rendimentos tributáveis no ano
- Recebeu mais de R$ 200.000,00 em rendimentos isentos

**Patrimônio:**
- Possuía bens superiores a R$ 800.000,00 em 31/12
- Teve ganho de capital na venda de bens
- Realizou operações na bolsa de valores

**Atividade Rural:**
- Obteve receita bruta superior a R$ 153.199,50

**Prazo:**
- Março a maio (31 de maio às 23h59)
- Multa mínima de R$ 165,74 por atraso

**Dica:** Mesmo não sendo obrigatório, pode ser vantajoso declarar para ter direito à restituição.`,
    category: 'Imposto de Renda',
    tags: ['ir', 'declaração', 'obrigatoriedade', 'prazo'],
    isActive: true,
    viewCount: 2100,
    helpfulCount: 1950
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const type = searchParams.get('type') // 'legislation' or 'faq'

  try {
    if (type === 'faq') {
      let filteredFaqs = faqs.filter(faq => faq.isActive)
      
      if (category) {
        filteredFaqs = filteredFaqs.filter(faq => 
          faq.category.toLowerCase().includes(category.toLowerCase())
        )
      }
      
      if (search) {
        filteredFaqs = filteredFaqs.filter(faq => 
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase()) ||
          faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        )
      }
      
      return NextResponse.json({
        success: true,
        data: filteredFaqs,
        total: filteredFaqs.length
      })
    }
    
    // Default: return legislations
    let filteredLegislations = legislations.filter(leg => leg.isActive)
    
    if (category) {
      filteredLegislations = filteredLegislations.filter(leg => 
        leg.category.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    if (search) {
      filteredLegislations = filteredLegislations.filter(leg => 
        leg.title.toLowerCase().includes(search.toLowerCase()) ||
        leg.description.toLowerCase().includes(search.toLowerCase()) ||
        leg.content.toLowerCase().includes(search.toLowerCase()) ||
        leg.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    return NextResponse.json({
      success: true,
      data: filteredLegislations,
      total: filteredLegislations.length
    })
    
  } catch (error) {
    console.error('Erro ao buscar legislações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, category } = body
    
    if (!question || !category) {
      return NextResponse.json(
        { success: false, error: 'Pergunta e categoria são obrigatórias' },
        { status: 400 }
      )
    }
    
    // Buscar FAQ mais relevante
    const relevantFaq = faqs.find(faq => 
      faq.category.toLowerCase() === category.toLowerCase() &&
      faq.question.toLowerCase().includes(question.toLowerCase())
    )
    
    if (relevantFaq) {
      // Incrementar contador de visualizações
      relevantFaq.viewCount++
      
      return NextResponse.json({
        success: true,
        answer: relevantFaq.answer,
        source: 'faq',
        confidence: 0.9
      })
    }
    
    // Buscar em legislações
    const relevantLegislation = legislations.find(leg => 
      leg.category.toLowerCase() === category.toLowerCase() &&
      (leg.title.toLowerCase().includes(question.toLowerCase()) ||
       leg.tags.some(tag => question.toLowerCase().includes(tag)))
    )
    
    if (relevantLegislation) {
      return NextResponse.json({
        success: true,
        answer: relevantLegislation.content,
        source: 'legislation',
        title: relevantLegislation.title,
        sourceUrl: relevantLegislation.sourceUrl,
        confidence: 0.8
      })
    }
    
    // Resposta padrão se não encontrar
    return NextResponse.json({
      success: true,
      answer: `Não encontrei uma resposta específica para sua pergunta sobre ${category}. 

Recomendo que você:
1. Consulte o site oficial da Receita Federal (gov.br/receitafederal)
2. Agende atendimento presencial
3. Entre em contato com nosso suporte para uma orientação mais detalhada

Posso ajudar com outras dúvidas mais específicas se você reformular sua pergunta.`,
      source: 'default',
      confidence: 0.3
    })
    
  } catch (error) {
    console.error('Erro ao processar pergunta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
