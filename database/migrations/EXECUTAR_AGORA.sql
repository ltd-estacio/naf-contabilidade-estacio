-- ===============================================
-- SISTEMA DE DISPONIBILIDADE DE HORÁRIOS - VERSÃO SIMPLIFICADA
-- ===============================================
-- Execute este SQL no Supabase SQL Editor
-- Copie tudo e cole no editor, depois clique em RUN
-- ===============================================

-- 1. Criar tabela de disponibilidade
CREATE TABLE IF NOT EXISTS scheduling_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('available', 'blocked')),
  specific_date DATE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  max_appointments INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT date_or_weekday CHECK (
    (specific_date IS NOT NULL AND day_of_week IS NULL) OR
    (specific_date IS NULL AND day_of_week IS NOT NULL)
  )
);

-- 2. Criar tabela de configurações
CREATE TABLE IF NOT EXISTS scheduling_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_advance_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 30,
  default_start_time TIME DEFAULT '08:00',
  default_end_time TIME DEFAULT '17:00',
  slot_duration_minutes INTEGER DEFAULT 30,
  default_working_days JSONB DEFAULT '[1, 2, 3, 4, 5]',
  blocked_dates JSONB DEFAULT '[]',
  send_confirmation_email BOOLEAN DEFAULT true,
  send_reminder_email BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT only_one_settings CHECK (id = '00000000-0000-0000-0000-000000000001'::UUID)
);

-- 3. Inserir configurações padrão
INSERT INTO scheduling_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT (id) DO NOTHING;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_availability_specific_date 
  ON scheduling_availability(specific_date) WHERE specific_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_day_of_week 
  ON scheduling_availability(day_of_week) WHERE day_of_week IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_time_range 
  ON scheduling_availability(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_availability_active 
  ON scheduling_availability(is_active) WHERE is_active = true;

-- 5. Habilitar RLS (segurança)
ALTER TABLE scheduling_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de acesso SIMPLIFICADAS
-- Qualquer usuário autenticado pode gerenciar (depois podemos restringir)
DROP POLICY IF EXISTS "allow_all_scheduling_availability" ON scheduling_availability;
CREATE POLICY "allow_all_scheduling_availability"
  ON scheduling_availability FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_scheduling_settings" ON scheduling_settings;
CREATE POLICY "allow_all_scheduling_settings"
  ON scheduling_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 7. Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION check_time_slot_availability(
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  is_available BOOLEAN,
  reason TEXT,
  slots_remaining INTEGER
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_end_time TIME;
  v_blocked_count INTEGER;
  v_available_count INTEGER;
  v_current_appointments INTEGER;
  v_max_appointments INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);
  v_end_time := p_time + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Verificar bloqueios específicos para esta data
  SELECT COUNT(*) INTO v_blocked_count
  FROM scheduling_availability
  WHERE type = 'blocked'
    AND specific_date = p_date
    AND is_active = true
    AND (
      (p_time >= start_time AND p_time < end_time) OR
      (v_end_time > start_time AND v_end_time <= end_time) OR
      (p_time <= start_time AND v_end_time >= end_time)
    );
  
  IF v_blocked_count > 0 THEN
    RETURN QUERY SELECT false, 'Horário bloqueado para esta data específica'::TEXT, 0;
    RETURN;
  END IF;
  
  -- Verificar bloqueios por dia da semana
  SELECT COUNT(*) INTO v_blocked_count
  FROM scheduling_availability
  WHERE type = 'blocked'
    AND day_of_week = v_day_of_week
    AND specific_date IS NULL
    AND is_active = true
    AND (
      (p_time >= start_time AND p_time < end_time) OR
      (v_end_time > start_time AND v_end_time <= end_time) OR
      (p_time <= start_time AND v_end_time >= end_time)
    );
  
  IF v_blocked_count > 0 THEN
    RETURN QUERY SELECT false, 'Horário bloqueado para este dia da semana'::TEXT, 0;
    RETURN;
  END IF;
  
  -- Verificar disponibilidade configurada
  SELECT 
    COALESCE(MAX(max_appointments), 1),
    COUNT(*)
  INTO v_max_appointments, v_available_count
  FROM scheduling_availability
  WHERE type = 'available'
    AND (
      (specific_date = p_date) OR
      (day_of_week = v_day_of_week AND specific_date IS NULL)
    )
    AND is_active = true
    AND p_time >= start_time
    AND v_end_time <= end_time;
  
  -- Se não há configuração, usar padrão (seg-sex 8h-17h)
  IF v_available_count = 0 THEN
    IF v_day_of_week BETWEEN 1 AND 5 AND p_time >= '08:00' AND v_end_time <= '17:00' THEN
      v_max_appointments := 1;
      v_available_count := 1;
    ELSE
      RETURN QUERY SELECT false, 'Fora do horário de atendimento padrão'::TEXT, 0;
      RETURN;
    END IF;
  END IF;
  
  -- Verificar agendamentos existentes
  SELECT COUNT(*) INTO v_current_appointments
  FROM fiscal_appointments
  WHERE preferred_date = p_date
    AND preferred_time = p_time::TEXT
    AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
    AND is_deleted = false;
  
  -- Retornar resultado
  IF v_current_appointments >= v_max_appointments THEN
    RETURN QUERY SELECT false, 'Horário já está completamente ocupado'::TEXT, 0;
  ELSE
    RETURN QUERY SELECT true, 'Horário disponível'::TEXT, (v_max_appointments - v_current_appointments);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para obter todos os horários disponíveis de um dia
CREATE OR REPLACE FUNCTION get_available_time_slots(p_date DATE)
RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN,
  slots_remaining INTEGER,
  reason TEXT
) AS $$
DECLARE
  v_slot_duration INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_current_time TIME;
BEGIN
  -- Obter configurações
  SELECT 
    slot_duration_minutes,
    default_start_time,
    default_end_time
  INTO v_slot_duration, v_start_time, v_end_time
  FROM scheduling_settings
  WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;
  
  v_current_time := v_start_time;
  
  -- Gerar slots de horário
  WHILE v_current_time < v_end_time LOOP
    RETURN QUERY
    SELECT 
      v_current_time,
      ca.is_available,
      ca.slots_remaining,
      ca.reason
    FROM check_time_slot_availability(p_date, v_current_time, v_slot_duration) ca;
    
    v_current_time := v_current_time + (v_slot_duration || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de disponibilidade criado com sucesso!';
  RAISE NOTICE '📊 Tabelas: scheduling_availability, scheduling_settings';
  RAISE NOTICE '🔧 Funções: check_time_slot_availability(), get_available_time_slots()';
  RAISE NOTICE '🔒 Políticas RLS configuradas';
  RAISE NOTICE '';
  RAISE NOTICE '👉 Próximo passo: Acessar o painel do coordenador e criar disponibilidades!';
END $$;
