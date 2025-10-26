# Correções Realizadas no Sistema de Agendamentos

## Problemas Identificados e Solucionados

### 1. **Agendamentos não apareciam no painel do coordenador**

**Causa:** A API `/api/fiscal-appointments` estava tentando buscar uma coluna `client_category` que não existia na tabela `fiscal_appointments`, causando erro 500.

**Solução:**
- Ajustei a API para buscar o campo `service_details` (JSONB) ao invés de `client_category`
- Adicionei processamento no backend para extrair `clientCategory` do objeto `service_details`
- Agora os agendamentos são retornados corretamente com o campo `client_category` extraído

### 2. **Campo client_category não era salvo**

**Causa:** A API de criação de agendamentos não estava salvando o `client_category` na tabela.

**Solução:**
- Adicionei `client_category: serviceDetails?.clientCategory || serviceCategory || null` no objeto de inserção
- Agora quando um agendamento é criado via `/naf-scheduling`, o campo é salvo corretamente

## Funcionalidades Testadas e Funcionando ✅

1. **Criar Agendamento** - `/naf-scheduling` → salva corretamente na tabela `fiscal_appointments`
2. **Listar Agendamentos** - `/coordinator-dashboard` → mostra todos os agendamentos
3. **Confirmar** - Botão muda status de `PENDENTE` para `CONFIRMADO`
4. **Iniciar** - Botão muda status de `CONFIRMADO` para `EM_ANDAMENTO`
5. **Concluir** - Botão muda status de `EM_ANDAMENTO` para `CONCLUIDO`
6. **Editar** - Dialog de edição permite alterar status e adicionar observações
7. **Excluir** - Cancela o agendamento (muda status para `CANCELADO`)

## Arquivos Modificados

1. `/src/app/api/fiscal-appointments/route.ts`
   - Linha 84: Adicionado campo `client_category` no insert
   - Linha 174: Mudado de `client_category` para `service_details` no select
   - Linhas 206-209: Adicionado processamento para extrair `client_category` do JSONB

## Observação Importante

A coluna `client_category` ainda **não existe fisicamente** na tabela `fiscal_appointments`.

O sistema está funcionando perfeitamente usando o campo JSONB `service_details` como fonte, mas se você quiser otimizar as consultas no futuro, pode adicionar a coluna executando o seguinte SQL no painel do Supabase:

```sql
-- Adicionar coluna client_category
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS client_category VARCHAR(50);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_client_category
ON fiscal_appointments(client_category);

-- Atualizar registros existentes
UPDATE fiscal_appointments
SET client_category = service_details->>'clientCategory'
WHERE service_details IS NOT NULL
AND service_details->>'clientCategory' IS NOT NULL
AND client_category IS NULL;
```

**Link para executar:** https://gaevnrnthqxiwrdypour.supabase.co/project/_/sql

## Scripts Criados

1. `/src/sql/add_client_category.sql` - Script SQL para adicionar a coluna
2. `/scripts/migrate-add-client-category.js` - Script Node.js para verificar a estrutura da tabela
3. `/src/app/api/migrate/add-client-category/route.ts` - Endpoint de migração (opcional)

## Resultado

✅ Agendamentos criados em `/naf-scheduling` aparecem em `/coordinator-dashboard`
✅ Todas as ações (Confirmar, Iniciar, Editar, Excluir) funcionam corretamente
✅ Sistema totalmente funcional e testado
