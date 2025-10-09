# 📊 GUIA COMPLETO: POWER BI + NAF CONTÁBIL

## 🎯 **CONFIGURAÇÃO RÁPIDA - 5 MINUTOS**

### **Passo 1: Gerar Dataset**
1. **Abra o sistema:** http://localhost:5000/dashboard/powerbi
2. **Configure:**
   - Tipo: "Dataset Otimizado para Power BI"
   - Formato: "CSV (Recomendado para Power BI)"
   - Deixe as datas em branco para pegar todos os dados
3. **Clique:** "Gerar e Baixar Dataset"
4. **Salve o arquivo CSV** em uma pasta fácil de lembrar

### **Passo 2: Abrir Power BI**
1. **Acesse:** https://app.powerbi.com/ (Power BI Online - GRÁTIS)
2. **Ou baixe:** Power BI Desktop (gratuito) da Microsoft Store
3. **Faça login** com sua conta Microsoft

### **Passo 3: Importar Dados**
1. **No Power BI Online:**
   - Clique em "Obter dados"
   - Selecione "Arquivo" → "Local"
   - Escolha o arquivo CSV baixado
   - Clique em "Conectar"

2. **No Power BI Desktop:**
   - Clique em "Obter dados"
   - Selecione "Texto/CSV"
   - Navegue até o arquivo baixado
   - Clique em "Abrir"

### **Passo 4: Verificar Dados**
✅ **Você verá as seguintes colunas:**
- `protocol` - Protocolo da demanda
- `clientName` - Nome do cliente
- `clientCpf` - CPF do cliente
- `serviceCategory` - Categoria do serviço
- `serviceTheme` - Tema do serviço
- `status` - Status da demanda
- `priority` - Prioridade
- `hours` - Horas trabalhadas
- `isValidated` - Se foi validado
- `userName` - Nome do usuário responsável
- `year`, `month`, `quarter` - Para análise temporal

### **Passo 5: Criar Visualizações Prontas**

#### 📊 **Gráfico 1: Demandas por Status**
1. Selecione **Gráfico de Pizza**
2. Arraste `status` para **Legenda**
3. Arraste `protocol` para **Valores** (contagem)

#### 📈 **Gráfico 2: Demandas por Mês**
1. Selecione **Gráfico de Barras**
2. Arraste `month` para **Eixo**
3. Arraste `protocol` para **Valores** (contagem)

#### 🏆 **Gráfico 3: Top Serviços**
1. Selecione **Gráfico de Barras Horizontais**
2. Arraste `serviceTheme` para **Eixo**
3. Arraste `protocol` para **Valores** (contagem)
4. Ordene por valores decrescentes

#### ⏱️ **Gráfico 4: Horas por Usuário**
1. Selecione **Gráfico de Barras**
2. Arraste `userName` para **Eixo**
3. Arraste `hours` para **Valores** (soma)

#### 🎯 **Gráfico 5: Taxa de Validação**
1. Selecione **Gráfico de Pizza**
2. Arraste `isValidated` para **Legenda**
3. Arraste `protocol` para **Valores** (contagem)

---

## 🚀 **TEMPLATES PRONTOS PARA USAR**

### **Dashboard Gerencial**
```
Linha 1: [KPI Total Demandas] [KPI Horas Trabalhadas] [KPI Taxa Validação]
Linha 2: [Gráfico Status] [Gráfico Mensal]
Linha 3: [Top Serviços] [Horas por Usuário]
```

### **Dashboard Operacional**
```
Linha 1: [Filtro Mês] [Filtro Status] [Filtro Prioridade]
Linha 2: [Lista Demandas Pendentes] [Gráfico Prioridades]
Linha 3: [Performance por Usuário] [Validações Pendentes]
```

---

## 💡 **DICAS PRO**

### **Filtros Úteis**
- **Por Período:** Use `year` e `month`
- **Por Status:** Use `status`
- **Por Prioridade:** Use `priority`
- **Por Usuário:** Use `userName`

### **Métricas Importantes**
- **Total de Demandas:** COUNT(`protocol`)
- **Horas Trabalhadas:** SUM(`hours`)
- **Taxa de Validação:** COUNT(`isValidated` = true) / COUNT(`protocol`)
- **Tempo Médio:** AVERAGE(`hours`)

### **Cores Sugeridas**
- 🟢 **Verde:** Completed, Validated
- 🟡 **Amarelo:** In Progress, Medium
- 🔴 **Vermelho:** Pending, High, Urgent
- 🔵 **Azul:** General, Low

---

## 📱 **ACESSO MÓVEL**
1. Baixe o app **Power BI Mobile**
2. Faça login com a mesma conta
3. Acesse seus dashboards em qualquer lugar

---

## 🔄 **ATUALIZAÇÃO AUTOMÁTICA**

### **Para dados sempre atualizados:**
1. **Configure refresh automático** no Power BI Service
2. **Use Power BI Gateway** para conectar direto ao banco
3. **Ou agende exports** diários do sistema NAF

---

## ⚡ **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema:** "Arquivo CSV não importa"
**Solução:** Verifique se o arquivo não está aberto no Excel

### **Problema:** "Dados não aparecem nos gráficos"
**Solução:** Verifique se arrastou os campos corretos para Valores

### **Problema:** "Gráficos ficam vazios"
**Solução:** Confirme se há dados no período selecionado

### **Problema:** "Performance lenta"
**Solução:** Use filtros para reduzir o volume de dados

---

## 📧 **COMPARTILHAMENTO**

### **Para equipe:**
1. Publique o dashboard no **Power BI Service**
2. Compartilhe com colegas específicos
3. Configure permissões (visualizar/editar)

### **Para apresentações:**
1. Export como **PDF** ou **PowerPoint**
2. Ou use **Power BI Embedded** em sites

---

## 🎓 **RECURSOS PARA APRENDER MAIS**

- **Microsoft Learn:** Cursos gratuitos de Power BI
- **YouTube:** Canal oficial Microsoft Power BI
- **Documentação:** docs.microsoft.com/power-bi
- **Comunidade:** community.powerbi.com

---

## ✅ **CHECKLIST DE SUCESSO**

- [ ] CSV baixado do sistema NAF
- [ ] Power BI aberto (Online ou Desktop)
- [ ] Dados importados com sucesso
- [ ] Pelo menos 3 gráficos criados
- [ ] Dashboard salvo
- [ ] Equipe notificada

**🎉 Pronto! Você tem um dashboard profissional em 5 minutos!**
