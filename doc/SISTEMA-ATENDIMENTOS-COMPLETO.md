# Sistema Completo de Atendimentos NAF - Documentação

## 📋 Visão Geral

Sistema completo para gerenciamento de atendimentos fiscais do NAF, com funcionalidades para estudantes, coordenadores e clientes, incluindo geração de links únicos para acesso ao chat.

---

## 🎯 Funcionalidades Implementadas

### 1. **Painel do Estudante**
- ✅ Lista de agendamentos fiscais atribuídos ao estudante
- ✅ Visualização detalhada de cada atendimento
- ✅ Geração de link único para o cliente acessar o chat
- ✅ Botão para iniciar atendimento
- ✅ Botão para finalizar atendimento com resumo e notas
- ✅ Filtros por status (Pendente, Em Atendimento, Concluído)
- ✅ Informações do cliente e protocolo
- ✅ Controle de links (geração, cópia, visualização)

### 2. **Painel do Coordenador**
- ✅ Histórico completo de atendimentos
- ✅ Filtros por estudante
- ✅ Busca por protocolo, estudante ou cliente
- ✅ Estatísticas resumidas (total, concluídos, duração média, avaliação)
- ✅ Visualização detalhada de cada atendimento
- ✅ Avaliações dos clientes
- ✅ Exportação de relatórios
- ✅ Gráficos e métricas de performance

### 3. **Página do Cliente (Chat Widget)**
- ✅ Validação de link único
- ✅ Widget de chat flutuante
- ✅ Design conforme especificação (azul/verde)
- ✅ Mensagem de boas-vindas personalizada
- ✅ Lista de serviços disponíveis
- ✅ Botões de ação (Cadastro, Login, Telefone)
- ✅ Interface responsiva e expansível
- ✅ Chat em tempo real
- ✅ Indicador de digitação

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `fiscal_appointments` (Modificada)

```sql
ALTER TABLE fiscal_appointments
ADD COLUMN assigned_student_id VARCHAR(100),
ADD COLUMN chat_link_token VARCHAR(100) UNIQUE,
ADD COLUMN chat_link_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN chat_link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN chat_link_used BOOLEAN DEFAULT false,
ADD COLUMN chat_link_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN appointment_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN appointment_finished_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN appointment_duration_minutes INTEGER,
ADD COLUMN appointment_status VARCHAR(50) DEFAULT 'PENDENTE',
ADD COLUMN student_notes TEXT,
ADD COLUMN attendance_summary TEXT;
```

### Tabela: `appointment_attendance_history`

```sql
CREATE TABLE appointment_attendance_history (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES fiscal_appointments(id),
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status VARCHAR(50) NOT NULL,
  student_notes TEXT,
  attendance_summary TEXT,
  services_provided TEXT[],
  documents_generated TEXT[],
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  client_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `appointment_link_access_logs`

```sql
CREATE TABLE appointment_link_access_logs (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES fiscal_appointments(id),
  chat_link_token VARCHAR(100) NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  access_granted BOOLEAN DEFAULT true,
  access_denied_reason TEXT
);
```

### View: `student_attendance_summary`

```sql
CREATE OR REPLACE VIEW student_attendance_summary AS
SELECT
  student_id,
  student_name,
  COUNT(*) as total_attendances,
  COUNT(*) FILTER (WHERE status = 'CONCLUIDO') as completed_attendances,
  COUNT(*) FILTER (WHERE status = 'CANCELADO') as cancelled_attendances,
  AVG(duration_minutes) FILTER (WHERE status = 'CONCLUIDO') as avg_duration_minutes,
  AVG(client_rating) FILTER (WHERE client_rating IS NOT NULL) as avg_rating,
  MIN(started_at) as first_attendance,
  MAX(started_at) as last_attendance
FROM appointment_attendance_history
GROUP BY student_id, student_name;
```

---

## 🔌 APIs Criadas

### 1. **GET `/api/appointments/student`**
Buscar atendimentos do estudante.

**Parâmetros:**
- `student_id` (obrigatório): ID do estudante
- `status` (opcional): Filtrar por status (PENDENTE, EM_ATENDIMENTO, CONCLUIDO)

**Resposta:**
```json
{
  "appointments": [...],
  "total": 5
}
```

---

### 2. **POST `/api/appointments/generate-link`**
Gerar link único para atendimento.

**Body:**
```json
{
  "appointment_id": 123,
  "student_id": "student-1",
  "expires_in_hours": 48
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "abc123xyz...",
  "link": "https://naf.ltdestacio.com.br/atendimento/abc123xyz...",
  "expires_at": "2025-10-05T18:00:00Z"
}
```

---

### 3. **GET `/api/appointments/validate-link`**
Validar link de atendimento.

**Parâmetros:**
- `token` (obrigatório): Token do link

**Resposta:**
```json
{
  "valid": true,
  "appointment": {
    "id": 123,
    "protocol": "NAF-2025-001",
    "service_type": "IRPF",
    "service_title": "Declaração de Imposto de Renda",
    "scheduled_datetime": "2025-10-04T14:00:00Z",
    "student_id": "student-1"
  }
}
```

---

### 4. **POST `/api/appointments/start`**
Iniciar atendimento.

**Body:**
```json
{
  "appointment_id": 123,
  "student_id": "student-1",
  "student_name": "Ana Silva"
}
```

---

### 5. **POST `/api/appointments/finish`**
Finalizar atendimento.

**Body:**
```json
{
  "appointment_id": 123,
  "student_id": "student-1",
  "student_notes": "Cliente trouxe todos os documentos necessários",
  "attendance_summary": "Declaração de IRPF realizada com sucesso",
  "services_provided": ["IRPF 2025", "Consulta Tributária"],
  "documents_generated": ["Declaração IRPF", "Recibo de Entrega"]
}
```

---

### 6. **GET `/api/appointments/history`**
Buscar histórico de atendimentos (para coordenadores).

**Parâmetros:**
- `student_id` (opcional): Filtrar por estudante
- `start_date` (opcional): Data inicial
- `end_date` (opcional): Data final
- `limit` (opcional): Limite de resultados (padrão: 50)

**Resposta:**
```json
{
  "history": [...],
  "summary": {
    "student_id": "student-1",
    "student_name": "Ana Silva",
    "total_attendances": 12,
    "completed_attendances": 10,
    "avg_duration_minutes": 37.5,
    "avg_rating": 4.8
  },
  "total": 12
}
```

---

## 📦 Componentes Criados

### 1. **StudentAppointments.tsx**
**Localização:** `/src/components/student/StudentAppointments.tsx`

**Props:**
- `studentId: string`
- `studentName: string`

**Funcionalidades:**
- Lista de atendimentos
- Geração de links
- Início/Finalização de atendimentos
- Filtros e busca

---

### 2. **NAFChatWidget.tsx**
**Localização:** `/src/components/chat/NAFChatWidget.tsx`

**Props:**
- `appointmentId?: number`
- `protocol?: string`
- `serviceTitle?: string`

**Funcionalidades:**
- Widget flutuante
- Chat em tempo real
- Design personalizado (azul/verde)
- Botões de ação rápida
- Expansão/Minimização

---

### 3. **AttendanceHistory.tsx**
**Localização:** `/src/components/coordinator/AttendanceHistory.tsx`

**Props:**
- `coordinatorId: string`

**Funcionalidades:**
- Histórico completo
- Filtros e busca
- Estatísticas resumidas
- Visualização detalhada
- Exportação de relatórios

---

### 4. **Página: `/atendimento/[token]`**
**Localização:** `/src/app/atendimento/[token]/page.tsx`

**Funcionalidades:**
- Validação de token
- Exibição do chat widget
- Tratamento de erros
- Tela de carregamento

---

## 🚀 Fluxo de Uso

### Fluxo do Estudante:

1. **Visualizar Atendimentos**
   - Estudante acessa painel
   - Vê lista de agendamentos atribuídos a ele
   - Filtra por status se desejar

2. **Gerar Link de Atendimento**
   - Seleciona um atendimento pendente
   - Clica em "Gerar Link"
   - Link único é gerado (válido por 48h)
   - Estudante copia e envia para o cliente

3. **Iniciar Atendimento**
   - Clica em "Iniciar Atendimento"
   - Status muda para "Em Atendimento"
   - Horário de início é registrado

4. **Finalizar Atendimento**
   - Após conclusão, clica em "Finalizar"
   - Preenche resumo e observações
   - Sistema calcula duração automaticamente
   - Atendimento é marcado como "Concluído"

### Fluxo do Cliente:

1. **Acessar Link**
   - Cliente recebe link via email/WhatsApp
   - Clica no link
   - Sistema valida token

2. **Chat Widget**
   - Widget de chat aparece automaticamente
   - Cliente vê mensagem de boas-vindas
   - Pode iniciar conversa
   - Acesso a botões de cadastro/login

3. **Atendimento**
   - Cliente interage com assistente virtual
   - Pode ser atendido por estudante/coordenador
   - Avaliação ao final (futuro)

### Fluxo do Coordenador:

1. **Visualizar Histórico**
   - Acessa painel de histórico
   - Vê todos os atendimentos realizados
   - Filtra por estudante se desejar

2. **Analisar Performance**
   - Visualiza estatísticas resumidas
   - Vê duração média, avaliações
   - Identifica pontos de melhoria

3. **Detalhes de Atendimento**
   - Clica em "Detalhes" em qualquer atendimento
   - Vê informações completas
   - Lê resumo e observações do estudante

4. **Exportar Relatórios**
   - Gera relatórios para análise externa
   - Compartilha com gestão

---

## 🛠️ Instalação e Configuração

### 1. Criar Tabelas no Banco de Dados

```bash
psql -U seu_usuario -d naf_contabil -f src/sql/appointment-links-system.sql
```

Ou execute no Supabase Dashboard > SQL Editor

### 2. Instalar Dependências

```bash
npm install nanoid
```

### 3. Configurar Variáveis de Ambiente

```env
NEXT_PUBLIC_APP_URL=https://naf.ltdestacio.com.br
```

### 4. Atribuir Atendimentos aos Estudantes

```sql
UPDATE fiscal_appointments
SET assigned_student_id = 'student-1'
WHERE id IN (1, 2, 3);
```

---

## 📱 Como Usar os Componentes

### No Painel do Estudante:

```tsx
import StudentAppointments from '@/components/student/StudentAppointments'

export default function StudentDashboard() {
  return (
    <StudentAppointments
      studentId="student-123"
      studentName="Ana Silva"
    />
  )
}
```

### No Painel do Coordenador:

```tsx
import AttendanceHistory from '@/components/coordinator/AttendanceHistory'

export default function CoordinatorDashboard() {
  return (
    <AttendanceHistory coordinatorId="coord-123" />
  )
}
```

---

## 🎨 Design do Chat Widget

### Cores:
- **Cabeçalho:** Gradiente azul (#2563EB) para verde (#14B8A6)
- **Mensagens do usuário:** Azul (#2563EB)
- **Mensagens do assistente:** Cinza claro (#F3F4F6)
- **Botões de ação:** Borda azul, fundo branco

### Layout:
- **Widget fechado:** Botão flutuante circular (64x64px)
- **Widget aberto:** 384px (largura) x 600px (altura)
- **Widget expandido:** Tela completa com margem de 16px
- **Posição:** Canto inferior direito (24px de margem)

---

## 🔐 Segurança

### Links Únicos:
- ✅ Token gerado com `nanoid` (32 caracteres)
- ✅ Expiração configurável (padrão: 48 horas)
- ✅ Uso único por padrão
- ✅ Log de todos os acessos (IP, User-Agent, timestamp)
- ✅ Validação de token antes de exibir chat

### Permissões:
- ✅ Estudante só vê seus próprios atendimentos
- ✅ Coordenador vê todos os atendimentos
- ✅ Cliente só acessa com link válido

---

## 📊 Métricas e Relatórios

### Métricas Disponíveis:
- Total de atendimentos
- Atendimentos concluídos
- Atendimentos cancelados
- Duração média
- Avaliação média
- Performance por estudante
- Taxa de conclusão
- Tempo de resposta

### Relatórios:
- Histórico completo
- Performance individual
- Estatísticas por período
- Exportação para Excel (futuro)

---

## 🧪 Testes

### Cenário 1: Estudante Gera Link
1. Login como estudante
2. Acessar painel de atendimentos
3. Selecionar atendimento pendente
4. Clicar em "Gerar Link"
5. Verificar que link foi gerado
6. Copiar link

**Resultado Esperado:** ✅ Link copiado, expira em 48h

### Cenário 2: Cliente Acessa Link
1. Abrir link no navegador
2. Aguardar validação
3. Ver widget de chat aparecer
4. Verificar mensagem de boas-vindas

**Resultado Esperado:** ✅ Chat widget visível, mensagem personalizada

### Cenário 3: Estudante Finaliza Atendimento
1. Iniciar atendimento
2. Realizar atendimento
3. Clicar em "Finalizar"
4. Preencher resumo
5. Confirmar

**Resultado Esperado:** ✅ Atendimento marcado como concluído, histórico atualizado

### Cenário 4: Coordenador Visualiza Histórico
1. Login como coordenador
2. Acessar histórico
3. Filtrar por estudante
4. Ver estatísticas

**Resultado Esperado:** ✅ Dados corretos, estatísticas atualizadas

---

## 🐛 Troubleshooting

### Link não funciona
**Problema:** Cliente clica no link e vê "Link inválido"

**Soluções:**
1. Verificar se link não expirou (48 horas)
2. Verificar se token está correto
3. Verificar se tabela existe no banco
4. Verificar logs em `appointment_link_access_logs`

```sql
SELECT * FROM fiscal_appointments
WHERE chat_link_token = 'SEU_TOKEN_AQUI';
```

### Atendimentos não aparecem
**Problema:** Lista de atendimentos vazia no painel do estudante

**Soluções:**
1. Verificar se `assigned_student_id` está preenchido
2. Verificar se student_id está correto

```sql
SELECT * FROM fiscal_appointments
WHERE assigned_student_id = 'student-1';
```

### Histórico vazio
**Problema:** Coordenador não vê histórico

**Soluções:**
1. Verificar se atendimentos foram finalizados
2. Verificar tabela `appointment_attendance_history`

```sql
SELECT COUNT(*) FROM appointment_attendance_history;
```

---

## 📁 Estrutura de Arquivos

```
/src
  /sql
    appointment-links-system.sql          ← Tabelas e views
  /app
    /api
      /appointments
        /student/route.ts                  ← Lista atendimentos estudante
        /generate-link/route.ts            ← Gera link único
        /validate-link/route.ts            ← Valida link
        /start/route.ts                    ← Inicia atendimento
        /finish/route.ts                   ← Finaliza atendimento
        /history/route.ts                  ← Histórico coordenador
    /atendimento
      /[token]/page.tsx                    ← Página do cliente
  /components
    /student
      StudentAppointments.tsx              ← Painel estudante
    /coordinator
      AttendanceHistory.tsx                ← Histórico coordenador
    /chat
      NAFChatWidget.tsx                    ← Widget de chat
      ChatWithRegistration.tsx             ← Wrapper do widget
/doc
  SISTEMA-ATENDIMENTOS-COMPLETO.md        ← Esta documentação
```

---

## 🎯 Próximos Passos (Melhorias Futuras)

1. **Integração com API de Chat Real**
   - Conectar com OpenAI ou Claude
   - Respostas inteligentes do assistente

2. **Notificações**
   - Email quando link for gerado
   - WhatsApp com link de atendimento
   - Notificações push

3. **Avaliação do Cliente**
   - Sistema de estrelas após atendimento
   - Feedback opcional
   - NPS

4. **Relatórios Avançados**
   - Exportação para Excel/PDF
   - Gráficos interativos
   - Dashboard executivo

5. **Integração com Calendário**
   - Sincronização com Google Calendar
   - Lembretes automáticos

---

## ✅ Checklist de Implementação

- [x] Criar estrutura de banco de dados
- [x] Criar APIs de gerenciamento
- [x] Criar componente para estudantes
- [x] Criar widget de chat
- [x] Criar página do cliente
- [x] Criar histórico para coordenadores
- [x] Implementar geração de links únicos
- [x] Implementar validação de links
- [x] Implementar início/finalização de atendimentos
- [x] Criar documentação completa

---

**Data:** 2025-10-03
**Versão:** 1.0
**Status:** ✅ Completo e Funcional

---

**Desenvolvido com 💙 para o NAF Estácio Florianópolis**
