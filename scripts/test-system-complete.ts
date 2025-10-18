import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  status: 'SUCCESS' | 'ERROR'
  message: string
  data?: any
}

async function runCompleteSystemTest(): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA NAF CONTÁBIL')
  console.log('='.repeat(60))

  // 1. Teste de Conexão com Banco
  try {
    console.log('\n1️⃣ Testando conexão com banco de dados...')
    await prisma.$connect()
    
    const userCount = await prisma.user.count()
    const serviceCount = await prisma.service.count()
    const demandCount = await prisma.demand.count()
    const attendanceCount = await prisma.attendance.count()
    
    results.push({
      test: 'Database Connection',
      status: 'SUCCESS',
      message: `Conectado! ${userCount} usuários, ${serviceCount} serviços, ${demandCount} demandas, ${attendanceCount} atendimentos`,
      data: { userCount, serviceCount, demandCount, attendanceCount }
    })
    
    console.log(`✅ Banco conectado: ${userCount} usuários, ${serviceCount} serviços, ${demandCount} demandas, ${attendanceCount} atendimentos`)
  } catch (error) {
    results.push({
      test: 'Database Connection',
      status: 'ERROR',
      message: `Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    })
    console.log(`❌ Erro na conexão com banco: ${error}`)
  }

  // 2. Teste de APIs principais
  const apiTests = [
    { url: 'http://localhost:5000/api/user', name: 'User API' },
    { url: 'http://localhost:5000/api/naf-services', name: 'NAF Services API' },
    { url: 'http://localhost:5000/api/demands', name: 'Demands API' },
    { url: 'http://localhost:5000/api/reports/powerbi?type=general&format=json', name: 'Power BI API' },
    { url: 'http://localhost:5000/api/dashboard/stats', name: 'Dashboard Stats API' }
  ]

  console.log('\n2️⃣ Testando APIs principais...')
  for (const api of apiTests) {
    try {
      const response = await fetch(api.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        results.push({
          test: api.name,
          status: 'SUCCESS',
          message: `API respondendo - Status: ${response.status}`,
          data: Array.isArray(data) ? { count: data.length } : data
        })
        console.log(`✅ ${api.name}: OK (${response.status})`)
      } else {
        results.push({
          test: api.name,
          status: 'ERROR',
          message: `API erro - Status: ${response.status}`
        })
        console.log(`❌ ${api.name}: Erro ${response.status}`)
      }
    } catch (error) {
      results.push({
        test: api.name,
        status: 'ERROR',
        message: `Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
      console.log(`❌ ${api.name}: Erro na requisição`)
    }
  }

  // 3. Teste de Criação de Dados
  console.log('\n3️⃣ Testando criação de dados...')
  
  try {
    // Criar usuário teste
    const testUser = await prisma.user.upsert({
      where: { email: 'teste.sistema@naf.local' },
      update: {},
      create: {
        email: 'teste.sistema@naf.local',
        name: 'Sistema de Teste',
        password: 'hashedPassword123',
        role: 'USER',
        phone: '11987654321',
        cpf: '12345678900'
      }
    })

    results.push({
      test: 'User Creation',
      status: 'SUCCESS',
      message: `Usuário criado/atualizado: ${testUser.name}`,
      data: { id: testUser.id, email: testUser.email }
    })
    console.log(`✅ Usuário teste: ${testUser.name} (${testUser.email})`)

    // Criar demanda teste
    const services = await prisma.service.findMany({ take: 1 })
    if (services.length > 0) {
      const protocolNumber = `NAF-2025-${String(Date.now()).slice(-6)}`
      const testDemand = await prisma.demand.create({
        data: {
          protocolNumber,
          protocol: `TESTE-${Date.now()}`,
          clientName: 'Cliente Teste Sistema',
          clientEmail: 'cliente.teste@email.com',
          clientCpf: '98765432100',
          clientPhone: '11976543210',
          serviceId: services[0].id,
          description: 'Demanda criada automaticamente para teste do sistema',
          status: 'PENDING',
          priority: 'MEDIUM',
          userId: testUser.id
        }
      })

      results.push({
        test: 'Demand Creation',
        status: 'SUCCESS',
        message: `Demanda criada: ${testDemand.protocol}`,
        data: { protocol: testDemand.protocol, status: testDemand.status }
      })
      console.log(`✅ Demanda teste: ${testDemand.protocol}`)

      // Criar atendimento teste
      const attendanceProtocol = `ATD-2025-${String(Date.now()).slice(-6)}`
      const testAttendance = await prisma.attendance.create({
        data: {
          protocol: attendanceProtocol,
          demandId: testDemand.id,
          userId: testUser.id,
          category: 'Teste',
          theme: 'Sistema',
          description: 'Atendimento de teste do sistema',
          hours: 2.0,
          scheduledAt: new Date(),
          isValidated: false
        }
      })

      results.push({
        test: 'Attendance Creation',
        status: 'SUCCESS',
        message: `Atendimento criado para demanda ${testDemand.protocol}`,
        data: { id: testAttendance.id, hours: testAttendance.hours }
      })
      console.log(`✅ Atendimento teste: ${testAttendance.hours}h`)
    }

  } catch (error) {
    results.push({
      test: 'Data Creation',
      status: 'ERROR',
      message: `Erro na criação de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    })
    console.log(`❌ Erro na criação de dados: ${error}`)
  }

  // 4. Teste de Power BI Export
  console.log('\n4️⃣ Testando exportação Power BI...')
  try {
    const csvUrl = 'http://localhost:5000/api/reports/powerbi?type=powerbi-dataset&format=csv'
    const csvResponse = await fetch(csvUrl)
    
    if (csvResponse.ok) {
      const csvData = await csvResponse.text()
      results.push({
        test: 'Power BI CSV Export',
        status: 'SUCCESS',
        message: `CSV gerado com ${csvData.split('\n').length} linhas`,
        data: { format: 'CSV', size: csvData.length }
      })
      console.log(`✅ Export CSV: ${csvData.split('\n').length} linhas`)
    } else {
      results.push({
        test: 'Power BI CSV Export',
        status: 'ERROR',
        message: `Erro no export CSV: ${csvResponse.status}`
      })
      console.log(`❌ Export CSV: Erro ${csvResponse.status}`)
    }

    const jsonUrl = 'http://localhost:5000/api/reports/powerbi?type=general&format=json'
    const jsonResponse = await fetch(jsonUrl)
    
    if (jsonResponse.ok) {
      const jsonData = await jsonResponse.json()
      results.push({
        test: 'Power BI JSON Export',
        status: 'SUCCESS',
        message: `JSON gerado com dados completos`,
        data: { format: 'JSON', recordCount: jsonData.data?.length || 0 }
      })
      console.log(`✅ Export JSON: Dados completos`)
    } else {
      results.push({
        test: 'Power BI JSON Export',
        status: 'ERROR',
        message: `Erro no export JSON: ${jsonResponse.status}`
      })
      console.log(`❌ Export JSON: Erro ${jsonResponse.status}`)
    }

  } catch (error) {
    results.push({
      test: 'Power BI Export',
      status: 'ERROR',
      message: `Erro no teste de export: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    })
    console.log(`❌ Erro no teste de export: ${error}`)
  }

  // 5. Teste final de estatísticas
  console.log('\n5️⃣ Gerando estatísticas finais...')
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      totalServices: await prisma.service.count(),
      totalDemands: await prisma.demand.count(),
      totalAttendances: await prisma.attendance.count(),
      pendingDemands: await prisma.demand.count({ where: { status: 'PENDING' } }),
      validatedAttendances: await prisma.attendance.count({ where: { isValidated: true } })
    }

    results.push({
      test: 'Final Statistics',
      status: 'SUCCESS',
      message: 'Estatísticas coletadas com sucesso',
      data: stats
    })

    console.log('📊 ESTATÍSTICAS FINAIS:')
    console.log(`   👥 ${stats.totalUsers} usuários cadastrados`)
    console.log(`   🏛️ ${stats.totalServices} serviços NAF disponíveis`)
    console.log(`   📋 ${stats.totalDemands} demandas (${stats.pendingDemands} pendentes)`)
    console.log(`   🎓 ${stats.totalAttendances} atendimentos (${stats.validatedAttendances} validados)`)

  } catch (error) {
    results.push({
      test: 'Final Statistics',
      status: 'ERROR',
      message: `Erro nas estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    })
    console.log(`❌ Erro nas estatísticas: ${error}`)
  }

  await prisma.$disconnect()

  // Resumo final
  const successCount = results.filter(r => r.status === 'SUCCESS').length
  const errorCount = results.filter(r => r.status === 'ERROR').length

  console.log('\n' + '='.repeat(60))
  console.log('🏁 RESUMO DO TESTE COMPLETO')
  console.log('='.repeat(60))
  console.log(`✅ Sucessos: ${successCount}`)
  console.log(`❌ Erros: ${errorCount}`)
  console.log(`📊 Total de testes: ${results.length}`)
  
  if (errorCount === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente!')
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os detalhes acima.')
  }

  return results
}

// Executar o teste
runCompleteSystemTest()
  .then(results => {
    console.log('\n💾 Salvando relatório de teste...')
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      failed: results.filter(r => r.status === 'ERROR').length,
      results: results
    }

    require('fs').writeFileSync(
      'test-system-complete.json',
      JSON.stringify(report, null, 2)
    )
    
    console.log('📄 Relatório salvo em: test-system-complete.json')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal no teste:', error)
    process.exit(1)
  })
