# 🧪 Como Testar o Registro de Estudante

## 🔍 Problema Identificado

Erro 500 ao tentar criar conta de estudante em:
```
http://localhost:4000/student-register
```

---

## ✅ Solução Passo a Passo

### **1️⃣ Verificar se o Servidor Está Rodando**

```bash
# Certifique-se de estar na pasta do projeto
cd /Users/cliente/Desktop/naf-contabil-1.0.0

# Inicie o servidor de desenvolvimento
npm run dev
```

O servidor deve iniciar em: `http://localhost:4000`

---

### **2️⃣ Testar via Script Automatizado**

Execute o script de teste criado:

```bash
# No terminal, na pasta do projeto
node test-student-register.js
```

**O que o script faz:**
- Cria um estudante de teste com todos os dados necessários
- Envia requisição POST para `/api/students/register`
- Mostra o resultado detalhado

**Resultado esperado:**
```
✅ SUCESSO! Estudante criado:
{
  "message": "Conta criada com sucesso",
  "student": {
    "id": "uuid-aqui",
    "email": "teste@estudante.com",
    "name": "Estudante Teste",
    "course": "Ciências Contábeis",
    "semester": "7º Semestre",
    "status": "ATIVO"
  }
}
```

---

### **3️⃣ Testar Manualmente no Navegador**

1. Abra: `http://localhost:4000/student-register`

2. Preencha o formulário:

**Passo 1 - Dados Pessoais:**
- Nome: Seu Nome Completo
- E-mail: seuemail@teste.com
- Telefone: (11) 98765-4321
- CPF: 123.456.789-00
- Data de Nascimento: 01/01/2000

**Passo 2 - Dados Acadêmicos:**
- Curso: Ciências Contábeis
- Semestre: 7º Semestre
- Matrícula: 2024123456

**Passo 3 - Endereço:**
- CEP: 01234-567
- Rua: Rua Teste
- Número: 123
- Bairro: Centro
- Cidade: São Paulo
- Estado: SP

**Passo 4 - Segurança:**
- Senha: 123456
- Confirmar Senha: 123456

3. Clique em **"Finalizar Cadastro"**

**Resultado esperado:**
- Mensagem de sucesso
- Redirecionamento para `/student-login-simple`

---

### **4️⃣ Verificar Logs do Servidor**

Se houver erro, verifique os logs no terminal onde o `npm run dev` está rodando.

Você deve ver logs como:

```
📥 POST /api/students/register - Iniciando cadastro
📋 Dados recebidos (sem senha): { ... }
✅ Validando campos obrigatórios: { ... }
💾 Tentando inserir no banco...
📝 Dados preparados para inserção: { ... }
📊 Resultado da inserção: { sucesso: true }
```

Se houver erro:
```
❌ Erro ao inserir estudante: { message: "...", details: "..." }
```

---

## 🔧 Possíveis Erros e Soluções

### **Erro: "Email já cadastrado"**

```json
{
  "message": "Email já cadastrado"
}
```

**Solução:** Use um e-mail diferente que ainda não está no banco.

---

### **Erro: "CPF já cadastrado"**

```json
{
  "message": "CPF já cadastrado"
}
```

**Solução:** Use um CPF diferente ou deixe o campo vazio (opcional).

---

### **Erro: "Número de matrícula já cadastrado"**

```json
{
  "message": "Número de matrícula já cadastrado"
}
```

**Solução:** Use um número de matrícula diferente ou deixe vazio (opcional).

---

### **Erro: "Campos obrigatórios faltando"**

```json
{
  "message": "Campos obrigatórios faltando"
}
```

**Campos obrigatórios:**
- `email`
- `password`
- `name`
- `course`
- `semester`

**Solução:** Certifique-se de preencher todos esses campos.

---

### **Erro: "column ... does not exist"**

Exemplo:
```
column "university" of relation "students" does not exist
```

**Solução:** A tabela `students` está desatualizada. Execute:

```sql
-- No Supabase SQL Editor
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS university TEXT;
```

---

### **Erro: "relation ... does not exist"**

Exemplo:
```
relation "student_performance" does not exist
```

**Solução:** Tabela faltando. Execute o script de criação:

```bash
# No Supabase SQL Editor
src/sql/tables.sql
```

---

## 📊 Verificar Dados no Banco

Após criar um estudante, verifique no Supabase:

```sql
-- Ver estudantes criados
SELECT
  id,
  name,
  email,
  course,
  semester,
  status,
  created_at
FROM public.students
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🐛 Debug Avançado

Se ainda houver problema, ative logs detalhados:

1. **No terminal do servidor**, veja os logs completos
2. **No navegador**, abra DevTools (F12) → Console
3. **No Supabase**, veja logs em: Database → Logs

---

## ✅ Checklist de Verificação

Antes de testar, confirme:

- [ ] Servidor rodando em `http://localhost:4000`
- [ ] Supabase configurado corretamente (`.env.local`)
- [ ] Tabela `students` existe
- [ ] Tabela `student_performance` existe
- [ ] Tabela `student_activity_logs` existe
- [ ] Pacote `bcryptjs` instalado (`npm list bcryptjs`)

---

## 🚀 Teste Rápido - Resumo

```bash
# 1. Iniciar servidor
npm run dev

# 2. Em outra aba do terminal, executar teste
node test-student-register.js

# 3. Ver resultado
```

Se o teste passar, tente pelo navegador:
```
http://localhost:4000/student-register
```

---

**Status:** Logs detalhados adicionados + Script de teste criado
**Próximo passo:** Executar `node test-student-register.js` e verificar o erro específico
