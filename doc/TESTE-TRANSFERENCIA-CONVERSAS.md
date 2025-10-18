# Guia de Teste - Sistema de Transferência de Conversas

## Visão Geral

O sistema de transferência de conversas permite que coordenadores transfiram atendimentos para outros coordenadores ou estudantes. Quando uma transferência é solicitada, o destinatário recebe uma notificação e pode aceitar ou rejeitar o atendimento.

## O Que Foi Implementado

### 1. **Tabela do Banco de Dados**
- ✅ Criada tabela `chat_transfer_requests` para gerenciar as solicitações
- ✅ Criada tabela `chat_transfer_logs` para histórico completo
- ✅ Suporte para transferências tanto para coordenadores quanto para estudantes

**Arquivo:** `/src/sql/chat-transfer-requests.sql`

### 2. **APIs Modificadas**

#### `/api/chat/transfer-chat` (POST)
- **Antes:** Transferia diretamente para outro coordenador
- **Agora:** Cria uma solicitação de transferência que precisa ser aceita
- **Campos:**
  ```json
  {
    "conversation_id": "123",
    "from_coordinator_id": "abc-123",
    "to_coordinator_id": "def-456",
    "from_coordinator_name": "João Silva",
    "to_coordinator_name": "Maria Santos",
    "reason": "Cliente precisa de especialista em MEI"
  }
  ```

#### `/api/chat/transfer-chat` (GET)
- **Nova funcionalidade:** Buscar solicitações de transferência pendentes
- **Parâmetro:** `coordinator_id=abc-123`
- **Retorna:** Lista de solicitações pendentes para o coordenador

#### `/api/chat/accept-transfer-request` (POST)
- **Antes:** Apenas estudantes podiam aceitar/rejeitar
- **Agora:** Coordenadores e estudantes podem aceitar/rejeitar
- **Campos para coordenador:**
  ```json
  {
    "transfer_request_id": "transfer-coord-123",
    "coordinator_id": "abc-123",
    "coordinator_name": "Maria Santos",
    "action": "accept",  // ou "reject"
    "message": "Olá! Agora vou te atender"
  }
  ```

### 3. **Interface do Coordenador**

**Arquivo:** `/src/components/chat/CoordinatorChatEnhanced.tsx`

#### Funcionalidades Adicionadas:
- ✅ **Notificação visual** quando há solicitações pendentes (alerta laranja no topo)
- ✅ **Listagem de solicitações** com informações do remetente e motivo
- ✅ **Botões de ação rápida** (Aceitar/Rejeitar) diretamente no alerta
- ✅ **Dialog de aceitação** com opção de enviar mensagem personalizada para o cliente
- ✅ **Notificação sonora** quando novas solicitações chegam (se som estiver habilitado)
- ✅ **Atualização automática** a cada 15 segundos (polling)
- ✅ **Contador de notificações** no ícone de sino

### 4. **Interface do Estudante**

**Arquivo:** `/src/components/chat/StudentChat.tsx`

✅ Já estava implementado e funcionando corretamente

---

## Pré-requisitos para Teste

### 1. Criar as Tabelas no Banco de Dados

Execute o seguinte comando no terminal para criar as tabelas necessárias:

```bash
psql -U seu_usuario -d naf_contabil -f src/sql/chat-transfer-requests.sql
```

**Ou** execute o SQL diretamente no Supabase Dashboard:
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Copie e cole o conteúdo de `/src/sql/chat-transfer-requests.sql`
4. Execute

### 2. Verificar Coordenadores no Sistema

Certifique-se de ter pelo menos 2 coordenadores cadastrados na tabela `coordinator_users`:

```sql
SELECT id, email, is_active FROM coordinator_users WHERE is_active = true;
```

### 3. Ter Conversas Ativas

Certifique-se de ter conversas ativas no sistema para testar a transferência.

---

## Cenários de Teste

### Cenário 1: Transferência Entre Coordenadores

#### Passo 1: Coordenador A inicia transferência
1. Faça login como **Coordenador A**
2. Acesse o painel de chat em `/coordinator-dashboard`
3. Selecione uma conversa ativa
4. Clique no botão **"Transferir"**
5. Selecione a opção **"Coordenador"**
6. Escolha o **Coordenador B** da lista
7. Preencha o motivo: "Cliente precisa de especialista em MEI"
8. Clique em **"Transferir Chat"**

**Resultado Esperado:**
- ✅ Mensagem de confirmação aparece
- ✅ Mensagem do sistema é adicionada na conversa informando sobre a solicitação

#### Passo 2: Coordenador B recebe notificação
1. Faça login como **Coordenador B**
2. Acesse o painel de chat
3. Você deve ver:
   - ✅ Alerta laranja no topo com a solicitação
   - ✅ Informações do Coordenador A e motivo da transferência
   - ✅ Botões "Aceitar" e "Rejeitar"
   - ✅ Notificação sonora (se som estiver ativo)

#### Passo 3A: Coordenador B aceita a transferência
1. Clique em **"Aceitar"**
2. (Opcional) Digite uma mensagem para o cliente
3. Clique em **"Aceitar Transferência"**

**Resultado Esperado:**
- ✅ Solicitação desaparece da lista
- ✅ Conversa aparece na lista de conversas ativas do Coordenador B
- ✅ Mensagem do sistema é adicionada informando que a transferência foi aceita
- ✅ Conversa não aparece mais na lista do Coordenador A

#### Passo 3B: Coordenador B rejeita a transferência
1. Clique em **"Rejeitar"** (X)

**Resultado Esperado:**
- ✅ Solicitação desaparece da lista
- ✅ Mensagem do sistema é adicionada na conversa informando que foi recusada
- ✅ Conversa continua com o Coordenador A

---

### Cenário 2: Transferência Para Estudante

#### Passo 1: Coordenador inicia transferência
1. Faça login como **Coordenador**
2. Acesse o painel de chat
3. Selecione uma conversa ativa
4. Clique no botão **"Transferir"**
5. Selecione a opção **"Estudante"**
6. Escolha um estudante da lista
7. Preencha o motivo: "Atendimento de rotina"
8. (Opcional) Personalize a mensagem para o estudante
9. Clique em **"Transferir Chat"**

**Resultado Esperado:**
- ✅ Mensagem de confirmação aparece
- ✅ Mensagem do sistema é adicionada na conversa

#### Passo 2: Estudante recebe notificação
1. Faça login como **Estudante**
2. Acesse o painel do estudante
3. Vá para a aba **"Solicitações"**

**Resultado Esperado:**
- ✅ Solicitação aparece na lista
- ✅ Notificação visual em azul no topo
- ✅ Badge com contador na aba "Solicitações"
- ✅ Notificação sonora

#### Passo 3: Estudante aceita
1. Clique em **"Aceitar"**
2. (Opcional) Digite uma mensagem
3. Confirme

**Resultado Esperado:**
- ✅ Conversa aparece na aba "Conversas Ativas"
- ✅ Estudante pode enviar mensagens
- ✅ Mensagem do sistema confirma aceitação

---

### Cenário 3: Múltiplas Solicitações Pendentes

#### Teste:
1. Crie 3 solicitações diferentes para o mesmo coordenador
2. Verifique se todas aparecem no alerta
3. Aceite uma e rejeite outra
4. Verifique se a contagem está correta

**Resultado Esperado:**
- ✅ Todas as solicitações aparecem
- ✅ Contador atualiza corretamente
- ✅ Cada solicitação pode ser tratada individualmente

---

### Cenário 4: Solicitação Expirada

#### Teste:
1. Crie uma solicitação
2. Aguarde 30 minutos (coordenador) ou 10 minutos (estudante)
3. Tente aceitar a solicitação

**Resultado Esperado:**
- ✅ Mensagem de erro: "Solicitação de transferência expirou"
- ✅ Solicitação não aparece mais na lista após expiração

---

## Testes de Integração

### 1. Verificar Mensagens do Sistema

Após cada ação, verifique na conversa se as mensagens do sistema foram adicionadas corretamente:

```sql
SELECT * FROM chat_messages
WHERE conversation_id = 'ID_DA_CONVERSA'
AND sender_type = 'system'
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Verificar Status da Conversa

```sql
SELECT id, coordinator_id, chat_accepted_by, status
FROM chat_conversations
WHERE id = 'ID_DA_CONVERSA';
```

**Valores esperados:**
- `coordinator_id`: ID do novo responsável (após aceite)
- `chat_accepted_by`: ID de quem aceitou
- `status`: `active_human` (coordenador) ou `active_student` (estudante)

### 3. Verificar Logs de Transferência

```sql
SELECT * FROM chat_transfer_logs
WHERE conversation_id = 'ID_DA_CONVERSA'
ORDER BY requested_at DESC;
```

### 4. Verificar Solicitações Pendentes

```sql
SELECT * FROM chat_transfer_requests
WHERE status = 'pending'
AND expires_at > NOW()
ORDER BY created_at DESC;
```

---

## Problemas Conhecidos e Soluções

### Problema 1: Notificação não aparece
**Solução:**
- Verifique se o polling está ativo (console do navegador)
- Aguarde até 15 segundos para atualização automática
- Force refresh manual no botão "Atualizar"

### Problema 2: Tabela não existe
**Erro:** `relation "chat_transfer_requests" does not exist`

**Solução:**
```bash
psql -U seu_usuario -d naf_contabil -f src/sql/chat-transfer-requests.sql
```

### Problema 3: Solicitação não aparece
**Verificar:**
1. ID do coordenador está correto
2. Solicitação não expirou
3. Status é 'pending'

**Query para debug:**
```sql
SELECT * FROM chat_transfer_requests
WHERE to_coordinator_id = 'SEU_ID_AQUI'
ORDER BY created_at DESC;
```

---

## Checklist Final de Teste

- [ ] Banco de dados: Tabelas criadas
- [ ] Coordenador para Coordenador: Transferir, aceitar e rejeitar
- [ ] Coordenador para Estudante: Transferir, aceitar e rejeitar
- [ ] Notificações visuais aparecem corretamente
- [ ] Notificações sonoras funcionam
- [ ] Contador de notificações atualiza
- [ ] Mensagens do sistema são adicionadas
- [ ] Status da conversa atualiza corretamente
- [ ] Polling atualiza automaticamente (15 segundos)
- [ ] Solicitações expiradas não aparecem
- [ ] Múltiplas solicitações funcionam corretamente
- [ ] Logs são gravados corretamente

---

## Estrutura de Arquivos Modificados/Criados

```
/src
  /sql
    chat-transfer-requests.sql          ← NOVO: Tabelas do banco
  /app/api/chat
    transfer-chat/route.ts              ← MODIFICADO: Agora cria solicitações
    accept-transfer-request/route.ts    ← MODIFICADO: Suporta coordenadores
  /components/chat
    CoordinatorChatEnhanced.tsx         ← MODIFICADO: Interface de notificações
    StudentChat.tsx                      ← JÁ EXISTIA: Funcionando
/doc
  TESTE-TRANSFERENCIA-CONVERSAS.md      ← NOVO: Este documento
```

---

## Contato e Suporte

Se encontrar algum problema durante os testes:
1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor Next.js
3. Execute as queries SQL de debug acima
4. Documente o erro com screenshots se possível

---

**Data de Criação:** 2025-10-03
**Versão:** 1.0
**Status:** ✅ Pronto para testes
