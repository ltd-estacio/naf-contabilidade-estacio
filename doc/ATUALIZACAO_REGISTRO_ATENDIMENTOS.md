# Atualização – Registro de Andamento em Atendimentos Fiscais

## Visão Geral
Implementamos um sistema de registro contínuo para os atendimentos fiscais, permitindo que estudantes documentem as ações executadas durante o atendimento e que coordenadores acompanhem esses registros em tempo real.

## Principais mudanças
- **Nova tabela `fiscal_appointment_notes`** para armazenar notas vinculadas a cada atendimento.
- **Endpoint `/api/students/fiscal-appointments/notes`** para que estudantes adicionem e consultem registros mediante autenticação.
- **Ampliação dos endpoints existentes** (`/api/students/fiscal-appointments` e `/api/fiscal-appointments`) para retornar as notas associadas.
- **Student Portal (`/student-portal`)**:
  - botão “Iniciar” ativa modo de registro e reabre automaticamente o painel detalhado para o atendimento em andamento;
  - cartões listados exibem o contador de registros já lançados pelo estudante;
  - botão “Registro do Atendimento” aparece ao lado de “Ver Detalhes” sempre que o status estiver em `EM_ANDAMENTO` e abre o formulário de notas em tempo real;
  - painel de detalhes exibe linha do tempo + seção “Registro do Atendimento” com textarea para novas notas, feedback visual de carregamento e mensagens de erro específicas;
  - atualizações em tempo real via Supabase garantem que novos agendamentos, atribuições e mudanças de status apareçam imediatamente para o estudante;
  - registros ficam disponíveis mesmo após a conclusão.
- **Coordinator Dashboard (`/coordinator-dashboard`)**:
  - cartões de atendimentos fiscais mostram resumo da data/hora agendada e permitem abrir o log completo das anotações lançadas pelo estudante;
  - a listagem atualiza automaticamente a cada novo agendamento ou alteração de status, dispensando o recarregamento manual do painel.
- **Gerador de Relatórios Avançado**:
  - relatórios passaram a incluir o “Registro do Atendimento” (notas lançadas em tempo real) junto às seções de atendimentos fiscais;
  - interface de configuração consolidada em uma única aba, facilitando a geração rápida ou customizada no mesmo fluxo.
- **Assistente IA**:
  - o chat passa a usar a chave `GEMINI_API_KEY` definida no ambiente (sem valores embutidos no código);
  - em caso de falha ou chave suspensa, o sistema registra o fallback e mantém a conversa ativa sem interromper o atendimento.

### Fluxo recomendado para estudantes
1. Abra o atendimento fiscal e confirme os dados.<br>
2. Clique em **Iniciar**: o status migra para `EM_ANDAMENTO` e o painel detalhado é exibido automaticamente.
3. Utilize o botão **Registro do Atendimento** ao lado de **Ver Detalhes** para abrir ou retornar ao formulário de notas a qualquer momento.
4. Preencha a anotação e clique em **Registrar andamento** (dentro do painel). As notas são atualizadas imediatamente e ficam visíveis na linha do tempo.
5. Caso um novo atendimento seja atribuído, ele aparecerá automaticamente na listagem enquanto o portal estiver aberto.
6. Finalize o atendimento com **Finalizar** quando todas as atividades forem concluídas.

### Fluxo recomendado para coordenadores
1. Acesse **Painel do Coordenador → Atendimentos Fiscais**.
2. Utilize o marcador "Registro do atendimento" para verificar quantas notas já foram lançadas.
3. Clique em **Ver registro** para abrir o histórico completo das anotações registradas pelo estudante.
4. Novos agendamentos e mudanças de status surgem automaticamente, garantindo visibilidade em tempo real para decisões rápidas.

## Script de banco necessário
Execute os scripts abaixo no banco (Supabase/Postgres) antes de publicar a atualização:

```sql
\i src/sql/create_fiscal_appointment_notes.sql
\i src/sql/update_preferred_schedule_fields.sql
```

O primeiro cria a tabela de notas e índices auxiliares; o segundo garante que os campos de data/hora existentes estejam consistentes com os novos fluxos.

## Ajustes no App Mobile
Para manter paridade com o site, o aplicativo mobile deverá consumir os mesmos dados (incluindo `progress_notes`) e disponibilizar o formulário de registro quando o status do atendimento for `EM_ANDAMENTO`.
- ⚠️ **Pré-requisito obrigatório**: execute `\i src/sql/create_fiscal_appointment_notes.sql` no banco (Supabase/Postgres) para criar a tabela `fiscal_appointment_notes`. Sem essa execução, o registro de andamento e os relatórios exibirão apenas uma mensagem de aviso.
