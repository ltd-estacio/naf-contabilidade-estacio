-- ============================================
-- Adicionar Soft Delete para Fiscal Appointments
-- ============================================
-- Este script adiciona campos para soft delete (exclusão lógica)
-- permitindo recuperação de atendimentos excluídos

-- 1. Adicionar coluna deleted_at (timestamp de quando foi excluído)
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Adicionar coluna deleted_by (ID do estudante que excluiu)
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES students(id) ON DELETE SET NULL;

-- 3. Adicionar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_deleted_at
ON fiscal_appointments(deleted_at)
WHERE deleted_at IS NULL;

-- 4. Adicionar comentários às colunas
COMMENT ON COLUMN fiscal_appointments.deleted_at IS 'Timestamp de quando o atendimento foi excluído (soft delete). NULL = não excluído';
COMMENT ON COLUMN fiscal_appointments.deleted_by IS 'ID do estudante que excluiu o atendimento';

-- ============================================
-- Como usar:
-- ============================================
--
-- EXCLUIR (soft delete):
-- UPDATE fiscal_appointments
-- SET deleted_at = NOW(), deleted_by = '<student_id>'
-- WHERE id = '<appointment_id>';
--
-- RESTAURAR:
-- UPDATE fiscal_appointments
-- SET deleted_at = NULL, deleted_by = NULL
-- WHERE id = '<appointment_id>';
--
-- LISTAR ATIVOS (não excluídos):
-- SELECT * FROM fiscal_appointments WHERE deleted_at IS NULL;
--
-- LISTAR EXCLUÍDOS:
-- SELECT * FROM fiscal_appointments WHERE deleted_at IS NOT NULL;
-- ============================================
