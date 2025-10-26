import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixPasswords() {
  console.log('🔧 Corrigindo senhas dos usuários...')

  // Hash correto para senha "123456"
  const passwordHash = await bcrypt.hash('123456', 12)
  console.log('🔐 Hash gerado para senha "123456"')

  // Atualizar TODOS os usuários com a mesma senha
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash }
    })
    console.log(`✅ Senha atualizada para: ${user.email}`)
  }

  console.log('\n🎯 TESTE AS CREDENCIAIS AGORA:')
  console.log('==========================================')
  
  const allUsers = await prisma.user.findMany({
    select: { email: true, role: true, name: true }
  })

  allUsers.forEach((user: { email: string; role: string; name: string | null }) => {
    console.log(`${user.role}: ${user.email} / 123456`)
  })
  
  console.log('==========================================')
  console.log('✅ Todas as senhas foram corrigidas!')
}

fixPasswords()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
