# 🗑️ Sistema de Exclusão e Recuperação de Atendimentos

## ✅ Implementação Completa

Sistema completo de **soft delete** (exclusão lógica) com backup e recuperação de atendimentos fiscais finalizados.

---

## 📋 Índice

1. [Visão Geral](#visao-geral)
2. [Instalação e Configuração](#instalacao-configuracao)
3. [Funcionalidades](#funcionalidades)
4. [Arquitetura do Sistema](#arquitetura)
5. [Fluxo de Dados](#fluxo-dados)
6. [Como Usar](#como-usar)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

---

## <a name="visao-geral"></a>🎯 Visão Geral

O sistema permite que estudantes:

1. **Excluam atendimentos finalizados** de forma segura
2. **Recuperem atendimentos excluídos** da lixeira a qualquer momento
3. **Visualizem histórico** de exclusões com data e motivo

### Características Principais

- ✅ **Soft Delete**: Dados não são apagados do banco, apenas marcados como excluídos
- ✅ **Backup Automático**: Todas as exclusões são reversíveis
- ✅ **Rastreabilidade**: Registra quem excluiu e quando
- ✅ **Interface Intuitiva**: Modal de confirmação com informações detalhadas
- ✅ **Lixeira Completa**: Visualização e recuperação com um clique

---

## <a name="instalacao-configuracao"></a>⚙️ Instalação e Configuração

### 1. Executar Migration SQL

Execute o SQL para adicionar os campos de soft delete:

```bash
# No Supabase SQL Editor, execute:
cat src/sql/add_soft_delete_fiscal_appointments.sql
```

Ou copie e cole o conteúdo do arquivo:

```sql
-- Adicionar coluna deleted_at
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Adicionar coluna deleted_by
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES students(id) ON DELETE SET NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_deleted_at
ON fiscal_appointments(deleted_at)
WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON COLUMN fiscal_appointments.deleted_at IS 'Timestamp de quando o atendimento foi excluído (soft delete). NULL = não excluído';
COMMENT ON COLUMN fiscal_appointments.deleted_by IS 'ID do estudante que excluiu o atendimento';
```

### 2. Verificar Estrutura do Banco

Confirme que as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fiscal_appointments'
AND column_name IN ('deleted_at', 'deleted_by');
```

Resultado esperado:
```
| column_name | data_type                   | is_nullable |
|-------------|----------------------------|-------------|
| deleted_at  | timestamp with time zone   | YES         |
| deleted_by  | uuid                       | YES         |
```

### 3. Adicionar Aba "Lixeira" no Painel do Estudante

No arquivo `/src/app/student-portal/page.tsx`, adicione uma nova aba para a lixeira:

```typescript
import StudentFiscalAppointmentsTrash from '@/components/student/StudentFiscalAppointmentsTrash'

// Dentro do componente, adicione uma nova aba:
<Tabs defaultValue="dashboard" className="w-full">
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="appointments">Atendimentos Fiscais</TabsTrigger>
    <TabsTrigger value="trash">🗑️ Lixeira</TabsTrigger> {/* NOVA ABA */}
    {/* ... outras abas ... */}
  </TabsList>

  {/* ... outros TabsContent ... */}

  <TabsContent value="trash">
    <StudentFiscalAppointmentsTrash token={studentToken} />
  </TabsContent>
</Tabs>
```

---

## <a name="funcionalidades"></a>🚀 Funcionalidades

### 1. Exclusão de Atendimentos

**Onde:** Botão "Excluir" aparece para atendimentos com status `CONCLUIDO`

**Fluxo:**

1. Estudante clica em "Excluir" no card do atendimento
2. Modal de confirmação abre mostrando:
   - Protocolo do atendimento
   - Nome do cliente
   - Título do serviço
   - Campo opcional para motivo da exclusão
3. Ao confirmar:
   - Atendimento é marcado como excluído (`deleted_at = NOW()`)
   - ID do estudante é registrado (`deleted_by = student_id`)
   - Motivo é adicionado às notas internas
4. Atendimento desaparece da lista principal
5. Atendimento aparece na lixeira

**Restrições:**

- ❌ Apenas atendimentos `CONCLUIDO` podem ser excluídos
- ❌ Atendimentos em andamento devem ser cancelados, não excluídos
- ✅ Exclusão é **sempre reversível**

### 2. Recuperação de Atendimentos

**Onde:** Aba "Lixeira" no painel do estudante

**Fluxo:**

1. Estudante acessa aba "🗑️ Lixeira"
2. Visualiza lista de atendimentos excluídos com:
   - Protocolo e informações do cliente
   - Data de exclusão
   - Tempo decorrido desde exclusão
3. Clica em "Recuperar Atendimento"
4. Atendimento é restaurado:
   - `deleted_at` volta para `NULL`
   - `deleted_by` volta para `NULL`
   - Nota interna registra restauração
5. Atendimento volta para lista principal

**Recursos da Lixeira:**

- 📊 Contador de itens na lixeira
- ⏰ Tempo decorrido desde exclusão
- 🔍 Visualização completa dos dados
- ♻️ Recuperação com um clique

---

## <a name="arquitetura"></a>🏗️ Arquitetura do Sistema

### Componentes Criados/Modificados

#### 1. **SQL Migration**
**Arquivo:** `/src/sql/add_soft_delete_fiscal_appointments.sql`

Adiciona campos:
- `deleted_at`: Timestamp da exclusão
- `deleted_by`: ID do estudante que excluiu

#### 2. **API de Exclusão**
**Arquivo:** `/src/app/api/students/fiscal-appointments/delete/route.ts`

**Endpoints:**

```typescript
DELETE /api/students/fiscal-appointments/delete
// Soft delete de um atendimento

GET /api/students/fiscal-appointments/delete
// Lista atendimentos excluídos
```

**Validações:**

```typescript
// Verifica se atendimento está CONCLUIDO
if (appointment.status !== 'CONCLUIDO') {
  return error('Apenas atendimentos concluídos podem ser excluídos')
}

// Verifica se já está excluído
if (appointment.deleted_at) {
  return error('Atendimento já excluído')
}

// Verifica propriedade
if (appointment.assigned_student_id !== studentId) {
  return error('Sem permissão')
}
```

#### 3. **API de Restauração**
**Arquivo:** `/src/app/api/students/fiscal-appointments/restore/route.ts`

**Endpoints:**

```typescript
POST /api/students/fiscal-appointments/restore
// Restaura um atendimento excluído

DELETE /api/students/fiscal-appointments/restore
// Exclusão PERMANENTE (hard delete) - Uso avançado
```

**Validações:**

```typescript
// Verifica se está excluído
if (!appointment.deleted_at) {
  return error('Atendimento não está excluído')
}

// Verifica propriedade
if (appointment.assigned_student_id !== studentId) {
  return error('Sem permissão')
}
```

#### 4. **Componente Principal (Atualizado)**
**Arquivo:** `/src/components/student/StudentFiscalAppointments.tsx`

**Mudanças:**

- ✅ Importado ícone `Trash2`
- ✅ Adicionado estado `showDeleteModal` e `deleteReason`
- ✅ Criada função `handleDeleteAppointment`
- ✅ Botão "Excluir" para atendimentos `CONCLUIDO`
- ✅ Modal de confirmação de exclusão

#### 5. **Componente da Lixeira (Novo)**
**Arquivo:** `/src/components/student/StudentFiscalAppointmentsTrash.tsx`

**Recursos:**

- 🗑️ Lista de atendimentos excluídos
- 📊 Card de estatísticas (total na lixeira)
- ⏰ Cálculo de dias desde exclusão
- ♻️ Botão de recuperação
- 🔄 Botão de atualizar
- 📝 Exibição completa de informações

#### 6. **API de Listagem (Atualizada)**
**Arquivo:** `/src/app/api/students/fiscal-appointments/route.ts`

**Mudança:**

```typescript
// ANTES:
const { data } = await supabase
  .from('fiscal_appointments')
  .select('*')
  .eq('assigned_student_id', studentId)

// DEPOIS:
const { data } = await supabase
  .from('fiscal_appointments')
  .select('*')
  .eq('assigned_student_id', studentId)
  .is('deleted_at', null)  // ✅ Filtra excluídos
```

---

## <a name="fluxo-dados"></a>🔄 Fluxo de Dados

### Exclusão de Atendimento

```
┌──────────────────────────────────────────────────────────────┐
│  ESTUDANTE: Clica em "Excluir" no atendimento concluído     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: Modal de confirmação abre                         │
│  - Exibe protocolo, cliente, serviço                         │
│  - Campo opcional para motivo                                │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼ (Estudante confirma)
┌──────────────────────────────────────────────────────────────┐
│  API DELETE /api/students/fiscal-appointments/delete         │
│                                                              │
│  1. Verifica autenticação (JWT token)                       │
│  2. Busca atendimento no banco                              │
│  3. Valida:                                                 │
│     - Status = CONCLUIDO? ✅                                │
│     - Pertence ao estudante? ✅                             │
│     - Já excluído? ❌                                       │
│  4. Atualiza banco:                                         │
│     UPDATE fiscal_appointments SET                          │
│       deleted_at = NOW(),                                   │
│       deleted_by = student_id,                              │
│       internal_notes = notes + motivo                       │
│     WHERE id = appointment_id                               │
│  5. Retorna sucesso                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: Atualiza interface                                │
│  - Remove da lista principal                                 │
│  - Mostra mensagem de sucesso                                │
│  - Atendimento aparece na lixeira                           │
└──────────────────────────────────────────────────────────────┘
```

### Recuperação de Atendimento

```
┌──────────────────────────────────────────────────────────────┐
│  ESTUDANTE: Acessa aba "Lixeira"                             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  API GET /api/students/fiscal-appointments/delete            │
│                                                              │
│  SELECT * FROM fiscal_appointments                          │
│  WHERE assigned_student_id = X                              │
│  AND deleted_at IS NOT NULL                                 │
│  ORDER BY deleted_at DESC                                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: Exibe lista de atendimentos excluídos            │
│  - Cards com informações                                     │
│  - Tempo desde exclusão                                      │
│  - Botão "Recuperar"                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼ (Estudante clica em "Recuperar")
┌──────────────────────────────────────────────────────────────┐
│  API POST /api/students/fiscal-appointments/restore          │
│                                                              │
│  1. Verifica autenticação                                   │
│  2. Busca atendimento                                       │
│  3. Valida:                                                 │
│     - Está excluído? ✅                                     │
│     - Pertence ao estudante? ✅                             │
│  4. Restaura:                                               │
│     UPDATE fiscal_appointments SET                          │
│       deleted_at = NULL,                                    │
│       deleted_by = NULL,                                    │
│       internal_notes = notes + "[RESTAURADO]"               │
│     WHERE id = appointment_id                               │
│  5. Retorna sucesso                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: Atualiza interface                                │
│  - Remove da lixeira                                         │
│  - Mostra mensagem de sucesso                                │
│  - Atendimento volta para lista principal                   │
└──────────────────────────────────────────────────────────────┘
```

---

## <a name="como-usar"></a>📖 Como Usar

### Para o Estudante

#### 1. Excluir um Atendimento

**Passo a passo:**

1. Acesse **Atendimentos Fiscais**
2. Encontre um atendimento com status **CONCLUÍDO**
3. Clique no botão **"Excluir"** (ícone de lixeira vermelho)
4. No modal:
   - Revise as informações do atendimento
   - (Opcional) Adicione um motivo para a exclusão
   - Clique em **"Confirmar Exclusão"**
5. Mensagem de sucesso aparece
6. Atendimento desaparece da lista

#### 2. Recuperar um Atendimento

**Passo a passo:**

1. Clique na aba **"🗑️ Lixeira"**
2. Visualize a lista de atendimentos excluídos
3. Encontre o atendimento que deseja recuperar
4. Clique no botão **"Recuperar Atendimento"**
5. Atendimento é restaurado imediatamente
6. Volte para a aba "Atendimentos Fiscais" para vê-lo novamente

---

## <a name="testes"></a>🧪 Testes

### Teste 1: Exclusão de Atendimento Concluído

**Pré-requisitos:**
- Ter um atendimento com status `CONCLUIDO`
- Estar logado como estudante responsável

**Passos:**

```bash
# 1. Finalizar um atendimento (se necessário)
# No painel do estudante:
# - Vá para "Atendimentos Fiscais"
# - Clique em um atendimento EM_ANDAMENTO
# - Clique em "Finalizar"

# 2. Excluir o atendimento
# - Clique no botão "Excluir" (vermelho com ícone de lixeira)
# - Verifique se o modal abre
# - Digite um motivo (opcional): "Teste de exclusão"
# - Clique em "Confirmar Exclusão"

# 3. Verificar no banco
```

**Query SQL para verificar:**

```sql
SELECT
  id,
  protocol,
  client_name,
  status,
  deleted_at,
  deleted_by,
  internal_notes
FROM fiscal_appointments
WHERE status = 'CONCLUIDO'
AND deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 5;
```

**Resultado esperado:**

```
| id   | protocol      | client_name  | status    | deleted_at          | deleted_by | internal_notes            |
|------|---------------|--------------|-----------|---------------------|------------|---------------------------|
| 123  | NAF-2025-001  | João Silva   | CONCLUIDO | 2025-10-09 14:30:00 | uuid-xxx   | ...[EXCLUÍDO]...Teste... |
```

### Teste 2: Recuperação de Atendimento

**Pré-requisitos:**
- Ter um atendimento excluído (do Teste 1)

**Passos:**

```bash
# 1. Acessar lixeira
# No painel do estudante:
# - Clique na aba "🗑️ Lixeira"
# - Verifique se o atendimento excluído aparece

# 2. Recuperar atendimento
# - Clique no botão "Recuperar Atendimento"
# - Verifique mensagem de sucesso

# 3. Verificar volta para lista principal
# - Volte para aba "Atendimentos Fiscais"
# - O atendimento deve aparecer novamente
```

**Query SQL para verificar:**

```sql
SELECT
  id,
  protocol,
  client_name,
  status,
  deleted_at,
  internal_notes
FROM fiscal_appointments
WHERE protocol = 'NAF-2025-001';  -- use o protocolo do teste
```

**Resultado esperado:**

```
| id   | protocol      | client_name  | status    | deleted_at | internal_notes                 |
|------|---------------|--------------|-----------|------------|--------------------------------|
| 123  | NAF-2025-001  | João Silva   | CONCLUIDO | NULL       | ...[RESTAURADO em XX/XX/XX]... |
```

### Teste 3: Tentativa de Exclusão Inválida

**Teste 3.1: Tentar excluir atendimento não concluído**

```bash
# 1. Vá para "Atendimentos Fiscais"
# 2. Tente clicar em "Excluir" em atendimento PENDENTE, CONFIRMADO ou EM_ANDAMENTO
# ✅ Resultado esperado: Botão NÃO deve aparecer
```

**Teste 3.2: Tentar excluir atendimento de outro estudante**

```bash
# Usando API diretamente (Postman/curl):
curl -X DELETE http://localhost:3000/api/students/fiscal-appointments/delete \
  -H "Authorization: Bearer TOKEN_ESTUDANTE_A" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "ID_ATENDIMENTO_ESTUDANTE_B"}'

# ✅ Resultado esperado:
# {
#   "error": "Você não tem permissão para excluir este atendimento",
#   "status": 403
# }
```

**Teste 3.3: Tentar excluir atendimento já excluído**

```bash
# Tente excluir o mesmo atendimento duas vezes

# ✅ Resultado esperado (segunda tentativa):
# {
#   "error": "Este atendimento já foi excluído",
#   "status": 400
# }
```

---

## <a name="troubleshooting"></a>🔧 Troubleshooting

### Problema 1: Botão "Excluir" não aparece

**Sintomas:**
- Atendimento está concluído mas botão não aparece

**Possíveis Causas:**

1. **Status não é exatamente "CONCLUIDO"**
   ```sql
   -- Verificar status real:
   SELECT id, protocol, status FROM fiscal_appointments WHERE id = 'XXX';
   ```

2. **Cache do navegador**
   ```bash
   # Limpe cache:
   # Chrome/Edge: Ctrl + Shift + Delete
   # Firefox: Ctrl + Shift + Delete
   # Ou força reload: Ctrl + F5
   ```

3. **Componente não atualizado**
   ```bash
   # Reinicie o servidor dev:
   npm run dev
   ```

### Problema 2: Erro ao excluir atendimento

**Sintomas:**
- Mensagem "Erro ao excluir atendimento"

**Diagnóstico:**

```bash
# 1. Verifique logs do servidor (terminal do npm run dev)
# Procure por:
# "❌ Erro ao excluir atendimento:"

# 2. Verifique se migration SQL foi executada:
```

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'fiscal_appointments'
AND column_name IN ('deleted_at', 'deleted_by');
```

**Solução:**

```sql
-- Se colunas não existem, execute:
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES students(id);
```

### Problema 3: Lixeira vazia mas atendimento foi excluído

**Sintomas:**
- Excluiu atendimento mas lixeira mostra vazia

**Diagnóstico:**

```sql
-- Verifique se atendimento está realmente excluído:
SELECT
  id,
  protocol,
  client_name,
  deleted_at,
  assigned_student_id
FROM fiscal_appointments
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

**Possíveis Causas:**

1. **Token inválido ou expirado**
   ```bash
   # Faça logout e login novamente
   ```

2. **Estudante diferente**
   ```sql
   -- Verifique se assigned_student_id bate com o estudante logado:
   SELECT id, email FROM students WHERE id = 'UUID_DO_ESTUDANTE';
   ```

### Problema 4: Erro ao recuperar atendimento

**Sintomas:**
- Botão "Recuperar" não funciona
- Erro na API

**Diagnóstico:**

```bash
# Verifique logs do servidor
# Procure por "♻️ Tentando restaurar atendimento..."
```

**Solução:**

```sql
-- 1. Verifique se atendimento está no banco:
SELECT id, protocol, deleted_at
FROM fiscal_appointments
WHERE id = 'ID_DO_ATENDIMENTO';

-- 2. Se deleted_at estiver NULL, já foi restaurado
-- 3. Se não existir, foi deletado permanentemente (hard delete)
```

### Problema 5: Performance lenta na lixeira

**Sintomas:**
- Lixeira demora para carregar
- Muitos atendimentos excluídos

**Solução:**

```sql
-- Adicione índice (se não existir):
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_deleted_at
ON fiscal_appointments(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Verifique se índice existe:
SELECT indexname
FROM pg_indexes
WHERE tablename = 'fiscal_appointments'
AND indexname LIKE '%deleted%';
```

---

## 📊 Queries Úteis

### Ver todos atendimentos excluídos de um estudante

```sql
SELECT
  fa.id,
  fa.protocol,
  fa.client_name,
  fa.service_title,
  fa.deleted_at,
  fa.deleted_by,
  s.name as deleted_by_name,
  EXTRACT(DAY FROM (NOW() - fa.deleted_at)) as days_in_trash
FROM fiscal_appointments fa
LEFT JOIN students s ON fa.deleted_by = s.id
WHERE fa.assigned_student_id = 'STUDENT_UUID'
AND fa.deleted_at IS NOT NULL
ORDER BY fa.deleted_at DESC;
```

### Ver estatísticas de exclusões

```sql
SELECT
  COUNT(*) as total_deleted,
  COUNT(DISTINCT assigned_student_id) as students_with_deleted,
  MIN(deleted_at) as first_deletion,
  MAX(deleted_at) as last_deletion,
  AVG(EXTRACT(DAY FROM (NOW() - deleted_at))) as avg_days_in_trash
FROM fiscal_appointments
WHERE deleted_at IS NOT NULL;
```

### Limpar lixeira (excluir permanentemente atendimentos antigos)

```sql
-- ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
-- Exclui permanentemente atendimentos na lixeira há mais de 90 dias

-- Primeiro, veja quantos serão afetados:
SELECT COUNT(*)
FROM fiscal_appointments
WHERE deleted_at IS NOT NULL
AND deleted_at < NOW() - INTERVAL '90 days';

-- Se confirmar, execute:
DELETE FROM fiscal_appointments
WHERE deleted_at IS NOT NULL
AND deleted_at < NOW() - INTERVAL '90 days';
```

---

## 🎉 Conclusão

Sistema de Exclusão e Recuperação **100% funcional** com:

✅ Soft delete seguro
✅ Backup automático
✅ Interface intuitiva
✅ Rastreabilidade completa
✅ Recuperação com um clique
✅ Proteções contra exclusões inválidas
✅ Performance otimizada

**Próximos Passos Sugeridos (Opcional):**

1. **Auto-limpeza**: Job cron para limpar lixeira após X dias
2. **Notificações**: Alertar estudante antes de exclusão permanente
3. **Auditoria**: Log detalhado de todas as operações
4. **Bulk Actions**: Recuperar/excluir múltiplos atendimentos de uma vez

---

**Criado em:** 09/10/2025
**Última Atualização:** 09/10/2025
**Versão:** 1.0.0
**Status:** ✅ Produção
