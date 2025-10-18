-- Schema completo para sistema de estudantes NAF

-- Tabela para estudantes
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  document VARCHAR(20) UNIQUE, -- CPF
  course VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  university VARCHAR(255) DEFAULT 'Estácio',
  registration_number VARCHAR(50) UNIQUE,
  birth_date DATE,
  address JSONB, -- {street, number, complement, neighborhood, city, state, zipcode}
  emergency_contact JSONB, -- {name, phone, relationship}
  specializations TEXT[], -- Array de especializações
  available_hours TEXT[], -- Array de horários disponíveis
  status VARCHAR(20) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO', 'TREINAMENTO', 'SUSPENSO')),
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela para sessões de estudantes
CREATE TABLE student_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para atendimentos
CREATE TABLE attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL, -- Denormalizado para histórico
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  client_document VARCHAR(20),
  client_category VARCHAR(50) NOT NULL, -- PESSOA_FISICA, MEI, RURAL, OSC
  service_type VARCHAR(255) NOT NULL,
  service_description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  location TEXT,
  status VARCHAR(20) DEFAULT 'AGENDADO' CHECK (status IN ('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU')),
  urgency VARCHAR(10) DEFAULT 'MEDIA' CHECK (urgency IN ('BAIXA', 'MEDIA', 'ALTA')),
  client_satisfaction_rating INTEGER CHECK (client_satisfaction_rating >= 1 AND client_satisfaction_rating <= 5),
  client_feedback TEXT,
  student_notes TEXT,
  supervisor_validation BOOLEAN DEFAULT false,
  supervisor_id UUID REFERENCES coordinator_users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  documents JSONB, -- Array de documentos relacionados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- Tabela para treinamentos
CREATE TABLE trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  duration_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'BÁSICO' CHECK (difficulty IN ('BÁSICO', 'INTERMEDIÁRIO', 'AVANÇADO')),
  topics TEXT[] NOT NULL,
  learning_objectives TEXT[],
  prerequisites TEXT[],
  resources JSONB, -- Links, PDFs, vídeos, etc.
  instructor_name VARCHAR(255),
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para progresso em treinamentos
CREATE TABLE student_training_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 1,
  time_spent_minutes INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(student_id, training_id)
);

-- Tabela para avaliações dos estudantes
CREATE TABLE student_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES coordinator_users(id) ON DELETE SET NULL,
  attendance_id UUID REFERENCES attendances(id) ON DELETE SET NULL,
  technical_score INTEGER CHECK (technical_score >= 1 AND technical_score <= 5),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
  punctuality_score INTEGER CHECK (punctuality_score >= 1 AND punctuality_score <= 5),
  professionalism_score INTEGER CHECK (professionalism_score >= 1 AND professionalism_score <= 5),
  overall_score DECIMAL(3,2),
  feedback TEXT,
  improvement_areas TEXT[],
  strengths TEXT[],
  evaluation_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de atividades dos estudantes
CREATE TABLE student_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, ATTENDANCE_START, ATTENDANCE_END, TRAINING_START, etc.
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para horários disponíveis dos estudantes
CREATE TABLE student_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir estudantes de exemplo (senha padrão: 123456)
INSERT INTO students (email, password_hash, name, phone, document, course, semester, registration_number, specializations, status) VALUES
('ana.santos@estudante.edu.br', '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', 'Ana Carolina Santos', '(11) 99999-0001', '12345678901', 'Ciências Contábeis', '6º Semestre', '2024001001', ARRAY['Imposto de Renda', 'MEI', 'Pessoa Física'], 'ATIVO'),
('joao.silva@estudante.edu.br', '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', 'João Silva', '(11) 99999-0002', '98765432102', 'Administração', '4º Semestre', '2024001002', ARRAY['MEI', 'Consultoria Empresarial'], 'ATIVO'),
('maria.costa@estudante.edu.br', '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', 'Maria Costa', '(11) 99999-0003', '45678912303', 'Ciências Contábeis', '8º Semestre', '2024001003', ARRAY['Imposto de Renda', 'ITR', 'Rural'], 'ATIVO'),
('carlos.ferreira@estudante.edu.br', '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', 'Carlos Ferreira', '(11) 99999-0004', '78912345604', 'Direito', '5º Semestre', '2024001004', ARRAY['Consultoria Jurídica', 'Tributos'], 'ATIVO'),
('ana.silva2@estudante.edu.br', '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', 'Ana Silva', '(11) 99999-0005', '32165498705', 'Ciências Contábeis', '7º Semestre', '2024001005', ARRAY['ICMS', 'Empresarial'], 'ATIVO');

-- Inserir treinamentos
INSERT INTO trainings (title, description, duration_minutes, difficulty, topics, learning_objectives, is_mandatory) VALUES
('Fundamentos da Legislação Tributária', 'Conceitos básicos sobre legislação tributária brasileira', 150, 'BÁSICO',
 ARRAY['CTN', 'Tributos Federais', 'ICMS', 'ISS'],
 ARRAY['Compreender o sistema tributário nacional', 'Identificar os principais tributos', 'Aplicar conceitos básicos'],
 true),
('Declaração de Imposto de Renda PF', 'Curso completo sobre DIRPF e suas particularidades', 255, 'INTERMEDIÁRIO',
 ARRAY['DIRPF', 'Deduções', 'Dependentes', 'Bens e Direitos'],
 ARRAY['Preencher declaração de IR', 'Identificar deduções aplicáveis', 'Orientar contribuintes'],
 true),
('MEI - Microempreendedor Individual', 'Tudo sobre MEI: abertura, obrigações e desenquadramento', 180, 'INTERMEDIÁRIO',
 ARRAY['Portal do Empreendedor', 'DAS-MEI', 'DASN', 'Desenquadramento'],
 ARRAY['Orientar abertura de MEI', 'Explicar obrigações mensais', 'Processo de desenquadramento'],
 false),
('Atendimento ao Público e Comunicação', 'Técnicas de atendimento e comunicação eficaz', 105, 'BÁSICO',
 ARRAY['Comunicação', 'Empatia', 'Resolução de Conflitos'],
 ARRAY['Melhorar comunicação', 'Desenvolver empatia', 'Resolver conflitos'],
 true),
('ITR - Imposto Territorial Rural', 'Declaração e cálculo do ITR', 120, 'AVANÇADO',
 ARRAY['ITR', 'Módulo Fiscal', 'CCIR', 'Rural'],
 ARRAY['Calcular ITR', 'Preencher declaração', 'Orientar proprietários rurais'],
 false);

-- Inserir progresso em treinamentos para estudantes
INSERT INTO student_training_progress (student_id, training_id, completed_at, score, is_completed) VALUES
((SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Fundamentos da Legislação Tributária'), NOW() - INTERVAL '10 days', 95, true),
((SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Declaração de Imposto de Renda PF'), NOW() - INTERVAL '5 days', 88, true),
((SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Atendimento ao Público e Comunicação'), NOW() - INTERVAL '15 days', 92, true),
((SELECT id FROM students WHERE email = 'joao.silva@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Fundamentos da Legislação Tributária'), NOW() - INTERVAL '8 days', 87, true),
((SELECT id FROM students WHERE email = 'joao.silva@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'MEI - Microempreendedor Individual'), NOW() - INTERVAL '3 days', 91, true),
((SELECT id FROM students WHERE email = 'maria.costa@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Fundamentos da Legislação Tributária'), NOW() - INTERVAL '12 days', 94, true),
((SELECT id FROM students WHERE email = 'maria.costa@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'Declaração de Imposto de Renda PF'), NOW() - INTERVAL '7 days', 89, true),
((SELECT id FROM students WHERE email = 'maria.costa@estudante.edu.br'), (SELECT id FROM trainings WHERE title = 'ITR - Imposto Territorial Rural'), NOW() - INTERVAL '2 days', 93, true);

-- Inserir atendimentos
INSERT INTO attendances (protocol, student_id, student_name, client_name, client_email, client_phone, client_category, service_type, service_description, scheduled_date, scheduled_time, status, urgency, client_satisfaction_rating, supervisor_validation) VALUES
('ATD-2025-0001', (SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), 'Ana Carolina Santos', 'Maria da Silva', 'maria.silva@email.com', '(11) 99999-9999', 'PESSOA_FISICA', 'Declaração de Imposto de Renda', 'Cliente precisa de ajuda com declaração de IR 2024. Possui documentos organizados.', '2025-01-20', '09:00', 'CONCLUIDO', 'MEDIA', 5, true),
('ATD-2025-0002', (SELECT id FROM students WHERE email = 'joao.silva@estudante.edu.br'), 'João Silva', 'Pedro Oliveira', 'pedro@empresa.com', '(11) 88888-8888', 'MEI', 'Orientação MEI', 'Empresário quer migrar de MEI para ME. Precisa de orientação sobre processo.', '2025-01-21', '14:30', 'EM_ANDAMENTO', 'ALTA', NULL, false),
('ATD-2025-0003', (SELECT id FROM students WHERE email = 'maria.costa@estudante.edu.br'), 'Maria Costa', 'Carlos Fazenda', 'carlos@fazenda.com', '(11) 77777-7777', 'RURAL', 'Declaração ITR', 'Proprietário rural com 2 módulos fiscais. Primeira declaração.', '2025-01-22', '10:00', 'AGENDADO', 'BAIXA', NULL, false),
('ATD-2025-0004', (SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), 'Ana Carolina Santos', 'Lucia Souza', 'lucia@email.com', '(11) 66666-6666', 'PESSOA_FISICA', 'Cadastro de CPF', 'Orientação para primeira via do CPF para menor de idade', '2025-01-23', '15:00', 'AGENDADO', 'MEDIA', NULL, false),
('ATD-2025-0005', (SELECT id FROM students WHERE email = 'carlos.ferreira@estudante.edu.br'), 'Carlos Ferreira', 'Roberto Lima', 'roberto@comex.com', '(11) 55555-5555', 'MEI', 'ICMS - Inscrição', 'Inscrição estadual para empresa de comércio', '2025-01-24', '11:30', 'AGENDADO', 'ALTA', NULL, false);

-- Atualizar performance dos estudantes na tabela student_performance
UPDATE student_performance SET
  total_attendances = (
    SELECT COUNT(*) FROM attendances
    WHERE student_name = student_performance.student_name
  ),
  avg_rating = (
    SELECT COALESCE(AVG(client_satisfaction_rating), 0)
    FROM attendances
    WHERE student_name = student_performance.student_name
    AND client_satisfaction_rating IS NOT NULL
  ),
  last_activity = NOW()
WHERE student_name IN (
  SELECT DISTINCT student_name FROM attendances
);

-- Inserir avaliações dos estudantes
INSERT INTO student_evaluations (student_id, evaluator_id, technical_score, communication_score, punctuality_score, professionalism_score, overall_score, feedback, evaluation_date) VALUES
((SELECT id FROM students WHERE email = 'ana.santos@estudante.edu.br'), (SELECT id FROM coordinator_users WHERE email = 'coordenador.estacio.ltd2025@developer.com.br'), 5, 5, 5, 4, 4.75, 'Excelente desempenho técnico e ótima comunicação com clientes. Continue assim!', CURRENT_DATE - INTERVAL '5 days'),
((SELECT id FROM students WHERE email = 'joao.silva@estudante.edu.br'), (SELECT id FROM coordinator_users WHERE email = 'coordenador.estacio.ltd2025@developer.com.br'), 4, 4, 5, 4, 4.25, 'Bom conhecimento técnico. Pode melhorar a explicação para clientes leigos.', CURRENT_DATE - INTERVAL '3 days'),
((SELECT id FROM students WHERE email = 'maria.costa@estudante.edu.br'), (SELECT id FROM coordinator_users WHERE email = 'coordenador.estacio.ltd2025@developer.com.br'), 5, 5, 4, 5, 4.75, 'Muito preparada e profissional. Ótima especialização em área rural.', CURRENT_DATE - INTERVAL '1 day');

-- Criar índices para melhor performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_student_sessions_token ON student_sessions(token);
CREATE INDEX idx_attendances_student_id ON attendances(student_id);
CREATE INDEX idx_attendances_status ON attendances(status);
CREATE INDEX idx_attendances_scheduled_date ON attendances(scheduled_date);
CREATE INDEX idx_student_training_progress_student_id ON student_training_progress(student_id);
CREATE INDEX idx_student_evaluations_student_id ON student_evaluations(student_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at
    BEFORE UPDATE ON trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();