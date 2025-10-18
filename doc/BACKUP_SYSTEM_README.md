# 🛡️ Central de Backup Profissional - NAF Contábil

## 📋 Visão Geral

Sistema avançado de backup e controle de atendimentos fiscais para o painel do Coordenador. Oferece funcionalidades completas para exportação, visualização e rastreamento de dados com controle profissional e logs de auditoria.

## 🎯 Funcionalidades Implementadas

### 1. **Exportação de Dados em Múltiplos Formatos**
- ✅ CSV (Recomendado) - Compatível com Excel, Google Sheets
- ✅ JSON - Para integrações e processamento programático
- ✅ TXT - Formato legível e simples
- ✅ Excel (CSV) - Formatação específica para Microsoft Excel

### 2. **Filtros Avançados**
- Filtro por Status: PENDENTE, CONFIRMADO, AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO, NAO_COMPARECEU
- Filtro por Intervalo de Datas (Data Inicial e Final)
- Opção de incluir/excluir Feedbacks dos atendimentos
- Filtro por Estudante responsável
- Filtro por Categoria de serviço

### 3. **Dados Exportados**

#### Informações do Atendimento:
- Protocolo
- Status
- Serviço (título, categoria, tipo)
- Urgência
- Datas (criação, confirmação, agendamento, conclusão)

#### Dados do Cliente:
- Nome completo
- E-mail e telefone
- CPF e data de nascimento
- Endereço completo com CEP

#### Estudante Responsável:
- Nome do estudante
- E-mail
- Curso e semestre

#### Feedback (quando disponível):
- Avaliação geral (1-5 estrelas)
- Qualidade do atendimento
- Pontualidade
- Profissionalismo
- Resolução do problema
- Recomendaria? (Sim/Não)
- Comentários detalhados

#### Observações:
- Observações do cliente
- Notas internas

### 4. **Métodos de Acesso ao Backup**

#### 📥 Download Direto
- Download imediato para o computador
- Arquivo pronto para uso
- Formato escolhido pelo usuário

#### 📧 Envio por E-mail
- Envio automático para o e-mail especificado
- Possibilidade de adicionar mensagem personalizada
- Suporte para múltiplos destinatários

#### 👁️ Pré-visualização (Em desenvolvimento)
- Visualização rápida dos dados antes de exportar
- Validação de filtros aplicados

### 5. **Sistema de Logs Profissional**

#### Informações Registradas:
- 📊 Tipo de backup (download, email, preview)
- 📄 Formato de exportação
- 📏 Tamanho do arquivo (KB/MB)
- 🔢 Total de registros exportados
- 🎯 Filtros aplicados
- 📅 Data e hora da operação
- 👤 Coordenador responsável
- 🌐 Endereço IP
- 💻 Navegador utilizado (User Agent)
- ✅ Status (sucesso/falha)
- ⏱️ Tempo de execução (ms)
- 📧 E-mail de destino (quando aplicável)

#### Estatísticas Consolidadas:
- Total de backups realizados
- Total de downloads
- Total de e-mails enviados
- Total de registros exportados
- Volume total de dados (KB/MB)
- Data do último backup
- Taxa de sucesso/falha

### 6. **Segurança e Auditoria**

- ✅ Rastreamento completo de todas as operações
- ✅ Registro de IP e navegador para auditoria
- ✅ Histórico permanente de acessos
- ✅ Controle de permissões por coordenador
- ✅ Logs imutáveis para conformidade
- ✅ Validação de dados antes da exportação

## 🗂️ Estrutura de Arquivos

### Backend (APIs)
```
src/app/api/coordinator/backup/
├── generate/route.ts      # Gera backup em múltiplos formatos
├── logs/route.ts          # Busca logs de backup
└── send-email/route.ts    # Envia backup por e-mail
```

### Frontend (Componentes)
```
src/components/coordinator/
└── BackupCenter.tsx       # Componente principal da Central de Backup
```

### Banco de Dados
```
src/sql/
└── backup-tables.sql      # Tabelas do sistema de backup
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `fiscal_appointment_feedbacks`
Armazena feedbacks detalhados dos atendimentos fiscais.

**Campos:**
- `id` (UUID) - Identificador único
- `appointment_id` (UUID) - Referência ao atendimento
- `student_id` (UUID) - Estudante avaliado
- `rating` (Integer 1-5) - Avaliação geral
- `attendance_quality` (Integer 1-5)
- `punctuality` (Integer 1-5)
- `professionalism` (Integer 1-5)
- `problem_resolution` (Integer 1-5)
- `would_recommend` (Boolean)
- `feedback_text` (Text)
- `additional_comments` (Text)
- `created_at`, `updated_at` (Timestamp)

### Tabela: `backup_logs`
Registra todas as operações de backup realizadas.

**Campos:**
- `id` (UUID) - Identificador único
- `coordinator_id` (UUID) - Coordenador responsável
- `coordinator_name` (String)
- `coordinator_email` (String)
- `backup_type` (Enum: download, email, preview)
- `export_format` (Enum: csv, json, pdf, excel, txt, docx)
- `file_size_kb` (Numeric)
- `total_records` (Integer)
- `filter_applied` (JSONB) - Filtros utilizados
- `date_range` (JSONB)
- `status_filter` (Array)
- `ip_address` (String)
- `user_agent` (Text)
- `email_sent_to` (String) - E-mail destino
- `success` (Boolean)
- `error_message` (Text)
- `execution_time_ms` (Integer)
- `created_at` (Timestamp)

### Tabela: `backup_configurations`
Configurações personalizadas de backup por coordenador.

**Campos:**
- `id` (UUID)
- `coordinator_id` (UUID)
- `auto_backup_enabled` (Boolean)
- `auto_backup_frequency` (Enum: daily, weekly, monthly)
- `default_export_format` (String)
- `include_feedbacks` (Boolean)
- `email_notifications` (Boolean)
- `retention_days` (Integer)
- `encryption_enabled` (Boolean)
- `created_at`, `updated_at` (Timestamp)

### View: `vw_backup_statistics`
Estatísticas consolidadas por coordenador.

## 🚀 Como Usar

### 1. Acessar a Central de Backup

1. Faça login como Coordenador
2. No menu lateral, clique em **"Segurança Digital"**
3. Você verá o painel da Central de Backup Profissional

### 2. Gerar um Backup

#### Download Direto:
1. Na aba **"Gerar Backup"**, configure os filtros desejados
2. Escolha o formato de exportação (CSV recomendado)
3. Selecione os status dos atendimentos
4. Defina o intervalo de datas (opcional)
5. Marque/desmarque "Incluir feedbacks"
6. Clique em **"Fazer Download"**
7. O arquivo será baixado automaticamente

#### Envio por E-mail:
1. Configure os mesmos filtros acima
2. Digite o e-mail de destino
3. Adicione uma mensagem (opcional)
4. Clique em **"Enviar por E-mail"**
5. Aguarde a confirmação de envio

### 3. Consultar Histórico de Logs

1. Acesse a aba **"Histórico de Logs"**
2. Visualize todas as operações realizadas
3. Informações disponíveis:
   - Tipo de operação (download/email)
   - Formato utilizado
   - Quantidade de registros
   - Tamanho do arquivo
   - Data e hora
   - Status (sucesso/falha)

### 4. Estatísticas

No topo da página, visualize:
- **Total de Backups** realizados
- **Downloads** efetuados
- **E-mails** enviados
- **Registros** exportados
- **Volume** total de dados

## 🔧 Instalação das Tabelas

### Passo 1: Executar SQL
Execute o arquivo `src/sql/backup-tables.sql` no seu banco Supabase:

```bash
# Copie o conteúdo do arquivo backup-tables.sql
# Cole no SQL Editor do Supabase
# Execute o script
```

### Passo 2: Verificar Criação
Verifique se as tabelas foram criadas:
- `fiscal_appointment_feedbacks`
- `backup_logs`
- `backup_configurations`
- `vw_backup_statistics` (view)

### Passo 3: Configurar Permissões
Certifique-se de que os coordenadores têm permissão para:
- INSERT em `backup_logs`
- SELECT em `backup_logs` (próprios registros)
- SELECT em `vw_backup_statistics`

## 📊 Exemplos de Uso

### Caso 1: Backup Mensal Completo
```
Formato: CSV
Status: Todos
Data Inicial: 01/09/2025
Data Final: 30/09/2025
Incluir Feedbacks: Sim
Método: Download
```

### Caso 2: Apenas Atendimentos Concluídos
```
Formato: Excel
Status: CONCLUIDO
Data: Últimos 7 dias
Incluir Feedbacks: Sim
Método: E-mail
```

### Caso 3: Auditoria de Cancelamentos
```
Formato: JSON
Status: CANCELADO, NAO_COMPARECEU
Data: Último mês
Incluir Feedbacks: Não
Método: Download
```

## 🎨 Interface do Usuário

### Design Profissional
- ✅ Cards estatísticos coloridos e informativos
- ✅ Filtros intuitivos com seleção múltipla
- ✅ Badges visuais para status
- ✅ Ícones descritivos para cada ação
- ✅ Feedback visual em tempo real
- ✅ Responsivo para desktop e mobile
- ✅ Dark mode compatível

### Componentes Visuais
- 📊 Gráficos de estatísticas
- 🎯 Badges de formato
- ⏱️ Indicadores de tempo
- ✅ Alerts de sucesso/erro
- 📋 Tabelas de logs organizadas

## 🔒 Segurança

### Práticas Implementadas:
- ✅ Validação de entrada de dados
- ✅ Sanitização de parâmetros
- ✅ Logs de auditoria completos
- ✅ Rastreamento de IP
- ✅ Controle de acesso por role
- ✅ Proteção contra SQL Injection
- ✅ Rate limiting (recomendado)

### Recomendações Futuras:
- 🔐 Criptografia de arquivos sensíveis
- 🔐 Autenticação de dois fatores
- 🔐 Backup automático agendado
- 🔐 Compressão de arquivos grandes
- 🔐 Assinatura digital de backups

## 📈 Métricas e KPIs

### Disponíveis no Sistema:
- Taxa de sucesso de backups
- Tempo médio de geração
- Formatos mais utilizados
- Volume de dados exportados
- Frequência de uso por coordenador
- Picos de utilização

## 🐛 Troubleshooting

### Problema: Backup não é gerado
**Solução:**
1. Verifique se as tabelas foram criadas corretamente
2. Confirme as permissões do usuário
3. Verifique os logs no console do navegador
4. Teste com filtros menos restritivos

### Problema: E-mail não é enviado
**Solução:**
1. Verifique a configuração do servidor de e-mail
2. Confirme o e-mail de destino
3. Veja os logs de erro na tabela `backup_logs`
4. Configure um serviço de e-mail (SendGrid, AWS SES)

### Problema: Arquivo muito grande
**Solução:**
1. Use filtros de data menores
2. Divida a exportação em múltiplos backups
3. Implemente paginação
4. Use compressão (ZIP/GZIP)

## 🚀 Próximas Implementações

### Planejadas:
- [ ] Geração de PDF formatado
- [ ] Geração de DOCX com template
- [ ] Backup automático agendado
- [ ] Compressão ZIP de múltiplos arquivos
- [ ] Integração com Google Drive/Dropbox
- [ ] Dashboard de análise de backups
- [ ] Exportação incremental
- [ ] Validação de integridade de dados
- [ ] Restauração de backups
- [ ] API REST para integrações externas

## 📞 Suporte

Para questões técnicas:
1. Verifique a documentação completa
2. Consulte os logs do sistema
3. Entre em contato com o suporte técnico

## 📄 Licença

Sistema desenvolvido para o NAF Contábil - Todos os direitos reservados.

---

**Versão:** 1.0.0
**Data de Criação:** 11 de Outubro de 2025
**Última Atualização:** 11 de Outubro de 2025
**Desenvolvido por:** Sistema NAF Contábil
