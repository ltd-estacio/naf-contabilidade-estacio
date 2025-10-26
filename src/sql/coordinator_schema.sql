-- Tabela para autenticação de coordenadores
CREATE TABLE coordinator_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões de coordenadores
CREATE TABLE coordinator_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES coordinator_users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de acesso dos coordenadores
CREATE TABLE coordinator_login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES coordinator_users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  failure_reason TEXT
);

-- Tabela para métricas do dashboard
CREATE TABLE dashboard_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_date DATE NOT NULL,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para relatórios do coordenador
CREATE TABLE coordinator_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  generated_by UUID REFERENCES coordinator_users(id),
  file_path TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para performance de estudantes
CREATE TABLE student_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  course VARCHAR(100),
  total_attendances INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para métricas de serviços
CREATE TABLE service_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL,
  requests_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  avg_duration_minutes INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(3,2) DEFAULT 0.00,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuário coordenador padrão
INSERT INTO coordinator_users (email, password_hash, is_active)
VALUES (
  'coordenador.estacio.ltd2025@developer.com.br',
  '$2b$12$4T1AQz.DYcEw7tkJyuVKQ.Dq7ccZlgaO5JrkgREPQtEb.J2MTh/SK', -- Hash da senha: Coordenador.estacio-LTD@2025
  true
);

-- Inserir algumas métricas iniciais
INSERT INTO dashboard_metrics (metric_name, metric_value, metric_date, category) VALUES
('atendimentos_mensais', 1247, CURRENT_DATE, 'atendimentos'),
('taxa_conclusao', 94.2, CURRENT_DATE, 'performance'),
('tempo_medio_minutos', 45.8, CURRENT_DATE, 'eficiencia'),
('satisfacao_media', 4.7, CURRENT_DATE, 'qualidade');

-- Inserir dados de performance de estudantes
INSERT INTO student_performance (student_name, course, total_attendances, avg_rating) VALUES
('Ana Silva', 'Ciências Contábeis', 45, 4.8),
('João Santos', 'Administração', 42, 4.7),
('Maria Costa', 'Ciências Contábeis', 38, 4.9),
('Pedro Lima', 'Direito', 35, 4.6);

-- Inserir métricas de serviços
INSERT INTO service_metrics (service_name, requests_count, completed_count, pending_count, avg_duration_minutes, satisfaction_rating, metric_date) VALUES
('Declaração de IR', 324, 298, 26, 52, 4.8, CURRENT_DATE),
('Cadastro de CPF', 287, 275, 12, 35, 4.6, CURRENT_DATE),
('Orientação MEI', 245, 230, 15, 48, 4.7, CURRENT_DATE),
('E-Social Doméstico', 198, 186, 12, 65, 4.5, CURRENT_DATE),
('Certidões Negativas', 156, 149, 7, 28, 4.9, CURRENT_DATE);

-- Criar índices para melhor performance
CREATE INDEX idx_coordinator_users_email ON coordinator_users(email);
CREATE INDEX idx_coordinator_sessions_token ON coordinator_sessions(token);
CREATE INDEX idx_coordinator_sessions_user_id ON coordinator_sessions(user_id);
CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
CREATE INDEX idx_service_metrics_date ON service_metrics(metric_date);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_coordinator_users_updated_at
    BEFORE UPDATE ON coordinator_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_performance_updated_at
    BEFORE UPDATE ON student_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();