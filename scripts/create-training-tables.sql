-- Criação das tabelas para o sistema de treinamentos NAF

-- Tabela de Cursos
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
    prerequisites TEXT[],
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'draft', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Temas do Curso
CREATE TABLE IF NOT EXISTS course_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme_order INTEGER NOT NULL,
    estimated_duration INTEGER DEFAULT 0, -- em minutos
    learning_objectives TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Módulos do Tema
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

-- Tabela de Exercícios
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

-- Tabela de Progresso do Estudante em Cursos
CREATE TABLE IF NOT EXISTS student_course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL, -- referência ao usuário
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_theme_id UUID REFERENCES course_themes(id),
    current_module_id UUID REFERENCES theme_modules(id),
    overall_progress DECIMAL(5,2) DEFAULT 0.00, -- porcentagem 0-100
    total_time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'paused'
    certificate_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Tabela de Progresso do Estudante em Temas
CREATE TABLE IF NOT EXISTS student_theme_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    theme_id UUID REFERENCES course_themes(id) ON DELETE CASCADE,
    course_progress_id UUID REFERENCES student_course_progress(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress DECIMAL(5,2) DEFAULT 0.00, -- porcentagem 0-100
    time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, theme_id)
);

-- Tabela de Progresso do Estudante em Módulos
CREATE TABLE IF NOT EXISTS student_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    module_id UUID REFERENCES theme_modules(id) ON DELETE CASCADE,
    theme_progress_id UUID REFERENCES student_theme_progress(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started',
    notes TEXT, -- anotações do estudante
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, module_id)
);

-- Tabela de Respostas dos Exercícios
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

-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS student_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    course_progress_id UUID REFERENCES student_course_progress(id) ON DELETE CASCADE,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    final_score DECIMAL(5,2),
    total_time_spent INTEGER, -- em minutos
    certificate_url TEXT, -- URL do certificado PDF
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_student_course_progress_student_id ON student_course_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_progress_course_id ON student_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_student_theme_progress_student_id ON student_theme_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_student_id ON student_module_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_course_themes_course_id ON course_themes(course_id);
CREATE INDEX IF NOT EXISTS idx_theme_modules_theme_id ON theme_modules(theme_id);
CREATE INDEX IF NOT EXISTS idx_module_exercises_module_id ON module_exercises(module_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_course_themes_updated_at BEFORE UPDATE ON course_themes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_theme_modules_updated_at BEFORE UPDATE ON theme_modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_course_progress_updated_at BEFORE UPDATE ON student_course_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_theme_progress_updated_at BEFORE UPDATE ON student_theme_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_module_progress_updated_at BEFORE UPDATE ON student_module_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();