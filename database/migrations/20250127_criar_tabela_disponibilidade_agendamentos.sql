-- ===============================================
-- SISTEMA DE DISPONIBILIDADE DE HORÁRIOS
-- ===============================================
-- Criado em: 27/01/2025
-- Propósito: Permitir que o coordenador gerencie horários disponíveis para agendamentos
--
-- INSTRUÇÕES:
-- 1. Acesse o Supabase SQL Editor
-- 2. Cole este script completo
-- 3. Execute para criar as tabelas
-- ===============================================

-- Tabela para armazenar os horários disponíveis configurados pelo coordenador
CREATE TABLE IF NOT EXISTS scheduling_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de configuração
  type VARCHAR(20) NOT NULL CHECK (type IN ('available', 'blocked')),
  
  -- Data específica ou padrão
  specific_date DATE, -- Se preenchido, é uma configuração para um dia específico
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado
  
  -- Horários
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Informações adicionais
  reason TEXT, -- Motivo do bloqueio ou disponibilidade especial
  max_appointments INTEGER DEFAULT 1, -- Número máximo de agendamentos neste horário
  
  -- Controle
  is_active BOOLEAN DEFAULT true,
  created_by UUID, -- ID do coordenador que criou
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT date_or_weekday CHECK (
    (specific_date IS NOT NULL AND day_of_week IS NULL) OR
    (specific_date IS NULL AND day_of_week IS NOT NULL)
  )
);

-- Tabela para configurações globais de agendamento
CREATE TABLE IF NOT EXISTS scheduling_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Antecedência mínima e máxima
  min_advance_hours INTEGER DEFAULT 24, -- Mínimo de horas de antecedência
  max_advance_days INTEGER DEFAULT 30, -- Máximo de dias que pode agendar no futuro
  
  -- Horários padrão (se não houver configuração específica)
  default_start_time TIME DEFAULT '08:00',
  default_end_time TIME DEFAULT '17:00',
  slot_duration_minutes INTEGER DEFAULT 30, -- Duração de cada slot
  
  -- Dias da semana padrão (JSON array)
  default_working_days JSONB DEFAULT '[1, 2, 3, 4, 5]', -- Segunda a Sexta
  
  -- Feriados e dias bloqueados
  blocked_dates JSONB DEFAULT '[]', -- Array de datas bloqueadas
  
  -- Configurações de notificação
  send_confirmation_email BOOLEAN DEFAULT true,
  send_reminder_email BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  
  -- Controle
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir apenas um registro
  CONSTRAINT only_one_settings CHECK (id = '00000000-0000-0000-0000-000000000001'::UUID)
);

-- Inserir configurações padrão
INSERT INTO scheduling_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT (id) DO NOTHING;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_availability_specific_date 
  ON scheduling_availability(specific_date) WHERE specific_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_day_of_week 
  ON scheduling_availability(day_of_week) WHERE day_of_week IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_time_range 
  ON scheduling_availability(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_availability_active 
  ON scheduling_availability(is_active) WHERE is_active = true;

-- Comentários
COMMENT ON TABLE scheduling_availability IS 'Horários disponíveis e bloqueados para agendamentos configurados pelo coordenador';
COMMENT ON COLUMN scheduling_availability.type IS 'Tipo: available (disponível) ou blocked (bloqueado)';
COMMENT ON COLUMN scheduling_availability.specific_date IS 'Data específica (ex: 2025-12-25 para Natal)';
COMMENT ON COLUMN scheduling_availability.day_of_week IS 'Dia da semana: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb';
COMMENT ON COLUMN scheduling_availability.max_appointments IS 'Número máximo de agendamentos permitidos neste horário';

COMMENT ON TABLE scheduling_settings IS 'Configurações globais do sistema de agendamento';
COMMENT ON COLUMN scheduling_settings.min_advance_hours IS 'Horas mínimas de antecedência para agendar';
COMMENT ON COLUMN scheduling_settings.max_advance_days IS 'Dias máximos no futuro que pode agendar';

-- Permissões RLS (Row Level Security)
ALTER TABLE scheduling_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;

-- Política para coordenadores gerenciarem disponibilidade
CREATE POLICY "Coordenadores podem gerenciar disponibilidade"
  ON scheduling_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coordinator_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Política para todos visualizarem disponibilidade ativa
CREATE POLICY "Todos podem ver horários disponíveis"
  ON scheduling_availability
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política para coordenadores gerenciarem settings
CREATE POLICY "Coordenadores podem gerenciar settings"
  ON scheduling_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coordinator_users
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Política para todos visualizarem settings
CREATE POLICY "Todos podem ver settings"
  ON scheduling_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Função para verificar se um horário está disponível
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
  -- Calcular dia da semana (0=Domingo)
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
    RETURN QUERY SELECT false, 'Horário bloqueado para esta data específica', 0;
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
    RETURN QUERY SELECT false, 'Horário bloqueado para este dia da semana', 0;
    RETURN;
  END IF;
  
  -- Verificar disponibilidade específica configurada
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
  
  -- Se não há configuração de disponibilidade, usar configurações padrão
  IF v_available_count = 0 THEN
    -- Verificar se está dentro do horário padrão e dia da semana padrão
    IF v_day_of_week BETWEEN 1 AND 5 AND p_time >= '08:00' AND v_end_time <= '17:00' THEN
      v_max_appointments := 1;
      v_available_count := 1;
    ELSE
      RETURN QUERY SELECT false, 'Fora do horário de atendimento padrão', 0;
      RETURN;
    END IF;
  END IF;
  
  -- Verificar quantos agendamentos já existem para este horário
  SELECT COUNT(*) INTO v_current_appointments
  FROM fiscal_appointments
  WHERE preferred_date = p_date
    AND preferred_time = p_time::TEXT
    AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
    AND is_deleted = false;
  
  -- Calcular slots restantes
  IF v_current_appointments >= v_max_appointments THEN
    RETURN QUERY SELECT false, 'Horário já está completamente ocupado', 0;
  ELSE
    RETURN QUERY SELECT true, 'Horário disponível', (v_max_appointments - v_current_appointments);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para obter horários disponíveis de um dia
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
  
  -- Gerar slots de horário
  v_current_time := v_start_time;
  
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

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de disponibilidade de horários criado com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas:';
  RAISE NOTICE '   - scheduling_availability (horários configurados)';
  RAISE NOTICE '   - scheduling_settings (configurações globais)';
  RAISE NOTICE '🔧 Funções criadas:';
  RAISE NOTICE '   - check_time_slot_availability()';
  RAISE NOTICE '   - get_available_time_slots()';
  RAISE NOTICE '🔒 Políticas RLS configuradas';
END $$;
