# Sistema de Gerenciamento de Disponibilidade de Agendamentos

## 📋 Visão Geral

Sistema completo para o coordenador gerenciar manualmente os horários disponíveis e bloqueados para agendamentos no NAF. Permite controle total sobre quando os usuários podem agendar atendimentos via https://naf.ltdestacio.com.br/naf-scheduling.

## 🎯 Funcionalidades Implementadas

### 1. **Banco de Dados** (`scheduling_availability` e `scheduling_settings`)

#### Tabela `scheduling_availability`
Armazena configurações de disponibilidade e bloqueios:
- **Tipo**: `available` (disponível) ou `blocked` (bloqueado)
- **Data Específica**: Para configurações únicas (ex: Natal 2025)
- **Dia da Semana**: Para configurações recorrentes (ex: Todas as segundas-feiras)
- **Horário**: Início e fim do período
- **Capacidade**: Máximo de atendimentos por horário
- **Motivo**: Justificativa (opcional para disponíveis, importante para bloqueios)

**Constraint especial**: XOR entre `specific_date` e `day_of_week` - apenas um pode ser preenchido.

#### Tabela `scheduling_settings`
Configurações globais do sistema (singleton):
- **Antecedência**: Mínimo e máximo de dias para agendamento
- **Horários Padrão**: Início e fim do expediente
- **Duração dos Slots**: 15, 30 ou 60 minutos
- **Dias Úteis Padrão**: JSON array [1,2,3,4,5] para seg-sex
- **Datas Bloqueadas**: JSON array de feriados
- **Notificações**: Configurações de email

### 2. **Funções SQL Inteligentes**

#### `check_time_slot_availability(date, time, duration)`
Verifica se um horário específico está disponível:
1. ✅ Checa bloqueios na data específica
2. ✅ Checa bloqueios no dia da semana
3. ✅ Checa se existe configuração de disponibilidade
4. ✅ Conta quantos agendamentos já existem
5. ✅ Calcula vagas restantes

**Retorna**:
- `is_available`: TRUE/FALSE
- `reason`: Motivo se indisponível
- `slots_remaining`: Quantas vagas restam

#### `get_available_time_slots(date)`
Gera grade completa de horários para um dia:
- Lê duração dos slots das configurações
- Gera todos os horários entre início e fim do expediente
- Chama `check_time_slot_availability()` para cada slot
- Retorna array de objetos com hora, disponibilidade e vagas

### 3. **API REST** (`/api/scheduling/availability`)

#### GET - Listar configurações
```typescript
GET /api/scheduling/availability
GET /api/scheduling/availability?date=2025-01-28  // Com slots do dia
GET /api/scheduling/availability?type=available   // Filtrar por tipo
```

**Resposta**:
```json
{
  "availability": [...],
  "timeSlots": [  // Se incluir ?date=
    {
      "time": "08:00",
      "is_available": true,
      "slots_remaining": 2
    }
  ]
}
```

#### POST - Criar configuração
```typescript
POST /api/scheduling/availability
Body: {
  "type": "available",  // ou "blocked"
  "specific_date": "2025-12-25",  // OU day_of_week
  "day_of_week": 1,  // 0=Domingo, 6=Sábado
  "start_time": "08:00",
  "end_time": "12:00",
  "max_appointments": 3,  // Para type=available
  "reason": "Feriado Nacional",  // Para type=blocked
  "created_by": "coord-uuid"
}
```

#### PUT - Atualizar configuração
```typescript
PUT /api/scheduling/availability
Body: {
  "id": "uuid-da-config",
  ...campos a atualizar...
}
```

#### DELETE - Desativar configuração (soft delete)
```typescript
DELETE /api/scheduling/availability?id=uuid-da-config
```

### 4. **API de Configurações Globais** (`/api/scheduling/settings`)

#### GET - Obter configurações
```typescript
GET /api/scheduling/settings
```

#### PUT - Atualizar configurações
```typescript
PUT /api/scheduling/settings
Body: {
  "min_advance_hours": 24,
  "max_advance_days": 30,
  "default_start_time": "08:00",
  "default_end_time": "17:00",
  "slot_duration_minutes": 30,
  "send_confirmation_email": true,
  "send_reminder_email": true,
  "reminder_hours_before": 24,
  "updated_by": "coord-uuid"
}
```

### 5. **Componente do Coordenador** (`SchedulingAvailabilityManager`)

Interface completa para gerenciar disponibilidade:

**Funcionalidades**:
- ➕ **Criar configuração**: Modal com formulário completo
- ✏️ **Editar configuração**: Carrega dados no formulário
- 🗑️ **Excluir configuração**: Soft delete com confirmação
- ⚙️ **Configurações Globais**: Modal para ajustes do sistema
- 📊 **Visualização**: Duas listas separadas (Disponíveis vs Bloqueados)

**Design**:
- Cards visuais coloridos (verde=disponível, vermelho=bloqueado)
- Badges indicando tipo (Data Específica vs Recorrente)
- Ícones informativos
- Formulário inteligente que adapta campos conforme tipo selecionado

**Acesso**: 
```
Dashboard Coordenador → Aba "Disponibilidade" (ícone CalendarClock)
```

### 6. **Calendário Moderno** (`ImprovedCalendarPicker`)

Componente de seleção de data/hora estilo mobile:

**Recursos**:
- 📅 **Grade de Calendário**: Visualização mensal interativa
- ⌨️ **Input Manual**: Digite data no formato dd/mm/aaaa
- 🕐 **Grade de Horários**: Botões para cada time slot disponível
- 📍 **Seleção de Formato**: Presencial vs Online (ícones)
- 📋 **Resumo**: Card com seleção completa antes de confirmar
- 🎨 **Design Moderno**: Inspirado em apps mobile, limpo e intuitivo

**Estados Visuais**:
- **Dias passados**: Cinza, desabilitado
- **Hoje**: Borda azul
- **Dia selecionado**: Fundo azul, texto branco
- **Horários indisponíveis**: Cinza claro, desabilitado
- **Horários disponíveis**: Borda azul, hover azul claro
- **Horário selecionado**: Fundo azul

**Integração API**:
```typescript
// Busca slots disponíveis para a data selecionada
fetch(`/api/scheduling/availability?date=2025-01-28`)
  .then(data => setTimeSlots(data.timeSlots))
```

## 🔄 Fluxo de Uso Completo

### Para o Coordenador:

1. **Acessa Dashboard** → Aba "Disponibilidade"
2. **Define Horários Padrão**:
   - Clica em "Configurações Globais"
   - Define expediente: 08:00-17:00
   - Define duração dos slots: 30 minutos
   - Define dias úteis: Segunda a Sexta
   - Salva

3. **Cria Disponibilidade Recorrente**:
   - Clica em "Nova Configuração"
   - Tipo: Disponível
   - Período: Dia da Semana (Recorrente)
   - Dia: Segunda-feira
   - Horário: 08:00-12:00
   - Máximo: 3 atendimentos por slot
   - Salva

4. **Bloqueia Feriado Específico**:
   - Nova Configuração
   - Tipo: Bloqueado
   - Período: Data Específica
   - Data: 25/12/2025
   - Horário: 00:00-23:59
   - Motivo: Natal - Recesso NAF
   - Salva

### Para o Usuário (naf-scheduling):

1. **Acessa página de agendamento**
2. **Vê calendário moderno** com:
   - Dias futuros disponíveis
   - Dias passados desabilitados
   - Feriados bloqueados (Natal aparece cinza)

3. **Seleciona data**: Clica em 27/01/2025
4. **Vê horários disponíveis**:
   - 08:00 (2 vagas)
   - 08:30 (2 vagas)
   - 09:00 (3 vagas)
   - 09:30 (INDISPONÍVEL - sem vagas)
   - ...

5. **Seleciona horário**: Clica em "09:00"
6. **Escolhe formato**: Presencial ou Online
7. **Confirma**: Vê resumo e finaliza agendamento

## 📊 Lógica de Disponibilidade (Prioridade)

A função `check_time_slot_availability` verifica nesta ordem:

1. **🚫 Bloqueio Específico**: Data exata bloqueada? → Indisponível
2. **🚫 Bloqueio Recorrente**: Dia da semana bloqueado? → Indisponível
3. **✅ Disponibilidade Configurada**: Existe config ativa? → Verifica vagas
4. **📊 Capacidade**: Conta agendamentos existentes vs máximo permitido
5. **✅ Retorna**: Status final + motivo + vagas restantes

**Exemplo de lógica**:
```sql
-- Natal 2025 (bloqueio específico)
specific_date = '2025-12-25' AND type = 'blocked'
  → is_available = FALSE, reason = 'Feriado Nacional'

-- Segunda-feira normal (disponibilidade recorrente)
day_of_week = 1 AND type = 'available' 
  → Conta agendamentos: 2 de 3
  → is_available = TRUE, slots_remaining = 1

-- Sábado (sem configuração)
day_of_week = 6 AND NOT EXISTS (any config)
  → is_available = FALSE, reason = 'Fora do horário de atendimento'
```

## 🗂️ Estrutura de Arquivos Criados

```
database/migrations/
  └── 20250127_criar_tabela_disponibilidade_agendamentos.sql

src/app/api/
  ├── scheduling/
  │   ├── availability/
  │   │   └── route.ts  (GET, POST, PUT, DELETE)
  │   └── settings/
  │       └── route.ts  (GET, PUT)

src/components/
  ├── admin/
  │   └── SchedulingAvailabilityManager.tsx
  └── calendar/
      └── ImprovedCalendarPicker.tsx

src/app/coordinator-dashboard/
  └── page.tsx  (modificado - nova aba "Disponibilidade")
```

## 🎨 Cores e Estados Visuais

### Disponibilidade (Verde):
- Background: `bg-green-50`
- Border: `border-green-200`
- Text: `text-green-600`
- Icon: `CheckCircle` ou `Calendar`

### Bloqueado (Vermelho):
- Background: `bg-red-50`
- Border: `border-red-200`
- Text: `text-red-600`
- Icon: `XCircle`

### Calendário:
- **Dia passado**: `text-gray-300 cursor-not-allowed`
- **Hoje**: `border-2 border-blue-500 text-blue-600`
- **Selecionado**: `bg-blue-500 text-white hover:bg-blue-600`
- **Normal**: `bg-white border border-gray-200 hover:bg-blue-50`

### Time Slots:
- **Disponível**: `border-2 border-blue-200 text-blue-600 hover:bg-blue-50`
- **Selecionado**: `bg-blue-500 text-white`
- **Indisponível**: `bg-gray-100 text-gray-400 cursor-not-allowed`

## 🧪 Como Testar

### 1. Executar Migração SQL:
```sql
-- Copiar conteúdo de:
database/migrations/20250127_criar_tabela_disponibilidade_agendamentos.sql

-- Executar no Supabase SQL Editor
-- Verificar criação das tabelas e funções
```

### 2. Testar API (cURL ou Postman):

**Criar disponibilidade recorrente**:
```bash
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "available",
    "day_of_week": 1,
    "start_time": "08:00",
    "end_time": "12:00",
    "max_appointments": 3,
    "created_by": "coord-1"
  }'
```

**Bloquear feriado**:
```bash
curl -X POST https://naf.ltdestacio.com.br/api/scheduling/availability \
  -H "Content-Type": application/json" \
  -d '{
    "type": "blocked",
    "specific_date": "2025-12-25",
    "start_time": "00:00",
    "end_time": "23:59",
    "reason": "Natal",
    "created_by": "coord-1"
  }'
```

**Buscar slots para uma data**:
```bash
curl https://naf.ltdestacio.com.br/api/scheduling/availability?date=2025-01-28
```

### 3. Testar Interface:

1. Login como coordenador
2. Ir para aba "Disponibilidade"
3. Criar algumas configurações:
   - 2-3 disponibilidades recorrentes (dias da semana)
   - 1-2 bloqueios específicos (feriados futuros)
4. Verificar visualização nas listas
5. Editar uma configuração
6. Excluir uma configuração

4. Testar Calendário (quando integrado):
   - Abrir naf-scheduling
   - Selecionar datas futuras
   - Verificar horários disponíveis
   - Tentar selecionar feriado bloqueado (deve estar cinza)

## 🚀 Próximos Passos

### Implementações Necessárias:

1. **Integrar calendário no naf-scheduling**:
   ```typescript
   // src/app/naf-scheduling/page.tsx
   import ImprovedCalendarPicker from '@/components/calendar/ImprovedCalendarPicker'
   
   <ImprovedCalendarPicker
     onDateTimeSelect={(date, time, format) => {
       // Salvar seleção e prosseguir com agendamento
     }}
   />
   ```

2. **Atualizar lógica de agendamento**:
   - Verificar disponibilidade antes de confirmar
   - Chamar `check_time_slot_availability()` via RPC
   - Mostrar erro se horário ficou indisponível

3. **Notificações**:
   - Enviar email de confirmação (se habilitado)
   - Enviar email de lembrete X horas antes
   - Usar configurações de `scheduling_settings`

4. **Validações Adicionais**:
   - Não permitir agendar menos de X horas de antecedência
   - Não permitir agendar mais de Y dias no futuro
   - Verificar conflitos de horário do coordenador

5. **Dashboard de Analytics**:
   - Horários mais populares
   - Taxa de ocupação por dia/horário
   - Feriados que impactaram agendamentos

## 📝 Observações Importantes

### Segurança:
- ✅ RLS policies configuradas (coordenadores gerenciam, todos lêem)
- ✅ Soft delete (is_active=false preserva histórico)
- ✅ Audit trail via created_by, updated_by, timestamps
- ⚠️ TODO: Validar permissões no backend (verificar token JWT)

### Performance:
- ✅ 4 indexes criados para queries rápidas
- ✅ Funções SQL otimizadas
- ✅ Batching de slots (gera múltiplos de uma vez)
- ⚠️ TODO: Cache de configurações globais (mudam raramente)

### UX:
- ✅ Design moderno e intuitivo
- ✅ Feedback visual claro (cores, ícones)
- ✅ Validações client-side antes de enviar
- ⚠️ TODO: Loading states durante API calls
- ⚠️ TODO: Mensagens de erro amigáveis

### Acessibilidade:
- ⚠️ TODO: ARIA labels nos botões do calendário
- ⚠️ TODO: Navegação por teclado (Tab, Enter, Arrows)
- ⚠️ TODO: Screen reader support
- ⚠️ TODO: Alto contraste para daltonismo

## 📞 Suporte

Dúvidas ou problemas? Verificar:

1. **Logs do Supabase**: Ver erros de RLS ou SQL
2. **Console do Browser**: Ver erros de API ou validação
3. **Network Tab**: Verificar requests/responses HTTP
4. **SQL Queries**: Testar funções diretamente no Supabase SQL Editor

## 🎉 Conclusão

Sistema completo de gerenciamento de disponibilidade de agendamentos implementado com sucesso!

**Benefícios**:
- ✅ Coordenador tem controle total sobre quando agendamentos podem ocorrer
- ✅ Usuários vêem apenas horários realmente disponíveis
- ✅ Sistema inteligente que respeita capacidade máxima
- ✅ Interface moderna e intuitiva
- ✅ Arquitetura escalável e manutenível

**Tecnologias**:
- PostgreSQL com funções avançadas
- Next.js 14 App Router
- TypeScript com type-safety
- React Server Components
- Tailwind CSS
- Shadcn/ui components
- Supabase RLS
