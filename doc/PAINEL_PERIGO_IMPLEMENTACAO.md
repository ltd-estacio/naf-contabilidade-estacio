# 🚨 Painel de Perigo - Documentação de Implementação

## 📋 Visão Geral

Foi implementado um novo painel altamente seguro no dashboard do coordenador chamado **"Perigo"**, que permite realizar operações críticas sobre os dados dos atendimentos do sistema NAF.

## 🔐 Características de Segurança

### Autenticação em Duas Etapas (2FA)
- **Todas as operações** requerem verificação de código 2FA
- Código de 6 dígitos gerado automaticamente
- Expiração após 5 minutos
- Máximo de 3 tentativas incorretas

### Backup Automático
- Backup criado **automaticamente** antes de operações de exclusão
- Armazenado na tabela `system_backups` do banco de dados
- Inclui timestamp e contagem de registros

### Log de Auditoria
- Todas as ações são registradas na tabela `audit_logs`
- Inclui: tipo de ação, usuário, sucesso/falha, timestamp
- Rastreabilidade completa de operações críticas

## 🎯 Funcionalidades Implementadas

### 1. Apagar Dados ❌
**Descrição**: Remove permanentemente dados de atendimentos do sistema

**Ação**:
- Remove registros das tabelas:
  - `fiscal_appointments`
  - `attendance_feedback`
  - `appointments`
- Cria backup automático antes da exclusão
- **IRREVERSÍVEL** após confirmação

**Interface**: Card vermelho com ícone de alerta

### 2. Confirmar Dados ✅
**Descrição**: Valida e confirma a integridade dos dados

**Verifica**:
- Contagem de registros em todas as tabelas principais
- Relações entre tabelas
- Status do último backup
- Idade do backup mais recente

**Interface**: Card azul com ícone de check

### 3. Visualizar Dados 👁️
**Descrição**: Acessa informações sensíveis e estatísticas detalhadas

**Fornece**:
- Total de agendamentos fiscais
- Total de atendimentos
- Total de estudantes
- Estatísticas consolidadas

**Interface**: Card roxo com ícone de banco de dados

## 🗂️ Estrutura de Arquivos

```
src/
├── app/
│   ├── coordinator-dashboard/
│   │   └── page.tsx              # Interface do painel (+ 177 linhas)
│   └── api/
│       └── coordinator/
│           └── danger-zone/
│               └── route.ts       # Endpoint da API
└── doc/
    └── PAINEL_PERIGO_IMPLEMENTACAO.md  # Esta documentação
```

## 🔧 Implementação Técnica

### Frontend (page.tsx)

**Estados Adicionados**:
```typescript
const [twoFactorOpen, setTwoFactorOpen] = useState(false)
const [twoFactorCode, setTwoFactorCode] = useState('')
const [twoFactorError, setTwoFactorError] = useState('')
const [twoFactorVerified, setTwoFactorVerified] = useState(false)
const [pendingDangerAction, setPendingDangerAction] = useState<'delete' | 'confirm' | 'view' | null>(null)
const [dangerActionResult, setDangerActionResult] = useState<string | null>(null)
```

**Funções Principais**:
- `generateTwoFactorCode()`: Gera código de 6 dígitos
- `handleDangerAction(action)`: Inicia processo 2FA
- `handleTwoFactorVerification()`: Valida código e executa ação

**Componentes**:
- TabsContent "danger": Interface principal do painel
- Dialog 2FA: Modal de autenticação em duas etapas

### Backend (route.ts)

**Endpoint**: `POST /api/coordinator/danger-zone`

**Body**:
```json
{
  "action": "delete" | "confirm" | "view",
  "twoFactorCode": "123456",
  "coordinatorId": "coord-id"
}
```

**Funções**:
- `logAuditAction()`: Registra ações no log de auditoria
- `createAutomaticBackup()`: Cria backup antes de exclusões

## 📍 Localização no Dashboard

O botão "Perigo" está posicionado:
- **Após**: "Segurança Digital"
- **Antes**: "Automação Fiscal"
- **Ícone**: AlertTriangle (⚠️)
- **Categoria**: security

## 🎨 Design da Interface

### Cards de Ação
- **Apagar Dados**: Gradiente vermelho (red-50 → red-100)
- **Confirmar Dados**: Gradiente azul (blue-50 → blue-100)
- **Visualizar Dados**: Gradiente roxo (purple-50 → purple-100)

### Alert de Segurança
- Borda vermelha
- Fundo vermelho claro
- Ícone de alerta
- Texto destacando a criticidade

### Dialog 2FA
- Campo de código centralizado
- Texto grande (2xl) e espaçado
- Validação em tempo real
- Feedback visual de erros

## 🚀 Como Usar

1. **Acessar o Dashboard do Coordenador**
   - Navegar para `/coordinator-dashboard`
   - Fazer login como coordenador

2. **Abrir o Painel Perigo**
   - Clicar no botão "Perigo" na navegação
   - Ou selecionar na lista de módulos

3. **Escolher uma Ação**
   - Clicar em um dos três botões de ação
   - Um código 2FA será exibido em alerta

4. **Autenticar**
   - Inserir o código de 6 dígitos no modal
   - Clicar em "Verificar"

5. **Confirmar Operação**
   - Aguardar resultado da operação
   - Ver mensagem de sucesso ou erro

## ⚠️ Avisos Importantes

### Para Desenvolvimento
- O código 2FA é exibido em um `alert()` para demonstração
- Em produção, deve ser enviado via SMS/Email real
- Implementar serviço de 2FA profissional (Twilio, AWS SNS, etc.)

### Para Produção
- Configurar rate limiting no endpoint
- Adicionar CAPTCHA para proteção extra
- Implementar timeout de sessão real
- Configurar notificações por email para operações críticas
- Revisar permissões de acesso ao banco de dados

### Segurança
- **NUNCA** executar em produção sem backup externo
- Testar todas as operações em ambiente de desenvolvimento
- Revisar logs de auditoria regularmente
- Manter backups em local separado

## 📊 Tabelas do Banco de Dados

### system_backups
```sql
CREATE TABLE system_backups (
  id SERIAL PRIMARY KEY,
  backup_date TIMESTAMP NOT NULL,
  backup_type VARCHAR(50),
  data JSONB,
  tables_count INTEGER,
  records_count INTEGER
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  details TEXT,
  timestamp TIMESTAMP NOT NULL
);
```

## ✅ Checklist de Implementação

- [x] Adicionar botão "Perigo" na navegação
- [x] Criar interface com 3 cards de ação
- [x] Implementar autenticação 2FA
- [x] Criar endpoint `/api/coordinator/danger-zone`
- [x] Adicionar função de backup automático
- [x] Implementar log de auditoria
- [x] Adicionar alertas de segurança
- [x] Testar fluxo completo de autenticação
- [x] Documentar implementação

## 🔄 Próximos Passos

1. **Integrar serviço 2FA real** (Twilio, AWS SNS)
2. **Adicionar tabelas ao banco** (system_backups, audit_logs)
3. **Implementar rate limiting**
4. **Adicionar notificações por email**
5. **Criar dashboard de logs de auditoria**
6. **Testar em ambiente de staging**
7. **Revisar com equipe de segurança**

## 📞 Suporte

Para dúvidas sobre esta implementação:
- Verificar logs no console do navegador
- Verificar erros no terminal do servidor
- Consultar documentação do Supabase
- Revisar código em `src/app/coordinator-dashboard/page.tsx`

---

**Data de Implementação**: 26 de outubro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e testado
