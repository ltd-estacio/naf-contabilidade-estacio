# Configuração do Power BI para o Painel do Coordenador

Este guia detalha o processo completo para publicar dashboards do Power BI utilizados no painel do coordenador do NAF, habilitar a integração por API e mapear os campos necessários no relatório. Siga cada etapa na ordem apresentada.

---

## 1. Pré-requisitos

- Conta Microsoft com acesso ao **Power BI Service (Power BI Online)**.
- Plano **Power BI Pro** ou superior (necessário para publicar e gerar tokens de incorporação).
- Acesso administrativo ao projeto do NAF (variáveis de ambiente e deploy).
- Navegador atualizado (Chrome, Edge ou Firefox) com pop-ups habilitados para o domínio `app.powerbi.com`.

---

## 2. Preparar o relatório no Power BI Desktop

1. Baixe e instale o **Power BI Desktop** (https://powerbi.microsoft.com/pt-br/desktop/).
2. Importe a fonte de dados correspondente (por exemplo, uma exportação do Supabase ou dataset intermediário).
3. Crie as páginas e visuais necessários (gráficos, cards, tabelas) conforme os indicadores usados no painel do coordenador:
   - Atendimentos por status e urgência.
   - Tendência mensal de atendimentos.
   - Tabela de pendências críticas.
   - Ranking de estudantes/serviços.
4. Renomeie todos os campos dos visuais utilizando nomes amigáveis (serão usados como referência nas integrações).
5. Publique o relatório:
   - Em **Arquivo › Publicar › Publicar no Power BI**.
   - Selecione o workspace da organização (ex.: `NAF-Supabase`).

> **Dica**: mantenha cada página nomeada exatamente como será referenciada no front-end (`Visão Geral`, `Serviços`, `Estudantes`, `Fiscal`).

---

## 3. Ajustar o relatório diretamente no navegador

1. Acesse `https://app.powerbi.com` com a conta corporativa.
2. Entre no workspace escolhido.
3. Abra o relatório publicado e valide cada visual:
   - Verifique se filtros, slicers e bookmarks estão funcionando.
   - Ajuste layouts para **16:9** ou dimensões personalizadas que se encaixem no iframe usado no NAF (`1280×720` recomendado).
4. Salve o relatório. Todo ajuste feito no navegador reflete automaticamente no relatório incorporado.

---

## 4. Criar/Atualizar a API de incorporação no Power BI

1. No **Power BI Service**, abra o menu **Configurações › Administração do portal**.
2. Em **Configurações do Inquilino**, permita a opção **Usar as APIs do Power BI** para toda a organização ou para um grupo de segurança.
3. Registre um aplicativo AAD:
   - Acesse `https://aka.ms/powerbi-app-registration`.
   - Defina um nome (ex.: `NAF-Coordinator-Dashboard`).
   - Escolha **Confidential client** e gere um client secret.
   - Habilite os escopos: `Dataset.Read.All`, `Report.ReadWrite.All`, `Workspace.Read.All`.
4. Anote os valores:
   - **Application (client) ID**.
   - **Directory (tenant) ID**.
   - **Client secret** (guardar em cofre seguro; expira conforme política).
5. No Power BI, compartilhe o relatório com o aplicativo registrado (Adicionar à lista de acesso).

---

## 5. Configurar o NAF para consumir o Power BI

No projeto NAF (Next.js), definir as variáveis de ambiente:

```
NEXT_PUBLIC_POWERBI_REPORT_ID=<ID do relatório>
NEXT_PUBLIC_POWERBI_WORKSPACE_ID=<ID do workspace>
POWERBI_CLIENT_ID=<Application ID>
POWERBI_CLIENT_SECRET=<Secret gerado>
POWERBI_TENANT_ID=<Tenant ID>
```

> Os IDs de workspace e relatório estão em `app.powerbi.com` (botão **Detalhes** do relatório/workspace).

### 5.1 Gerar token de incorporação

1. Crie um endpoint ou job que solicite token via API:
   - POST `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token` para obter o `access_token` usando o client secret.
   - POST `https://api.powerbi.com/v1.0/myorg/groups/{workspaceId}/reports/{reportId}/GenerateToken` com corpo:
     ```json
     {
       "accessLevel": "View",
       "allowSaveAs": false
     }
     ```
2. O backend do NAF deve armazenar o token em cache (validade padrão ~1 hora) e repassá-lo ao front-end.
3. O front-end usa o pacote `powerbi-client` ou iframe customizado para carregar o relatório com o token embutido.

---

## 6. Mapear campos do Power BI utilizados pelo painel

| Área do Painel            | Visual no Power BI             | Campos obrigatórios                        |
|--------------------------|---------------------------------|--------------------------------------------|
| Visão Geral              | Card / KPI                      | `TotalAtendimentos`, `TaxaConclusao`       |
| Tendência Mensal         | Linha ou Barra                  | `Mes`, `TotalAtendimentos`, `TaxaConclusao`|
| Distribuição por Status  | Donut / Coluna empilhada        | `Status`, `Quantidade`, `Percentual`       |
| Pendências Críticas      | Tabela                          | `Protocolo`, `Cliente`, `Status`, `Dias`   |
| Top Serviços             | Barra horizontal                | `Servico`, `Solicitacoes`, `Satisfacao`    |
| Estudantes Destaque      | Tabela ou Matriz                | `Estudante`, `Curso`, `Atendimentos`, `Nota`|
| Público-Alvo             | Pie Chart                       | `Categoria`, `Clientes`, `Percentual`      |
| Alertas/Insights         | Cartões de texto (SmartNarrative)| Textos gerados ou medidas calculadas       |

> **Importante**: mantenha os nomes de campos idênticos aos esperados pela API do NAF. Caso renomeie no Power BI, atualize o mapeamento na aplicação.

---

## 7. Publicar e testar

1. Gere novo token de incorporação (se necessário) e atualize as variáveis em produção.
2. Limpe o cache do navegador do coordenador e recarregue o painel.
3. Verifique:
   - Carregamento sem erros CORS ou 401.
   - Responsividade do iframe/visual incorporado.
   - Sincronia dos filtros entre o NAF e o Power BI (se houver). 
4. Documente a data da publicação e responsável em um log interno.

---

## 8. Manutenção contínua

- Revise e renove o client secret antes da expiração (alertas no Azure AD).
- Mantenha um relatório *sandbox* para testes antes de alterar o relatório principal.
- Audite acessos no portal do Power BI (Configurações › Uso do Ambiente) regularmente.
- Atualize este documento sempre que novos visuais/campos forem adicionados ao painel.

---

## 9. Recursos úteis

- Documentação oficial Power BI Embedded: https://learn.microsoft.com/power-bi/developer/embedded
- Exemplo de integração Next.js + Power BI: https://github.com/microsoft/powerbi-client-react
- Geração de tokens: https://learn.microsoft.com/power-bi/developer/embedded/embed-service-principal

