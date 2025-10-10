# Configuração das Estatísticas da Home

Este guia explica como configurar os dados que aparecem na página inicial do sistema NAF.

## Problema Resolvido

A página inicial (`/`) agora busca **dados reais do banco de dados Supabase**, incluindo:

1. **Orientações Fiscais Concluídas** - Total de `fiscal_appointments` com status `CONCLUIDO`
2. **Coordenadores Ativos** - Total de usuários com role `COORDINATOR` e `is_active = true`
3. **Serviços Disponíveis** - Total de serviços na tabela `services` com `isActive = true`

## O Que Foi Alterado

### Arquivo: `src/app/api/stats/route.ts`

**ANTES:**
- Tinha valores mínimos artificiais (150 atendimentos, 21 serviços, 3 coordenadores)
- Buscava de tabela `naf_services` que não existe

**DEPOIS:**
- Retorna **dados reais** do banco sem valores mínimos forçados
- Busca da tabela correta `services` com campo `isActive`

### Arquivo: `src/app/page.tsx`

- Já estava configurado para buscar de `/api/stats`
- Mostra os dados automaticamente quando a API retorna

## Como Popular os Dados

### 1. Serviços NAF (services)

Execute este SQL no **Supabase SQL Editor**:

```sql
-- Popular serviços NAF caso a tabela esteja vazia
INSERT INTO services (id, name, description, category, theme, "isActive", "createdAt", "updatedAt")
VALUES
  ('srv-001', 'Declaração de Imposto de Renda PF', 'Auxílio no preenchimento e envio da declaração de IRPF', 'Tributação', 'Imposto de Renda', true, NOW(), NOW()),
  ('srv-002', 'Abertura de MEI', 'Orientação completa para abertura de MEI', 'Empresarial', 'MEI', true, NOW(), NOW()),
  ('srv-003', 'Emissão de Nota Fiscal', 'Auxílio na emissão e gestão de notas fiscais', 'Tributação', 'Notas Fiscais', true, NOW(), NOW()),
  ('srv-004', 'Regularização de Débitos', 'Orientação para regularização de débitos fiscais', 'Tributação', 'Regularização', true, NOW(), NOW()),
  ('srv-005', 'Consultoria Contábil Básica', 'Consultas sobre contabilidade básica', 'Contabilidade', 'Consultoria', true, NOW(), NOW()),
  ('srv-006', 'Orientação Previdenciária', 'Esclarecimentos sobre INSS e benefícios', 'Previdência', 'INSS', true, NOW(), NOW()),
  ('srv-007', 'Planejamento Tributário', 'Análise e planejamento tributário para MEI/ME', 'Tributação', 'Planejamento', true, NOW(), NOW()),
  ('srv-008', 'Livro Caixa', 'Orientação sobre controle financeiro e livro caixa', 'Contabilidade', 'Gestão Financeira', true, NOW(), NOW()),
  ('srv-009', 'Cadastro no CNPJ', 'Auxílio para obtenção de CNPJ', 'Empresarial', 'Cadastros', true, NOW(), NOW()),
  ('srv-010', 'Parcelamento de Impostos', 'Orientação sobre parcelamento de débitos tributários', 'Tributação', 'Parcelamento', true, NOW(), NOW()),
  ('srv-011', 'Simples Nacional', 'Orientação sobre enquadramento no Simples Nacional', 'Tributação', 'Simples Nacional', true, NOW(), NOW()),
  ('srv-012', 'Escrituração Fiscal', 'Auxílio com escrituração fiscal digital', 'Contabilidade', 'Escrituração', true, NOW(), NOW()),
  ('srv-013', 'Certidões Negativas', 'Orientação para emissão de certidões negativas', 'Cadastros', 'Certidões', true, NOW(), NOW()),
  ('srv-014', 'Desenquadramento do MEI', 'Orientação sobre o processo de desenquadramento', 'Empresarial', 'MEI', true, NOW(), NOW()),
  ('srv-015', 'DARF e GPS', 'Auxílio no preenchimento de DARF e GPS', 'Tributação', 'Guias', true, NOW(), NOW()),
  ('srv-016', 'DASN-SIMEI', 'Auxílio na declaração anual do MEI', 'Tributação', 'MEI', true, NOW(), NOW()),
  ('srv-017', 'EFD-Reinf', 'Orientação sobre escrituração fiscal digital de retenções', 'Contabilidade', 'Obrigações Acessórias', true, NOW(), NOW()),
  ('srv-018', 'eSocial', 'Orientação sobre o sistema eSocial', 'Trabalhista', 'eSocial', true, NOW(), NOW()),
  ('srv-019', 'Alvará e Licenças', 'Orientação para obtenção de alvarás', 'Empresarial', 'Licenças', true, NOW(), NOW()),
  ('srv-020', 'Encerramento de Empresa', 'Orientação sobre baixa de empresas', 'Empresarial', 'Encerramento', true, NOW(), NOW()),
  ('srv-021', 'Orientação Trabalhista', 'Esclarecimentos sobre legislação trabalhista', 'Trabalhista', 'CLT', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### 2. Coordenadores Ativos

Para ter coordenadores ativos, você precisa cadastrar usuários com o papel correto:

```sql
-- Exemplo: atualizar usuário existente para coordenador
UPDATE users
SET role = 'COORDINATOR', is_active = true
WHERE email = 'seu-coordenador@email.com';

-- OU inserir novo coordenador
INSERT INTO users (id, email, name, role, is_active, "createdAt", "updatedAt")
VALUES
  ('coord-001', 'coordenador@estacio.br', 'João Silva', 'COORDINATOR', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### 3. Orientações Fiscais Concluídas

Esse dado virá automaticamente dos atendimentos fiscais realizados:

```sql
-- Verificar quantos existem atualmente
SELECT COUNT(*) as total_concluidos
FROM fiscal_appointments
WHERE status = 'CONCLUIDO';
```

## Verificar se Está Funcionando

### 1. Testar a API diretamente

Abra no navegador ou use curl:

```bash
curl http://localhost:4000/api/stats
```

Você deve ver algo como:

```json
{
  "success": true,
  "data": {
    "totalAttendances": 15,
    "userSatisfaction": 95,
    "availableServices": 21,
    "onlineSupport": "24h",
    "activeCoordinators": 3,
    "sslEnabled": true,
    "fiscalCompleted": 8
  },
  "metadata": {
    "lastUpdated": "2025-10-10T...",
    "dataSource": "Supabase - Dados Reais",
    "breakdown": {
      "attendancesCompleted": 7,
      "fiscalAppointmentsCompleted": 8,
      "allFiscalAppointments": 8,
      "totalServicesCombined": 15,
      "nafServicesActive": 21,
      "coordinatorsActive": 3,
      "sslEnabled": true,
      "satisfactionBasedOnRatings": 5
    }
  }
}
```

### 2. Verificar na Página Inicial

1. Acesse: `http://localhost:4000/` (ou sua URL de produção)
2. Role para a seção de estatísticas (logo abaixo do hero)
3. Verifique se os números estão corretos:
   - **Orientações Fiscais Concluídas**: deve mostrar o total da tabela `fiscal_appointments` com status CONCLUIDO
   - **Coordenadores Ativos**: deve mostrar total de coordenadores ativos
   - **Serviços Disponíveis**: deve mostrar 21 (ou o número real de serviços ativos)

### 3. Verificar Console do Navegador

Abra as DevTools (F12) e veja se há erros de fetch ou se os dados estão sendo carregados.

### 4. Verificar Logs do Servidor

Os logs devem mostrar:

```
🏠 Home Stats API - Iniciando busca de dados públicos
📊 Atendimentos concluídos encontrados: 7
📋 Orientações fiscais concluídas: 8
📋 Total de agendamentos fiscais na base: 8
🛠️ Serviços NAF disponíveis: 21
👥 Coordenadores ativos: 3
⭐ Satisfação calculada: 95% (baseada em 5 avaliações)
✅ Home Stats API - Estatísticas finais: {...}
```

## Estrutura das Tabelas

### services
```sql
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  theme TEXT,
  requirements TEXT,
  "estimatedDuration" INTEGER,
  "estimatedTime" INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### users (coordenadores)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'COORDINATOR', 'STUDENT', 'ADMIN'
  is_active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### fiscal_appointments
```sql
CREATE TABLE fiscal_appointments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service_description TEXT,
  status TEXT NOT NULL, -- 'AGENDADO', 'CONCLUIDO', 'CANCELADO'
  appointment_date TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Problema: Todos os números aparecem como 0

**Causa**: As tabelas estão vazias no banco de dados

**Solução**:
1. Execute os scripts SQL acima para popular os dados
2. Verifique se está conectado ao banco correto do Supabase

### Problema: Erro "relation 'naf_services' does not exist"

**Causa**: Código antigo tentando buscar de tabela inexistente

**Solução**: Já foi corrigido no arquivo `src/app/api/stats/route.ts` para usar a tabela `services`

### Problema: Número de serviços sempre mostra 21

**Causa**: Estava usando valor de fallback

**Solução**: Já foi corrigido para mostrar o número real da tabela `services`

### Problema: API retorna erro 500

**Causa**: Conexão com Supabase ou variáveis de ambiente incorretas

**Solução**:
1. Verifique o arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
   ```
2. Reinicie o servidor: `npm run dev`

## Manutenção

### Como adicionar novos serviços

```sql
INSERT INTO services (id, name, description, category, theme, "isActive")
VALUES ('srv-022', 'Nome do Serviço', 'Descrição', 'Categoria', 'Tema', true);
```

### Como ativar/desativar serviços

```sql
-- Desativar
UPDATE services SET "isActive" = false WHERE id = 'srv-001';

-- Ativar
UPDATE services SET "isActive" = true WHERE id = 'srv-001';
```

### Como adicionar coordenadores

```sql
INSERT INTO users (id, email, name, role, is_active)
VALUES ('coord-002', 'novo.coord@estacio.br', 'Maria Santos', 'COORDINATOR', true);
```

## Resumo das Alterações

✅ **Corrigido**: API agora busca dados reais do Supabase
✅ **Corrigido**: Tabela correta `services` ao invés de `naf_services`
✅ **Removido**: Valores mínimos artificiais
✅ **Adicionado**: Logs detalhados para debugging
✅ **Documentado**: Como popular e manter os dados

Agora a home page mostra **dados 100% reais** do seu banco de dados!
