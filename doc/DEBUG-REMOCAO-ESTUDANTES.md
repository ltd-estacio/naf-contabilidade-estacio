# 🐛 Debug - Problema na Remoção de Estudantes

## 🔍 Correções Aplicadas

### 1. API de Remoção (`/api/students/remove`)
✅ Corrigida para não depender de colunas que podem não existir ainda
✅ Adicionado tratamento de erro melhorado
✅ Logs detalhados para facilitar debug

### 2. API de Listagem (`/api/students/list`)
✅ Corrigida para fornecer valores padrão se colunas não existirem
✅ Não quebra mais se campos `is_graduated`, `registration_year` não existirem

### 3. Componente StudentsPerformancePanel
✅ Adicionados logs detalhados no console
✅ Mensagens de erro mais claras
✅ Alertas visuais para feedback ao usuário

---

## 📋 Como Testar Agora

### Passo 1: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### Passo 2: Abrir Console do Navegador

1. Acesse: `http://localhost:4000/coordinator-dashboard`
2. Pressione `F12` para abrir DevTools
3. Vá para a aba **Console**

### Passo 3: Tentar Remover um Estudante

1. Na seção "Performance dos Estudantes", clique em **"Remover"** em qualquer estudante
2. No console, você deverá ver:
   ```
   📚 Carregando lista de estudantes...
   📥 Dados recebidos: {success: true, students: [...]}
   ✅ X estudantes carregados
   ```
3. Quando clicar em "Confirmar Remoção", verá:
   ```
   🗑️ Removendo estudante: [id] Motivo: [motivo]
   📥 Resposta da API: {success: true, ...}
   ✅ Estudante removido com sucesso
   ```

---

## 🔴 Se Ainda Houver Erro

### Verifique no Console:

#### Erro 1: "Column 'is_graduated' does not exist"
**Causa**: O SQL de atualização não foi executado no Supabase
**Solução**:
1. Acesse o SQL Editor do Supabase
2. Execute o arquivo: `src/sql/update-students-graduation-tracking.sql`
3. Reinicie o servidor

#### Erro 2: "SUPABASE_SERVICE_ROLE_KEY is not defined"
**Causa**: Variável de ambiente não configurada
**Solução**:
1. Verifique o arquivo `.env.local`
2. Certifique-se de ter:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
   ```
3. Reinicie o servidor

#### Erro 3: "Failed to fetch" ou "Network Error"
**Causa**: API não está respondendo ou servidor está parado
**Solução**:
1. Verifique se `npm run dev` está rodando
2. Verifique se não há erros no terminal
3. Tente acessar diretamente: `http://localhost:4000/api/students/list`

#### Erro 4: "Forbidden" ou "401"
**Causa**: Problema com autenticação do Supabase
**Solução**:
1. Verifique se as credenciais do Supabase estão corretas
2. Verifique se a Service Role Key tem permissões suficientes

---

## 📸 O que Enviar para Debug

Se o problema persistir, envie:

1. **Print do Console (F12)**
   - Mostre todos os logs que aparecem quando tenta remover

2. **Print da Mensagem de Erro**
   - Se aparecer um alert ou mensagem de erro

3. **Logs do Terminal**
   - Copie os logs que aparecem no terminal onde está `npm run dev`

---

## 🧪 Teste Alternativo - Teste Direto da API

Você pode testar a API diretamente no navegador:

### 1. Testar Listagem
Abra no navegador:
```
http://localhost:4000/api/students/list
```
Deve retornar JSON com lista de estudantes.

### 2. Testar Remoção (via Console do Navegador)
No console do navegador (F12), cole e execute:

```javascript
// Substituir 'ID_DO_ESTUDANTE' pelo ID real de um estudante
fetch('/api/students/remove', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'ID_DO_ESTUDANTE',
    reason: 'TESTE'
  })
})
.then(res => res.json())
.then(data => console.log('Resultado:', data))
.catch(err => console.error('Erro:', err))
```

---

## ✅ Checklist de Verificação

Antes de testar, confirme:

- [ ] Servidor rodando (`npm run dev`)
- [ ] Consegue acessar `http://localhost:4000/coordinator-dashboard`
- [ ] Console aberto (F12)
- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Supabase acessível

---

## 🆘 Problema Comum: Estudante não aparece na lista

Se após remover, o estudante continua aparecendo:

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Force reload** (Ctrl+F5)
3. **Verifique no Supabase** se o status mudou para INATIVO
   - Acesse Table Editor → students
   - Procure o estudante removido
   - Verifique se o campo `status` está como "INATIVO"

---

## 📝 Logs Esperados (Caso de Sucesso)

```
📚 Carregando lista de estudantes...
📥 Dados recebidos: {success: true, students: Array(5)}
✅ 5 estudantes carregados

[Usuário clica em "Remover"]

🗑️ Removendo estudante: abc-123-def Motivo: GRADUADO
📥 Resposta da API: {success: true, message: "Estudante removido com sucesso", ...}
✅ Estudante removido com sucesso

📚 Carregando lista de estudantes...
📥 Dados recebidos: {success: true, students: Array(4)}
✅ 4 estudantes carregados
```

---

**Desenvolvido para NAF Estácio Florianópolis**
_Debug Guide v1.0_
