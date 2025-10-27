-- ========================================
-- SCRIPT 1 de 2: Adicionar Colunas de Graduação
-- ========================================
-- EXECUTE ESTE SCRIPT PRIMEIRO antes de funcao_verificar_graduados.sql
-- ========================================

-- Passo 1: Remover constraint antigo de status (se existir)
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check;

-- Passo 2: Adicionar novo constraint com 'GRADUADO'
ALTER TABLE students 
ADD CONSTRAINT students_status_check 
CHECK (status IN ('ATIVO', 'INATIVO', 'TREINAMENTO', 'SUSPENSO', 'GRADUADO'));

-- Passo 3: Adicionar campos para rastreamento de graduação
ALTER TABLE students
ADD COLUMN IF NOT EXISTS registration_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN IF NOT EXISTS registration_semester INTEGER DEFAULT CASE
  WHEN EXTRACT(MONTH FROM NOW()) <= 6 THEN 1
  ELSE 2
END,
ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS expected_graduation_semester INTEGER,
ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS graduation_date TIMESTAMP WITH TIME ZONE;

-- Adicionar comentários para documentação
COMMENT ON COLUMN students.registration_year IS 'Ano em que o estudante se cadastrou no sistema';
COMMENT ON COLUMN students.registration_semester IS '1 para primeiro semestre, 2 para segundo semestre';
COMMENT ON COLUMN students.expected_graduation_year IS 'Ano esperado de formatura';
COMMENT ON COLUMN students.expected_graduation_semester IS 'Semestre esperado de formatura (1 ou 2)';
COMMENT ON COLUMN students.is_graduated IS 'Indica se o estudante já se formou';
COMMENT ON COLUMN students.graduation_date IS 'Data em que o estudante se formou';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_students_is_graduated ON students(is_graduated);
CREATE INDEX IF NOT EXISTS idx_students_registration_year ON students(registration_year);

-- Atualizar registros existentes com valores padrão
UPDATE students
SET 
  registration_year = COALESCE(registration_year, EXTRACT(YEAR FROM created_at)::INTEGER),
  registration_semester = COALESCE(registration_semester, 
    CASE WHEN EXTRACT(MONTH FROM created_at) <= 6 THEN 1 ELSE 2 END
  ),
  is_graduated = COALESCE(is_graduated, FALSE)
WHERE registration_year IS NULL 
   OR registration_semester IS NULL 
   OR is_graduated IS NULL;

-- Verificar se as colunas foram criadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'students'
  AND column_name IN ('registration_year', 'registration_semester', 'is_graduated', 'graduation_date')
ORDER BY column_name;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Colunas de graduação adicionadas com sucesso!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Colunas criadas:';
    RAISE NOTICE '   • registration_year';
    RAISE NOTICE '   • registration_semester';
    RAISE NOTICE '   • expected_graduation_year';
    RAISE NOTICE '   • expected_graduation_semester';
    RAISE NOTICE '   • is_graduated';
    RAISE NOTICE '   • graduation_date';
    RAISE NOTICE '';
    RAISE NOTICE '🎓 Próximo passo:';
    RAISE NOTICE '   Execute o script: funcao_verificar_graduados.sql';
    RAISE NOTICE '========================================';
END $$;
