-- Adicionar campos para rastreamento de graduação dos estudantes
-- Este script adiciona os campos necessários para controlar quando um estudante se formará

-- Adicionar campos à tabela students
ALTER TABLE students
ADD COLUMN IF NOT EXISTS registration_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN IF NOT EXISTS registration_semester INTEGER DEFAULT CASE
  WHEN EXTRACT(MONTH FROM NOW()) <= 6 THEN 1
  ELSE 2
END,
ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS expected_graduation_semester INTEGER,
ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS graduation_date TIMESTAMP WITH TIME ZONE;

-- Adicionar comentários para documentação
COMMENT ON COLUMN students.registration_year IS 'Ano em que o estudante se cadastrou no sistema (geralmente ano de entrada no curso)';
COMMENT ON COLUMN students.registration_semester IS '1 para primeiro semestre (Jan-Jun), 2 para segundo semestre (Jul-Dez)';
COMMENT ON COLUMN students.expected_graduation_year IS 'Ano esperado de formatura com base no curso e semestre atual';
COMMENT ON COLUMN students.expected_graduation_semester IS 'Semestre esperado de formatura (1 ou 2)';
COMMENT ON COLUMN students.is_graduated IS 'Indica se o estudante já se formou';
COMMENT ON COLUMN students.graduation_date IS 'Data em que o estudante se formou (se aplicável)';

-- Criar índice para consultas de estudantes ativos/graduados
CREATE INDEX IF NOT EXISTS idx_students_is_graduated ON students(is_graduated);
CREATE INDEX IF NOT EXISTS idx_students_registration_year ON students(registration_year);

-- Função para calcular ano e semestre esperado de graduação
CREATE OR REPLACE FUNCTION calculate_expected_graduation(
  p_course VARCHAR(100),
  p_current_semester VARCHAR(20),
  p_registration_year INTEGER,
  p_registration_semester INTEGER
) RETURNS TABLE (
  expected_year INTEGER,
  expected_semester INTEGER
) AS $$
DECLARE
  v_duration INTEGER;
  v_current_semester_number INTEGER;
  v_remaining_semesters INTEGER;
  v_semesters_from_registration INTEGER;
BEGIN
  -- Mapear duração dos cursos (em semestres)
  -- Bacharelados - Geralmente 8 semestres (4 anos)
  -- Licenciaturas - 8 semestres
  -- Tecnólogos - 4-6 semestres
  -- Engenharias e alguns cursos específicos - 10 semestres (5 anos)

  v_duration := CASE
    WHEN p_course IN ('Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
                      'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
                      'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo') THEN 10
    WHEN p_course IN ('Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
                      'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
                      'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
                      'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico') THEN 4
    WHEN p_course = 'Análise e Desenvolvimento de Sistemas' THEN 5
    ELSE 8 -- Padrão para bacharelados e licenciaturas
  END;

  -- Extrair número do semestre atual
  v_current_semester_number := CAST(regexp_replace(p_current_semester, '[^0-9]', '', 'g') AS INTEGER);

  -- Calcular semestres restantes
  v_remaining_semesters := v_duration - v_current_semester_number;

  -- Calcular semestres desde o cadastro
  v_semesters_from_registration := v_current_semester_number - 1;

  -- Calcular ano e semestre esperado de formatura
  expected_year := p_registration_year + ((p_registration_semester + v_duration - 1) / 2);
  expected_semester := CASE
    WHEN MOD(p_registration_semester + v_duration - 1, 2) = 0 THEN 1
    ELSE 2
  END;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Atualizar registros existentes com valores calculados
UPDATE students
SET
  registration_year = COALESCE(registration_year, EXTRACT(YEAR FROM created_at)),
  registration_semester = COALESCE(registration_semester,
    CASE WHEN EXTRACT(MONTH FROM created_at) <= 6 THEN 1 ELSE 2 END
  )
WHERE registration_year IS NULL OR registration_semester IS NULL;

-- Criar função para verificar e marcar estudantes como graduados
-- Esta função deve ser executada periodicamente (ex: via cron job ou trigger)
CREATE OR REPLACE FUNCTION check_and_mark_graduated_students()
RETURNS TABLE (
  student_id UUID,
  student_name VARCHAR(255),
  course VARCHAR(100),
  action_taken VARCHAR(50)
) AS $$
DECLARE
  v_current_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_current_semester INTEGER := CASE WHEN EXTRACT(MONTH FROM NOW()) <= 6 THEN 1 ELSE 2 END;
  v_student RECORD;
  v_duration INTEGER;
  v_current_semester_number INTEGER;
BEGIN
  -- Percorrer todos os estudantes ativos
  FOR v_student IN
    SELECT s.id, s.name, s.course, s.semester, s.registration_year, s.registration_semester, s.status
    FROM students s
    WHERE s.status = 'ATIVO' AND s.is_graduated = FALSE
  LOOP
    -- Obter duração do curso
    v_duration := CASE
      WHEN v_student.course IN ('Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
                                'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
                                'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo') THEN 10
      WHEN v_student.course IN ('Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
                                'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
                                'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
                                'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico') THEN 4
      WHEN v_student.course = 'Análise e Desenvolvimento de Sistemas' THEN 5
      ELSE 8
    END;

    -- Extrair número do semestre
    v_current_semester_number := CAST(regexp_replace(v_student.semester, '[^0-9]', '', 'g') AS INTEGER);

    -- Verificar se está no último semestre
    IF v_current_semester_number = v_duration THEN
      -- Calcular quantos semestres se passaram desde o registro
      DECLARE
        v_years_diff INTEGER := v_current_year - v_student.registration_year;
        v_semesters_passed INTEGER := (v_years_diff * 2) + (v_current_semester - v_student.registration_semester);
      BEGIN
        -- Se passou tempo suficiente para conclusão do curso
        IF v_semesters_passed >= v_duration THEN
          -- Marcar como graduado
          UPDATE students
          SET
            is_graduated = TRUE,
            graduation_date = NOW(),
            status = 'INATIVO'
          WHERE id = v_student.id;

          -- Retornar informação da ação
          student_id := v_student.id;
          student_name := v_student.name;
          course := v_student.course;
          action_taken := 'MARKED_AS_GRADUATED';
          RETURN NEXT;
        END IF;
      END;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Comentários sobre como usar
COMMENT ON FUNCTION check_and_mark_graduated_students() IS
'Função que verifica e marca estudantes que já deveriam ter se formado.
Executa automaticamente a cada chamada. Pode ser agendada via cron ou executada manualmente.
Exemplo de uso: SELECT * FROM check_and_mark_graduated_students();';

-- Criar view para estudantes próximos da graduação
CREATE OR REPLACE VIEW students_near_graduation AS
SELECT
  s.id,
  s.name,
  s.email,
  s.course,
  s.semester,
  s.registration_year,
  s.registration_semester,
  s.status,
  CAST(regexp_replace(s.semester, '[^0-9]', '', 'g') AS INTEGER) AS current_semester_number,
  CASE
    WHEN s.course IN ('Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
                      'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
                      'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo') THEN 10
    WHEN s.course IN ('Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
                      'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
                      'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
                      'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico') THEN 4
    WHEN s.course = 'Análise e Desenvolvimento de Sistemas' THEN 5
    ELSE 8
  END AS total_semesters,
  CASE
    WHEN s.course IN ('Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
                      'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
                      'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo') THEN 10
    WHEN s.course IN ('Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
                      'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
                      'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
                      'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico') THEN 4
    WHEN s.course = 'Análise e Desenvolvimento de Sistemas' THEN 5
    ELSE 8
  END - CAST(regexp_replace(s.semester, '[^0-9]', '', 'g') AS INTEGER) AS semesters_remaining,
  CASE
    WHEN CAST(regexp_replace(s.semester, '[^0-9]', '', 'g') AS INTEGER) >=
      CASE
        WHEN s.course IN ('Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
                          'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
                          'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo') THEN 10
        WHEN s.course IN ('Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
                          'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
                          'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
                          'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico') THEN 4
        WHEN s.course = 'Análise e Desenvolvimento de Sistemas' THEN 5
        ELSE 8
      END - 1 THEN TRUE
    ELSE FALSE
  END AS is_near_graduation
FROM students s
WHERE s.status = 'ATIVO' AND s.is_graduated = FALSE;

COMMENT ON VIEW students_near_graduation IS
'View que mostra estudantes próximos da graduação (penúltimo e último semestre)';
