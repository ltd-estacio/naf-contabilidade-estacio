-- ==========================================
-- Script Automático para Atribuir Atendimentos
-- ==========================================
-- Este script atribui atendimentos fiscais automaticamente
-- ao primeiro estudante encontrado na tabela students

-- PASSO 1: Ver estudantes disponíveis
SELECT
  id,
  name,
  email,
  status
FROM public.students
WHERE status = 'ATIVO'
ORDER BY created_at DESC
LIMIT 10;

-- ==========================================
-- OPÇÃO 1: Atribuir ao PRIMEIRO estudante ativo
-- ==========================================

-- Atribuir os 5 atendimentos mais recentes sem estudante
-- ao primeiro estudante ativo encontrado
WITH primeiro_estudante AS (
  SELECT id as student_id
  FROM public.students
  WHERE status = 'ATIVO'
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.fiscal_appointments
SET
  assigned_student_id = (SELECT student_id FROM primeiro_estudante),
  updated_at = NOW()
WHERE id IN (
  SELECT id
  FROM public.fiscal_appointments
  WHERE assigned_student_id IS NULL
  ORDER BY created_at DESC
  LIMIT 5
)
RETURNING
  protocol,
  service_title,
  client_name,
  status,
  assigned_student_id;

-- ==========================================
-- OPÇÃO 2: Atribuir usando EMAIL do estudante
-- ==========================================
-- Se você souber o email do estudante logado, use este:
-- Substitua 'email.do.estudante@exemplo.com' pelo email real

/*
UPDATE public.fiscal_appointments
SET
  assigned_student_id = (
    SELECT id
    FROM public.students
    WHERE email = 'email.do.estudante@exemplo.com'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE id IN (
  SELECT id
  FROM public.fiscal_appointments
  WHERE assigned_student_id IS NULL
  ORDER BY created_at DESC
  LIMIT 5
)
RETURNING
  protocol,
  service_title,
  client_name,
  assigned_student_id;
*/

-- ==========================================
-- VERIFICAÇÃO: Ver atendimentos atribuídos
-- ==========================================
SELECT
  fa.protocol,
  fa.service_title,
  fa.client_name,
  fa.status,
  fa.urgency_level,
  fa.created_at,
  s.name as estudante_responsavel,
  s.email as email_estudante
FROM public.fiscal_appointments fa
LEFT JOIN public.students s ON fa.assigned_student_id = s.id
WHERE fa.assigned_student_id IS NOT NULL
ORDER BY fa.created_at DESC
LIMIT 20;
