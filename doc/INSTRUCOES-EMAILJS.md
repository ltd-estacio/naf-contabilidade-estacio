# 📧 Instruções para Configurar o EmailJS

## 🎯 Passo a Passo

### 1. Acesse o EmailJS Dashboard
- Acesse: https://dashboard.emailjs.com/
- Faça login com sua conta

### 2. Configure o Template de Email

1. No menu lateral, clique em **"Email Templates"**
2. Localize o template com ID: **template_ofyjueh**
3. Clique em **"Edit"** no template

### 3. Cole o Template HTML

1. Copie TODO o conteúdo do arquivo: **`email-template-agendamento.html`** (na raiz do projeto)
2. No EmailJS, cole o HTML na área de template
3. Clique em **"Save"**

### 4. Configure as Variáveis do Template

No EmailJS, certifique-se de que as seguintes variáveis estão mapeadas corretamente:

#### Variáveis obrigatórias:
- `{{to_email}}` - Email do destinatário
- `{{to_name}}` - Nome do destinatário
- `{{protocol}}` - Protocolo do agendamento
- `{{clientName}}` - Nome do cliente
- `{{clientEmail}}` - Email do cliente
- `{{clientPhone}}` - Telefone do cliente
- `{{serviceType}}` - Tipo de serviço
- `{{clientCategory}}` - Categoria do cliente
- `{{preferredDate}}` - Data preferida
- `{{preferredTime}}` - Horário preferido
- `{{modality}}` - Modalidade (Online/Presencial)

### 5. Teste o Envio

1. No EmailJS, clique em **"Test it"**
2. Preencha os campos de exemplo:
   ```json
   {
     "to_email": "seu-email@exemplo.com",
     "to_name": "João Silva",
     "protocol": "FAP-20251003-1430",
     "clientName": "João Silva",
     "clientEmail": "joao@exemplo.com",
     "clientPhone": "(48) 98461-4449",
     "serviceType": "Declaração de Imposto de Renda",
     "clientCategory": "Pessoa Física Hipossuficiente",
     "preferredDate": "sexta-feira, 3 de outubro de 2025",
     "preferredTime": "14:00",
     "modality": "Presencial"
   }
   ```
3. Clique em **"Send Test Email"**
4. Verifique se o email chegou corretamente

### 6. Configurações da Aplicação

As seguintes configurações já estão prontas no código:

#### Arquivo: `src/lib/emailjs.ts`
```typescript
const EMAILJS_CONFIG = {
  serviceId: 'service_xehr3ta',
  templateId: 'template_ofyjueh',
  publicKey: 'nGm0I7osOMW7psoqF',
}
```

⚠️ **IMPORTANTE**: Nunca compartilhe sua Private Key em código frontend!

### 7. Funcionamento

Após configurar, o sistema funcionará assim:

1. ✅ Usuário preenche o formulário de agendamento
2. ✅ Sistema salva no banco de dados
3. ✅ Sistema envia email automaticamente com os dados do agendamento
4. ✅ Cliente recebe email de confirmação com:
   - Protocolo do agendamento
   - Dados pessoais
   - Serviço solicitado
   - Data e horário
   - Próximos passos
   - Informações de contato

## 🎨 Personalização do Template

Caso queira personalizar o email:

1. Edite o arquivo **`email-template-agendamento.html`**
2. Ajuste cores, textos, layout conforme necessário
3. Copie o novo HTML para o EmailJS
4. Salve e teste novamente

## 🔧 Troubleshooting

### Email não está sendo enviado?

1. Verifique o console do navegador (F12) por erros
2. Confirme que as credenciais estão corretas
3. Verifique se o template ID está correto
4. Certifique-se de que o serviço EmailJS está ativo

### Email chegou mas está sem formatação?

1. Verifique se copiou TODO o HTML do template
2. Confirme que não há erros de sintaxe no HTML
3. Teste novamente no EmailJS Dashboard

### Variáveis não estão sendo substituídas?

1. Verifique se os nomes das variáveis estão corretos (case-sensitive)
2. Confirme que está usando `{{variavel}}` e não `{variavel}`
3. Revise o código em `src/lib/emailjs.ts`

## 📞 Suporte

Em caso de dúvidas sobre o EmailJS:
- Documentação: https://www.emailjs.com/docs/
- Support: https://www.emailjs.com/support/

## ✅ Checklist Final

- [ ] Template HTML copiado para o EmailJS
- [ ] Todas as variáveis configuradas
- [ ] Email de teste enviado com sucesso
- [ ] Email chegou formatado corretamente
- [ ] Testado em produção com um agendamento real
