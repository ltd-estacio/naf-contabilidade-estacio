# Tabelas do Banco de Dados Utilizadas no Painel do Coordenador

Este documento detalha todas as tabelas do banco de dados Supabase utilizadas na implementação do painel do coordenador NAF (`/coordinator-dashboard`).

## Visão Geral das Funcionalidades Implementadas

### 📊 Visão Geral
- **Atendimentos por Dia da Semana** - Atendimentos Realizados e Comparativo Detalhado
- **Distribuição do Público-Alvo** - Segmentação visual das categorias atendidas pelo NAF e Estatísticas Detalhadas
- **Alertas e Notificações** - Sistema de alertas baseado em dados reais

### 🛠️ Serviços
- **Performance dos Serviços** - Análise de performance dos serviços NAF

### 👥 Equipe Estudantil
- **Portal Integrado dos Estudantes** - Estatísticas completas dos estudantes

### 📋 Fiscal
- **Serviços Mais Solicitados** - Ranking e análise de demanda (sem percentuais)

---

## Tabelas Utilizadas

### 1. `attendances` (Atendimentos)
**Finalidade**: Tabela principal para rastreamento de atendimentos realizados pelos estudantes NAF.

**Campos utilizados**:
- `id` - Identificador único
- `student_id` - Relacionamento com estudante responsável
- `client_category` - Categoria do cliente atendido
- `client_age` - Idade do cliente
- `client_gender` - Gênero do cliente
- `service_type` - Tipo de serviço prestado
- `status` - Status do atendimento (AGENDADO, CONCLUIDO, CANCELADO, etc.)
- `scheduled_date` - Data agendada
- `duration_minutes` - Duração em minutos
- `client_satisfaction_rating` - Avaliação de satisfação do cliente
- `created_at` - Data de criação

**Usado em**:
- Métricas principais (total de atendimentos, taxa de conclusão, tempo médio, satisfação)
- Atendimentos por dia da semana
- Distribuição do público-alvo por categoria, idade e gênero
- Performance dos serviços
- Estatísticas dos estudantes

### 2. `students` (Estudantes)
**Finalidade**: Dados dos estudantes NAF que prestam atendimentos.

**Campos utilizados**:
- `id` - Identificador único
- `name` - Nome do estudante
- `email` - Email do estudante
- `course` - Curso do estudante
- `semester` - Semestre atual
- `status` - Status (ATIVO, INATIVO)
- `created_at` - Data de cadastro

**Usado em**:
- Portal integrado dos estudantes
- Estatísticas de performance individual
- Alertas de baixa performance
- Contagem de estudantes ativos

### 3. `naf_services` (Serviços NAF)
**Finalidade**: Catálogo dos serviços oferecidos pelo NAF.

**Campos utilizados**:
- `id` - Identificador único
- `service_name` - Nome do serviço
- `status` - Status do serviço (ativo/inativo)
- `priority_order` - Ordem de prioridade

**Usado em**:
- Performance dos serviços
- Catálogo de serviços disponíveis

### 4. `fiscal_appointments` (Agendamentos Fiscais)
**Finalidade**: Agendamentos específicos para serviços fiscais.

**Campos utilizados**:
- `id` - Identificador único
- `protocol` - Protocolo do agendamento
- `client_name` - Nome do cliente
- `client_email` - Email do cliente
- `service_type` - Tipo de serviço fiscal
- `service_title` - Título do serviço
- `status` - Status (PENDENTE, CONFIRMADO, CONCLUIDO)
- `urgency_level` - Nível de urgência (URGENTE, NORMAL)
- `created_at` - Data de criação

**Usado em**:
- Serviços mais solicitados (seção fiscal)
- Agendamentos urgentes (alertas)
- Estatísticas de agendamentos fiscais
- Ranking de serviços por demanda

### 5. `chat_transfer_requests` (Solicitações de Transferência de Chat)
**Finalidade**: Solicitações de transferência de conversas entre estudantes.

**Campos utilizados**:
- `id` - Identificador único
- `status` - Status da transferência (PENDENTE, ACEITA, REJEITADA)
- `created_at` - Data da solicitação

**Usado em**:
- Alertas de transferências pendentes
- Notificações do sistema

### 6. `chat_conversations` (Conversas de Chat)
**Finalidade**: Conversas ativas no sistema de chat.

**Campos utilizados**:
- `id` - Identificador único
- `student_id` - Estudante responsável pela conversa
- `status` - Status da conversa (ATIVO, FINALIZADO)
- `has_unread_messages` - Indica se há mensagens não lidas
- `created_at` - Data de início da conversa

**Usado em**:
- Alertas de mensagens não lidas
- Estatísticas de conversas por estudante
- Portal integrado dos estudantes

### 7. `chat_messages` (Mensagens de Chat)
**Finalidade**: Mensagens individuais dentro das conversas.

**Campos utilizados**:
- `id` - Identificador único
- `conversation_id` - Relacionamento com conversa
- `created_at` - Data da mensagem

**Usado em**:
- Contagem de mensagens não lidas
- Atividade de comunicação

---

## Estatísticas Calculadas

### Métricas Principais
- **Total de Atendimentos Mensais**: COUNT(*) FROM attendances
- **Taxa de Conclusão**: (Atendimentos CONCLUIDO / Total) * 100
- **Tempo Médio**: AVG(duration_minutes) FROM attendances WHERE status = 'CONCLUIDO'
- **Satisfação Média**: AVG(client_satisfaction_rating) FROM attendances

### Análises de Público-Alvo
- **Por Categoria**: GROUP BY client_category
- **Por Faixa Etária**: Agrupamento por intervalos de idade
- **Por Gênero**: GROUP BY client_gender
- **Taxa de Conclusão por Categoria**: Cálculo específico por categoria

### Performance dos Serviços
- **Score de Performance**: Fórmula baseada em satisfação, taxa de conclusão e eficiência
- **Taxa de Eficiência**: Baseada no tempo médio vs. tempo padrão (60 minutos)
- **Ranking de Serviços**: Ordenação por performance_score

### Portal dos Estudantes
- **Produtividade**: Atendimentos por semana de atividade
- **Especialidades**: Top 3 serviços mais atendidos por estudante
- **Taxa de Conclusão Individual**: Por estudante

---

## Implementação de Alertas

O sistema gera alertas automáticos baseados em:

1. **Agendamentos Urgentes**: fiscal_appointments WHERE urgency_level = 'URGENTE'
2. **Transferências Pendentes**: chat_transfer_requests WHERE status = 'PENDENTE'
3. **Mensagens Não Lidas**: chat_conversations WHERE has_unread_messages = true
4. **Estudantes com Baixa Performance**: students com avg_rating < 3.0

---

## Arquivos Relacionados

- **API Route**: `/src/app/api/coordinator/simple-dashboard/route.ts`
- **Frontend**: `/src/app/coordinator-dashboard/page.tsx`
- **Middleware**: `/src/middleware/coordinator-auth.ts`

---

## Próximas Melhorias Sugeridas

1. **Indexação**: Criar índices nas colunas mais consultadas (student_id, created_at, status)
2. **Views Materializadas**: Para consultas complexas de estatísticas
3. **Logs de Auditoria**: Rastreamento de mudanças nos dados
4. **Cache Redis**: Para consultas frequentes de dashboard
5. **Particionamento**: Para tabelas com grande volume de dados

---

*Documento gerado automaticamente em: 2025-09-27*
*Baseado na implementação real do sistema NAF Contábil*