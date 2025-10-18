-- ==========================================
-- Script para Corrigir Tabela students
-- ==========================================
-- Adiciona colunas faltantes para registro de estudantes

-- Adicionar coluna registration_year (ano de ingresso)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS registration_year INTEGER;

-- Adicionar coluna registration_semester (semestre de ingresso: 1 ou 2)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS registration_semester INTEGER;

-- Adicionar coluna university (universidade)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'Universidade Estácio de Sá';

-- Atualizar valores NULL para dados padrão
UPDATE public.students
SET
  registration_year = COALESCE(registration_year, EXTRACT(YEAR FROM created_at)::INTEGER),
  registration_semester = COALESCE(registration_semester,
    CASE
      WHEN EXTRACT(MONTH FROM created_at) <= 6 THEN 1
      ELSE 2
    END),
  university = COALESCE(university, 'Universidade Estácio de Sá')
WHERE registration_year IS NULL
   OR registration_semester IS NULL
   OR university IS NULL;

-- Verificar estrutura atualizada
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'students'
  AND column_name IN ('registration_year', 'registration_semester', 'university')
ORDER BY column_name;

-- Verificar dados
SELECT
  id,
  name,
  email,
  course,
  semester,
  registration_year,
  registration_semester,
  university,
  status,
  created_at
FROM public.students
ORDER BY created_at DESC
LIMIT 5;

