-- Script para popular fiscal_appointments para um estudante específico
-- Execute este script no Supabase SQL Editor

-- INSTRUÇÕES:
-- 1. Primeiro, descubra o ID do estudante logado executando:
--    SELECT id, name, email FROM public.students WHERE email = 'SEU_EMAIL@email.com';
-- 2. Substitua o email abaixo pelo email do estudante logado
-- 3. Execute este script

DO $$
DECLARE
  v_student_id uuid;
  v_student_name varchar;
  v_student_email varchar;
BEGIN
  -- Buscar o estudante pelo email (SUBSTITUA O EMAIL AQUI)
  SELECT id, name, email INTO v_student_id, v_student_name, v_student_email
  FROM public.students
  WHERE email = 'joao.silva@estudante.edu.br' -- ⚠️ SUBSTITUA ESTE EMAIL PELO EMAIL DO ESTUDANTE LOGADO
  LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Estudante não encontrado. Verifique o email e tente novamente.';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Populando atendimentos fiscais para:';
  RAISE NOTICE 'Nome: %', v_student_name;
  RAISE NOTICE 'Email: %', v_student_email;
  RAISE NOTICE 'ID: %', v_student_id;
  RAISE NOTICE '========================================';

  -- Deletar atendimentos fiscais existentes do estudante (opcional - comente se não quiser deletar)
  -- DELETE FROM public.fiscal_appointments WHERE assigned_student_id = v_student_id;

  -- Inserir atendimentos fiscais de teste
  INSERT INTO public.fiscal_appointments (
    service_type,
    service_title,
    service_category,
    client_name,
    client_email,
    client_phone,
    client_cpf,
    client_birth_date,
    address_street,
    address_number,
    address_complement,
    address_neighborhood,
    address_city,
    address_state,
    address_zipcode,
    service_details,
    urgency_level,
    preferred_date,
    preferred_time,
    preferred_period,
    status,
    protocol,
    assigned_student_id,
    client_notes,
    internal_notes,
    created_at,
    updated_at,
    confirmed_at,
    scheduled_at,
    completed_at
  ) VALUES

  -- 1. Atendimento CONFIRMADO - IRPF
  (
    'declaracao-irpf',
    'Declaração de Imposto de Renda Pessoa Física',
    'IRPF',
    'Ana Paula Costa',
    'ana.costa@email.com',
    '(11) 99888-7766',
    '111.222.333-44',
    '1985-03-15',
    'Rua das Flores',
    '123',
    'Apto 45',
    'Jardim Paulista',
    'São Paulo',
    'SP',
    '01310-100',
    '{"clientCategory": "Pessoa Física", "hasInvestments": true, "hasMedicalExpenses": true}',
    'NORMAL',
    CURRENT_DATE + INTERVAL '5 days',
    '10:00:00',
    'MANHA',
    'CONFIRMADO',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '01',
    v_student_id,
    'Primeira declaração de IR, preciso de ajuda com todos os passos. Tenho investimentos em renda fixa.',
    'Cliente já enviou documentos por email. Revisar antes do atendimento.',
    NOW() - INTERVAL '2 days',
    NOW(),
    NOW() - INTERVAL '1 day',
    NULL,
    NULL
  ),

  -- 2. Atendimento CONFIRMADO - MEI
  (
    'orientacao-mei',
    'Orientação sobre MEI',
    'MEI',
    'Carlos Eduardo Santos',
    'carlos.santos@email.com',
    '(11) 98777-6655',
    '222.333.444-55',
    '1990-07-22',
    'Avenida Paulista',
    '1000',
    'Sala 12',
    'Bela Vista',
    'São Paulo',
    'SP',
    '01310-100',
    '{"clientCategory": "Futuro MEI", "hasEmployees": false, "activityType": "Serviços de TI"}',
    'ALTA',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00',
    'TARDE',
    'CONFIRMADO',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '02',
    v_student_id,
    'Quero abrir MEI e tenho dúvidas sobre tributação e obrigações mensais.',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW(),
    NOW() - INTERVAL '1 day',
    NULL,
    NULL
  ),

  -- 3. Atendimento EM_ANDAMENTO - Nota Fiscal
  (
    'emissao-nota-fiscal',
    'Emissão de Nota Fiscal',
    'Nota Fiscal',
    'Mariana Silva Oliveira',
    'mariana.oliveira@email.com',
    '(11) 97666-5544',
    '333.444.555-66',
    '1988-11-30',
    'Rua Augusta',
    '500',
    NULL,
    'Consolação',
    'São Paulo',
    'SP',
    '01305-000',
    '{"clientCategory": "MEI", "serviceType": "Consultoria", "monthlyRevenue": 4500}',
    'NORMAL',
    CURRENT_DATE,
    '09:30:00',
    'MANHA',
    'EM_ANDAMENTO',
    'FAP' || TO_CHAR(NOW() - INTERVAL '1 hour', 'YYMMDDHH24MI') || '03',
    v_student_id,
    'Preciso aprender a emitir notas fiscais para meus clientes.',
    'Atendimento iniciado. Cliente está acessando o portal da prefeitura.',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '1 hour',
    NULL
  ),

  -- 4. Atendimento PENDENTE - ITR
  (
    'itr-rural',
    'ITR - Imposto Territorial Rural',
    'ITR',
    'José Roberto Ferreira',
    'jose.ferreira@email.com',
    '(11) 96555-4433',
    '444.555.666-77',
    '1975-05-10',
    'Estrada Municipal',
    'KM 15',
    'Sítio',
    'Zona Rural',
    'Cotia',
    'SP',
    '06700-000',
    '{"clientCategory": "Proprietário Rural", "propertySize": 25, "hasProduction": true}',
    'NORMAL',
    CURRENT_DATE + INTERVAL '7 days',
    '15:00:00',
    'TARDE',
    'PENDENTE',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '04',
    v_student_id,
    'Preciso declarar minha propriedade rural. Tenho 25 hectares.',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NULL,
    NULL,
    NULL
  ),

  -- 5. Atendimento CONFIRMADO - CNPJ
  (
    'abertura-cnpj',
    'Abertura de CNPJ',
    'CNPJ',
    'Fernanda Costa Lima',
    'fernanda.lima@email.com',
    '(11) 95444-3322',
    '555.666.777-88',
    '1992-09-18',
    'Rua Oscar Freire',
    '789',
    'Loja 2',
    'Pinheiros',
    'São Paulo',
    'SP',
    '01426-001',
    '{"clientCategory": "Empresa", "businessType": "Comércio", "estimatedRevenue": 80000}',
    'ALTA',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00:00',
    'MANHA',
    'CONFIRMADO',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '05',
    v_student_id,
    'Quero abrir uma loja de roupas e preciso de CNPJ. Qual o melhor regime tributário?',
    'Cliente enviou contrato social. Analisar regime tributário mais adequado.',
    NOW() - INTERVAL '4 days',
    NOW(),
    NOW() - INTERVAL '2 days',
    NULL,
    NULL
  ),

  -- 6. Atendimento CONCLUIDO - Consulta MEI
  (
    'consulta-mei',
    'Consulta sobre MEI',
    'MEI',
    'Pedro Henrique Silva',
    'pedro.silva@email.com',
    '(11) 94333-2211',
    '666.777.888-99',
    '1987-12-05',
    'Rua da Consolação',
    '1500',
    'Casa',
    'Consolação',
    'São Paulo',
    'SP',
    '01301-100',
    '{"clientCategory": "MEI", "monthlyRevenue": 6000, "hasInvoices": true}',
    'BAIXA',
    CURRENT_DATE - INTERVAL '10 days',
    '10:30:00',
    'MANHA',
    'CONCLUIDO',
    'FAP' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYMMDDHH24MI') || '06',
    v_student_id,
    'Dúvidas sobre limite de faturamento do MEI e como proceder se ultrapassar.',
    'Atendimento concluído com sucesso. Cliente esclareceu todas as dúvidas sobre desenquadramento.',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ),

  -- 7. Atendimento PENDENTE - CPF
  (
    'regularizacao-cpf',
    'Regularização de CPF',
    'CPF',
    'Juliana Rodrigues Santos',
    'juliana.santos@email.com',
    '(11) 93222-1100',
    '777.888.999-00',
    '1995-02-28',
    'Avenida Rebouças',
    '2500',
    'Bloco A Apto 101',
    'Pinheiros',
    'São Paulo',
    'SP',
    '05402-000',
    '{"clientCategory": "Pessoa Física", "cpfStatus": "Pendente de Regularização"}',
    'URGENTE',
    CURRENT_DATE + INTERVAL '1 day',
    '08:30:00',
    'MANHA',
    'PENDENTE',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '07',
    v_student_id,
    'Meu CPF está com pendências e preciso regularizar urgente para fazer uma prova de concurso.',
    NULL,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours',
    NULL,
    NULL,
    NULL
  ),

  -- 8. Atendimento CONFIRMADO - Desenquadramento MEI
  (
    'desenquadramento-mei',
    'Desenquadramento de MEI',
    'MEI',
    'Ricardo Alves Pereira',
    'ricardo.pereira@email.com',
    '(11) 92111-0099',
    '888.999.000-11',
    '1983-06-14',
    'Rua Haddock Lobo',
    '600',
    'Conjunto 52',
    'Cerqueira César',
    'São Paulo',
    'SP',
    '01414-001',
    '{"clientCategory": "MEI", "monthlyRevenue": 8000, "needsDrawback": true}',
    'ALTA',
    CURRENT_DATE + INTERVAL '4 days',
    '16:30:00',
    'TARDE',
    'CONFIRMADO',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '08',
    v_student_id,
    'Ultrapassei o limite do MEI e preciso fazer o desenquadramento. Como proceder?',
    'Cliente já possui contador. Orientar sobre procedimentos e prazos.',
    NOW() - INTERVAL '5 days',
    NOW(),
    NOW() - INTERVAL '3 days',
    NULL,
    NULL
  ),

  -- 9. Atendimento CONCLUIDO - Declaração IRPF
  (
    'declaracao-irpf',
    'Declaração de Imposto de Renda Pessoa Física',
    'IRPF',
    'Beatriz Fernandes Costa',
    'beatriz.costa@email.com',
    '(11) 91000-9988',
    '999.000.111-22',
    '1991-04-20',
    'Rua Estados Unidos',
    '1500',
    'Apto 203',
    'Jardim América',
    'São Paulo',
    'SP',
    '01427-001',
    '{"clientCategory": "Pessoa Física", "hasInvestments": true, "hasRealEstate": true}',
    'NORMAL',
    CURRENT_DATE - INTERVAL '15 days',
    '14:00:00',
    'TARDE',
    'CONCLUIDO',
    'FAP' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYMMDDHH24MI') || '09',
    v_student_id,
    'Preciso declarar imóveis e investimentos. Tenho dúvidas sobre ganho de capital.',
    'Declaração finalizada e transmitida com sucesso. Cliente muito satisfeito com o atendimento.',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),

  -- 10. Atendimento PENDENTE - Orientação Tributária
  (
    'orient-tributo',
    'Orientação Tributária',
    'Tributação',
    'Lucas Martins Souza',
    'lucas.souza@email.com',
    '(11) 90999-8877',
    '000.111.222-33',
    '1989-08-25',
    'Avenida Faria Lima',
    '3000',
    'Torre A Sala 1205',
    'Itaim Bibi',
    'São Paulo',
    'SP',
    '01451-000',
    '{"clientCategory": "Empresário", "companyType": "ME", "estimatedRevenue": 300000}',
    'NORMAL',
    CURRENT_DATE + INTERVAL '6 days',
    '13:30:00',
    'TARDE',
    'PENDENTE',
    'FAP' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '10',
    v_student_id,
    'Tenho uma ME e quero entender qual regime tributário é mais vantajoso para minha empresa.',
    NULL,
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours',
    NULL,
    NULL,
    NULL
  );

  -- Mostrar resumo
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUCESSO! Inseridos 10 atendimentos fiscais';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Distribuição por status:';
  RAISE NOTICE '  - 3 PENDENTES (aguardando confirmação)';
  RAISE NOTICE '  - 5 CONFIRMADOS (agendados)';
  RAISE NOTICE '  - 1 EM_ANDAMENTO (em atendimento)';
  RAISE NOTICE '  - 2 CONCLUÍDOS (finalizados)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Distribuição por urgência:';
  RAISE NOTICE '  - 1 URGENTE';
  RAISE NOTICE '  - 3 ALTA';
  RAISE NOTICE '  - 5 NORMAL';
  RAISE NOTICE '  - 1 BAIXA';
  RAISE NOTICE '========================================';

END $$;

-- Verificar os atendimentos criados
SELECT
  protocol,
  client_name,
  service_title,
  status,
  urgency_level,
  preferred_date,
  preferred_time,
  created_at,
  CASE
    WHEN status = 'PENDENTE' THEN '⏳ Aguardando confirmação'
    WHEN status = 'CONFIRMADO' THEN '✅ Confirmado e agendado'
    WHEN status = 'EM_ANDAMENTO' THEN '🔄 Em atendimento'
    WHEN status = 'CONCLUIDO' THEN '✅ Concluído'
    ELSE status
  END as status_desc
FROM public.fiscal_appointments
WHERE assigned_student_id IN (
  SELECT id FROM public.students WHERE email = 'joao.silva@estudante.edu.br' -- ⚠️ SUBSTITUA ESTE EMAIL
)
ORDER BY
  CASE
    WHEN status = 'EM_ANDAMENTO' THEN 1
    WHEN status = 'CONFIRMADO' THEN 2
    WHEN status = 'PENDENTE' THEN 3
    WHEN status = 'CONCLUIDO' THEN 4
    ELSE 5
  END,
  preferred_date ASC,
  preferred_time ASC;
