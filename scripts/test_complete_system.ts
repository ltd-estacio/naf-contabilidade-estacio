import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCompleteSystem() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA NAF')
  console.log('=' .repeat(60))

  try {
    // Teste 1: Verificar banco de dados
    console.log('\n📊 1. TESTANDO BANCO DE DADOS')
    console.log('-' .repeat(40))
    
    const userCount = await prisma.user.count()
    const serviceCount = await prisma.service.count()
    const demandCount = await prisma.demand.count()
    const attendanceCount = await prisma.attendance.count()
    
    console.log(`✅ Usuários: ${userCount}`)
    console.log(`✅ Serviços: ${serviceCount}`)
    console.log(`✅ Demandas: ${demandCount}`)
    console.log(`✅ Atendimentos: ${attendanceCount}`)
    
    // Teste 2: Verificar credenciais
    console.log('\n🔐 2. TESTANDO CREDENCIAIS')
    console.log('-' .repeat(40))
    
    const testUsers = [
      'coordenador@naf.teste',
      'professor1@naf.teste', 
      'aluno1@naf.teste'
    ]
    
    for (const email of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (user && user.password) {
        const isValid = await bcrypt.compare('123456', user.password)
        console.log(`${isValid ? '✅' : '❌'} ${email} - ${user.role}`)
      } else {
        console.log(`❌ ${email} - NÃO ENCONTRADO`)
      }
    }
    
    // Teste 3: Verificar dados para relatórios
    console.log('\n📈 3. TESTANDO DADOS PARA RELATÓRIOS')
    console.log('-' .repeat(40))
    
    // Relatório por status
    const demandsByStatus = await prisma.demand.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })
    
    console.log('📊 Demandas por Status:')
    demandsByStatus.forEach((item: any) => {
      console.log(`   ${item.status}: ${item._count.id}`)
    })
    
    // Relatório por role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })
    
    console.log('\n👥 Usuários por Tipo:')
    usersByRole.forEach((item: any) => {
      console.log(`   ${item.role}: ${item._count.id}`)
    })
    
    // Teste 4: Verificar serviços para relatórios
    console.log('\n🛠️ 4. TESTANDO SERVIÇOS DISPONÍVEIS')
    console.log('-' .repeat(40))
    
    const services = await prisma.service.findMany({
      select: {
        name: true,
        category: true,
        isActive: true,
        _count: {
          select: {
            demands: true
          }
        }
      }
    })
    
    console.log('📋 Serviços com contagem de demandas:')
    services.forEach((service: any) => {
      console.log(`   ${service.name}: ${service._count.demands} demandas ${service.isActive ? '(ATIVO)' : '(INATIVO)'}`)
    })
    
    // Teste 5: Verificar atendimentos para relatórios
    console.log('\n👨‍🏫 5. TESTANDO ATENDIMENTOS PARA RELATÓRIOS')
    console.log('-' .repeat(40))
    
    const attendances = await prisma.attendance.findMany({
      include: {
        user: {
          select: { name: true, role: true }
        },
        demand: {
          select: { title: true, service: { select: { name: true } } }
        }
      }
    })
    
    console.log('📝 Atendimentos detalhados:')
    attendances.forEach((att: any, index: number) => {
      console.log(`   ${index + 1}. ${att.user.name} (${att.user.role}) - ${att.status}`)
      if (att.demand) {
        console.log(`      Demanda: ${att.demand.title || 'Sem título'}`)
      }
    })
    
    // Teste 6: Verificar configurações críticas
    console.log('\n⚙️ 6. VERIFICANDO CONFIGURAÇÕES')
    console.log('-' .repeat(40))
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET'
    ]
    
    requiredEnvVars.forEach((envVar: string) => {
      const value = process.env[envVar]
      console.log(`${value ? '✅' : '❌'} ${envVar}: ${value ? 'DEFINIDO' : 'NÃO DEFINIDO'}`)
    })
    
    console.log('\n🎯 RESUMO FINAL')
    console.log('=' .repeat(60))
    console.log(`✅ Banco de dados: ${userCount > 0 ? 'OK' : 'VAZIO'}`)
    console.log(`✅ Usuários cadastrados: ${userCount}`)
    console.log(`✅ Dados para relatórios: ${demandCount > 0 && attendanceCount > 0 ? 'OK' : 'INSUFICIENTES'}`)
    console.log(`✅ Configurações: ${process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET ? 'OK' : 'INCOMPLETAS'}`)
    
    if (userCount > 0 && demandCount > 0 && attendanceCount > 0) {
      console.log('\n🚀 SISTEMA ESTÁ PRONTO PARA USO!')
      console.log('🌐 Acesse: http://localhost:3000/login')
      console.log('\n📝 CREDENCIAIS DE TESTE:')
      console.log('   coordenador@naf.teste / 123456')
      console.log('   professor1@naf.teste / 123456')
      console.log('   aluno1@naf.teste / 123456')
    } else {
      console.log('\n❌ SISTEMA PRECISA DE CORREÇÕES')
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteSystem()
