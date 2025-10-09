import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  console.log('🌱 Criando usuários de teste...')

  // Hash da senha padrão: "123456"
  const hashedPassword = await bcrypt.hash('123456', 12)

  const testUsers = [
    {
      email: 'aluno@naf.com',
      name: 'João Silva (Aluno)',
      password: hashedPassword,
      role: 'STUDENT',
      cpf: '12345678901',
      phone: '(11) 99999-1111',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    {
      email: 'professor@naf.com',
      name: 'Maria Santos (Professora)',
      password: hashedPassword,
      role: 'TEACHER',
      cpf: '12345678902',
      phone: '(11) 99999-2222',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    {
      email: 'coordenador@naf.com',
      name: 'Carlos Oliveira (Coordenador)',
      password: hashedPassword,
      role: 'COORDINATOR',
      cpf: '12345678903',
      phone: '(11) 99999-3333',
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01413-000'
    },
    {
      email: 'usuario@naf.com',
      name: 'Ana Costa (Usuário)',
      password: hashedPassword,
      role: 'USER',
      cpf: '12345678904',
      phone: '(11) 99999-4444',
      address: 'Rua da Consolação, 321',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-907'
    }
  ]

  try {
    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData as any
        })
        console.log(`✅ Usuário criado: ${user.name} (${user.email})`)
      } else {
        console.log(`⚠️  Usuário já existe: ${userData.email}`)
      }
    }

    // Criar algumas demandas de exemplo
    console.log('\n📋 Criando demandas de exemplo...')
    
    const users = await prisma.user.findMany()
    const services = await prisma.service.findMany()
    const currentYear = new Date().getFullYear()
    
    const demandas = [
      {
        protocol: `NAF-${currentYear}-000001`,
        title: 'Dúvida sobre MEI',
        description: 'Preciso de orientação sobre como emitir DAS do MEI',
        category: 'MEI',
        theme: 'Microempreendedor Individual',
        userId: users[0].id
      },
      {
        protocol: `NAF-${currentYear}-000002`,
        title: 'Imposto de Renda',
        description: 'Dúvidas sobre declaração de IR pessoa física',
        category: 'Imposto de Renda',
        theme: 'Declaração IRPF',
        userId: users[3].id
      },
      {
        protocol: `NAF-${currentYear}-000003`,
        title: 'Regularização de CPF',
        description: 'Como regularizar CPF pendente na Receita Federal',
        category: 'Cadastros',
        theme: 'CPF',
        userId: users[0].id
      }
    ]

    for (const demandData of demandas) {
      const existingDemand = await prisma.demand.findUnique({
        where: { protocolNumber: demandData.protocol }
      })

      if (!existingDemand) {
        const demand = await prisma.demand.create({
          data: {
            ...demandData,
            protocolNumber: demandData.protocol,
            serviceId: services[0].id
          }
        })
        console.log(`✅ Demanda criada: ${demand.protocol} - ${demand.title}`)
      }
    }

    // Criar alguns atendimentos de exemplo
    console.log('\n📅 Criando atendimentos de exemplo...')
    
    const atendimentos = [
      {
        protocol: `ATD-${currentYear}-000001`,
        category: 'MEI',
        theme: 'Orientação DAS',
        hours: 1.5,
        description: 'Orientação sobre emissão de DAS',
        isValidated: true,
        userId: users[1].id, // Professor
        status: 'COMPLETED'
      },
      {
        protocol: `ATD-${currentYear}-000002`,
        category: 'Imposto de Renda',
        theme: 'Declaração IRPF',
        hours: 2.0,
        description: 'Auxílio na declaração de IR',
        isValidated: false,
        userId: users[0].id, // Aluno
        status: 'IN_PROGRESS'
      }
    ]

    for (const atendimentoData of atendimentos) {
      const existingAttendance = await prisma.attendance.findUnique({
        where: { protocol: atendimentoData.protocol }
      })

      if (!existingAttendance) {
        const attendance = await prisma.attendance.create({
          data: atendimentoData as any
        })
        console.log(`✅ Atendimento criado: ${attendance.protocol} - ${attendance.theme}`)
      }
    }

    // Criar legislações de exemplo
    console.log('\n📚 Criando base de legislações...')
    
    const legislacoes = [
      {
        title: 'Lei do MEI - Microempreendedor Individual',
        content: 'O Microempreendedor Individual (MEI) é a pessoa que trabalha por conta própria e que se legaliza como pequeno empresário. Para ser um microempreendedor individual, é necessário faturar no máximo até R$ 81.000,00 por ano.',
        category: 'MEI',
        tags: JSON.stringify(['MEI', 'microempreendedor', 'CNPJ', 'faturamento']),
        sourceUrl: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei'
      },
      {
        title: 'Declaração de Imposto de Renda Pessoa Física',
        content: 'Estão obrigadas a apresentar a Declaração de Ajuste Anual do Imposto sobre a Renda referente ao exercício de 2024, ano-calendário de 2023, as pessoas físicas residentes no Brasil que se enquadrarem em pelo menos uma das condições estabelecidas.',
        category: 'Imposto de Renda',
        tags: JSON.stringify(['IRPF', 'declaração', 'pessoa física', 'obrigatoriedade']),
        sourceUrl: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda'
      },
      {
        title: 'Cadastro de Pessoa Física - CPF',
        content: 'O CPF é um documento necessário para qualquer pessoa física exercer seus direitos e cumprir suas obrigações junto à Receita Federal. É obrigatório para brasileiros e estrangeiros residentes no Brasil.',
        category: 'Cadastros',
        tags: JSON.stringify(['CPF', 'cadastro', 'pessoa física', 'documento']),
        sourceUrl: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cpf'
      }
    ]

    for (const legislacaoData of legislacoes) {
      const existingLegislation = await prisma.legislation.findFirst({
        where: { title: legislacaoData.title }
      })

      if (!existingLegislation) {
        const legislation = await prisma.legislation.create({
          data: legislacaoData
        })
        console.log(`✅ Legislação criada: ${legislation.title}`)
      }
    }

    // Criar FAQs de exemplo
    console.log('\n❓ Criando FAQs...')
    
    const faqs = [
      {
        question: 'Como emitir o DAS do MEI?',
        answer: 'Para emitir o DAS do MEI, acesse o Portal do Empreendedor (www.portaldoempreendedor.gov.br), faça login com seu CPF e senha, vá em "Já sou MEI" > "Guias para Pagamento (DAS)" e selecione o mês desejado.',
        category: 'MEI',
        keywords: JSON.stringify(['DAS', 'MEI', 'emitir', 'pagamento', 'guia'])
      },
      {
        question: 'Quem precisa declarar Imposto de Renda?',
        answer: 'Precisam declarar IR as pessoas que receberam rendimentos tributáveis superiores a R$ 28.559,70 em 2023, ou que se enquadram em outras condições como posse de bens, atividade rural, etc.',
        category: 'Imposto de Renda',
        keywords: JSON.stringify(['IR', 'declaração', 'obrigatoriedade', 'rendimentos', 'valor'])
      },
      {
        question: 'Como regularizar CPF pendente?',
        answer: 'Para regularizar CPF pendente, acesse o site da Receita Federal, vá em "Meu CPF", faça login e siga as instruções. Pode ser necessário apresentar documentos ou pagar multa.',
        category: 'Cadastros',
        keywords: JSON.stringify(['CPF', 'regularizar', 'pendente', 'Receita Federal', 'documentos'])
      }
    ]

    for (const faqData of faqs) {
      const existingFAQ = await prisma.fAQ.findFirst({
        where: { question: faqData.question }
      })

      if (!existingFAQ) {
        const faq = await prisma.fAQ.create({
          data: faqData
        })
        console.log(`✅ FAQ criada: ${faq.question}`)
      }
    }

    console.log('\n🎉 Usuários de teste criados com sucesso!')
    console.log('\n📋 Credenciais de acesso:')
    console.log('👨‍🎓 Aluno: aluno@naf.com / 123456')
    console.log('👩‍🏫 Professor: professor@naf.com / 123456')
    console.log('👨‍💼 Coordenador: coordenador@naf.com / 123456')
    console.log('👤 Usuário: usuario@naf.com / 123456')

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
