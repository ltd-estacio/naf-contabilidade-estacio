-- ===============================================
-- TABELA DE AUDITORIA PARA TRANSFERÊNCIAS
-- ===============================================
-- Criado em: 27/01/2025
-- Propósito: Registrar todas as transferências de atendimento entre estudantes
--
-- INSTRUÇÕES:
-- 1. Acesse o Supabase SQL Editor
-- 2. Cole este script completo
-- 3. Execute para criar a tabela
-- ===============================================

-- Criar tabela de auditoria de transferências (se não existir)
CREATE TABLE IF NOT EXISTS appointment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  appointment_id UUID NOT NULL,
  from_student_id UUID,
  to_student_id UUID NOT NULL,
  coordinator_id UUID,
  
  -- Dados da transferência
  action VARCHAR(50) NOT NULL DEFAULT 'TRANSFER_STUDENT',
  reason TEXT,
  
  -- Metadados
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES fiscal_appointments(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_from_student
    FOREIGN KEY (from_student_id)
    REFERENCES students(id)
    ON DELETE SET NULL,
    
  CONSTRAINT fk_to_student
    FOREIGN KEY (to_student_id)
    REFERENCES students(id)
    ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_appointment_id 
  ON appointment_audit_logs(appointment_id);

CREATE INDEX IF NOT EXISTS idx_audit_from_student 
  ON appointment_audit_logs(from_student_id);

CREATE INDEX IF NOT EXISTS idx_audit_to_student 
  ON appointment_audit_logs(to_student_id);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp 
  ON appointment_audit_logs(timestamp DESC);

-- Comentários
COMMENT ON TABLE appointment_audit_logs IS 'Registros de auditoria de transferências de atendimento';
COMMENT ON COLUMN appointment_audit_logs.action IS 'Tipo de ação: TRANSFER_STUDENT, STATUS_CHANGE, etc';
COMMENT ON COLUMN appointment_audit_logs.reason IS 'Motivo da transferência fornecido pelo coordenador';
COMMENT ON COLUMN appointment_audit_logs.timestamp IS 'Data e hora da ação';

-- Permissões RLS (Row Level Security)
ALTER TABLE appointment_audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para coordenadores visualizarem todas as transferências
CREATE POLICY "Coordenadores podem ver todas as transferências"
  ON appointment_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid()
      AND role = 'COORDENADOR'
    )
  );

-- Política para inserir logs de auditoria (sistema)
CREATE POLICY "Sistema pode inserir logs de auditoria"
  ON appointment_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela de auditoria criada com sucesso!';
  RAISE NOTICE '📊 Índices criados para melhor performance';
  RAISE NOTICE '🔒 Políticas RLS configuradas';
END $$;
