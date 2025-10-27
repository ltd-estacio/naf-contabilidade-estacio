# 🔧 CORREÇÃO: Erro no Envio de Email do Backup

## ❌ Problema Original

```
POST https://naf.ltdestacio.com.br/api/backup/send-email 500 (Internal Server Error)
❌ Erro ao enviar e-mail: Error: Erro ao enviar backup por e-mail
```

## ✅ Correções Realizadas

### 1. **Atualização do `.env.local`**

**Adicionado**:
```env
EMAIL_APP_PASSWORD=kczj vzqk nlse iddy
```

**Corrigido URL do Supabase**:
```env
# ANTES (URL errada)
NEXT_PUBLIC_SUPABASE_URL=https://ebaopbjuwxgryqkpdfuy.supabase.co

# DEPOIS (URL correta)
NEXT_PUBLIC_SUPABASE_URL=https://gaevnrnthqxiwrdypour.supabase.co
```

**Adicionadas variáveis do EmailJS e Gemini**:
```env
EMAILJS_SERVICE_ID=service_xehr3ta
EMAILJS_TEMPLATE_ID=template_d2rfx39
EMAILJS_PUBLIC_KEY=nGm0I7osOMW7psoqF
GEMINI_API_KEY=AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI
```

### 2. **Atualização da API** (`src/app/api/backup/send-email/route.ts`)

**Mudanças**:
- ✅ Credenciais corretas do Gmail
- ✅ Remove espaços da senha de app (Gmail não aceita espaços)
- ✅ Usa `EMAIL_APP_PASSWORD` prioritariamente
- ✅ Fallback para `EMAIL_PASSWORD` se não houver APP_PASSWORD
- ✅ Email remetente correto: `souzaestevam925@gmail.com`
- ✅ Logs mais detalhados para debug

**Código atualizado**:
```typescript
const emailUser = process.env.EMAIL_USER || 'souzaestevam925@gmail.com'
const emailPassword = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || 'kcvzqknlseiddy').replace(/\\s/g, '')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword // Senha SEM espaços
  }
})
```

## 🚀 Como Testar

### 1. **Reiniciar o Servidor** (IMPORTANTE!)

O servidor precisa ser reiniciado para carregar as novas variáveis de ambiente:

```bash
# Pare o servidor (Ctrl+C no terminal)
# Depois reinicie:
npm run dev
```

### 2. **Testar Envio de Email**

1. Acesse o Dashboard do Coordenador
2. Vá para a aba **"Backup Atendimentos"**
3. Clique em **"Enviar por E-mail"**
4. Preencha o email do coordenador
5. Clique em **"Enviar Backup"**

### 3. **Verificar Logs no Console**

Você deve ver:

```
📧 Nodemailer configurado: { user: 'souzaestevam925@gmail.com', passwordLength: 16 }
🚀 API /api/backup/send-email CHAMADA!
🚀 Environment vars: {
  hasEmailUser: true,
  emailUser: 'souzaestevam925@gmail.com',
  hasEmailAppPassword: true,
  ...
}
📧 Enviando e-mail...
✅ E-mail enviado com sucesso!
✅ Message ID: <xxx@gmail.com>
```

### 4. **Verificar Email**

- Verifique a caixa de entrada do email do coordenador
- O email deve ter:
  - ✅ Assunto: `🛡️ Backup NAF - DD/MM/YYYY às HH:MM:SS`
  - ✅ Remetente: `NAF Contabilidade - Sistema de Backup <souzaestevam925@gmail.com>`
  - ✅ Anexo: Arquivo JSON com o backup

## 🔍 Troubleshooting

### Se ainda der erro:

#### **Erro: "Invalid login"**
```bash
# Verifique se a senha de app está correta
# Gmail → Configurações → Segurança → Senhas de app
# A senha deve ser: kcvzqknlseiddy (SEM espaços)
```

#### **Erro: "Less secure app access"**
```bash
# Gmail não permite mais "apps menos seguros"
# DEVE usar Senha de App
# Vá em: https://myaccount.google.com/apppasswords
# Crie uma nova senha de app se necessário
```

#### **Erro: "Connection timeout"**
```bash
# Verifique firewall/antivírus
# Porta 587 (SMTP) deve estar aberta
```

#### **Email não chega**
```bash
# Verifique:
# 1. Caixa de spam
# 2. Email bloqueado pelo Gmail
# 3. Logs do servidor para ver se foi enviado
```

## 📋 Checklist

Antes de testar, confirme:

- [ ] ✅ `.env.local` atualizado com todas as variáveis
- [ ] ✅ Senha de app do Gmail correta (sem espaços)
- [ ] ✅ URL do Supabase correta (`gaevnrnthqxiwrdypour`)
- [ ] ✅ Servidor reiniciado (`npm run dev`)
- [ ] ✅ Console do navegador aberto (F12) para ver logs
- [ ] ✅ Terminal do servidor aberto para ver logs da API

## 🎯 Resumo das Credenciais

### Gmail:
- **Email**: souzaestevam925@gmail.com
- **Senha de App**: `kczj vzqk nlse iddy` (COM espaços no .env)
- **Senha de App (usada)**: `kcvzqknlseiddy` (SEM espaços no código)

### Supabase:
- **URL**: https://gaevnrnthqxiwrdypour.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### EmailJS:
- **Service ID**: service_xehr3ta
- **Template ID**: template_d2rfx39
- **Public Key**: nGm0I7osOMW7psoqF

### Gemini AI:
- **API Key**: AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI

## ✅ Status

- [x] ✅ Arquivo `.env.local` corrigido
- [x] ✅ API atualizada com credenciais corretas
- [x] ✅ Remove espaços da senha de app
- [x] ✅ Logs de debug adicionados
- [x] ✅ Email remetente correto
- [x] ✅ URL do Supabase corrigida
- [ ] ⏳ Testar envio de email (PRÓXIMO PASSO)

---

**⚠️ IMPORTANTE**: Após fazer essas mudanças, você DEVE reiniciar o servidor para que as novas variáveis de ambiente sejam carregadas!

```bash
# Ctrl+C para parar
npm run dev
# Ou se estiver em produção, redeploy
```

---

**Data**: 26/10/2025  
**Sistema**: NAF Contabilidade - Backup por Email
