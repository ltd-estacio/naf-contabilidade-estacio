# Correções nas Métricas do Dashboard do Coordenador

## Problema Identificado

As métricas principais do painel do coordenador (`/coordinator-dashboard`) estavam mostrando valores zerados ou incorretos:

- **Atendimentos Mensais**: Mostrava 0 (não incluía agendamentos fiscais)
- **Taxa de Conclusão**: 0% (baseado apenas na tabela `attendances`)
- **Pendentes**: Valor correto (buscava da tabela `fiscal_appointments`)
- **Estudantes Ativos**: Valor correto (buscava da tabela `students`)

## Causa

A API `/api/coordinator/simple-dashboard` estava calculando as métricas **apenas** com base na tabela `attendances`, ignorando os agendamentos da tabela `fiscal_appointments` que são criados via `/naf-scheduling`.

## Solução Implementada

### Arquivo Modificado:
- `/src/app/api/coordinator/simple-dashboard/route.ts`

### Alterações Realizadas:

1. **Busca antecipada dos agendamentos fiscais** (linha 28-39)
   - Movido o fetch de `fiscal_appointments` para ANTES do cálculo das métricas
   - Isso permite incluir esses dados nas métricas principais

2. **Cálculo corrigido de "Atendimentos Mensais"** (linha 42)
   ```typescript
   const totalAtendimentos = (allAttendances?.length || 0) + (fiscalAppointments?.length || 0)
   ```
   - Agora soma atendimentos da tabela `attendances` + agendamentos da tabela `fiscal_appointments`

3. **Cálculo corrigido de "Taxa de Conclusão"** (linhas 44-48)
   ```typescript
   const completedAttendances = allAttendances?.filter(a => a.status === 'CONCLUIDO') || []
   const completedFiscalAppointments = fiscalAppointments?.filter(a => a.status === 'CONCLUIDO') || []
   const totalCompleted = completedAttendances.length + completedFiscalAppointments.length
   const taxaConclusao = totalAtendimentos > 0 ? (totalCompleted / totalAtendimentos) * 100 : 0
   ```
   - Agora conta atendimentos concluídos de AMBAS as tabelas

4. **Logs melhorados** (linhas 61-69)
   ```typescript
   console.log('📈 Métricas calculadas:', {
     totalAtendimentos,
     totalCompleted,
     taxaConclusao,
     tempoMedio,
     satisfacaoMedia,
     attendances: allAttendances?.length || 0,
     fiscalAppointments: fiscalAppointments?.length || 0
   })
   ```
   - Adicionado log detalhado para facilitar debug

## Resultado Antes x Depois

### Antes:
```json
{
  "mainMetrics": {
    "atendimentosMensais": 0,
    "taxaConclusao": 0,
    "tempoMedio": 60,
    "satisfacao": 0,
    "pendentes": 2,
    "urgentes": 0,
    "estudantesAtivos": 13
  }
}
```

### Depois:
```json
{
  "mainMetrics": {
    "atendimentosMensais": 5,      // ✅ Agora inclui fiscal_appointments
    "taxaConclusao": 20,            // ✅ Calculado com todos os dados (1 de 5 concluído)
    "tempoMedio": 60,               // ✅ Mantém cálculo correto
    "satisfacao": 0,                // ✅ Correto (sem ratings ainda)
    "pendentes": 2,                 // ✅ Mantém valor correto
    "urgentes": 0,                  // ✅ Mantém valor correto
    "estudantesAtivos": 13          // ✅ Mantém valor correto
  }
}
```

## Logs do Servidor (Confirmação)

```
🚀 Dashboard API - Iniciando busca de dados reais do Supabase
📊 Encontrados 0 atendimentos
📊 Encontrados 5 agendamentos fiscais
📈 Métricas calculadas: {
  totalAtendimentos: 5,
  totalCompleted: 1,
  taxaConclusao: 20,
  tempoMedio: 60,
  satisfacaoMedia: 0,
  attendances: 0,
  fiscalAppointments: 5
}
✅ Dashboard API - Dados processados com sucesso
GET /api/coordinator/simple-dashboard 200 in 2520ms
```

## Métricas Agora com Dados Reais ✅

Todas as métricas principais do dashboard agora mostram dados reais do banco de dados:

1. ✅ **Atendimentos Mensais**: Soma de `attendances` + `fiscal_appointments` dos últimos 30 dias
2. ✅ **Taxa de Conclusão**: Percentual de atendimentos concluídos de ambas as tabelas
3. ✅ **Tempo Médio**: Média de duração dos atendimentos concluídos
4. ✅ **Satisfação**: Média de avaliações dos clientes
5. ✅ **Pendentes**: Agendamentos fiscais com status PENDENTE
6. ✅ **Urgentes**: Agendamentos fiscais com urgência URGENTE
7. ✅ **Estudantes Ativos**: Estudantes com status ATIVO

## Como Testar

1. Acesse `/naf-scheduling` e crie um novo agendamento
2. Acesse `/coordinator-dashboard`
3. Verifique que o número de "Atendimentos Mensais" aumentou
4. Altere o status de um agendamento para "CONCLUIDO"
5. Recarregue o dashboard e veja a "Taxa de Conclusão" aumentar

## Observação

A integração entre as tabelas `attendances` e `fiscal_appointments` está funcionando perfeitamente. Todos os agendamentos criados via `/naf-scheduling` agora são contabilizados nas métricas do painel do coordenador.
