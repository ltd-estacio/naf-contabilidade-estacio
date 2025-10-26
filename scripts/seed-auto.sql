-- ================================================
-- SCRIPT AUTOMÁTICO DE SEED - ATENDIMENTOS
-- Execute este script DIRETO no Supabase SQL Editor
-- NÃO precisa substituir nenhum ID manualmente!
-- ================================================

-- 1. VERIFICAR SE HÁ ESTUDANTES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM students WHERE status = 'ATIVO' LIMIT 1) THEN
        RAISE EXCEPTION 'ERRO: Não há estudantes ativos. Crie pelo menos 1 estudante primeiro!';
    END IF;
END $$;

-- 2. LIMPAR ATENDIMENTOS ANTIGOS (OPCIONAL - COMENTE SE NÃO QUISER)
-- TRUNCATE attendances CASCADE;

-- 3. INSERIR ATENDIMENTOS AUTOMATICAMENTE
DO $$
DECLARE
    student_record RECORD;
    student_count INT := 0;
BEGIN
    -- Para cada estudante ativo, criar atendimentos
    FOR student_record IN
        SELECT id, name FROM students WHERE status = 'ATIVO' LIMIT 10
    LOOP
        student_count := student_count + 1;

        RAISE NOTICE 'Criando atendimentos para: %', student_record.name;

        -- Atendimento 1: CONCLUÍDO com alta satisfação (5 estrelas)
        INSERT INTO attendances (
            protocol,
            student_id,
            student_name,
            client_name,
            client_category,
            service_type,
            scheduled_date,
            scheduled_time,
            status,
            client_satisfaction_rating,
            duration_minutes,
            client_feedback,
            created_at,
            completed_at
        ) VALUES (
            'PROT-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(student_count::text, 4, '0') || 'A',
            student_record.id,
            student_record.name,
            'Cliente Teste ' || student_count || 'A',
            'PESSOA_FISICA',
            'ORIENTACAO_TRIBUTARIA',
            (NOW() - INTERVAL '5 days')::date,
            '09:00:00',
            'CONCLUIDO',
            5,
            45,
            'Excelente atendimento!',
            NOW() - INTERVAL '5 days',
            NOW() - INTERVAL '5 days'
        );

        -- Atendimento 2: CONCLUÍDO com boa satisfação (4 estrelas)
        INSERT INTO attendances (
            protocol,
            student_id,
            student_name,
            client_name,
            client_category,
            service_type,
            scheduled_date,
            scheduled_time,
            status,
            client_satisfaction_rating,
            duration_minutes,
            client_feedback,
            created_at,
            completed_at
        ) VALUES (
            'PROT-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(student_count::text, 4, '0') || 'B',
            student_record.id,
            student_record.name,
            'Cliente Teste ' || student_count || 'B',
            'PESSOA_FISICA',
            'DECLARACAO_IR',
            (NOW() - INTERVAL '3 days')::date,
            '10:00:00',
            'CONCLUIDO',
            4,
            60,
            'Muito bom!',
            NOW() - INTERVAL '3 days',
            NOW() - INTERVAL '3 days'
        );

        -- Atendimento 3: CONCLUÍDO com alta satisfação (5 estrelas)
        INSERT INTO attendances (
            protocol,
            student_id,
            student_name,
            client_name,
            client_category,
            service_type,
            scheduled_date,
            scheduled_time,
            status,
            client_satisfaction_rating,
            duration_minutes,
            client_feedback,
            created_at,
            completed_at
        ) VALUES (
            'PROT-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(student_count::text, 4, '0') || 'C',
            student_record.id,
            student_record.name,
            'Cliente Teste ' || student_count || 'C',
            'PESSOA_FISICA',
            'ABERTURA_MEI',
            (NOW() - INTERVAL '2 days')::date,
            '14:00:00',
            'CONCLUIDO',
            5,
            30,
            'Perfeito!',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days'
        );

        -- Atendimento 4: EM_ANDAMENTO (sem avaliação)
        INSERT INTO attendances (
            protocol,
            student_id,
            student_name,
            client_name,
            client_category,
            service_type,
            scheduled_date,
            scheduled_time,
            status,
            created_at
        ) VALUES (
            'PROT-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(student_count::text, 4, '0') || 'D',
            student_record.id,
            student_record.name,
            'Cliente Teste ' || student_count || 'D',
            'PESSOA_JURIDICA',
            'CONSULTORIA_CONTABIL',
            (NOW() + INTERVAL '2 days')::date,
            '15:00:00',
            'EM_ANDAMENTO',
            NOW()
        );

    END LOOP;

    RAISE NOTICE '✅ Total de atendimentos criados: %', student_count * 4;
END $$;

-- 4. VERIFICAR DADOS INSERIDOS
SELECT
    s.name as estudante,
    COUNT(a.id) as total_atendimentos,
    COUNT(CASE WHEN a.status = 'CONCLUIDO' THEN 1 END) as concluidos,
    ROUND(AVG(a.client_satisfaction_rating)::numeric, 2) as satisfacao_media,
    ROUND(AVG(a.duration_minutes)::numeric, 0) as duracao_media
FROM students s
LEFT JOIN attendances a ON s.id = a.student_id
WHERE s.status = 'ATIVO'
GROUP BY s.id, s.name
ORDER BY total_atendimentos DESC;

-- 5. ESTATÍSTICAS GERAIS
SELECT
    COUNT(*) as total_atendimentos,
    COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END) as concluidos,
    COUNT(CASE WHEN client_satisfaction_rating IS NOT NULL THEN 1 END) as com_avaliacao,
    ROUND(AVG(client_satisfaction_rating)::numeric, 2) as satisfacao_media,
    ROUND(AVG(duration_minutes)::numeric, 0) as duracao_media,
    ROUND((COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END)::numeric / COUNT(*) * 100), 1) as taxa_conclusao
FROM attendances;

-- 6. MENSAGEM FINAL
DO $$
DECLARE
    total_records INT;
BEGIN
    SELECT COUNT(*) INTO total_records FROM attendances;

    IF total_records > 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ SUCESSO!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Total de atendimentos criados: %', total_records;
        RAISE NOTICE '';
        RAISE NOTICE 'Agora:';
        RAISE NOTICE '1. Volte ao dashboard';
        RAISE NOTICE '2. Clique em "Atualizar"';
        RAISE NOTICE '3. Os dados devem aparecer!';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'Nenhum atendimento foi criado. Verifique se há estudantes ativos.';
    END IF;
END $$;
