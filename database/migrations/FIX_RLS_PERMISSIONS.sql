-- ===============================================
-- CORRIGIR PERMISSÕES RLS - DISPONIBILIDADE
-- ===============================================
-- Execute este SQL no Supabase SQL Editor para corrigir o erro de permissão
-- ===============================================

-- 1. REMOVER políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Coordenadores podem gerenciar disponibilidade" ON scheduling_availability;
DROP POLICY IF EXISTS "Todos podem ver horários disponíveis" ON scheduling_availability;
DROP POLICY IF EXISTS "Coordenadores podem gerenciar settings" ON scheduling_settings;
DROP POLICY IF EXISTS "Todos podem ver settings" ON scheduling_settings;
DROP POLICY IF EXISTS "allow_all_scheduling_availability" ON scheduling_availability;
DROP POLICY IF EXISTS "allow_all_scheduling_settings" ON scheduling_settings;

-- 2. DESABILITAR RLS temporariamente (para desenvolvimento)
ALTER TABLE scheduling_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings DISABLE ROW LEVEL SECURITY;

-- 3. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RLS desabilitado com sucesso!';
  RAISE NOTICE '📝 Agora você pode criar disponibilidades sem erro de permissão';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Em produção, você deve reabilitar o RLS e criar políticas adequadas';
  RAISE NOTICE '   Para reabilitar depois:';
  RAISE NOTICE '   ALTER TABLE scheduling_availability ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '   ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;';
END $$;
