# 🚀 Guia Rápido - Teste de Transferência de Conversas

## ⚡ Teste em 5 Minutos

### **PASSO 1: Execute o SQL no Supabase** ⏱️ 2 min

1. Acesse: https://app.supabase.com
2. Selecione seu projeto NAF
3. Clique em **SQL Editor** (menu lateral)
4. **Cole e execute** este SQL:

```sql
-- IMPORTANTE: Este SQL corrige os tipos de dados incompatíveis
-- Copie TODO o conteúdo abaixo e execute de uma vez

-- 1. REMOVER TABELAS EXISTENTES (se houver erro anterior)
DROP TABLE IF EXISTS chat_notifications CASCADE;
DROP TABLE IF EXISTS chat_transfer_requests CASCADE;

-- 2. CRIAR TABELA chat_transfer_requests COM TIPOS CORRETOS
CREATE TABLE chat_transfer_requests (
  id TEXT PRIMARY KEY,
  conversation_id INTEGER NOT NULL,  -- ✅ INTEGER (não TEXT!)
  from_user_id TEXT NOT NULL,
  from_user_type TEXT NOT NULL,
  from_user_name TEXT,
  to_user_id TEXT NOT NULL,
  to_user_type TEXT NOT NULL,
  to_user_name TEXT,
  transfer_reason TEXT,
  transfer_notes TEXT,
  status TEXT DEFAULT 'pending',
  transferred_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chat_transfer_requests_conversation_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_transfer_conversation ON chat_transfer_requests(conversation_id);
CREATE INDEX idx_transfer_to_user ON chat_transfer_requests(to_user_id);
CREATE INDEX idx_transfer_status ON chat_transfer_requests(status);

-- 3. CRIAR TABELA chat_notifications
CREATE TABLE chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  conversation_id INTEGER,  -- ✅ INTEGER (não TEXT!)
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  CONSTRAINT chat_notifications_conversation_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON chat_notifications(user_id);
CREATE INDEX idx_notif_type ON chat_notifications(notification_type);
CREATE INDEX idx_notif_read ON chat_notifications(is_read);

-- 4. ADICIONAR COLUNAS FALTANTES
ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS transferred_from TEXT,
  ADD COLUMN IF NOT EXISTS transfer_pending BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS coordinator_name TEXT;

-- 5. ATUALIZAR CONSTRAINT
ALTER TABLE chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;

ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_sender_type_check
  CHECK (sender_type IN ('user', 'assistant', 'coordinator', 'system'));
```

**✅ Resultado esperado:** "Success. No rows returned"

---

### **PASSO 2: Verificar se Funcionou** ⏱️ 30 seg

Execute este SQL para confirmar:

```sql
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'chat_transfer_requests'
  AND column_name = 'conversation_id';
```

**✅ Deve retornar:**
```
column_name      | data_type
-----------------|----------
conversation_id  | integer
```

---

### **PASSO 3: Abrir o Chat e Testar** ⏱️ 2 min

1. **Abra o navegador:** http://localhost:4000

2. **Clique no chat** (ícone flutuante no canto inferior direito)

3. **Faça login/cadastro** se necessário

4. **Envie 3-5 mensagens de teste:**
   ```
   Olá, preciso de ajuda
   Tenho dúvidas sobre imposto de renda
   Como faço para declarar MEI?
   ```

5. **Clique no botão "🔄 Transferir"**

---

### **PASSO 4: Verificar Lista de Atendentes** ⏱️ 30 seg

Você deve ver uma mensagem no chat:

```
🔄 Solicitar Transferência

Encontramos 3 atendente(s) disponível(is) para transferência:

• Coordenadores: Questões complexas, supervisão, casos especializados
• Estudantes: Atendimento especializado por área de conhecimento

3 atendente(s) disponível(is) agora
```

**E um modal mostrando:**
- 🟢 Coordenador Estacio Ltd2025 (disponível)
- 🟢 Admin (disponível)
- 🟢 Estevam Souza Laureth (disponível)

**✅ Confirmação:** Se aparecer esta lista com 🟢, a API está funcionando!

---

### **PASSO 5: Completar a Transferência** ⏱️ 1 min

1. **Selecione o tipo:** Coordenador ou Estudante

2. **Escolha um atendente** da lista (clique nele)

3. **Selecione o motivo:**
   - Questão complexa
   - Necessita supervisão
   - Área específica
   - Outro

4. **Adicione observações (opcional):**
   ```
   Cliente precisa de atendimento especializado em MEI
   ```

5. **Clique em "Solicitar Transferência"**

---

### **PASSO 6: Verificar Resultado** ⏱️ 1 min

**No Chat, você deve ver:**

```
✅ Transferência Solicitada!

Sua solicitação foi enviada para [Nome do Atendente] (Coordenador/Estudante).

📝 Motivo: [motivo selecionado]
📋 Observações: [suas observações]

⏳ Status: Aguardando aceitação
🕐 Tempo estimado: 5-15 minutos

Em breve você será conectado ao novo atendente!
```

**No Supabase SQL Editor, execute:**

```sql
-- Verificar se a transferência foi registrada
SELECT
  id,
  conversation_id,
  from_user_name,
  to_user_name,
  to_user_type,
  transfer_reason,
  status,
  transferred_at
FROM chat_transfer_requests
ORDER BY transferred_at DESC
LIMIT 1;
```

**✅ Deve retornar:** 1 registro com os dados da transferência

---

## 🎯 Checklist Final

- [ ] SQL executado sem erros no Supabase
- [ ] Tabela `chat_transfer_requests` tem `conversation_id` tipo INTEGER
- [ ] Chat aberto em http://localhost:4000
- [ ] Mensagens de teste enviadas
- [ ] Botão "Transferir" clicado
- [ ] Lista com 3 atendentes disponíveis apareceu
- [ ] Modal de transferência abriu
- [ ] Atendente selecionado
- [ ] Motivo e observações preenchidos
- [ ] Transferência completada
- [ ] Mensagem de confirmação apareceu
- [ ] Registro criado no banco de dados

---

## ❌ Se Algo Der Errado

### **Erro: "Nenhum atendente disponível"**

**Solução:** Execute este SQL no Supabase:

```sql
-- Criar coordenadores de teste
INSERT INTO coordinator_users (id, email, is_active, created_at)
VALUES
  (gen_random_uuid(), 'teste1@naf.com', true, NOW()),
  (gen_random_uuid(), 'teste2@naf.com', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Criar estudantes de teste
INSERT INTO students (id, name, email, status, course, created_at)
VALUES
  (gen_random_uuid(), 'Estudante Teste 1', 'est1@teste.com', 'ATIVO', 'Contabilidade', NOW()),
  (gen_random_uuid(), 'Estudante Teste 2', 'est2@teste.com', 'ATIVO', 'Administração', NOW())
ON CONFLICT (email) DO NOTHING;
```

### **Erro: "foreign key constraint cannot be implemented"**

**Causa:** Você não executou o PASSO 1

**Solução:** Execute o SQL completo do PASSO 1

### **Erro: Modal não abre**

**Causa:** Erro de JavaScript

**Solução:**
1. Abra o Console do navegador (F12)
2. Procure por erros em vermelho
3. Recarregue a página (Ctrl+R ou Cmd+R)

---

## 📊 Como Verificar Histórico Transferido

Execute no Supabase:

```sql
-- Ver todas as mensagens da conversa transferida
SELECT
  id,
  sender_type,
  sender_name,
  LEFT(content, 80) as content_preview,
  created_at
FROM chat_messages
WHERE conversation_id = (
  SELECT conversation_id
  FROM chat_transfer_requests
  ORDER BY transferred_at DESC
  LIMIT 1
)
ORDER BY created_at ASC;
```

**✅ Deve mostrar:** Todas as mensagens que você enviou antes da transferência + mensagem de sistema da transferência

---

## 🎉 Sucesso!

Se você completou todos os passos e viu:
- ✅ Lista de atendentes reais (não mockados)
- ✅ Transferência registrada no banco
- ✅ Mensagem de confirmação no chat
- ✅ Histórico completo preservado

**Parabéns! A funcionalidade de transferência está funcionando corretamente!** 🚀

---

**Tempo total estimado:** ~5-7 minutos
**Dificuldade:** Fácil
**Última atualização:** 10/10/2025
