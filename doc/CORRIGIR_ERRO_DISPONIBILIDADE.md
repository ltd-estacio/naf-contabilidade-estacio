# 🚨 CORRIGIR ERRO 500 - Painel de Disponibilidade do Coordenador

## Problema Identificado

**Erro**: `POST /api/scheduling/availability 500 (Internal Server Error)`

**Causa**: As tabelas `scheduling_availability` e `scheduling_settings` **ainda não existem** no banco de dados Supabase.

**Solução**: Executar a migração SQL que cria essas tabelas.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Acessar Supabase SQL Editor

1. Abrir: https://supabase.com/dashboard
2. Selecionar o projeto: **NAF Contabilidade**
3. No menu lateral esquerdo, clicar em **SQL Editor**
4. Clicar em **New query**

### Passo 2: Copiar e Colar a Migração

Copiar **TODO** o conteúdo do arquivo:

```
database/migrations/20250127_criar_tabela_disponibilidade_agendamentos.sql
```

**OU** use o código abaixo (é o mesmo):

<details>
<summary>📋 Clique para ver o SQL completo (copiar tudo)</summary>

```sql
-- ===============================================
-- SISTEMA DE DISPONIBILIDADE DE HORÁRIOS
-- ===============================================

-- Tabela para armazenar os horários disponíveis
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

-- Tabela para configurações globais
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

-- Inserir configurações padrão
INSERT INTO scheduling_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT (id) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_availability_specific_date 
  ON scheduling_availability(specific_date) WHERE specific_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_day_of_week 
  ON scheduling_availability(day_of_week) WHERE day_of_week IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_time_range 
  ON scheduling_availability(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_availability_active 
  ON scheduling_availability(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE scheduling_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Coordenadores podem gerenciar disponibilidade"
  ON scheduling_availability FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coordinator_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Todos podem ver horários disponíveis"
  ON scheduling_availability FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Coordenadores podem gerenciar settings"
  ON scheduling_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coordinator_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Todos podem ver settings"
  ON scheduling_settings FOR SELECT TO authenticated
  USING (true);

-- Funções
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
  
  -- Verificar bloqueios específicos
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
  
  -- Se não há configuração, usar padrão
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
  SELECT 
    slot_duration_minutes,
    default_start_time,
    default_end_time
  INTO v_slot_duration, v_start_time, v_end_time
  FROM scheduling_settings
  WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;
  
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
```

</details>

### Passo 3: Executar o SQL

1. Colar **TODO** o SQL no editor
2. Clicar no botão **RUN** (ou pressionar `Ctrl+Enter`)
3. Aguardar 5-10 segundos
4. Verificar se aparece **"Success. No rows returned"**

### Passo 4: Verificar se as Tabelas Foram Criadas

No SQL Editor, executar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'scheduling%';
```

**Resultado esperado**:
```
table_name
-------------------------
scheduling_availability
scheduling_settings
```

### Passo 5: Verificar se as Funções Foram Criadas

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%slot%';
```

**Resultado esperado**:
```
routine_name
---------------------------
check_time_slot_availability
get_available_time_slots
```

---

## ✅ Testar se Funcionou

### 1. Voltar ao Painel do Coordenador

1. Fazer login como coordenador
2. Ir para aba **"Disponibilidade"**
3. Clicar em **"+ Nova Configuração"**

### 2. Criar uma Disponibilidade Teste

**Exemplo 1: Disponibilidade Semanal**
- Tipo: **Disponível**
- Período: **Dia da Semana (Recorrente)**
- Dia da Semana: **Segunda-feira**
- Hora Início: **08:00**
- Hora Fim: **12:00**
- Máximo de Atendimentos: **3**
- Clicar em **Criar**

**Exemplo 2: Bloqueio Específico**
- Tipo: **Bloqueado**
- Período: **Data Específica**
- Data: **01/11/2025** (Finados)
- Hora Início: **00:00**
- Hora Fim: **23:59**
- Motivo: **Feriado Nacional**
- Clicar em **Criar**

### 3. Verificar se Aparece na Lista

Após criar, você deve ver:

```
✅ Horários Disponíveis (1)
┌─────────────────────────────────────────┐
│ Segunda-feira                            │
│ 08:00 - 12:00                           │
│ Máx. 3 atendimentos por horário         │
│ [Editar] [Excluir]                      │
└─────────────────────────────────────────┘

🚫 Horários Bloqueados (1)
┌─────────────────────────────────────────┐
│ 01/11/2025                              │
│ 00:00 - 23:59                           │
│ Feriado Nacional                        │
│ [Editar] [Excluir]                      │
└─────────────────────────────────────────┘
```

---

## 🔧 Configurações Padrão Criadas

Após a migração, as seguintes configurações são criadas automaticamente:

```json
{
  "min_advance_hours": 24,        // Mínimo 24h de antecedência
  "max_advance_days": 30,         // Máximo 30 dias no futuro
  "default_start_time": "08:00",  // Início padrão: 8h
  "default_end_time": "17:00",    // Fim padrão: 17h
  "slot_duration_minutes": 30,    // Slots de 30 minutos
  "default_working_days": [1,2,3,4,5], // Seg-Sex
  "send_confirmation_email": true,
  "send_reminder_email": true,
  "reminder_hours_before": 24
}
```

---

## 📊 Como Usar o Sistema Após a Migração

### 1. Configurar Horários Padrão (Recomendado)

**Disponibilidade Semanal - Segunda a Sexta (Manhã)**
- Tipo: Disponível
- Período: Dia da Semana
- Dias: Segunda (1), Terça (2), Quarta (3), Quinta (4), Sexta (5)
- Horário: 08:00 - 12:00
- Máximo: 3 atendimentos

**Disponibilidade Semanal - Segunda a Sexta (Tarde)**
- Tipo: Disponível  
- Período: Dia da Semana
- Dias: Segunda (1), Terça (2), Quarta (3), Quinta (4), Sexta (5)
- Horário: 13:00 - 17:00
- Máximo: 3 atendimentos

### 2. Bloquear Fins de Semana

**Sábado**
- Tipo: Bloqueado
- Período: Dia da Semana
- Dia: Sábado (6)
- Horário: 00:00 - 23:59
- Motivo: Final de semana

**Domingo**
- Tipo: Bloqueado
- Período: Dia da Semana
- Dia: Domingo (0)
- Horário: 00:00 - 23:59
- Motivo: Final de semana

### 3. Bloquear Feriados

Para cada feriado, criar um bloqueio específico:

```
01/01/2025 - Ano Novo
21/04/2025 - Tiradentes
01/05/2025 - Dia do Trabalho
07/09/2025 - Independência
12/10/2025 - Nossa Senhora
02/11/2025 - Finados
15/11/2025 - Proclamação da República
20/11/2025 - Consciência Negra
25/12/2025 - Natal
```

---

## 🚨 Solução de Problemas

### Erro: "relation 'coordinator_users' does not exist"

**Causa**: A política RLS está tentando verificar a tabela `coordinator_users`

**Solução Temporária** - Desabilitar RLS:

```sql
ALTER TABLE scheduling_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings DISABLE ROW LEVEL SECURITY;
```

**Solução Permanente** - Criar política simplificada:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Coordenadores podem gerenciar disponibilidade" ON scheduling_availability;
DROP POLICY IF EXISTS "Coordenadores podem gerenciar settings" ON scheduling_settings;

-- Criar políticas simples (qualquer usuário autenticado pode gerenciar)
CREATE POLICY "Usuários autenticados podem gerenciar disponibilidade"
  ON scheduling_availability FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar settings"
  ON scheduling_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

### Erro: "duplicate key value violates unique constraint"

**Causa**: Tentando inserir configuração padrão que já existe

**Solução**: Normal, pode ignorar. A migração usa `ON CONFLICT DO NOTHING`.

### Erro ao criar disponibilidade: "null value in column 'day_of_week'"

**Causa**: Não selecionou nem data específica nem dia da semana

**Solução**: Sempre preencher:
- **Data Específica**: Escolher uma data no calendário
- **OU Dia da Semana**: Selecionar segunda, terça, etc.

---

## 📝 Resumo

| Ação | Status |
|------|--------|
| ✅ Migração SQL criada | Pronta |
| ⏳ Executar no Supabase | **FAZER AGORA** |
| ⏳ Criar disponibilidades | Após executar SQL |
| ⏳ Testar no painel | Após configurar |

## 🎯 Próximos Passos

1. **AGORA**: Executar migração SQL no Supabase
2. **DEPOIS**: Criar disponibilidades padrão (Seg-Sex 8h-17h)
3. **DEPOIS**: Bloquear fins de semana e feriados
4. **TESTAR**: Fazer agendamento e verificar se horários aparecem corretamente

---

## 🆘 Se Ainda Não Funcionar

Me enviar:

1. **Screenshot** do erro completo
2. **Mensagem** que aparece no alert/modal
3. **Console do browser** (F12 → Console)
4. **Network tab** (F12 → Network → filtrar por "scheduling")

Com essas informações posso identificar exatamente o problema!
