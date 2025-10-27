-- 🔍 DIAGNÓSTICO: Por que atendimentos não aparecem para o estudante?

-- 1. Ver todos os atendimentos fiscais
SELECT 
    id,
    protocol,
    service_title,
    client_name,
    status,
    assigned_student_id,
    created_at
FROM fiscal_appointments
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver quantos atendimentos TÊM estudante atribuído
SELECT 
    COUNT(*) as total,
    COUNT(assigned_student_id) as com_estudante,
    COUNT(*) - COUNT(assigned_student_id) as sem_estudante
FROM fiscal_appointments;

-- 3. Ver atendimentos SEM estudante atribuído
SELECT 
    protocol,
    service_title,
    client_name,
    status,
    created_at
FROM fiscal_appointments
WHERE assigned_student_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- 4. Ver todos os estudantes cadastrados
SELECT 
    id,
    name,
    email,
    course,
    semester
FROM students
ORDER BY created_at DESC;

-- 5. Ver atendimentos por estudante
SELECT 
    s.name as estudante,
    s.email,
    COUNT(fa.id) as total_atendimentos,
    COUNT(CASE WHEN fa.status = 'PENDENTE' THEN 1 END) as pendentes,
    COUNT(CASE WHEN fa.status = 'CONFIRMADO' THEN 1 END) as confirmados,
    COUNT(CASE WHEN fa.status = 'EM_ANDAMENTO' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN fa.status = 'CONCLUIDO' THEN 1 END) as concluidos
FROM students s
LEFT JOIN fiscal_appointments fa ON fa.assigned_student_id = s.id
GROUP BY s.id, s.name, s.email
ORDER BY total_atendimentos DESC;

-- 6. Ver estrutura da tabela fiscal_appointments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fiscal_appointments'
AND column_name IN ('id', 'assigned_student_id', 'student_id', 'student_name')
ORDER BY ordinal_position;

-- 7. Ver atendimentos recentes (últimas 24h)
SELECT 
    protocol,
    service_title,
    client_name,
    assigned_student_id,
    CASE 
        WHEN assigned_student_id IS NULL THEN '❌ SEM ESTUDANTE'
        ELSE '✅ COM ESTUDANTE'
    END as status_atribuicao,
    created_at,
    NOW() - created_at as tempo_desde_criacao
FROM fiscal_appointments
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 8. SOLUÇÃO: Ver se há atendimentos que precisam ser atribuídos
DO $$
DECLARE
    sem_estudante INTEGER;
    total_estudantes INTEGER;
BEGIN
    SELECT COUNT(*) INTO sem_estudante
    FROM fiscal_appointments
    WHERE assigned_student_id IS NULL;
    
    SELECT COUNT(*) INTO total_estudantes
    FROM students;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 DIAGNÓSTICO COMPLETO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Atendimentos SEM estudante: %', sem_estudante;
    RAISE NOTICE 'Total de estudantes: %', total_estudantes;
    RAISE NOTICE '';
    
    IF sem_estudante > 0 AND total_estudantes > 0 THEN
        RAISE NOTICE '⚠️  PROBLEMA IDENTIFICADO!';
        RAISE NOTICE '   % atendimentos não foram atribuídos a nenhum estudante.', sem_estudante;
        RAISE NOTICE '';
        RAISE NOTICE '✅ SOLUÇÃO:';
        RAISE NOTICE '   Execute o script: src/sql/atribuir_atendimentos_automaticamente.sql';
        RAISE NOTICE '   OU atribua manualmente pelo painel do coordenador.';
    ELSIF total_estudantes = 0 THEN
        RAISE NOTICE '❌ ERRO: Não há estudantes cadastrados!';
        RAISE NOTICE '   Cadastre estudantes primeiro.';
    ELSE
        RAISE NOTICE '✅ OK: Todos os atendimentos estão atribuídos!';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;
