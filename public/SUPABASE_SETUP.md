# 🚀 Configuração do Supabase para Produção

## Status Atual
✅ **Sistema usando Mock em Produção** - Funcional para desenvolvimento e testes
⚠️ **Supabase Real** - Aguardando configuração

## Para configurar o Supabase real:

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização/projeto
3. Anote a URL e as chaves do projeto

### 2. Configurar variáveis de ambiente na Vercel
No painel da Vercel, adicionar as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[chave_anon_real]
SUPABASE_SERVICE_ROLE_KEY=[chave_service_role_real]
```

### 3. Executar esquemas do banco
Execute os seguintes arquivos SQL no Supabase:

```bash
database/student_schema.sql         # Tabelas de estudantes
database/coordinator_schema.sql     # Tabelas de coordenadores
database/chat_schema.sql           # Sistema de chat
database/notifications_schema.sql  # Sistema de notificações
database/naf_services_schema.sql   # Serviços do NAF
database/fiscal_appointments_final.sql # Agendamentos fiscais
```

### 4. Ativar o Supabase real
No arquivo `src/lib/supabase.ts`, alterar:

```typescript
// DE:
const USE_MOCK = true

// PARA:
const USE_MOCK = !supabaseUrl || !supabaseServiceKey || supabaseServiceKey === supabaseAnonKey || process.env.NODE_ENV === 'development'
```

### 5. Fazer redeploy
Após configurar as variáveis e alterar o código, fazer novo deploy na Vercel.

## Funcionalidades Atuais com Mock

✅ **Cadastro de Estudantes** - Funcionando perfeitamente
✅ **Sistema de Notificações** - Funcional
✅ **Validações** - Email único, CPF único, etc.
✅ **Todas as APIs** - Funcionando com dados em memória

## Benefícios do Mock Atual

- 🚀 **Deploy imediato** sem dependências externas
- ✅ **Testes funcionais** completos
- 🔧 **Desenvolvimento ágil** sem configuração complexa
- 📊 **Demonstração funcional** para stakeholders

## Dados Persistidos
⚠️ **Importante**: O mock atual não persiste dados entre restarts do servidor. Para persistência real, configurar o Supabase conforme instruções acima.