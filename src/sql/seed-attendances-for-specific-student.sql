-- Script para popular atendimentos para um estudante específico
-- Execute este script no Supabase SQL Editor após substituir o email do estudante

-- INSTRUÇÕES:
-- 1. Primeiro, descubra o ID do estudante logado executando:
--    SELECT id, name, email FROM public.students WHERE email = 'SEU_EMAIL_AQUI@email.com';
-- 2. Substitua 'SEU_EMAIL_AQUI@email.com' abaixo pelo email do estudante
-- 3. Execute este script

DO $$
DECLARE
  v_student_id uuid;
  v_student_name varchar;
BEGIN
  -- Buscar o estudante pelo email (SUBSTITUA O EMAIL AQUI)
  SELECT id, name INTO v_student_id, v_student_name
  FROM public.students
  WHERE email = 'joao.silva@estudante.edu.br' -- SUBSTITUA ESTE EMAIL
  LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Estudante não encontrado. Verifique o email.';
  END IF;

  RAISE NOTICE 'Populando atendimentos para: % (ID: %)', v_student_name, v_student_id;

  -- Deletar atendimentos existentes do estudante (opcional - comente se não quiser deletar)
  DELETE FROM public.attendances WHERE student_id = v_student_id;

  -- Inserir atendimentos de teste
  INSERT INTO public.attendances (
    protocol,
    student_id,
    student_name,
    client_name,
    client_email,
    client_phone,
    client_document,
    client_category,
    service_type,
    service_description,
    scheduled_date,
    scheduled_time,
    duration_minutes,
    is_online,
    meeting_link,
    status,
    urgency,
    client_satisfaction_rating,
    supervisor_validation,
    student_notes,
    created_at
  ) VALUES
  -- Atendimentos AGENDADOS (futuros)
  (
    'ATD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
    v_student_id,
    v_student_name,
    'Maria Santos Silva',
    'maria.santos@email.com',
    '(11) 98888-7777',
    '123.456.789-00',
    'Pessoa Física',
    'Orientação Fiscal - IRPF',
    'Cliente precisa de ajuda para declarar imposto de renda pela primeira vez. Primeira declaração.',
    CURRENT_DATE + INTERVAL '3 days',
    '09:00:00',
    60,
    false,
    NULL,
    'AGENDADO',
    'MEDIA',
    NULL,
    false,
    NULL,
    NOW()
  ),
  (
    'ATD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-002',
    v_student_id,
    v_student_name,
    'João Carlos Oliveira',
    'joao.oliveira@email.com',
    '(11) 97777-6666',
    '234.567.890-11',
    'Pessoa Física',
    'Consulta MEI',
    'Dúvidas sobre formalização como MEI e obrigações mensais. Cliente deseja abrir CNPJ.',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00:00',
    60,
    true,
    'https://meet.google.com/abc-defg-hij',
    'AGENDADO',
    'ALTA',
    NULL,
    false,
    NULL,
    NOW()
  ),
  (
    'ATD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-003',
    v_student_id,
    v_student_name,
    'Ana Paula Costa',
    'ana.costa@email.com',
    '(11) 96666-5555',
    '345.678.901-22',
    'Microempreendedor',
    'Orientação Tributária',
    'Precisa entender melhor sobre o regime tributário do MEI. Dúvidas sobre limites de faturamento.',
    CURRENT_DATE + INTERVAL '1 day',
    '10:30:00',
    60,
    true,
    'https://meet.google.com/xyz-abcd-efg',
    'AGENDADO',
    'ALTA',
    NULL,
    false,
    NULL,
    NOW()
  ),
  (
    'ATD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-004',
    v_student_id,
    v_student_name,
    'Pedro Henrique Costa',
    'pedro.costa@email.com',
    '(11) 91111-0000',
    '890.123.456-77',
    'Pessoa Física',
    'Malha Fina IRPF',
    'Cliente caiu na malha fina e precisa de orientação urgente para regularizar a situação.',
    CURRENT_DATE + INTERVAL '7 days',
    '16:00:00',
    90,
    true,
    'https://meet.google.com/urgent-meet',
    'AGENDADO',
    'ALTA',
    NULL,
    false,
    NULL,
    NOW()
  ),

  -- Atendimentos EM_ANDAMENTO (em curso)
  (
    'ATD-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-005',
    v_student_id,
    v_student_name,
    'Carlos Eduardo Silva',
    'carlos.silva@email.com',
    '(11) 95555-4444',
    '456.789.012-33',
    'Pessoa Física',
    'Declaração IRPF',
    'Auxílio no preenchimento da declaração de imposto de renda. Cliente trouxe todos os documentos.',
    CURRENT_DATE,
    '11:00:00',
    90,
    false,
    NULL,
    'EM_ANDAMENTO',
    'MEDIA',
    NULL,
    false,
    'Cliente apresentou todos os documentos necessários. Iniciando preenchimento da declaração.',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'ATD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-006',
    v_student_id,
    v_student_name,
    'Mariana Alves Souza',
    'mariana.souza@email.com',
    '(11) 90000-9999',
    '901.234.567-88',
    'Microempreendedor',
    'Desenquadramento MEI',
    'Precisa saber como fazer o desenquadramento do MEI por ter ultrapassado o limite de faturamento.',
    CURRENT_DATE,
    '13:00:00',
    60,
    false,
    NULL,
    'EM_ANDAMENTO',
    'MEDIA',
    NULL,
    false,
    'Explicando o processo de desenquadramento e as opções de regime tributário.',
    NOW() - INTERVAL '30 minutes'
  ),

  -- Atendimentos CONCLUÍDOS (passados)
  (
    'ATD-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-007',
    v_student_id,
    v_student_name,
    'Fernanda Oliveira Santos',
    'fernanda.santos@email.com',
    '(11) 94444-3333',
    '567.890.123-44',
    'Pessoa Física',
    'Restituição IRPF',
    'Consulta sobre restituição de imposto de renda. Cliente queria saber quando receberia.',
    CURRENT_DATE - INTERVAL '5 days',
    '15:00:00',
    45,
    true,
    'https://meet.google.com/past-meet-1',
    'CONCLUIDO',
    'BAIXA',
    5,
    true,
    'Atendimento realizado com sucesso. Cliente muito satisfeito. Explicado o calendário de restituição.',
    NOW() - INTERVAL '5 days'
  ),
  (
    'ATD-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-008',
    v_student_id,
    v_student_name,
    'Roberto Carlos Pereira',
    'roberto.pereira@email.com',
    '(11) 93333-2222',
    '678.901.234-55',
    'Microempreendedor',
    'DAS MEI',
    'Dúvidas sobre o pagamento do DAS mensal. Cliente tinha boletos em atraso.',
    CURRENT_DATE - INTERVAL '10 days',
    '09:30:00',
    60,
    false,
    NULL,
    'CONCLUIDO',
    'MEDIA',
    4,
    true,
    'Cliente esclareceu todas as dúvidas sobre DAS. Orientado sobre como emitir boletos atrasados.',
    NOW() - INTERVAL '10 days'
  ),
  (
    'ATD-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMMDD') || '-009',
    v_student_id,
    v_student_name,
    'Juliana Ferreira Lima',
    'juliana.lima@email.com',
    '(11) 92222-1111',
    '789.012.345-66',
    'Pessoa Física',
    'CPF - Regularização',
    'Orientação para regularização de CPF pendente. Situação cadastral irregular.',
    CURRENT_DATE - INTERVAL '15 days',
    '14:30:00',
    60,
    false,
    NULL,
    'CONCLUIDO',
    'ALTA',
    5,
    true,
    'Processo de regularização explicado detalhadamente. Cliente conseguiu regularizar pelo site da RF.',
    NOW() - INTERVAL '15 days'
  ),
  (
    'ATD-' || TO_CHAR(NOW() - INTERVAL '20 days', 'YYYYMMDD') || '-010',
    v_student_id,
    v_student_name,
    'Rafael Santos Oliveira',
    'rafael.oliveira@email.com',
    '(11) 89999-8888',
    '012.345.678-99',
    'Pessoa Física',
    'Dedução IRPF',
    'Dúvidas sobre deduções permitidas na declaração. Cliente tem despesas médicas e educação.',
    CURRENT_DATE - INTERVAL '20 days',
    '10:00:00',
    75,
    true,
    'https://meet.google.com/past-meet-2',
    'CONCLUIDO',
    'MEDIA',
    5,
    true,
    'Cliente conseguiu identificar todas as deduções possíveis. Economizou mais de R$ 2.000 em impostos.',
    NOW() - INTERVAL '20 days'
  );

  -- Mostrar resumo
  RAISE NOTICE '✅ Inseridos 10 atendimentos para %', v_student_name;
  RAISE NOTICE 'Distribuição:';
  RAISE NOTICE '  - 4 AGENDADOS (futuros)';
  RAISE NOTICE '  - 2 EM_ANDAMENTO (em curso)';
  RAISE NOTICE '  - 4 CONCLUÍDOS (passados)';

END $$;

-- Verificar os atendimentos criados
SELECT
  protocol,
  client_name,
  service_type,
  scheduled_date,
  scheduled_time,
  status,
  urgency,
  is_online,
  CASE
    WHEN status = 'CONCLUIDO' THEN client_satisfaction_rating
    ELSE NULL
  END as rating,
  created_at
FROM public.attendances
WHERE student_id IN (
  SELECT id FROM public.students WHERE email = 'joao.silva@estudante.edu.br' -- SUBSTITUA ESTE EMAIL
)
ORDER BY scheduled_date DESC, scheduled_time DESC;
