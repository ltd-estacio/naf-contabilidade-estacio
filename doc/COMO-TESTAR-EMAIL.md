# 🧪 Como Testar o Envio de Email

## 🎯 Acesse a Página de Teste

```
http://localhost:3000/test-email
```

## 📋 Passo a Passo para Testar

### 1. Abra o Console do Navegador
- Pressione **F12** (ou Cmd+Option+I no Mac)
- Vá para a aba **Console**
- **IMPORTANTE**: Deixe o console aberto durante todo o teste!

### 2. Preencha o Formulário
- Digite seu **email real** (onde você quer receber o teste)
- Digite seu **nome**
- Clique em **"Enviar Email de Teste"**

### 3. Verifique os Logs no Console

Você verá mensagens como:

```
🧪 Iniciando teste de email...
Email: seu-email@exemplo.com
Nome: Seu Nome
📧 Iniciando envio de email...
Destinatário: seu-email@exemplo.com
📤 Enviando com os parâmetros: {...}
```

### 4. Identifique o Erro (se houver)

#### ✅ Se der CERTO:
```
✅ Email enviado com sucesso!
Response: {status: 200, text: "OK"}
```

#### ❌ Se der ERRO, você verá algo como:

**Erro 1: Template não encontrado**
```
❌ ERRO DETALHADO ao enviar email:
Error: Template 'template_ofyjueh' not found
```
**Solução**: O template não existe ou o ID está errado. Verifique no EmailJS.

---

**Erro 2: Service não encontrado**
```
❌ ERRO DETALHADO ao enviar email:
Error: Service 'service_xehr3ta' not found
```
**Solução**: O service não existe ou o ID está errado. Verifique no EmailJS.

---

**Erro 3: Public Key inválida**
```
❌ ERRO DETALHADO ao enviar email:
Error: Invalid public key
```
**Solução**: A public key está incorreta. Verifique no EmailJS.

---

**Erro 4: Template não configurado**
```
❌ ERRO DETALHADO ao enviar email:
Error: Failed to send email
```
**Solução**: O template existe mas não tem o HTML configurado. Cole o conteúdo de `email-template-agendamento.html` no EmailJS.

---

**Erro 5: CORS / Domínio não autorizado**
```
❌ ERRO DETALHADO ao enviar email:
Error: Origin not allowed
```
**Solução**:
1. Acesse: https://dashboard.emailjs.com/admin/account
2. Vá em "Security & Access"
3. Adicione `localhost` e seu domínio de produção

---

## 🔧 Checklist de Verificação

Antes de testar, certifique-se de:

- [ ] EmailJS está instalado (`npm install @emailjs/browser`)
- [ ] Você criou uma conta no EmailJS
- [ ] Você tem um **Service** configurado (Gmail, Outlook, etc)
- [ ] O **Service ID** é: `service_xehr3ta`
- [ ] Você criou um **Template** no EmailJS
- [ ] O **Template ID** é: `template_ofyjueh`
- [ ] Você copiou o HTML de `email-template-agendamento.html` para o template
- [ ] A **Public Key** é: `nGm0I7osOMW7psoqF`
- [ ] O domínio está autorizado (localhost e produção)

## 🎨 Verificar se o Template Está Configurado

1. Acesse: https://dashboard.emailjs.com/admin/templates
2. Encontre o template: `template_ofyjueh`
3. Clique em "Edit"
4. Verifique se tem o HTML completo (deve ter ~200 linhas)
5. Se estiver vazio, cole o conteúdo de `email-template-agendamento.html`

## 📧 Configurar Variáveis do Template

No EmailJS, certifique-se de que as variáveis estão mapeadas:

### No campo "To Email":
```
{{to_email}}
```

### No campo "Subject" (Assunto):
```
Confirmação de Agendamento - NAF Estácio - Protocolo {{protocol}}
```

### No corpo do email:
Deve conter o HTML completo do arquivo `email-template-agendamento.html`

## 🚀 Testar no Ambiente Real

Depois de testar em `/test-email`, teste fazendo um agendamento real:

1. Vá para: http://localhost:3000/naf-scheduling
2. Preencha todos os dados
3. Use seu **email real**
4. Complete o agendamento
5. Verifique se o email chegou
6. Verifique a caixa de **SPAM** se não aparecer

## 📞 Precisa de Ajuda?

Se mesmo seguindo todos os passos ainda não funcionar:

1. Copie TODA a mensagem de erro do console
2. Tire um print da tela de erro
3. Verifique se seguiu TODOS os itens do checklist
4. Revise as configurações no EmailJS Dashboard

## 🎯 Atalhos Úteis

- EmailJS Dashboard: https://dashboard.emailjs.com/
- Templates: https://dashboard.emailjs.com/admin/templates
- Services: https://dashboard.emailjs.com/admin
- Account Settings: https://dashboard.emailjs.com/admin/account
- Integration: https://dashboard.emailjs.com/admin/integration
