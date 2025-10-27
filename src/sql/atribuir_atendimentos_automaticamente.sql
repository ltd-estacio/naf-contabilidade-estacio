-- 🔧 SOLUÇÃO: Atribuir atendimentos fiscais aos estudantes automaticamente

-- Este script resolve o problema de atendimentos que não aparecem
-- para os estudantes porque não foram atribuídos (assigned_student_id = NULL)

-- OPÇÃO 1: Atribuir todos os atendimentos ao PRIMEIRO estudante
-- (Útil para testes ou quando há apenas um estudante)

DO $$
DECLARE
    primeiro_estudante_id UUID;
    atendimentos_atualizados INTEGER;
BEGIN
    -- Buscar o primeiro estudante cadastrado
    SELECT id INTO primeiro_estudante_id
    FROM students
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF primeiro_estudante_id IS NULL THEN
        RAISE EXCEPTION '❌ Nenhum estudante encontrado! Cadastre estudantes primeiro.';
    END IF;
    
    -- Atribuir todos os atendimentos sem estudante ao primeiro estudante
    UPDATE fiscal_appointments
    SET 
        assigned_student_id = primeiro_estudante_id,
        updated_at = NOW()
    WHERE assigned_student_id IS NULL;
    
    GET DIAGNOSTICS atendimentos_atualizados = ROW_COUNT;
    
    RAISE NOTICE '✅ SUCESSO!';
    RAISE NOTICE '   % atendimentos foram atribuídos ao estudante: %', 
                 atendimentos_atualizados, 
                 (SELECT name FROM students WHERE id = primeiro_estudante_id);
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Agora o estudante pode ver os atendimentos no painel!';
END $$;

-- ========================================
-- OPÇÃO 2: Atribuir de forma BALANCEADA
-- (Distribui atendimentos igualmente entre todos os estudantes)
-- ========================================

/*
-- DESCOMENTE ESTE BLOCO PARA USAR A OPÇÃO 2:

DO $$
DECLARE
    rec RECORD;
    estudante_atual UUID;
    estudantes UUID[];
    idx INTEGER := 1;
    total INTEGER;
BEGIN
    -- Buscar todos os estudantes
    SELECT ARRAY_AGG(id ORDER BY created_at) INTO estudantes
    FROM students;
    
    IF estudantes IS NULL OR ARRAY_LENGTH(estudantes, 1) = 0 THEN
        RAISE EXCEPTION '❌ Nenhum estudante encontrado! Cadastre estudantes primeiro.';
    END IF;
    
    RAISE NOTICE '📋 Distribuindo atendimentos entre % estudantes...', ARRAY_LENGTH(estudantes, 1);
    
    -- Atribuir cada atendimento sem estudante de forma rotativa
    FOR rec IN 
        SELECT id 
        FROM fiscal_appointments 
        WHERE assigned_student_id IS NULL
        ORDER BY created_at ASC
    LOOP
        -- Pegar o estudante atual (rotativo)
        estudante_atual := estudantes[((idx - 1) % ARRAY_LENGTH(estudantes, 1)) + 1];
        
        -- Atribuir o atendimento
        UPDATE fiscal_appointments
        SET 
            assigned_student_id = estudante_atual,
            updated_at = NOW()
        WHERE id = rec.id;
        
        idx := idx + 1;
    END LOOP;
    
    GET DIAGNOSTICS total = ROW_COUNT;
    
    RAISE NOTICE '✅ SUCESSO!';
    RAISE NOTICE '   % atendimentos foram distribuídos entre os estudantes.', total;
    RAISE NOTICE '';
    
    -- Mostrar distribuição
    FOR rec IN 
        SELECT 
            s.name,
            s.email,
            COUNT(fa.id) as total_atendimentos
        FROM students s
        LEFT JOIN fiscal_appointments fa ON fa.assigned_student_id = s.id
        GROUP BY s.id, s.name, s.email
        ORDER BY total_atendimentos DESC
    LOOP
        RAISE NOTICE '   👤 %: % atendimentos', rec.name, rec.total_atendimentos;
    END LOOP;
END $$;
*/

-- ========================================
-- OPÇÃO 3: Atribuir atendimentos RECENTES
-- (Útil para atribuir apenas os últimos atendimentos)
-- ========================================

/*
-- DESCOMENTE ESTE BLOCO PARA USAR A OPÇÃO 3:

DO $$
DECLARE
    primeiro_estudante_id UUID;
    atendimentos_atualizados INTEGER;
BEGIN
    SELECT id INTO primeiro_estudante_id
    FROM students
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF primeiro_estudante_id IS NULL THEN
        RAISE EXCEPTION '❌ Nenhum estudante encontrado!';
    END IF;
    
    -- Atribuir apenas atendimentos das últimas 24 horas
    UPDATE fiscal_appointments
    SET 
        assigned_student_id = primeiro_estudante_id,
        updated_at = NOW()
    WHERE assigned_student_id IS NULL
    AND created_at > NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS atendimentos_atualizados = ROW_COUNT;
    
    RAISE NOTICE '✅ % atendimentos recentes atribuídos!', atendimentos_atualizados;
END $$;
*/

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se todos os atendimentos têm estudante atribuído
SELECT 
    COUNT(*) FILTER (WHERE assigned_student_id IS NOT NULL) as com_estudante,
    COUNT(*) FILTER (WHERE assigned_student_id IS NULL) as sem_estudante,
    COUNT(*) as total
FROM fiscal_appointments;

-- Mostrar distribuição por estudante
SELECT 
    COALESCE(s.name, '⚠️ SEM ESTUDANTE') as estudante,
    COALESCE(s.email, '-') as email,
    COUNT(fa.id) as total_atendimentos,
    string_agg(DISTINCT fa.status, ', ') as status_variedade
FROM fiscal_appointments fa
LEFT JOIN students s ON s.id = fa.assigned_student_id
GROUP BY s.id, s.name, s.email
ORDER BY total_atendimentos DESC;
