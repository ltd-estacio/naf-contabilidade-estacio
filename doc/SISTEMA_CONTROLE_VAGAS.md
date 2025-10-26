# 🎯 Sistema de Controle de Vagas - Documentação

## 📋 Funcionalidade Implementada

O sistema agora **controla automaticamente as vagas disponíveis** para cada horário, evitando que dois ou mais usuários agendem no mesmo horário, a menos que o coordenador tenha configurado múltiplas vagas.

---

## 🔧 Como Funciona

### 1️⃣ Coordenador Configura Vagas

O coordenador pode definir **quantos atendimentos simultâneos** são permitidos em cada horário:

```
Exemplo 1: Segunda-feira 08:00-12:00
- Máximo de Atendimentos: 1
- Apenas 1 pessoa pode agendar cada horário

Exemplo 2: Terça-feira 14:00-17:00
- Máximo de Atendimentos: 3
- Até 3 pessoas podem agendar o mesmo horário
```

### 2️⃣ Sistema Verifica Vagas em Tempo Real

Quando um usuário seleciona uma data no calendário:

1. **Busca configurações** do coordenador para aquele dia
2. **Conta agendamentos** já existentes para cada horário
3. **Calcula vagas restantes** = Máximo configurado - Agendamentos existentes
4. **Mostra apenas horários** com vagas disponíveis

### 3️⃣ Visual para o Usuário

**🟦 Horário com Muitas Vagas (≥2)**
```
┌─────────┐
│ 08:00   │  ← Borda azul
│ 3 vagas │  ← Texto normal
└─────────┘
```

**🟨 Horário com Última Vaga**
```
┌─────────────┐
│   10:30     │  ← Borda amarela
│⚠️ Última vaga!│  ← Alerta
└─────────────┘
```

**⬜ Horário Ocupado (0 vagas)**
```
┌─────────┐
│ 14:00   │  ← Cinza claro, desabilitado
│🚫 Ocupado│  ← Não clicável
└─────────┘
```

---

## 🧪 Como Testar

### Teste 1: Limite de 1 Vaga (Padrão)

#### **Passo 1: Criar Disponibilidade**
```
Coordenador → Disponibilidade → Nova Configuração
- Tipo: Disponível
- Período: Dia da Semana
- Dia: Terça-feira
- Horário: 10:00 - 11:00
- Máximo de Atendimentos: 1  ← IMPORTANTE
```

#### **Passo 2: Primeiro Usuário Agenda**
```
Usuário A → Agendamento
- Seleciona: Terça-feira próxima
- Horário visível: [10:00] [10:30] (ambos com "1 vaga")
- Seleciona: 10:30
- Confirma agendamento
```

#### **Passo 3: Segundo Usuário Tenta Agendar**
```
Usuário B → Agendamento
- Seleciona: Mesma terça-feira
- Horário 10:30: 🚫 Ocupado (cinza, não clicável)
- Horário 10:00: [10:00] (ainda disponível com "1 vaga")
```

**✅ Resultado Esperado**: 
- 10:30 está **bloqueado** para Usuário B
- 10:00 ainda está **disponível**

---

### Teste 2: Múltiplas Vagas (3 vagas)

#### **Passo 1: Criar Disponibilidade com 3 Vagas**
```
Coordenador → Disponibilidade → Nova Configuração
- Tipo: Disponível
- Período: Dia da Semana
- Dia: Quarta-feira
- Horário: 14:00 - 16:00
- Máximo de Atendimentos: 3  ← 3 VAGAS!
```

#### **Passo 2: Primeiro Usuário Agenda**
```
Usuário A → 14:30
Horário mostra: "3 vagas" → depois do agendamento → "2 vagas"
```

#### **Passo 3: Segundo Usuário Agenda**
```
Usuário B → 14:30 (mesmo horário!)
Horário mostra: "2 vagas" → depois do agendamento → "⚠️ Última vaga!"
```

#### **Passo 4: Terceiro Usuário Agenda**
```
Usuário C → 14:30 (mesmo horário!)
Horário mostra: "⚠️ Última vaga!" → depois do agendamento → 🚫 Ocupado
```

#### **Passo 5: Quarto Usuário NÃO Consegue**
```
Usuário D → 14:30
Horário aparece: 🚫 Ocupado (cinza, desabilitado)
```

**✅ Resultado Esperado**: 
- Primeiros 3 usuários conseguem agendar
- Quarto usuário vê horário bloqueado

---

## 📊 Lógica Interna

### Cálculo de Vagas

```javascript
// Para cada horário:
const maxSlots = config.max_appointments || 1  // Configurado pelo coordenador
const appointmentsAtTime = agendamentosExistentes.filter(
  app => app.preferred_time === '10:30'
).length

const slotsRemaining = maxSlots - appointmentsAtTime

// Resultado:
if (slotsRemaining > 0) {
  // Horário disponível
  is_available = true
} else {
  // Horário ocupado
  is_available = false
}
```

### Status do Horário

| Vagas Restantes | Visual | Clicável? | Cor |
|----------------|--------|-----------|-----|
| 3+ vagas | "3 vagas" | ✅ Sim | Azul |
| 2 vagas | "2 vagas" | ✅ Sim | Azul |
| 1 vaga | "⚠️ Última vaga!" | ✅ Sim | Amarelo |
| 0 vagas | "🚫 Ocupado" | ❌ Não | Cinza |

---

## 🎨 Estilos Visuais

### Azul - Vagas Disponíveis (2+)
```css
background: white
border: 2px solid blue
text: blue
hover: light blue background
```

### Amarelo - Última Vaga
```css
background: light amber
border: 2px solid amber
text: amber-700
hover: darker amber
icon: ⚠️
```

### Cinza - Ocupado
```css
background: gray-100
text: gray-400
cursor: not-allowed
opacity: 50%
icon: 🚫
```

---

## 🔄 Fluxo Completo

```
1. Coordenador cria disponibilidade
   ↓
   Define: Quarta-feira 14:00-16:00, max 3 vagas
   
2. Sistema gera slots de 30min
   ↓
   14:00, 14:30, 15:00, 15:30 (todos com 3 vagas)
   
3. Usuário A agenda 14:30
   ↓
   Sistema: 14:30 agora tem 2 vagas
   
4. Usuário B vê calendário
   ↓
   14:30 mostra "2 vagas" (ainda disponível)
   
5. Usuário B agenda 14:30
   ↓
   Sistema: 14:30 agora tem 1 vaga (⚠️ Última vaga!)
   
6. Usuário C vê calendário
   ↓
   14:30 mostra "⚠️ Última vaga!" (alerta amarelo)
   
7. Usuário C agenda 14:30
   ↓
   Sistema: 14:30 agora tem 0 vagas (🚫 Ocupado)
   
8. Usuário D vê calendário
   ↓
   14:30 aparece cinza, desabilitado, "🚫 Ocupado"
   
9. Usuário D não consegue agendar neste horário
   ↓
   Precisa escolher outro horário disponível
```

---

## 🆘 Solução de Problemas

### Problema: Horário deveria estar disponível mas está bloqueado

**Verificar**:
1. Quantos agendamentos existem para aquele horário?
   ```sql
   SELECT * FROM fiscal_appointments 
   WHERE preferred_date = '2025-10-29' 
     AND preferred_time = '10:30'
     AND status IN ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO')
     AND is_deleted = false;
   ```

2. Qual é o limite de vagas configurado?
   ```sql
   SELECT * FROM scheduling_availability
   WHERE day_of_week = 2  -- Terça-feira
     AND type = 'available'
     AND is_active = true;
   ```

3. Console do browser (F12) mostra:
   ```
   ⏰ 10:30: 3/3 ocupados, 0 restantes
   ```

**Solução**: 
- Se limite está em 1 mas deveria ser 3: Editar configuração
- Se agendamentos cancelados não estão sendo contados: Verificar status

---

### Problema: Limite não está sendo respeitado

**Causa**: Agendamentos antigos com status errado

**Solução**: Atualizar status dos agendamentos:
```sql
-- Cancelar agendamentos muito antigos
UPDATE fiscal_appointments
SET status = 'CANCELADO'
WHERE preferred_date < CURRENT_DATE - INTERVAL '7 days'
  AND status = 'PENDENTE';
```

---

## 📝 API Criada

### `GET /api/scheduling/check-slots?date=YYYY-MM-DD`

**Resposta** quando disponível:
```json
{
  "isBlocked": false,
  "timeSlots": [
    {
      "time": "10:30",
      "is_available": true,
      "slots_remaining": 2,
      "reason": null,
      "max_appointments": 3,
      "current_appointments": 1
    }
  ]
}
```

**Resposta** quando bloqueado:
```json
{
  "isBlocked": true,
  "reason": "Feriado Nacional",
  "timeSlots": []
}
```

**Resposta** quando totalmente ocupado:
```json
{
  "isBlocked": true,
  "reason": "Todos os horários deste dia já estão ocupados. Por favor, selecione outra data.",
  "timeSlots": []
}
```

---

## ✅ Checklist de Funcionalidades

- [x] Coordenador pode definir máximo de vagas por horário
- [x] Sistema conta agendamentos existentes
- [x] Calcula vagas restantes em tempo real
- [x] Mostra apenas horários com vagas disponíveis
- [x] Visual diferente para última vaga (amarelo)
- [x] Horários ocupados aparecem desabilitados
- [x] Mensagem clara quando dia totalmente ocupado
- [x] Logs detalhados para debug
- [x] API específica para verificação de slots
- [x] Considera apenas agendamentos ativos (não cancelados)

---

## 🎯 Casos de Uso

### Caso 1: Atendimento Individual (Padrão)
```
Max: 1 vaga por horário
Uso: Atendimentos personalizados, consultas individuais
```

### Caso 2: Atendimento em Grupo
```
Max: 3-5 vagas por horário
Uso: Workshops, palestras, atendimentos coletivos
```

### Caso 3: Evento Grande
```
Max: 10+ vagas por horário
Uso: Seminários, eventos comunitários
```

---

## 🚀 Resultado Final

**Sistema profissional e completo!**

✅ Evita conflitos de horário
✅ Permite atendimentos simultâneos quando configurado
✅ Visual intuitivo para o usuário
✅ Coordenador tem controle total
✅ Experiência otimizada
✅ Zero sobrecarga manual

**Agendamentos organizados e eficientes! 🎉**
