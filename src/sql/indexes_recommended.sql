-- Recommended performance indexes for NAF Management dashboards
-- Safe to run multiple times (IF NOT EXISTS)

-- fiscal_appointments: status fast filtering and time-ordered scans
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_status_created_at
  ON public.fiscal_appointments (status, created_at DESC);

-- fiscal_appointments: category aggregations and ordering
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_service_category
  ON public.fiscal_appointments (service_category);

CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_category_created_at
  ON public.fiscal_appointments (service_category, created_at DESC);

-- students: already recommended, but keep for completeness (won't duplicate)
CREATE INDEX IF NOT EXISTS idx_students_status
  ON public.students (status);

