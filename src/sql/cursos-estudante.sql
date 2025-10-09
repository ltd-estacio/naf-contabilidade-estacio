-- =====================================================
-- SISTEMA DE TREINAMENTOS NAF - BANCO DE DADOS COMPLETO
-- =====================================================
-- Este arquivo contém todas as tabelas necessárias para
-- o sistema de treinamentos com progresso individual por aluno
-- =====================================================

-- 1. TABELA DE CURSOS
-- Armazena informações sobre os cursos disponíveis
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'internal', 'external', 'manual'
    type VARCHAR(100) NOT NULL, -- 'power_bi', 'cpf', 'imposto_renda', 'external_course', 'manual'
    cover_image TEXT,
    difficulty_level VARCHAR(50) DEFAULT 'iniciante', -- 'iniciante', 'intermediario', 'avancado'
    estimated_duration INTEGER DEFAULT 0, -- em minutos
    is_mandatory BOOLEAN DEFAULT false,
    external_url TEXT, -- para cursos externos
    instructor_name VARCHAR(255),
    skills_learned TEXT[], -- array de habilidades
    prerequisites TEXT[], -- array de pré-requisitos
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'draft', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE TEMAS DO CURSO
-- Cada curso tem 4 temas
CREATE TABLE IF NOT EXISTS course_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme_order INTEGER NOT NULL,
    estimated_duration INTEGER DEFAULT 0, -- em minutos
    learning_objectives TEXT[], -- objetivos de aprendizagem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE MÓDULOS DO TEMA
-- Cada tema tem 6 módulos
CREATE TABLE IF NOT EXISTS theme_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    theme_id UUID REFERENCES course_themes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL, -- conteúdo estruturado do módulo
    module_order INTEGER NOT NULL,
    module_type VARCHAR(50) DEFAULT 'lesson', -- 'lesson', 'exercise', 'quiz', 'video', 'reading'
    estimated_duration INTEGER DEFAULT 0, -- em minutos
    video_url TEXT,
    resources JSONB, -- recursos adicionais, links, etc.
    learning_objectives TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE EXERCÍCIOS DOS MÓDULOS
-- Exercícios práticos para cada módulo
CREATE TABLE IF NOT EXISTS module_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES theme_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'fill_blank', 'essay'
    question_data JSONB NOT NULL, -- estrutura da pergunta e opções
    correct_answer JSONB, -- resposta correta
    explanation TEXT, -- explicação da resposta
    points INTEGER DEFAULT 10,
    difficulty VARCHAR(50) DEFAULT 'easy', -- 'easy', 'medium', 'hard'
    exercise_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE PROGRESSO INDIVIDUAL POR ALUNO
-- =====================================================

-- 5. TABELA DE MATRÍCULA E PROGRESSO DO ESTUDANTE EM CURSOS
-- Registra a matrícula e progresso geral de cada aluno em cada curso
CREATE TABLE IF NOT EXISTS student_course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL, -- referência ao ID do estudante
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_theme_id UUID REFERENCES course_themes(id),
    current_module_id UUID REFERENCES theme_modules(id),
    overall_progress DECIMAL(5,2) DEFAULT 0.00, -- porcentagem 0-100
    total_time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'paused', 'dropped'
    certificate_issued BOOLEAN DEFAULT false,
    final_grade DECIMAL(5,2), -- nota final 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id) -- Um aluno só pode se matricular uma vez em cada curso
);

-- 6. TABELA DE PROGRESSO DO ESTUDANTE EM TEMAS
-- Registra o progresso individual de cada aluno em cada tema
CREATE TABLE IF NOT EXISTS student_theme_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    theme_id UUID REFERENCES course_themes(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES student_course_enrollments(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress DECIMAL(5,2) DEFAULT 0.00, -- porcentagem 0-100
    time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, theme_id) -- Um aluno só pode ter um progresso por tema
);

-- 7. TABELA DE PROGRESSO DO ESTUDANTE EM MÓDULOS
-- Registra o progresso individual de cada aluno em cada módulo
CREATE TABLE IF NOT EXISTS student_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    module_id UUID REFERENCES theme_modules(id) ON DELETE CASCADE,
    theme_progress_id UUID REFERENCES student_theme_progress(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    notes TEXT, -- anotações do estudante
    attempts INTEGER DEFAULT 0, -- número de tentativas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, module_id) -- Um aluno só pode ter um progresso por módulo
);

-- 8. TABELA DE RESPOSTAS DOS EXERCÍCIOS
-- Registra as respostas de cada aluno aos exercícios
CREATE TABLE IF NOT EXISTS student_exercise_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    exercise_id UUID REFERENCES module_exercises(id) ON DELETE CASCADE,
    module_progress_id UUID REFERENCES student_module_progress(id) ON DELETE CASCADE,
    answer_data JSONB NOT NULL, -- resposta do estudante
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    time_taken INTEGER, -- tempo em segundos
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE CERTIFICADOS
-- Registra os certificados emitidos para cada aluno
CREATE TABLE IF NOT EXISTS student_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES student_course_enrollments(id) ON DELETE CASCADE,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    final_score DECIMAL(5,2),
    total_time_spent INTEGER, -- em minutos
    certificate_url TEXT, -- URL do certificado PDF
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE AVALIAÇÕES DE CURSO
-- Permite que os alunos avaliem os cursos após conclusão
CREATE TABLE IF NOT EXISTS course_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES student_course_enrollments(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 estrelas
    feedback TEXT,
    would_recommend BOOLEAN,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id) -- Um aluno só pode avaliar cada curso uma vez
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_student_id ON student_course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_course_id ON student_course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_status ON student_course_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_student_theme_progress_student_id ON student_theme_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_theme_progress_theme_id ON student_theme_progress(theme_id);
CREATE INDEX IF NOT EXISTS idx_student_theme_progress_status ON student_theme_progress(status);

CREATE INDEX IF NOT EXISTS idx_student_module_progress_student_id ON student_module_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_module_id ON student_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_status ON student_module_progress(status);

CREATE INDEX IF NOT EXISTS idx_course_themes_course_id ON course_themes(course_id);
CREATE INDEX IF NOT EXISTS idx_theme_modules_theme_id ON theme_modules(theme_id);
CREATE INDEX IF NOT EXISTS idx_module_exercises_module_id ON module_exercises(module_id);

CREATE INDEX IF NOT EXISTS idx_student_exercise_answers_student_id ON student_exercise_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exercise_answers_exercise_id ON student_exercise_answers(exercise_id);

CREATE INDEX IF NOT EXISTS idx_course_evaluations_course_id ON course_evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_student_id ON student_certificates(student_id);

-- =====================================================
-- FUNÇÕES E TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_course_themes_updated_at BEFORE UPDATE ON course_themes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_theme_modules_updated_at BEFORE UPDATE ON theme_modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_course_enrollments_updated_at BEFORE UPDATE ON student_course_enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_theme_progress_updated_at BEFORE UPDATE ON student_theme_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_module_progress_updated_at BEFORE UPDATE ON student_module_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA CALCULAR PROGRESSO AUTOMATICAMENTE
-- =====================================================

-- Função para atualizar o progresso do tema quando um módulo é completado
CREATE OR REPLACE FUNCTION update_theme_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_modules INTEGER;
    completed_modules INTEGER;
    theme_progress_percentage DECIMAL(5,2);
BEGIN
    -- Contar total de módulos no tema
    SELECT COUNT(*) INTO total_modules
    FROM theme_modules tm
    WHERE tm.theme_id = (SELECT theme_id FROM theme_modules WHERE id = NEW.module_id);

    -- Contar módulos completados pelo estudante neste tema
    SELECT COUNT(*) INTO completed_modules
    FROM student_module_progress smp
    JOIN theme_modules tm ON smp.module_id = tm.id
    WHERE smp.student_id = NEW.student_id
    AND tm.theme_id = (SELECT theme_id FROM theme_modules WHERE id = NEW.module_id)
    AND smp.status = 'completed';

    -- Calcular porcentagem de progresso
    IF total_modules > 0 THEN
        theme_progress_percentage := (completed_modules::DECIMAL / total_modules::DECIMAL) * 100;
    ELSE
        theme_progress_percentage := 0;
    END IF;

    -- Atualizar progresso do tema
    UPDATE student_theme_progress
    SET progress = theme_progress_percentage,
        status = CASE
            WHEN theme_progress_percentage = 100 THEN 'completed'
            WHEN theme_progress_percentage > 0 THEN 'in_progress'
            ELSE 'not_started'
        END,
        completed_at = CASE
            WHEN theme_progress_percentage = 100 THEN NOW()
            ELSE NULL
        END
    WHERE student_id = NEW.student_id
    AND theme_id = (SELECT theme_id FROM theme_modules WHERE id = NEW.module_id);

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar progresso do tema quando módulo é completado
CREATE TRIGGER update_theme_progress_trigger
    AFTER UPDATE ON student_module_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE PROCEDURE update_theme_progress();

-- Função para atualizar o progresso do curso quando um tema é completado
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_themes INTEGER;
    completed_themes INTEGER;
    course_progress_percentage DECIMAL(5,2);
    course_id_var UUID;
BEGIN
    -- Obter course_id
    SELECT course_id INTO course_id_var FROM course_themes WHERE id = NEW.theme_id;

    -- Contar total de temas no curso
    SELECT COUNT(*) INTO total_themes FROM course_themes WHERE course_id = course_id_var;

    -- Contar temas completados pelo estudante neste curso
    SELECT COUNT(*) INTO completed_themes
    FROM student_theme_progress stp
    JOIN course_themes ct ON stp.theme_id = ct.id
    WHERE stp.student_id = NEW.student_id
    AND ct.course_id = course_id_var
    AND stp.status = 'completed';

    -- Calcular porcentagem de progresso
    IF total_themes > 0 THEN
        course_progress_percentage := (completed_themes::DECIMAL / total_themes::DECIMAL) * 100;
    ELSE
        course_progress_percentage := 0;
    END IF;

    -- Atualizar progresso do curso
    UPDATE student_course_enrollments
    SET overall_progress = course_progress_percentage,
        status = CASE
            WHEN course_progress_percentage = 100 THEN 'completed'
            WHEN course_progress_percentage > 0 THEN 'in_progress'
            ELSE 'enrolled'
        END,
        completed_at = CASE
            WHEN course_progress_percentage = 100 THEN NOW()
            ELSE NULL
        END
    WHERE student_id = NEW.student_id AND course_id = course_id_var;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar progresso do curso quando tema é completado
CREATE TRIGGER update_course_progress_trigger
    AFTER UPDATE ON student_theme_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE PROCEDURE update_course_progress();

-- =====================================================
-- INSERÇÃO DOS DADOS INICIAIS DOS CURSOS
-- =====================================================

-- CURSO 1: POWER BI
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440001',
'Aprenda sobre Power BI',
'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais. Aprenda desde os conceitos básicos até técnicas avançadas de visualização de dados.',
'internal',
'power_bi',
'iniciante',
480, -- 8 horas
true,
'Prof. Ana Silva - Especialista em BI',
ARRAY['Análise de Dados', 'Dashboards Interativos', 'DAX', 'Power Query', 'Visualização de Dados', 'Business Intelligence'],
ARRAY['Conhecimentos básicos de Excel', 'Noções de análise de dados'],
'active')
ON CONFLICT (id) DO NOTHING;

-- CURSO 2: CADASTRO DE CPF
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440002',
'Cadastro de CPF',
'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF. Aprenda toda a legislação e processos práticos para orientar contribuintes.',
'internal',
'cpf',
'iniciante',
360, -- 6 horas
true,
'Prof. Carlos Oliveira - Especialista Tributário',
ARRAY['Legislação do CPF', 'Processos de Cadastro', 'Regularização', 'Atendimento ao Contribuinte', 'Documentação Necessária', 'Sistemas da Receita Federal'],
ARRAY['Conhecimentos básicos de tributação'],
'active')
ON CONFLICT (id) DO NOTHING;

-- CURSO 3: IMPOSTO DE RENDA
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440003',
'Imposto de Renda',
'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física. Aprenda todos os aspectos da declaração, desde o preenchimento até estratégias de planejamento tributário.',
'internal',
'imposto_renda',
'intermediario',
540, -- 9 horas
true,
'Profa. Maria Santos - Contadora e Consultora Tributária',
ARRAY['DIRPF', 'Planejamento Tributário', 'Dedução de Despesas', 'Bens e Direitos', 'Rendimentos', 'Legislação Tributária', 'Programa IRPF'],
ARRAY['Conhecimentos básicos de contabilidade', 'Noções de tributação'],
'active')
ON CONFLICT (id) DO NOTHING;

-- TEMAS DO CURSO POWER BI
INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
'Fundamentos do Power BI',
'Introdução aos conceitos básicos do Microsoft Power BI e sua importância no mundo dos negócios.',
1, 120,
ARRAY['Entender o que é Business Intelligence', 'Conhecer a interface do Power BI Desktop', 'Compreender os diferentes componentes do Power BI', 'Configurar o ambiente de trabalho'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
'Conectando e Preparando Dados',
'Aprenda a conectar-se a diferentes fontes de dados e preparar os dados para análise.',
2, 120,
ARRAY['Conectar a diversas fontes de dados', 'Usar o Power Query Editor', 'Limpar e transformar dados', 'Criar relacionamentos entre tabelas'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
'Visualizações e Dashboards',
'Criação de visualizações eficazes e dashboards interativos.',
3, 120,
ARRAY['Criar gráficos e visualizações', 'Usar filtros e segmentadores', 'Projetar dashboards eficazes', 'Aplicar princípios de design'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
'DAX e Análises Avançadas',
'Introdução à linguagem DAX e técnicas avançadas de análise.',
4, 120,
ARRAY['Compreender a linguagem DAX', 'Criar medidas calculadas', 'Usar funções de tempo inteligente', 'Implementar análises avançadas'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- NOTA: Para economia de espaço, incluí apenas os temas.
-- Os módulos e exercícios seguem o mesmo padrão.
-- Execute este arquivo no SQL Editor do Supabase para criar
-- toda a estrutura necessária do banco de dados.
-- =====================================================