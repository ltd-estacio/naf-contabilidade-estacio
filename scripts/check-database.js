// Script para verificar as tabelas existentes no Supabase
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://gaevnrnthqxiwrdypour.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco de dados...')

  try {
    // Tentar verificar algumas tabelas existentes
    console.log('📋 Verificando tabela de usuários...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.log('❌ Tabela users não encontrada:', usersError.message)
    } else {
      console.log('✅ Tabela users existe')
    }

    console.log('📋 Verificando tabela de estudantes...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(1)

    if (studentsError) {
      console.log('❌ Tabela students não encontrada:', studentsError.message)
    } else {
      console.log('✅ Tabela students existe')
    }

    console.log('📋 Verificando tabela de treinamentos antigas...')
    const { data: trainings, error: trainingsError } = await supabase
      .from('trainings')
      .select('*')
      .limit(1)

    if (trainingsError) {
      console.log('❌ Tabela trainings não encontrada:', trainingsError.message)
    } else {
      console.log('✅ Tabela trainings existe')
    }

    console.log('📋 Verificando tabela de cursos...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1)

    if (coursesError) {
      console.log('❌ Tabela courses não encontrada:', coursesError.message)
    } else {
      console.log('✅ Tabela courses existe')
    }

    console.log('📋 Verificando tabela de progresso...')
    const { data: progress, error: progressError } = await supabase
      .from('student_training_progress')
      .select('*')
      .limit(1)

    if (progressError) {
      console.log('❌ Tabela student_training_progress não encontrada:', progressError.message)
    } else {
      console.log('✅ Tabela student_training_progress existe')
    }

  } catch (error) {
    console.error('💥 Erro ao verificar banco:', error.message)
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}