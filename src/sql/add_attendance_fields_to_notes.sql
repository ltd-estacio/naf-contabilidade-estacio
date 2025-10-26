-- Migration: Adiciona campos de registro de atendimento à tabela fiscal_appointment_notes
-- Data: 2024
-- Descrição: Adiciona campos step_by_step, stages, summary e note_type para melhor organização das anotações

-- Verifica se os campos já existem antes de adicionar
DO $$
BEGIN
    -- Adiciona campo note_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fiscal_appointment_notes' 
        AND column_name = 'note_type'
    ) THEN
        ALTER TABLE public.fiscal_appointment_notes 
        ADD COLUMN note_type TEXT DEFAULT 'GERAL';
        
        COMMENT ON COLUMN public.fiscal_appointment_notes.note_type IS 'Tipo da anotação: REGISTRO_INICIAL, ATUALIZACAO, GERAL';
    END IF;

    -- Adiciona campo step_by_step se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fiscal_appointment_notes' 
        AND column_name = 'step_by_step'
    ) THEN
        ALTER TABLE public.fiscal_appointment_notes 
        ADD COLUMN step_by_step TEXT;
        
        COMMENT ON COLUMN public.fiscal_appointment_notes.step_by_step IS 'Passo a passo detalhado do atendimento';
    END IF;

    -- Adiciona campo stages se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fiscal_appointment_notes' 
        AND column_name = 'stages'
    ) THEN
        ALTER TABLE public.fiscal_appointment_notes 
        ADD COLUMN stages TEXT;
        
        COMMENT ON COLUMN public.fiscal_appointment_notes.stages IS 'Etapas principais do processo de atendimento';
    END IF;

    -- Adiciona campo summary se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fiscal_appointment_notes' 
        AND column_name = 'summary'
    ) THEN
        ALTER TABLE public.fiscal_appointment_notes 
        ADD COLUMN summary TEXT;
        
        COMMENT ON COLUMN public.fiscal_appointment_notes.summary IS 'Resumo objetivo do atendimento';
    END IF;

    -- Torna o campo note opcional (era NOT NULL)
    ALTER TABLE public.fiscal_appointment_notes 
    ALTER COLUMN note DROP NOT NULL;
    
    COMMENT ON COLUMN public.fiscal_appointment_notes.note IS 'Anotações gerais e observações adicionais (campo legado)';

END $$;

-- Cria índice para melhorar performance de busca por tipo de nota
CREATE INDEX IF NOT EXISTS idx_fiscal_appointment_notes_type 
ON public.fiscal_appointment_notes(note_type);

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Campos de registro de atendimento adicionados com sucesso!';
    RAISE NOTICE '   - note_type: Tipo da anotação';
    RAISE NOTICE '   - step_by_step: Passo a passo do atendimento';
    RAISE NOTICE '   - stages: Etapas do processo';
    RAISE NOTICE '   - summary: Resumo objetivo';
END $$;
