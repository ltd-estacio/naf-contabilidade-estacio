-- 🎓 FUNÇÃO: Verificar e Marcar Estudantes Graduados

-- Esta função verifica se há estudantes que já completaram seus cursos
-- e os marca como graduados automaticamente

-- Primeiro, remover a função existente se houver
DROP FUNCTION IF EXISTS check_and_mark_graduated_students();

-- Criar a função com a nova estrutura
CREATE OR REPLACE FUNCTION check_and_mark_graduated_students()
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    course TEXT,
    semester_number INTEGER,
    course_duration INTEGER,
    was_marked_graduated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH students_to_graduate AS (
        SELECT 
            s.id,
            s.name,
            s.course,
            CAST(REGEXP_REPLACE(s.semester, '[^0-9]', '', 'g') AS INTEGER) as current_semester,
            8 as course_duration, -- Duração padrão para Ciências Contábeis
            s.is_graduated
        FROM students s
        WHERE 
            s.status = 'ATIVO'
            AND s.is_graduated IS FALSE
            AND CAST(REGEXP_REPLACE(s.semester, '[^0-9]', '', 'g') AS INTEGER) >= 8
    ),
    updated_students AS (
        UPDATE students
        SET 
            is_graduated = TRUE,
            graduation_date = CURRENT_DATE,
            status = 'GRADUADO',
            updated_at = NOW()
        WHERE id IN (SELECT id FROM students_to_graduate)
        RETURNING id
    )
    SELECT 
        stg.id as student_id,
        stg.name as student_name,
        stg.course,
        stg.current_semester as semester_number,
        8 as course_duration, -- Duração padrão para Ciências Contábeis
        TRUE as was_marked_graduated
    FROM students_to_graduate stg
    WHERE stg.id IN (SELECT id FROM updated_students);
END;
$$ LANGUAGE plpgsql;

-- Comentário da função
COMMENT ON FUNCTION check_and_mark_graduated_students() IS 
'Verifica estudantes que completaram seus cursos e os marca como graduados automaticamente';

-- Testar a função
-- SELECT * FROM check_and_mark_graduated_students();

-- Verificar se há estudantes prontos para graduar
SELECT 
    s.id,
    s.name,
    s.course,
    s.semester,
    CAST(REGEXP_REPLACE(s.semester, '[^0-9]', '', 'g') AS INTEGER) as semester_number,
    8 as course_duration, -- Duração padrão para Ciências Contábeis
    s.is_graduated,
    s.status,
    CASE 
        WHEN CAST(REGEXP_REPLACE(s.semester, '[^0-9]', '', 'g') AS INTEGER) >= 8
        THEN '✅ PRONTO PARA GRADUAR'
        ELSE '❌ AINDA CURSANDO'
    END as graduation_status
FROM students s
WHERE 
    s.status = 'ATIVO'
ORDER BY s.semester DESC;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Função check_and_mark_graduated_students criada!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Para testar, execute:';
    RAISE NOTICE '   SELECT * FROM check_and_mark_graduated_students();';
    RAISE NOTICE '';
    RAISE NOTICE '🎓 A função vai:';
    RAISE NOTICE '   1. Verificar estudantes no último semestre';
    RAISE NOTICE '   2. Marcar como graduados (is_graduated = TRUE)';
    RAISE NOTICE '   3. Mudar status para GRADUADO';
    RAISE NOTICE '   4. Adicionar data de graduação';
    RAISE NOTICE '========================================';
END $$;
