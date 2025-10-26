import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Verificar se já existem dados
  const existingUsers = await prisma.user.findMany()
  
  if (existingUsers.length === 0) {
    console.log('👥 Criando usuários de teste...')
    
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
    
    console.log('✅ Usuários criados com sucesso!')
  }

  // Verificar se já existem serviços
  const existingServices = await prisma.service.findMany()
  
  if (existingServices.length === 0) {
    console.log('🛠️ Criando serviços NAF...')
    
    await prisma.service.createMany({
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
        }
      ]
    })
    
    console.log('✅ Serviços criados com sucesso!')
  }

  // Buscar usuários e serviços para criar demandas
  const users = await prisma.user.findMany()
  const services = await prisma.service.findMany()
  
  const existingDemands = await prisma.demand.findMany()
  
  if (existingDemands.length === 0 && users.length > 0 && services.length > 0) {
    console.log('📋 Criando demandas de exemplo...')
    
    const user = users.find((u: any) => u.role === 'USER')
    const student = users.find((u: any) => u.role === 'STUDENT')
    
    const demandData = []
    
    if (user) {
      demandData.push({
        userId: user.id,
        serviceId: services[0].id,
        description: 'Preciso regularizar meu CPF que está com pendências',
        priority: 'HIGH' as const,
        additionalInfo: 'Tenho todos os documentos necessários',
        protocolNumber: `NAF${Date.now()}001`,
        status: 'PENDING' as const
      })
    }
    
    if (student) {
      demandData.push({
        userId: student.id,
        serviceId: services[1].id,
        description: 'Quero abrir um MEI para formalizar meu negócio',
        priority: 'MEDIUM' as const,
        additionalInfo: 'Trabalho com vendas online',
        protocolNumber: `NAF${Date.now()}002`,
        status: 'IN_PROGRESS' as const
      })
    }
    
    if (demandData.length > 0) {
      await prisma.demand.createMany({ data: demandData })
      console.log('✅ Demandas criadas com sucesso!')
    }
  }

  // Estatísticas finais
  const totalUsers = await prisma.user.count()
  const totalServices = await prisma.service.count()
  const totalDemands = await prisma.demand.count()

  console.log('🎉 Seed concluído com sucesso!')
  console.log(`📊 Resumo:`)
  console.log(`   👥 Usuários: ${totalUsers}`)
  console.log(`   🛠️ Serviços: ${totalServices}`)
  console.log(`   📋 Demandas: ${totalDemands}`)
  console.log('')
  console.log('🔑 Contas de teste:')
  console.log('   📧 coordenador@naf.com | 🔒 123456')
  console.log('   📧 professor@naf.com   | 🔒 123456')
  console.log('   📧 aluno@naf.com       | 🔒 123456')
  console.log('   📧 usuario@naf.com     | 🔒 123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
