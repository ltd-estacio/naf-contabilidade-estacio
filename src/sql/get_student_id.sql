-- ==========================================
-- Script para Obter o ID do Estudante Logado
-- ==========================================

-- OPÇÃO 1: Por Email (se você sabe o email do estudante logado)
-- Substitua 'seu.email@exemplo.com' pelo email real
SELECT
  id,
  name,
  email,
  course,
  semester,
  status
FROM public.students
WHERE email = 'seu.email@exemplo.com';

-- OPÇÃO 2: Listar todos os estudantes ativos
SELECT
  id,
  name,
  email,
  course,
  semester,
  status,
  created_at
FROM public.students
WHERE status = 'ATIVO'
ORDER BY created_at DESC;

-- OPÇÃO 3: Buscar por nome
-- Substitua '%nome%' pelo nome ou parte dele
SELECT
  id,
  name,
  email,
  course,
  status
FROM public.students
WHERE LOWER(name) LIKE LOWER('%nome%')
ORDER BY name;

-- ==========================================
-- Depois de obter o ID, copie e use no próximo script
-- Exemplo de ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- ==========================================
