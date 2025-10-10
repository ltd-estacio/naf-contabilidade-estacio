# ⚠️ INSTRUÇÕES URGENTES - Adicionar Dados

## Problema

Os dados estão zerados porque **não há atendimentos no banco de dados**.

## Solução em 3 Minutos

### **PASSO 1: Abrir Supabase**

1. Acesse: https://app.supabase.com
2. Entre no seu projeto
3. Clique em **"SQL Editor"** no menu lateral

### **PASSO 2: Executar Script Automático**

1. Clique em **"New Query"**
2. **Copie TODO o conteúdo** do arquivo:
   ```
   scripts/seed-auto.sql
   ```
3. **Cole no SQL Editor**
4. Clique em **"Run"** ou pressione **Ctrl+Enter**

### **PASSO 3: Verificar Resultado**

Você deve ver no console do Supabase:

```
NOTICE: Criando atendimentos para: Estevam Souza Laureth
NOTICE: ✅ Total de atendimentos criados: 4
NOTICE: ========================================
NOTICE: ✅ SUCESSO!
NOTICE: ========================================
NOTICE: Total de atendimentos criados: 4
```

E duas tabelas mostrando:
- **Atendimentos por estudante**
- **Estatísticas gerais**

### **PASSO 4: Recarregar Dashboard**

1. Volte ao dashboard: `http://localhost:3000/coordinator-dashboard`
2. Vá em: **Business Intelligence** → **Geral**
3. Clique em **"Atualizar"**

---

## O Que o Script Faz

O script **AUTOMÁTICO** cria para cada estudante ativo:

- ✅ 3 atendimentos **CONCLUÍDOS** com avaliações (4-5 estrelas)
- ✅ 1 atendimento **EM_ANDAMENTO** (sem avaliação ainda)

**Total:** 4 atendimentos por estudante

---

## Resultado Esperado

Após executar o script, você verá:

### **Aba Geral:**
```
✅ Atendimentos: 4 (ou mais, dependendo do número de estudantes)
✅ Taxa Conclusão: 75.0%
✅ Satisfação: 4.7
✅ Crescimento: calculado automaticamente
✅ Estudantes: 1 estudante ativo
✅ Serviços: 22 serviços disponíveis
✅ Duração Média: 45 min
```

### **Aba Estudantes:**
```
✅ Ranking de Estudantes: Mostra todos os estudantes com atendimentos
✅ Estudantes Ativos: 1 (ou mais)
✅ Mais Produtivos: Lista com scores
```

---

## Troubleshooting

### ❌ Erro: "Não há estudantes ativos"

**Causa:** Você não tem estudantes cadastrados

**Solução:** Crie um estudante primeiro:

```sql
INSERT INTO students (name, email, course, semester, status, created_at)
VALUES (
    'Estudante Teste',
    'teste@example.com',
    'Análise e Desenvolvimento de Sistemas',
    '5º Semestre',
    'ATIVO',
    NOW()
);
```

Depois execute o script `seed-auto.sql` novamente.

### ❌ Erro: "column student_id does not exist"

**Causa:** A tabela `attendances` não tem a estrutura correta

**Solução:** Execute o schema SQL:

```sql
-- Verificar estrutura da tabela
\d attendances;

-- Se necessário, adicionar coluna student_id
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id);
```

### ❌ Dados não aparecem no dashboard

**Causa:** O período selecionado é muito curto (ex: 7 dias)

**Solução:**
1. No dashboard, altere o período para **"Todos"**
2. Clique em **"Atualizar"**

### ❌ Console mostra erro 500

**Causa:** Credenciais do Supabase inválidas

**Solução:** Verifique o arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

---

## Verificação Rápida

Execute no Supabase SQL Editor:

```sql
-- Verificar quantos atendimentos foram criados
SELECT COUNT(*) FROM attendances;

-- Verificar quantos estudantes têm atendimentos
SELECT
    s.name,
    COUNT(a.id) as total_atendimentos,
    AVG(a.client_satisfaction_rating) as satisfacao_media
FROM students s
LEFT JOIN attendances a ON s.id = a.student_id
WHERE s.status = 'ATIVO'
GROUP BY s.id, s.name;
```

---

## Logs do Console

Após recarregar o dashboard, abra o console (F12) e procure por:

```
📊 Data fetched - Attendances: 4, Students: 1, Services: 22
⭐ Satisfação: 3 avaliações, média 4.67
✅ general report loaded successfully
📈 General Stats: {totalAttendances: 4, totalStudents: 1, ...}
```

Se você ver **"Attendances: 0"**, significa que o script não foi executado ou falhou.

---

## Próximos Passos

1. ✅ Execute o script `seed-auto.sql` no Supabase
2. ✅ Verifique as tabelas de resultado
3. ✅ Recarregue o dashboard
4. ✅ Clique em "Atualizar"
5. ✅ Confira se os dados aparecem

Se ainda não funcionar, envie um print do console (F12) e das mensagens do Supabase.

---

**Tempo estimado:** 3 minutos
**Dificuldade:** Fácil - só copiar e colar!
**Status:** ✅ Testado e funcionando
