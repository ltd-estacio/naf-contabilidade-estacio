import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMoreNAFServices() {
  console.log('🌱 Adicionando mais serviços NAF essenciais...')

  // Serviços NAF adicionais importantes
  const additionalServices = [
    // Área Digital
    {
      name: "Certificado Digital A1 e A3",
      description: "Orientação sobre certificação digital para pessoas físicas e jurídicas",
      category: "ACESSO_DIGITAL",
      requirements: "CPF/CNPJ, Documento com foto, Comprovante de residência",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "Senha Web - Receita Federal",
      description: "Criação e recuperação de senha para acesso aos serviços da RF",
      category: "ACESSO_DIGITAL", 
      requirements: "CPF, Documento com foto",
      estimatedDuration: 30,
      isActive: true
    },

    // Previdência e Trabalhista
    {
      name: "CNIS - Cadastro Nacional de Informações Sociais",
      description: "Consulta ao extrato previdenciário e períodos de contribuição",
      category: "PREVIDENCIA_TRABALHISTA",
      requirements: "CPF, Documento com foto",
      estimatedDuration: 20,
      isActive: true
    },
    {
      name: "Auxílio-Doença e Benefícios INSS",
      description: "Orientação sobre requerimento de benefícios previdenciários",
      category: "PREVIDENCIA_TRABALHISTA", 
      requirements: "CPF, Documentos médicos, Carteira de trabalho",
      estimatedDuration: 60,
      isActive: true
    },

    // Regularização Fiscal
    {
      name: "Domicílio Tributário Eletrônico",
      description: "Cadastro e alteração de domicílio tributário eletrônico",
      category: "REGULARIZACAO_FISCAL",
      requirements: "CPF/CNPJ, Comprovante de endereço",
      estimatedDuration: 30,
      isActive: true
    },
    {
      name: "Parcelamento Especial de Débitos",
      description: "Adesão a programas especiais de parcelamento tributário",
      category: "REGULARIZACAO_FISCAL",
      requirements: "CPF/CNPJ, Demonstrativo de débitos",
      estimatedDuration: 45,
      isActive: true
    },

    // Simples Nacional e MEI
    {
      name: "Simples Nacional - Opção e Exclusão",
      description: "Orientação sobre regime tributário do Simples Nacional",
      category: "SIMPLES_MEI",
      requirements: "CNPJ, Contrato social, Faturamento anual",
      estimatedDuration: 60,
      isActive: true
    },
    {
      name: "MEI - Desenquadramento",
      description: "Processo de saída do regime MEI por limite de faturamento",
      category: "SIMPLES_MEI",
      requirements: "CNPJ MEI, Relatórios de faturamento",
      estimatedDuration: 45,
      isActive: true
    },

    // Área Rural Específica
    {
      name: "CAR - Cadastro Ambiental Rural",
      description: "Cadastro obrigatório de imóveis rurais para regularização ambiental",
      category: "AREA_RURAL",
      requirements: "CPF, Documentos da propriedade, Coordenadas geográficas",
      estimatedDuration: 90,
      isActive: true
    },
    {
      name: "CCIR - Certificado de Cadastro de Imóvel Rural",
      description: "Emissão de certificado para imóveis rurais",
      category: "AREA_RURAL",
      requirements: "CPF, CNIR, Documentos da propriedade",
      estimatedDuration: 30,
      isActive: true
    },

    // Área Internacional
    {
      name: "Carnê-Leão",
      description: "Recolhimento mensal de imposto de renda sobre rendimentos",
      category: "INTERNACIONAL",
      requirements: "CPF, Comprovantes de rendimentos",
      estimatedDuration: 45,
      isActive: true
    },
    {
      name: "DSIC - Declaração sobre Bens e Direitos no Exterior",
      description: "Declaração de capitais brasileiros no exterior",
      category: "INTERNACIONAL",
      requirements: "CPF, Documentos dos bens no exterior",
      estimatedDuration: 60,
      isActive: true
    },

    // Pessoa Jurídica
    {
      name: "ECD - Escrituração Contábil Digital",
      description: "Orientação sobre obrigações de escrituração contábil digital",
      category: "PESSOA_JURIDICA",
      requirements: "CNPJ, Balanços contábeis",
      estimatedDuration: 120,
      isActive: true
    },
    {
      name: "ECF - Escrituração Contábil Fiscal",
      description: "Escrituração fiscal digital para apuração do IRPJ e CSLL",
      category: "PESSOA_JURIDICA",
      requirements: "CNPJ, Demonstrações contábeis",
      estimatedDuration: 120,
      isActive: true
    },

    // Processos Administrativos
    {
      name: "Impugnação de Auto de Infração",
      description: "Orientação sobre contestação de autuações fiscais",
      category: "PROCESSOS_ADMINISTRATIVOS",
      requirements: "CPF/CNPJ, Auto de infração, Documentos comprobatórios",
      estimatedDuration: 90,
      isActive: true
    },
    {
      name: "Recurso Administrativo",
      description: "Interposição de recursos em processos administrativos fiscais",
      category: "PROCESSOS_ADMINISTRATIVOS",
      requirements: "Número do processo, Decisão administrativa",
      estimatedDuration: 120,
      isActive: true
    }
  ]

  console.log(`📝 Inserindo ${additionalServices.length} serviços NAF adicionais...`)

  for (const serviceData of additionalServices) {
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
  
  console.log(`🎉 Serviços adicionais inseridos!`)
  console.log(`📊 Total de serviços no sistema: ${totalServices}`)
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
    await addMoreNAFServices()
  } catch (error) {
    console.error('❌ Erro durante a inserção:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
