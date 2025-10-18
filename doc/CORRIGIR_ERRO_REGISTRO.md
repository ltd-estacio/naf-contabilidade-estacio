# 🔧 Corrigir Erro de Registro de Estudante

## ❌ Erro Identificado

```
Could not find the 'registration_semester' column of 'students' in the schema cache
```

**Causa:** A tabela `students` não possui as colunas necessárias.

---

## ✅ Solução Imediata

### **Passo 1: Abrir Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)

### **Passo 2: Executar Script de Correção**

Copie e cole este script no SQL Editor:

```sql
-- Adicionar colunas faltantes
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS registration_year INTEGER;

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS registration_semester INTEGER;

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'Universidade Estácio de Sá';

-- Atualizar registros existentes
UPDATE public.students 
SET 
  registration_year = COALESCE(registration_year, EXTRACT(YEAR FROM created_at)::INTEGER),
  registration_semester = COALESCE(registration_semester, 
    CASE 
      WHEN EXTRACT(MONTH FROM created_at) <= 6 THEN 1 
      ELSE 2 
    END),
  university = COALESCE(university, 'Universidade Estácio de Sá')
WHERE registration_year IS NULL 
   OR registration_semester IS NULL 
   OR university IS NULL;
```

### **Passo 3: Clicar em RUN**

Você deve ver:
```
Success. No rows returned
```

### **Passo 4: Verificar**

Execute para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'students' 
  AND column_name IN ('registration_year', 'registration_semester', 'university');
```

Resultado esperado:
```
column_name          | data_type
---------------------|----------
registration_year    | integer
registration_semester| integer
university          | text
```

### **Passo 5: Testar Novamente**

```bash
node test-student-register.js
```

Agora deve funcionar! ✅

---

## 🎯 Arquivo Criado

O script SQL completo está em:
```
src/sql/fix_students_table.sql
```

**Execute esse arquivo no Supabase SQL Editor!**

---

## ✅ Após Executar

1. As colunas serão criadas
2. Registros antigos serão atualizados
3. Novos cadastros funcionarão corretamente

**Execute o script AGORA no Supabase!** 🚀
