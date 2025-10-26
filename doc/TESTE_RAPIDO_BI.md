# Guia de Teste Rápido - Business Intelligence

## Problema Atual

A aba "Geral" está mostrando dados zerados porque não há atendimentos no banco de dados.

## Solução Rápida - 2 Opções

### Opção 1: Adicionar Dados de Teste (Recomendado)

1. **Abra o Supabase SQL Editor:**
   ```
   https://app.supabase.com → Seu Projeto → SQL Editor
   ```

2. **Busque IDs dos Estudantes:**
   ```sql
   SELECT id, name, email FROM students WHERE status = 'ATIVO' LIMIT 5;
   ```

3. **Copie os IDs** e abra: `scripts/seed-attendances.sql`

4. **Substitua os Placeholders:**
   ```sql
   -- ANTES
   ('STUDENT_ID_1', ...)

   -- DEPOIS (com ID real)
   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', ...)
   ```

5. **Execute o Script no Supabase SQL Editor**

6. **Recarregue a Página do Dashboard**

### Opção 2: Alterar Período (Solução Temporária)

1. **No Dashboard**, vá para: Business Intelligence → Aba "Geral"

2. **Altere o período** no dropdown:
   - De "30 dias" → Para "Todos"

3. **Clique em "Atualizar"**

## Como Verificar se Funcionou

### 1. Verifique os Logs no Console (F12)

Após carregar a aba "Geral", você deve ver:

```
🔄 Loading general report data...
📊 Data fetched - Attendances: 13, Students: 1, Services: 22, Fiscal: 0
⭐ Satisfação: 10 avaliações, média 4.30
✅ general report loaded successfully
📊 Data for general: {generalStats: {...}}
📈 General Stats: {totalAttendances: 13, totalStudents: 1, ...}
🔍 Rendering General Report
   data.general: {generalStats: {...}}
   generalStats: {totalAttendances: 13, ...}
```

### 2. Verifique a Interface

**ANTES (dados zerados):**
```
Atendimentos: 0
Taxa Conclusão: 0.0%
Satisfação: 0.0
Crescimento: 0.0%
Estudantes: 1 estudante ativo
Serviços: 22 serviços disponíveis
Duração Média: 0 min
```

**DEPOIS (com dados reais):**
```
Atendimentos: 13
Taxa Conclusão: 76.9%
Satisfação: 4.3
Crescimento: 12.5%
Estudantes: 1 estudante ativo ✓ Cadastrados no sistema
Serviços: 22 serviços disponíveis ✓ Disponíveis para solicitação
Duração Média: 48 min
```

## Troubleshooting

### Problema: Console mostra "Attendances: 0"

**Causa:** Não há dados na tabela `attendances`

**Solução:**
```sql
-- Verificar se há atendimentos:
SELECT COUNT(*) FROM attendances;

-- Se retornar 0, execute o script de seed
```

### Problema: Console mostra erro 500

**Causa:** Credenciais do Supabase inválidas

**Solução:**
Verifique `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### Problema: Dados ainda zerados após seed

**Causa:** IDs dos estudantes no script não correspondem aos IDs reais

**Solução:**
1. Busque IDs reais:
   ```sql
   SELECT id, name FROM students WHERE status = 'ATIVO';
   ```

2. Atualize TODOS os `STUDENT_ID_1`, `STUDENT_ID_2`, etc. no script

3. Execute novamente

### Problema: "generalStats is undefined"

**Causa:** A API não está retornando dados corretamente

**Solução:**
1. Abra o console (F12)
2. Veja os logs começando com 📊 e 📈
3. Verifique se há erros de SQL
4. Teste a API diretamente:
   ```
   http://localhost:3000/api/coordinator/reports/advanced?type=general&format=json&period=all
   ```

## Estrutura de Dados Esperada

A API retorna:

```json
{
  "success": true,
  "data": {
    "generalStats": {
      "totalAttendances": 13,
      "totalStudents": 1,
      "totalServices": 22,
      "totalFiscalAppointments": 0,
      "completionRate": 76.9,
      "averageSatisfaction": 4.3,
      "averageDuration": 48,
      "monthlyGrowth": 12.5
    },
    "summary": {
      "topServices": [...],
      "topStudents": [...],
      "overallSatisfaction": 4.3
    }
  }
}
```

## Melhorias Aplicadas

### 1. Logs Detalhados

```typescript
console.log(`📊 Data for ${type}:`, result.data)
console.log('📈 General Stats:', result.data.generalStats)
console.log('🔍 Rendering General Report')
```

### 2. Alerta Quando Não Há Dados

Um alerta amarelo aparece quando não há atendimentos:

> ⚠️ Não há atendimentos registrados no período selecionado. Execute o script de seed (`scripts/seed-attendances.sql`) no Supabase para adicionar dados de teste ou altere o período para "Todos".

### 3. Indicadores Visuais

- Cards com `opacity-60` quando sem dados
- Checkmarks verdes quando há dados:
  - ✓ Cadastrados no sistema
  - ✓ Disponíveis para solicitação
- "Aguardando atendimentos" em duração média

### 4. Botão de Recarga

Se os dados não carregarem, um botão aparece:

```
[↻ Carregar Dados]
```

## Próximos Passos

1. **Execute o script de seed**
2. **Recarregue a página**
3. **Verifique os logs no console**
4. **Confira se os dados aparecem**
5. **Teste a aba "Estudantes"** (deve mostrar rankings)

## Teste Completo

Execute cada aba e verifique:

| Aba | Deve Mostrar |
|-----|--------------|
| Geral | Atendimentos, Taxa Conclusão, Satisfação, Estudantes, Serviços, Duração |
| Estudantes | Ranking com estrelas ⭐, Estudantes Ativos > 0 |
| Power BI | Contadores de dados para exportação |

---

**Status:** ✅ Pronto para testes
**Última atualização:** 09/10/2025, 22:00
