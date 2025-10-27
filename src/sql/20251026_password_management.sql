-- Script para adicionar funcionalidade de alteração de senha
-- Data: 26/10/2025

-- Tabela para histórico de alterações de senha (segurança)
CREATE TABLE IF NOT EXISTS password_changes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- 'student' ou 'coordinator'
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_password_changes_user_id ON password_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_changes_changed_at ON password_changes(changed_at DESC);

-- Comentários
COMMENT ON TABLE password_changes IS 'Registra histórico de alterações de senha para auditoria';
COMMENT ON COLUMN password_changes.user_id IS 'ID do usuário que alterou a senha';
COMMENT ON COLUMN password_changes.user_type IS 'Tipo do usuário: student ou coordinator';
COMMENT ON COLUMN password_changes.changed_at IS 'Data e hora da alteração';

-- Função para limpar histórico antigo (mais de 1 ano)
CREATE OR REPLACE FUNCTION cleanup_old_password_changes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM password_changes
  WHERE changed_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_password_changes IS 'Remove registros de alteração de senha com mais de 1 ano';

-- Verificar se as tabelas users/students/coordinators existem
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
        RAISE NOTICE '✅ Tabela students encontrada';
        
        -- Verificar se já tem coluna password
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'password'
        ) THEN
            RAISE NOTICE '⚠️ Coluna password não encontrada na tabela students';
            RAISE NOTICE 'ℹ️ A autenticação provavelmente usa outra tabela (ex: auth.users do Supabase)';
        END IF;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coordinators') THEN
        RAISE NOTICE '✅ Tabela coordinators encontrada';
    END IF;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela password_changes criada com sucesso!';
  RAISE NOTICE '🔒 Sistema de auditoria de alteração de senha configurado';
  RAISE NOTICE 'ℹ️ IMPORTANTE: Se usar Supabase Auth, as senhas são gerenciadas pelo auth.users';
END $$;
