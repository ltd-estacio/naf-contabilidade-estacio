const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  'https://gaevnrnthqxiwrdypour.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw'
)

async function createStudent() {
  try {
    console.log('🎓 Criando estudante teste...')

    // Primeiro, verificar se a tabela students existe
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('*')
      .limit(1)

    if (checkError) {
      console.log('⚠️ Tabela students não existe ou erro ao acessar:', checkError.message)
      console.log('Tentando criar na tabela users como estudante...')

      // Se a tabela students não existe, criar na tabela users
      const password = 'student123'
      const hashedPassword = await bcrypt.hash(password, 12)

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'student@naf.com',
          password: hashedPassword,
          role: 'STUDENT',
          phone: '(48) 99999-9999',
          status: 'ACTIVE',
          is_active: true
        })
        .select()

      if (insertError) {
        console.error('❌ Erro ao criar estudante na tabela users:', insertError)
        return
      }

      console.log('✅ Estudante criado com sucesso na tabela users!')
      console.log('📧 Email: student@naf.com')
      console.log('🔑 Senha: student123')
      return
    }

    // Tabela students existe, verificar se já existe um estudante teste
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('email', 'student@naf.com')
      .single()

    if (existingStudent) {
      console.log('ℹ️ Estudante teste já existe!')
      console.log('📧 Email: student@naf.com')
      console.log('🔑 Senha: student123')
      return
    }

    // Criar novo estudante
    const password = 'student123'
    const hashedPassword = await bcrypt.hash(password, 12)

    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        name: 'Estudante NAF Teste',
        email: 'student@naf.com',
        password_hash: hashedPassword,
        course: 'Ciências Contábeis',
        semester: 5,
        phone: '(48) 99999-9999',
        registration_number: '2024001',
        specializations: ['Consultoria Fiscal', 'Imposto de Renda'],
        status: 'ATIVO'
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao criar estudante:', insertError)
      return
    }

    console.log('✅ Estudante teste criado com sucesso!')
    console.log('📧 Email: student@naf.com')
    console.log('🔑 Senha: student123')
    console.log('👤 Nome: Estudante NAF Teste')
    console.log('📚 Curso: Ciências Contábeis (5º semestre)')
    console.log('📋 Matrícula: 2024001')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createStudent()