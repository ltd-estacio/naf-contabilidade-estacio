-- Adicionar coluna client_category à tabela fiscal_appointments
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS client_category VARCHAR(50);

-- Adicionar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_client_category
ON fiscal_appointments(client_category);

-- Atualizar registros existentes com categoria baseada no service_details
UPDATE fiscal_appointments
SET client_category = service_details->>'clientCategory'
WHERE service_details IS NOT NULL
AND service_details->>'clientCategory' IS NOT NULL
AND client_category IS NULL;
