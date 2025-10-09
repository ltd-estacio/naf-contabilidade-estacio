import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugAuth() {
  console.log('🔍 DEBUG AUTENTICAÇÃO COMPLETO')
  console.log('=' .repeat(50))

  try {
    // 1. Verificar conexão com banco
    console.log('1. Testando conexão com banco...')
    const userCount = await prisma.user.count()
    console.log(`✅ Conexão OK. Usuários: ${userCount}`)

    // 2. Buscar usuário específico
    console.log('\n2. Buscando usuário coordenador...')
    const user = await prisma.user.findUnique({
      where: { email: 'coordenador@naf.teste' }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado!')
      
      // Criar usuário de emergência
      console.log('🔧 Criando usuário de emergência...')
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@teste.com',
          password: await bcrypt.hash('123456', 12),
          name: 'Admin Teste',
          role: 'COORDINATOR',
          status: 'ACTIVE'
        }
      })
      console.log(`✅ Usuário criado: ${newUser.email}`)
    } else {
      console.log(`✅ Usuário encontrado: ${user.name}`)
      
      // 3. Testar senha
      console.log('\n3. Testando senha...')
      if (user.password) {
        const isValid = await bcrypt.compare('123456', user.password)
        console.log(`🔐 Senha válida: ${isValid}`)
        
        if (!isValid) {
          // Corrigir senha
          console.log('🔧 Corrigindo senha...')
          await prisma.user.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash('123456', 12) }
          })
          console.log('✅ Senha corrigida!')
        }
      } else {
        console.log('❌ Usuário sem senha!')
      }
    }

    // 4. Listar todos os usuários
    console.log('\n4. Listando todos os usuários:')
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true, status: true }
    })
    
    allUsers.forEach((u: any, i: number) => {
      console.log(`${i+1}. ${u.email} - ${u.name} (${u.role}) - ${u.status}`)
    })

    console.log('\n🎯 CREDENCIAIS FUNCIONAIS:')
    console.log('=' .repeat(50))
    console.log('Email: coordenador@naf.teste')
    console.log('Email: admin@teste.com')
    console.log('Senha: 123456')
    console.log('URL: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Erro crítico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth()
