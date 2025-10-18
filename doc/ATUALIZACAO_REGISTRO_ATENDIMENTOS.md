# Atualização – Registro de Andamento em Atendimentos Fiscais

## Visão Geral
Implementamos um sistema de registro contínuo para os atendimentos fiscais, permitindo que estudantes documentem as ações executadas durante o atendimento e que coordenadores acompanhem esses registros em tempo real.

## Principais mudanças
- **Nova tabela `fiscal_appointment_notes`** para armazenar notas vinculadas a cada atendimento.
- **Endpoint `/api/students/fiscal-appointments/notes`** para que estudantes adicionem e consultem registros mediante autenticação.
- **Ampliação dos endpoints existentes** (`/api/students/fiscal-appointments` e `/api/fiscal-appointments`) para retornar as notas associadas.
- **Student Portal (`/student-portal`)**:
  - botão “Iniciar” ativa modo de registro;
  - painel de detalhes exibe linha do tempo + seção “Registro do Atendimento” com textarea para novas notas;
  - registros ficam disponíveis mesmo após a conclusão.
- **Coordinator Dashboard (`/coordinator-dashboard`)**:
  - cartões de atendimentos fiscais mostram resumo da data/hora agendada e permitem abrir o log completo das anotações lançadas pelo estudante.

## Script de banco necessário
Execute os scripts abaixo no banco (Supabase/Postgres) antes de publicar a atualização:

```sql
\i src/sql/create_fiscal_appointment_notes.sql
\i src/sql/update_preferred_schedule_fields.sql
```

O primeiro cria a tabela de notas e índices auxiliares; o segundo garante que os campos de data/hora existentes estejam consistentes com os novos fluxos.

## Ajustes no App Mobile
Para manter paridade com o site, o aplicativo mobile deverá consumir os mesmos dados (incluindo `progress_notes`) e disponibilizar o formulário de registro quando o status do atendimento for `EM_ANDAMENTO`.
