# 📋 Instruções para Popular Atendimentos Fiscais

## Problema
O painel do estudante está vazio na seção "Atendimentos Fiscais" porque não há dados na tabela `fiscal_appointments` do banco de dados.

## Solução

### Passo 1: Descobrir o ID do Estudante Logado

1. Acesse o **Supabase Dashboard** (https://supabase.com)
2. Vá em **SQL Editor**
3. Execute o seguinte comando para descobrir o email e ID do estudante:

```sql
SELECT id, name, email, course, semester
FROM public.students
ORDER BY created_at DESC
LIMIT 10;
```

4. Anote o **email** do estudante que está logado no sistema

---

### Passo 2: Popular os Atendimentos Fiscais

1. Ainda no **SQL Editor** do Supabase
2. Abra o arquivo: `src/sql/seed-fiscal-appointments-for-student.sql`
3. **IMPORTANTE**: Substitua o email em **DUAS** linhas do script:

   **Linha 21** e **Linha 301**:
   ```sql
   WHERE email = 'joao.silva@estudante.edu.br'
   ```

   Substitua `'joao.silva@estudante.edu.br'` pelo **email do estudante logado** que você anotou no Passo 1.

4. Copie **TODO** o conteúdo do arquivo modificado
5. Cole no **SQL Editor** do Supabase
6. Clique em **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

---

### Passo 3: Verificar os Dados

Após executar o script, você verá uma mensagem de sucesso como:

```
========================================
✅ SUCESSO! Inseridos 10 atendimentos fiscais
========================================
Distribuição por status:
  - 3 PENDENTES (aguardando confirmação)
  - 5 CONFIRMADOS (agendados)
  - 1 EM_ANDAMENTO (em atendimento)
  - 2 CONCLUÍDOS (finalizados)
========================================
```

E uma tabela mostrando todos os atendimentos criados.

---

### Passo 4: Atualizar o Painel do Estudante

1. Volte para o sistema (painel do estudante)
2. **Recarregue a página** (F5 ou Ctrl+R / Cmd+R)
3. Acesse a aba **"Atendimentos Fiscais"**
4. Agora você verá **10 atendimentos fiscais** com dados reais do banco!

---

## 📊 O que foi criado?

O script cria **10 atendimentos fiscais realistas** com:

- ✅ 5 Atendimentos CONFIRMADOS (prontos para iniciar)
- ⏳ 3 Atendimentos PENDENTES (aguardando)
- 🔄 1 Atendimento EM_ANDAMENTO (em andamento)
- ✅ 2 Atendimentos CONCLUÍDOS (finalizados)

### Categorias de serviços:
- 📊 Declaração IRPF
- 💼 Orientação MEI
- 📄 Emissão de Nota Fiscal
- 🏞️ ITR - Imposto Territorial Rural
- 🏢 Abertura de CNPJ
- 🆔 Regularização de CPF
- 📈 Orientação Tributária

---

## 🔧 Funcionalidades Disponíveis

Depois de popular os dados, o estudante poderá:

1. **Ver todos os atendimentos** na aba "Atendimentos Fiscais"
2. **Iniciar atendimento**: Clicar em "Iniciar Atendimento" nos atendimentos CONFIRMADOS
3. **Concluir atendimento**: Clicar em "Concluir Atendimento" nos atendimentos EM_ANDAMENTO
4. **Ver detalhes completos**: Todas as informações do cliente, protocolo, datas, observações, etc.

---

## ⚠️ Importante

- **NÃO** use dados mock! Todos os dados vêm do banco de dados real
- Substitua o email **corretamente** nas linhas indicadas
- Execute o script **apenas uma vez** para evitar duplicatas
- Se precisar recriar os dados, primeiro delete os existentes com:

```sql
DELETE FROM public.fiscal_appointments
WHERE assigned_student_id IN (
  SELECT id FROM public.students WHERE email = 'SEU_EMAIL@email.com'
);
```

---

## 📞 Dúvidas?

Se algo não funcionar:
1. Verifique se o email foi substituído corretamente
2. Verifique se o estudante existe na tabela `students`
3. Veja os logs no console do navegador (F12 → Console)
4. Verifique os logs da API no terminal onde o Next.js está rodando

---

**Pronto! Agora o painel do estudante terá dados reais e completos! 🎉**
