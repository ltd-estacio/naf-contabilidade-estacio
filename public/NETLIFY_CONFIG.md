# 🚀 Deploy no Netlify - Configuração Completa

## ✅ Status: Repositório conectado ao Netlify

### 📋 Configurações do Build

No painel do Netlify, use estas configurações:

**Build settings:**
- **Build command**: `npm ci && npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 🔧 Variáveis de Ambiente Obrigatórias

Vá em **Site settings > Environment variables** e adicione:

```
NEXTAUTH_URL = https://sua-url-gerada.netlify.app
NEXTAUTH_SECRET = naf-secret-2025-super-seguro
DATABASE_URL = file:./dev.db
NODE_ENV = production
```

### ⚡ Deploy Automático

1. **Clique em "Deploy site"** no Netlify
2. **Aguarde 3-5 minutos** para o build completar
3. **Acesse sua URL** gerada automaticamente
4. **Teste o sistema** com os usuários abaixo

### 🔑 Usuários de Teste

- **Coordenador**: `coordenador@naf.teste` / `123456`
- **Professor**: `professor@naf.teste` / `123456`  
- **Aluno**: `aluno@naf.teste` / `123456`

### 📱 Funcionalidades Online

✅ **Dashboard Interativo** com 5 abas  
✅ **21+ Serviços NAF** catalogados  
✅ **Sistema de Agendamento**  
✅ **Gestão de Demandas**  
✅ **Relatórios** (JSON, CSV, XLSX)  
✅ **Interface Power BI**  
✅ **Autenticação por Roles**  
✅ **Design Responsivo**  

### 🔄 Deploy Automático

A partir de agora, **todo push para main** fará deploy automático!

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático no Netlify! 🚀
```

### 🌐 URLs

- **Repositório**: https://github.com/cordeirotelecom/naf-contabil
- **Netlify**: URL será gerada após primeiro deploy
- **Local**: http://localhost:4000

---

## 🆘 Problemas no Build?

Se der erro, verificar:
1. **Node version** = 18
2. **Build command** = `npm ci && npm run build`
3. **Publish directory** = `.next`
4. **Variáveis de ambiente** configuradas

---

### 🎉 Seu Sistema NAF estará online em poucos minutos!
