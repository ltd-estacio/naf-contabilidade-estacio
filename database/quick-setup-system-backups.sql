-- Script rápido para criar/verificar tabela system_backups
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS system_backups (
  id SERIAL PRIMARY KEY,
  backup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  backup_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  tables_count INTEGER NOT NULL DEFAULT 0,
  records_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_system_backups_date ON system_backups(backup_date DESC);

-- Verificar se a tabela existe e tem dados
SELECT 
  COUNT(*) as total_backups,
  MAX(backup_date) as last_backup,
  MAX(id) as last_id
FROM system_backups;

-- Criar tabela audit_logs se não existir
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'system_backups'
ORDER BY ordinal_position;
