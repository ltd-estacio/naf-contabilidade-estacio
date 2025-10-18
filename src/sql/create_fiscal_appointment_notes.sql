-- Cria tabela para registrar notas de andamento dos atendimentos fiscais
CREATE TABLE IF NOT EXISTS public.fiscal_appointment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.fiscal_appointments(id) ON DELETE CASCADE,
    student_id UUID,
    student_name TEXT,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vincula student_id à tabela adequada, quando existir
DO $$
DECLARE
    users_exists BOOLEAN;
    students_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO users_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'students'
    ) INTO students_exists;

    IF users_exists THEN
        BEGIN
            ALTER TABLE public.fiscal_appointment_notes
                ADD CONSTRAINT fk_fiscal_appointment_notes_user
                FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL;
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    ELSIF students_exists THEN
        BEGIN
            ALTER TABLE public.fiscal_appointment_notes
                ADD CONSTRAINT fk_fiscal_appointment_notes_student
                FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END
$$;

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
