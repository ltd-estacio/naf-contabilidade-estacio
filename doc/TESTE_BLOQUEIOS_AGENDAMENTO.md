# 🧪 Como Testar Sistema de Bloqueios

## 🎯 Funcionalidade Implementada

Quando o coordenador bloqueia um dia ou horário, o usuário verá uma mensagem clara informando que aquela data/dia está bloqueado para agendamentos.

---

## 📋 Passo a Passo para Testar

### 1️⃣ CRIAR BLOQUEIOS (Como Coordenador)

#### **Bloquear um Sábado (Dia da Semana)**

1. Acessar: https://naf.ltdestacio.com.br/coordinator-dashboard
2. Ir na aba **"Disponibilidade"**
3. Clicar em **"+ Nova Configuração"**
4. Preencher:
   - Tipo: **Bloqueado**
   - Período: **Dia da Semana (Recorrente)**
   - Dia da Semana: **Sábado**
   - Hora Início: **00:00**
   - Hora Fim: **23:59**
   - Motivo: **Final de semana - Não há atendimento aos sábados**
5. Clicar em **"Criar"**

#### **Bloquear Domingo (Dia da Semana)**

1. Repetir o mesmo processo
2. Dia da Semana: **Domingo**
3. Motivo: **Final de semana - Não há atendimento aos domingos**

#### **Bloquear uma Data Específica (ex: Feriado)**

1. Clicar em **"+ Nova Configuração"**
2. Preencher:
   - Tipo: **Bloqueado**
   - Período: **Data Específica**
   - Data: **15/11/2025** (Proclamação da República)
   - Hora Início: **00:00**
   - Hora Fim: **23:59**
   - Motivo: **Feriado Nacional - Proclamação da República**
3. Clicar em **"Criar"**

---

### 2️⃣ TESTAR COMO USUÁRIO (Agendamento)

#### **Teste 1: Clicar em um Sábado**

1. Abrir em **aba anônima**: https://naf.ltdestacio.com.br/naf-scheduling
2. Preencher dados básicos (Passo 1)
3. Selecionar categoria e serviço (Passo 2)
4. No calendário (Passo 3): **Clicar em um sábado futuro**

**✅ Resultado Esperado:**
```
┌─────────────────────────────────────────┐
│     ⚠️  [Ícone de alerta triangular]    │
│                                          │
│    Dia da Semana Bloqueado              │
│                                          │
│  Final de semana - Não há atendimento   │
│  aos sábados                            │
│                                          │
│  💡 Dica: Selecione outra data          │
│  disponível no calendário para          │
│  continuar com o agendamento.           │
└─────────────────────────────────────────┘
```

#### **Teste 2: Clicar em um Domingo**

1. No mesmo calendário, **clicar em um domingo**

**✅ Resultado Esperado:**
```
Dia da Semana Bloqueado
Final de semana - Não há atendimento aos domingos
```

#### **Teste 3: Clicar no Feriado (15/11)**

1. No calendário, **clicar em 15/11/2025**

**✅ Resultado Esperado:**
```
Data Bloqueada
Feriado Nacional - Proclamação da República
```

#### **Teste 4: Clicar em Dia Normal (Segunda a Sexta)**

1. **Clicar em uma segunda-feira**

**✅ Resultado Esperado:**
```
Horários Disponíveis
[08:00] [08:30] [09:00] [09:30] ... [16:30]
(13 botões de horários)
```

---

## 🎨 Aparência Visual

### 🚫 Quando Bloqueado

**Cor**: Vermelho
**Ícone**: ⚠️ Triângulo de alerta
**Título**: "Data Bloqueada" ou "Dia da Semana Bloqueado"
**Descrição**: Motivo do bloqueio (texto do coordenador)
**Dica**: Caixa amarela com sugestão para selecionar outra data

### ✅ Quando Disponível

**Cor**: Azul
**Botões**: Grade de horários clicáveis
**Informação**: Número de vagas disponíveis

---

## 🔍 Debug no Console (F12)

### Quando seleciona dia bloqueado:

```
📡 Buscando slots para: 2025-11-09 (sábado)
📥 Resposta da API: {availability: [...], timeSlots: [...]}
🚫 Dia da semana bloqueado: Final de semana - Não há atendimento aos sábados
✅ Loading concluído
```

### Quando seleciona data bloqueada:

```
📡 Buscando slots para: 2025-11-15
📥 Resposta da API: {availability: [...], timeSlots: [...]}
🚫 Data bloqueada: Feriado Nacional - Proclamação da República
✅ Loading concluído
```

---

## 📊 Tipos de Bloqueio

| Tipo | Como Funciona | Exemplo |
|------|---------------|---------|
| **Dia da Semana** | Bloqueia TODOS os sábados/domingos/etc | Todo sábado do ano |
| **Data Específica** | Bloqueia UMA data exata | 15/11/2025 (feriado) |
| **Prioridade** | Data específica sobrescreve dia da semana | Se bloquear dia 25/12 E domingos, usa o bloqueio da data |

---

## ✅ Checklist de Testes

- [ ] Bloqueio de sábado funciona
- [ ] Bloqueio de domingo funciona
- [ ] Bloqueio de data específica (feriado) funciona
- [ ] Mensagem de bloqueio aparece correta
- [ ] Motivo do bloqueio aparece
- [ ] Dica amarela aparece
- [ ] Dias normais mostram horários
- [ ] Console mostra logs corretos

---

## 🎯 Exemplos de Bloqueios Úteis

### **Fins de Semana**
```
Tipo: Bloqueado
Período: Dia da Semana
Dia: Sábado
Horário: 00:00 - 23:59
Motivo: Não há atendimento aos finais de semana
```

### **Feriados Nacionais 2025**
```
01/01 - Ano Novo
21/04 - Tiradentes
01/05 - Dia do Trabalho
07/09 - Independência
12/10 - Nossa Senhora Aparecida
02/11 - Finados
15/11 - Proclamação da República
20/11 - Consciência Negra
25/12 - Natal
```

### **Recesso Acadêmico**
```
Tipo: Bloqueado
Período: Data Específica
Data: Cada dia do recesso (ex: 20/12 a 05/01)
Motivo: Recesso de final de ano
```

---

## 🆘 Solução de Problemas

### Problema: Mensagem não aparece

**Verificar**:
1. Deploy foi feito? (aguardar 1-2 min)
2. Cache do browser? (Ctrl+Shift+R para hard refresh)
3. Console mostra logs? (F12 → Console)

### Problema: Dia bloqueado ainda mostra horários

**Causa**: Bloqueio não cobre o horário completo

**Solução**: Criar bloqueio 00:00 - 23:59

### Problema: Erro 500 ao criar bloqueio

**Solução**: Executar SQL de correção de permissões (FIX_RLS_PERMISSIONS.sql)

---

## 📱 Responsividade

A mensagem de bloqueio é **100% responsiva**:
- ✅ Desktop: Mensagem centralizada com ícone grande
- ✅ Tablet: Texto ajustado
- ✅ Mobile: Layout adaptado, texto legível

---

## 🎉 Resultado Final

Quando tudo estiver funcionando:

1. ✅ Coordenador cria bloqueios facilmente
2. ✅ Usuário vê mensagem clara quando dia bloqueado
3. ✅ Usuário não perde tempo tentando agendar em dia bloqueado
4. ✅ Sistema intuitivo e profissional
5. ✅ Melhor experiência para todos

**Sistema 100% funcional! 🚀**
