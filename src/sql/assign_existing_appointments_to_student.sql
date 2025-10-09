-- Script para atribuir atendimentos fiscais existentes a um estudante
-- Use este script se já existem atendimentos na tabela fiscal_appointments

-- PASSO 1: Primeiro, consulte o ID do estudante logado
-- Você pode fazer isso consultando a tabela students:
SELECT id, name, email FROM public.students LIMIT 10;

-- PASSO 2: Verifique os atendimentos existentes SEM estudante atribuído
SELECT
  id,
  protocol,
  service_title,
  client_name,
  status,
  assigned_student_id
FROM public.fiscal_appointments
WHERE assigned_student_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- PASSO 3: Atribua os atendimentos ao estudante
-- Substitua 'SEU_STUDENT_ID_AQUI' pelo ID real do estudante

-- Opção A: Atribuir TODOS os atendimentos sem estudante ao estudante específico
UPDATE public.fiscal_appointments
SET
  assigned_student_id = 'SEU_STUDENT_ID_AQUI',
  updated_at = NOW()
WHERE assigned_student_id IS NULL;

-- Opção B: Atribuir apenas alguns atendimentos específicos (mais realista)
-- Atribuir os 5 atendimentos mais recentes sem estudante
UPDATE public.fiscal_appointments
SET
  assigned_student_id = 'SEU_STUDENT_ID_AQUI',
  updated_at = NOW()
WHERE id IN (
  SELECT id
  FROM public.fiscal_appointments
  WHERE assigned_student_id IS NULL
  ORDER BY created_at DESC
  LIMIT 5
);

-- PASSO 4: Verificar se a atribuição funcionou
SELECT
  protocol,
  service_title,
  client_name,
  status,
  urgency_level,
  assigned_student_id,
  created_at
FROM public.fiscal_appointments
WHERE assigned_student_id = 'SEU_STUDENT_ID_AQUI'
ORDER BY created_at DESC;

-- PASSO 5: Se não existirem atendimentos, você precisa criar alguns primeiro
-- Use o script insert_test_fiscal_appointments.sql para isso
