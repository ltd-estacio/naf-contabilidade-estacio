import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrichTestData() {
  console.log('🌱 Enriquecendo dados para testes de relatórios...')

  try {
    // Criar algumas demandas adicionais para testes
    const users = await prisma.user.findMany()
    const services = await prisma.service.findMany({ take: 10 })

    console.log(`📊 Encontrados ${users.length} usuários e ${services.length} serviços`)

    // Gerar demandas variadas
    const demandData = [
      {
        protocolNumber: 'NAF-2025-001',
        status: 'PENDING' as const,
        priority: 'HIGH' as const,
        description: 'Urgente: Declaração de IR atrasada com multa',
        userId: users.find(u => u.role === 'USER')?.id || users[0].id,
        serviceId: services.find(s => s.name.includes('Imposto'))?.id || services[0].id
      },
      {
        protocolNumber: 'NAF-2025-002',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        description: 'Abertura de MEI para atividade comercial',
        userId: users.find(u => u.role === 'USER')?.id || users[0].id,
        serviceId: services.find(s => s.name.includes('MEI'))?.id || services[1].id
      },
      {
        protocolNumber: 'NAF-2025-003',
        status: 'COMPLETED' as const,
        priority: 'LOW' as const,
        description: 'Orientação sobre CPF regularizado com sucesso',
        userId: users.find(u => u.role === 'USER')?.id || users[0].id,
        serviceId: services.find(s => s.name.includes('CPF'))?.id || services[2].id
      },
      {
        protocolNumber: 'NAF-2025-004',
        status: 'PENDING' as const,
        priority: 'MEDIUM' as const,
        description: 'Certidão negativa para licitação',
        userId: users.find(u => u.role === 'USER' && u.email !== users.find(u => u.role === 'USER')?.email)?.id || users[1].id,
        serviceId: services.find(s => s.name.includes('Certidão'))?.id || services[3].id
      },
      {
        protocolNumber: 'NAF-2025-005',
        status: 'COMPLETED' as const,
        priority: 'HIGH' as const,
        description: 'E-Social doméstico configurado',
        userId: users.find(u => u.role === 'USER')?.id || users[0].id,
        serviceId: services.find(s => s.name.includes('Social'))?.id || services[4].id
      }
    ]

    // Inserir demandas
    for (const demand of demandData) {
      try {
        const existingDemand = await prisma.demand.findFirst({
          where: { protocolNumber: demand.protocolNumber }
        })

        if (!existingDemand) {
          await prisma.demand.create({ data: demand })
          console.log(`✅ Demanda criada: ${demand.protocolNumber}`)
        } else {
          console.log(`⚠️  Demanda já existe: ${demand.protocolNumber}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao criar demanda ${demand.protocolNumber}:`, error)
      }
    }

    // Criar atendimentos para as demandas
    const allDemands = await prisma.demand.findMany({ take: 8 })
    const students = users.filter(u => u.role === 'STUDENT' || u.role === 'TEACHER')

    for (let i = 0; i < Math.min(allDemands.length, 6); i++) {
      const demand = allDemands[i]
      const student = students[i % students.length]

      try {
        const existingAttendance = await prisma.attendance.findFirst({
          where: { demandId: demand.id }
        })

        if (!existingAttendance) {
          const protocolNumber = `ATD-2025-${String(i + 100).padStart(6, '0')}`
          await prisma.attendance.create({
            data: {
              protocol: protocolNumber,
              category: 'ORIENTACAO',
              theme: 'Orientação Fiscal',
              userId: student.id,
              demandId: demand.id,
              hours: Math.floor(Math.random() * 4) + 1, // 1-4 horas
              isValidated: Math.random() > 0.3, // 70% de chance de estar validado
              description: `Atendimento para ${demand.description}`
            }
          })
          console.log(`✅ Atendimento criado para demanda ${demand.protocolNumber}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao criar atendimento:`, error)
      }
    }

    // Estatísticas finais
    const stats = {
      users: await prisma.user.count(),
      services: await prisma.service.count(),
      demands: await prisma.demand.count(),
      attendances: await prisma.attendance.count()
    }

    console.log('\n📊 ESTATÍSTICAS ATUALIZADAS:')
    console.log(`   👥 Usuários: ${stats.users}`)
    console.log(`   🛠️  Serviços: ${stats.services}`)
    console.log(`   📋 Demandas: ${stats.demands}`)
    console.log(`   👨‍🏫 Atendimentos: ${stats.attendances}`)

    // Dados por status
    const demandsByStatus = await prisma.demand.groupBy({
      by: ['status'],
      _count: { _all: true }
    })

    console.log('\n📈 DEMANDAS POR STATUS:')
    demandsByStatus.forEach(group => {
      console.log(`   ${group.status}: ${group._count._all}`)
    })

    // Dados por prioridade
    const demandsByPriority = await prisma.demand.groupBy({
      by: ['priority'],
      _count: { _all: true }
    })

    console.log('\n🎯 DEMANDAS POR PRIORIDADE:')
    demandsByPriority.forEach(group => {
      console.log(`   ${group.priority}: ${group._count._all}`)
    })

    console.log('\n🎉 Dados enriquecidos com sucesso! Relatórios prontos para teste.')

  } catch (error) {
    console.error('❌ Erro ao enriquecer dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enrichTestData()
