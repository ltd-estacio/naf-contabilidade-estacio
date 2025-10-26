# 🔄 Fluxo Completo do Sistema NAF Contábil

## 📋 Visão Geral

Este documento explica o **fluxo completo** desde quando um cliente solicita um atendimento até o estudante realizar e o coordenador acompanhar.

---

## 🎯 Fluxo Passo a Passo

### **1️⃣ Cliente Busca Serviço**

**URL:** `https://naf.ltdestacio.com.br/services`

- Cliente acessa a página de serviços disponíveis
- Vê lista de serviços categorizados (IRPF, MEI, Tributação, etc.)
- **Escolhe um serviço** clicando no botão "Agendar"

**Exemplo de serviço:**
- "Opção pelo Domicílio Tributário Eletrônico (DTE)"
- Categoria: "servicos_disponíveis"

---

### **2️⃣ Cliente Agenda o Atendimento**

**URL:** `https://naf.ltdestacio.com.br/naf-scheduling?service=Opção%20pelo%20Domicílio%20Tributário%20Eletrônico%20(DTE)&category=servicos_disponíveis`

**Formulário de Agendamento:**

| Campo | Descrição |
|-------|-----------|
| **Nome Completo** | Nome do cliente |
| **E-mail** | Para confirmação |
| **Telefone** | Contato |
| **CPF** | Identificação |
| **Categoria** | Pessoa Física, MEI, Rural, OSC |
| **Data Preferencial** | Calendário interativo |
| **Horário** | Slots disponíveis (8h-17h) |
| **Período** | Manhã, Tarde ou Noite |
| **Urgência** | Baixa, Média, Alta |
| **Observações** | Detalhes do atendimento |
| **Online/Presencial** | Modalidade |

**Ao Enviar:**
1. Sistema valida os dados
2. Gera protocolo único (`FAP-YYYYMMDD-XXX`)
3. **Salva na tabela `fiscal_appointments`**
4. Envia e-mail de confirmação ao cliente
5. Mostra mensagem de sucesso

---

### **3️⃣ Atendimento Fica Disponível no Sistema**

**Tabela:** `fiscal_appointments`

**Dados salvos:**
```sql
- protocol: "FAP-20241008-001"
- service_type: "domicilio-tributario-dte"
- service_title: "Opção pelo Domicílio Tributário Eletrônico"
- service_category: "Tributação"
- client_name: "Maria Silva"
- client_email: "maria@email.com"
- client_phone: "(11) 98765-4321"
- client_cpf: "123.456.789-00"
- address_city: "São Paulo"
- address_state: "SP"
- urgency_level: "NORMAL"
- preferred_date: "2024-10-15"
- preferred_time: "10:00"
- preferred_period: "MANHA"
- status: "PENDENTE"
- assigned_student_id: NULL  ← Ainda não atribuído
- created_at: "2024-10-08 23:30:00"
```

---

### **4️⃣ Estudante Vê e Pega o Atendimento**

**URL:** `https://naf.ltdestacio.com.br/student-portal` → Aba "Atendimentos Fiscais"

**O que o estudante vê:**

1. **Se NÃO há atendimentos atribuídos:**
   - Mostra mensagem: "Nenhum atendimento fiscal atribuído"
   - Botão: **"Buscar Atendimentos Disponíveis"**
   - Ao clicar: busca os 5 atendimentos mais recentes SEM estudante
   - Sistema atribui automaticamente ao estudante logado
   - Atualiza `assigned_student_id` com o ID do estudante

2. **Após atribuição:**
   - Cards de estatísticas atualizados
   - Lista de atendimentos aparece com todos os detalhes
   - Botões de ação disponíveis

---

### **5️⃣ Estudante Realiza o Atendimento**

**Painel do Estudante → Atendimentos Fiscais**

**Fluxo de trabalho:**

| Status | Ação Disponível | O que acontece |
|--------|----------------|----------------|
| **PENDENTE** | *Aguardar confirmação* | Cliente ainda não confirmou |
| **CONFIRMADO** | 🟢 **Iniciar** | Muda para EM_ANDAMENTO |
| **CONFIRMADO** | 📅 **Reagendar** | Altera data/hora |
| **CONFIRMADO** | ❌ **Cancelar** | Cancela com motivo |
| **EM_ANDAMENTO** | ✅ **Finalizar** | Muda para CONCLUÍDO + abre modal de feedback |
| **EM_ANDAMENTO** | ❌ **Cancelar** | Cancela com motivo |
| **CONCLUÍDO** | ⭐ **Feedback** | Cliente avalia o atendimento |

**Exemplo de uso:**

1. **Estudante vê atendimento "CONFIRMADO"**
2. Clica em **"Iniciar"** → Status vira `EM_ANDAMENTO`
3. Realiza o atendimento com o cliente (presencial ou online)
4. Adiciona **Notas Internas** sobre o atendimento
5. Clica em **"Finalizar"** → Status vira `CONCLUÍDO`
6. Modal de feedback abre automaticamente
7. Estudante preenche feedback do cliente e salva

**Campos de Feedback:**
- Avaliação geral (1-5 estrelas)
- Satisfação do cliente
- Qualidade do atendimento
- Comentários adicionais

---

### **6️⃣ Coordenador Acompanha Tudo**

**URL:** `https://naf.ltdestacio.com.br/coordinator-dashboard`

**Dashboard do Coordenador:**

**Estatísticas em Tempo Real:**
- 📊 **Total de Atendimentos**: 15
- ⏳ **Pendentes**: 8
- ✅ **Confirmados**: 4
- 🔥 **Urgentes**: 3
- ✔️ **Concluídos**: 10

**O que o coordenador vê:**

1. **Lista Completa de Atendimentos**
   - Todos os atendimentos (com e sem estudante)
   - Filtro por status
   - Filtro por urgência
   - Busca por protocolo/cliente

2. **Detalhes de Cada Atendimento**
   - Dados do cliente
   - Estudante responsável (se atribuído)
   - Status atual
   - Histórico de mudanças
   - Notas internas do estudante
   - Feedback do cliente

3. **Ações do Coordenador**
   - ✅ Atribuir manualmente a um estudante
   - 📊 Gerar relatórios
   - 📈 Acompanhar desempenho dos estudantes
   - 🔍 Ver histórico completo

4. **Relatórios Disponíveis**
   - Atendimentos por estudante
   - Tempo médio de atendimento
   - Taxa de conclusão
   - Satisfação dos clientes
   - Serviços mais solicitados

---

## 🔗 Integração Completa

### **Tabela `fiscal_appointments` (Centro do Sistema)**

```
┌─────────────────────────────────────────────────────────┐
│                  fiscal_appointments                     │
├─────────────────────────────────────────────────────────┤
│ • protocol (único)                                       │
│ • client_* (dados do cliente)                            │
│ • service_* (dados do serviço)                           │
│ • assigned_student_id → students(id) ← VÍNCULO          │
│ • status (PENDENTE, CONFIRMADO, EM_ANDAMENTO, etc.)     │
│ • preferred_date, preferred_time                         │
│ • urgency_level                                          │
│ • internal_notes (estudante)                             │
│ • client_notes (cliente)                                 │
└─────────────────────────────────────────────────────────┘
           ↑                      ↑
           │                      │
    ┌──────┴──────┐       ┌──────┴────────┐
    │   Cliente   │       │   Estudante   │
    │  (cria via  │       │ (realiza via  │
    │ /naf-sched) │       │ /student-port)│
    └─────────────┘       └───────────────┘
                              ↑
                              │
                       ┌──────┴──────────┐
                       │  Coordenador    │
                       │   (acompanha)   │
                       └─────────────────┘
```

---

## ✅ Checklist de Funcionamento

### **Para o Cliente:**
- [ ] Consegue ver serviços em `/services`
- [ ] Consegue agendar em `/naf-scheduling`
- [ ] Recebe e-mail de confirmação
- [ ] Dados são salvos em `fiscal_appointments`

### **Para o Estudante:**
- [ ] Consegue ver atendimentos em `/student-portal` → "Atendimentos Fiscais"
- [ ] Consegue buscar atendimentos disponíveis
- [ ] Consegue iniciar, finalizar, cancelar e reagendar
- [ ] Consegue adicionar notas internas
- [ ] Consegue enviar feedback do cliente

### **Para o Coordenador:**
- [ ] Consegue ver todos os atendimentos em `/coordinator-dashboard`
- [ ] Consegue atribuir manualmente estudantes
- [ ] Consegue ver histórico completo
- [ ] Consegue gerar relatórios

---

## 🚀 Próximos Passos Recomendados

### **1. Testar o Fluxo Completo**

1. **Como Cliente:**
   ```
   https://naf.ltdestacio.com.br/services
   → Escolher serviço
   → Preencher formulário
   → Confirmar agendamento
   ```

2. **Como Estudante:**
   ```
   https://naf.ltdestacio.com.br/student-portal
   → Ir em "Atendimentos Fiscais"
   → Clicar "Buscar Atendimentos"
   → Iniciar atendimento
   → Finalizar atendimento
   → Enviar feedback
   ```

3. **Como Coordenador:**
   ```
   https://naf.ltdestacio.com.br/coordinator-dashboard
   → Ver todos os atendimentos
   → Acompanhar progresso dos estudantes
   → Gerar relatórios
   ```

---

### **2. Melhorias Futuras (Opcional)**

- [ ] **Notificações em Tempo Real** (WebSocket)
  - Notificar estudante quando novo atendimento chega
  - Notificar coordenador quando atendimento é concluído

- [ ] **Chat Integrado**
  - Comunicação entre estudante e cliente
  - Comunicação entre estudante e coordenador

- [ ] **Relatórios Avançados**
  - Dashboard analytics completo
  - Exportação para Excel/PDF
  - Gráficos de desempenho

- [ ] **Gamificação**
  - Ranking de estudantes
  - Badges de conquistas
  - Sistema de pontos

- [ ] **Automação**
  - Atribuição automática de atendimentos por critérios (urgência, especialização)
  - Lembretes automáticos de atendimentos agendados
  - Follow-up automático com clientes

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│ /services          → Lista de serviços                       │
│ /naf-scheduling    → Formulário de agendamento (público)     │
│ /student-portal    → Painel do estudante (autenticado)       │
│ /coordinator-dash  → Painel do coordenador (autenticado)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                          APIs                                │
├─────────────────────────────────────────────────────────────┤
│ POST /api/fiscal-appointments → Criar atendimento            │
│ GET  /api/students/fiscal-appointments → Listar (estudante)  │
│ PUT  /api/students/fiscal-appointments → Atualizar (estud.)  │
│ POST /api/students/assign-appointments → Auto-atribuir       │
│ GET  /api/coordinator/simple-dashboard → Dashboard coord.    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
├─────────────────────────────────────────────────────────────┤
│ fiscal_appointments (tabela principal)                       │
│ students (estudantes)                                        │
│ fiscal_appointment_feedbacks (avaliações)                    │
│ naf_services (catálogo de serviços)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Resumo para Iniciantes

**Em 3 passos simples:**

1. **Cliente agenda** → Dados vão para `fiscal_appointments`
2. **Estudante pega e realiza** → Atualiza status e adiciona notas
3. **Coordenador acompanha** → Vê tudo e gera relatórios

**Tudo sincronizado em tempo real usando a mesma tabela!** ✅

---

**Última atualização:** 08/10/2024
**Status:** ✅ Sistema 100% integrado e funcional
