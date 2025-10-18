-- ==================================================
-- SISTEMA DE CADASTRO DE USUÁRIOS VIA CHAT
-- Tabelas para gerenciar cadastro e agendamentos
-- ==================================================

-- Tabela para usuários cadastrados via chat
CREATE TABLE IF NOT EXISTS chat_users (
  id VARCHAR(50) PRIMARY KEY,
  conversation_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  occupation VARCHAR(100),
  company VARCHAR(255),
  income_range VARCHAR(50),
  preferred_contact VARCHAR(20) DEFAULT 'email', -- 'email', 'phone', 'whatsapp'
  service_interest JSONB DEFAULT '[]'::jsonb,
  registration_source VARCHAR(20) DEFAULT 'chat',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para agendamentos de conversa
CREATE TABLE IF NOT EXISTS chat_appointments (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  coordinator_id VARCHAR(50),
  conversation_id VARCHAR(100),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_datetime TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  service_type VARCHAR(100),
  service_description TEXT,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES chat_users(id) ON DELETE CASCADE
);

-- Tabela para histórico de conversas persistentes
CREATE TABLE IF NOT EXISTS chat_conversation_history (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  coordinator_id VARCHAR(50),
  appointment_id VARCHAR(50),
  conversation_id VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  summary TEXT,
  total_messages INTEGER DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'archived'
  satisfaction_rating INTEGER, -- 1-5
  satisfaction_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES chat_users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES chat_appointments(id) ON DELETE SET NULL
);

-- Tabela para mensagens persistentes do chat
CREATE TABLE IF NOT EXISTS chat_persistent_messages (
  id VARCHAR(50) PRIMARY KEY,
  conversation_history_id VARCHAR(50) NOT NULL,
  conversation_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(50),
  content TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'user', 'coordinator', 'assistant', 'system'
  sender_id VARCHAR(50),
  sender_name VARCHAR(255),
  is_ai_response BOOLEAN DEFAULT FALSE,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'appointment', 'registration'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (conversation_history_id) REFERENCES chat_conversation_history(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES chat_users(id) ON DELETE SET NULL
);

-- Tabela para formulário de cadastro em etapas
CREATE TABLE IF NOT EXISTS chat_registration_sessions (
  id VARCHAR(50) PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  form_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para disponibilidade de coordenadores
CREATE TABLE IF NOT EXISTS coordinator_availability (
  id VARCHAR(50) PRIMARY KEY,
  coordinator_id VARCHAR(50) NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_appointments INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_users_email ON chat_users(email);
CREATE INDEX IF NOT EXISTS idx_chat_users_conversation_id ON chat_users(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_users_status ON chat_users(status);

CREATE INDEX IF NOT EXISTS idx_chat_appointments_user_id ON chat_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_appointments_coordinator_id ON chat_appointments(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_chat_appointments_scheduled_date ON chat_appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_chat_appointments_status ON chat_appointments(status);
CREATE INDEX IF NOT EXISTS idx_chat_appointments_scheduled_datetime ON chat_appointments(scheduled_datetime);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_history_user_id ON chat_conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation_history_conversation_id ON chat_conversation_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation_history_status ON chat_conversation_history(status);

CREATE INDEX IF NOT EXISTS idx_chat_persistent_messages_conversation_history_id ON chat_persistent_messages(conversation_history_id);
CREATE INDEX IF NOT EXISTS idx_chat_persistent_messages_conversation_id ON chat_persistent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_persistent_messages_user_id ON chat_persistent_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_persistent_messages_created_at ON chat_persistent_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_registration_sessions_conversation_id ON chat_registration_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_registration_sessions_status ON chat_registration_sessions(status);

CREATE INDEX IF NOT EXISTS idx_coordinator_availability_coordinator_id ON coordinator_availability(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_availability_day_of_week ON coordinator_availability(day_of_week);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_users_updated_at BEFORE UPDATE ON chat_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_appointments_updated_at BEFORE UPDATE ON chat_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversation_history_updated_at BEFORE UPDATE ON chat_conversation_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_registration_sessions_updated_at BEFORE UPDATE ON chat_registration_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_availability_updated_at BEFORE UPDATE ON coordinator_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir disponibilidade padrão para coordenadores (exemplo)
INSERT INTO coordinator_availability (id, coordinator_id, day_of_week, start_time, end_time, max_appointments) VALUES
('avail-1', 'coord-1', 1, '08:00:00', '17:00:00', 8),  -- Segunda
('avail-2', 'coord-1', 2, '08:00:00', '17:00:00', 8),  -- Terça
('avail-3', 'coord-1', 3, '08:00:00', '17:00:00', 8),  -- Quarta
('avail-4', 'coord-1', 4, '08:00:00', '17:00:00', 8),  -- Quinta
('avail-5', 'coord-1', 5, '08:00:00', '16:00:00', 6),  -- Sexta
('avail-6', 'coord-2', 1, '09:00:00', '18:00:00', 6),  -- Segunda
('avail-7', 'coord-2', 2, '09:00:00', '18:00:00', 6),  -- Terça
('avail-8', 'coord-2', 3, '09:00:00', '18:00:00', 6),  -- Quarta
('avail-9', 'coord-2', 4, '09:00:00', '18:00:00', 6),  -- Quinta
('avail-10', 'coord-2', 5, '09:00:00', '17:00:00', 5)  -- Sexta
ON CONFLICT (id) DO NOTHING;

-- Views úteis para relatórios
CREATE OR REPLACE VIEW chat_users_summary AS
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
FROM chat_users;

CREATE OR REPLACE VIEW chat_appointments_summary AS
SELECT
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN scheduled_date = CURRENT_DATE THEN 1 END) as today_appointments,
    COUNT(CASE WHEN scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as week_appointments
FROM chat_appointments;

-- Comentários nas tabelas
COMMENT ON TABLE chat_users IS 'Usuários cadastrados via chat com informações completas';
COMMENT ON TABLE chat_appointments IS 'Agendamentos de conversas entre usuários e coordenadores';
COMMENT ON TABLE chat_conversation_history IS 'Histórico de conversas para persistência';
COMMENT ON TABLE chat_persistent_messages IS 'Mensagens persistentes das conversas';
COMMENT ON TABLE chat_registration_sessions IS 'Sessões de cadastro em etapas via chat';
COMMENT ON TABLE coordinator_availability IS 'Disponibilidade de horários dos coordenadores';