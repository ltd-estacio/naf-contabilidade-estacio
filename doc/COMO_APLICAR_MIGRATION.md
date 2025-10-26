# 🔧 INSTRUÇÕES: Como Aplicar a Migration

## ⚡ Método Rápido (Recomendado)

### Passo 1: Abrir o Arquivo SQL
1. No VS Code, abra: `src/sql/add_attendance_fields_to_notes.sql`
2. Selecione TODO o conteúdo (`Cmd+A` ou `Ctrl+A`)
3. Copie (`Cmd+C` ou `Ctrl+C`)

### Passo 2: Acessar Supabase Dashboard
1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login (se necessário)
4. Selecione o projeto **NAF Contabilidade**

### Passo 3: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone `</>`)
2. Clique no botão **"New Query"** (canto superior direito)
3. Uma nova query em branco será aberta

### Passo 4: Executar Migration
1. Cole o SQL copiado (`Cmd+V` ou `Ctrl+V`)
2. Clique no botão **"Run"** (canto inferior direito) ou pressione `F5`
3. Aguarde alguns segundos

### Passo 5: Verificar Sucesso
Você deve ver mensagens como:
```
✅ Campos de registro de atendimento adicionados com sucesso!
   - note_type: Tipo da anotação
   - step_by_step: Passo a passo do atendimento
   - stages: Etapas do processo
   - summary: Resumo objetivo
```

### Passo 6: Confirmar Alterações
Execute esta query para verificar os novos campos:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fiscal_appointment_notes'
AND column_name IN ('note_type', 'step_by_step', 'stages', 'summary')
ORDER BY column_name;
```

Resultado esperado:
```
column_name   | data_type | is_nullable
--------------+-----------+------------
note_type     | text      | YES
stages        | text      | YES
step_by_step  | text      | YES
summary       | text      | YES
```

---

## 🎯 Pronto! Agora você pode:

1. **Rodar o projeto**: `npm run dev`
2. **Fazer login como estudante**
3. **Ir em "Meus Atendimentos Fiscais"**
4. **Clicar em "Iniciar Atendimento"**
5. **Ver o pop-up aparecer! 🎉**

---

## ❌ Solução de Problemas

### Erro: "relation does not exist"
**Causa**: Tabela `fiscal_appointment_notes` não existe
**Solução**: Execute primeiro:
```sql
-- No SQL Editor do Supabase
\i src/sql/create_fiscal_appointment_notes.sql
```

### Erro: "column already exists"
**Causa**: Migration já foi aplicada anteriormente
**Solução**: Tudo certo! Pode ignorar este erro.

### Erro de Permissão
**Causa**: Usuário não tem permissão para alterar schema
**Solução**: Use a Service Role Key ou acesse como admin

---

## 📋 Checklist Final

- [ ] Arquivo SQL copiado
- [ ] Supabase Dashboard acessado
- [ ] SQL Editor aberto
- [ ] Migration executada (Run)
- [ ] Mensagem de sucesso visualizada
- [ ] Campos confirmados na tabela
- [ ] Projeto rodando (`npm run dev`)
- [ ] Pop-up testado com sucesso

---

## 🆘 Precisa de Ajuda?

1. Verifique se você está usando a **conta correta** no Supabase
2. Confirme que está no **projeto correto** (NAF Contabilidade)
3. Tente executar a query em **partes menores**
4. Consulte a documentação completa em `doc/POPUP_REGISTRO_ATENDIMENTO.md`

---

**Tempo estimado**: 2-3 minutos
**Dificuldade**: ⭐ Fácil
