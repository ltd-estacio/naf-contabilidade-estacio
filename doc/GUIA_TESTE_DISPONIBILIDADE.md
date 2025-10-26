# 🚀 Guia Rápido: Testando Sistema de Disponibilidade

## Passo 1: Executar Migração SQL ⚡

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto NAF
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de:
   ```
   database/migrations/20250127_criar_tabela_disponibilidade_agendamentos.sql
   ```
5. Clique em **RUN** (ou Ctrl/Cmd + Enter)
6. ✅ Verifique: "Success. No rows returned"

**Verificar criação**:
```sql
-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('scheduling_availability', 'scheduling_settings');

-- Ver funções criadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'check_time_slot%' OR routine_name LIKE 'get_available_time%';

-- Ver registro padrão de configurações
SELECT * FROM scheduling_settings;
```

## Passo 2: Testar APIs via cURL 📡

### 2.1 Criar Disponibilidade Recorrente (Segundas-feiras)
```bash
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "available",
    "day_of_week": 1,
    "start_time": "08:00",
    "end_time": "12:00",
    "max_appointments": 3,
    "reason": "Atendimento padrão segundas de manhã",
    "created_by": "coord-test"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "message": "Configuração criada com sucesso",
  "availability": { ... }
}
```

### 2.2 Criar Mais Disponibilidades
```bash
# Terças-feiras (tarde)
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "available",
    "day_of_week": 2,
    "start_time": "13:00",
    "end_time": "17:00",
    "max_appointments": 2,
    "created_by": "coord-test"
  }'

# Quartas-feiras (integral)
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "available",
    "day_of_week": 3,
    "start_time": "08:00",
    "end_time": "17:00",
    "max_appointments": 4,
    "created_by": "coord-test"
  }'
```

### 2.3 Bloquear Feriados Específicos
```bash
# Natal 2025
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blocked",
    "specific_date": "2025-12-25",
    "start_time": "00:00",
    "end_time": "23:59",
    "reason": "Natal - Recesso Institucional",
    "created_by": "coord-test"
  }'

# Ano Novo 2026
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blocked",
    "specific_date": "2026-01-01",
    "start_time": "00:00",
    "end_time": "23:59",
    "reason": "Ano Novo",
    "created_by": "coord-test"
  }'

# Bloqueio Recorrente (Sábados e Domingos)
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blocked",
    "day_of_week": 0,
    "start_time": "00:00",
    "end_time": "23:59",
    "reason": "Final de semana - Expediente fechado",
    "created_by": "coord-test"
  }'

curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blocked",
    "day_of_week": 6,
    "start_time": "00:00",
    "end_time": "23:59",
    "reason": "Final de semana - Expediente fechado",
    "created_by": "coord-test"
  }'
```

### 2.4 Listar Todas as Configurações
```bash
# Todas as configurações
curl https://naf.ltdestacio.com.br/api/scheduling/availability

# Apenas disponíveis
curl "https://naf.ltdestacio.com.br/api/scheduling/availability?type=available"

# Apenas bloqueados
curl "https://naf.ltdestacio.com.br/api/scheduling/availability?type=blocked"
```

### 2.5 Buscar Slots para Data Específica
```bash
# Segunda-feira (deve mostrar slots 08:00-12:00)
curl "https://naf.ltdestacio.com.br/api/scheduling/availability?date=2025-02-03"

# Sábado (deve estar bloqueado)
curl "https://naf.ltdestacio.com.br/api/scheduling/availability?date=2025-02-01"

# Natal (deve estar bloqueado)
curl "https://naf.ltdestacio.com.br/api/scheduling/availability?date=2025-12-25"
```

**Resposta esperada com slots**:
```json
{
  "availability": [...],
  "timeSlots": [
    {
      "time": "08:00",
      "is_available": true,
      "reason": null,
      "slots_remaining": 3
    },
    {
      "time": "08:30",
      "is_available": true,
      "reason": null,
      "slots_remaining": 3
    },
    ...
  ]
}
```

### 2.6 Atualizar Configuração
```bash
# Pegar ID de uma configuração
curl https://naf.ltdestacio.com.br/api/scheduling/availability

# Atualizar (use o ID real)
curl -X PUT https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "id": "UUID-DA-CONFIGURAÇÃO",
    "max_appointments": 5,
    "reason": "Capacidade aumentada"
  }'
```

### 2.7 Excluir Configuração
```bash
curl -X DELETE "https://naf.ltdestacio.com.br/api/scheduling/availability?id=UUID-DA-CONFIGURAÇÃO"
```

## Passo 3: Testar Interface do Coordenador 🎨

### 3.1 Acessar Dashboard
1. Fazer login como coordenador
2. URL: https://naf.ltdestacio.com.br/coordinator-dashboard
3. Procurar na navegação: **"Disponibilidade"** (ícone de relógio/calendário)
4. Clicar para abrir a aba

### 3.2 Visualizar Configurações Existentes
✅ **Deve aparecer**:
- Seção "Horários Disponíveis" (cards verdes)
- Seção "Horários Bloqueados" (cards vermelhos)
- Botão "Nova Configuração"
- Botão "Configurações Globais"

### 3.3 Criar Nova Disponibilidade
1. Clicar em **"Nova Configuração"**
2. Modal abre
3. Preencher:
   - **Tipo**: Disponível
   - **Período**: Dia da Semana (Recorrente)
   - **Dia da Semana**: Quinta-feira
   - **Hora Início**: 09:00
   - **Hora Fim**: 16:00
   - **Máximo de Atendimentos**: 2
   - **Observações**: "Atendimento quintas com capacidade reduzida"
4. Clicar em **"Criar"**
5. ✅ Deve aparecer mensagem de sucesso
6. ✅ Card verde deve aparecer na lista

### 3.4 Criar Bloqueio Específico
1. **"Nova Configuração"**
2. Preencher:
   - **Tipo**: Bloqueado
   - **Período**: Data Específica
   - **Data**: Escolher data futura (ex: 15/02/2025)
   - **Hora Início**: 00:00
   - **Hora Fim**: 23:59
   - **Observações**: "Reunião pedagógica - Dia inteiro"
3. **"Criar"**
4. ✅ Card vermelho aparece na seção de bloqueados

### 3.5 Editar Configuração
1. Encontrar um card criado
2. Clicar no **ícone de lápis** (Edit)
3. Modal abre com dados preenchidos
4. Alterar algum campo (ex: mudar horário ou capacidade)
5. **"Atualizar"**
6. ✅ Card atualiza automaticamente

### 3.6 Excluir Configuração
1. Clicar no **ícone de lixeira** (Delete)
2. Confirmar exclusão no alert
3. ✅ Card desaparece da lista

### 3.7 Configurações Globais
1. Clicar em **"Configurações Globais"**
2. Modal grande abre
3. Ver campos:
   - Antecedência Mínima: 24 horas
   - Antecedência Máxima: 30 dias
   - Hora Padrão Início: 08:00
   - Hora Padrão Fim: 17:00
   - Duração do Slot: 30 minutos
   - ✅ Enviar email de confirmação
   - ✅ Enviar email de lembrete (24h antes)
4. Alterar algum valor (ex: duração para 15 minutos)
5. **"Salvar Configurações"**
6. ✅ Mensagem de sucesso

## Passo 4: Testar Função SQL Diretamente 🔍

Abrir **SQL Editor** no Supabase e testar:

### 4.1 Verificar Disponibilidade de um Horário Específico
```sql
-- Segunda-feira 08:30 (deve estar disponível se configurou)
SELECT * FROM check_time_slot_availability('2025-02-03', '08:30', 30);

-- Resposta esperada:
-- is_available: true
-- reason: null
-- slots_remaining: 3 (ou o máximo configurado)
```

### 4.2 Verificar Horário Bloqueado
```sql
-- Sábado 10:00 (bloqueado como fim de semana)
SELECT * FROM check_time_slot_availability('2025-02-01', '10:00', 30);

-- Resposta esperada:
-- is_available: false
-- reason: 'Final de semana - Expediente fechado'
-- slots_remaining: 0
```

### 4.3 Verificar Feriado
```sql
-- Natal 14:00
SELECT * FROM check_time_slot_availability('2025-12-25', '14:00', 30);

-- Resposta esperada:
-- is_available: false
-- reason: 'Natal - Recesso Institucional'
-- slots_remaining: 0
```

### 4.4 Gerar Grade de Slots para um Dia
```sql
-- Quarta-feira (deve ter slots 08:00-17:00 se configurou)
SELECT * FROM get_available_time_slots('2025-02-05');

-- Resposta: Array de objetos JSON com todos os horários
```

### 4.5 Contar Configurações Ativas
```sql
-- Quantas disponibilidades ativas?
SELECT COUNT(*) FROM scheduling_availability 
WHERE type = 'available' AND is_active = true;

-- Quantos bloqueios ativos?
SELECT COUNT(*) FROM scheduling_availability 
WHERE type = 'blocked' AND is_active = true;
```

## Passo 5: Testar Calendário (quando integrado) 📅

*Este passo será aplicável depois de integrar o ImprovedCalendarPicker no naf-scheduling*

1. Acessar página de agendamento de usuário
2. Verificar calendário moderno exibido
3. Clicar em diferentes datas:
   - ✅ Datas futuras disponíveis → Mostra grade de horários
   - ⛔ Feriados bloqueados → Não permite seleção (cinza)
   - ⛔ Finais de semana → Não permite seleção
   - ⛔ Datas passadas → Desabilitadas
4. Selecionar data válida
5. Ver horários disponíveis como botões azuis
6. Horários lotados devem estar cinzas/desabilitados
7. Selecionar horário
8. Escolher formato (Presencial/Online)
9. Ver resumo final antes de confirmar

## 🐛 Solução de Problemas

### Erro: "relation scheduling_availability does not exist"
**Causa**: Migração SQL não foi executada
**Solução**: Executar Passo 1 novamente

### Erro: "function check_time_slot_availability does not exist"
**Causa**: Funções SQL não foram criadas
**Solução**: Verificar se migração completa foi executada (incluindo as funções)

### Erro 500 na API
**Causa**: Problema com RLS ou permissões
**Solução**: 
```sql
-- Verificar RLS policies
SELECT * FROM pg_policies WHERE tablename = 'scheduling_availability';

-- Deve ter 4 policies: read, create, update, delete
```

### Componente não aparece no Dashboard
**Causa**: Import ou aba não adicionados
**Solução**: Verificar:
1. Import em `coordinator-dashboard/page.tsx`:
   ```typescript
   import SchedulingAvailabilityManager from '@/components/admin/SchedulingAvailabilityManager'
   ```
2. TabsContent adicionado:
   ```typescript
   <TabsContent value="scheduling">
     <SchedulingAvailabilityManager />
   </TabsContent>
   ```
3. Item no quickLinks array
4. TabsTrigger na lista de tabs

### Erro de TypeScript
**Causa**: Tipos não reconhecidos
**Solução**: 
```bash
# Reinstalar dependências
npm install

# Verificar types
npm run type-check
```

## ✅ Checklist de Validação Final

- [ ] Tabelas criadas no banco (2: availability + settings)
- [ ] Funções SQL funcionando (2: check + get)
- [ ] Indexes criados (4 indexes)
- [ ] RLS policies ativas (4 policies)
- [ ] API GET funcionando (com e sem filtros)
- [ ] API POST criando registros
- [ ] API PUT atualizando registros
- [ ] API DELETE desativando registros (soft delete)
- [ ] Aba "Disponibilidade" visível no dashboard
- [ ] Modal de criação abrindo corretamente
- [ ] Formulário validando campos obrigatórios
- [ ] Cards verde/vermelho aparecendo nas listas
- [ ] Botões de editar/excluir funcionando
- [ ] Configurações globais salvando
- [ ] Calendário renderizando (quando integrado)
- [ ] Slots disponíveis/indisponíveis sendo diferenciados

## 📊 Dados de Teste Sugeridos

### Disponibilidades Recorrentes:
- Segunda a Sexta: 08:00-12:00 (3 vagas)
- Segunda a Quinta: 13:00-17:00 (2 vagas)
- Sexta: 13:00-15:00 (1 vaga)

### Bloqueios Recorrentes:
- Sábado e Domingo: 00:00-23:59 (Fim de semana)

### Bloqueios Específicos:
- 25/12/2025: Natal
- 01/01/2026: Ano Novo
- 21/04/2025: Tiradentes
- 01/05/2025: Dia do Trabalho
- 07/09/2025: Independência
- 12/10/2025: Nossa Senhora Aparecida
- 02/11/2025: Finados
- 15/11/2025: Proclamação da República

## 🎯 Resultado Esperado

Após concluir todos os passos:
- ✅ Coordenador pode criar/editar/excluir disponibilidades
- ✅ Sistema bloqueia automaticamente feriados e fins de semana
- ✅ Usuários vêem apenas horários realmente disponíveis
- ✅ Sistema respeita capacidade máxima de cada slot
- ✅ Interface moderna e intuitiva
- ✅ Dados persistidos no banco de dados
- ✅ APIs RESTful funcionando perfeitamente

## 📞 Precisa de Ajuda?

Se algo não funcionar como esperado:
1. Verificar logs no console do browser (F12)
2. Verificar logs no Supabase (Database → Logs)
3. Testar queries SQL diretamente no SQL Editor
4. Verificar network requests (aba Network no F12)
5. Revisar documentação completa em `SISTEMA_DISPONIBILIDADE_AGENDAMENTOS.md`
