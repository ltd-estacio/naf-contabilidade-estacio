import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando setup das tabelas de cursos...')

    // 1. Verificar se as tabelas já existem
    const { data: existingCourses, error: checkError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('📋 Tabelas já existem, inserindo dados...')
      return await insertCourseData()
    }

    console.log('📋 Criando tabelas...')

    // 2. Criar tabela de cursos
    const createCoursesTable = `
      CREATE TABLE IF NOT EXISTS courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        cover_image TEXT,
        difficulty_level VARCHAR(50) DEFAULT 'iniciante',
        estimated_duration INTEGER DEFAULT 0,
        is_mandatory BOOLEAN DEFAULT false,
        external_url TEXT,
        instructor_name VARCHAR(255),
        skills_learned TEXT[],
        prerequisites TEXT[],
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const createThemesTable = `
      CREATE TABLE IF NOT EXISTS course_themes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        theme_order INTEGER NOT NULL,
        estimated_duration INTEGER DEFAULT 0,
        learning_objectives TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const createModulesTable = `
      CREATE TABLE IF NOT EXISTS theme_modules (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        theme_id UUID REFERENCES course_themes(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB NOT NULL,
        module_order INTEGER NOT NULL,
        module_type VARCHAR(50) DEFAULT 'lesson',
        estimated_duration INTEGER DEFAULT 0,
        video_url TEXT,
        resources JSONB,
        learning_objectives TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const createProgressTable = `
      CREATE TABLE IF NOT EXISTS student_course_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        student_id UUID NOT NULL,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        current_theme_id UUID REFERENCES course_themes(id),
        current_module_id UUID REFERENCES theme_modules(id),
        overall_progress DECIMAL(5,2) DEFAULT 0.00,
        total_time_spent INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'not_started',
        certificate_issued BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(student_id, course_id)
      );
    `

    const createThemeProgressTable = `
      CREATE TABLE IF NOT EXISTS student_theme_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        student_id UUID NOT NULL,
        theme_id UUID REFERENCES course_themes(id) ON DELETE CASCADE,
        course_progress_id UUID REFERENCES student_course_progress(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        progress DECIMAL(5,2) DEFAULT 0.00,
        time_spent INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'not_started',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(student_id, theme_id)
      );
    `

    const createModuleProgressTable = `
      CREATE TABLE IF NOT EXISTS student_module_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        student_id UUID NOT NULL,
        module_id UUID REFERENCES theme_modules(id) ON DELETE CASCADE,
        theme_progress_id UUID REFERENCES student_theme_progress(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        time_spent INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'not_started',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(student_id, module_id)
      );
    `

    // Executar as queries usando raw SQL
    const tables = [
      createCoursesTable,
      createThemesTable,
      createModulesTable,
      createProgressTable,
      createThemeProgressTable,
      createModuleProgressTable
    ]

    for (const tableSQL of tables) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: tableSQL })
      if (error) {
        console.error('❌ Erro ao criar tabela:', error)
      }
    }

    console.log('✅ Tabelas criadas com sucesso!')

    // 3. Inserir dados dos cursos
    return await insertCourseData()

  } catch (error) {
    console.error('💥 Erro no setup:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

async function insertCourseData() {
  try {
    console.log('📚 Inserindo dados dos cursos...')

    // Dados dos 3 cursos principais
    const courses = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Aprenda sobre Power BI',
        description: 'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais. Aprenda desde os conceitos básicos até técnicas avançadas de visualização de dados.',
        category: 'internal',
        type: 'power_bi',
        difficulty_level: 'iniciante',
        estimated_duration: 480,
        is_mandatory: true,
        instructor_name: 'Prof. Ana Silva - Especialista em BI',
        skills_learned: ['Análise de Dados', 'Dashboards Interativos', 'DAX', 'Power Query', 'Visualização de Dados', 'Business Intelligence'],
        prerequisites: ['Conhecimentos básicos de Excel', 'Noções de análise de dados'],
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Cadastro de CPF',
        description: 'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF. Aprenda toda a legislação e processos práticos para orientar contribuintes.',
        category: 'internal',
        type: 'cpf',
        difficulty_level: 'iniciante',
        estimated_duration: 360,
        is_mandatory: true,
        instructor_name: 'Prof. Carlos Oliveira - Especialista Tributário',
        skills_learned: ['Legislação do CPF', 'Processos de Cadastro', 'Regularização', 'Atendimento ao Contribuinte', 'Documentação Necessária', 'Sistemas da Receita Federal'],
        prerequisites: ['Conhecimentos básicos de tributação'],
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Imposto de Renda',
        description: 'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física. Aprenda todos os aspectos da declaração, desde o preenchimento até estratégias de planejamento tributário.',
        category: 'internal',
        type: 'imposto_renda',
        difficulty_level: 'intermediario',
        estimated_duration: 540,
        is_mandatory: true,
        instructor_name: 'Profa. Maria Santos - Contadora e Consultora Tributária',
        skills_learned: ['DIRPF', 'Planejamento Tributário', 'Dedução de Despesas', 'Bens e Direitos', 'Rendimentos', 'Legislação Tributária', 'Programa IRPF'],
        prerequisites: ['Conhecimentos básicos de contabilidade', 'Noções de tributação'],
        status: 'active'
      }
    ]

    // Inserir cursos
    for (const course of courses) {
      const { error } = await supabaseAdmin
        .from('courses')
        .upsert(course)

      if (error) {
        console.error(`❌ Erro ao inserir curso ${course.title}:`, error)
      } else {
        console.log(`✅ Curso inserido: ${course.title}`)
      }
    }

    // Inserir temas para Power BI
    const powerBIThemes = [
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Fundamentos do Power BI',
        description: 'Introdução aos conceitos básicos do Microsoft Power BI e sua importância no mundo dos negócios.',
        theme_order: 1,
        estimated_duration: 120,
        learning_objectives: ['Entender o que é Business Intelligence', 'Conhecer a interface do Power BI Desktop', 'Compreender os diferentes componentes do Power BI', 'Configurar o ambiente de trabalho']
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Conectando e Preparando Dados',
        description: 'Aprenda a conectar-se a diferentes fontes de dados e preparar os dados para análise.',
        theme_order: 2,
        estimated_duration: 120,
        learning_objectives: ['Conectar a diversas fontes de dados', 'Usar o Power Query Editor', 'Limpar e transformar dados', 'Criar relacionamentos entre tabelas']
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440003',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Visualizações e Dashboards',
        description: 'Criação de visualizações eficazes e dashboards interativos.',
        theme_order: 3,
        estimated_duration: 120,
        learning_objectives: ['Criar gráficos e visualizações', 'Usar filtros e segmentadores', 'Projetar dashboards eficazes', 'Aplicar princípios de design']
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440004',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'DAX e Análises Avançadas',
        description: 'Introdução à linguagem DAX e técnicas avançadas de análise.',
        theme_order: 4,
        estimated_duration: 120,
        learning_objectives: ['Compreender a linguagem DAX', 'Criar medidas calculadas', 'Usar funções de tempo inteligente', 'Implementar análises avançadas']
      }
    ]

    // Inserir temas
    for (const theme of powerBIThemes) {
      const { error } = await supabaseAdmin
        .from('course_themes')
        .upsert(theme)

      if (error) {
        console.error(`❌ Erro ao inserir tema ${theme.title}:`, error)
      } else {
        console.log(`✅ Tema inserido: ${theme.title}`)
      }
    }

    // Inserir módulos de exemplo para o primeiro tema
    const sampleModules = [
      {
        id: '750e8400-e29b-41d4-a716-446655440001',
        theme_id: '650e8400-e29b-41d4-a716-446655440001',
        title: 'O que é Business Intelligence',
        description: 'Introdução aos conceitos de BI e sua importância no mundo dos negócios.',
        content: {
          type: 'text',
          content: 'Business Intelligence (BI) é um conjunto de metodologias, processos, arquiteturas e tecnologias que transformam dados brutos em informações relevantes e úteis para fins de análise de negócios.'
        },
        module_order: 1,
        module_type: 'lesson',
        estimated_duration: 20,
        learning_objectives: ['Definir Business Intelligence', 'Identificar componentes do BI', 'Compreender a importância do BI']
      },
      {
        id: '750e8400-e29b-41d4-a716-446655440002',
        theme_id: '650e8400-e29b-41d4-a716-446655440001',
        title: 'Conhecendo o Power BI',
        description: 'Visão geral da ferramenta Microsoft Power BI e seus componentes.',
        content: {
          type: 'video',
          title: 'Introdução ao Power BI',
          url: 'https://www.youtube.com/embed/yKTSLffVGbk',
          duration: '10:00'
        },
        module_order: 2,
        module_type: 'lesson',
        estimated_duration: 25,
        learning_objectives: ['Identificar componentes do Power BI', 'Compreender diferenças entre Desktop e Service']
      }
    ]

    for (const module of sampleModules) {
      const { error } = await supabaseAdmin
        .from('theme_modules')
        .upsert(module)

      if (error) {
        console.error(`❌ Erro ao inserir módulo ${module.title}:`, error)
      } else {
        console.log(`✅ Módulo inserido: ${module.title}`)
      }
    }

    console.log('✅ Setup concluído com sucesso!')

    return NextResponse.json({
      message: 'Setup das tabelas de cursos concluído com sucesso',
      courses: courses.length,
      themes: powerBIThemes.length,
      modules: sampleModules.length
    })

  } catch (error) {
    console.error('💥 Erro ao inserir dados:', error)
    return NextResponse.json(
      { message: 'Erro ao inserir dados dos cursos', error: String(error) },
      { status: 500 }
    )
  }
}