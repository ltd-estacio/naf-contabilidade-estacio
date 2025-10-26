# Guia de Funcionalidades - Configurações de Backup

## 📋 Visão Geral

As Configurações Avançadas de Backup permitem que o coordenador personalize completamente o comportamento do sistema de backup, incluindo automação, retenção, formatos e notificações.

---

## 🎨 Interface

A aba de Configurações está dividida em 4 seções principais, cada uma com sua própria cor e ícone:

### 🔵 Backup Automático (Azul)
**Ícone:** ⚡ Zap

Permite agendar backups periódicos automáticos que serão enviados por e-mail.

**Opções:**
- Toggle On/Off para ativar/desativar
- Frequências disponíveis:
  - ⏰ **Diário:** Todo dia às 2:00 AM
  - 📅 **Semanal:** Domingos às 2:00 AM (padrão)
  - 📅 **Quinzenal:** Dias 1 e 15 de cada mês às 2:00 AM
  - 📅 **Mensal:** Primeiro dia do mês às 2:00 AM
- Campo de e-mail para receber os backups

**Quando usar:**
- Para garantir backups regulares sem intervenção manual
- Para manter cópias de segurança atualizadas
- Para auditoria e conformidade

---

### 🟢 Retenção de Dados (Verde)
**Ícone:** 💾 HardDrive

Controla por quanto tempo os backups devem ser mantidos no histórico.

**Opções:**
- 30 dias (1 mês)
- 60 dias (2 meses)
- **90 dias (3 meses)** ⭐ Recomendado
- 180 dias (6 meses)
- 365 dias (1 ano)
- 730 dias (2 anos)
- Ilimitado

**Como funciona:**
- Backups mais antigos que o período são automaticamente removidos
- Ajuda a gerenciar o espaço em disco
- Mantém o histórico organizado

**Quando usar:**
- 30-60 dias: Para ambientes com alto volume de backups
- **90 dias:** Equilíbrio ideal entre histórico e espaço
- 180-365 dias: Para requisitos de conformidade
- Ilimitado: Quando espaço não é problema

---

### 🟣 Formato e Compressão (Roxo)
**Ícone:** 📦 FileArchive

Configura o formato padrão de exportação e opções de otimização.

**Formatos Disponíveis:**
- **📊 CSV** - Planilha (Recomendado)
  - Compatível com Excel, Google Sheets
  - Leve e universal
- **📋 JSON** - Dados Estruturados
  - Para integrações e APIs
  - Preserva estrutura de dados
- **📈 Excel** - Microsoft Excel
  - Formato nativo do Excel
- **📄 TXT** - Texto Simples
  - Para logs e análise manual

**Opções de Compressão:**
- ✅ **Habilitar compressão (.zip)**
  - Reduz tamanho em até 70%
  - Facilita envio por e-mail
  - Economiza largura de banda

**Tamanho Máximo:**
- 10 MB - Pequeno
- 25 MB - Médio
- **50 MB - Grande** ⭐ Recomendado
- 100 MB - Muito Grande
- Ilimitado

**Metadados:**
- ✅ Incluir timestamps, IPs, user agents, etc.

**Quando usar cada formato:**
- **CSV:** Para análise em planilhas
- **JSON:** Para sistemas e integrações
- **Excel:** Para relatórios formatados
- **TXT:** Para auditoria simples

---

### 🟠 Notificações (Laranja)
**Ícone:** 🔔 Bell

Configura alertas por e-mail sobre o status dos backups.

**Opções:**
- ✅ **Notificar em sucesso**
  - Recebe confirmação quando backup é concluído
  - Útil para ter certeza que o backup foi feito
  
- ✅ **Notificar em falha** ⭐ Recomendado
  - Alerta imediato se algo der errado
  - Crítico para garantir continuidade

**Quando usar:**
- Notificação de Sucesso: Para backups importantes ou auditoria
- Notificação de Falha: **SEMPRE** - essencial para detectar problemas

---

## 💡 Casos de Uso

### Caso 1: Backup Diário Leve
**Cenário:** Alta frequência de atualizações

```
✅ Backup Automático: Diário
✅ Retenção: 30 dias
✅ Formato: CSV
✅ Compressão: Ativada
✅ Tamanho Máx: 25 MB
✅ Notificação Falha: Ativada
```

### Caso 2: Backup Semanal Completo (Recomendado)
**Cenário:** Equilíbrio entre segurança e recursos

```
✅ Backup Automático: Semanal
✅ Retenção: 90 dias
✅ Formato: CSV
✅ Compressão: Ativada
✅ Tamanho Máx: 50 MB
✅ Metadados: Incluir
✅ Notificações: Ambas
```

### Caso 3: Backup Mensal para Auditoria
**Cenário:** Requisitos de conformidade

```
✅ Backup Automático: Mensal
✅ Retenção: 365 dias (1 ano)
✅ Formato: JSON + CSV
✅ Compressão: Ativada
✅ Tamanho Máx: 100 MB
✅ Metadados: Incluir
✅ Notificações: Ambas
```

### Caso 4: Backup Manual Apenas
**Cenário:** Controle total

```
❌ Backup Automático: Desativado
✅ Retenção: 90 dias
✅ Formato: CSV (padrão)
✅ Compressão: Ativada
```

---

## 🔐 Segurança e Privacidade

- ✅ Todas as configurações são salvas **localmente** no navegador
- ✅ Nenhuma configuração é enviada para servidores externos
- ✅ Cada coordenador tem suas próprias configurações
- ✅ Backups seguem as mesmas regras de segurança dos backups manuais
- ✅ E-mails enviados usam conexão segura

---

## 🚀 Como Começar

### Passo 1: Abrir Configurações
1. Acesse o painel do Coordenador
2. Vá para "Backup Atendimentos"
3. Clique na aba **"Configurações"**

### Passo 2: Configurar Preferências
1. Ative/desative **Backup Automático** conforme necessário
2. Escolha a **frequência** e **e-mail**
3. Configure o período de **Retenção**
4. Escolha o **formato padrão** e opções de compressão
5. Ative as **notificações** desejadas

### Passo 3: Salvar
1. Clique em **"Salvar Configurações"**
2. Aguarde a confirmação (botão muda para "Salvo!")

### Passo 4: Usar Configurações
1. Vá para a aba **"Gerar Backup"**
2. Clique em **"Aplicar Config. Padrão"**
3. Os campos serão preenchidos automaticamente
4. Faça ajustes pontuais se necessário
5. Gere o backup

---

## ⚙️ Gerenciamento de Configurações

### Salvar Configurações
- Botão: **"Salvar Configurações"**
- Ação: Grava todas as preferências no navegador
- Feedback: Botão muda para "Salvo!" por 3 segundos

### Restaurar Padrão
- Botão: **"Restaurar Padrão"**
- Ação: Volta para configurações originais
- Requer confirmação para evitar perda acidental

### Aplicar Config. Padrão (Aba "Gerar Backup")
- Botão: **"Aplicar Config. Padrão"**
- Ação: Preenche formulário com configurações salvas
- Útil para uso rápido das preferências

---

## 📊 Painel de Status

No final das configurações, há um painel resumo com 3 cards:

1. **⚡ Backup Automático**
   - Mostra: Ativo (frequência) ou Desativado
   - Cor: Azul

2. **💾 Retenção**
   - Mostra: Período configurado ou "Ilimitada"
   - Cor: Verde

3. **📦 Formato**
   - Mostra: Formato + se há compressão
   - Exemplo: "CSV + ZIP"
   - Cor: Roxo

---

## ❓ Perguntas Frequentes

### P: As configurações são compartilhadas entre coordenadores?
**R:** Não. Cada coordenador tem suas próprias configurações locais.

### P: Se eu mudar de computador/navegador?
**R:** Você precisará configurar novamente, pois as configurações são salvas localmente.

### P: Os backups automáticos funcionam mesmo se eu fechar o navegador?
**R:** Sim, quando implementados no backend com cron jobs (próxima fase).

### P: Posso ter múltiplos e-mails para notificações?
**R:** Atualmente apenas um e-mail, mas está nos planos futuros.

### P: A compressão realmente funciona?
**R:** A interface está pronta. A implementação real da compressão será feita na próxima fase.

### P: Posso exportar/importar minhas configurações?
**R:** Não no momento, mas é uma funcionalidade planejada.

---

## 🎯 Melhores Práticas

1. **✅ SEMPRE ative notificação de falha**
   - Essencial para detectar problemas rapidamente

2. **✅ Use compressão para backups grandes**
   - Economiza espaço e facilita envio

3. **✅ Configure retenção adequada**
   - 90 dias é ideal para maioria dos casos
   - Ajuste conforme necessidades legais

4. **✅ Use formato CSV para análise**
   - Universal e compatível com todas as ferramentas

5. **✅ Configure backup automático semanal**
   - Equilíbrio perfeito entre frequência e recursos

6. **✅ Salve suas configurações após ajustar**
   - Evita reconfigurar toda vez

7. **✅ Use "Aplicar Config. Padrão" para agilizar**
   - Poupa tempo ao gerar backups manuais

---

## 📞 Suporte

Se encontrar algum problema ou tiver sugestões:
- Relate bugs através do sistema de issues
- Sugira melhorias para a equipe de desenvolvimento
- Consulte a documentação técnica em `BACKUP_CONFIG_IMPLEMENTATION.md`

---

**Última Atualização:** 2025-10-20
**Versão:** 1.0.0
