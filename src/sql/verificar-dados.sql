-- ================================================
-- SCRIPT DE VERIFICAÇÃO RÁPIDA
-- Execute para verificar se há dados no banco
-- ================================================

-- 1. Verificar quantos estudantes existem
SELECT
    'ESTUDANTES' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ATIVO' THEN 1 END) as ativos
FROM students;

-- 2. Verificar quantos atendimentos existem
SELECT
    'ATENDIMENTOS' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END) as concluidos,
    COUNT(CASE WHEN client_satisfaction_rating IS NOT NULL THEN 1 END) as com_avaliacao
FROM attendances;

-- 3. Verificar quantos serviços existem
SELECT
    'SERVIÇOS' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos
FROM naf_services;

-- 4. Se há atendimentos, mostrar detalhes
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

-- 5. Estatísticas completas
SELECT
    COUNT(*) as "Total Atendimentos",
    COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END) as "Concluídos",
    ROUND((COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END)::numeric / COUNT(*) * 100), 1) as "Taxa Conclusão %",
    COUNT(CASE WHEN client_satisfaction_rating IS NOT NULL THEN 1 END) as "Com Avaliação",
    ROUND(AVG(client_satisfaction_rating)::numeric, 2) as "Satisfação Média",
    ROUND(AVG(duration_minutes)::numeric, 0) as "Duração Média (min)"
FROM attendances;

-- 6. Atendimentos recentes (últimos 30 dias)
SELECT
    protocol as "Protocolo",
    student_name as "Estudante",
    client_name as "Cliente",
    service_type as "Serviço",
    status as "Status",
    client_satisfaction_rating as "Avaliação",
    to_char(created_at, 'DD/MM/YYYY HH24:MI') as "Data Criação"
FROM attendances
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 20;

-- 7. DIAGNÓSTICO FINAL
DO $$
DECLARE
    total_students INT;
    total_attendances INT;
    total_services INT;
BEGIN
    SELECT COUNT(*) INTO total_students FROM students WHERE status = 'ATIVO';
    SELECT COUNT(*) INTO total_attendances FROM attendances;
    SELECT COUNT(*) INTO total_services FROM naf_services WHERE status = 'ativo';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNÓSTICO DO BANCO DE DADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Estudantes Ativos: %', total_students;
    RAISE NOTICE 'Atendimentos: %', total_attendances;
    RAISE NOTICE 'Serviços Ativos: %', total_services;
    RAISE NOTICE '========================================';

    IF total_students = 0 THEN
        RAISE WARNING '❌ SEM ESTUDANTES: Crie estudantes primeiro!';
    ELSE
        RAISE NOTICE '✅ Estudantes OK';
    END IF;

    IF total_attendances = 0 THEN
        RAISE WARNING '❌ SEM ATENDIMENTOS: Execute o script seed-auto.sql';
    ELSE
        RAISE NOTICE '✅ Atendimentos OK';
    END IF;

    IF total_services = 0 THEN
        RAISE WARNING '⚠️ SEM SERVIÇOS: Cadastre serviços';
    ELSE
        RAISE NOTICE '✅ Serviços OK';
    END IF;

    RAISE NOTICE '========================================';
END $$;
