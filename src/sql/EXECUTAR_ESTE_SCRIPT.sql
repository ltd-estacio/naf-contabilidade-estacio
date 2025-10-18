-- ==========================================
-- SCRIPT COMPLETO - COPIE E EXECUTE NO SUPABASE
-- ==========================================
-- Este script cria atendimentos fiscais automaticamente
-- e atribui ao estudante Estácio que está logado

-- Criar 5 atendimentos fiscais de teste
DO $$
DECLARE
  v_student_id uuid;
  v_count integer;
BEGIN
  -- Tentar obter o estudante com email "Estácio" ou primeiro ativo
  SELECT id INTO v_student_id
  FROM public.students
  WHERE status = 'ATIVO'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não encontrou nenhum estudante, criar um de teste
  IF v_student_id IS NULL THEN
    INSERT INTO public.students (
      name, email, phone, course, semester,
      registration_number, status, document, university
    ) VALUES (
      'Estudante Estácio',
      'estudante.estacio@naf.com',
      '(11) 98765-4321',
      'Ciências Contábeis',
      '7º Semestre',
      '2021123456',
      'ATIVO',
      '123.456.789-00',
      'Universidade Estácio de Sá'
    )
    RETURNING id INTO v_student_id;

    RAISE NOTICE 'Estudante criado com ID: %', v_student_id;
  END IF;

  -- Limpar atendimentos de teste anteriores (opcional)
  DELETE FROM public.fiscal_appointments
  WHERE protocol LIKE 'FAP-TEST-%';

  -- Inserir 5 atendimentos fiscais
  INSERT INTO public.fiscal_appointments (
    protocol, service_type, service_title, service_category,
    client_name, client_email, client_phone, client_cpf,
    address_city, address_state, address_zipcode,
    urgency_level, preferred_date, preferred_time, preferred_period,
    status, client_notes, assigned_student_id, created_at, updated_at
  ) VALUES
  -- Atendimento 1: CONFIRMADO - Declaração IRPF
  (
    'FAP-TEST-001',
    'declaracao-irpf',
    'Declaração de Imposto de Renda Pessoa Física',
    'IRPF',
    'Maria Santos Silva',
    'maria.santos@email.com',
    '(11) 98765-4321',
    '123.456.789-00',
    'São Paulo', 'SP', '01234-567',
    'NORMAL',
    CURRENT_DATE + 3,
    '10:00',
    'MANHA',
    'CONFIRMADO',
    'Primeira vez declarando IR. Preciso de ajuda com todos os passos.',
    v_student_id,
    NOW(),
    NOW()
  ),
  -- Atendimento 2: PENDENTE - MEI
  (
    'FAP-TEST-002',
    'orientacao-mei',
    'Orientação sobre abertura de MEI',
    'MEI',
    'João Carlos Oliveira',
    'joao@email.com',
    '(11) 97654-3210',
    '987.654.321-00',
    'São Paulo', 'SP', '01310-100',
    'ALTA',
    CURRENT_DATE + 2,
    '14:00',
    'TARDE',
    'PENDENTE',
    'Quero abrir MEI para trabalhar como designer freelancer.',
    v_student_id,
    NOW(),
    NOW()
  ),
  -- Atendimento 3: EM_ANDAMENTO - Consulta
  (
    'FAP-TEST-003',
    'consulta-tributaria',
    'Consulta sobre tributação de aluguel',
    'Tributação',
    'Ana Paula Costa',
    'ana@email.com',
    '(11) 96543-2109',
    '456.789.123-00',
    'São Paulo', 'SP', '01305-000',
    'NORMAL',
    CURRENT_DATE,
    '09:00',
    'MANHA',
    'EM_ANDAMENTO',
    'Comprei apartamento para alugar. Como declarar?',
    v_student_id,
    NOW() - INTERVAL '2 days',
    NOW()
  ),
  -- Atendimento 4: URGENTE - Regularização
  (
    'FAP-TEST-004',
    'regularizacao-fiscal',
    'Regularização de CPF com pendências',
    'Regularização',
    'Pedro Henrique Souza',
    'pedro@email.com',
    '(11) 95432-1098',
    '789.123.456-00',
    'São Paulo', 'SP', '01301-000',
    'URGENTE',
    CURRENT_DATE + 1,
    '08:00',
    'MANHA',
    'CONFIRMADO',
    'CPF com pendências. Preciso regularizar para conseguir emprego.',
    v_student_id,
    NOW(),
    NOW()
  ),
  -- Atendimento 5: CONCLUIDO - Certidão
  (
    'FAP-TEST-005',
    'emissao-certidao',
    'Emissão de Certidão Negativa',
    'Certidões',
    'Fernanda Lima',
    'fernanda@email.com',
    '(11) 94321-0987',
    '321.654.987-00',
    'São Paulo', 'SP', '01426-000',
    'BAIXA',
    CURRENT_DATE - 5,
    '15:00',
    'TARDE',
    'CONCLUIDO',
    'Preciso da certidão para licitação.',
    v_student_id,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 days'
  );

  -- Contar quantos foram criados
  SELECT COUNT(*) INTO v_count
  FROM public.fiscal_appointments
  WHERE assigned_student_id = v_student_id;

  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '📊 Total de atendimentos criados: %', v_count;
  RAISE NOTICE '👤 Estudante ID: %', v_student_id;
END $$;

-- Verificar os dados criados
SELECT
  protocol,
  service_title,
  client_name,
  status,
  urgency_level,
  preferred_date,
  assigned_student_id
FROM public.fiscal_appointments
WHERE protocol LIKE 'FAP-TEST-%'
ORDER BY created_at DESC;
