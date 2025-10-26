import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')
  
  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.attendance.deleteMany()
  await prisma.demand.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()
  
  // Criar usuários
  console.log('👥 Criando usuários...')
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const coordenador = await prisma.user.create({
    data: {
      name: 'Ana Coordenadora',
      email: 'coord@naf.com',
      password: hashedPassword,
      role: 'COORDINATOR'
    }
  })
  
  const professor = await prisma.user.create({
    data: {
      name: 'Carlos Professor',
      email: 'prof@naf.com',
      password: hashedPassword,
      role: 'TEACHER'
    }
  })
  
  const aluno = await prisma.user.create({
    data: {
      name: 'Maria Aluna',
      email: 'aluno@naf.com',
      password: hashedPassword,
      role: 'STUDENT'
    }
  })
  
  const usuario = await prisma.user.create({
    data: {
      name: 'João Usuário',
      email: 'user@naf.com',
      password: hashedPassword,
      role: 'USER'
    }
  })
  
  // Criar serviços
  console.log('🛠️ Criando serviços...')
  const servicoCPF = await prisma.service.create({
    data: {
      name: 'Cadastro de CPF',
      description: 'Orientação para cadastro e regularização de CPF',
      category: 'CPF',
      requirements: 'RG, comprovante de residência',
      estimatedDuration: 30,
      isActive: true
    }
  })
  
  const servicoCNPJ = await prisma.service.create({
    data: {
      name: 'Abertura de CNPJ',
      description: 'Auxiliar na abertura de empresa',
      category: 'CNPJ',
      requirements: 'Documentos pessoais, contrato social',
      estimatedDuration: 60,
      isActive: true
    }
  })
  
  const servicoIR = await prisma.service.create({
    data: {
      name: 'Declaração de Imposto de Renda',
      description: 'Auxílio na declaração de IR pessoa física',
      category: 'IMPOSTO_RENDA',
      requirements: 'Informe de rendimentos, recibos',
      estimatedDuration: 45,
      isActive: true
    }
  })
  
  const servicoMEI = await prisma.service.create({
    data: {
      name: 'Cadastro MEI',
      description: 'Orientação para cadastro como MEI',
      category: 'MEI',
      requirements: 'CPF, RG, comprovante de residência',
      estimatedDuration: 30,
      isActive: true
    }
  })
  
  // Criar demandas
  console.log('📋 Criando demandas...')
  const demanda1 = await prisma.demand.create({
    data: {
      userId: usuario.id,
      serviceId: servicoCPF.id,
      description: 'Preciso regularizar meu CPF que está pendente',
      priority: 'MEDIUM',
      protocolNumber: 'NAF202500001',
      status: 'PENDING'
    }
  })
  
  const demanda2 = await prisma.demand.create({
    data: {
      userId: usuario.id,
      serviceId: servicoIR.id,
      description: 'Dúvidas sobre como declarar IR 2025',
      priority: 'HIGH',
      protocolNumber: 'NAF202500002',
      status: 'IN_PROGRESS'
    }
  })
  
  // Criar atendimentos
  console.log('⏰ Criando atendimentos...')
  await prisma.attendance.create({
    data: {
      userId: aluno.id,
      demandId: demanda1.id,
      protocol: 'ATD202500001',
      description: 'Orientação sobre regularização de CPF',
      category: 'CPF',
      theme: 'Regularização',
      hours: 1.5,
      status: 'COMPLETED',
      isValidated: true
    }
  })
  
  await prisma.attendance.create({
    data: {
      userId: aluno.id,
      demandId: demanda2.id,
      protocol: 'ATD202500002',
      description: 'Explicação sobre declaração de IR',
      category: 'IMPOSTO_RENDA',
      theme: 'Declaração',
      hours: 2.0,
      status: 'COMPLETED',
      isValidated: false
    }
  })
  
  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📊 Dados criados:')
  console.log(`- ${4} usuários`)
  console.log(`- ${4} serviços`)
  console.log(`- ${2} demandas`)
  console.log(`- ${2} atendimentos`)
  
  console.log('\n🔑 Contas de teste:')
  console.log('- Coordenador: coord@naf.com / 123456')
  console.log('- Professor: prof@naf.com / 123456')
  console.log('- Aluno: aluno@naf.com / 123456')
  console.log('- Usuário: user@naf.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
