-- Tabela para armazenar feedbacks de atendimentos fiscais
-- Script de criação da tabela fiscal_appointment_feedbacks

CREATE TABLE IF NOT EXISTS public.fiscal_appointment_feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  client_name character varying NOT NULL,
  client_email character varying NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  service_quality integer CHECK (service_quality >= 1 AND service_quality <= 5),
  student_attention integer CHECK (student_attention >= 1 AND student_attention <= 5),
  problem_resolution integer CHECK (problem_resolution >= 1 AND problem_resolution <= 5),
  would_recommend boolean DEFAULT true,
  additional_comments text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fiscal_appointment_feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT fiscal_appointment_feedbacks_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.fiscal_appointments(id) ON DELETE CASCADE
);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_fiscal_feedbacks_appointment_id ON public.fiscal_appointment_feedbacks(appointment_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_feedbacks_rating ON public.fiscal_appointment_feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_fiscal_feedbacks_created_at ON public.fiscal_appointment_feedbacks(created_at);

-- Comentários na tabela
COMMENT ON TABLE public.fiscal_appointment_feedbacks IS 'Tabela para armazenar feedbacks dos clientes sobre atendimentos fiscais';
COMMENT ON COLUMN public.fiscal_appointment_feedbacks.rating IS 'Avaliação geral do atendimento (1-5)';
COMMENT ON COLUMN public.fiscal_appointment_feedbacks.service_quality IS 'Avaliação da qualidade do serviço (1-5)';
COMMENT ON COLUMN public.fiscal_appointment_feedbacks.student_attention IS 'Avaliação da atenção do estudante (1-5)';
COMMENT ON COLUMN public.fiscal_appointment_feedbacks.problem_resolution IS 'Avaliação da resolução do problema (1-5)';
COMMENT ON COLUMN public.fiscal_appointment_feedbacks.would_recommend IS 'Se o cliente recomendaria o serviço';
