import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function quickFix() {
  console.log('🔧 CORREÇÃO RÁPIDA FINAL')
  console.log('=' .repeat(40))

  try {
    // 1. Verificar se o banco existe e tem dados
    const userCount = await prisma.user.count()
    console.log(`📊 Usuários no banco: ${userCount}`)

    if (userCount === 0) {
      console.log('❌ Banco vazio! Populando...')
      
      // Criar usuário de teste rápido
      const testUser = await prisma.user.create({
        data: {
          email: 'teste@naf.com',
          password: await bcrypt.hash('123456', 12),
          name: 'Usuário Teste',
          role: 'COORDINATOR',
          status: 'ACTIVE'
        }
      })
      
      console.log(`✅ Usuário criado: ${testUser.email}`)
    }

    // 2. Testar login direto
    const testUser = await prisma.user.findFirst({
      where: { email: 'coordenador@naf.teste' }
    })

    if (testUser && testUser.password) {
      const isValid = await bcrypt.compare('123456', testUser.password)
      console.log(`🔐 Teste de senha: ${isValid ? 'OK' : 'FALHOU'}`)
      
      if (!isValid) {
        // Corrigir senha
        await prisma.user.update({
          where: { id: testUser.id },
          data: { password: await bcrypt.hash('123456', 12) }
        })
        console.log('✅ Senha corrigida!')
      }
    }

    // 3. Verificar configurações críticas
    console.log('\n⚙️ Configurações:')
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅' : '❌'}`)
    console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅' : '❌'}`)
    console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅' : '❌'}`)

    console.log('\n🎯 CREDENCIAIS FINAIS:')
    console.log('Email: coordenador@naf.teste')
    console.log('Email: teste@naf.com')
    console.log('Senha: 123456')
    console.log('\n🌐 URL: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickFix()
