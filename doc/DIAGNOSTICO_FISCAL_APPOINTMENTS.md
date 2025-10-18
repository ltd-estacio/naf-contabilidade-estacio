# 🔍 Diagnóstico - Próximos Atendimentos Fiscais Não Aparecem

## 📋 Problema Relatado

Na seção "Próximos Atendimentos Fiscais" do dashboard do estudante, nenhum atendimento está sendo exibido, embora existam atendimentos fiscais na aba "Atendimentos Fiscais".

## 🔧 Alterações Feitas para Diagnóstico

### 1. Adicionados logs de debug no componente

**Arquivo:** `/src/app/student-portal/page.tsx`

**Linha 322-327:** Log dos dados recebidos da API
```typescript
console.log('📊 Dados do dashboard recebidos:', {
  hasFiscalAppointments: !!data.fiscalAppointments,
  fiscalAppointmentsCount: data.fiscalAppointments?.length || 0,
  fiscalAppointments: data.fiscalAppointments
})
```

**Linhas 1172-1180:** Log da renderização
```typescript
{(() => {
  console.log('🔍 Renderizando seção fiscalAppointments:', {
    hasDashboardData: !!dashboardData,
    hasFiscalAppointments: !!dashboardData?.fiscalAppointments,
    fiscalAppointmentsLength: dashboardData?.fiscalAppointments?.length || 0,
    fiscalAppointments: dashboardData?.fiscalAppointments
  })
  return null
})()}
```

## 🧪 Como Diagnosticar

### 1. Recarregar o Painel do Estudante

1. Acesse: `http://localhost:4000/student-portal`
2. Abra o Console do Navegador (F12 → Console)
3. Recarregue a página (Cmd+R ou F5)

### 2. Verificar Logs no Console

Procure por estes logs:

#### a) Log da API
```
📊 Dados do dashboard recebidos: {
  hasFiscalAppointments: true/false,
  fiscalAppointmentsCount: X,
  fiscalAppointments: [...]
}
```

#### b) Log da Renderização
```
🔍 Renderizando seção fiscalAppointments: {
  hasDashboardData: true/false,
  hasFiscalAppointments: true/false,
  fiscalAppointmentsLength: X,
  fiscalAppointments: [...]
}
```

### 3. Possíveis Cenários

#### Cenário 1: `fiscalAppointmentsCount: 0`
**Causa:** A API não está retornando atendimentos fiscais
**Solução:** Verificar se o estudante tem atendimentos fiscais atribuídos no banco

#### Cenário 2: `fiscalAppointmentsCount > 0` mas lista vazia na renderização
**Causa:** Estado do React não está sendo atualizado
**Solução:** Problema de sincronização de estado

#### Cenário 3: Array tem dados mas não aparecem na tela
**Causa:** Filtro está removendo todos os atendimentos
**Solução:** Verificar status dos atendimentos

## 🔍 Verificação no Banco de Dados

Execute esta query no Supabase SQL Editor para verificar se há atendimentos fiscais:

```sql
-- Verificar atendimentos fiscais do estudante logado
SELECT
  fa.id,
  fa.protocol,
  fa.status,
  fa.client_name,
  fa.service_title,
  fa.service_type,
  fa.urgency_level,
  fa.preferred_date,
  fa.preferred_time,
  fa.created_at,
  s.name as student_name,
  s.email as student_email
FROM fiscal_appointments fa
INNER JOIN students s ON s.id = fa.assigned_student_id
WHERE s.email = 'EMAIL_DO_ESTUDANTE_AQUI'
ORDER BY fa.created_at DESC;
```

**Substituir:** `EMAIL_DO_ESTUDANTE_AQUI` pelo email do estudante logado

### Verificar Status dos Atendimentos

```sql
-- Contar atendimentos por status
SELECT
  status,
  COUNT(*) as total
FROM fiscal_appointments
WHERE assigned_student_id = (
  SELECT id FROM students WHERE email = 'EMAIL_DO_ESTUDANTE_AQUI'
)
GROUP BY status;
```

## 📊 Filtro Atual da Seção

A seção "Próximos Atendimentos Fiscais" **SOMENTE mostra atendimentos com estes status:**

- ✅ `PENDENTE` - Aguardando confirmação do estudante
- ✅ `CONFIRMADO` - Confirmado pelo estudante, aguardando início
- ✅ `EM_ANDAMENTO` - Atendimento em andamento

**NÃO MOSTRA:**
- ❌ `CONCLUIDO` - Atendimento finalizado
- ❌ `CANCELADO` - Atendimento cancelado
- ❌ `NAO_COMPARECEU` - Cliente não compareceu

## 🐛 Possíveis Problemas

### 1. Estudante sem atendimentos fiscais
**Sintoma:** `fiscalAppointmentsCount: 0`
**Verificar:** Query SQL acima retorna resultados?
**Solução:** Atribuir atendimentos fiscais ao estudante no painel do coordenador

### 2. Todos atendimentos estão CONCLUIDO
**Sintoma:** `fiscalAppointmentsCount > 0` mas filtro remove todos
**Verificar:** Query SQL mostra apenas status `CONCLUIDO`?
**Solução:** Criar novos atendimentos ou mudar status de alguns para `PENDENTE`

### 3. API não está buscando fiscal_appointments
**Sintoma:** Log mostra `hasFiscalAppointments: false`
**Verificar:** Log do servidor mostra `✅ Encontrados X atendimentos fiscais`?
**Solução:** Problema na API `/api/students/dashboard-unified`

### 4. Campo assigned_student_id incorreto
**Sintoma:** API busca mas não retorna nada
**Verificar:** Query SQL com o email do estudante retorna dados?
**Solução:** Atribuir o estudante correto aos atendimentos

## 📁 Arquivos Relevantes

1. **`/src/app/student-portal/page.tsx`** (Linhas 1162-1241)
   - Renderização da seção "Próximos Atendimentos Fiscais"
   - Filtro por status: `['CONFIRMADO', 'EM_ANDAMENTO', 'PENDENTE']`
   - Limite de 3 atendimentos: `.slice(0, 3)`

2. **`/src/app/api/students/dashboard-unified/route.ts`** (Linhas 312-316)
   - Busca atendimentos fiscais do banco
   - Query: `.eq('assigned_student_id', studentId)`
   - Ordenação: `.order('created_at', { ascending: false })`

3. **Tabela no Supabase:** `fiscal_appointments`
   - Coluna relevante: `assigned_student_id` (FK para `students.id`)
   - Coluna de filtro: `status`

## 🎯 Próximos Passos

1. ✅ **Recarregue a página** do painel do estudante
2. ✅ **Abra o Console do Navegador** (F12)
3. ✅ **Copie os logs** que aparecem (`📊` e `🔍`)
4. ✅ **Execute a query SQL** no Supabase
5. ✅ **Compartilhe os resultados** para diagnóstico preciso

## 📞 Informações Necessárias

Para resolver o problema, preciso saber:

1. **Logs do Console do Navegador:**
   - O que aparece em `📊 Dados do dashboard recebidos:`?
   - O que aparece em `🔍 Renderizando seção fiscalAppointments:`?

2. **Resultado da Query SQL:**
   - Quantos atendimentos fiscais o estudante tem?
   - Quais são os status desses atendimentos?

3. **Email do Estudante Logado:**
   - Qual email está sendo usado para login?

---

**Data:** 2025-10-11
**Status:** Aguardando diagnóstico
**Logs adicionados:** ✅
**Próxima ação:** Recarregar página e coletar logs
