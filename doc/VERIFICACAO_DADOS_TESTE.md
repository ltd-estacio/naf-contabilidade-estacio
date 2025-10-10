# 🔍 Verificação de Dados para Teste de Transferência

## Passo 1: Verificar Estudantes Disponíveis

Execute no **Supabase SQL Editor**:

```sql
-- Verificar estudantes ativos
SELECT id, name, email, status, course
FROM students
WHERE status = 'ATIVO'
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado:** Pelo menos 1 estudante ativo

---

## Passo 2: Verificar Coordenadores Disponíveis

```sql
-- Verificar coordenadores ativos
SELECT id, email, is_active, created_at
FROM coordinator_users
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado:** Pelo menos 1 coordenador ativo

---

## Passo 3: Verificar Conversas de Chat

```sql
-- Verificar conversas ativas ou recentes
SELECT
  id,
  user_id,
  status,
  coordinator_id,
  student_id,
  (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = chat_conversations.id) as message_count,
  created_at
FROM chat_conversations
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado:** Pelo menos 1 conversa (pode estar vazia, vamos criar mensagens no teste)

---

## Se NÃO houver dados suficientes, execute:

### **Criar Coordenadores de Teste**

```sql
-- Inserir 3 coordenadores de teste
INSERT INTO coordinator_users (id, email, is_active, created_at)
VALUES
  (gen_random_uuid(), 'maria.santos@naf.com', true, NOW()),
  (gen_random_uuid(), 'carlos.lima@naf.com', true, NOW()),
  (gen_random_uuid(), 'ana.costa@naf.com', true, NOW())
ON CONFLICT (email) DO NOTHING;
```

### **Criar Estudantes de Teste**

```sql
-- Inserir 3 estudantes de teste
INSERT INTO students (id, name, email, status, course, created_at)
VALUES
  (
    gen_random_uuid(),
    'Pedro Silva',
    'pedro.silva@estudante.com',
    'ATIVO',
    'Ciências Contábeis',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Julia Oliveira',
    'julia.oliveira@estudante.com',
    'ATIVO',
    'Administração',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Lucas Santos',
    'lucas.santos@estudante.com',
    'ATIVO',
    'Economia',
    NOW()
  )
ON CONFLICT (email) DO NOTHING;
```

---

## Passo 4: Verificar que os Dados Foram Criados

```sql
-- Contar total de atendentes disponíveis
SELECT
  'Coordenadores' as tipo,
  COUNT(*) as total
FROM coordinator_users
WHERE is_active = true

UNION ALL

SELECT
  'Estudantes' as tipo,
  COUNT(*) as total
FROM students
WHERE status = 'ATIVO';
```

**Resultado esperado:**
```
tipo           | total
---------------|------
Coordenadores  | 3+
Estudantes     | 3+
```

---

## Passo 5: Testar API de Atendentes Disponíveis

Após criar os dados, teste a API diretamente no navegador:

```
http://localhost:4000/api/chat/available-attendants?type=all
```

**Resultado esperado (JSON):**

```json
{
  "success": true,
  "attendants": [
    {
      "id": "uuid-xxx",
      "name": "Maria Santos",
      "email": "maria.santos@naf.com",
      "type": "coordinator",
      "available": true,
      "specialties": ["Contabilidade", "Tributário", "Fiscal"],
      "active_chats": 0
    },
    {
      "id": "uuid-yyy",
      "name": "Pedro Silva",
      "email": "pedro.silva@estudante.com",
      "type": "student",
      "available": true,
      "specialties": ["Contabilidade", "Balanços", "Demonstrativos"],
      "active_chats": 0
    }
    // ... mais atendentes
  ],
  "total": 6,
  "available_count": 6
}
```

---

## ✅ Checklist de Pré-requisitos

- [ ] Pelo menos 1 coordenador ativo no banco
- [ ] Pelo menos 1 estudante ativo no banco
- [ ] Tabelas `chat_transfer_requests` e `chat_notifications` criadas (via fix-chat-transfer-tables.sql)
- [ ] API `/api/chat/available-attendants` retorna atendentes reais
- [ ] Servidor rodando em `http://localhost:4000`

---

**Próximo passo:** Após verificar os dados, siga para `TESTE_TRANSFERENCIA_CHAT.md` para testar a funcionalidade completa!
