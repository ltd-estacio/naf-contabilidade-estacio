# 🔧 Correção: Gemini API Key Suspensa

## 📋 Problema Identificado

O assistente de IA no painel do estudante está retornando o erro:

```
❌ Não consegui falar com a IA agora. 
Mensagem técnica: { "error": { "code": 403, "message": "Permission denied: Consumer 'api_key:AIzaSyCVj-ZD1n1TX6fGyK6se4kQz5Ykyv-wmA0' has been suspended.", "status": "PERMISSION_DENIED"
```

**Causa:** A chave da API do Google Gemini configurada no Vercel foi suspensa ou é inválida.

## 🔍 Análise

1. **Chave Suspensa (Vercel)**: `AIzaSyCVj-ZD1n1TX6fGyK6se4kQz5Ykyv-wmA0`
2. **Chave Válida (AccountsManager)**: `AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI`

A chave configurada nas variáveis de ambiente do Vercel está diferente da chave documentada no código.

## ✅ Solução

### Passo 1: Atualizar Variável de Ambiente no Vercel

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Selecione o projeto `naf-contabilidade-estacio`
3. Vá em **Settings** → **Environment Variables**
4. Localize a variável `GEMINI_API_KEY` ou `NEXT_PUBLIC_GEMINI_API_KEY`
5. **Atualize o valor para**: `AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI`
6. Salve as alterações

### Passo 2: Fazer Redeploy

Após atualizar a variável de ambiente, você precisa fazer um novo deploy:

**Opção A - Via Vercel Dashboard:**
1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

**Opção B - Via Git (recomendado):**
```bash
git commit --allow-empty -m "chore: Trigger redeploy após atualização de GEMINI_API_KEY"
git push
```

### Passo 3: Criar/Atualizar Arquivo .env.local (Desenvolvimento Local)

Se você trabalha localmente, crie ou atualize o arquivo `.env.local` na raiz do projeto:

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dbcpskwkwdjjqutyvdvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY3Bza3drd2RqanF1dHl2ZHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzA1OTcsImV4cCI6MjA0ODY0NjU5N30.DHlxIwEQ3cMxd-C_KTJZOJFmC5Z9xJc8KqBX9H6D0m0

# EmailJS
EMAILJS_SERVICE_ID=service_xehr3ta
EMAILJS_TEMPLATE_ID=template_d2rfx39
EMAILJS_PUBLIC_KEY=nGm0I7osOMW7psoqF

# Google Gemini AI
GEMINI_API_KEY=AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI

# Application
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

## 🔐 Alternativa: Gerar Nova Chave do Gemini

Se a chave `AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI` também não funcionar, você pode gerar uma nova:

### Como Gerar Nova Chave do Google Gemini:

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **Create API Key**
4. Selecione ou crie um projeto do Google Cloud
5. Copie a nova chave gerada
6. Atualize nos locais mencionados acima

### Ativar APIs Necessárias no Google Cloud:

Se a chave for nova, certifique-se de que estas APIs estão ativadas:

1. Acesse: https://console.cloud.google.com/apis/library
2. Ative a **Generative Language API**:
   - Procure por "Generative Language API"
   - Clique em **Enable**

## 📍 Locais Onde a Chave é Utilizada

A API do Gemini é usada nos seguintes endpoints:

1. **`/api/ai/assistant`** - Assistente de IA do painel do estudante
2. **`/api/chat/ai`** - Chat de suporte automático

## 🧪 Como Testar

Após fazer as alterações:

1. Aguarde o deploy finalizar no Vercel (1-2 minutos)
2. Acesse o painel do estudante: https://naf.ltdestacio.com.br/student-dashboard
3. Clique no botão **"Assistente IA"**
4. Digite uma pergunta como: "Explique MEI"
5. Verifique se a IA responde corretamente

## 📊 Monitoramento

Para verificar se a chave está funcionando:

1. **Console do Vercel**: Verifique os logs do deployment
2. **Google Cloud Console**: 
   - Acesse https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/metrics
   - Veja as métricas de uso da API

## ⚠️ Limites da API Gratuita

O plano gratuito do Google Gemini tem os seguintes limites:

- **60 requisições por minuto**
- **1,500 requisições por dia**
- **1 milhão de tokens por minuto**

Se atingir esses limites, você verá erros 429 (Rate Limit).

## 🔄 Variáveis de Ambiente - Resumo

Configure TODAS estas variáveis no Vercel (Settings → Environment Variables):

```env
GEMINI_API_KEY=AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI
```

## 📝 Checklist de Correção

- [ ] Acessar Vercel Dashboard
- [ ] Atualizar `GEMINI_API_KEY` no Vercel
- [ ] Atualizar `NEXT_PUBLIC_GEMINI_API_KEY` no Vercel
- [ ] Fazer redeploy da aplicação
- [ ] Aguardar finalização do deploy (1-2 min)
- [ ] Testar assistente de IA no painel do estudante
- [ ] Verificar logs no Vercel para confirmar sucesso
- [ ] (Opcional) Criar arquivo `.env.local` para desenvolvimento local

## 🆘 Problemas Persistentes?

Se após seguir todos os passos o erro persistir:

1. **Verificar se a chave está correta**: Copie exatamente como está
2. **Verificar cotas**: Acesse o Google Cloud Console
3. **Gerar nova chave**: Use o link do Google AI Studio
4. **Limpar cache**: Faça um "Hard Reload" no navegador (Ctrl+Shift+R)

## 📞 Suporte

- **Google AI Studio**: https://makersuite.google.com/app/apikey
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/

---

**Data da Correção**: 26 de outubro de 2025  
**Status**: Chave suspensa identificada - Aguardando atualização no Vercel
