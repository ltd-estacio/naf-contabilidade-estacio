# 🚀 SOLUÇÃO RÁPIDA - Erro no Painel de Disponibilidade

## ⚠️ O Problema

Você está vendo este erro ao tentar criar/editar horários no painel do coordenador:

```
POST https://naf.ltdestacio.com.br/api/scheduling/availability
500 (Internal Server Error)
```

**Causa**: As tabelas do banco de dados ainda não foram criadas.

---

## ✅ SOLUÇÃO EM 3 PASSOS (2 minutos)

### 📍 PASSO 1: Abrir Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Faça login (se necessário)
3. Selecione o projeto **NAF Contabilidade**
4. No menu lateral esquerdo → clique em **"SQL Editor"**
5. Clique no botão **"+ New query"**

---

### 📍 PASSO 2: Copiar e Colar o SQL

1. **Abra o arquivo**: `database/migrations/EXECUTAR_AGORA.sql`

2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

3. **Cole no SQL Editor do Supabase** (Ctrl+V)

4. **Clique no botão verde "RUN"** (ou pressione Ctrl+Enter)

5. **Aguarde 5-10 segundos**

6. **Verifique a mensagem de sucesso**:
   ```
   ✅ Sistema de disponibilidade criado com sucesso!
   📊 Tabelas: scheduling_availability, scheduling_settings
   🔧 Funções: check_time_slot_availability(), get_available_time_slots()
   🔒 Políticas RLS configuradas
   
   👉 Próximo passo: Acessar o painel do coordenador e criar disponibilidades!
   ```

---

### 📍 PASSO 3: Testar no Painel

1. **Volte para o site**: https://naf.ltdestacio.com.br

2. **Faça login como coordenador**

3. **Vá para a aba "Disponibilidade"**

4. **Clique em "+ Nova Configuração"**

5. **Preencha o formulário**:
   ```
   Tipo: Disponível
   Período: Dia da Semana (Recorrente)
   Dia da Semana: Segunda-feira
   Hora Início: 08:00
   Hora Fim: 12:00
   Máximo de Atendimentos: 3
   ```

6. **Clique em "Criar"**

7. **Deve aparecer**: ✅ "Configuração criada com sucesso!"

---

## 🎯 Configuração Recomendada

Depois que funcionar, crie estas configurações:

### ✅ Disponibilidades (Segunda a Sexta)

**Manhã - Segunda a Sexta**
- Tipo: Disponível
- Período: Dia da Semana
- Dias: Segunda (criar 1), Terça (criar outra), Quarta, Quinta, Sexta
- Horário: 08:00 - 12:00
- Máximo: 3 atendimentos

**Tarde - Segunda a Sexta**
- Tipo: Disponível
- Período: Dia da Semana
- Dias: Segunda (criar 1), Terça (criar outra), Quarta, Quinta, Sexta
- Horário: 13:00 - 17:00
- Máximo: 3 atendimentos

### 🚫 Bloqueios

**Fim de Semana**
- Sábado: 00:00 - 23:59 (Bloqueado - Final de semana)
- Domingo: 00:00 - 23:59 (Bloqueado - Final de semana)

**Feriados 2025**
- 01/01/2025 - Ano Novo
- 21/04/2025 - Tiradentes
- 01/05/2025 - Dia do Trabalho
- 07/09/2025 - Independência
- 12/10/2025 - Nossa Senhora
- 02/11/2025 - Finados
- 15/11/2025 - Proclamação da República
- 20/11/2025 - Consciência Negra
- 25/12/2025 - Natal

---

## 🔍 Verificar se Deu Certo

### Método 1: Pelo Painel
- Acessar "Disponibilidade"
- Ver lista de horários disponíveis e bloqueados
- Conseguir criar, editar e excluir

### Método 2: Pelo SQL (Supabase)

Execute no SQL Editor:

```sql
-- Ver todas as disponibilidades criadas
SELECT * FROM scheduling_availability;

-- Ver configurações
SELECT * FROM scheduling_settings;

-- Testar função de horários disponíveis (exemplo para hoje)
SELECT * FROM get_available_time_slots(CURRENT_DATE);
```

---

## ❌ Se Ainda Não Funcionar

### Erro: "relation does not exist"

**Solução**: Execute o SQL novamente, pode ser que não tenha rodado completamente.

### Erro: "permission denied"

**Solução**: No SQL Editor, execute:

```sql
ALTER TABLE scheduling_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings DISABLE ROW LEVEL SECURITY;
```

### Erro: "null value in column"

**Causa**: Não preencheu todos os campos obrigatórios

**Solução**: Sempre preencher:
- Tipo (Disponível/Bloqueado)
- Período (Data Específica OU Dia da Semana)
- Hora Início e Hora Fim

---

## 📞 Precisa de Ajuda?

Me envie:
1. Screenshot do erro
2. Logs do console (F12 → Console)
3. Resposta do Network tab (F12 → Network → scheduling/availability)

---

## 📚 Arquivos Relacionados

- **SQL para executar**: `database/migrations/EXECUTAR_AGORA.sql`
- **Documentação completa**: `doc/CORRIGIR_ERRO_DISPONIBILIDADE.md`
- **Sistema original**: `database/migrations/20250127_criar_tabela_disponibilidade_agendamentos.sql`

---

## ✨ Resumo

| Etapa | O que fazer | Status |
|-------|-------------|--------|
| 1️⃣ | Abrir Supabase SQL Editor | ⏳ |
| 2️⃣ | Copiar e executar `EXECUTAR_AGORA.sql` | ⏳ |
| 3️⃣ | Testar criar disponibilidade no painel | ⏳ |
| 4️⃣ | Configurar horários de atendimento | ⏳ |
| 5️⃣ | Bloquear fins de semana e feriados | ⏳ |

**Tempo estimado**: 5-10 minutos

---

## 🎉 Depois de Funcionar

O sistema de agendamento estará **100% funcional**:

✅ Coordenador pode gerenciar horários disponíveis  
✅ Coordenador pode bloquear datas específicas  
✅ Usuários veem apenas horários disponíveis  
✅ Sistema respeita bloqueios e limites de vagas  
✅ Calendário mostra horários em tempo real  

**Tudo funcionando perfeitamente! 🚀**
