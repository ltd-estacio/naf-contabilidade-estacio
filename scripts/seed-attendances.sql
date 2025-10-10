-- Script para criar dados de teste de atendimentos com avaliações de satisfação
-- Execute este script no SQL Editor do Supabase para gerar dados de teste

-- IMPORTANTE: Este script cria dados de exemplo.
-- Certifique-se de ter estudantes cadastrados na tabela 'students' antes de executar.

-- 1. Criar atendimentos com diferentes status e avaliações
-- Substitua os IDs pelos IDs reais dos seus estudantes

-- Exemplo de como buscar IDs de estudantes:
-- SELECT id, name, email FROM students WHERE status = 'ATIVO' LIMIT 10;

-- Atendimentos com alta satisfação (4-5 estrelas)
INSERT INTO attendances (
  student_id,
  service_type,
  client_name,
  status,
  client_satisfaction_rating,
  duration_minutes,
  scheduled_date,
  notes,
  created_at,
  updated_at
) VALUES
  -- Substitua 'STUDENT_ID_1' pelo ID real do estudante
  ('STUDENT_ID_1', 'ORIENTACAO_TRIBUTARIA', 'Cliente Teste 1', 'CONCLUIDO', 5, 45, NOW() - INTERVAL '5 days', 'Ótimo atendimento, muito satisfeito!', NOW() - INTERVAL '5 days', NOW()),
  ('STUDENT_ID_1', 'DECLARACAO_IR', 'Cliente Teste 2', 'CONCLUIDO', 5, 60, NOW() - INTERVAL '3 days', 'Excelente trabalho!', NOW() - INTERVAL '3 days', NOW()),
  ('STUDENT_ID_1', 'ABERTURA_MEI', 'Cliente Teste 3', 'CONCLUIDO', 4, 30, NOW() - INTERVAL '2 days', 'Muito bom!', NOW() - INTERVAL '2 days', NOW()),

  -- Substitua 'STUDENT_ID_2' pelo ID real de outro estudante
  ('STUDENT_ID_2', 'CONSULTORIA_CONTABIL', 'Cliente Teste 4', 'CONCLUIDO', 5, 90, NOW() - INTERVAL '7 days', 'Superou expectativas', NOW() - INTERVAL '7 days', NOW()),
  ('STUDENT_ID_2', 'PLANEJAMENTO_TRIBUTARIO', 'Cliente Teste 5', 'CONCLUIDO', 4, 75, NOW() - INTERVAL '4 days', 'Bom atendimento', NOW() - INTERVAL '4 days', NOW()),
  ('STUDENT_ID_2', 'ORIENTACAO_TRIBUTARIA', 'Cliente Teste 6', 'CONCLUIDO', 5, 40, NOW() - INTERVAL '1 day', 'Ótimo!', NOW() - INTERVAL '1 day', NOW()),

  -- Substitua 'STUDENT_ID_3' pelo ID real de outro estudante
  ('STUDENT_ID_3', 'DECLARACAO_IR', 'Cliente Teste 7', 'CONCLUIDO', 4, 55, NOW() - INTERVAL '6 days', 'Satisfeito', NOW() - INTERVAL '6 days', NOW()),
  ('STUDENT_ID_3', 'ABERTURA_MEI', 'Cliente Teste 8', 'CONCLUIDO', 5, 35, NOW() - INTERVAL '3 days', 'Perfeito!', NOW() - INTERVAL '3 days', NOW());

-- Atendimentos com satisfação média (3 estrelas)
INSERT INTO attendances (
  student_id,
  service_type,
  client_name,
  status,
  client_satisfaction_rating,
  duration_minutes,
  scheduled_date,
  created_at,
  updated_at
) VALUES
  ('STUDENT_ID_1', 'CONSULTORIA_CONTABIL', 'Cliente Teste 9', 'CONCLUIDO', 3, 50, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW()),
  ('STUDENT_ID_2', 'ABERTURA_MEI', 'Cliente Teste 10', 'CONCLUIDO', 3, 45, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW());

-- Atendimentos em andamento (sem avaliação ainda)
INSERT INTO attendances (
  student_id,
  service_type,
  client_name,
  status,
  scheduled_date,
  created_at,
  updated_at
) VALUES
  ('STUDENT_ID_1', 'PLANEJAMENTO_TRIBUTARIO', 'Cliente Teste 11', 'EM_ANDAMENTO', NOW() + INTERVAL '2 days', NOW(), NOW()),
  ('STUDENT_ID_2', 'DECLARACAO_IR', 'Cliente Teste 12', 'AGENDADO', NOW() + INTERVAL '3 days', NOW(), NOW()),
  ('STUDENT_ID_3', 'ORIENTACAO_TRIBUTARIA', 'Cliente Teste 13', 'EM_ANDAMENTO', NOW() + INTERVAL '1 day', NOW(), NOW());

-- Verificar os dados inseridos
SELECT
  s.name as student_name,
  a.service_type,
  a.client_name,
  a.status,
  a.client_satisfaction_rating as rating,
  a.duration_minutes,
  a.created_at
FROM attendances a
LEFT JOIN students s ON a.student_id = s.id
ORDER BY a.created_at DESC
LIMIT 20;

-- Estatísticas rápidas
SELECT
  COUNT(*) as total_atendimentos,
  COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END) as concluidos,
  COUNT(CASE WHEN client_satisfaction_rating IS NOT NULL THEN 1 END) as com_avaliacao,
  ROUND(AVG(client_satisfaction_rating)::numeric, 2) as satisfacao_media
FROM attendances;

-- Ranking de estudantes
SELECT
  s.name as estudante,
  COUNT(a.id) as total_atendimentos,
  COUNT(CASE WHEN a.status = 'CONCLUIDO' THEN 1 END) as concluidos,
  ROUND(AVG(a.client_satisfaction_rating)::numeric, 2) as satisfacao_media,
  ROUND((COUNT(CASE WHEN a.status = 'CONCLUIDO' THEN 1 END)::numeric / COUNT(a.id) * 100), 1) as taxa_conclusao
FROM students s
LEFT JOIN attendances a ON s.id = a.student_id
WHERE s.status = 'ATIVO'
GROUP BY s.id, s.name
HAVING COUNT(a.id) > 0
ORDER BY total_atendimentos DESC, satisfacao_media DESC
LIMIT 10;
