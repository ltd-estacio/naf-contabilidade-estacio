-- ==================================================
-- TABELAS PARA SISTEMA DE BACKUP PROFISSIONAL
-- Central de Backup do Coordenador
-- ==================================================

-- Tabela de Feedbacks de Atendimentos Fiscais
CREATE TABLE IF NOT EXISTS public.fiscal_appointment_feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  attendance_quality integer CHECK (attendance_quality >= 1 AND attendance_quality <= 5),
  punctuality integer CHECK (punctuality >= 1 AND punctuality <= 5),
  professionalism integer CHECK (professionalism >= 1 AND professionalism <= 5),
  problem_resolution integer CHECK (problem_resolution >= 1 AND problem_resolution <= 5),
  would_recommend boolean DEFAULT true,
  additional_comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fiscal_appointment_feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT fk_appointment FOREIGN KEY (appointment_id) REFERENCES public.fiscal_appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL
);

-- Tabela de Logs de Backup
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL,
  coordinator_name character varying NOT NULL,
  coordinator_email character varying NOT NULL,
  backup_type character varying NOT NULL CHECK (backup_type IN ('download', 'email', 'preview')),
  export_format character varying NOT NULL CHECK (export_format IN ('csv', 'json', 'pdf', 'excel', 'txt', 'docx')),
  file_size_kb numeric,
  total_records integer NOT NULL DEFAULT 0,
  filter_applied jsonb,
  date_range jsonb,
  status_filter character varying[],
  ip_address character varying,
  user_agent text,
  download_url text,
  email_sent_to character varying,
  success boolean DEFAULT true,
  error_message text,
  execution_time_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT backup_logs_pkey PRIMARY KEY (id)
);

-- Tabela de Configurações de Backup
CREATE TABLE IF NOT EXISTS public.backup_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL,
  auto_backup_enabled boolean DEFAULT false,
  auto_backup_frequency character varying CHECK (auto_backup_frequency IN ('daily', 'weekly', 'monthly')),
  auto_backup_time time without time zone DEFAULT '02:00:00',
  default_export_format character varying DEFAULT 'csv',
  include_feedbacks boolean DEFAULT true,
  include_student_info boolean DEFAULT true,
  include_client_info boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  notification_email character varying,
  retention_days integer DEFAULT 90,
  encryption_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT backup_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT unique_coordinator UNIQUE (coordinator_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_backup_logs_coordinator ON public.backup_logs(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_backup_type ON public.backup_logs(backup_type);
CREATE INDEX IF NOT EXISTS idx_feedback_appointment ON public.fiscal_appointment_feedbacks(appointment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON public.fiscal_appointment_feedbacks(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.fiscal_appointment_feedbacks(created_at DESC);

-- Comentários nas tabelas
COMMENT ON TABLE public.fiscal_appointment_feedbacks IS 'Armazena feedbacks detalhados dos atendimentos fiscais realizados pelos estudantes';
COMMENT ON TABLE public.backup_logs IS 'Registra todos os acessos e downloads de backup realizados pelos coordenadores';
COMMENT ON TABLE public.backup_configurations IS 'Configurações personalizadas de backup para cada coordenador';

-- Views úteis
CREATE OR REPLACE VIEW public.vw_backup_statistics AS
SELECT
  coordinator_id,
  coordinator_name,
  COUNT(*) as total_backups,
  COUNT(CASE WHEN backup_type = 'download' THEN 1 END) as total_downloads,
  COUNT(CASE WHEN backup_type = 'email' THEN 1 END) as total_emails,
  COUNT(CASE WHEN backup_type = 'preview' THEN 1 END) as total_previews,
  SUM(total_records) as total_records_exported,
  SUM(file_size_kb) as total_size_kb,
  AVG(execution_time_ms) as avg_execution_time_ms,
  MAX(created_at) as last_backup_date,
  COUNT(CASE WHEN success = false THEN 1 END) as failed_backups
FROM public.backup_logs
GROUP BY coordinator_id, coordinator_name;

COMMENT ON VIEW public.vw_backup_statistics IS 'Estatísticas consolidadas de backup por coordenador';
