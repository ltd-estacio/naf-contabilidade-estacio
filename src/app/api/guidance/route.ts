import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const step = searchParams.get('step')

    if (!serviceId) {
      return NextResponse.json({ error: 'ServiceId é obrigatório' }, { status: 400 })
    }

    // Buscar o serviço para obter informações básicas
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Orientações passo a passo baseadas no serviço
    const guidance = getGuidanceByService(service.name, service.category)

    if (step) {
      const stepNumber = parseInt(step)
      const specificStep = guidance.steps.find((s: unknown) => s.number === stepNumber)
      
      if (!specificStep) {
        return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
      }

      return NextResponse.json({
        service: service.name,
        category: service.category,
        currentStep: specificStep,
        totalSteps: guidance.steps.length,
        estimatedTime: service.estimatedDuration
      })
    }

    return NextResponse.json({
      service: service.name,
      category: service.category,
      overview: guidance.overview,
      steps: guidance.steps,
      requirements: guidance.requirements,
      tips: guidance.tips,
      estimatedTime: service.estimatedDuration
    })

  } catch (error) {
    console.error('Erro ao buscar orientações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getGuidanceByService(serviceName: string, category: string) {
  const guidanceMap: Record<string, unknown> = {
    'Cadastro CPF': {
      overview: 'O CPF é fundamental para sua vida financeira. Vamos te orientar em todo o processo de cadastro ou regularização.',
      requirements: [
        'RG ou CNH original',
        'Certidão de nascimento ou casamento',
        'Comprovante de endereço atualizado',
        'Título de eleitor (se tiver)'
      ],
      steps: [
        {
          number: 1,
          title: 'Preparação dos Documentos',
          description: 'Reúna todos os documentos necessários antes de iniciar o processo.',
          details: [
            'Verifique se todos os documentos estão legíveis',
            'Confirme se o endereço no comprovante está atualizado',
            'Se for menor de idade, precisa estar acompanhado do responsável'
          ],
          estimatedTime: 10,
          tips: ['Leve documentos originais e cópias', 'Verifique se não há rasuras nos documentos']
        },
        {
          number: 2,
          title: 'Acesso ao Portal da Receita Federal',
          description: 'Entre no site oficial da Receita Federal para iniciar o cadastro.',
          details: [
            'Acesse: https://www.gov.br/receitafederal',
            'Clique em "Pessoa Física" > "CPF"',
            'Selecione "Inscrição no CPF"'
          ],
          estimatedTime: 5,
          tips: ['Use sempre o site oficial', 'Evite sites terceirizados']
        },
        {
          number: 3,
          title: 'Preenchimento do Formulário',
          description: 'Preencha cuidadosamente todos os dados solicitados.',
          details: [
            'Insira dados pessoais conforme documentos',
            'Confirme endereço residencial',
            'Verifique telefone e email para contato'
          ],
          estimatedTime: 10,
          tips: ['Confira cada campo antes de continuar', 'Use dados exatamente como aparecem nos documentos']
        },
        {
          number: 4,
          title: 'Validação e Finalização',
          description: 'Valide os dados e complete o processo de inscrição.',
          details: [
            'Revise todas as informações',
            'Aceite os termos de uso',
            'Anote o número do recibo para acompanhamento'
          ],
          estimatedTime: 5,
          tips: ['Guarde o recibo em local seguro', 'O CPF fica disponível imediatamente online']
        }
      ],
      tips: [
        'O CPF é gratuito - desconfie de sites que cobram taxas',
        'Após a inscrição, você pode imprimir o comprovante online',
        'Em caso de erro, procure uma agência da Receita Federal',
        'Mantenha seus dados sempre atualizados'
      ]
    },
    'Cadastro CNPJ': {
      overview: 'Abrir um CNPJ é o primeiro passo para formalizar seu negócio. Te guiaremos através de todo o processo.',
      requirements: [
        'Documentos pessoais dos sócios',
        'Contrato social ou requerimento',
        'Comprovante de endereço da empresa',
        'Consulta de viabilidade do nome'
      ],
      steps: [
        {
          number: 1,
          title: 'Consulta de Viabilidade',
          description: 'Verifique se o nome da empresa está disponível na Junta Comercial.',
          details: [
            'Acesse o site da Junta Comercial do seu estado',
            'Faça a consulta de nome empresarial',
            'Escolha 3 opções de nome como alternativa'
          ],
          estimatedTime: 15,
          tips: ['Escolha nomes simples e fáceis de lembrar', 'Evite nomes muito similares aos existentes']
        },
        {
          number: 2,
          title: 'Elaboração do Contrato Social',
          description: 'Prepare o documento que define a estrutura da empresa.',
          details: [
            'Defina o objeto social (atividades da empresa)',
            'Estabeleça o capital social inicial',
            'Determine a participação de cada sócio'
          ],
          estimatedTime: 30,
          tips: ['Seja específico sobre as atividades', 'Considere atividades futuras no objeto social']
        },
        {
          number: 3,
          title: 'Registro na Junta Comercial',
          description: 'Protocolize os documentos na Junta Comercial.',
          details: [
            'Preencha o FCN (Ficha de Cadastro Nacional)',
            'Anexe contrato social e documentos pessoais',
            'Pague as taxas de registro'
          ],
          estimatedTime: 20,
          tips: ['Confira todas as taxas antes do pagamento', 'Mantenha os comprovantes de pagamento']
        },
        {
          number: 4,
          title: 'Inscrição na Receita Federal',
          description: 'Obtenha o CNPJ junto à Receita Federal.',
          details: [
            'Acesse o Portal do Empreendedor ou Receita Federal',
            'Preencha o Documento Básico de Entrada (DBE)',
            'Envie documentação digitalizada'
          ],
          estimatedTime: 15,
          tips: ['O CNPJ é gerado automaticamente após aprovação', 'Guarde o cartão CNPJ em local seguro']
        }
      ],
      tips: [
        'Considere contratar um contador desde o início',
        'Mantenha sempre a documentação em dia',
        'Escolha o regime tributário adequado ao seu negócio',
        'Atualize dados sempre que houver mudanças'
      ]
    },
    'Declaração Imposto de Renda': {
      overview: 'A declaração do IR é obrigatória para muitos contribuintes. Vamos te ajudar a fazer corretamente.',
      requirements: [
        'Informe de rendimentos',
        'Comprovantes de despesas dedutíveis',
        'Extratos bancários',
        'Comprovantes de bens e direitos'
      ],
      steps: [
        {
          number: 1,
          title: 'Preparação da Documentação',
          description: 'Organize todos os documentos necessários para a declaração.',
          details: [
            'Reúna informes de rendimentos de todas as fontes',
            'Separe comprovantes de despesas médicas',
            'Organize comprovantes de educação',
            'Liste todos os bens e direitos'
          ],
          estimatedTime: 45,
          tips: ['Organize por categoria', 'Verifique se todos os valores estão corretos']
        },
        {
          number: 2,
          title: 'Download e Instalação do Programa',
          description: 'Baixe o programa oficial da Receita Federal.',
          details: [
            'Acesse o site da Receita Federal',
            'Baixe o programa IRPF 2024',
            'Instale seguindo as instruções'
          ],
          estimatedTime: 10,
          tips: ['Use sempre o programa oficial', 'Verifique se seu computador atende os requisitos']
        },
        {
          number: 3,
          title: 'Preenchimento da Declaração',
          description: 'Preencha cuidadosamente todas as fichas necessárias.',
          details: [
            'Comece pela ficha de identificação',
            'Preencha rendimentos tributáveis',
            'Informe deduções legais',
            'Declare bens e direitos'
          ],
          estimatedTime: 60,
          tips: ['Confira cada valor inserido', 'Use as abas de verificação do programa']
        },
        {
          number: 4,
          title: 'Transmissão e Acompanhamento',
          description: 'Envie a declaração e acompanhe o processamento.',
          details: [
            'Execute a verificação de pendências',
            'Transmita a declaração pela internet',
            'Guarde o recibo de entrega',
            'Acompanhe o processamento no e-CAC'
          ],
          estimatedTime: 15,
          tips: ['Transmita dentro do prazo', 'Guarde todos os documentos por 5 anos']
        }
      ],
      tips: [
        'Não deixe para a última hora',
        'Em caso de dúvidas, procure orientação especializada',
        'Mantenha backup da declaração enviada',
        'Acompanhe possíveis notificações da Receita'
      ]
    },
    'MEI - Cadastro': {
      overview: 'O MEI é ideal para formalizar pequenos negócios. Processo simples e rápido.',
      requirements: [
        'CPF ativo',
        'RG ou CNH',
        'Comprovante de endereço',
        'Definição da atividade principal'
      ],
      steps: [
        {
          number: 1,
          title: 'Verificação de Requisitos',
          description: 'Confirme se você atende aos critérios para ser MEI.',
          details: [
            'Faturamento máximo de R$ 81.000,00 por ano',
            'Não ser sócio de outra empresa',
            'Ter no máximo 1 funcionário',
            'Atividade permitida para MEI'
          ],
          estimatedTime: 10,
          tips: ['Consulte a lista de atividades permitidas', 'Calcule seu faturamento anual estimado']
        },
        {
          number: 2,
          title: 'Acesso ao Portal do Empreendedor',
          description: 'Entre no site oficial para fazer o cadastro.',
          details: [
            'Acesse: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor',
            'Clique em "Quero ser MEI"',
            'Selecione "Formalize-se"'
          ],
          estimatedTime: 5,
          tips: ['Use sempre o site oficial', 'Tenha seus documentos em mãos']
        },
        {
          number: 3,
          title: 'Preenchimento do Cadastro',
          description: 'Complete todas as informações solicitadas.',
          details: [
            'Dados pessoais conforme documentos',
            'Endereço onde funcionará o negócio',
            'Atividade principal e secundárias',
            'Declaração de faturamento'
          ],
          estimatedTime: 20,
          tips: ['Seja preciso na descrição das atividades', 'Confirme o endereço comercial']
        },
        {
          number: 4,
          title: 'Finalização e Documentos',
          description: 'Complete o processo e obtenha seus documentos.',
          details: [
            'Revise todos os dados informados',
            'Finalize o cadastro',
            'Baixe o CCMEI (Certificado MEI)',
            'Obtenha alvará se necessário'
          ],
          estimatedTime: 15,
          tips: ['Imprima e guarde o CCMEI', 'Verifique necessidade de alvará municipal']
        }
      ],
      tips: [
        'O MEI é gratuito - não pague taxas de terceiros',
        'Emita nota fiscal quando solicitado',
        'Pague o DAS mensalmente em dia',
        'Faça a declaração anual (DASN-SIMEI)'
      ]
    }
  }

  return guidanceMap[serviceName] || {
    overview: 'Orientações específicas para este serviço estarão disponíveis em breve.',
    requirements: ['Documentos conforme especificado pelo serviço'],
    steps: [{
      number: 1,
      title: 'Orientação Geral',
      description: 'Entre em contato conosco para orientações específicas sobre este serviço.',
      details: ['Procure nosso atendimento para orientações detalhadas'],
      estimatedTime: 30,
      tips: ['Tenha seus documentos organizados']
    }],
    tips: ['Mantenha documentos organizados', 'Em caso de dúvidas, procure orientação especializada']
  }
}
