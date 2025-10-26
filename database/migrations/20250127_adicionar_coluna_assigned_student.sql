-- ===============================================
-- ADICIONAR COLUNA assigned_student_id
-- ===============================================
-- Criado em: 27/01/2025
-- Propósito: Garantir que a coluna assigned_student_id existe na tabela fiscal_appointments
--
-- INSTRUÇÕES:
-- 1. Acesse o Supabase SQL Editor
-- 2. Cole este script completo
-- 3. Execute para adicionar/verificar a coluna
-- ===============================================

-- Adicionar coluna assigned_student_id se não existir
ALTER TABLE fiscal_appointments 
ADD COLUMN IF NOT EXISTS assigned_student_id UUID;

-- Adicionar coluna assigned_coordinator_id se não existir
ALTER TABLE fiscal_appointments 
ADD COLUMN IF NOT EXISTS assigned_coordinator_id UUID;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_student 
  ON fiscal_appointments(assigned_student_id);

CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_coordinator 
  ON fiscal_appointments(assigned_coordinator_id);

-- Adicionar foreign key para students (opcional, mas recomendado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_fiscal_appointments_student'
  ) THEN
    ALTER TABLE fiscal_appointments
    ADD CONSTRAINT fk_fiscal_appointments_student
    FOREIGN KEY (assigned_student_id)
    REFERENCES students(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Comentários
COMMENT ON COLUMN fiscal_appointments.assigned_student_id IS 'ID do estudante responsável pelo atendimento';
COMMENT ON COLUMN fiscal_appointments.assigned_coordinator_id IS 'ID do coordenador responsável';

-- Verificar estrutura da tabela
DO $$
BEGIN
  RAISE NOTICE '✅ Colunas adicionadas/verificadas com sucesso!';
  RAISE NOTICE '📊 Verificando estrutura da tabela fiscal_appointments...';
END $$;

-- Mostrar colunas da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'fiscal_appointments'
  AND column_name IN ('assigned_student_id', 'assigned_coordinator_id')
ORDER BY ordinal_position;
