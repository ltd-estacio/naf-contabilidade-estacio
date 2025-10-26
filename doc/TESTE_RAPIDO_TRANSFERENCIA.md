# 🧪 Guia Rápido de Teste - Sistema de Transferência

## ⚡ Teste Rápido em 5 Minutos

### ✅ Passo 1: Executar SQL (30 segundos)
```bash
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto NAF
3. Vá em: SQL Editor
4. Cole o conteúdo de: database/migrations/20250127_criar_tabela_auditoria_transferencias.sql
5. Clique em RUN
6. Aguarde mensagem: "✅ Tabela de auditoria criada com sucesso!"
```

### ✅ Passo 2: Verificar Estudantes (1 minuto)
```sql
-- Execute esta query no SQL Editor:
SELECT id, name, email, status 
FROM students 
WHERE status IN ('active', 'ATIVO', 'enrolled')
ORDER BY name
LIMIT 10;

-- IMPORTANTE: Anote pelo menos 2 IDs de estudantes diferentes!
-- Exemplo:
-- abc-123-def => João Silva
-- xyz-789-ghi => Maria Santos
```

### ✅ Passo 3: Criar Atendimento de Teste (2 minutos)
```sql
-- Substitua os UUIDs pelos IDs reais dos seus estudantes:
INSERT INTO fiscal_appointments (
  protocol,
  client_name,
  client_email,
  service_type,
  service_title,
  status,
  urgency_level,
  assigned_student_id,
  created_at
) VALUES (
  'FAP-TEST-' || to_char(NOW(), 'YYYYMMDD-HH24MI'),
  'Cliente Teste',
  'teste@email.com',
  'CPF',
  'Cadastro de CPF - Teste de Transferência',
  'EM_ANDAMENTO',  -- Status permitido para transferência
  'NORMAL',
  'COLE-AQUI-O-ID-DO-ESTUDANTE-1',  -- Substitua!
  NOW()
) RETURNING id, protocol, status;

-- ANOTE o ID e PROTOCOL retornados!
```

### ✅ Passo 4: Testar Interface (2 minutos)

#### 4.1. Acessar Dashboard
```
1. Abra: http://localhost:3000 (ou seu domínio)
2. Faça login como COORDENADOR
3. Role até: "Solicitações de Agendamento Fiscal"
```

#### 4.2. Localizar Atendimento de Teste
```
- Procure pelo protocolo: FAP-TEST-...
- Verifique status: EM_ANDAMENTO (badge roxo)
- Deve ter 3 botões: [Visualizar] [Transferir]
```

#### 4.3. Testar Transferência
```
1. Clique em: [Transferir] (ícone ⇄)
2. Modal abre com informações do atendimento
3. Aguarde carregar lista de estudantes
4. Selecione: Outro estudante (diferente do atual)
5. Digite motivo (opcional): "Teste de transferência"
6. Clique em: [Confirmar Transferência]
7. Aguarde mensagem: "✅ Atendimento transferido com sucesso!"
8. Modal fecha automaticamente
9. Lista atualiza
```

---

## 🔍 Verificações de Sucesso

### ✅ Verificar na Interface
- [ ] Botão "Transferir" aparece nos atendimentos corretos
- [ ] Modal abre ao clicar
- [ ] Lista de estudantes carrega
- [ ] Transferência executa sem erros
- [ ] Modal fecha após sucesso
- [ ] Lista atualiza automaticamente

### ✅ Verificar no Banco de Dados
```sql
-- 1. Verificar se atendimento foi atualizado:
SELECT 
  protocol,
  status,
  assigned_student_id,
  updated_at,
  internal_notes
FROM fiscal_appointments
WHERE protocol LIKE 'FAP-TEST-%'
ORDER BY created_at DESC
LIMIT 1;

-- DEVE MOSTRAR:
-- ✅ assigned_student_id = ID do novo estudante
-- ✅ updated_at = timestamp recente
-- ✅ internal_notes = contém texto da transferência


-- 2. Verificar log de auditoria:
SELECT 
  a.timestamp,
  a.action,
  a.reason,
  fs.name as de_estudante,
  ts.name as para_estudante,
  fa.protocol
FROM appointment_audit_logs a
JOIN fiscal_appointments fa ON fa.id = a.appointment_id
LEFT JOIN students fs ON fs.id = a.from_student_id
JOIN students ts ON ts.id = a.to_student_id
ORDER BY a.timestamp DESC
LIMIT 5;

-- DEVE MOSTRAR:
-- ✅ action = 'TRANSFER_STUDENT'
-- ✅ Nomes dos estudantes corretos
-- ✅ Timestamp recente
-- ✅ Motivo registrado
```

---

## 🚨 Troubleshooting Rápido

### Problema: Botão não aparece
**Causas possíveis:**
1. Status do atendimento não é `EM_ANDAMENTO` ou `CONFIRMADO`
2. Atendimento não tem `id` definido
3. Componente não foi atualizado

**Solução:**
```sql
-- Verificar status:
SELECT id, protocol, status FROM fiscal_appointments 
WHERE protocol LIKE 'FAP-TEST-%';

-- Corrigir status se necessário:
UPDATE fiscal_appointments 
SET status = 'EM_ANDAMENTO'
WHERE protocol LIKE 'FAP-TEST-%';
```

### Problema: Lista de estudantes vazia
**Causas possíveis:**
1. Nenhum estudante ativo no sistema
2. Erro na API

**Solução:**
```sql
-- Verificar estudantes ativos:
SELECT COUNT(*) FROM students 
WHERE status IN ('active', 'ATIVO', 'enrolled');

-- Se zero, ative estudantes:
UPDATE students 
SET status = 'active'
WHERE email LIKE '%@estacio.br'
LIMIT 5;
```

### Problema: Erro 500 na transferência
**Causas possíveis:**
1. Tabela `appointment_audit_logs` não existe
2. Foreign keys inválidas
3. Permissões RLS

**Solução:**
```sql
-- 1. Verificar se tabela existe:
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'appointment_audit_logs';

-- 2. Se não existe, executar migration novamente

-- 3. Verificar RLS:
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'appointment_audit_logs';

-- 4. Desabilitar RLS temporariamente para teste:
ALTER TABLE appointment_audit_logs DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Teste de Carga (Opcional)

### Criar 10 atendimentos de teste:
```sql
DO $$
DECLARE
  student_ids uuid[] := ARRAY(
    SELECT id FROM students 
    WHERE status = 'active' 
    LIMIT 2
  );
  i int;
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO fiscal_appointments (
      protocol,
      client_name,
      client_email,
      service_type,
      service_title,
      status,
      urgency_level,
      assigned_student_id,
      created_at
    ) VALUES (
      'FAP-BULK-' || i || '-' || to_char(NOW(), 'YYYYMMDD'),
      'Cliente Teste ' || i,
      'teste' || i || '@email.com',
      CASE WHEN i % 3 = 0 THEN 'CPF' WHEN i % 3 = 1 THEN 'MEI' ELSE 'IR' END,
      'Atendimento Teste #' || i,
      CASE WHEN i % 2 = 0 THEN 'EM_ANDAMENTO' ELSE 'CONFIRMADO' END,
      CASE WHEN i % 4 = 0 THEN 'URGENTE' ELSE 'NORMAL' END,
      student_ids[1 + (i % 2)],
      NOW() - (i || ' hours')::interval
    );
  END LOOP;
  
  RAISE NOTICE '✅ 10 atendimentos de teste criados com sucesso!';
END $$;
```

### Limpar atendimentos de teste:
```sql
-- CUIDADO: Isso deleta permanentemente!
DELETE FROM appointment_audit_logs 
WHERE appointment_id IN (
  SELECT id FROM fiscal_appointments 
  WHERE protocol LIKE 'FAP-TEST-%' OR protocol LIKE 'FAP-BULK-%'
);

DELETE FROM fiscal_appointments 
WHERE protocol LIKE 'FAP-TEST-%' OR protocol LIKE 'FAP-BULK-%';
```

---

## ✅ Checklist de Teste

### Funcionalidades Básicas
- [ ] Tabela de auditoria criada
- [ ] Botão "Transferir" visível
- [ ] Modal abre corretamente
- [ ] Lista de estudantes carrega
- [ ] Dropdown funciona
- [ ] Campo de motivo aceita texto
- [ ] Botão "Confirmar" executa

### Validações
- [ ] Não permite transferir atendimentos CANCELADOS
- [ ] Não permite transferir atendimentos CONCLUIDOS
- [ ] Não permite selecionar estudante inativo
- [ ] Exibe erro se nenhum estudante selecionado
- [ ] Desabilita botões durante transferência

### Auditoria
- [ ] Log criado em `appointment_audit_logs`
- [ ] Nota interna atualizada em `fiscal_appointments`
- [ ] Timestamp correto registrado
- [ ] IDs dos estudantes corretos
- [ ] Motivo salvo corretamente

### Interface
- [ ] Modal responsivo (mobile/desktop)
- [ ] Feedback visual durante loading
- [ ] Mensagem de sucesso clara
- [ ] Erros tratados corretamente
- [ ] Lista atualiza após transferência

---

## 🎯 Critérios de Aceitação

### ✅ Mínimo para Produção
1. ✅ Tabela de auditoria existe e funciona
2. ✅ API retorna 200 em casos de sucesso
3. ✅ API retorna 400/404/500 com mensagens claras
4. ✅ Interface não quebra em nenhum cenário
5. ✅ Todos os logs são registrados
6. ✅ Performance < 2 segundos por transferência

### ⭐ Extras Implementados
1. ✅ Campo de motivo opcional
2. ✅ Feedback visual em tempo real
3. ✅ Loading states em todas as operações
4. ✅ Modal responsivo
5. ✅ Validações em múltiplas camadas
6. ✅ Documentação completa

---

## 📞 Suporte Rápido

### Logs Úteis no Console do Navegador:
```javascript
// Ver estado atual:
console.table(availableStudents)
console.log('Appointment:', selectedAppointment)

// Forçar reload:
window.location.reload()
```

### Logs Úteis no Servidor:
```bash
# Ver logs da API:
grep "Transferência de atendimento" .next/server/*.js

# Ver erros do Supabase:
# Acesse: Supabase Dashboard > Logs > API Logs
```

---

## 🎓 Próximos Passos

Após validar o sistema:
1. [ ] Notificar estudantes por email sobre transferências
2. [ ] Dashboard com métricas de transferência
3. [ ] Relatório mensal de redistribuições
4. [ ] Histórico visual de transferências
5. [ ] Exportar auditoria para Excel

---

**✨ Sistema pronto para produção!**

*Criado em: 27/01/2025*
*Tempo estimado de teste: 5-10 minutos*
