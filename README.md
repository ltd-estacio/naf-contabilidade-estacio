# 📊 NAF Contábil - Sistema de Gestão de Atendimentos Fiscais

## 🎯 Sobre o Projeto

Sistema completo de gestão de atendimentos fiscais para Núcleos de Apoio Contábil e Fiscal (NAF), desenvolvido para facilitar a interação entre **clientes**, **estudantes** e **coordenadores**.

---

## 🚀 Principais Funcionalidades

### 👥 **Para Clientes**
- ✅ Visualizar serviços disponíveis
- ✅ Agendar atendimentos online
- ✅ Escolher data, horário e modalidade (presencial/online)
- ✅ Receber confirmação por e-mail
- ✅ Acompanhar status do atendimento

### 🎓 **Para Estudantes**
- ✅ Visualizar atendimentos atribuídos
- ✅ Buscar novos atendimentos disponíveis
- ✅ Gerenciar status (Iniciar, Finalizar, Cancelar, Reagendar)
- ✅ Adicionar notas internas
- ✅ Coletar feedback dos clientes
- ✅ Acompanhar estatísticas pessoais

### 👨‍💼 **Para Coordenadores**
- ✅ Dashboard completo com métricas
- ✅ Visualizar todos os atendimentos
- ✅ Acompanhar desempenho dos estudantes
- ✅ Atribuir atendimentos manualmente
- ✅ Gerar relatórios profissionais
- ✅ Monitorar feedback dos clientes

---

## 🔄 Fluxo do Sistema

```
┌──────────────────────────────────────────────────────┐
│  1️⃣ CLIENTE                                          │
│     ↓                                                │
│  📋 Acessa /services                                 │
│     ↓                                                │
│  ✍️ Preenche formulário em /naf-scheduling          │
│     ↓                                                │
│  💾 Dados salvos em fiscal_appointments              │
│     └─> Status: PENDENTE                            │
│         assigned_student_id: NULL                    │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  2️⃣ ESTUDANTE                                        │
│     ↓                                                │
│  🔍 Busca atendimentos disponíveis                   │
│     ↓                                                │
│  ✅ Sistema atribui automaticamente                  │
│     └─> assigned_student_id = ID do estudante       │
│     ↓                                                │
│  🟢 CONFIRMADO → Iniciar → EM_ANDAMENTO             │
│     ↓                                                │
│  ✏️ Adiciona notas internas                         │
│     ↓                                                │
│  ✅ Finalizar → CONCLUÍDO                           │
│     ↓                                                │
│  ⭐ Coleta feedback do cliente                       │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  3️⃣ COORDENADOR                                      │
│     ↓                                                │
│  📊 Visualiza dashboard completo                     │
│     ↓                                                │
│  👀 Acompanha todos os atendimentos                  │
│     ↓                                                │
│  📈 Analisa desempenho dos estudantes                │
│     ↓                                                │
│  📄 Gera relatórios personalizados                   │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- ⚛️ **Next.js 14** (App Router)
- 🎨 **TailwindCSS** + **shadcn/ui**
- 📝 **TypeScript**
- 🎯 **React Hooks**

### **Backend**
- 🔐 **Next.js API Routes**
- 🗄️ **Supabase** (PostgreSQL)
- 🔑 **JWT** para autenticação
- 📧 **EmailJS** para notificações

### **Banco de Dados**
- 🐘 **PostgreSQL** (via Supabase)
- 📊 Tabelas principais:
  - `fiscal_appointments` - Atendimentos
  - `students` - Estudantes
  - `fiscal_appointment_feedbacks` - Avaliações
  - `naf_services` - Catálogo de serviços

---

## 📁 Estrutura do Projeto

```
naf-contabil-1.0.0/
├── src/
│   ├── app/
│   │   ├── services/              # Catálogo de serviços
│   │   ├── naf-scheduling/        # Formulário de agendamento
│   │   ├── student-portal/        # Painel do estudante
│   │   ├── coordinator-dashboard/ # Painel do coordenador
│   │   └── api/
│   │       ├── fiscal-appointments/    # API pública
│   │       └── students/
│   │           ├── fiscal-appointments/    # API do estudante
│   │           └── assign-appointments/    # Auto-atribuição
│   ├── components/
│   │   ├── student/
│   │   │   ├── StudentFiscalAppointments.tsx  # Gestão de atendimentos
│   │   │   └── FeedbackModal.tsx              # Coleta de feedback
│   │   └── FiscalAppointmentsSection.tsx      # Dashboard coordenador
│   ├── lib/
│   │   ├── supabase.ts           # Configuração Supabase
│   │   └── emailjs.ts            # Envio de e-mails
│   └── sql/
│       ├── tables.sql            # Schema do banco
│       └── EXECUTAR_ESTE_SCRIPT.sql  # Dados de teste
├── FLUXO_COMPLETO_DO_SISTEMA.md   # Documentação detalhada
├── COMO_POPULAR_ATENDIMENTOS_FISCAIS.md  # Guia de dados de teste
└── README.md                      # Este arquivo
```

---

## 🚦 Como Iniciar

### **1. Instalação**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/naf-contabil-1.0.0.git

# Entre na pasta
cd naf-contabil-1.0.0

# Instale as dependências
npm install
```

### **2. Configuração**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_aqui

# JWT
NEXTAUTH_SECRET=seu_secret_aqui

# EmailJS (opcional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=seu_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=seu_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=sua_public_key
```

### **3. Configurar Banco de Dados**

Execute os scripts SQL no Supabase SQL Editor:

```bash
# 1. Criar tabelas
src/sql/tables.sql

# 2. Criar dados de teste (opcional)
src/sql/EXECUTAR_ESTE_SCRIPT.sql
```

### **4. Executar o Projeto**

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse: `http://localhost:3000`

---

## 🎯 URLs Principais

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Página inicial | Público |
| `/services` | Catálogo de serviços | Público |
| `/naf-scheduling` | Agendamento de atendimentos | Público |
| `/student-portal` | Painel do estudante | Autenticado (Estudante) |
| `/coordinator-dashboard` | Painel do coordenador | Autenticado (Coordenador) |
| `/student-login-simple` | Login de estudante | Público |
| `/coordinator-login` | Login de coordenador | Público |

---

## 📊 Tabela Principal: `fiscal_appointments`

### **Campos Principais**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `protocol` | String | Protocolo único (FAP-YYYYMMDD-XXX) |
| `service_type` | String | Tipo de serviço |
| `service_title` | String | Título do serviço |
| `service_category` | String | Categoria (IRPF, MEI, etc.) |
| `client_name` | String | Nome do cliente |
| `client_email` | String | E-mail do cliente |
| `client_phone` | String | Telefone do cliente |
| `status` | Enum | PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO |
| `urgency_level` | Enum | BAIXA, NORMAL, ALTA, URGENTE |
| `assigned_student_id` | UUID | ID do estudante responsável |
| `preferred_date` | Date | Data preferencial |
| `preferred_time` | Time | Horário preferencial |
| `internal_notes` | Text | Notas do estudante |
| `client_notes` | Text | Observações do cliente |

---

## 🎓 Como Usar - Passo a Passo

### **Para Clientes:**

1. Acesse `https://naf.ltdestacio.com.br/services`
2. Escolha um serviço clicando em **"Agendar"**
3. Preencha o formulário com seus dados
4. Escolha data e horário preferencial
5. Confirme o agendamento
6. Aguarde o estudante realizar o atendimento

### **Para Estudantes:**

1. Faça login em `https://naf.ltdestacio.com.br/student-login-simple`
2. Acesse o **Painel do Estudante**
3. Vá na aba **"Atendimentos Fiscais"**
4. Se não houver atendimentos:
   - Clique em **"Buscar Atendimentos Disponíveis"**
5. Gerencie seus atendimentos:
   - **Iniciar**: Quando for atender o cliente
   - **Finalizar**: Quando concluir o atendimento
   - **Reagendar**: Para mudar data/hora
   - **Cancelar**: Se necessário cancelar
   - **Feedback**: Após finalizar, colete avaliação do cliente

### **Para Coordenadores:**

1. Faça login em `https://naf.ltdestacio.com.br/coordinator-login`
2. Acesse o **Dashboard do Coordenador**
3. Visualize:
   - Estatísticas gerais
   - Todos os atendimentos
   - Desempenho dos estudantes
   - Feedbacks dos clientes
4. Ações disponíveis:
   - Atribuir atendimentos manualmente
   - Gerar relatórios
   - Acompanhar métricas

---

## 🧪 Testes

### **Testar Agendamento de Cliente**

```bash
# 1. Acesse
http://localhost:3000/services

# 2. Escolha qualquer serviço

# 3. Preencha o formulário em /naf-scheduling

# 4. Verifique no banco de dados:
SELECT * FROM fiscal_appointments ORDER BY created_at DESC LIMIT 1;
```

### **Testar Painel do Estudante**

```bash
# 1. Faça login como estudante

# 2. Vá em "Atendimentos Fiscais"

# 3. Clique em "Buscar Atendimentos"

# 4. Verifique se os dados aparecem
```

---

## 📚 Documentação Adicional

- 📖 **[Fluxo Completo do Sistema](./FLUXO_COMPLETO_DO_SISTEMA.md)** - Documentação detalhada do funcionamento
- 🗂️ **[Como Popular Dados de Teste](./COMO_POPULAR_ATENDIMENTOS_FISCAIS.md)** - Guia para criar dados de exemplo
- 🛠️ **[Schema do Banco](./src/sql/tables.sql)** - Estrutura completa das tabelas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autores

- **NAF Contábil Team** - Desenvolvimento e manutenção
- **Universidade Estácio de Sá** - Coordenação acadêmica

---

## 📞 Suporte

- 📧 **E-mail**: suporte@naf.ltdestacio.com.br
- 🌐 **Website**: https://naf.ltdestacio.com.br
- 📱 **WhatsApp**: (11) 99999-9999

---

## 🎯 Status do Projeto

✅ **Sistema 100% Funcional e Integrado**

- [x] Formulário de agendamento público
- [x] Painel do estudante completo
- [x] Painel do coordenador
- [x] Sistema de feedback
- [x] Auto-atribuição de atendimentos
- [x] CRUD completo de atendimentos
- [x] Integração com e-mail
- [x] Dashboard com métricas
- [x] Relatórios personalizados

---

## 🚀 Próximas Melhorias

- [ ] Notificações em tempo real (WebSocket)
- [ ] Chat integrado entre estudante e cliente
- [ ] Relatórios avançados com gráficos
- [ ] Sistema de gamificação para estudantes
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com calendário (Google Calendar)
- [ ] IA para triagem automática de atendimentos

---

**Última atualização:** 08/10/2024
**Versão:** 1.0.0
