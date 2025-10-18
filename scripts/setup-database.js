// Script para configurar o banco de dados Supabase com a estrutura de treinamentos
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase
const supabaseUrl = 'https://gaevnrnthqxiwrdypour.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...')

  try {
    // 1. Ler e executar script de criação de tabelas
    console.log('📋 Criando estrutura de tabelas...')
    const createTablesSQL = fs.readFileSync(path.join(__dirname, 'create-training-tables.sql'), 'utf8')

    // Dividir o SQL em comandos individuais e executar cada um
    const commands = createTablesSQL.split(';').filter(cmd => cmd.trim())

    for (const command of commands) {
      if (command.trim()) {
        console.log('🔧 Executando comando SQL...')
        const { data, error } = await supabase.rpc('exec_sql', { sql: command.trim() })
        if (error) {
          console.error('❌ Erro ao executar comando:', error.message)
          // Continue com próximo comando mesmo se houver erro (algumas tabelas podem já existir)
        }
      }
    }

    // 2. Inserir dados dos cursos
    console.log('📚 Inserindo dados dos cursos...')
    const seedCoursesSQL = fs.readFileSync(path.join(__dirname, 'seed-courses.sql'), 'utf8')
    const courseCommands = seedCoursesSQL.split(';').filter(cmd => cmd.trim())

    for (const command of courseCommands) {
      if (command.trim()) {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command.trim() })
        if (error) {
          console.error('❌ Erro ao inserir curso:', error.message)
        }
      }
    }

    // 3. Inserir dados dos módulos (apenas alguns exemplos por limitação de tamanho)
    console.log('📖 Inserindo módulos de exemplo...')
    const seedModulesSQL = fs.readFileSync(path.join(__dirname, 'seed-modules.sql'), 'utf8')
    const moduleCommands = seedModulesSQL.split(';').filter(cmd => cmd.trim()).slice(0, 10) // Apenas primeiros 10 comandos

    for (const command of moduleCommands) {
      if (command.trim()) {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command.trim() })
        if (error) {
          console.error('❌ Erro ao inserir módulo:', error.message)
        }
      }
    }

    console.log('✅ Configuração do banco de dados concluída!')
    console.log('📊 Verificando dados inseridos...')

    // Verificar se os dados foram inseridos corretamente
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, category')

    if (coursesError) {
      console.error('❌ Erro ao verificar cursos:', coursesError.message)
    } else {
      console.log(`✅ ${courses.length} cursos inseridos:`)
      courses.forEach(course => {
        console.log(`  - ${course.title} (${course.category})`)
      })
    }

    const { data: themes, error: themesError } = await supabase
      .from('course_themes')
      .select('id, title, course_id')

    if (themesError) {
      console.error('❌ Erro ao verificar temas:', themesError.message)
    } else {
      console.log(`✅ ${themes.length} temas inseridos`)
    }

  } catch (error) {
    console.error('💥 Erro na configuração:', error.message)
  }
}

// Função alternativa usando inserções diretas via Supabase (caso o RPC não funcione)
async function setupDatabaseDirect() {
  console.log('🚀 Configuração alternativa usando inserções diretas...')

  try {
    // Inserir cursos diretamente
    console.log('📚 Inserindo cursos...')

    const courses = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Aprenda sobre Power BI',
        description: 'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais.',
        category: 'internal',
        type: 'power_bi',
        difficulty_level: 'iniciante',
        estimated_duration: 480,
        is_mandatory: true,
        instructor_name: 'Prof. Ana Silva - Especialista em BI',
        skills_learned: ['Análise de Dados', 'Dashboards Interativos', 'DAX', 'Power Query'],
        prerequisites: ['Conhecimentos básicos de Excel'],
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Cadastro de CPF',
        description: 'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF.',
        category: 'internal',
        type: 'cpf',
        difficulty_level: 'iniciante',
        estimated_duration: 360,
        is_mandatory: true,
        instructor_name: 'Prof. Carlos Oliveira - Especialista Tributário',
        skills_learned: ['Legislação do CPF', 'Processos de Cadastro', 'Regularização'],
        prerequisites: ['Conhecimentos básicos de tributação'],
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Imposto de Renda',
        description: 'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física.',
        category: 'internal',
        type: 'imposto_renda',
        difficulty_level: 'intermediario',
        estimated_duration: 540,
        is_mandatory: true,
        instructor_name: 'Profa. Maria Santos - Contadora e Consultora Tributária',
        skills_learned: ['DIRPF', 'Planejamento Tributário', 'Dedução de Despesas'],
        prerequisites: ['Conhecimentos básicos de contabilidade'],
        status: 'active'
      }
    ]

    for (const course of courses) {
      const { data, error } = await supabase
        .from('courses')
        .upsert(course)

      if (error) {
        console.error(`❌ Erro ao inserir curso ${course.title}:`, error.message)
      } else {
        console.log(`✅ Curso inserido: ${course.title}`)
      }
    }

    // Inserir temas
    console.log('🎯 Inserindo temas...')
    const themes = [
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Fundamentos do Power BI',
        description: 'Introdução aos conceitos básicos do Microsoft Power BI.',
        theme_order: 1,
        estimated_duration: 120,
        learning_objectives: ['Entender o que é Business Intelligence', 'Conhecer a interface do Power BI Desktop']
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440005',
        course_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Legislação e Fundamentos do CPF',
        description: 'Base legal e conceitos fundamentais sobre o Cadastro de Pessoas Físicas.',
        theme_order: 1,
        estimated_duration: 90,
        learning_objectives: ['Conhecer a legislação do CPF', 'Entender a importância do CPF']
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440009',
        course_id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Introdução ao Imposto de Renda',
        description: 'Conceitos fundamentais sobre o Imposto de Renda Pessoa Física.',
        theme_order: 1,
        estimated_duration: 135,
        learning_objectives: ['Entender o sistema tributário brasileiro', 'Conhecer a obrigatoriedade de declarar']
      }
    ]

    for (const theme of themes) {
      const { data, error } = await supabase
        .from('course_themes')
        .upsert(theme)

      if (error) {
        console.error(`❌ Erro ao inserir tema ${theme.title}:`, error.message)
      } else {
        console.log(`✅ Tema inserido: ${theme.title}`)
      }
    }

    console.log('✅ Configuração alternativa concluída!')

  } catch (error) {
    console.error('💥 Erro na configuração alternativa:', error.message)
  }
}

// Executar configuração
if (require.main === module) {
  setupDatabaseDirect()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { setupDatabase, setupDatabaseDirect }