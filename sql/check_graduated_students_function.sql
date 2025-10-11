-- Função para verificar e marcar estudantes graduados automaticamente
-- Esta função deve ser executada no Supabase SQL Editor

CREATE OR REPLACE FUNCTION check_and_mark_graduated_students()
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  course TEXT,
  semester TEXT,
  was_graduated BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar estudantes que completaram o curso
  -- Considerando a duração típica dos cursos

  RETURN QUERY
  WITH graduated_students AS (
    UPDATE students
    SET
      is_graduated = true,
      graduation_date = CURRENT_DATE,
      status = 'INATIVO',
      updated_at = CURRENT_TIMESTAMP
    WHERE
      status = 'ATIVO'
      AND is_graduated = false
      AND (
        -- Cursos de 10 semestres (5 anos)
        (course IN (
          'Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
          'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
          'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo'
        ) AND semester SIMILAR TO '%(10º|10|décimo)%')

        OR

        -- Cursos de 8 semestres (4 anos) - bacharelado padrão
        (course NOT IN (
          'Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Farmácia',
          'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica',
          'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo',
          'Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
          'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
          'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
          'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico',
          'Análise e Desenvolvimento de Sistemas'
        ) AND semester SIMILAR TO '%(8º|8|oitavo)%')

        OR

        -- Análise e Desenvolvimento de Sistemas - 5 semestres
        (course = 'Análise e Desenvolvimento de Sistemas'
         AND semester SIMILAR TO '%(5º|5|quinto)%')

        OR

        -- Cursos tecnólogos - 4 semestres (2 anos)
        (course IN (
          'Gestão Financeira', 'Gestão de Recursos Humanos', 'Marketing', 'Logística',
          'Gestão Pública', 'Comércio Exterior', 'Processos Gerenciais',
          'Gestão da Tecnologia da Informação', 'Secretariado Executivo',
          'Turismo', 'Hotelaria', 'Gastronomia', 'Design Gráfico'
        ) AND semester SIMILAR TO '%(4º|4|quarto)%')
      )
    RETURNING
      id,
      name,
      course,
      semester,
      true as was_graduated
  )
  SELECT * FROM graduated_students;

END;
$$;

-- Comentário sobre a função
COMMENT ON FUNCTION check_and_mark_graduated_students() IS
'Verifica e marca automaticamente estudantes que completaram seus cursos como graduados.
A função identifica estudantes no último semestre de acordo com a duração do curso e os marca como INATIVO com is_graduated = true.';

-- Exemplo de uso:
-- SELECT * FROM check_and_mark_graduated_students();
