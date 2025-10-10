# Exemplo Prático: Sistema de Links do Chat NAF

## 📋 Cenário Real

**Situação:** João Silva é um estudante do NAF e precisa atender 10 clientes de uma campanha de Imposto de Renda. Ele quer que cada cliente tenha acesso ao chat apenas através de um link personalizado.

---

## 🎯 Passo a Passo Completo

### 1️⃣ Adicionar Gerenciador no Painel do Estudante

**Arquivo:** `src/app/student-dashboard/page.tsx`

```tsx
import ChatLinkManager from '@/components/student/ChatLinkManager'
import { getCurrentStudent } from '@/lib/auth' // Sua função de autenticação

export default async function StudentDashboard() {
  const student = await getCurrentStudent()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meu Painel - Estudante</h1>

      {/* Outras seções do painel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* ... seus cards existentes ... */}
      </div>

      {/* NOVO: Gerenciador de Links do Chat */}
      <div className="mt-8">
        <ChatLinkManager
          studentId={student.id}
          studentName={student.name}
        />
      </div>
    </div>
  )
}
```

### 2️⃣ Proteger o Botão do Chat no Layout Principal

**Arquivo:** `src/app/layout.tsx` ou onde você tem o botão do chat

```tsx
import ChatButtonWrapper from '@/components/chat/ChatButtonWrapper'
import { ChatLinkBadge } from '@/components/chat/ChatButtonWrapper'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}

        {/* ANTES: Botão do chat sempre visível
        <div className="fixed bottom-4 right-4 z-50">
          <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg">
            Chat NAF
          </button>
        </div>
        */}

        {/* AGORA: Botão só aparece com link válido */}
        <ChatButtonWrapper>
          <div className="fixed bottom-4 right-4 z-50">
            <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Chat NAF</div>
                  <div className="text-xs opacity-90">Assistente Virtual</div>
                </div>
              </div>
            </button>
            <ChatLinkBadge />
          </div>
        </ChatButtonWrapper>
      </body>
    </html>
  )
}
```

### 3️⃣ João Cria o Link no Painel

João acessa seu painel e:

1. **Clica em "Criar Novo Link"**
2. **Preenche o formulário:**
   - **Título:** "Chat NAF - IR 2025"
   - **Descrição:** "Campanha Imposto de Renda 2025"
   - **Mensagem Personalizada:** "Olá! Seja bem-vindo ao atendimento sobre Imposto de Renda. Estou aqui para ajudá-lo!"
   - **Limite de Usos:** 10
   - **Expira em:** 30 dias

3. **Sistema gera:**
   ```
   Token: CHAT-X7Y8Z9A0
   Slug: joao-silva

   URL com Token:
   https://naf.estacio.br/chat?link=CHAT-X7Y8Z9A0

   URL com Slug:
   https://naf.estacio.br/chat/joao-silva
   ```

4. **João copia o link e compartilha**

### 4️⃣ Cliente Recebe e Acessa o Link

**WhatsApp do João para o cliente:**

```
Olá, Maria! 👋

Segue o link para acessar nosso atendimento sobre sua declaração de IR:

https://naf.estacio.br/chat?link=CHAT-X7Y8Z9A0

Ao clicar, você verá o botão do chat no canto da tela.
Estou à disposição!

Atenciosamente,
João Silva - Estudante NAF
```

### 5️⃣ O que Acontece Quando o Cliente Clica

```typescript
// 1. Cliente acessa a URL
https://naf.estacio.br/chat?link=CHAT-X7Y8Z9A0

// 2. Hook useChatLink detecta o parâmetro 'link'
const linkToken = 'CHAT-X7Y8Z9A0'

// 3. Valida com a API
GET /api/chat/validate-link?token=CHAT-X7Y8Z9A0

// 4. Resposta da API:
{
  "valid": true,
  "link": {
    "id": "abc-123",
    "token": "CHAT-X7Y8Z9A0",
    "title": "Chat NAF - IR 2025",
    "studentName": "João Silva",
    "customMessage": "Olá! Seja bem-vindo..."
  }
}

// 5. useShouldShowChat() retorna true

// 6. ChatButtonWrapper renderiza o botão com animação
```

### 6️⃣ Cliente Vê o Chat

```
┌─────────────────────────────────────┐
│                                     │
│         Página do NAF               │
│                                     │
│                                     │
│                 ┌─────────────────┐ │
│                 │   💬 Chat NAF   │ │ ← Aparece com animação
│                 │ Assistente V.   │ │
│                 │─────────────────│ │
│                 │ Atendimento por:│ │
│                 │  João Silva     │ │
│                 └─────────────────┘ │
└─────────────────────────────────────┘
```

### 7️⃣ João Monitora as Estatísticas

No painel do João:

```
╔════════════════════════════════════════════════════╗
║ Chat NAF - IR 2025                    ✅ Ativo     ║
╠════════════════════════════════════════════════════╣
║ Descrição: Campanha Imposto de Renda 2025         ║
║ Criado em: 09/01/2025 às 14:30                    ║
╠════════════════════════════════════════════════════╣
║ URLs:                                              ║
║ https://naf.estacio.br/chat?link=CHAT-X7Y8Z9A0    ║
║ https://naf.estacio.br/chat/joao-silva            ║
╠════════════════════════════════════════════════════╣
║ ESTATÍSTICAS                                       ║
║                                                    ║
║  👥 Acessos     💬 Conversas    📊 Usos    👤 Únicos ║
║     8              5            5/10         5     ║
╠════════════════════════════════════════════════════╣
║ Expira em: 08/02/2025 às 14:30                    ║
║ Último uso: Hoje às 16:45                         ║
╚════════════════════════════════════════════════════╝
```

---

## 🔄 Exemplo de Integração com Chat Existente

Se você já tem um componente de chat, basta envolvê-lo:

**Antes:**
```tsx
// src/components/ChatWidget.tsx
export default function ChatWidget() {
  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={() => openChat()}>
        Abrir Chat
      </button>
    </div>
  )
}
```

**Depois:**
```tsx
// src/components/ChatWidget.tsx
import ChatButtonWrapper from '@/components/chat/ChatButtonWrapper'

export default function ChatWidget() {
  return (
    <ChatButtonWrapper>
      <div className="fixed bottom-4 right-4">
        <button onClick={() => openChat()}>
          Abrir Chat
        </button>
      </div>
    </ChatButtonWrapper>
  )
}
```

Pronto! Agora o chat só aparece para quem tem o link! ✅

---

## 📱 Exemplo com Rotas Dinâmicas

Se quiser usar slugs amigáveis como `/chat/joao-silva`:

**Arquivo:** `src/app/chat/[slug]/page.tsx`

```tsx
import { redirect } from 'next/navigation'

export default function ChatSlugPage({ params }: { params: { slug: string } }) {
  // Redireciona para a página principal do chat
  // O hook useChatLink vai detectar o slug da URL
  redirect('/')
}
```

Ou simplesmente deixe o hook detectar automaticamente:

```typescript
// useChatLink.ts já faz isso:
if (pathname?.startsWith('/chat/')) {
  linkSlug = pathname.split('/chat/')[1]
}
```

---

## 🎨 Customizando a Aparência

### Botão com Design da Imagem de Referência

```tsx
<ChatButtonWrapper>
  <div className="fixed bottom-6 right-6 z-50">
    <button
      className="bg-gradient-to-r from-blue-500 to-green-500
                 text-white rounded-xl shadow-2xl hover:scale-105
                 transition-transform duration-200 p-1"
      onClick={openChat}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Ícone do chat */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-blue-600" />
        </div>

        {/* Texto */}
        <div className="text-left">
          <div className="font-bold text-lg">Chat NAF</div>
          <div className="text-sm opacity-90">Assistente Virtual</div>
        </div>
      </div>
    </button>

    {/* Badge do estudante */}
    <ChatLinkBadge />
  </div>
</ChatButtonWrapper>
```

---

## 🧪 Testando Localmente

### 1. Criar Link de Teste

```bash
# Terminal
curl -X POST http://localhost:3000/api/students/chat-links \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-123",
    "studentName": "João Teste",
    "title": "Chat NAF - Teste",
    "description": "Link de teste",
    "maxUses": 5,
    "expiresInDays": 1
  }'

# Resposta:
{
  "success": true,
  "link": {
    "link_token": "CHAT-A1B2C3D4",
    "linkUrl": "http://localhost:3000/chat?link=CHAT-A1B2C3D4"
  }
}
```

### 2. Testar Validação

```bash
curl http://localhost:3000/api/chat/validate-link?token=CHAT-A1B2C3D4
```

### 3. Abrir no Navegador

```
http://localhost:3000/chat?link=CHAT-A1B2C3D4
```

O botão deve aparecer! 🎉

---

## 🎯 Casos de Uso Avançados

### Caso 1: Link para Evento Específico

```tsx
// Criar link para evento de IRPF
{
  title: "Mutirão IRPF 2025",
  description: "Evento dia 15/03",
  customMessage: "Bem-vindo ao Mutirão de IRPF!",
  maxUses: 100,
  expiresInDays: 1
}
```

### Caso 2: Link VIP Individual

```tsx
// Link para cliente específico
{
  title: "Atendimento - Sr. José Silva",
  description: "Cliente VIP - Processo completo IR",
  maxUses: 1,
  expiresInDays: 7
}
```

### Caso 3: Link Permanente do Estudante

```tsx
// Link na bio do Instagram
{
  title: "Atendimento Online - João",
  description: "Link permanente Instagram",
  maxUses: null,        // Ilimitado
  expiresInDays: null   // Nunca expira
}
```

---

## 📊 Análise de Dados

Os estudantes podem ver:

```typescript
// Estatísticas agregadas
{
  total_accesses: 50,        // Total de cliques no link
  unique_users: 35,          // Usuários únicos que acessaram
  conversations_created: 30, // Conversas efetivamente iniciadas
  conversion_rate: 60%       // Taxa de conversão (conversas/acessos)
}

// Horários de pico
{
  "14:00-15:00": 10 acessos,
  "15:00-16:00": 15 acessos,
  "16:00-17:00": 8 acessos
}

// Dispositivos
{
  "mobile": 60%,
  "desktop": 35%,
  "tablet": 5%
}
```

---

## ✅ Checklist de Implementação

- [x] Executar script SQL (`chat-access-links.sql`)
- [x] Adicionar `ChatLinkManager` no painel do estudante
- [x] Envolver botão do chat com `ChatButtonWrapper`
- [x] Testar criação de link
- [x] Testar validação de link
- [x] Testar exibição do botão
- [x] Verificar estatísticas

---

**Sistema pronto para uso!** 🚀

Agora os estudantes podem gerar e gerenciar seus próprios links de acesso ao chat, com total controle e estatísticas em tempo real!
