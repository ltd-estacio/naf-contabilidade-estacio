import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNAFServices() {
  console.log('🌱 Iniciando seed dos Serviços NAF...')

  // Serviços para Cidadãos (Pessoas Físicas)
  const cidadaoServices = [
    // Cadastros e Documentos
    {
      name: "Cadastro CPF",
      description: "Inscrição, alteração, regularização e consulta de CPF",
      category: "CADASTROS_DOCUMENTOS",
      requirements: "RG, Certidão de Nascimento ou Casamento",
      estimatedDuration: 30,
      isActive: true
    },
    {
      name: "Cadastro Nacional de Obras (CNO)",
      description: "Registro obrigatório de obras de construção civil",
      category: "CADASTROS_DOCUMENTOS", 
      requirements: "CPF, Dados da obra, Alvará de construção",
      estimatedDuration: 45,
      isActive: true
    },
    
    // Imposto de Renda
    {
      name: "Declaração de Imposto de Renda",
      description: "Elaboração e envio da declaração anual de ajuste",
      category: "IMPOSTO_RENDA",
      requirements: "Informe de rendimentos, Comprovantes de despesas, CPF",
      estimatedDuration: 90,
      isActive: true
    },
    {
      name: "Isenção do IR para Moléstias Graves",
      description: "Solicitação de isenção do imposto de renda para portadores de doenças graves",
      category: "IMPOSTO_RENDA",
      requirements: "Laudo médico, CPF, Comprovantes médicos",
      estimatedDuration: 60,
      isActive: true
    },
    {
      name: "Malha e Restituição do IR",
      description: "Consulta e correção de inconsistências na declaração",
      category: "IMPOSTO_RENDA",
      requirements: "CPF, Declaração original",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Destinação do IR para Fundos",
      description: "Orientação sobre destinação do imposto para fundos de direitos",
      category: "IMPOSTO_RENDA",
      requirements: "Declaração de IR",
      estimatedDuration: 20,
      isActive: true
    },

    // E-Social e Trabalhista
    {
      name: "E-Social Doméstico",
      description: "Cadastro e gestão de obrigações de empregados domésticos",
      category: "ESOCIAL_TRABALHISTA",
      requirements: "CPF empregador, Dados do empregado, Contrato",
      estimatedDuration: 60,
      isActive: true
    },

    // Certidões e Consultas
    {
      name: "Certidão Negativa de Débitos",
      description: "Emissão de certidão de regularidade fiscal",
      category: "CERTIDOES_CONSULTAS",
      requirements: "CPF",
      estimatedDuration: 15,
      isActive: true
    },
    {
      name: "Consulta de Dívidas e Pendências",
      description: "Verificação de pendências fiscais junto à Receita Federal",
      category: "CERTIDOES_CONSULTAS",
      requirements: "CPF",
      estimatedDuration: 15,
      isActive: true
    },

    // Pagamentos e Parcelamentos
    {
      name: "Geração de DARF",
      description: "Documento de Arrecadação de Receitas Federais",
      category: "PAGAMENTOS_PARCELAMENTOS",
      requirements: "CPF, Dados do tributo",
      estimatedDuration: 20,
      isActive: true
    },
    {
      name: "Parcelamento de Dívidas Tributárias",
      description: "Solicitação de parcelamento de débitos com a Receita Federal",
      category: "PAGAMENTOS_PARCELAMENTOS",
      requirements: "CPF, Demonstrativo de débitos",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Orientações sobre Transação Tributária",
      description: "Acordos para quitação de débitos tributários",
      category: "PAGAMENTOS_PARCELAMENTOS",
      requirements: "CPF, Proposta de transação",
      estimatedDuration: 60,
      isActive: true
    },

    // Comércio Exterior
    {
      name: "Orientações sobre Bagagens Internacionais",
      description: "Auxílio sobre bagagens em viagens ao exterior",
      category: "COMERCIO_EXTERIOR",
      requirements: "Passaporte, Bilhete de viagem",
      estimatedDuration: 30,
      isActive: true
    },
    {
      name: "Orientações sobre Encomendas Internacionais",
      description: "Tributos e procedimentos para compras do exterior",
      category: "COMERCIO_EXTERIOR",
      requirements: "CPF, Invoice, Comprovante de compra",
      estimatedDuration: 30,
      isActive: true
    },

    // Isenções Especiais
    {
      name: "Isenção de IPI para Taxistas",
      description: "Isenção de IPI na aquisição de veículos para taxistas",
      category: "ISENCOES_ESPECIAIS",
      requirements: "Alvará de taxista, CPF, Documentos do veículo",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Isenção de IPI/IOF para PcD e TEA",
      description: "Isenção para pessoas com deficiência e Transtorno do Espectro Autista",
      category: "ISENCOES_ESPECIAIS",
      requirements: "Laudo médico, CPF, Documentos específicos",
      estimatedDuration: 60,
      isActive: true
    }
  ]

  // Serviços Rurais
  const ruralServices = [
    {
      name: "CNIR - Cadastro Nacional de Imóveis Rurais",
      description: "Cadastro obrigatório de propriedades rurais",
      category: "RURAL_ITR",
      requirements: "CPF, Documentos do imóvel, Georreferenciamento",
      estimatedDuration: 60,
      isActive: true
    },
    {
      name: "DITR - Declaração do ITR",
      description: "Declaração anual do Imposto Territorial Rural",
      category: "RURAL_ITR",
      requirements: "CNIR, CPF, Documentos do imóvel",
      estimatedDuration: 90,
      isActive: true
    },
    {
      name: "Serviços Relativos ao ITR",
      description: "Consultas, cálculos e orientações sobre ITR",
      category: "RURAL_ITR",
      requirements: "CPF, CNIR",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Certidão Negativa Rural",
      description: "Certidão específica para propriedades rurais",
      category: "RURAL_ITR",
      requirements: "CPF, CNIR",
      estimatedDuration: 20,
      isActive: true
    }
  ]

  // Serviços para Empresas/MEI
  const empresaServices = [
    {
      name: "CAEPF - Cadastro de Atividades Econômicas PF",
      description: "Cadastro de atividades econômicas de pessoas físicas",
      category: "MEI_EMPRESAS",
      requirements: "CPF, Descrição das atividades",
      estimatedDuration: 30,
      isActive: true
    },
    {
      name: "CNPJ - Cadastro Nacional de Pessoas Jurídicas",
      description: "Inscrição, alteração e baixa de CNPJ",
      category: "MEI_EMPRESAS",
      requirements: "Contrato social, CPF dos sócios, Documentos específicos",
      estimatedDuration: 60,
      isActive: true
    },
    {
      name: "Obrigações Fiscais do MEI",
      description: "DAS-MEI e Declaração Anual Simplificada",
      category: "MEI_EMPRESAS",
      requirements: "CPF, CNPJ do MEI",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Comércio Exterior para MEI",
      description: "Orientações sobre importação e exportação para MEI",
      category: "MEI_EMPRESAS",
      requirements: "CNPJ MEI, Documentos específicos",
      estimatedDuration: 60,
      isActive: true
    }
  ]

  // Serviços Gerais
  const geraisServices = [
    {
      name: "Acesso Remoto - Senha GOV.BR",
      description: "Apoio para criação e uso da senha GOV.BR",
      category: "ACESSO_DIGITAL",
      requirements: "CPF, Documento com foto",
      estimatedDuration: 30,
      isActive: true
    },
    {
      name: "Agendamento na Receita Federal",
      description: "Agendamento para atendimento presencial na RF",
      category: "ATENDIMENTO_PRESENCIAL",
      requirements: "CPF",
      estimatedDuration: 15,
      isActive: true
    }
  ]

  // Inserir todos os serviços
  const allServices = [
    ...cidadaoServices,
    ...ruralServices, 
    ...empresaServices,
    ...geraisServices
  ]

  console.log(`📝 Inserindo ${allServices.length} serviços NAF...`)

  for (const serviceData of allServices) {
    try {
      // Verificar se o serviço já existe
      const existingService = await prisma.service.findFirst({
        where: { name: serviceData.name }
      })

      if (existingService) {
        console.log(`⚠️  Serviço '${serviceData.name}' já existe, atualizando...`)
        await prisma.service.update({
          where: { id: existingService.id },
          data: serviceData
        })
      } else {
        console.log(`✅ Criando serviço '${serviceData.name}'...`)
        await prisma.service.create({
          data: serviceData
        })
      }
    } catch (error) {
      console.error(`❌ Erro ao processar '${serviceData.name}':`, error)
    }
  }

  // Estatísticas finais
  const totalServices = await prisma.service.count()
  const activeServices = await prisma.service.count({ where: { isActive: true } })
  
  console.log(`🎉 Seed concluído!`)
  console.log(`📊 Total de serviços: ${totalServices}`)
  console.log(`✅ Serviços ativos: ${activeServices}`)

  const servicesByCategory = await prisma.service.groupBy({
    by: ['category'],
    _count: { _all: true },
    where: { isActive: true }
  })

  console.log(`📋 Serviços por categoria:`)
  servicesByCategory.forEach(group => {
    console.log(`   ${group.category}: ${group._count._all} serviços`)
  })
}

async function main() {
  try {
    await seedNAFServices()
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
