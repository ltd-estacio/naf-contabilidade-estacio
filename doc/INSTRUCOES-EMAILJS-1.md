# 📧 Instruções para Configurar o Template do EmailJS

## ✅ Passo a Passo

### 1. Acesse o Painel do EmailJS
- Vá para: https://dashboard.emailjs.com/admin
- Faça login com sua conta

### 2. Abra o Template
- Clique em **"Email Templates"** no menu lateral
- Encontre e clique no template **`template_ofyjueh`**
- Clique em **"Edit"**

### 3. Configure o Destinatário (MUITO IMPORTANTE!)

Na seção **"Settings"** do template, configure:

```
To Email: {{to_email}}
To Name: {{to_name}}
From Name: NAF Estácio Florianópolis
Reply To: naf@estacio.br
```

**⚠️ ATENÇÃO**: O campo "To Email" DEVE ser `{{to_email}}` (com duas chaves em cada lado). Isso é essencial para o email ser enviado!

### 4. Cole o Template HTML

1. No campo **"Content"**, clique em **"Edit HTML"** ou mude para modo HTML
2. **DELETE todo o conteúdo atual**
3. Abra o arquivo `TEMPLATE-EMAILJS-COPIAR.html` deste projeto
4. **Copie TODO o conteúdo** (Ctrl+A → Ctrl+C)
5. **Cole** no editor do EmailJS (Ctrl+V)
6. Clique em **"Save"**

### 5. Teste o Email

Agora, no seu site:
1. Vá para `/naf-scheduling`
2. Faça um novo agendamento usando o email: `estevams186@gmail.com`
3. Verifique se o email chegou com TODOS os campos preenchidos

## ✅ Checklist de Verificação

- [ ] To Email configurado como `{{to_email}}`
- [ ] Template HTML copiado e salvo
- [ ] Teste realizado
- [ ] Email recebido com todos os dados corretos

## 🐛 Se ainda não funcionar

Se o email ainda não chegar ou vir vazio:

1. Verifique se as credenciais no `.env` estão corretas:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xehr3ta`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_ofyjueh`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=nGm0I7osOMW7psoqF`

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Verifique o console do navegador (F12) para ver os logs detalhados

## 📋 Variáveis Disponíveis no Template

- `{{protocol}}` - Número do protocolo
- `{{clientName}}` - Nome do cliente
- `{{clientEmail}}` - Email do cliente
- `{{clientPhone}}` - Telefone do cliente
- `{{serviceType}}` - Tipo de serviço solicitado
- `{{clientCategory}}` - Categoria do cliente
- `{{preferredDate}}` - Data escolhida (formatada por extenso)
- `{{preferredTime}}` - Horário escolhido
- `{{modality}}` - Presencial ou Online

## 🎯 Resultado Esperado

Quando funcionar corretamente, você verá no console:

```
✅ EmailJS inicializado com sucesso!
📧 ========== INICIANDO ENVIO DE EMAIL ==========
📧 Service ID: service_xehr3ta
📧 Template ID: template_ofyjueh
📧 Destinatário: estevams186@gmail.com
✅ ========== EMAIL ENVIADO COM SUCESSO! ==========
✅ Status: 200
```

E o usuário receberá um email bonito e completo com todas as informações do agendamento!
