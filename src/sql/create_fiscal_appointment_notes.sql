-- Cria tabela para registrar notas de andamento dos atendimentos fiscais
CREATE TABLE IF NOT EXISTS public.fiscal_appointment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.fiscal_appointments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id),
    student_name TEXT,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atualiza automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.fiscal_appointment_notes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_fiscal_appointment_notes_updated_at ON public.fiscal_appointment_notes;
CREATE TRIGGER trig_fiscal_appointment_notes_updated_at
    BEFORE UPDATE ON public.fiscal_appointment_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.fiscal_appointment_notes_set_updated_at();

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_fiscal_appointment_notes_appointment
    ON public.fiscal_appointment_notes(appointment_id, created_at);

CREATE INDEX IF NOT EXISTS idx_fiscal_appointment_notes_student
    ON public.fiscal_appointment_notes(student_id);

COMMENT ON TABLE public.fiscal_appointment_notes IS 'Notas e registros feitos pelos estudantes durante o atendimento fiscal.';
COMMENT ON COLUMN public.fiscal_appointment_notes.note IS 'Descrição livre do andamento do atendimento.';
