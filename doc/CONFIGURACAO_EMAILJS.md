# 📧 Configuração do EmailJS para Backup

## 🎯 Configuração Necessária

### 1. Acesse o Dashboard do EmailJS
- URL: https://dashboard.emailjs.com
- Login com sua conta

### 2. Configure o Service (se ainda não tiver)
- Vá em **Email Services**
- Conecte seu provedor de email (Gmail, Outlook, etc.)
- Anote o **Service ID**: `service_xehr3ta`

### 3. Configure o Template

Acesse **Email Templates** → Edite o template `template_d2rfx39`

#### Configuração do Template:

**Subject (Assunto):**
```
{{subject}}
```

**Content (Conteúdo):**
```html
<div>
  <p>Olá {{to_name}},</p>
  
  <p>Um backup automático foi realizado no sistema NAF.</p>
  
  <div style="margin: 20px 0;">
    <strong>Detalhes do Backup:</strong><br>
    📅 Data: {{backup_date}}<br>
    ⏰ Hora: {{backup_time}}<br>
    📊 Total de Registros: {{total_records}}<br>
    📋 Tabelas: {{tables_count}}<br>
    👥 Estudantes: {{students_count}}<br>
    👨‍💼 Coordenador: {{coordinator_name}}<br>
    📧 Email: {{coordinator_email}}
  </div>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #667eea;">
    {{{message}}}
  </div>
  
  <p style="margin-top: 30px; color: #666;">
    Este é um email automático do Sistema NAF.<br>
    Por favor, não responda a este email.
  </p>
</div>
```

**IMPORTANTE**: Use `{{{message}}}` com 3 chaves para renderizar HTML!

### 4. Variáveis do Template

Configure as seguintes variáveis no template:

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `to_email` | String | Email de destino (fixo: souzaestevam925@gmail.com) |
| `to_name` | String | Nome do destinatário |
| `from_name` | String | Nome do remetente (Sistema NAF) |
| `subject` | String | Assunto do email |
| `message` | HTML | Conteúdo HTML completo do backup |
| `backup_date` | String | Data do backup |
| `backup_time` | String | Hora do backup |
| `total_records` | String | Total de registros |
| `tables_count` | String | Número de tabelas |
| `students_count` | String | Número de estudantes |
| `coordinator_name` | String | Nome do coordenador |
| `coordinator_email` | String | Email do coordenador |

### 5. Configurações de Envio

1. **To Email**: `{{to_email}}`
2. **From Name**: `{{from_name}}`
3. **Reply To**: Deixe em branco ou use um email válido
4. **BCC**: (opcional)

### 6. Teste o Template

No dashboard do EmailJS:
1. Clique em **"Test Template"**
2. Preencha os valores de teste:
```json
{
  "to_email": "souzaestevam925@gmail.com",
  "to_name": "Coordenador NAF",
  "from_name": "Sistema NAF",
  "subject": "Teste - Backup Automático",
  "message": "<h1>Teste</h1><p>Este é um teste</p>",
  "backup_date": "26/10/2025",
  "backup_time": "15:30:00",
  "total_records": "150",
  "tables_count": "4",
  "students_count": "12",
  "coordinator_name": "João Silva",
  "coordinator_email": "joao@naf.com"
}
```
3. Clique em **"Send Test Email"**
4. Verifique o email em **souzaestevam925@gmail.com**

### 7. Verifique as Credenciais

No código, certifique-se que está usando:

```javascript
EMAILJS_SERVICE_ID = 'service_xehr3ta'
EMAILJS_TEMPLATE_ID = 'template_d2rfx39'
EMAILJS_PUBLIC_KEY = 'nGm0I7osOMW7psoqF'
```

### 8. Quota do EmailJS

- **Plano Free**: 200 emails/mês
- **Plano Pessoal**: 1.000 emails/mês
- Verifique seu uso em: https://dashboard.emailjs.com/admin/account

### 9. Troubleshooting

**Email não está sendo enviado?**

1. ✅ Verifique se o Service está conectado e ativo
2. ✅ Confirme que o Template ID está correto
3. ✅ Verifique a Public Key
4. ✅ Olhe os logs do console no terminal
5. ✅ Teste o template no dashboard primeiro
6. ✅ Verifique a caixa de spam
7. ✅ Confirme que não excedeu a quota mensal

**Logs para verificar:**

No terminal onde o Next.js está rodando:
```
📧 Iniciando envio de email de backup...
📧 Email de destino: coordenador@naf.edu.br
📧 Email de destino final: souzaestevam925@gmail.com
📄 Carregando template de: /path/to/email-backup-template.html
✅ Template carregado com sucesso
👥 Estudantes encontrados: 12
✅ Template preenchido com dados
📤 Enviando email via EmailJS...
📧 Service ID: service_xehr3ta
📧 Template ID: template_d2rfx39
✅ Email de backup enviado com sucesso!
```

**Se aparecer erro:**
```
❌ Erro ao enviar email de backup: [ERRO]
❌ Detalhes do erro: {...}
```

Copie o erro completo e verifique:
- Service ID correto
- Template ID correto
- Public Key correta
- Template configurado corretamente
- Service conectado e ativo

### 10. Email de Destino Fixo

O sistema está configurado para enviar SEMPRE para:
```
souzaestevam925@gmail.com
```

Se precisar alterar, edite o arquivo:
```typescript
// src/app/api/coordinator/danger-zone/route.ts
const EMAIL_DESTINO = 'souzaestevam925@gmail.com'
```

---

## ✅ Checklist de Configuração

- [ ] Conta EmailJS criada
- [ ] Service conectado e ativo
- [ ] Template criado com ID: template_d2rfx39
- [ ] Template configurado com todas as variáveis
- [ ] {{{message}}} com 3 chaves no template
- [ ] Teste enviado com sucesso
- [ ] Email recebido em souzaestevam925@gmail.com
- [ ] Logs verificados no console
- [ ] Quota verificada

---

**Data**: 26 de outubro de 2025  
**Email de Destino**: souzaestevam925@gmail.com  
**Status**: ✅ Configurado para enviar
