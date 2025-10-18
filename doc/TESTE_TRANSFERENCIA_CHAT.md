# 🔄 Guia de Teste - Transferência de Conversas

## 📋 Resumo das Melhorias Implementadas

### ✅ O que foi corrigido:

1. **API de Atendentes Disponíveis** (`/api/chat/available-attendants`)
   - Busca **estudantes REAIS** do banco de dados (tabela `students`)
   - Busca **coordenadores REAIS** do banco de dados (tabela `coordinator_users`)
   - Mostra quantidade de chats ativos de cada atendente
   - Indica disponibilidade baseada na carga de trabalho
   - Especialidades baseadas em curso (estudantes) ou email (coordenadores)

2. **API de Transferência** (`/api/chat/transfer-attendant`)
   - **Transfere TODO o histórico de mensagens** da conversa
   - Salva registro de transferência no Supabase
   - Atualiza conversa com novo atendente (coordenador ou estudante)
   - Cria mensagem de sistema informando a transferência
   - Cria notificação para o novo atendente
   - Conta quantas mensagens estão sendo transferidas

3. **Interface do ChatWidget**
   - Substitui dados mockados por chamadas à API real
   - Mostra contagem de atendentes disponíveis
   - Filtra por tipo (coordenador ou estudante)
   - Exibe status de disponibilidade com emoji (🟢/🔴)

---

## 🧪 Como Testar a Funcionalidade

### **Pré-requisitos**

Antes de testar, certifique-se de ter:

1. ✅ **Estudantes cadastrados** na tabela `students` com `status = 'ATIVO'`
2. ✅ **Coordenadores cadastrados** na tabela `coordinator_users` com `is_active = true`
3. ✅ **Pelo menos 1 conversa ativa** no chat para transferir

---

### **PASSO 1: Verificar Dados no Supabase**

Execute no **Supabase SQL Editor**:

```sql
-- 1. Verificar estudantes disponíveis
SELECT id, name, email, status, course
FROM students
WHERE status = 'ATIVO';

-- 2. Verificar coordenadores disponíveis
SELECT id, email, is_active
FROM coordinator_users
WHERE is_active = true;

-- 3. Verificar conversas ativas
SELECT
  id,
  user_id,
  status,
  coordinator_id,
  student_id,
  (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = chat_conversations.id) as message_count
FROM chat_conversations
WHERE status IN ('active', 'active_human', 'waiting_human')
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado:**
- Pelo menos 1 estudante ativo
- Pelo menos 1 coordenador ativo
- Pelo menos 1 conversa com mensagens

---

### **PASSO 2: Iniciar uma Conversa no Chat**

1. Acesse: `http://localhost:4000`
2. Clique no **botão de chat flutuante** (canto inferior direito)
3. Faça **login ou cadastro** no chat
4. Envie **algumas mensagens de teste**:
   ```
   Olá, preciso de ajuda com imposto de renda
   Gostaria de entender sobre MEI
   Tenho dúvidas sobre declaração
   ```

5. Verifique que as mensagens aparecem no chat

---

### **PASSO 3: Solicitar Transferência**

1. No chat, clique no botão **"🔄 Transferir"** (só aparece se estiver logado)

2. **Verifique o modal de transferência:**
   - Deve mostrar **número de atendentes disponíveis**
   - Exemplo: "Encontramos **3 atendente(s) disponível(is)**"

3. **Selecione o tipo de atendente:**
   - Coordenador (para questões complexas)
   - Estudante (para atendimento especializado)

4. **Escolha um atendente da lista:**
   - Os atendentes com 🟢 estão disponíveis
   - Os atendentes com 🔴 estão ocupados (não selecionáveis)

5. **Selecione o motivo:**
   - Questão complexa
   - Necessita supervisão
   - Área específica
   - Preferência pessoal
   - Questão de disponibilidade
   - Outro motivo

6. **Adicione observações (opcional)**

7. Clique em **"Solicitar Transferência"**

---

### **PASSO 4: Verificar se a Transferência Foi Processada**

#### **4.1 - No Chat do Usuário**

Você deve ver uma mensagem de confirmação:

```
✅ Transferência Solicitada!

Sua solicitação foi enviada para [Nome do Atendente] (Coordenador/Estudante).

📝 Motivo: [motivo selecionado]
📋 Observações: [suas observações]

⏳ Status: Aguardando aceitação
🕐 Tempo estimado: 5-15 minutos

Em breve você será conectado ao novo atendente!
```

#### **4.2 - No Banco de Dados**

Execute no Supabase SQL Editor:

```sql
-- Verificar se a transferência foi registrada
SELECT
  id,
  conversation_id,
  from_user_name,
  to_user_name,
  to_user_type,
  transfer_reason,
  transfer_notes,
  status,
  transferred_at
FROM chat_transfer_requests
ORDER BY transferred_at DESC
LIMIT 1;

-- Verificar se a conversa foi atualizada
SELECT
  id,
  status,
  coordinator_id,
  coordinator_name,
  student_id,
  student_name,
  transferred_from,
  transfer_pending
FROM chat_conversations
WHERE transfer_pending = true
ORDER BY updated_at DESC
LIMIT 1;

-- Verificar mensagem de sistema
SELECT
  conversation_id,
  content,
  sender_type,
  sender_name,
  created_at
FROM chat_messages
WHERE sender_type = 'system'
  AND content LIKE '%Transferência Solicitada%'
ORDER BY created_at DESC
LIMIT 1;
```

**Resultados esperados:**

1. **Registro de transferência criado** em `chat_transfer_requests`
2. **Conversa atualizada** com:
   - `status = 'waiting_transfer'`
   - `coordinator_id` ou `student_id` preenchido com ID do novo atendente
   - `coordinator_name` ou `student_name` com nome do novo atendente
   - `transferred_from` com nome do atendente anterior
   - `transfer_pending = true`
3. **Mensagem de sistema** informando sobre a transferência

---

### **PASSO 5: Verificar se o Histórico Foi Transferido**

Execute no Supabase:

```sql
-- Buscar a conversa transferida e contar mensagens
SELECT
  conv.id as conversation_id,
  conv.user_id,
  conv.coordinator_id,
  conv.coordinator_name,
  conv.student_id,
  conv.student_name,
  conv.status,
  conv.transferred_from,
  COUNT(msg.id) as total_messages,
  COUNT(CASE WHEN msg.sender_type = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN msg.sender_type = 'assistant' THEN 1 END) as ai_messages,
  COUNT(CASE WHEN msg.sender_type = 'coordinator' THEN 1 END) as coordinator_messages,
  COUNT(CASE WHEN msg.sender_type = 'system' THEN 1 END) as system_messages
FROM chat_conversations conv
LEFT JOIN chat_messages msg ON msg.conversation_id = conv.id
WHERE conv.transfer_pending = true
GROUP BY conv.id
ORDER BY conv.updated_at DESC
LIMIT 1;

-- Ver todas as mensagens da conversa transferida
SELECT
  id,
  sender_type,
  sender_name,
  LEFT(content, 50) as content_preview,
  created_at
FROM chat_messages
WHERE conversation_id = (
  SELECT id
  FROM chat_conversations
  WHERE transfer_pending = true
  ORDER BY updated_at DESC
  LIMIT 1
)
ORDER BY created_at ASC;
```

**✅ Verificação de sucesso:**
- Todas as mensagens anteriores devem estar presentes
- Contagem de mensagens deve corresponder ao histórico
- Mensagens de usuário, assistente e sistema devem estar intactas

---

### **PASSO 6: Testar Notificação do Novo Atendente**

```sql
-- Verificar se notificação foi criada
SELECT
  id,
  user_id,
  user_type,
  conversation_id,
  notification_type,
  title,
  message,
  data,
  is_read,
  created_at
FROM chat_notifications
WHERE notification_type = 'transfer_request'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Deve mostrar:**
- Notificação criada para o novo atendente
- `user_id` corresponde ao ID do atendente selecionado
- `user_type` indica se é coordenador ou estudante
- `data` contém informações sobre a transferência (ID, motivo, contagem de mensagens)

---

## 🔍 Logs de Debug

Durante o teste, abra o **console do navegador** (F12) e verifique os logs:

### **Logs esperados no console:**

```
🔄 Iniciando transferência: {
  session_id: "conv-xxx",
  from_user_id: "user-xxx",
  to_user_id: "coord-xxx",
  to_user_type: "coordinator",
  transfer_reason: "Questão complexa"
}

📋 Conversa encontrada com 15 mensagens

✅ Transferência processada com sucesso
```

### **Logs esperados no terminal (Next.js):**

```bash
🔄 Iniciando transferência: { ... }
📋 Conversa encontrada com 15 mensagens
✅ Transferência processada com sucesso
```

---

## ⚠️ Troubleshooting

### **Problema 1: "Nenhum atendente disponível"**

**Causa:** Não há estudantes ou coordenadores ativos no banco

**Solução:**
```sql
-- Criar um coordenador de teste
INSERT INTO coordinator_users (id, email, is_active, created_at)
VALUES (gen_random_uuid(), 'coordenador.teste@naf.com', true, NOW());

-- Criar um estudante de teste
INSERT INTO students (id, name, email, status, course, created_at)
VALUES (
  gen_random_uuid(),
  'Estudante Teste',
  'estudante.teste@naf.com',
  'ATIVO',
  'Ciências Contábeis',
  NOW()
);
```

### **Problema 2: "Erro ao buscar atendentes"**

**Causa:** Erro na API ou permissões do Supabase

**Solução:**
1. Verifique se o servidor está rodando: `http://localhost:4000/api/chat/available-attendants?type=all`
2. Verifique as credenciais do Supabase em `.env.local`
3. Verifique os logs do console e terminal

### **Problema 3: Transferência não salva no banco**

**Causa:** Tabela `chat_transfer_requests` não existe ou tem tipos incompatíveis

**Solução:** Execute o SQL corrigido:
```bash
# No Supabase SQL Editor, execute o arquivo:
src/sql/fix-chat-transfer-tables.sql
```

Ou copie e cole este SQL:
```sql
-- IMPORTANTE: conversation_id deve ser INTEGER, não TEXT!
CREATE TABLE IF NOT EXISTS chat_transfer_requests (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chat_transfer_requests_conversation_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id)
    ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX idx_transfer_conversation ON chat_transfer_requests(conversation_id);
CREATE INDEX idx_transfer_to_user ON chat_transfer_requests(to_user_id);
CREATE INDEX idx_transfer_status ON chat_transfer_requests(status);
```

### **Problema 4: Notificações não são criadas**

**Causa:** Tabela `chat_notifications` não existe ou tem tipos incompatíveis

**Solução:** Execute o SQL corrigido (arquivo `fix-chat-transfer-tables.sql`) ou:
```sql
CREATE TABLE IF NOT EXISTS chat_notifications (
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

-- Criar índices
CREATE INDEX idx_notif_user ON chat_notifications(user_id);
CREATE INDEX idx_notif_type ON chat_notifications(notification_type);
CREATE INDEX idx_notif_read ON chat_notifications(is_read);
```

---

## 📊 Estrutura de Dados da Transferência

### **Tabela: chat_transfer_requests**

```typescript
{
  id: string                    // ID único da transferência
  conversation_id: string       // ID da conversa sendo transferida
  from_user_id: string          // ID do atendente anterior
  from_user_type: string        // Tipo: 'coordinator' | 'student' | 'client'
  from_user_name: string        // Nome do atendente anterior
  to_user_id: string            // ID do novo atendente
  to_user_type: string          // Tipo: 'coordinator' | 'student'
  to_user_name: string          // Nome do novo atendente
  transfer_reason: string       // Motivo da transferência
  transfer_notes: string        // Observações adicionais
  status: string                // Status: 'pending' | 'accepted' | 'rejected'
  transferred_at: timestamp     // Data/hora da transferência
  accepted_at: timestamp        // Data/hora da aceitação (se aceita)
  created_at: timestamp         // Data/hora de criação do registro
}
```

### **Atualização na conversa (chat_conversations)**

```typescript
{
  id: string                    // ID da conversa
  status: 'waiting_transfer'    // Status atualizado
  coordinator_id: string        // ID do coordenador (se transferido para coordenador)
  coordinator_name: string      // Nome do coordenador
  student_id: string            // ID do estudante (se transferido para estudante)
  student_name: string          // Nome do estudante
  transferred_from: string      // Nome do atendente anterior
  transfer_pending: boolean     // true enquanto aguarda aceitação
  updated_at: timestamp         // Data/hora da última atualização
}
```

---

## ✅ Checklist de Teste

- [ ] Estudantes ativos cadastrados no banco
- [ ] Coordenadores ativos cadastrados no banco
- [ ] Chat iniciado com várias mensagens
- [ ] Login/cadastro realizado no chat
- [ ] Botão "Transferir" aparece
- [ ] Modal mostra atendentes disponíveis
- [ ] Atendentes são do banco de dados (não mockados)
- [ ] Seleção de atendente funciona
- [ ] Motivo e observações podem ser preenchidos
- [ ] Transferência é processada com sucesso
- [ ] Mensagem de confirmação aparece
- [ ] Registro salvo em `chat_transfer_requests`
- [ ] Conversa atualizada em `chat_conversations`
- [ ] Mensagem de sistema criada
- [ ] Notificação criada para novo atendente
- [ ] Histórico completo de mensagens preservado
- [ ] Logs de debug aparecem no console

---

## 🎯 Resultado Final Esperado

Após executar todos os testes, você deve ter:

1. ✅ **Lista de atendentes reais** do banco de dados (não mockados)
2. ✅ **Transferência registrada** no Supabase
3. ✅ **Conversa atualizada** com novo atendente
4. ✅ **Histórico completo** de mensagens preservado
5. ✅ **Notificação enviada** ao novo atendente
6. ✅ **Mensagem de sistema** informando a transferência

---

**Data:** 10/10/2025, 22:45
**Status:** ✅ **PRONTO PARA TESTES**
**Próximo passo:** Execute os testes seguindo este guia passo a passo
