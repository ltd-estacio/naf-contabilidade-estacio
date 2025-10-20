-- CreateTable: backup_logs
-- Tabela para armazenar histórico completo de backups realizados

CREATE TABLE "backup_logs" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "coordinatorName" TEXT NOT NULL,
    "coordinatorEmail" TEXT NOT NULL,
    "backupType" TEXT NOT NULL,
    "exportFormat" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "fileSizeKb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "includeMetadata" BOOLEAN NOT NULL DEFAULT true,
    "compressed" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "emailSentTo" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backup_logs_coordinatorId_createdAt_idx" ON "backup_logs"("coordinatorId", "createdAt");

-- CreateIndex
CREATE INDEX "backup_logs_backupType_createdAt_idx" ON "backup_logs"("backupType", "createdAt");

-- Comentários nas colunas
COMMENT ON TABLE "backup_logs" IS 'Histórico completo de backups realizados pelos coordenadores';
COMMENT ON COLUMN "backup_logs"."backupType" IS 'Tipo de backup: download, email, preview, scheduled';
COMMENT ON COLUMN "backup_logs"."exportFormat" IS 'Formato de exportação: csv, json, excel, txt, pdf';
COMMENT ON COLUMN "backup_logs"."filters" IS 'Filtros JSON aplicados no backup (status, datas, etc)';
COMMENT ON COLUMN "backup_logs"."includeMetadata" IS 'Se incluiu metadados completos (timestamps, IPs, etc)';
COMMENT ON COLUMN "backup_logs"."compressed" IS 'Se o arquivo foi comprimido (.zip)';
