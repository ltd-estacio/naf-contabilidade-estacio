-- Script para popular a tabela attendances com dados de teste
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos buscar o ID de um estudante existente
-- Se não houver estudantes, este script irá falhar. Crie um estudante primeiro.

-- Inserir atendimentos de teste para o primeiro estudante da tabela
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
  supervisor_id,
  student_notes
)
SELECT
  'ATD-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 6, '0'),
  s.id,
  s.name,
  client_data.client_name,
  client_data.client_email,
  client_data.client_phone,
  client_data.client_document,
  client_data.client_category,
  client_data.service_type,
  client_data.service_description,
  client_data.scheduled_date,
  client_data.scheduled_time,
  60,
  client_data.is_online,
  CASE WHEN client_data.is_online THEN 'https://meet.google.com/abc-defg-hij' ELSE NULL END,
  client_data.status,
  client_data.urgency,
  client_data.rating,
  client_data.validated,
  NULL,
  client_data.notes
FROM
  (SELECT id, name FROM public.students LIMIT 1) s,
  (VALUES
    ('Maria Santos Silva', 'maria.santos@email.com', '(11) 98888-7777', '123.456.789-00', 'Pessoa Física', 'Orientação Fiscal - IRPF', 'Cliente precisa de ajuda para declarar imposto de renda pela primeira vez', CURRENT_DATE + INTERVAL '3 days', '09:00:00', false, 'AGENDADO', 'MEDIA', NULL, false, NULL),
    ('João Carlos Oliveira', 'joao.oliveira@email.com', '(11) 97777-6666', '234.567.890-11', 'Pessoa Física', 'Consulta MEI', 'Dúvidas sobre formalização como MEI e obrigações mensais', CURRENT_DATE + INTERVAL '5 days', '14:00:00', true, 'AGENDADO', 'ALTA', NULL, false, NULL),
    ('Ana Paula Costa', 'ana.costa@email.com', '(11) 96666-5555', '345.678.901-22', 'Microempreendedor', 'Orientação Tributária', 'Precisa entender melhor sobre o regime tributário do MEI', CURRENT_DATE + INTERVAL '1 day', '10:30:00', true, 'AGENDADO', 'URGENTE', NULL, false, NULL),
    ('Carlos Eduardo Silva', 'carlos.silva@email.com', '(11) 95555-4444', '456.789.012-33', 'Pessoa Física', 'Declaração IRPF', 'Auxílio no preenchimento da declaração de imposto de renda', CURRENT_DATE - INTERVAL '2 days', '11:00:00', false, 'EM_ANDAMENTO', 'MEDIA', NULL, false, 'Cliente apresentou todos os documentos necessários'),
    ('Fernanda Oliveira Santos', 'fernanda.santos@email.com', '(11) 94444-3333', '567.890.123-44', 'Pessoa Física', 'Restituição IRPF', 'Consulta sobre restituição de imposto de renda', CURRENT_DATE - INTERVAL '5 days', '15:00:00', true, 'CONCLUIDO', 'BAIXA', 5, true, 'Atendimento realizado com sucesso. Cliente muito satisfeito.'),
    ('Roberto Carlos Pereira', 'roberto.pereira@email.com', '(11) 93333-2222', '678.901.234-55', 'Microempreendedor', 'DAS MEI', 'Dúvidas sobre o pagamento do DAS mensal', CURRENT_DATE - INTERVAL '10 days', '09:30:00', false, 'CONCLUIDO', 'MEDIA', 4, true, 'Cliente esclareceu todas as dúvidas sobre DAS'),
    ('Juliana Ferreira Lima', 'juliana.lima@email.com', '(11) 92222-1111', '789.012.345-66', 'Pessoa Física', 'CPF', 'Orientação para regularização de CPF pendente', CURRENT_DATE - INTERVAL '15 days', '14:30:00', false, 'CONCLUIDO', 'ALTA', 5, true, 'Processo de regularização explicado detalhadamente'),
    ('Pedro Henrique Costa', 'pedro.costa@email.com', '(11) 91111-0000', '890.123.456-77', 'Pessoa Física', 'Malha Fina IRPF', 'Cliente caiu na malha fina e precisa de orientação', CURRENT_DATE + INTERVAL '7 days', '16:00:00', true, 'AGENDADO', 'URGENTE', NULL, false, NULL),
    ('Mariana Alves Souza', 'mariana.souza@email.com', '(11) 90000-9999', '901.234.567-88', 'Microempreendedor', 'Desenquadramento MEI', 'Precisa saber como fazer o desenquadramento do MEI', CURRENT_DATE + INTERVAL '4 days', '13:00:00', false, 'AGENDADO', 'MEDIA', NULL, false, NULL),
    ('Rafael Santos Oliveira', 'rafael.oliveira@email.com', '(11) 89999-8888', '012.345.678-99', 'Pessoa Física', 'Dedução IRPF', 'Dúvidas sobre deduções permitidas na declaração', CURRENT_DATE - INTERVAL '3 days', '10:00:00', true, 'CONCLUIDO', 'MEDIA', 5, true, 'Cliente conseguiu identificar todas as deduções possíveis')
  ) AS client_data(
    client_name, client_email, client_phone, client_document, client_category,
    service_type, service_description, scheduled_date, scheduled_time,
    is_online, status, urgency, rating, validated, notes
  );

-- Verificar os atendimentos criados
SELECT
  protocol,
  student_name,
  client_name,
  service_type,
  scheduled_date,
  status,
  created_at
FROM public.attendances
ORDER BY created_at DESC
LIMIT 10;
