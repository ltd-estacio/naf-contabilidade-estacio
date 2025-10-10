# Sistema de Links de Acesso ao Chat NAF

## 📋 Visão Geral

Sistema que permite aos estudantes gerarem links personalizados para ativar o botão do chat "Chat NAF - Assistente Virtual" para usuários específicos. O chat fica invisível por padrão e só aparece quando o usuário acessa através de um link válido.

---

## 🎯 Funcionalidades

### ✅ Para Estudantes
- Gerar links únicos de acesso ao chat
- Configurar limite de usos (ex: 10 usuários)
- Definir data de expiração do link
- Personalizar título e mensagem do chat
- Ver estatísticas de uso:
  - Total de acessos
  - Usuários únicos
  - Conversas iniciadas
  - Último uso
- Ativar/desativar links
- Deletar links
- Copiar links com um clique

### ✅ Para Usuários
- Chat invisível por padrão
- Botão aparece automaticamente ao acessar link válido
- Permanece visível durante toda a sessão (24h)
- Animação suave de entrada
- Badge opcional mostrando quem criou o link

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `chat_access_links`

```sql
CREATE TABLE chat_access_links (
    id UUID PRIMARY KEY,
    link_token VARCHAR(255) UNIQUE,        -- Token único (CHAT-XXXXXXXX)
    link_slug VARCHAR(100) UNIQUE,         -- Slug amigável (nome-do-estudante)
    created_by_student_id UUID,            -- ID do estudante
    created_by_student_name VARCHAR(255),  -- Nome do estudante
    title VARCHAR(255),                    -- Título do chat
    description TEXT,                      -- Descrição interna
    custom_message TEXT,                   -- Mensagem personalizada
    max_uses INTEGER,                      -- Limite de usos (NULL = ilimitado)
    current_uses INTEGER,                  -- Contador de usos
    expires_at TIMESTAMP,                  -- Data de expiração
    is_active BOOLEAN,                     -- Se está ativo
    last_used_at TIMESTAMP,                -- Último uso
    total_conversations_started INTEGER,   -- Total de conversas
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabela: `chat_link_usage_logs`

```sql
CREATE TABLE chat_link_usage_logs (
    id UUID PRIMARY KEY,
    link_id UUID,                  -- Referência ao link
    link_token VARCHAR(255),       -- Token do link
    user_ip VARCHAR(45),           -- IP do usuário
    user_agent TEXT,               -- Navegador do usuário
    user_id VARCHAR(255),          -- ID do usuário (se registrou)
    conversation_id INTEGER,       -- ID da conversa
    accessed_at TIMESTAMP
);
```

---

## 🚀 Como Usar

### 1. Configurar o Banco de Dados

Execute o script SQL para criar as tabelas:

```bash
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f src/sql/chat-access-links.sql
```

### 2. Adicionar Componente de Gerenciamento para Estudantes

No painel do estudante, adicione o componente:

```tsx
import ChatLinkManager from '@/components/student/ChatLinkManager'

export default function StudentDashboard() {
  const studentId = 'uuid-do-estudante'
  const studentName = 'Nome do Estudante'

  return (
    <div>
      <h1>Meu Painel</h1>
      <ChatLinkManager
        studentId={studentId}
        studentName={studentName}
      />
    </div>
  )
}
```

### 3. Proteger o Botão do Chat

Envolva o botão do chat com o wrapper:

```tsx
import ChatButtonWrapper from '@/components/chat/ChatButtonWrapper'

export default function Layout({ children }) {
  return (
    <div>
      {children}

      {/* O botão só aparece se o usuário acessou via link válido */}
      <ChatButtonWrapper>
        <button className="fixed bottom-4 right-4 ...">
          Chat NAF - Assistente Virtual
        </button>
      </ChatButtonWrapper>
    </div>
  )
}
```

### 4. (Opcional) Adicionar Badge do Estudante

```tsx
import { ChatLinkBadge } from '@/components/chat/ChatButtonWrapper'

<ChatButtonWrapper>
  <div className="chat-container">
    <button>Chat NAF</button>
    <ChatLinkBadge />  {/* Mostra "Atendimento por: Nome do Estudante" */}
  </div>
</ChatButtonWrapper>
```

---

## 🔗 Formatos de Link

O sistema gera 2 tipos de links para cada estudante:

### Formato 1: Token (mais seguro)
```
https://seusite.com/chat?link=CHAT-A1B2C3D4
```

### Formato 2: Slug (mais amigável)
```
https://seusite.com/chat/joao-silva
```

Ambos funcionam da mesma forma!

---

## 📊 API Endpoints

### GET `/api/students/chat-links`
Listar links do estudante

**Query Params:**
- `studentId` (obrigatório)

**Response:**
```json
{
  "links": [
    {
      "id": "uuid",
      "link_token": "CHAT-A1B2C3D4",
      "link_slug": "joao-silva",
      "title": "Chat NAF - Assistente Virtual",
      "is_active": true,
      "current_uses": 5,
      "max_uses": 10,
      "statistics": {
        "total_accesses": 8,
        "unique_users": 5,
        "conversations_created": 4
      }
    }
  ]
}
```

### POST `/api/students/chat-links`
Criar novo link

**Body:**
```json
{
  "studentId": "uuid",
  "studentName": "João Silva",
  "title": "Chat NAF - Assistente Virtual",
  "description": "Link para clientes da campanha X",
  "customMessage": "Olá! Seja bem-vindo ao atendimento...",
  "maxUses": 10,
  "expiresInDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "link_token": "CHAT-A1B2C3D4",
    "link_slug": "joao-silva",
    "linkUrl": "https://seusite.com/chat?link=CHAT-A1B2C3D4",
    "slugUrl": "https://seusite.com/chat/joao-silva"
  }
}
```

### PATCH `/api/students/chat-links`
Atualizar link (ativar/desativar)

**Body:**
```json
{
  "linkId": "uuid",
  "studentId": "uuid",
  "isActive": false
}
```

### DELETE `/api/students/chat-links`
Deletar link

**Query Params:**
- `linkId` (obrigatório)
- `studentId` (obrigatório)

### GET `/api/chat/validate-link`
Validar link

**Query Params:**
- `token` OU `slug` (um dos dois obrigatório)

**Response (válido):**
```json
{
  "valid": true,
  "link": {
    "id": "uuid",
    "token": "CHAT-A1B2C3D4",
    "slug": "joao-silva",
    "title": "Chat NAF - Assistente Virtual",
    "studentName": "João Silva"
  }
}
```

**Response (inválido):**
```json
{
  "valid": false,
  "error": "Link expirado",
  "reason": "expired"
}
```

### POST `/api/chat/validate-link`
Registrar uso do link

**Body:**
```json
{
  "linkToken": "CHAT-A1B2C3D4",
  "userIp": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user-id",
  "conversationId": 123
}
```

---

## 🎨 Exemplo de Fluxo Completo

### 1. Estudante Cria Link

```tsx
// No painel do estudante
<ChatLinkManager studentId="abc123" studentName="João Silva" />

// Estudante clica em "Criar Novo Link"
// Preenche:
// - Título: "Chat NAF - Assistente Virtual"
// - Limite: 10 usos
// - Expira em: 30 dias

// Sistema gera:
// - Token: CHAT-X7Y8Z9A0
// - Slug: joao-silva
// - URL 1: https://seusite.com/chat?link=CHAT-X7Y8Z9A0
// - URL 2: https://seusite.com/chat/joao-silva
```

### 2. Estudante Compartilha Link

```
Estudante copia o link e envia por:
- WhatsApp
- Email
- SMS
- Redes Sociais
```

### 3. Usuário Acessa o Link

```
1. Usuário clica em: https://seusite.com/chat?link=CHAT-X7Y8Z9A0
2. Sistema valida o link
3. Botão do chat aparece com animação
4. Uso é registrado no banco de dados
5. Contadores são atualizados
```

### 4. Estudante Vê Estatísticas

```tsx
// No ChatLinkManager, estudante vê:
// - 8 acessos totais
// - 5 usuários únicos
// - 4 conversas criadas
// - Último uso: 10/01/2025 às 15:30
```

---

## 🔒 Validações de Segurança

O sistema verifica automaticamente:

✅ **Link ativo** - `is_active = true`
✅ **Não expirado** - `expires_at > NOW()`
✅ **Dentro do limite** - `current_uses < max_uses`
✅ **Pertence ao estudante** - Em operações de edição/exclusão

Se qualquer validação falhar, o chat permanece invisível.

---

## 📱 Recursos Adicionais

### Persistência na Sessão
- Link validado é salvo no `localStorage`
- Chat permanece visível por 24h após validação
- Usuário pode navegar pelo site e o chat continua visível

### Estatísticas Detalhadas
- Total de acessos ao link
- Usuários únicos que usaram
- Conversas efetivamente iniciadas
- Data do último uso
- IP e User-Agent dos usuários (para análise)

### Controles Flexíveis
- Limite de usos configurável
- Data de expiração configurável
- Ativar/desativar a qualquer momento
- Deletar quando não precisar mais

---

## 🎯 Casos de Uso

### 1. Campanha de Marketing
```
Estudante cria link com:
- Limite: 100 usos
- Expira em: 7 dias
- Título: "Campanha Declaração IR 2025"
```

### 2. Atendimento VIP
```
Estudante cria link com:
- Limite: 1 uso
- Expira em: 1 dia
- Título: "Atendimento Exclusivo - Sr. José"
```

### 3. Link Permanente
```
Estudante cria link com:
- Limite: ilimitado
- Nunca expira
- Título: "Atendimento Geral - João Silva"
```

---

## 🧪 Testando o Sistema

### 1. Criar Link de Teste

```bash
curl -X POST http://localhost:3000/api/students/chat-links \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student-id",
    "studentName": "João Teste",
    "title": "Chat NAF - Teste",
    "maxUses": 5,
    "expiresInDays": 1
  }'
```

### 2. Validar Link

```bash
curl http://localhost:3000/api/chat/validate-link?token=CHAT-XXXXXXXX
```

### 3. Acessar no Navegador

```
http://localhost:3000/chat?link=CHAT-XXXXXXXX
```

O botão do chat deve aparecer! ✅

---

## 📝 Notas Importantes

1. **Banco de Dados**: Execute o script SQL antes de usar
2. **URLs Base**: Configure `NEXT_PUBLIC_BASE_URL` no `.env`
3. **Supabase**: Certifique-se que as tabelas foram criadas
4. **Permissões**: Estudante só pode gerenciar seus próprios links
5. **Limpeza**: Links inativos/expirados podem ser deletados periodicamente

---

## 🚀 Próximos Passos (Opcional)

- [ ] Dashboard com gráficos de uso dos links
- [ ] Notificações quando link atingir limite
- [ ] QR Code para cada link
- [ ] Análise geográfica dos acessos
- [ ] Integração com Google Analytics
- [ ] Encurtador de URLs personalizado
- [ ] Templates de mensagens prontos
- [ ] Compartilhamento direto para WhatsApp/Email

---

**Desenvolvido para NAF Contábil**
*Sistema de Links Personalizados do Chat*
Data: Janeiro 2025
