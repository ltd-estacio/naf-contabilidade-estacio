const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  'https://gaevnrnthqxiwrdypour.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw'
)

async function createAdmin() {
  try {
    console.log('🔐 Criando usuário administrador...')

    // Primeiro, vamos verificar se a tabela coordinator_users existe
    const { data: existingUsers, error: checkError } = await supabase
      .from('coordinator_users')
      .select('*')
      .limit(1)

    if (checkError) {
      console.log('⚠️ Tabela coordinator_users não existe. Tentando criar...')

      // Se a tabela não existe, vamos tentar criar um usuário na tabela users
      const password = 'admin123'
      const hashedPassword = await bcrypt.hash(password, 12)

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'admin@naf.com',
          password: hashedPassword,
          role: 'COORDINATOR',
          phone: '(48) 98461-4449',
          status: 'ACTIVE',
          is_active: true
        })
        .select()

      if (insertError) {
        console.error('❌ Erro ao criar usuário:', insertError)
        return
      }

      console.log('✅ Usuário administrador criado com sucesso!')
      console.log('📧 Email: admin@naf.com')
      console.log('🔑 Senha: admin123')

    } else {
      // Tabela coordinator_users existe, criar usuário lá
      const password = 'admin123'
      const hashedPassword = await bcrypt.hash(password, 12)

      // Verificar se já existe um admin
      const { data: existingAdmin } = await supabase
        .from('coordinator_users')
        .select('*')
        .eq('email', 'admin@naf.com')
        .single()

      if (existingAdmin) {
        console.log('ℹ️ Usuário administrador já existe!')
        console.log('📧 Email: admin@naf.com')
        console.log('🔑 Senha: admin123')
        return
      }

      const { data: newUser, error: insertError } = await supabase
        .from('coordinator_users')
        .insert({
          email: 'admin@naf.com',
          password_hash: hashedPassword,
          is_active: true
        })
        .select()

      if (insertError) {
        console.error('❌ Erro ao criar usuário:', insertError)
        return
      }

      console.log('✅ Usuário administrador criado com sucesso!')
      console.log('📧 Email: admin@naf.com')
      console.log('🔑 Senha: admin123')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createAdmin()