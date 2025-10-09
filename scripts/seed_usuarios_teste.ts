import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando usuários de teste para todas as funcionalidades...')

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.attendance.deleteMany()
  await prisma.demand.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()

  // Hash da senha padrão: "123456"
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1. COORDENADOR - Acesso total
  const coordenador = await prisma.user.create({
    data: {
      name: 'Prof. Maria Silva',
      email: 'coordenador@naf.teste',
      password: passwordHash,
      role: 'COORDINATOR',
      status: 'ACTIVE',
      cpf: '111.111.111-11',
      phone: '(11) 99999-1111',
      address: 'Rua do Coordenador, 123 - Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000'
    }
  })
  console.log('✅ Coordenador criado:', coordenador.email)

  // 2. PROFESSOR 1 - Pode atender e validar
  const professor1 = await prisma.user.create({
    data: {
      name: 'Prof. João Santos',
      email: 'professor1@naf.teste',
      password: passwordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      cpf: '222.222.222-22',
      phone: '(11) 99999-2222',
      address: 'Rua do Professor, 456 - Vila Nova',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02000-000'
    }
  })
  console.log('✅ Professor 1 criado:', professor1.email)

  // 3. PROFESSOR 2 - Especialista em MEI/IR
  const professor2 = await prisma.user.create({
    data: {
      name: 'Profa. Ana Costa',
      email: 'professor2@naf.teste',
      password: passwordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      cpf: '333.333.333-33',
      phone: '(11) 99999-3333',
      address: 'Av. dos Professores, 789 - Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '03000-000'
    }
  })
  console.log('✅ Professor 2 criado:', professor2.email)

  // 4. ALUNO 1 - Perfil completo para automação
  const aluno1 = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'aluno1@naf.teste',
      password: passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      cpf: '444.444.444-44',
      phone: '(11) 99999-4444',
      address: 'Rua dos Estudantes, 321 - Universitário',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04000-000'
    }
  })
  console.log('✅ Aluno 1 criado:', aluno1.email)

  // 5. ALUNO 2 - Perfil incompleto para testar automação
  const aluno2 = await prisma.user.create({
    data: {
      name: 'Mariana Lima',
      email: 'aluno2@naf.teste',
      password: passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      cpf: '555.555.555-55',
      phone: '(11) 99999-5555',
      // Dados incompletos propositalmente para testar automação
    }
  })
  console.log('✅ Aluno 2 criado (perfil incompleto):', aluno2.email)

  // 6. USUÁRIO EXTERNO 1 - Cidadão comum
  const usuario1 = await prisma.user.create({
    data: {
      name: 'Pedro Souza',
      email: 'usuario1@naf.teste',
      password: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      cpf: '666.666.666-66',
      phone: '(11) 99999-6666',
      address: 'Rua da Comunidade, 654 - Bairro Popular',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05000-000'
    }
  })
  console.log('✅ Usuário 1 criado:', usuario1.email)

  // 7. USUÁRIO EXTERNO 2 - Empresário
  const usuario2 = await prisma.user.create({
    data: {
      name: 'Lucia Fernandes',
      email: 'usuario2@naf.teste',
      password: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      cpf: '777.777.777-77',
      phone: '(11) 99999-7777',
      address: 'Av. Empresarial, 987 - Centro Comercial',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '06000-000'
    }
  })
  console.log('✅ Usuário 2 criado:', usuario2.email)

  // 8. USUÁRIO ADMINISTRATIVO - Para testes de dashboard
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Sistema',
      email: 'admin@naf.teste',
      password: passwordHash,
      role: 'COORDINATOR',
      status: 'ACTIVE',
      cpf: '888.888.888-88',
      phone: '(11) 99999-8888',
      address: 'Rua Administrativa, 111 - Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '07000-000'
    }
  })
  console.log('✅ Admin criado:', admin.email)

  // CRIAR SERVIÇOS COMPLETOS
  console.log('\n🛠️ Criando serviços NAF...')
  
  const servicos = [
    {
      name: 'Cadastro de CPF',
      description: 'Auxílio para primeira via ou regularização de CPF',
      category: 'Cadastros',
      theme: 'CPF',
      requirements: 'RG, Certidão de nascimento ou casamento',
      estimatedDuration: 30,
      estimatedTime: 30
    },
    {
      name: 'Regularização de CPF',
      description: 'Resolução de pendências e problemas no CPF',
      category: 'Cadastros',
      theme: 'CPF',
      requirements: 'CPF, RG, comprovante de endereço',
      estimatedDuration: 45,
      estimatedTime: 45
    },
    {
      name: 'Declaração de Imposto de Renda PF',
      description: 'Auxílio completo na declaração do IR para pessoa física',
      category: 'Imposto de Renda',
      theme: 'Declaração',
      requirements: 'Informe de rendimentos, despesas médicas, educação',
      estimatedDuration: 90,
      estimatedTime: 90
    },
    {
      name: 'Retificação de DIRPF',
      description: 'Correção de declaração de IR já enviada',
      category: 'Imposto de Renda',
      theme: 'Retificação',
      requirements: 'Recibo da declaração original, documentos corretos',
      estimatedDuration: 60,
      estimatedTime: 60
    },
    {
      name: 'Abertura de MEI',
      description: 'Processo completo para formalização como MEI',
      category: 'MEI',
      theme: 'Abertura',
      requirements: 'CPF, RG, comprovante de endereço',
      estimatedDuration: 60,
      estimatedTime: 60
    },
    {
      name: 'Alteração de MEI',
      description: 'Mudança de atividade, endereço ou dados do MEI',
      category: 'MEI',
      theme: 'Alteração',
      requirements: 'CCMEI, dados para alteração',
      estimatedDuration: 45,
      estimatedTime: 45
    },
    {
      name: 'Baixa de MEI',
      description: 'Processo de encerramento do MEI',
      category: 'MEI',
      theme: 'Baixa',
      requirements: 'CCMEI, última declaração anual',
      estimatedDuration: 30,
      estimatedTime: 30
    },
    {
      name: 'DASN-SIMEI (Declaração Anual MEI)',
      description: 'Auxílio na declaração anual do MEI',
      category: 'MEI',
      theme: 'Declaração',
      requirements: 'CCMEI, relatório mensal de receitas',
      estimatedDuration: 45,
      estimatedTime: 45
    },
    {
      name: 'Cadastro no CNPJ',
      description: 'Abertura de empresa - processo completo',
      category: 'CNPJ',
      theme: 'Abertura',
      requirements: 'Documentos dos sócios, contrato social',
      estimatedDuration: 120,
      estimatedTime: 120
    },
    {
      name: 'Alteração de CNPJ',
      description: 'Mudanças no cadastro da empresa',
      category: 'CNPJ',
      theme: 'Alteração',
      requirements: 'Cartão CNPJ, ata da alteração',
      estimatedDuration: 90,
      estimatedTime: 90
    },
    {
      name: 'Certidão Negativa Federal',
      description: 'Emissão de certidão negativa de débitos federais',
      category: 'Certidões',
      theme: 'Certidão',
      requirements: 'CPF/CNPJ',
      estimatedDuration: 15,
      estimatedTime: 15
    },
    {
      name: 'Parcelamento de Débitos',
      description: 'Auxílio no parcelamento de dívidas com a Receita',
      category: 'Parcelamentos',
      theme: 'Parcelamento',
      requirements: 'CPF/CNPJ, extrato da dívida',
      estimatedDuration: 60,
      estimatedTime: 60
    }
  ]

  for (const servico of servicos) {
    await prisma.service.create({ data: servico })
  }
  console.log(`✅ ${servicos.length} serviços criados`)

  // CRIAR DEMANDAS DE TESTE
  console.log('\n📋 Criando demandas de teste...')
  
  const services = await prisma.service.findMany()
  const currentYear = new Date().getFullYear()
  
  const demandas = [
    {
      userId: aluno1.id,
      serviceId: services[0].id, // CPF
      description: 'Preciso regularizar meu CPF que está com pendências na Receita Federal',
      status: 'PENDING',
      priority: 'HIGH',
      urgency: 'HIGH',
      protocolNumber: `NAF-${currentYear}-001`,
      protocol: `NAF-${currentYear}-001`,
      category: 'Cadastros',
      theme: 'CPF',
      clientName: aluno1.name,
      clientEmail: aluno1.email,
      clientPhone: aluno1.phone,
      clientCpf: aluno1.cpf,
      clientAddress: aluno1.address,
      additionalInfo: 'Urgente: preciso para conseguir emprego'
    },
    {
      userId: usuario1.id,
      serviceId: services[2].id, // IR
      description: 'Primeira vez declarando IR, preciso de ajuda completa',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      protocolNumber: `NAF-${currentYear}-002`,
      protocol: `NAF-${currentYear}-002`,
      category: 'Imposto de Renda',
      theme: 'Declaração',
      clientName: usuario1.name,
      clientEmail: usuario1.email,
      clientPhone: usuario1.phone,
      clientCpf: usuario1.cpf,
      clientAddress: usuario1.address,
      additionalInfo: 'Sou CLT e tenho algumas despesas médicas'
    },
    {
      userId: usuario2.id,
      serviceId: services[4].id, // MEI
      description: 'Quero abrir MEI para formalizar meu negócio de vendas online',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      protocolNumber: `NAF-${currentYear}-003`,
      protocol: `NAF-${currentYear}-003`,
      category: 'MEI',
      theme: 'Abertura',
      clientName: usuario2.name,
      clientEmail: usuario2.email,
      clientPhone: usuario2.phone,
      clientCpf: usuario2.cpf,
      clientAddress: usuario2.address,
      additionalInfo: 'Trabalho com vendas no Instagram e marketplace',
      completedAt: new Date()
    },
    {
      userId: aluno2.id,
      serviceId: services[1].id, // CPF Regularização
      description: 'CPF bloqueado, não consigo fazer nada',
      status: 'PENDING',
      priority: 'HIGH',
      urgency: 'HIGH',
      protocolNumber: `NAF-${currentYear}-004`,
      protocol: `NAF-${currentYear}-004`,
      category: 'Cadastros',
      theme: 'CPF',
      clientName: aluno2.name,
      clientEmail: aluno2.email,
      clientPhone: aluno2.phone,
      clientCpf: aluno2.cpf,
      additionalInfo: 'Situação emergencial'
    },
    {
      userId: usuario1.id,
      serviceId: services[10].id, // Certidão
      description: 'Preciso de certidão negativa para participar de licitação',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      urgency: 'HIGH',
      protocolNumber: `NAF-${currentYear}-005`,
      protocol: `NAF-${currentYear}-005`,
      category: 'Certidões',
      theme: 'Certidão',
      clientName: usuario1.name,
      clientEmail: usuario1.email,
      clientPhone: usuario1.phone,
      clientCpf: usuario1.cpf,
      clientAddress: usuario1.address,
      additionalInfo: 'Prazo até sexta-feira'
    }
  ]

  for (const demanda of demandas) {
    await prisma.demand.create({ data: demanda as any })
  }
  console.log(`✅ ${demandas.length} demandas criadas`)

  // CRIAR ATENDIMENTOS
  console.log('\n📅 Criando atendimentos de teste...')
  
  const demands = await prisma.demand.findMany()
  
  const atendimentos = [
    {
      userId: demands[0].userId,
      demandId: demands[0].id,
      protocol: `ATD-${currentYear}-001`,
      description: 'Orientação inicial sobre documentação necessária para regularização de CPF',
      hours: 1.5,
      status: 'COMPLETED',
      category: 'Cadastros',
      theme: 'CPF',
      type: 'CONSULTATION',
      isValidated: true,
      validatedBy: professor1.id,
      validatedAt: new Date(),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 dias atrás
    },
    {
      userId: demands[1].userId,
      demandId: demands[1].id,
      protocol: `ATD-${currentYear}-002`,
      description: 'Auxílio no preenchimento da declaração de IR - Primeira sessão',
      hours: 2.0,
      status: 'COMPLETED',
      category: 'Imposto de Renda',
      theme: 'Declaração',
      type: 'ASSISTANCE',
      isValidated: true,
      validatedBy: professor2.id,
      validatedAt: new Date(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
    },
    {
      userId: demands[2].userId,
      demandId: demands[2].id,
      protocol: `ATD-${currentYear}-003`,
      description: 'Processo completo de abertura do MEI realizado com sucesso',
      hours: 3.0,
      status: 'COMPLETED',
      category: 'MEI',
      theme: 'Abertura',
      type: 'RESOLUTION',
      isValidated: true,
      validatedBy: coordenador.id,
      validatedAt: new Date(),
      validationNotes: 'Excelente atendimento, usuário muito satisfeito. MEI criado com sucesso.',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 dias atrás
    },
    {
      userId: demands[3].userId,
      demandId: demands[3].id,
      protocol: `ATD-${currentYear}-004`,
      description: 'Atendimento agendado para orientação sobre desbloqueio de CPF',
      hours: 0,
      status: 'SCHEDULED',
      category: 'Cadastros',
      theme: 'CPF',
      type: 'CONSULTATION',
      isValidated: false,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Daqui 2 dias
      createdAt: new Date()
    },
    {
      userId: demands[4].userId,
      demandId: demands[4].id,
      protocol: `ATD-${currentYear}-005`,
      description: 'Emissão de certidão negativa em andamento',
      hours: 0.5,
      status: 'IN_PROGRESS',
      category: 'Certidões',
      theme: 'Certidão',
      type: 'ASSISTANCE',
      isValidated: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
    }
  ]

  for (const atendimento of atendimentos) {
    await prisma.attendance.create({ data: atendimento as any })
  }
  console.log(`✅ ${atendimentos.length} atendimentos criados`)

  // ESTATÍSTICAS FINAIS
  const totalUsers = await prisma.user.count()
  const totalServices = await prisma.service.count()
  const totalDemands = await prisma.demand.count()
  const totalAttendances = await prisma.attendance.count()

  console.log('\n✅ SEED COMPLETO COM USUÁRIOS DE TESTE!')
  console.log('📊 Estatísticas finais:')
  console.log(`   👥 Usuários: ${totalUsers}`)
  console.log(`   🛠️ Serviços: ${totalServices}`)
  console.log(`   📋 Demandas: ${totalDemands}`)
  console.log(`   📅 Atendimentos: ${totalAttendances}`)

  console.log('\n🔑 CREDENCIAIS DE ACESSO:')
  console.log('==========================================')
  console.log('COORDENADOR:')
  console.log('  Email: coordenador@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Total (dashboard, relatórios, validações)')
  console.log('')
  console.log('PROFESSOR 1:')
  console.log('  Email: professor1@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Atendimentos, validações')
  console.log('')
  console.log('PROFESSOR 2:')
  console.log('  Email: professor2@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Atendimentos, validações')
  console.log('')
  console.log('ALUNO 1 (Perfil Completo):')
  console.log('  Email: aluno1@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Agendamentos, automação completa')
  console.log('')
  console.log('ALUNO 2 (Perfil Incompleto):')
  console.log('  Email: aluno2@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Teste de automação com dados faltando')
  console.log('')
  console.log('USUÁRIO 1:')
  console.log('  Email: usuario1@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Agendamentos, consultas')
  console.log('')
  console.log('USUÁRIO 2:')
  console.log('  Email: usuario2@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Agendamentos, consultas')
  console.log('')
  console.log('ADMIN:')
  console.log('  Email: admin@naf.teste')
  console.log('  Senha: 123456')
  console.log('  Acesso: Administrativo completo')
  console.log('==========================================')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
