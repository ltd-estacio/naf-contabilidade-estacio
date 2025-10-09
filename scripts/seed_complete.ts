import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (exceto usuários para manter autenticação)
  await prisma.attendance.deleteMany()
  await prisma.demand.deleteMany()
  await prisma.service.deleteMany()
  
  console.log('🧹 Dados existentes limpos')

  // Criar usuários de teste se não existirem
  const existingUsers = await prisma.user.findMany()
  
  if (existingUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    await prisma.user.createMany({
      data: [
        {
          name: 'João Coordenador',
          email: 'coordenador@naf.com',
          password: hashedPassword,
          role: 'COORDINATOR'
        },
        {
          name: 'Maria Professora',
          email: 'professor@naf.com',
          password: hashedPassword,
          role: 'TEACHER'
        },
        {
          name: 'Pedro Aluno',
          email: 'aluno@naf.com',
          password: hashedPassword,
          role: 'STUDENT'
        },
        {
          name: 'Ana Usuária',
          email: 'usuario@naf.com',
          password: hashedPassword,
          role: 'USER'
        }
      ]
    })
    
    console.log('👥 Usuários de teste criados')
  }

  // Buscar usuários para relacionamentos
  const coordinator = await prisma.user.findFirst({ where: { role: 'COORDINATOR' } })
  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } })
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } })
  const user = await prisma.user.findFirst({ where: { role: 'USER' } })

  // Criar serviços NAF
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Cadastro CPF',
        description: 'Auxílio para cadastro e regularização de CPF',
        category: 'DOCUMENTOS',
        requirements: 'RG, Certidão de Nascimento ou Casamento',
        estimatedDuration: 30,
        isActive: true
      },
      {
        name: 'Cadastro CNPJ',
        description: 'Orientação para abertura de CNPJ',
        category: 'EMPRESARIAL',
        requirements: 'Documentos dos sócios, contrato social',
        estimatedDuration: 60,
        isActive: true
      },
      {
        name: 'Declaração Imposto de Renda',
        description: 'Auxílio no preenchimento da declaração de IR',
        category: 'TRIBUTARIO',
        requirements: 'Informe de rendimentos, recibos, comprovantes',
        estimatedDuration: 90,
        isActive: true
      },
      {
        name: 'MEI - Cadastro',
        description: 'Orientação para registro como Microempreendedor Individual',
        category: 'EMPRESARIAL',
        requirements: 'CPF, RG, comprovante de endereço',
        estimatedDuration: 45,
        isActive: true
      },
      {
        name: 'Certidão Negativa Receita Federal',
        description: 'Auxílio para emissão de certidões negativas',
        category: 'DOCUMENTOS',
        requirements: 'CPF ou CNPJ',
        estimatedDuration: 20,
        isActive: true
      },
      {
        name: 'ITR - Imposto Territorial Rural',
        description: 'Orientação para declaração do ITR',
        category: 'TRIBUTARIO',
        requirements: 'Documentos da propriedade rural',
        estimatedDuration: 60,
        isActive: true
      },
      {
        name: 'Parcelamento de Débitos',
        description: 'Orientação para parcelamento de dívidas fiscais',
        category: 'TRIBUTARIO',
        requirements: 'CPF/CNPJ, extratos de débitos',
        estimatedDuration: 40,
        isActive: true
      },
      {
        name: 'E-Social Doméstico',
        description: 'Cadastro e orientação do eSocial para empregados domésticos',
        category: 'TRABALHISTA',
        requirements: 'Dados do empregador e empregado',
        estimatedDuration: 50,
        isActive: true
      },
      {
        name: 'Simples Nacional',
        description: 'Orientação sobre adesão e manutenção no Simples Nacional',
        category: 'EMPRESARIAL',
        requirements: 'CNPJ, faturamento anual',
        estimatedDuration: 45,
        isActive: true
      },
      {
        name: 'Restituição IR',
        description: 'Consulta e orientação sobre restituição do Imposto de Renda',
        category: 'TRIBUTARIO',
        requirements: 'CPF, recibo da declaração',
        estimatedDuration: 25,
        isActive: true
      }
    ]
  })

  console.log('🛠️ Serviços NAF criados')

  // Buscar serviços criados
  const allServices = await prisma.service.findMany()

  // Criar demandas de exemplo
  const demands = []
  
  if (user && allServices.length > 0) {
    demands.push(
      {
        userId: user.id,
        serviceId: allServices[0].id, // Cadastro CPF
        description: 'Preciso regularizar meu CPF que está com pendências',
        priority: 'HIGH' as const,
        additionalInfo: 'Tenho todos os documentos necessários',
        protocolNumber: `NAF${Date.now()}001`,
        status: 'PENDING' as const
      },
      {
        userId: user.id,
        serviceId: allServices[2].id, // Declaração IR
        description: 'Primeira vez declarando IR, preciso de ajuda completa',
        priority: 'MEDIUM' as const,
        additionalInfo: 'Sou CLT e tenho algumas despesas médicas',
        protocolNumber: `NAF${Date.now()}002`,
        status: 'IN_PROGRESS' as const
      }
    )
  }

  if (student && allServices.length > 2) {
    demands.push(
      {
        userId: student.id,
        serviceId: allServices[2].id, // Usar índice seguro
        description: 'Quero abrir um MEI para formalizar meu negócio',
        priority: 'MEDIUM' as const,
        additionalInfo: 'Trabalho com vendas online',
        protocolNumber: `NAF${Date.now()}003`,
        status: 'COMPLETED' as const
      }
    )
  }

  if (demands.length > 0) {
    await prisma.demand.createMany({ data: demands })
    console.log('📋 Demandas de exemplo criadas')
  }

  // Buscar demandas criadas para criar atendimentos
  const allDemands = await prisma.demand.findMany()

  // Criar atendimentos de exemplo
  const attendances = []

  if (student && allDemands.length > 0) {
    attendances.push(
      ({
        userId: student.id,
        demandId: allDemands[0].id,
        protocol: `ATD-${Date.now()}-001`,
        description: 'Orientação inicial sobre documentação necessária para CPF',
        hours: 1.5,
        type: 'CONSULTATION',
        status: 'COMPLETED' as const,
        category: 'CPF',
        theme: 'Documentação',
        isValidated: true,
        validatedBy: teacher?.id || null,
        validatedAt: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
      }),
      ({
        userId: student.id,
        demandId: allDemands[1].id,
        protocol: `ATD-${Date.now()}-002`,
        description: 'Auxílio no preenchimento da declaração de IR',
        hours: 2.0,
        type: 'ASSISTANCE',
        status: 'COMPLETED' as const,
        category: 'Imposto de Renda',
        theme: 'Declaração',
        isValidated: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
      })
    )
  }

  if (user && allDemands.length > 2) {
    attendances.push(
      ({
        userId: user.id,
        demandId: allDemands[2].id,
        protocol: `ATD-${Date.now()}-003`,
        description: 'Processo completo de abertura do MEI realizado',
        hours: 3.0,
        type: 'RESOLUTION',
        status: 'COMPLETED' as const,
        category: 'MEI',
        theme: 'Abertura',
        isValidated: true,
        validatedBy: coordinator?.id || null,
        validatedAt: new Date(),
        validationNotes: 'Excelente atendimento, usuário muito satisfeito',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 dias atrás
      })
    )
  }

  if (attendances.length > 0) {
    await prisma.attendance.createMany({ data: attendances })
    console.log('📅 Atendimentos de exemplo criados')
  }

  // Estatísticas finais
  const totalUsers = await prisma.user.count()
  const totalServices = await prisma.service.count()
  const totalDemands = await prisma.demand.count()
  const totalAttendances = await prisma.attendance.count()

  console.log('✅ Seed concluído com sucesso!')
  console.log(`📊 Estatísticas finais:`)
  console.log(`   👥 Usuários: ${totalUsers}`)
  console.log(`   🛠️ Serviços: ${totalServices}`)
  console.log(`   📋 Demandas: ${totalDemands}`)
  console.log(`   📅 Atendimentos: ${totalAttendances}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
