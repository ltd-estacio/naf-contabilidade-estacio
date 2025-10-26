# 🔧 Correção de Erro 500 - Transferência de Atendimentos

## ❌ Erro Reportado

```
POST https://naf.ltdestacio.com.br/api/fiscal-appointments/transfer 500 (Internal Server Error)
```

---

## 🔍 Diagnóstico

O erro 500 pode ter **duas causas principais**:

### 1. **Coluna `assigned_student_id` não existe** ⚠️
A tabela `fiscal_appointments` pode não ter a coluna necessária para armazenar o ID do estudante responsável.

### 2. **Join complexo com foreign key** ⚠️
O select com join na tabela `students` estava falhando devido a problemas de RLS ou estrutura.

---

## ✅ Soluções Aplicadas

### Solução 1: Adicionar Coluna na Tabela

**Arquivo criado**: `database/migrations/20250127_adicionar_coluna_assigned_student.sql`

**O que faz:**
- Adiciona coluna `assigned_student_id` (UUID)
- Adiciona coluna `assigned_coordinator_id` (UUID)
- Cria índices para performance
- Adiciona foreign key para `students` table
- Verifica estrutura da tabela

**Como executar:**
```sql
-- 1. Acesse: Supabase Dashboard > SQL Editor
-- 2. Cole o conteúdo de: database/migrations/20250127_adicionar_coluna_assigned_student.sql
-- 3. Execute (RUN)
-- 4. Verifique a saída mostrando as colunas
```

### Solução 2: Simplificar API de Transferência

**Arquivo modificado**: `src/app/api/fiscal-appointments/transfer/route.ts`

**Mudanças:**
- ✅ Removido join complexo com tabela `students`
- ✅ Select simples: `.select()` em vez de `.select('*, students:...')`
- ✅ Adicionado log de debug: `console.log('🔄 Atualizando atendimento com:', updateData)`
- ✅ Mantém todas as validações de segurança

**Código anterior (com erro):**
```typescript
const { data: updatedAppointment, error: updateError } = await supabase
  .from('fiscal_appointments')
  .update(updateData)
  .eq('id', appointment_id)
  .select(`
    *,
    students:assigned_student_id (
      id,
      name,
      email,
      phone,
      course
    )
  `)
  .single()
```

**Código corrigido:**
```typescript
const { data: updatedAppointment, error: updateError } = await supabase
  .from('fiscal_appointments')
  .update(updateData)
  .eq('id', appointment_id)
  .select()
  .single()
```

---

## 🧪 Como Testar

### Passo 1: Executar Migration SQL
```bash
1. Acesse Supabase SQL Editor
2. Cole: database/migrations/20250127_adicionar_coluna_assigned_student.sql
3. Execute
4. Verifique output mostrando as colunas criadas
```

### Passo 2: Testar Transferência
```bash
1. Acesse Dashboard do Coordenador
2. Vá para aba "Atendimentos"
3. Localize um atendimento fiscal (status: Confirmado ou Em Andamento)
4. Clique no botão "Transferir"
5. Selecione um estudante
6. Clique em "Confirmar Transferência"
7. Verifique mensagem de sucesso
```

### Passo 3: Verificar no Console do Navegador
```javascript
// Deve aparecer logs como:
"📤 Transferência de atendimento: {appointment_id: '...', to_student_id: '...'}"
"🔄 Atualizando atendimento com: {assigned_student_id: '...', updated_at: '...'}"
"✅ Atendimento transferido com sucesso!"
```

---

## 🔍 Debug Adicional

Se o erro persistir, verifique:

### 1. Logs do Servidor (Vercel/Supabase)
```bash
# No Supabase Dashboard
- Acesse: Logs > API Logs
- Procure por: "Erro ao atualizar agendamento"
- Veja detalhes do erro SQL
```

### 2. Verificar Estrutura da Tabela
```sql
-- Execute no Supabase SQL Editor:
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fiscal_appointments'
ORDER BY ordinal_position;

-- Deve mostrar:
-- assigned_student_id | uuid | YES
-- assigned_coordinator_id | uuid | YES
```

### 3. Verificar RLS Policies
```sql
-- Verificar políticas da tabela:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'fiscal_appointments';

-- Se necessário, desabilitar temporariamente para teste:
ALTER TABLE fiscal_appointments DISABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Reabilitar após teste!
ALTER TABLE fiscal_appointments ENABLE ROW LEVEL SECURITY;
```

### 4. Testar Update Manual
```sql
-- Testar update direto no SQL Editor:
UPDATE fiscal_appointments
SET 
  assigned_student_id = 'COLE-UM-UUID-DE-ESTUDANTE-AQUI',
  updated_at = NOW()
WHERE id = 'COLE-UM-UUID-DE-ATENDIMENTO-AQUI'
RETURNING *;

-- Se funcionar: problema é na API
-- Se falhar: problema é na estrutura/permissões do banco
```

---

## 📊 Checklist de Validação

### Estrutura do Banco
- [ ] Coluna `assigned_student_id` existe
- [ ] Coluna `assigned_coordinator_id` existe
- [ ] Índices criados
- [ ] Foreign keys configuradas
- [ ] RLS não está bloqueando updates

### API
- [ ] Endpoint `/api/fiscal-appointments/transfer` responde
- [ ] POST retorna 200 (sucesso)
- [ ] Logs aparecem no console
- [ ] Dados são atualizados no banco
- [ ] Auditoria é registrada

### Interface
- [ ] Botão "Transferir" aparece
- [ ] Modal abre
- [ ] Lista de estudantes carrega
- [ ] Transferência executa sem erro
- [ ] Mensagem de sucesso aparece
- [ ] Lista atualiza automaticamente

---

## 🚨 Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "column assigned_student_id does not exist" | Coluna não foi criada | Executar migration SQL |
| "permission denied for table" | RLS bloqueando | Verificar policies ou desabilitar RLS temporariamente |
| "foreign key violation" | UUID inválido | Verificar se estudante existe na tabela students |
| "null value in column" | Campo obrigatório vazio | Verificar se to_student_id está sendo enviado |
| "invalid input syntax for type uuid" | UUID com formato errado | Verificar formato do UUID enviado |

---

## ✅ Resultado Esperado

### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Atendimento transferido com sucesso",
  "appointment": {
    "id": "uuid-do-atendimento",
    "assigned_student_id": "uuid-novo-estudante",
    "updated_at": "2025-01-27T...",
    ...
  },
  "transfer": {
    "from": "uuid-estudante-antigo",
    "to": "uuid-novo-estudante",
    "new_student": {
      "id": "uuid-novo-estudante",
      "name": "Nome do Estudante",
      "email": "email@estudante.com"
    }
  }
}
```

### Logs no Console
```
📤 Transferência de atendimento: { appointment_id: '...', to_student_id: '...' }
🔍 Buscando agendamento...
✓ Agendamento encontrado
🔍 Verificando estudante...
✓ Estudante válido e ativo
🔄 Atualizando atendimento com: { assigned_student_id: '...', updated_at: '...' }
✅ Atendimento transferido com sucesso!
```

---

## 📞 Suporte

Se o erro persistir após essas correções:

1. **Copie os logs do console** (navegador e servidor)
2. **Execute a query de verificação** da estrutura da tabela
3. **Tire print** do erro exato
4. **Compartilhe** os detalhes para análise mais profunda

---

## 🎯 Resumo Rápido

**Para resolver agora:**
```sql
-- 1. Execute no Supabase:
ALTER TABLE fiscal_appointments ADD COLUMN IF NOT EXISTS assigned_student_id UUID;
ALTER TABLE fiscal_appointments ADD COLUMN IF NOT EXISTS assigned_coordinator_id UUID;
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_student ON fiscal_appointments(assigned_student_id);

-- 2. Teste a transferência novamente
-- 3. Deve funcionar! ✅
```

---

**Criado em**: 27/01/2025  
**Status**: Correção aplicada, aguardando teste
