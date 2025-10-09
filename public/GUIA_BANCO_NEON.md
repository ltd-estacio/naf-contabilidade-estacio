# 🗄️ Configuração do Banco de Dados Neon - NAF Contábil

## 📋 Passos para Configurar o Banco

### 1. ✅ Criar Banco no Neon (VOCÊ ESTÁ AQUI)

**Na tela atual do Netlify:**
1. Clique no botão **"Add new database"** (botão verde)
2. Escolha um nome para o banco: `naf-contabil-db`
3. Selecione a região mais próxima (US East ou Europe West)
4. Clique em **Create Database**

### 2. 📝 Copiar URL de Conexão

Após criar o banco, você receberá:
- **Database URL**: `postgresql://username:password@host/database`
- Copie esta URL completa

### 3. ⚙️ Configurar no Netlify

**No painel do Netlify:**
1. Vá para **Site Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://sua_url_do_neon_aqui
NEXTAUTH_URL=https://naf-contabil.netlify.app
NEXTAUTH_SECRET=uma_chave_secreta_de_32_caracteres
NODE_ENV=production
```

### 4. 🔄 Gerar Chave Secreta

Para o `NEXTAUTH_SECRET`, use este comando no terminal:
```bash
openssl rand -base64 32
```

Ou use esta chave temporária:
```
J9K8L7M6N5O4P3Q2R1S0T9U8V7W6X5Y4Z3A2B1C0D9E8F7G6H5I4J3K2L1M0N9O8P7Q6
```

### 5. 🛠️ Inicializar Schema do Banco

Após configurar as variáveis, você precisa executar as migrations do Prisma no banco remoto.

## 📱 Próximos Passos Automáticos

1. **Criar o banco** → Você fará agora
2. **Configurar variáveis** → Eu te orientarei
3. **Executar migrations** → Eu farei isso para você
4. **Testar conexão** → Validaremos juntos

## 🆘 Se Houver Problemas

- **Erro de conexão**: Verifique se a URL está correta
- **Timeout**: Tente uma região diferente
- **Permissões**: Verifique se o usuário tem acesso completo

## 📞 O Que Fazer Agora

1. **Clique em "Add new database"** na tela atual
2. **Configure o banco** com nome `naf-contabil-db`
3. **Copie a URL** que será gerada
4. **Me avise** quando terminar para continuar a configuração

---
*Eu estarei aqui para te ajudar com cada passo! 🤝*
