# 🚨 Guia Rápido - Painel de Perigo

## 🎯 Como Acessar

1. Faça login no Dashboard do Coordenador: `/coordinator-dashboard`
2. Localize o botão **"Perigo"** na barra de navegação (ícone ⚠️)
3. Clique no botão para abrir o painel

## ⚡ Operações Disponíveis

### 1️⃣ Apagar Dados (Card Vermelho)

**O que faz**: Remove permanentemente todos os dados de atendimentos do sistema

**Quando usar**:
- Resetar sistema para testes
- Limpar dados antigos/incorretos
- Preparar ambiente para nova entrada de dados

**⚠️ ATENÇÃO**:
- **IRREVERSÍVEL** após confirmação
- Backup automático é criado antes
- Requer código 2FA para confirmar

**Passo a passo**:
1. Clique em "Apagar Dados (Requer 2FA)"
2. Um alerta exibirá o código 2FA de 6 dígitos
3. Copie o código
4. Cole no modal de autenticação
5. Clique em "Verificar"
6. Aguarde confirmação
7. Sistema será recarregado automaticamente

---

### 2️⃣ Confirmar Dados (Card Azul)

**O que faz**: Verifica a integridade e consistência dos dados do sistema

**Quando usar**:
- Verificar se os dados estão corretos
- Validar após importações
- Checagem de rotina

**O que é verificado**:
- ✓ Contagem de agendamentos fiscais
- ✓ Contagem de atendimentos
- ✓ Contagem de estudantes
- ✓ Status do último backup
- ✓ Idade do backup mais recente

**Passo a passo**:
1. Clique em "Confirmar Integridade (Requer 2FA)"
2. Copie o código 2FA exibido
3. Cole no modal
4. Clique em "Verificar"
5. Leia o relatório de integridade

---

### 3️⃣ Visualizar Dados (Card Roxo)

**O que faz**: Acessa estatísticas detalhadas e dados sensíveis

**Quando usar**:
- Gerar relatórios executivos
- Auditoria de dados
- Análise detalhada do sistema

**Informações disponíveis**:
- 📊 Total de agendamentos fiscais
- 📋 Total de atendimentos
- 👥 Total de estudantes
- 🔢 Estatísticas consolidadas

**Passo a passo**:
1. Clique em "Visualizar Dados (Requer 2FA)"
2. Copie o código 2FA
3. Cole no modal
4. Clique em "Verificar"
5. Analise as estatísticas exibidas

---

## 🔐 Autenticação em Duas Etapas (2FA)

### Como funciona

1. **Ao clicar em qualquer ação**, um alerta popup mostrará um código de 6 dígitos
   ```
   🔐 Código de Verificação 2FA: 123456
   ```

2. **Copie o código** e guarde-o temporariamente

3. **Modal de autenticação abre** com um campo para digitar o código

4. **Digite os 6 dígitos** (apenas números são aceitos)

5. **Clique em "Verificar"** para confirmar

6. **Aguarde a operação** ser processada

### Regras de Segurança

- ⏱️ Código expira em **5 minutos**
- 🔄 Máximo de **3 tentativas** incorretas
- 📝 Todas as ações são **registradas em log**
- 💾 Backup automático antes de **operações destrutivas**

---

## 📊 Painel de Protocolo de Segurança

Na parte inferior do painel, há um card informativo com:

### 🔐 Autenticação em Duas Etapas
Explicação do funcionamento do 2FA

### 📝 Registro de Auditoria
Todas as ações são gravadas com timestamp e usuário

### ⏱️ Timeout de Sessão
Autorização expira após 5 minutos

### 🔄 Backup Automático
Criado antes de qualquer exclusão

---

## 📋 Registro de Atividades Críticas

Na parte inferior, você pode ver:
- ✅ Últimas operações realizadas
- 🕐 Timestamp de cada ação
- 👤 Usuário responsável
- ✓ Status (sucesso/falha)

---

## ⚠️ Avisos Importantes

### Para Coordenadores

1. **SEMPRE** leia os avisos antes de confirmar operações
2. **NUNCA** compartilhe códigos 2FA com outras pessoas
3. **SEMPRE** verifique se há backup recente antes de apagar dados
4. **SEMPRE** anote o código 2FA quando ele aparecer
5. **NUNCA** execute operações críticas sem necessidade

### Em Caso de Erro

Se algo der errado:

1. ❌ **Erro no código 2FA**
   - Gere um novo código clicando novamente na ação
   - Certifique-se de copiar o código correto

2. ❌ **Operação falhou**
   - Verifique sua conexão com a internet
   - Tente novamente após alguns segundos
   - Se persistir, contate o suporte técnico

3. ❌ **Dados apagados por engano**
   - Acesse o painel de "Segurança Digital"
   - Restaure o último backup criado
   - Ou contate o administrador do sistema

---

## 🆘 Suporte

Para problemas ou dúvidas:

1. **Verificar logs**: Console do navegador (F12)
2. **Documentação**: Arquivo `PAINEL_PERIGO_IMPLEMENTACAO.md`
3. **Email**: suporte@naf.com
4. **Telefone**: (XX) XXXX-XXXX

---

## ✅ Checklist Antes de Usar

Antes de executar operações críticas:

- [ ] Verifiquei se há backup recente
- [ ] Li todos os avisos de segurança
- [ ] Entendi que a operação é irreversível (se for o caso)
- [ ] Tenho autorização para executar esta ação
- [ ] Anotei o código 2FA em local seguro
- [ ] Estou em ambiente seguro e privado
- [ ] Tenho certeza de que quero prosseguir

---

**⚡ Lembre-se**: Este é um painel de operações críticas. Use com responsabilidade!

**Data de criação**: 26 de outubro de 2025  
**Versão**: 1.0.0
