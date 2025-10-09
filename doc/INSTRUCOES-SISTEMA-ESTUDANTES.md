# 📋 Sistema de Gestão de Estudantes - Instruções Completas

## ✅ O que foi implementado

### 1. **Mapeamento de Semestres por Curso**
- Arquivo criado: `/src/config/courseDurations.ts`
- Cursos da Estácio mapeados com suas durações reais:
  - **Bacharelados**: 8 semestres (Administração, Economia, etc.)
  - **Engenharias**: 10 semestres
  - **Licenciaturas**: 8 semestres
  - **Tecnólogos**: 4-5 semestres
- Sistema detecta automaticamente quando um aluno está no último semestre

### 2. **Atualização do Cadastro de Estudantes** (`/student-register`)
- ✅ Semestres dinâmicos: ao selecionar um curso, aparece apenas os semestres válidos para aquele curso
- ✅ Registro automático do ano e semestre de entrada (ex: 1º Semestre de 2025)
- ✅ Informação visual da duração do curso (ex: "Bacharelado - Duração: 8 semestres (4 anos)")

### 3. **Painel do Coordenador - Performance dos Estudantes** (`/coordinator-dashboard`)
Funcionalidades implementadas:

#### 🔍 **Ver Perfil**
- Modal com informações completas do estudante
- Estatísticas detalhadas:
  - Total de atendimentos
  - Atendimentos concluídos
  - Avaliação média dos clientes
  - Treinamentos concluídos
- Histórico de atendimentos recentes

#### 📧 **Contatar**
- Envio de email direto para o estudante
- Template pré-configurado
- Abre cliente de email padrão do sistema

#### 📄 **Relatórios**
- Geração de relatório completo em formato TXT
- Inclui todas as estatísticas e histórico
- Download automático

#### 🗑️ **Remover Estudante**
- Remoção com motivo
- Detecta automaticamente alunos no último semestre
- Opção de marcar como "Graduado"
- Preserva histórico de atendimentos

#### 🎓 **Verificar Graduados**
- Botão para executar verificação automática
- Marca estudantes que já deveriam ter se formado
- Atualiza status automaticamente

#### 📥 **Exportar Lista**
- Exportação para CSV
- Inclui todos os estudantes ativos

### 4. **APIs Criadas**

#### `/api/students/list` (GET)
Lista todos os estudantes com estatísticas completas

#### `/api/students/[id]/profile` (GET)
Retorna perfil detalhado de um estudante

#### `/api/students/remove` (POST)
Remove (marca como INATIVO) um estudante

#### `/api/students/graduation/check` (POST)
Executa verificação automática de estudantes graduados

---

## 🛠️ Como Aplicar as Atualizações

### Passo 1: Atualizar o Banco de Dados

Execute o SQL de atualização do schema no Supabase:

```bash
# Acesse o SQL Editor do Supabase e execute o arquivo:
src/sql/update-students-graduation-tracking.sql
```

Este SQL irá:
- Adicionar campos `registration_year` e `registration_semester`
- Adicionar campos `is_graduated` e `graduation_date`
- Criar função `check_and_mark_graduated_students()`
- Criar view `students_near_graduation`

### Passo 2: Rodar o Servidor

```bash
npm run dev
```

---

## 🧪 Como Testar

### Teste 1: Cadastro de Estudantes com Semestres Dinâmicos

1. Acesse: `http://localhost:4000/student-register`
2. No campo **Curso**, selecione "Engenharia Civil"
   - ✅ Deve mostrar opções de 1º até 10º Semestre
   - ✅ Deve mostrar "Bacharelado - Duração: 10 semestres (5 anos)"
3. Mude para "Gestão Financeira"
   - ✅ Deve mostrar opções de 1º até 4º Semestre
   - ✅ Deve mostrar "Tecnólogo - Duração: 4 semestres (2 anos)"
4. Preencha o formulário e crie um estudante
5. Verifique que o cadastro foi criado com sucesso

### Teste 2: Ver Perfil de Estudante

1. Faça login como coordenador: `http://localhost:4000/coordinator-dashboard`
2. Vá para a seção "Performance dos Estudantes"
3. Clique em **"Ver Perfil"** em qualquer estudante
4. Verificar que aparecem:
   - ✅ Nome, email, telefone, curso
   - ✅ Estatísticas (atendimentos, avaliação, treinamentos)
   - ✅ Atendimentos recentes

### Teste 3: Contatar Estudante

1. No painel do coordenador, clique em **"Contatar"** em um estudante
2. ✅ Deve abrir modal com campo de mensagem
3. Digite uma mensagem de teste
4. Clique em **"Enviar Email"**
5. ✅ Deve abrir o cliente de email padrão com:
   - Destinatário preenchido
   - Assunto: "Contato do NAF - Estácio"
   - Mensagem preenchida

### Teste 4: Gerar Relatório

1. Clique em **"Relatórios"** em um estudante
2. ✅ Deve abrir modal com preview das estatísticas
3. Clique em **"Baixar Relatório"**
4. ✅ Deve baixar arquivo `.txt` com relatório completo

### Teste 5: Remover Estudante

1. Clique em **"Remover"** em um estudante
2. ✅ Deve abrir modal de confirmação
3. Digite um motivo (opcional)
4. Se o estudante estiver no último semestre:
   - ✅ Deve aparecer opção "Marcar como graduado"
5. Clique em **"Confirmar Remoção"**
6. ✅ Estudante deve sumir da lista de ativos
7. ✅ Histórico de atendimentos deve ser preservado

### Teste 6: Verificar Estudantes Graduados

1. No painel do coordenador, clique em **"Verificar Graduados"**
2. ✅ Sistema deve processar todos os estudantes
3. ✅ Estudantes no último semestre que já passaram do prazo devem ser marcados como graduados
4. ✅ Deve mostrar quantos foram processados

### Teste 7: Exportar Lista

1. Clique em **"Exportar Lista"**
2. ✅ Deve baixar arquivo CSV com lista de todos os estudantes

---

## 🔍 Verificação de Erros Comuns

### Erro: "Campo registration_year não encontrado"
**Solução**: Execute o SQL de atualização do schema no Supabase

### Erro: "Módulo courseDurations não encontrado"
**Solução**: Verifique se o arquivo `/src/config/courseDurations.ts` existe

### Erro: API retorna 500
**Solução**:
1. Verifique se as variáveis de ambiente do Supabase estão configuradas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   SUPABASE_SERVICE_ROLE_KEY=sua_chave
   ```
2. Verifique se o SQL foi executado corretamente

---

## 📊 Estrutura dos Arquivos Criados/Modificados

### Novos Arquivos
```
/src/config/courseDurations.ts
/src/sql/update-students-graduation-tracking.sql
/src/components/coordinator/StudentsPerformancePanel.tsx
/src/app/api/students/list/route.ts
/src/app/api/students/[id]/profile/route.ts
/src/app/api/students/remove/route.ts
/src/app/api/students/graduation/check/route.ts
```

### Arquivos Modificados
```
/src/app/student-register/page.tsx
/src/app/api/students/register/route.ts
/src/app/coordinator-dashboard/page.tsx
```

---

## 🎯 Funcionalidades Principais

### Sistema Inteligente de Graduação
- Detecta automaticamente quando um estudante deveria ter se formado
- Considera:
  - Ano de cadastro
  - Semestre de cadastro (1º ou 2º)
  - Duração do curso
  - Semestre atual do estudante

### Exemplo de Cálculo
```
Estudante: João Silva
Curso: Engenharia Civil (10 semestres)
Cadastro: 1º Semestre de 2021
Semestre Atual: 10º Semestre

Cálculo:
- Entrada: Janeiro 2021
- Duração: 5 anos
- Formatura esperada: Junho 2026

Hoje é: Outubro 2025
Status: ✅ Ainda cursando (falta 1 semestre)
```

---

## 📝 Notas Importantes

1. **Preservação de Dados**: Ao remover um estudante, ele é marcado como INATIVO mas todos os dados e histórico são preservados

2. **Verificação Automática**: Pode ser executada manualmente ou agendada para rodar periodicamente

3. **Semestres Dinâmicos**: A lista de semestres muda automaticamente baseada no curso selecionado

4. **Ano de Cadastro**: É capturado automaticamente no momento do registro, representando quando o aluno entrou no curso

---

## 🚀 Próximos Passos Sugeridos

1. **Criar cron job** para executar `check_and_mark_graduated_students()` automaticamente todo início de semestre

2. **Adicionar notificações** para alertar estudantes próximos da graduação

3. **Dashboard de formandos** mostrando estudantes que irão se formar no próximo semestre

4. **Relatórios estatísticos** de taxa de conclusão por curso

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique os logs do servidor (`npm run dev`)
2. Verifique os logs do navegador (F12 → Console)
3. Verifique se o SQL foi executado corretamente no Supabase
4. Certifique-se de que todas as APIs estão respondendo

---

**Desenvolvido para NAF Estácio Florianópolis**
_Sistema de Gestão de Estudantes v2.0_
