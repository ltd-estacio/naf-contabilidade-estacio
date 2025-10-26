# 🚀 Guia de Deploy no Vercel - NAF Contábil

## ❌ PROBLEMA IDENTIFICADO

O erro `500 (Internal Server Error)` no cadastro de estudantes em produção é causado por **chave Supabase incorreta** no Vercel.

**Diagnóstico completo**:
1. ✅ Todas as variáveis de ambiente estão configuradas no Vercel
2. ❌ A `SUPABASE_SERVICE_ROLE_KEY` está usando a chave anônima (anon) ao invés da chave service_role
3. **Erro específico**: `Invalid API key` - a chave anônima não tem permissão para operações administrativas

## ✅ SOLUÇÃO: Configurar Variáveis de Ambiente no Vercel

### 1. 🔧 Acessar Configurações do Vercel

1. Acesse: [vercel.com](https://vercel.com)
2. Vá no projeto: `naf-contabil-92kd`
3. Clique em **Settings**
4. Na barra lateral, clique em **Environment Variables**

### 2. 📝 Adicionar as Variáveis OBRIGATÓRIAS

Adicione **EXATAMENTE** estas variáveis:

```bash
# ===== SUPABASE (OBRIGATÓRIO) =====
NEXT_PUBLIC_SUPABASE_URL=https://gaevnrnthqxiwrdypour.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcxMTE3MywiZXhwIjoyMDczMjg3MTczfQ.M8_1n8Y7HCrfBOV4xm6RzY-dR_3n8Y7HCrfBOV4xm6R

# ===== URL BASE =====
NEXT_PUBLIC_BASE_URL=https://naf-contabil-92kd.vercel.app
NEXTAUTH_URL=https://naf-contabil-92kd.vercel.app

# ===== NEXTAUTH =====
NEXTAUTH_SECRET=naf-secret-2025-super-seguro-mudar-em-producao

# ===== AMBIENTE =====
NODE_ENV=production
```

### 3. 🔄 Importante: Como Adicionar no Vercel

Para cada variável acima:

1. **Name**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value**: Valor da variável (ex: `https://gaevnrnthqxiwrdypour.supabase.co`)
3. **Environments**: Selecione **Production** (e opcionalmente Preview/Development)
4. Clique **Add**

### 4. 🚀 Redeploy Obrigatório

**DEPOIS** de adicionar todas as variáveis:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos (...) do último deploy
3. Clique **Redeploy**
4. Aguarde o build completar

## ✅ TESTE: Como Verificar se Funcionou

### Método 1: Teste Manual
1. Acesse: https://naf-contabil-92kd.vercel.app/student-register
2. Preencha o formulário de cadastro
3. Clique em "Criar Conta"
4. **Deve funcionar sem erro 500**

### Método 2: Teste via API
```bash
curl -X POST https://naf-contabil-92kd.vercel.app/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "name": "Teste Usuario",
    "course": "Contabilidade",
    "semester": "1º Semestre"
  }'
```

**Resposta esperada**:
```json
{
  "message": "Conta criada com sucesso",
  "student": {
    "id": "...",
    "email": "teste@exemplo.com",
    "name": "Teste Usuario",
    "course": "Contabilidade",
    "semester": "1º Semestre",
    "status": "ATIVO"
  }
}
```

## 🐛 Se Ainda Não Funcionar

### 1. Verificar Build Logs
- Vercel > Deployments > [Latest] > View Function Logs
- Procurar por erros relacionados a Supabase

### 2. Verificar Variáveis foram Salvas
- Vercel > Settings > Environment Variables
- Confirmar que todas as 6 variáveis estão listadas

### 3. Forçar Novo Deploy
- Fazer uma mudança pequena no código
- Commit e push
- Aguardar novo deploy automático

## ⚠️ Checklist Final

- [ ] Todas as 6 variáveis foram adicionadas no Vercel
- [ ] Redeploy foi executado após adicionar variáveis
- [ ] Teste de cadastro funcionou sem erro 500
- [ ] Chat e outras funcionalidades funcionam normalmente

---

## 🔍 Diagnóstico Técnico

**Causa raiz**: O arquivo `src/lib/supabase.ts` cria o cliente Supabase usando:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
```

Quando essas variáveis estão vazias em produção, o Supabase retorna "Invalid API key".

**Solução**: Configurar as variáveis no Vercel e redeploy.