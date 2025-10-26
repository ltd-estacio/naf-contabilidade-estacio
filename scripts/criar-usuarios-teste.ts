import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function criarUsuariosTeste() {
  console.log('🚀 CRIANDO USUÁRIOS DE TESTE REAIS')
  console.log('=' .repeat(50))

  try {
    // 1. Coordenador Principal
    const coordenadorSenha = await bcrypt.hash('123456', 12)
    const coordenador = await prisma.user.upsert({
      where: { email: 'coordenador@naf.teste' },
      update: {},
      create: {
        name: 'Maria Silva Coordenadora',
        email: 'coordenador@naf.teste',
        password: coordenadorSenha,
        role: 'COORDINATOR',
        phone: '(48) 99999-0001'
      }
    })
    console.log('✅ Coordenador criado:', coordenador.name)

    // 2. Professores
    const professores = [
      {
        name: 'Prof. João Santos',
        email: 'joao.professor@naf.teste',
        phone: '(48) 99999-0002'
      },
      {
        name: 'Prof. Ana Carolina',
        email: 'ana.professor@naf.teste', 
        phone: '(48) 99999-0003'
      },
      {
        name: 'Prof. Carlos Eduardo',
        email: 'carlos.professor@naf.teste',
        phone: '(48) 99999-0004'
      }
    ]

    for (const prof of professores) {
      const senha = await bcrypt.hash('123456', 12)
      const professor = await prisma.user.upsert({
        where: { email: prof.email },
        update: {},
        create: {
          name: prof.name,
          email: prof.email,
          password: senha,
          role: 'TEACHER',
          phone: prof.phone
        }
      })
      console.log('✅ Professor criado:', professor.name)
    }

    // 3. Estudantes
    const estudantes = [
      {
        name: 'Pedro Oliveira',
        email: 'pedro.estudante@naf.teste',
        phone: '(48) 99999-1001'
      },
      {
        name: 'Julia Fernandes', 
        email: 'julia.estudante@naf.teste',
        phone: '(48) 99999-1002'
      },
      {
        name: 'Lucas Mendes',
        email: 'lucas.estudante@naf.teste',
        phone: '(48) 99999-1003'
      },
      {
        name: 'Camila Rosa',
        email: 'camila.estudante@naf.teste',
        phone: '(48) 99999-1004'
      },
      {
        name: 'Rafael Costa',
        email: 'rafael.estudante@naf.teste',
        phone: '(48) 99999-1005'
      },
      {
        name: 'Beatriz Lima',
        email: 'beatriz.estudante@naf.teste',
        phone: '(48) 99999-1006'
      },
      {
        name: 'Gabriel Souza',
        email: 'gabriel.estudante@naf.teste',
        phone: '(48) 99999-1007'
      },
      {
        name: 'Mariana Santos',
        email: 'mariana.estudante@naf.teste',
        phone: '(48) 99999-1008'
      }
    ]

    for (const est of estudantes) {
      const senha = await bcrypt.hash('123456', 12)
      const estudante = await prisma.user.upsert({
        where: { email: est.email },
        update: {},
        create: {
          name: est.name,
          email: est.email,
          password: senha,
          role: 'STUDENT',
          phone: est.phone
        }
      })
      console.log('✅ Estudante criado:', estudante.name)
    }

    // 4. Criar demandas de teste reais
    console.log('\n📋 CRIANDO DEMANDAS DE TESTE')
    console.log('-'.repeat(30))

    const usuarios = await prisma.user.findMany()
    const servicos = await prisma.service.findMany({ where: { isActive: true } })

    if (servicos.length === 0) {
      console.log('⚠️  Nenhum serviço encontrado. Execute o seed de serviços primeiro.')
      return
    }

    const demandasTeste = [
      {
        title: 'Orientação para Declaração IR 2025',
        description: 'Cliente precisa de orientação completa para declarar Imposto de Renda 2025',
        clientName: 'José da Silva',
        clientEmail: 'jose.silva@email.com',
        clientCpf: '123.456.789-00',
        status: 'PENDING' as const,
        serviceId: servicos[0].id,
        userId: usuarios.find(u => u.role === 'STUDENT')?.id
      },
      {
        title: 'Cadastro CPF para menor de idade',
        description: 'Solicitação de primeiro CPF para menor de 16 anos',
        clientName: 'Maria Eduarda Menores',
        clientEmail: 'maria.eduarda@email.com', 
        clientCpf: '987.654.321-00',
        status: 'PENDING' as const,
        serviceId: servicos[1]?.id || servicos[0].id,
        userId: usuarios.find(u => u.role === 'STUDENT')?.id
      },
      {
        title: 'Orientação MEI - Microempreendedor',
        description: 'Esclarecimentos sobre abertura e obrigações do MEI',
        clientName: 'Carlos Empreendedor',
        clientEmail: 'carlos.mei@email.com',
        clientCpf: '111.222.333-44',
        status: 'IN_PROGRESS' as const,
        serviceId: servicos[2]?.id || servicos[0].id,
        userId: usuarios.find(u => u.role === 'TEACHER')?.id
      },
      {
        title: 'Certidão Negativa Federal',
        description: 'Emissão de certidão negativa de débitos federais',
        clientName: 'Ana Empresa Ltda',
        clientEmail: 'ana.empresa@email.com',
        clientCpf: '555.666.777-88',
        status: 'COMPLETED' as const,
        serviceId: servicos[3]?.id || servicos[0].id,
        userId: usuarios.find(u => u.role === 'TEACHER')?.id
      },
      {
        title: 'Parcelamento de Débitos',
        description: 'Orientação para parcelamento de débitos tributários',
        clientName: 'Roberto Devedor',
        clientEmail: 'roberto.dev@email.com',
        clientCpf: '999.888.777-66',
        status: 'PENDING' as const,
        serviceId: servicos[4]?.id || servicos[0].id,
        userId: usuarios.find(u => u.role === 'STUDENT')?.id
      }
    ]

    for (const demanda of demandasTeste) {
      // Garantir que userId seja válido
      const validUserId = demanda.userId || usuarios.find(u => u.role === 'STUDENT')?.id || usuarios[0].id;
      
      if (validUserId) {
        const protocolNumber = `NAF${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`
        
        const novaDemanda = await prisma.demand.create({
          data: {
            title: demanda.title,
            description: demanda.description,
            clientName: demanda.clientName,
            clientEmail: demanda.clientEmail,
            clientCpf: demanda.clientCpf,
            status: demanda.status,
            serviceId: demanda.serviceId,
            userId: validUserId,
            protocolNumber,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Últimos 30 dias
          }
        })
        console.log(`✅ Demanda criada: ${novaDemanda.protocolNumber} - ${novaDemanda.title}`)
      }
    }

    // 5. Criar atendimentos de teste
    console.log('\n🎯 CRIANDO ATENDIMENTOS DE TESTE')
    console.log('-'.repeat(30))

    const demandas = await prisma.demand.findMany()
    const professoresList = usuarios.filter(u => u.role === 'TEACHER')

    for (let i = 0; i < Math.min(3, demandas.length); i++) {
      const demanda = demandas[i]
      const professor = professoresList[i % professoresList.length]
      
      const dataAgendamento = new Date()
      dataAgendamento.setDate(dataAgendamento.getDate() + Math.floor(Math.random() * 7))

      const atendimento = await prisma.attendance.create({
        data: {
          protocol: `ATD${Date.now().toString().slice(-6)}${i}`,
          demandId: demanda.id,
          userId: professor.id,
          status: i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'SCHEDULED',
          category: 'Orientação Fiscal',
          theme: i === 0 ? 'Declaração IR' : i === 1 ? 'MEI' : 'Certidões',
          hours: Math.floor(Math.random() * 3) + 1,
          scheduledAt: dataAgendamento,
          completedAt: i === 0 ? new Date() : null
        }
      })
      console.log(`✅ Atendimento criado: ${atendimento.protocol}`)
    }

    // 6. Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS')
    console.log('='.repeat(50))

    const stats = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'COORDINATOR' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.demand.count(),
      prisma.attendance.count(),
      prisma.service.count({ where: { isActive: true } })
    ])

    console.log(`👥 Total de usuários: ${stats[0]}`)
    console.log(`👑 Coordenadores: ${stats[1]}`)
    console.log(`👨‍🏫 Professores: ${stats[2]}`)
    console.log(`👨‍🎓 Estudantes: ${stats[3]}`)
    console.log(`📋 Demandas: ${stats[4]}`)
    console.log(`🎯 Atendimentos: ${stats[5]}`)
    console.log(`🛠️ Serviços ativos: ${stats[6]}`)

    console.log('\n🎉 USUÁRIOS DE TESTE CRIADOS COM SUCESSO!')
    console.log('📧 Todos os usuários têm senha: 123456')
    console.log('🔑 Coordenador: coordenador@naf.teste')
    console.log('👨‍🏫 Professores: joao.professor@naf.teste, ana.professor@naf.teste, carlos.professor@naf.teste')
    console.log('👨‍🎓 Estudantes: pedro.estudante@naf.teste, julia.estudante@naf.teste, etc.')

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarUsuariosTeste()
