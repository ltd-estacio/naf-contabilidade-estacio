-- Criação das tabelas necessárias para o Painel de Perigo
-- Data: 26/10/2025

-- Tabela de Backups Automáticos do Sistema
CREATE TABLE IF NOT EXISTS system_backups (
  id SERIAL PRIMARY KEY,
  backup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  backup_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  tables_count INTEGER NOT NULL DEFAULT 0,
  records_count INTEGER NOT NULL DEFAULT 0,
  file_size_bytes BIGINT,
  created_by VARCHAR(100),
  notes TEXT,
  CONSTRAINT system_backups_backup_date_check CHECK (backup_date <= NOW() + INTERVAL '1 hour')
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_system_backups_date ON system_backups(backup_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_type ON system_backups(backup_type);

-- Comentários descritivos
COMMENT ON TABLE system_backups IS 'Armazena backups automáticos criados antes de operações críticas';
COMMENT ON COLUMN system_backups.backup_date IS 'Data e hora da criação do backup';
COMMENT ON COLUMN system_backups.backup_type IS 'Tipo do backup (automatic_danger_zone, manual, scheduled)';
COMMENT ON COLUMN system_backups.data IS 'Dados do backup em formato JSON';
COMMENT ON COLUMN system_backups.tables_count IS 'Número de tabelas incluídas no backup';
COMMENT ON COLUMN system_backups.records_count IS 'Número total de registros no backup';

-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255),
  success BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_ms INTEGER,
  error_message TEXT,
  CONSTRAINT audit_logs_timestamp_check CHECK (timestamp <= NOW() + INTERVAL '1 hour')
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Comentários descritivos
COMMENT ON TABLE audit_logs IS 'Registra todas as operações críticas realizadas no sistema';
COMMENT ON COLUMN audit_logs.action_type IS 'Tipo de ação (DANGER_DELETE, DANGER_CONFIRM, DANGER_VIEW, etc)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID do usuário que executou a ação';
COMMENT ON COLUMN audit_logs.success IS 'Indica se a operação foi bem-sucedida';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes adicionais sobre a operação em formato texto ou JSON';
COMMENT ON COLUMN audit_logs.ip_address IS 'Endereço IP de onde a ação foi executada';

-- View para facilitar consultas de auditoria
CREATE OR REPLACE VIEW v_audit_summary AS
SELECT 
  action_type,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN success THEN 1 END) as successful_actions,
  COUNT(CASE WHEN NOT success THEN 1 END) as failed_actions,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(timestamp) as first_action,
  MAX(timestamp) as last_action,
  AVG(duration_ms) as avg_duration_ms
FROM audit_logs
GROUP BY action_type
ORDER BY total_actions DESC;

COMMENT ON VIEW v_audit_summary IS 'Resumo estatístico das ações de auditoria por tipo';

-- View para ações recentes
CREATE OR REPLACE VIEW v_recent_critical_actions AS
SELECT 
  al.id,
  al.action_type,
  al.user_id,
  al.user_email,
  al.success,
  al.timestamp,
  al.details,
  al.ip_address
FROM audit_logs al
WHERE al.action_type LIKE 'DANGER_%'
ORDER BY al.timestamp DESC
LIMIT 50;

COMMENT ON VIEW v_recent_critical_actions IS 'Últimas 50 ações críticas do painel de perigo';

-- Função para limpar backups antigos (manter apenas últimos 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM system_backups
  WHERE backup_date < NOW() - INTERVAL '30 days'
    AND backup_type = 'automatic_danger_zone';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_backups IS 'Remove backups automáticos com mais de 30 dias';

-- Função para obter estatísticas de segurança
CREATE OR REPLACE FUNCTION get_security_stats()
RETURNS TABLE (
  total_backups BIGINT,
  total_audit_logs BIGINT,
  critical_actions_today BIGINT,
  failed_actions_today BIGINT,
  last_backup_date TIMESTAMP WITH TIME ZONE,
  oldest_backup_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM system_backups) as total_backups,
    (SELECT COUNT(*) FROM audit_logs) as total_audit_logs,
    (SELECT COUNT(*) FROM audit_logs WHERE action_type LIKE 'DANGER_%' AND timestamp::date = CURRENT_DATE) as critical_actions_today,
    (SELECT COUNT(*) FROM audit_logs WHERE NOT success AND timestamp::date = CURRENT_DATE) as failed_actions_today,
    (SELECT MAX(backup_date) FROM system_backups) as last_backup_date,
    (SELECT MIN(backup_date) FROM system_backups) as oldest_backup_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_security_stats IS 'Retorna estatísticas de segurança do sistema';

-- Trigger para garantir que backups não sejam deletados acidentalmente
CREATE OR REPLACE FUNCTION prevent_backup_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Permitir apenas deleção de backups muito antigos (mais de 90 dias)
    IF OLD.backup_date > NOW() - INTERVAL '90 days' THEN
      RAISE EXCEPTION 'Não é permitido deletar backups com menos de 90 dias. Use a função cleanup_old_backups() para manutenção.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_backup_deletion
BEFORE DELETE ON system_backups
FOR EACH ROW
EXECUTE FUNCTION prevent_backup_deletion();

COMMENT ON TRIGGER trg_prevent_backup_deletion ON system_backups IS 'Protege backups recentes contra deleção acidental';

-- Inserir alguns registros iniciais para teste
INSERT INTO audit_logs (action_type, user_id, user_email, success, details, timestamp)
VALUES 
  ('SYSTEM_INIT', 'system', 'system@naf.com', true, 'Sistema de auditoria inicializado', NOW()),
  ('SECURITY_TABLES_CREATED', 'system', 'system@naf.com', true, 'Tabelas de segurança criadas com sucesso', NOW());

-- Grant de permissões (ajuste conforme seu esquema de segurança)
-- GRANT SELECT, INSERT ON system_backups TO authenticated;
-- GRANT SELECT, INSERT ON audit_logs TO authenticated;
-- GRANT SELECT ON v_audit_summary TO authenticated;
-- GRANT SELECT ON v_recent_critical_actions TO authenticated;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas de segurança criadas com sucesso!';
  RAISE NOTICE '📋 Tabelas: system_backups, audit_logs';
  RAISE NOTICE '👁️ Views: v_audit_summary, v_recent_critical_actions';
  RAISE NOTICE '⚙️ Funções: cleanup_old_backups(), get_security_stats()';
  RAISE NOTICE '🔒 Trigger: trg_prevent_backup_deletion';
END $$;
