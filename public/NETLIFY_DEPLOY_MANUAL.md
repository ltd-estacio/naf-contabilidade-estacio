# 🚀 GUIA COMPLETO PARA DEPLOY NO NETLIFY

## ❌ Problema: "Looks like you followed a broken link"
**Causa**: O site ainda não foi criado no Netlify ou há problema na configuração.

## ✅ SOLUÇÃO PASSO A PASSO:

### 1. **Criar Site no Netlify** (Método Manual)

#### Opção A: Deploy via Dashboard Web
1. Acesse: https://app.netlify.com/
2. Clique em **"New site from Git"**
3. Escolha **GitHub**
4. Selecione o repositório: **cordeirotelecom/naf-contabil**
5. Configure:
   - **Branch**: `main`
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `.next`
6. Clique em **"Deploy site"**

#### Opção B: Deploy via CLI (Recomendado)
Execute no terminal:

```powershell
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Fazer login
netlify login

# 3. Criar site
netlify init

# 4. Deploy manual
netlify deploy --prod --dir=.next
```

### 2. **Configurar Variáveis de Ambiente**

Após criar o site, configure no painel do Netlify:

1. Acesse: **Site Settings → Environment Variables**
2. Adicione:

```
DATABASE_URL=postgresql://neondb_owner:SENHA_REAL@ep-ancient-brook-48988052.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL=https://SEU_SITE.netlify.app

NEXTAUTH_SECRET=naf-secret-2025-super-seguro-production
```

**⚠️ IMPORTANTE**: Substitua `SENHA_REAL` pela senha real do Neon Database.

### 3. **Verificar Build**

O build deve mostrar:
```
✅ Build successful
✅ 42/42 pages compiled
✅ No errors
```

### 4. **URL Final**

Seu site estará disponível em:
```
https://NOME_GERADO.netlify.app
```

Ou configure um domínio customizado como:
```
https://naf-contabil.netlify.app
```

## 🔧 TROUBLESHOOTING:

### Problema: Build Fail
```bash
npm run build
# Deve completar sem erros
```

### Problema: Database Connection
- Verifique se a URL do Neon está correta
- Teste conexão localmente primeiro

### Problema: 404 em Rotas
- Certifique-se que o redirect está configurado no netlify.toml

## 📋 CHECKLIST FINAL:

- [ ] Repositório GitHub atualizado
- [ ] Site criado no Netlify  
- [ ] Variáveis de ambiente configuradas
- [ ] Build passando sem erros
- [ ] Deploy concluído
- [ ] Site acessível na URL

---

**Se ainda houver problemas, execute o script de deploy manual.**
