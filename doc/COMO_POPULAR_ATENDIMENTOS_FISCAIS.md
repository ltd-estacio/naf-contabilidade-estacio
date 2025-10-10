# 🔧 Como Popular Atendimentos Fiscais para o Estudante

## 📋 Problema Identificado

A aba **"Atendimentos Fiscais"** no Painel do Estudante está mostrando **0 atendimentos** porque:

1. ✅ **A API está funcionando corretamente** (`/api/students/fiscal-appointments`)
2. ✅ **O componente está integrado** (`StudentFiscalAppointments`)
3. ❌ **Não existem atendimentos com `assigned_student_id`** na tabela `fiscal_appointments`

## 🎯 Solução

Você precisa **popular a tabela** com dados atribuídos ao estudante logado. Existem **duas opções**:

---

## 📝 OPÇÃO 1: Criar Novos Atendimentos de Teste

### Passo 1: Obter o ID do Estudante

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Execute:

```sql
SELECT id, name, email FROM public.students LIMIT 10;
```

3. **Copie o ID** do estudante que você quer usar (exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Passo 2: Inserir Dados de Teste

1. Abra o arquivo: **`src/sql/insert_test_fiscal_appointments.sql`**
2. **Substitua TODAS as ocorrências** de `'SEU_STUDENT_ID_AQUI'` pelo ID copiado
3. Execute o script completo no **Supabase SQL Editor**
4. Verifique os dados inseridos com a query final do script

**Resultado:** 5 atendimentos de teste serão criados:
- 1 Confirmado (IRPF)
- 1 Pendente (MEI)
- 1 Em Andamento (Consulta Tributária)
- 1 Urgente (Regularização)
- 1 Concluído (Certidão)

---

## 🔄 OPÇÃO 2: Atribuir Atendimentos Existentes

Se já existem atendimentos na tabela `fiscal_appointments` (criados pelo formulário público), você pode atribuí-los ao estudante.

### Passo 1: Obter o ID do Estudante

```sql
SELECT id, name, email FROM public.students LIMIT 10;
```

### Passo 2: Verificar Atendimentos Disponíveis

```sql
SELECT
  id,
  protocol,
  service_title,
  client_name,
  status,
  assigned_student_id
FROM public.fiscal_appointments
WHERE assigned_student_id IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Passo 3: Atribuir ao Estudante

**Opção A: Atribuir TODOS os atendimentos sem estudante**

```sql
UPDATE public.fiscal_appointments
SET
  assigned_student_id = 'SEU_STUDENT_ID_AQUI',
  updated_at = NOW()
WHERE assigned_student_id IS NULL;
```

**Opção B: Atribuir apenas os 5 mais recentes (recomendado)**

```sql
UPDATE public.fiscal_appointments
SET
  assigned_student_id = 'SEU_STUDENT_ID_AQUI',
  updated_at = NOW()
WHERE id IN (
  SELECT id
  FROM public.fiscal_appointments
  WHERE assigned_student_id IS NULL
  ORDER BY created_at DESC
  LIMIT 5
);
```

### Passo 4: Verificar

```sql
SELECT
  protocol,
  service_title,
  client_name,
  status,
  urgency_level
FROM public.fiscal_appointments
WHERE assigned_student_id = 'SEU_STUDENT_ID_AQUI'
ORDER BY created_at DESC;
```

---

## ✅ Verificação Final

Após executar um dos scripts acima:

1. **Recarregue o Painel do Estudante** no navegador (F5)
2. Acesse a aba **"Atendimentos Fiscais"**
3. Você deverá ver:
   - Cards de estatísticas atualizados (Total, Pendentes, Confirmados, etc.)
   - Lista de atendimentos fiscais
   - Botões de ação (Iniciar, Cancelar, Reagendar, Finalizar)

---

## 🎨 Estrutura dos Dados

Cada atendimento fiscal tem:

| Campo | Descrição |
|-------|-----------|
| `protocol` | Protocolo único (ex: FAP-20241008-001) |
| `service_type` | Tipo de serviço (declaracao-irpf, orientacao-mei, etc.) |
| `service_title` | Título descritivo do serviço |
| `service_category` | Categoria (IRPF, MEI, Tributação, etc.) |
| `client_name` | Nome do cliente |
| `client_email` | E-mail do cliente |
| `client_phone` | Telefone do cliente |
| `status` | PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO |
| `urgency_level` | BAIXA, NORMAL, ALTA, URGENTE |
| `assigned_student_id` | **ID do estudante responsável** ⚠️ |

---

## 🚨 Importante

- **Sempre use o ID correto do estudante** ao executar os scripts
- No **ambiente de produção**, os atendimentos são atribuídos pelo **Coordenador** através do painel dele
- Os scripts SQL são apenas para **testes e desenvolvimento**
- Não execute scripts em produção sem backup!

---

## 🔗 Arquivos de Referência

- **Script de inserção:** `src/sql/insert_test_fiscal_appointments.sql`
- **Script de atribuição:** `src/sql/assign_existing_appointments_to_student.sql`
- **API do estudante:** `src/app/api/students/fiscal-appointments/route.ts`
- **Componente:** `src/components/student/StudentFiscalAppointments.tsx`

---

## 📞 Suporte

Se após seguir estes passos os atendimentos ainda não aparecerem:

1. Verifique o **console do navegador** (F12 → Console) para erros
2. Verifique os **logs do servidor** (terminal onde o Next.js está rodando)
3. Confirme que o estudante está **logado corretamente**
4. Verifique se o **token JWT** contém o `studentId` correto

---

**Status:** ✅ Documentação completa e scripts prontos para uso!
