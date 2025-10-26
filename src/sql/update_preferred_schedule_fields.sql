-- Atualiza campos preferred_date/preferred_time na tabela fiscal_appointments
-- Garante que os agendamentos do site utilizem a data real marcada pelo usuário

-- 1) Preenche preferred_date com scheduled_at::date quando estiver vazio
UPDATE public.fiscal_appointments
SET preferred_date = scheduled_at::date
WHERE preferred_date IS NULL
  AND scheduled_at IS NOT NULL;

-- 2) Preenche preferred_time com scheduled_at::time quando estiver vazio
UPDATE public.fiscal_appointments
SET preferred_time = scheduled_at::time
WHERE preferred_time IS NULL
  AND scheduled_at IS NOT NULL;

-- 3) Ajusta preferred_period com base no horário quando ainda não preenchido
UPDATE public.fiscal_appointments
SET preferred_period = CASE
    WHEN preferred_time IS NULL THEN preferred_period
    WHEN preferred_time < TIME '12:00' THEN 'MANHA'
    WHEN preferred_time < TIME '18:00' THEN 'TARDE'
    ELSE 'NOITE'
  END
WHERE preferred_time IS NOT NULL
  AND (preferred_period IS NULL OR preferred_period NOT IN ('MANHA', 'TARDE', 'NOITE'));

-- 4) Ajusta campos existentes inconsistentes (preferred_date zerada)
UPDATE public.fiscal_appointments
SET preferred_date = created_at::date
WHERE preferred_date IS NULL
  AND scheduled_at IS NULL
  AND preferred_time IS NOT NULL;

-- Após executar o script, recomenda-se validar rapidamente:
-- SELECT protocol, preferred_date, preferred_time, preferred_period
-- FROM public.fiscal_appointments
-- ORDER BY created_at DESC
