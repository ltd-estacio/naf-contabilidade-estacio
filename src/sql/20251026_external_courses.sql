-- Script para criar tabela de Cursos Externos
-- Data: 26/10/2025

-- Verificar se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'external_courses') THEN
        RAISE NOTICE '📚 Criando tabela external_courses...';
    ELSE
        RAISE NOTICE '⚠️ Tabela external_courses já existe!';
    END IF;
END $$;

-- Criar tabela de Cursos Externos
CREATE TABLE IF NOT EXISTS external_courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_url VARCHAR(500) NOT NULL,
  platform VARCHAR(100), -- Ex: Coursera, Udemy, YouTube, etc
  category VARCHAR(100), -- Ex: Contabilidade, Fiscal, Tributário, etc
  difficulty_level VARCHAR(50), -- Iniciante, Intermediário, Avançado
  duration VARCHAR(100), -- Ex: 4 horas, 2 semanas, etc
  is_active BOOLEAN DEFAULT true,
  thumbnail_url VARCHAR(500),
  created_by VARCHAR(100), -- ID do coordenador que criou
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  CONSTRAINT external_courses_url_check CHECK (course_url ~ '^https?://')
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_external_courses_category ON external_courses(category);
CREATE INDEX IF NOT EXISTS idx_external_courses_active ON external_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_external_courses_created_at ON external_courses(created_at DESC);

-- Comentários descritivos
COMMENT ON TABLE external_courses IS 'Armazena links e informações de cursos externos para estudantes';
COMMENT ON COLUMN external_courses.title IS 'Título do curso';
COMMENT ON COLUMN external_courses.description IS 'Descrição detalhada do curso';
COMMENT ON COLUMN external_courses.course_url IS 'URL do curso externo';
COMMENT ON COLUMN external_courses.platform IS 'Plataforma onde o curso está hospedado';
COMMENT ON COLUMN external_courses.category IS 'Categoria/área do curso';
COMMENT ON COLUMN external_courses.is_active IS 'Se o curso está ativo e visível para estudantes';
COMMENT ON COLUMN external_courses.views_count IS 'Número de visualizações do curso';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_external_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_external_courses_timestamp
BEFORE UPDATE ON external_courses
FOR EACH ROW
EXECUTE FUNCTION update_external_courses_updated_at();

-- Inserir alguns cursos de exemplo
INSERT INTO external_courses (title, description, course_url, platform, category, difficulty_level, duration, created_by)
VALUES 
  (
    'Contabilidade Básica para Iniciantes',
    'Curso completo de contabilidade básica, incluindo conceitos fundamentais, demonstrações financeiras e análise de balanços.',
    'https://www.youtube.com/watch?v=exemplo1',
    'YouTube',
    'Contabilidade',
    'Iniciante',
    '8 horas',
    'system'
  ),
  (
    'Legislação Tributária Brasileira',
    'Entenda a estrutura tributária do Brasil, incluindo impostos federais, estaduais e municipais.',
    'https://www.coursera.org/learn/exemplo2',
    'Coursera',
    'Tributário',
    'Intermediário',
    '4 semanas',
    'system'
  ),
  (
    'Declaração de Imposto de Renda - Guia Completo',
    'Aprenda a preencher e enviar a declaração de imposto de renda de forma correta e eficiente.',
    'https://www.udemy.com/course/exemplo3',
    'Udemy',
    'Fiscal',
    'Iniciante',
    '3 horas',
    'system'
  );

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_cursos FROM external_courses;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela external_courses criada/verificada com sucesso!';
  RAISE NOTICE '📚 Cursos de exemplo inseridos';
  RAISE NOTICE '🔍 Índices criados para melhor performance';
  RAISE NOTICE '⚙️ Trigger de updated_at configurado';
END $$;

-- Grant de permissões (ajuste conforme necessário)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON external_courses TO authenticated;
-- GRANT USAGE, SELECT ON SEQUENCE external_courses_id_seq TO authenticated;
