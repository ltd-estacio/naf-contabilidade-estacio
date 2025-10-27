# 🚨 INSTRUÇÕES URGENTES: Corrigir "Verificar Graduados"

## ❌ Problema Atual

Você está recebendo este erro ao executar `funcao_verificar_graduados.sql`:

```
ERROR: 42703: column s.is_graduated does not exist
LINE 72: s.is_graduated,
```

**Causa**: A tabela `students` não possui as colunas necessárias para rastreamento de graduação.

---

## ✅ SOLUÇÃO: Execute 2 Scripts na Ordem Correta

### 📋 PASSO 1: Adicionar Colunas de Graduação

**Arquivo**: `src/sql/EXECUTAR_PRIMEIRO_adicionar_colunas_graduacao.sql`

**O que faz**:
- ✅ Remove constraint antigo de `status`
- ✅ Adiciona novo constraint com valor 'GRADUADO'
- ✅ Adiciona colunas: `is_graduated`, `graduation_date`, `registration_year`, etc.
- ✅ Cria índices para performance
- ✅ Atualiza registros existentes com valores padrão

**Como executar**:
```bash
1. Abra Supabase Dashboard → SQL Editor
2. Copie TODO o conteúdo de: EXECUTAR_PRIMEIRO_adicionar_colunas_graduacao.sql
3. Cole no SQL Editor
4. Clique em "Run" (ou Ctrl+Enter / Cmd+Enter)
5. Aguarde mensagem: "✅ Colunas de graduação adicionadas com sucesso!"
```

---

### 📋 PASSO 2: Criar Função de Verificação

**Arquivo**: `src/sql/funcao_verificar_graduados.sql`

**O que faz**:
- ✅ Remove função antiga (se existir)
- ✅ Cria função `check_and_mark_graduated_students()`
- ✅ Marca estudantes no 8º semestre ou acima como graduados
- ✅ Muda status para 'GRADUADO'

**Como executar**:
```bash
1. No mesmo SQL Editor do Supabase
2. Copie TODO o conteúdo de: funcao_verificar_graduados.sql
3. Cole no SQL Editor
4. Clique em "Run"
5. Aguarde mensagem: "✅ Função check_and_mark_graduated_students criada!"
```

---

## 🎯 Resumo da Ordem de Execução

```
┌─────────────────────────────────────────────┐
│ 1️⃣ EXECUTAR_PRIMEIRO_adicionar_colunas_    │
│    graduacao.sql                            │
│                                             │
│    Adiciona colunas necessárias             │
│    ✅ is_graduated                          │
│    ✅ graduation_date                       │
│    ✅ status permite 'GRADUADO'             │
└─────────────────────────────────────────────┘
                    ⬇️
┌─────────────────────────────────────────────┐
│ 2️⃣ funcao_verificar_graduados.sql          │
│                                             │
│    Cria função SQL                          │
│    ✅ check_and_mark_graduated_students()   │
└─────────────────────────────────────────────┘
```

---

## 🧪 Testando Após Execução

### 1. Verificar se as colunas foram criadas:

```sql
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns
WHERE table_name = 'students'
  AND column_name IN ('is_graduated', 'graduation_date', 'registration_year')
ORDER BY column_name;
```

**Resultado esperado**:
```
column_name          | data_type
---------------------|------------------
graduation_date      | timestamp with time zone
is_graduated         | boolean
registration_year    | integer
```

### 2. Verificar se o constraint foi atualizado:

```sql
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'students_status_check';
```

**Resultado esperado**:
```
constraint_name        | check_clause
-----------------------|----------------------------------------
students_status_check  | (status IN ('ATIVO', 'INATIVO', ...
                       |  'TREINAMENTO', 'SUSPENSO', 'GRADUADO'))
```

### 3. Testar a função:

```sql
SELECT * FROM check_and_mark_graduated_students();
```

**Resultado esperado**:
- Se houver estudantes no 8º semestre: retorna lista com estudantes marcados
- Se não houver: retorna vazio (sem erros)

### 4. Verificar estudantes prontos para graduar:

```sql
SELECT 
    name,
    course,
    semester,
    CAST(REGEXP_REPLACE(semester, '[^0-9]', '', 'g') AS INTEGER) as semester_number,
    status,
    is_graduated
FROM students
WHERE status = 'ATIVO'
ORDER BY semester_number DESC;
```

---

## 🖥️ Testando no Sistema Web

Após executar os 2 scripts SQL:

1. **Login como Coordenador**
2. Vá para **Dashboard → Estudantes**
3. Clique em **"🎓 Verificar Graduados"**

**Console Logs Esperados**:
```
🎓 Verificando estudantes graduados...
📡 Status da resposta: 200
📥 Resposta da API: { processed: 5, marked: 2 }
✅ 5 estudantes processados, 2 marcados como graduados
```

**Resultado Visual**:
- Alerta: "5 estudantes processados. 2 marcados como graduados!"
- Lista atualizada mostrando estudantes com status "GRADUADO"

---

## ⚠️ Troubleshooting

### Se ainda der erro no Script 1:

**Erro**: `constraint "students_status_check" of relation "students" does not exist`

**Solução**: Isso é normal se o constraint tiver outro nome. Execute:

```sql
-- Descobrir o nome real do constraint
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'students' AND constraint_type = 'CHECK';

-- Depois remova com o nome correto
ALTER TABLE students DROP CONSTRAINT nome_real_do_constraint;
```

### Se ainda der erro no Script 2:

**Erro**: `column "is_graduated" does not exist`

**Causa**: O Script 1 não foi executado ou falhou.

**Solução**: Execute novamente o Script 1 e verifique se as colunas foram criadas.

---

## 📝 Checklist Final

Antes de testar no sistema, confirme:

- [ ] ✅ Script 1 executado sem erros
- [ ] ✅ Coluna `is_graduated` existe na tabela `students`
- [ ] ✅ Coluna `graduation_date` existe na tabela `students`
- [ ] ✅ Constraint de `status` permite valor 'GRADUADO'
- [ ] ✅ Script 2 executado sem erros
- [ ] ✅ Função `check_and_mark_graduated_students()` criada
- [ ] ✅ Teste manual da função retorna resultado (com ou sem estudantes)

---

## 🚀 Próximos Passos Após Sucesso

Depois que tudo funcionar:

1. ✅ Testar "Verificar Graduados" no sistema
2. ✅ Testar "Remover Estudante" (já corrigido anteriormente)
3. ✅ Testar "Treinamentos" (já corrigido anteriormente)
4. ✅ Verificar dashboard com dados reais
5. ✅ Criar estudante de teste no 8º semestre para validar

---

## 📚 Documentação Adicional

- `doc/CORRECAO_FINAL_SQL_GRADUADOS.md` - Explicação detalhada do problema original
- `doc/CORRECOES_PAINEL_ESTUDANTES.md` - Todas as correções do painel

---

**Última atualização**: 26/10/2025
**Status**: Pronto para execução ✅
