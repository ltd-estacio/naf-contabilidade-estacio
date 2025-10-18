# 🚀 Guia de Deploy em Produção - Assistente Virtual NAF

## ⚡ Pré-requisitos OBRIGATÓRIOS

### 1. 🔧 Variáveis de Ambiente no Netlify

Acesse: **Site Settings > Environment Variables** e adicione:

```bash
# ===== OBRIGATÓRIAS PARA O CHAT FUNCIONAR =====
NEXT_PUBLIC_SUPABASE_URL=https://gaevnrnthqxiwrdypour.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw

# ===== SUBSTITUA PELA SUA URL REAL =====
NEXT_PUBLIC_BASE_URL=https://SUA-URL-SITE.netlify.app
NEXTAUTH_URL=https://SUA-URL-SITE.netlify.app

# ===== CONFIGURAÇÕES ADICIONAIS =====
NEXTAUTH_SECRET=naf-secret-2025-super-seguro-mudar-em-producao
NODE_ENV=production
```

### 2. 🎯 URLs que DEVEM ser substituídas

❌ **ANTES**: `https://seu-site.netlify.app`
✅ **DEPOIS**: Sua URL real (ex: `https://naf-contabil-estacio.netlify.app`)

## 🐛 Problemas Corrigidos

### ✅ Erro 500 no Chat
- **Problema**: APIs não retornavam dados inseridos
- **Solução**: Adicionado `.select().single()` nas operações de insert

### ✅ URLs Hardcoded
- **Problema**: `localhost:4000` em produção
- **Solução**: Sistema dinâmico de URLs baseado no ambiente

### ✅ Variáveis de Ambiente Faltando
- **Problema**: `NEXT_PUBLIC_BASE_URL` e configurações Supabase
- **Solução**: Documentação completa das variáveis necessárias

## 🧪 Como Testar Após Deploy

### 1. Chat Widget
1. Acesse sua URL de produção
2. Clique no ícone de chat (canto inferior direito)
3. Digite: "Como emitir DAS do MEI?"
4. Verificar se a IA responde
5. Testar "Falar com especialista"
6. Testar "Agendar presencial"

### 2. Painel do Coordenador
1. Acesse: `https://SUA-URL.netlify.app/coordinator-dashboard`
2. Vá na aba "Chat"
3. Verificar se mostra solicitações pendentes
4. Testar aceitação de chat

## 🔗 APIs Críticas que Devem Funcionar

- ✅ `/api/chat/conversations` - Criação de conversas
- ✅ `/api/chat/messages` - Envio de mensagens
- ✅ `/api/chat/ai` - Respostas da IA
- ✅ `/api/chat/human-request` - Solicitar especialista
- ✅ `/api/legislation` - Base de conhecimento
- ✅ `/api/stats` - Estatísticas da home

## 🚨 Se Ainda Não Funcionar

### 1. Verificar Build Logs
- Acesse Netlify > Site > Deploys > [Latest Deploy] > Deploy log
- Procurar por erros relacionados a variáveis de ambiente

### 2. Verificar Function Logs
- Netlify > Functions > Logs
- Verificar se as APIs estão sendo chamadas

### 3. Network Inspector
1. F12 > Network tab
2. Tentar usar o chat
3. Verificar se há erros 500 nas APIs

## 📞 Suporte

Se o chat continuar não funcionando, verificar:
1. ✅ Todas as variáveis foram copiadas corretamente?
2. ✅ URL base foi atualizada?
3. ✅ Deploy foi executado após adicionar variáveis?
4. ✅ Console do navegador mostra erros?