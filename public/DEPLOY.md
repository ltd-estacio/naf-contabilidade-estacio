# 🚀 Guia de Deploy - NAF Sistema

Este guia irá te ajudar a colocar o projeto NAF online usando GitHub e Netlify.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Netlify](https://netlify.com)
- Conta no [Supabase](https://supabase.com) (para banco de dados PostgreSQL gratuito)

## 🗂️ Passo 1: Criar Repositório no GitHub

### 1.1 Inicializar Git no projeto
```bash
# Navegar para a pasta do projeto
cd NAF_Contabil

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: initial commit - NAF sistema completo"
```

### 1.2 Criar repositório no GitHub
1. Acesse [GitHub](https://github.com) e faça login
2. Clique em "New repository" (botão verde)
3. Configure:
   - **Repository name**: `naf-contabil-sistema`
   - **Description**: `Sistema NAF - Núcleo de Apoio Contábil Fiscal`
   - **Visibility**: Public (ou Private se preferir)
   - ⚠️ **NÃO** marque "Add a README file" (já temos um)
   - ⚠️ **NÃO** adicione .gitignore (já temos um)

### 1.3 Conectar repositório local com GitHub
```bash
# Adicionar origem remota (substitua YOUR_USERNAME pelo seu usuário do GitHub)
git remote add origin https://github.com/YOUR_USERNAME/naf-contabil-sistema.git

# Fazer push inicial
git branch -M main
git push -u origin main
```

## 🗄️ Passo 2: Configurar Banco de Dados (Supabase)

### 2.1 Criar projeto no Supabase
1. Acesse [Supabase](https://supabase.com) e faça login
2. Clique em "New Project"
3. Configure:
   - **Name**: `naf-contabil`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha próximo ao Brasil
   - **Pricing Plan**: Free

### 2.2 Obter URL de conexão
1. No dashboard do Supabase, vá em "Settings" → "Database"
2. Copie a "Connection string" (URI)
3. Substitua `[YOUR-PASSWORD]` pela senha criada

Exemplo:
```
postgresql://postgres:[SUA-SENHA]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 2.3 Executar migrações
1. Atualize o `.env.local` com a URL do Supabase:
```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

2. Execute as migrações:
```bash
npx prisma migrate dev --name init
```

## 🌐 Passo 3: Deploy no Netlify

### 3.1 Conectar Netlify ao GitHub
1. Acesse [Netlify](https://netlify.com) e faça login
2. Clique em "New site from Git"
3. Escolha "GitHub"
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório `naf-contabil-sistema`

### 3.2 Configurar Build
1. **Branch to deploy**: `main`
2. **Build command**: `npm run build`
3. **Publish directory**: `.next`

### 3.3 Configurar Variáveis de Ambiente
Na seção "Environment variables", adicione:

```env
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.abcdefghijklmnop.supabase.co:5432/postgres
NEXTAUTH_URL=https://naf-contabil.netlify.app
NEXTAUTH_SECRET=sua-chave-secreta-super-forte-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
NODE_ENV=production
```

### 3.4 Deploy
1. Clique em "Deploy site"
2. Aguarde o build e deploy (pode levar alguns minutos)
3. Seu site estará disponível em uma URL como `https://magical-name-123456.netlify.app`

### 3.5 Personalizar URL (Opcional)
1. No dashboard do Netlify, vá em "Site settings"
2. Clique em "Change site name"
3. Escolha um nome como `naf-contabil` 
4. Sua URL será `https://naf-contabil.netlify.app`

## 📧 Passo 4: Configurar Email (Gmail)

### 4.1 Gerar Senha de App do Gmail
1. Acesse [Google Account](https://myaccount.google.com)
2. Vá em "Security" → "2-Step Verification"
3. Role para baixo e clique em "App passwords"
4. Gere uma senha para "Mail"
5. Use essa senha na variável `SMTP_PASSWORD`

### 4.2 Atualizar Variáveis no Netlify
1. No Netlify, vá em "Site settings" → "Environment variables"
2. Atualize `SMTP_USER` e `SMTP_PASSWORD`
3. Clique em "Redeploy" para aplicar

## 🔄 Passo 5: Configurar Deploy Automático

### 5.1 Configurar Branch Protection (Opcional)
```bash
# Criar branch de desenvolvimento
git checkout -b develop
git push -u origin develop
```

### 5.2 Workflow de Deploy
Agora, sempre que você fizer push para `main`, o Netlify irá automaticamente:
1. Baixar o código
2. Instalar dependências
3. Fazer build
4. Fazer deploy

## 🎯 URLs Finais

Após completar todos os passos, você terá:

- **Site**: `https://naf-contabil.netlify.app`
- **Repositório**: `https://github.com/YOUR_USERNAME/naf-contabil-sistema`
- **Banco**: Dashboard do Supabase para monitoramento

## 🔧 Comandos Úteis para Manutenção

```bash
# Fazer alterações e deploy
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Ver logs do banco
npx prisma studio

# Reset do banco (CUIDADO!)
npx prisma migrate reset

# Backup do banco
pg_dump [DATABASE_URL] > backup.sql
```

## ⚠️ Importante

1. **Nunca** commite o arquivo `.env.local` (já está no .gitignore)
2. **Sempre** use variáveis de ambiente para dados sensíveis
3. **Monitore** os custos do Supabase (free tier tem limites)
4. **Faça backup** do banco regularmente

## 🆘 Troubleshooting

### Build Error no Netlify
```bash
# Limpar cache e rebuild local
npm run build

# Se funcionou local, o problema pode ser:
# 1. Variável de ambiente faltando
# 2. Node version diferente
```

### Database Connection Error
1. Verificar se a URL está correta
2. Confirmar que o Supabase não está pausado
3. Testar conexão local com a mesma URL

### Email não funciona
1. Verificar se 2FA está ativado no Gmail
2. Usar senha de app, não senha normal
3. Testar SMTP com ferramenta online

---

🎉 **Parabéns!** Seu sistema NAF está agora online e pronto para uso!

**Próximos passos sugeridos:**
1. Criar usuário administrador inicial
2. Configurar domínio personalizado
3. Adicionar SSL certificate (Netlify faz automaticamente)
4. Configurar monitoramento e analytics
5. Implementar backups automáticos
