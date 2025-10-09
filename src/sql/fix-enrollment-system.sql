-- Script SQL para corrigir o sistema de matrículas e progresso
-- Baseado no erro: tabela student_course_enrollments não existe
-- Execução: psql -d naf_contabil -f sql/fix-enrollment-system.sql

-- 1. A tabela student_course_enrollments já existe no banco
-- Vamos apenas adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar colunas que podem não existir na tabela existente
    BEGIN
        ALTER TABLE student_course_enrollments ADD COLUMN IF NOT EXISTS enrollment_notes TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Verificar se a coluna status já existe, senão criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'student_course_enrollments'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE student_course_enrollments ADD COLUMN status VARCHAR(50) DEFAULT 'enrolled';
    END IF;

    RAISE NOTICE 'Tabela student_course_enrollments atualizada com sucesso';
END $$;

-- 2. As tabelas student_course_progress e student_theme_progress serão criadas posteriormente se necessário
-- Removido para evitar erro de tabela não existente

-- 3. Criar tabela específica para progresso de módulos com referência a enrollment
CREATE TABLE IF NOT EXISTS student_module_progress_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    module_id UUID REFERENCES theme_modules(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES student_course_enrollments(id) ON DELETE CASCADE,
    theme_progress_id UUID REFERENCES student_theme_progress(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- em minutos
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, module_id, enrollment_id)
);

-- 4. Criar tabela para tracking em tempo real de progresso
CREATE TABLE IF NOT EXISTS student_progress_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    enrollment_id UUID REFERENCES student_course_enrollments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    current_theme_id UUID REFERENCES course_themes(id),
    current_module_id UUID REFERENCES theme_modules(id),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_modules_completed INTEGER DEFAULT 0,
    total_modules_in_course INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    last_streak_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, enrollment_id)
);

-- 5. Criar view para consolidar informações de progresso (com verificação de existência das tabelas)
DO $$
BEGIN
    -- Verificar se as tabelas necessárias existem antes de criar a view
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_course_enrollments')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress_tracking') THEN

        -- Criar a view apenas se as tabelas existirem
        EXECUTE 'CREATE OR REPLACE VIEW student_enrollment_progress AS
        SELECT
            e.id as enrollment_id,
            e.student_id,
            e.course_id,
            COALESCE(c.title, ''Curso Não Encontrado'') as course_title,
            COALESCE(c.description, '''') as course_description,
            COALESCE(c.category, ''unknown'') as course_category,
            COALESCE(c.estimated_duration, 0) as course_duration,
            e.status as enrollment_status,
            e.enrollment_date,
            e.completed_at,
            e.overall_progress,
            e.certificate_issued,
            e.current_theme_id,
            e.current_module_id,
            e.started_at as last_activity_at,
            COALESCE(pt.total_modules_completed, 0) as total_modules_completed,
            COALESCE(pt.total_modules_in_course, 0) as total_modules_in_course,
            COALESCE(pt.current_streak_days, 0) as current_streak_days,
            -- Calcular progresso real baseado nos módulos ou usar o existing overall_progress
            CASE
                WHEN pt.total_modules_in_course > 0
                THEN ROUND((pt.total_modules_completed::DECIMAL / pt.total_modules_in_course::DECIMAL) * 100, 2)
                ELSE COALESCE(e.overall_progress, 0)
            END as calculated_progress
        FROM student_course_enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN student_progress_tracking pt ON e.id = pt.enrollment_id';

        RAISE NOTICE 'View student_enrollment_progress criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabelas necessárias não existem ainda. View será criada posteriormente.';
    END IF;
END $$;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_student_id ON student_course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_course_id ON student_course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_status ON student_course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_student_progress_tracking_student_id ON student_progress_tracking(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_tracking_enrollment_id ON student_progress_tracking(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_v2_student_id ON student_module_progress_v2(student_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_v2_enrollment_id ON student_module_progress_v2(enrollment_id);

-- 7. Função para atualizar progresso automaticamente
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o tracking de progresso quando um módulo é completado
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Incrementar módulos completados
        UPDATE student_progress_tracking
        SET
            total_modules_completed = total_modules_completed + 1,
            last_activity_at = NOW(),
            updated_at = NOW()
        WHERE enrollment_id = NEW.enrollment_id;

        -- Atualizar progresso geral na matrícula
        UPDATE student_course_enrollments
        SET
            overall_progress = (
                SELECT CASE
                    WHEN pt.total_modules_in_course > 0
                    THEN ROUND((pt.total_modules_completed::DECIMAL / pt.total_modules_in_course::DECIMAL) * 100, 2)
                    ELSE 0
                END
                FROM student_progress_tracking pt
                WHERE pt.enrollment_id = NEW.enrollment_id
            ),
            updated_at = NOW()
        WHERE id = NEW.enrollment_id;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualização automática de progresso
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress ON student_module_progress_v2;
CREATE TRIGGER trigger_update_enrollment_progress
    AFTER UPDATE ON student_module_progress_v2
    FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();

-- 9. Função para inicializar progresso tracking ao criar matrícula
CREATE OR REPLACE FUNCTION initialize_progress_tracking()
RETURNS TRIGGER AS $$
DECLARE
    module_count INTEGER;
BEGIN
    -- Contar total de módulos no curso
    SELECT COUNT(tm.id) INTO module_count
    FROM theme_modules tm
    JOIN course_themes ct ON tm.theme_id = ct.id
    WHERE ct.course_id = NEW.course_id;

    -- Criar registro de tracking
    INSERT INTO student_progress_tracking (
        student_id,
        enrollment_id,
        course_id,
        total_modules_in_course,
        created_at,
        updated_at
    ) VALUES (
        NEW.student_id,
        NEW.id,
        NEW.course_id,
        module_count,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger para inicialização automática
DROP TRIGGER IF EXISTS trigger_initialize_progress_tracking ON student_course_enrollments;
CREATE TRIGGER trigger_initialize_progress_tracking
    AFTER INSERT ON student_course_enrollments
    FOR EACH ROW EXECUTE FUNCTION initialize_progress_tracking();

-- 11. Função para marcar curso como completo automaticamente
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se todos os módulos foram completados
    IF NEW.total_modules_completed >= NEW.total_modules_in_course AND NEW.total_modules_in_course > 0 THEN
        UPDATE student_course_enrollments
        SET
            status = 'completed',
            completed_at = NOW(),
            overall_progress = 100.00,
            updated_at = NOW()
        WHERE id = NEW.enrollment_id AND status != 'completed';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Trigger para completar curso automaticamente
DROP TRIGGER IF EXISTS trigger_check_course_completion ON student_progress_tracking;
CREATE TRIGGER trigger_check_course_completion
    AFTER UPDATE ON student_progress_tracking
    FOR EACH ROW EXECUTE FUNCTION check_course_completion();

-- 13. Triggers para updated_at nas novas tabelas
-- Nota: Triggers para student_course_enrollments já existem no schema principal
-- Criar apenas para as novas tabelas

DROP TRIGGER IF EXISTS update_student_module_progress_v2_updated_at ON student_module_progress_v2;
CREATE TRIGGER update_student_module_progress_v2_updated_at
    BEFORE UPDATE ON student_module_progress_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_progress_tracking_updated_at ON student_progress_tracking;
CREATE TRIGGER update_student_progress_tracking_updated_at
    BEFORE UPDATE ON student_progress_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Comentários para documentação
COMMENT ON TABLE student_course_enrollments IS 'Matrículas de estudantes em cursos - tabela principal';
COMMENT ON TABLE student_module_progress_v2 IS 'Progresso detalhado dos estudantes em módulos específicos';
COMMENT ON TABLE student_progress_tracking IS 'Tracking em tempo real do progresso dos estudantes';
COMMENT ON VIEW student_enrollment_progress IS 'View consolidada com todas as informações de progresso';

-- 15. Inserir dados de exemplo para desenvolvimento (opcional)
-- Exemplo de curso para testes
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Aprenda sobre Power BI',
    'Curso completo de Power BI para análise de dados',
    'internal',
    'power_bi',
    'iniciante',
    180,
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Confirmação
SELECT 'Enrollment system tables created successfully!' as result;