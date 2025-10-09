-- Sistema de Links Únicos para Atendimentos Fiscais
-- Permite que estudantes gerem links únicos para atendimentos

-- 1. Adicionar colunas na tabela fiscal_appointments
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS assigned_student_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS chat_link_token VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS chat_link_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chat_link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chat_link_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS chat_link_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS appointment_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS appointment_finished_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS appointment_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS appointment_status VARCHAR(50) DEFAULT 'PENDENTE' CHECK (
  appointment_status IN ('PENDENTE', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU')
),
ADD COLUMN IF NOT EXISTS student_notes TEXT,
ADD COLUMN IF NOT EXISTS attendance_summary TEXT;

-- 2. Criar tabela para histórico de atendimentos
CREATE TABLE IF NOT EXISTS appointment_attendance_history (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES fiscal_appointments(id),
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(255) NOT NULL,

  -- Informações do atendimento
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,

  -- Status e resultados
  status VARCHAR(50) NOT NULL CHECK (
    status IN ('INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')
  ),

  -- Notas e resumo
  student_notes TEXT,
  attendance_summary TEXT,
  services_provided TEXT[],
  documents_generated TEXT[],

  -- Avaliação do cliente
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  client_feedback TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela para rastreamento de acesso aos links
CREATE TABLE IF NOT EXISTS appointment_link_access_logs (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES fiscal_appointments(id),
  chat_link_token VARCHAR(100) NOT NULL,

  -- Informações de acesso
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Localização (opcional)
  country VARCHAR(100),
  city VARCHAR(100),

  -- Status
  access_granted BOOLEAN DEFAULT true,
  access_denied_reason TEXT
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_student ON fiscal_appointments(assigned_student_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_token ON fiscal_appointments(chat_link_token);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_status ON fiscal_appointments(appointment_status);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_started ON fiscal_appointments(appointment_started_at);

CREATE INDEX IF NOT EXISTS idx_attendance_history_appointment ON appointment_attendance_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_history_student ON appointment_attendance_history(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_history_status ON appointment_attendance_history(status);
CREATE INDEX IF NOT EXISTS idx_attendance_history_created ON appointment_attendance_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_link_access_logs_appointment ON appointment_link_access_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_link_access_logs_token ON appointment_link_access_logs(chat_link_token);
CREATE INDEX IF NOT EXISTS idx_link_access_logs_accessed ON appointment_link_access_logs(accessed_at DESC);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_appointment_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_appointment_history_timestamp ON appointment_attendance_history;
CREATE TRIGGER trigger_update_appointment_history_timestamp
    BEFORE UPDATE ON appointment_attendance_history
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_history_timestamp();

-- 7. Criar view para relatório de atendimentos por estudante
CREATE OR REPLACE VIEW student_attendance_summary AS
SELECT
  h.student_id,
  h.student_name,
  COUNT(*) as total_attendances,
  COUNT(*) FILTER (WHERE h.status = 'CONCLUIDO') as completed_attendances,
  COUNT(*) FILTER (WHERE h.status = 'CANCELADO') as cancelled_attendances,
  AVG(h.duration_minutes) FILTER (WHERE h.status = 'CONCLUIDO') as avg_duration_minutes,
  AVG(h.client_rating) FILTER (WHERE h.client_rating IS NOT NULL) as avg_rating,
  MIN(h.started_at) as first_attendance,
  MAX(h.started_at) as last_attendance
FROM appointment_attendance_history h
GROUP BY h.student_id, h.student_name;

-- 8. Comentários para documentação
COMMENT ON COLUMN fiscal_appointments.chat_link_token IS 'Token único gerado para acesso ao chat do atendimento';
COMMENT ON COLUMN fiscal_appointments.chat_link_expires_at IS 'Data de expiração do link (padrão: 48 horas)';
COMMENT ON COLUMN fiscal_appointments.appointment_status IS 'Status atual do atendimento';
COMMENT ON TABLE appointment_attendance_history IS 'Histórico completo de todos os atendimentos realizados';
COMMENT ON TABLE appointment_link_access_logs IS 'Log de todos os acessos aos links de atendimento';
COMMENT ON VIEW student_attendance_summary IS 'Resumo de atendimentos por estudante';

-- Confirmação
SELECT 'Sistema de links de atendimento criado com sucesso!' as result;
