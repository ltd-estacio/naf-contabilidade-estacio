# Guia Completo de Deploy no Netlify - NAF Contábil

## ✅ Configurações Realizadas

### 1. Arquivos de Configuração Criados
- `netlify.toml` - Configuração principal do Netlify
- `.env.netlify` - Template das variáveis de ambiente
- `deploy-netlify.ps1` - Script de deploy para Windows
- `deploy-netlify.sh` - Script de deploy para Linux/Mac

### 2. Next.js Configurado para Export Estático
```javascript
// next.config.js
{
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
}
```

### 3. Netlify.toml Otimizado
- Build command: `npm ci && npm run build`
- Publish directory: `.next`
- Node.js 18
- Variáveis de ambiente de produção
- Headers de segurança
- Redirects para API
- Configuração CORS

## 🚀 Deploy Automático

### Opção 1: Script PowerShell (Windows)
```powershell
.\deploy-netlify.ps1
```

### Opção 2: Script Bash (Linux/Mac)
```bash
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

### Opção 3: Manual
```bash
git add .
git commit -m "deploy: configuração final Netlify"
git push origin main
```

## ⚙️ Configuração no Painel Netlify

### 1. Variáveis de Ambiente Obrigatórias
Acesse: Site Settings > Environment Variables

```
NEXTAUTH_URL=https://seu-site.netlify.app
NEXTAUTH_SECRET=sua_chave_secreta_32_caracteres
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
```

### 2. Build Settings
- Build command: `npm ci && npm run build`
- Publish directory: `.next`
- Node version: 18

### 3. Deploy Settings
- Branch to deploy: `main`
- Auto-deploy: Enabled

## 🔧 Configurações Pós-Deploy

### 1. Banco de Dados
- Configure PostgreSQL em um serviço como:
  - Supabase (gratuito)
  - Railway
  - Heroku Postgres
  - PlanetScale

### 2. Autenticação NextAuth
- Gere uma chave secreta: `openssl rand -base64 32`
- Configure no Netlify: Environment Variables

### 3. DNS Personalizado (Opcional)
- Site Settings > Domain Management
- Adicione seu domínio personalizado

## 📊 Monitoramento

### 1. Build Logs
- Netlify Dashboard > Deploys
- Visualize logs de build em tempo real

### 2. Function Logs
- Functions > View logs
- Monitore APIs e funções serverless

### 3. Analytics
- Netlify Analytics (opcional)
- Google Analytics (se configurado)

## 🆘 Resolução de Problemas

### Build Failures
```bash
# Limpar cache e rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables
- Verifique se todas estão configuradas
- Reinicie o deploy após alterações

### Database Connection
- Teste conexão local primeiro
- Verifique URL de conexão em produção

## 🔗 Links Úteis

- **Site de Produção**: https://naf-contabil.netlify.app
- **GitHub Repository**: https://github.com/cordeirotelecom/naf-contabil
- **Netlify Dashboard**: https://app.netlify.com
- **Documentação Netlify**: https://docs.netlify.com

## ✨ Status do Deploy

- ✅ Configuração completa realizada
- ✅ Scripts de deploy criados
- ✅ Next.js otimizado para Netlify
- ✅ Variáveis de ambiente documentadas
- ⏳ Aguardando deploy automático
