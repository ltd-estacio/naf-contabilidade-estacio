# 🚀 Deploy Automático - Sistema NAF Contábil

## ⚡ Passo a Passo Rápido

### 1️⃣ Criar Repositório no GitHub (PRIMEIRO)

1. **Acesse**: https://github.com/cordeirotelecom
2. **Clique em**: "New repository" (botão verde)
3. **Nome do repositório**: `naf-contabil`
4. **Descrição**: `Sistema NAF - Núcleo de Apoio Contábil e Fiscal`
5. **Visibilidade**: Public ou Private (sua escolha)
6. **⚠️ IMPORTANTE**: NÃO marque "Add README" (já temos um)
7. **Clique em**: "Create repository"

### 2️⃣ Enviar Código (EXECUTE ESTES COMANDOS)

```bash
# No PowerShell, dentro da pasta do projeto:
cd "c:\Users\corde\OneDrive\Desktop\NAF_Contabil"
git remote set-url origin https://github.com/cordeirotelecom/naf-contabil.git
git push -u origin main
```

### 3️⃣ Deploy no Netlify (AUTOMÁTICO)

1. **Acesse**: https://netlify.com
2. **Faça login** com GitHub
3. **Clique em**: "New site from Git"
4. **Escolha**: GitHub
5. **Selecione**: cordeirotelecom/naf-contabil
6. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18
7. **Clique em**: "Deploy site"

### 4️⃣ Configurar Variáveis de Ambiente no Netlify

No painel do Netlify, vá em: **Site settings > Environment variables**

**Adicione estas variáveis**:
```
NEXTAUTH_URL = https://seu-site-gerado.netlify.app
NEXTAUTH_SECRET = naf-secret-2025-super-seguro
DATABASE_URL = file:./dev.db
NODE_ENV = production
```

## ✅ URLs Finais

- **GitHub**: https://github.com/cordeirotelecom/naf-contabil
- **Netlify**: https://naf-contabil.netlify.app (ou URL gerada)
- **Local**: http://localhost:4000

## 🔑 Usuários de Teste

- **Coordenador**: coordenador@naf.teste / 123456
- **Professor**: professor@naf.teste / 123456  
- **Aluno**: aluno@naf.teste / 123456

## 📱 Funcionalidades do Sistema

✅ **Dashboard Interativo** com gráficos e estatísticas  
✅ **21+ Serviços NAF** catalogados  
✅ **Sistema de Agendamento** completo  
✅ **Gestão de Demandas** e atendimentos  
✅ **Relatórios** em múltiplos formatos  
✅ **Interface Power BI** integrada  
✅ **Sistema de Autenticação** por roles  
✅ **Design Responsivo** moderno  

## 🎯 Deploy em 5 Minutos

1. Criar repo no GitHub (2 min)
2. Executar comandos git (1 min)  
3. Conectar no Netlify (2 min)
4. **PRONTO!** Sistema online

---

## 🆘 Problemas?

Se der erro no push:
```bash
git remote -v  # verificar se está correto
git push -f origin main  # forçar push se necessário
```

**💡 Dica**: O Netlify fará deploy automático a cada push para main!

---

### 🎉 Seu Sistema NAF estará online e funcionando perfeitamente!
