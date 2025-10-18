import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🧪 TESTE DE LOGIN DIRETO')
  console.log('=' .repeat(50))

  const testCredentials = [
    { email: 'coordenador@naf.teste', password: '123456', role: 'COORDINATOR' },
    { email: 'professor1@naf.teste', password: '123456', role: 'TEACHER' },
    { email: 'aluno1@naf.teste', password: '123456', role: 'STUDENT' }
  ]

  for (const cred of testCredentials) {
    console.log(`\n🔍 Testando: ${cred.email}`)
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: cred.email }
    })

    if (!user) {
      console.log(`❌ Usuário não encontrado: ${cred.email}`)
      continue
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.role})`)
    
    if (!user.password) {
      console.log(`❌ Senha não definida para: ${cred.email}`)
      continue
    }

    // Testar senha
    const isValid = await bcrypt.compare(cred.password, user.password)
    console.log(`🔐 Senha válida: ${isValid ? '✅ SIM' : '❌ NÃO'}`)
    
    if (isValid) {
      console.log(`🎯 LOGIN OK: ${cred.email} / ${cred.password}`)
    } else {
      console.log(`❌ LOGIN FALHOU: ${cred.email}`)
      
      // Vamos verificar o hash atual
      console.log(`🔍 Hash atual: ${user.password.substring(0, 20)}...`)
      
      // Gerar novo hash para comparação
      const newHash = await bcrypt.hash(cred.password, 12)
      console.log(`🔍 Hash novo: ${newHash.substring(0, 20)}...`)
    }
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🏁 TESTE DE LOGIN CONCLUÍDO')
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
