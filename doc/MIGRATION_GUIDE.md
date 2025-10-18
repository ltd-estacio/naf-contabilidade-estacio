# Guia de Migração - Histórico de Relatórios

Este guia explica como aplicar a migração para criar a tabela de histórico de relatórios no Supabase.

## Problema
O histórico de relatórios não está salvando porque a tabela `report_history` ainda não existe no banco de dados.

## Solução

### Passo 1: Acessar o Supabase Dashboard
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto NAF Contábil
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar a Migração SQL
1. No SQL Editor, clique em **New query**
2. Cole o seguinte SQL:

```sql
-- CreateTable: report_history
CREATE TABLE IF NOT EXISTS "report_history" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "student_email" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "custom_template" JSONB,
    "stats" JSONB NOT NULL,
    "total_attendances" INTEGER NOT NULL DEFAULT 0,
    "completed_attendances" INTEGER NOT NULL DEFAULT 0,
    "total_trainings" INTEGER NOT NULL DEFAULT 0,
    "completed_trainings" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_size" INTEGER,

    CONSTRAINT "report_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "report_history_student_id_idx" ON "report_history"("student_id");
CREATE INDEX IF NOT EXISTS "report_history_generated_at_idx" ON "report_history"("generated_at");

-- Comentário
COMMENT ON TABLE "report_history" IS 'Histórico de relatórios gerados pelos estudantes';
COMMENT ON COLUMN "report_history"."report_type" IS 'Tipo: quick ou custom';
COMMENT ON COLUMN "report_history"."template" IS 'Template usado: complete, performance, attendances, trainings';
COMMENT ON COLUMN "report_history"."format" IS 'Formato: pdf, docx, excel, csv, txt';
```

3. Clique em **Run** ou pressione `Ctrl+Enter` (ou `Cmd+Enter` no Mac)
4. Você deverá ver a mensagem: **Success. No rows returned**

### Passo 3: Verificar se a Tabela foi Criada
1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deverá ver a tabela `report_history` na lista
3. Clique nela para ver a estrutura:
   - **id**: Identificador único
   - **student_id**: ID do estudante
   - **student_name**: Nome do estudante
   - **student_email**: Email do estudante
   - **report_type**: Tipo de relatório (quick/custom)
   - **template**: Template usado
   - **format**: Formato do arquivo (pdf/docx/excel/csv/txt)
   - **custom_template**: Template customizado (JSON)
   - **stats**: Estatísticas completas (JSON)
   - **total_attendances**: Total de atendimentos
   - **completed_attendances**: Atendimentos concluídos
   - **total_trainings**: Total de treinamentos
   - **completed_trainings**: Treinamentos concluídos
   - **success_rate**: Taxa de sucesso
   - **avg_rating**: Avaliação média
   - **generated_at**: Data/hora de geração
   - **file_size**: Tamanho do arquivo em bytes

### Passo 4: Configurar Políticas de Segurança (RLS)
Para que os estudantes possam acessar apenas seu próprio histórico, execute:

```sql
-- Habilitar RLS
ALTER TABLE "report_history" ENABLE ROW LEVEL SECURITY;

-- Política: Estudantes podem ver apenas seu próprio histórico
CREATE POLICY "Estudantes podem ver seu próprio histórico"
ON "report_history"
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Política: Sistema pode inserir histórico
CREATE POLICY "Sistema pode inserir histórico"
ON "report_history"
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Passo 5: Testar
1. Acesse o painel do estudante
2. Vá para **Relatórios** > **Histórico**
3. Gere um relatório em qualquer formato (PDF, Word, Excel, CSV ou Texto)
4. Volte para a aba **Histórico**
5. Você deverá ver o relatório gerado na lista!

## Verificar Logs
Para verificar se o histórico está sendo salvo corretamente:

1. Abra as **DevTools** do navegador (F12)
2. Vá para a aba **Console**
3. Gere um relatório
4. Procure pelos logs:
   - `📊 Salvando histórico de relatório:` - Indica que o salvamento iniciou
   - `✅ Histórico de relatório salvo com sucesso:` - Indica sucesso
   - `❌ Erro ao salvar histórico do relatório:` - Indica erro (veja detalhes)

## Estrutura de Dados do Histórico

Cada entrada no histórico contém:

```typescript
{
  id: "uuid-aleatorio",
  student_id: "id-do-estudante",
  student_name: "Nome do Estudante",
  student_email: "email@estudante.com",
  report_type: "quick" | "custom",
  template: "complete" | "performance" | "attendances" | "trainings" | "custom",
  format: "pdf" | "docx" | "excel" | "csv" | "txt",
  custom_template: { /* configurações customizadas */ } | null,
  stats: {
    totalAttendances: 15,
    completedAttendances: 12,
    cancelledAttendances: 1,
    scheduledAttendances: 2,
    inProgressAttendances: 0,
    noShowAttendances: 0,
    successRate: 80,
    avgRating: 4.5,
    avgPerformanceScore: 4.2,
    completedTrainings: 5,
    totalTrainings: 8,
    totalFeedbacks: 10,
    avgFeedbackRating: 4.7
  },
  total_attendances: 15,
  completed_attendances: 12,
  total_trainings: 8,
  completed_trainings: 5,
  success_rate: 80.0,
  avg_rating: 4.5,
  generated_at: "2025-10-10T14:30:00.000Z",
  file_size: 245678 // em bytes
}
```

## Endpoints Disponíveis

### Gerar Relatório (GET)
```
GET /api/students/reports-advanced?format=pdf&template=complete
```

### Gerar Relatório Customizado (POST)
```
POST /api/students/reports-advanced
Content-Type: application/json

{
  "format": "pdf",
  "template": {
    "title": "Meu Relatório Personalizado",
    "subtitle": "Sistema NAF",
    "includeSummary": true,
    "includeAttendances": true,
    "includeTrainings": false,
    "includeEvaluations": true,
    "includeCharts": false
  }
}
```

### Buscar Histórico (GET)
```
GET /api/students/reports-advanced/history?page=1&limit=10
```

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reportType": "quick",
      "template": "complete",
      "format": "pdf",
      "generatedAt": "2025-10-10T14:30:00.000Z",
      "fileSize": 245678,
      "stats": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Troubleshooting

### Erro: "relation 'report_history' does not exist"
**Causa**: A tabela ainda não foi criada
**Solução**: Execute o SQL do Passo 2

### Erro: "permission denied for table report_history"
**Causa**: RLS está bloqueando o acesso
**Solução**: Execute as políticas do Passo 4

### Histórico vazio mesmo após gerar relatórios
**Causa**: Políticas RLS incorretas ou student_id não corresponde
**Solução**:
1. Verifique os logs do console (F12)
2. Verifique se `auth.uid()` corresponde ao `student_id`
3. Temporariamente desabilite RLS para testar:
   ```sql
   ALTER TABLE "report_history" DISABLE ROW LEVEL SECURITY;
   ```

## Suporte
Se tiver problemas, verifique:
1. Console do navegador (F12) para logs
2. Logs do servidor Next.js
3. SQL Editor do Supabase para verificar se a tabela existe
