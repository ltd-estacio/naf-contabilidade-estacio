-- Schema para Sistema de Notificações Profissional
-- Sistema NAF Contábil - Notificações por Tipo de Usuário

-- Enum para tipos de usuário
CREATE TYPE user_type_enum AS ENUM ('user', 'student', 'coordinator');

-- Enum para tipos de notificação
CREATE TYPE notification_type_enum AS ENUM (
    'appointment_scheduled',      -- Agendamento criado
    'appointment_confirmed',      -- Agendamento confirmado
    'appointment_cancelled',      -- Agendamento cancelado
    'appointment_reminder',       -- Lembrete de agendamento
    'appointment_completed',      -- Agendamento concluído
    'document_required',          -- Documento necessário
    'training_assigned',          -- Treinamento atribuído
    'training_completed',         -- Treinamento concluído
    'performance_report',         -- Relatório de desempenho
    'system_maintenance',         -- Manutenção do sistema
    'new_service_available',      -- Novo serviço disponível
    'deadline_reminder',          -- Lembrete de prazo
    'status_update',              -- Atualização de status
    'achievement_earned',         -- Conquista obtida
    'feedback_request',           -- Solicitação de feedback
    'emergency_alert'             -- Alerta de emergência
);

-- Enum para prioridade
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');

-- Enum para status da notificação
CREATE TYPE notification_status_enum AS ENUM ('unread', 'read', 'archived', 'dismissed');

-- Tabela principal de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação do destinatário
    recipient_id UUID NOT NULL,
    recipient_type user_type_enum NOT NULL,
    recipient_email VARCHAR(255),

    -- Conteúdo da notificação
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type_enum NOT NULL,
    priority priority_enum DEFAULT 'medium',

    -- Dados específicos (JSON para flexibilidade)
    metadata JSONB DEFAULT '{}',

    -- Configurações de exibição
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    action_url TEXT,
    action_label VARCHAR(100),

    -- Configurações de entrega
    send_email BOOLEAN DEFAULT false,
    send_push BOOLEAN DEFAULT false,
    send_sms BOOLEAN DEFAULT false,

    -- Status e controle
    status notification_status_enum DEFAULT 'unread',
    is_persistent BOOLEAN DEFAULT false, -- Se deve permanecer até ser dismissada
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Relacionamentos
    related_appointment_id UUID,
    related_training_id UUID,
    created_by UUID, -- Quem criou a notificação

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,

    -- Índices para busca
    CONSTRAINT chk_valid_email CHECK (recipient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela para templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_name VARCHAR(100) UNIQUE NOT NULL,
    notification_type notification_type_enum NOT NULL,
    user_type user_type_enum NOT NULL,

    -- Template do conteúdo
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,

    -- Configurações padrão
    default_priority priority_enum DEFAULT 'medium',
    default_icon VARCHAR(50),
    default_color VARCHAR(7),

    -- Configurações de entrega padrão
    default_send_email BOOLEAN DEFAULT false,
    default_send_push BOOLEAN DEFAULT true,
    default_send_sms BOOLEAN DEFAULT false,

    -- Configurações de expiração
    default_expires_hours INTEGER,
    is_persistent BOOLEAN DEFAULT false,

    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para preferências de notificação por usuário
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    user_type user_type_enum NOT NULL,

    -- Preferências por tipo de notificação
    notification_type notification_type_enum NOT NULL,

    -- Canais habilitados
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,

    -- Configurações de horário
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

    -- Frequência
    digest_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily, weekly

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, user_type, notification_type)
);

-- Tabela para histórico de envios
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,

    delivery_method VARCHAR(20) NOT NULL, -- email, push, sms
    delivery_status VARCHAR(20) NOT NULL, -- sent, delivered, failed, bounced

    provider VARCHAR(50), -- Nome do provedor usado
    external_id VARCHAR(255), -- ID externo do provedor

    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir templates para usuários comuns
INSERT INTO notification_templates (template_name, notification_type, user_type, title_template, message_template, default_icon, default_color, default_send_email) VALUES

-- Templates para Usuários Comuns
('user_appointment_scheduled', 'appointment_scheduled', 'user',
 'Agendamento Confirmado - {{service_title}}',
 'Seu agendamento para {{service_title}} foi confirmado para {{appointment_date}} às {{appointment_time}}. Protocolo: {{protocol}}',
 'calendar', '#10B981', true),

('user_appointment_confirmed', 'appointment_confirmed', 'user',
 'Agendamento Confirmado pelo NAF',
 'Seu agendamento {{protocol}} foi confirmado. Por favor, compareça no horário agendado: {{appointment_date}} às {{appointment_time}}.',
 'check-circle', '#10B981', true),

('user_appointment_reminder', 'appointment_reminder', 'user',
 'Lembrete: Atendimento Amanhã',
 'Lembrete: Você tem um atendimento agendado para amanhã ({{appointment_date}}) às {{appointment_time}}. Serviço: {{service_title}}',
 'clock', '#F59E0B', true),

('user_document_required', 'document_required', 'user',
 'Documentos Necessários - {{service_title}}',
 'Para o seu atendimento de {{service_title}}, você precisará trazer: {{required_documents}}. Data do atendimento: {{appointment_date}}',
 'file-text', '#EF4444', true),

('user_appointment_completed', 'appointment_completed', 'user',
 'Atendimento Concluído',
 'Seu atendimento foi concluído com sucesso! Protocolo: {{protocol}}. Obrigado por utilizar os serviços do NAF.',
 'check-circle-2', '#10B981', true),

-- Templates para Estudantes
('student_training_assigned', 'training_assigned', 'student',
 'Novo Treinamento Atribuído',
 'Um novo treinamento foi atribuído para você: {{training_title}}. Prazo para conclusão: {{deadline}}',
 'graduation-cap', '#3B82F6', true),

('student_appointment_assigned', 'appointment_scheduled', 'student',
 'Novo Atendimento Atribuído',
 'Um novo atendimento foi atribuído para você. Cliente: {{client_name}}, Serviço: {{service_title}}, Data: {{appointment_date}}',
 'user-plus', '#8B5CF6', true),

('student_performance_report', 'performance_report', 'student',
 'Relatório de Desempenho Mensal',
 'Seu relatório de desempenho está disponível. Total de atendimentos: {{total_attendances}}, Avaliação média: {{avg_rating}}',
 'chart-bar', '#06B6D4', true),

('student_achievement_earned', 'achievement_earned', 'student',
 'Parabéns! Nova Conquista',
 'Você conquistou: {{achievement_name}}! Continue assim e alcance novos objetivos.',
 'trophy', '#F59E0B', false),

-- Templates para Coordenadores
('coordinator_new_appointment', 'appointment_scheduled', 'coordinator',
 'Novo Agendamento Recebido',
 'Nova solicitação de atendimento: {{service_title}} para {{client_name}}. Protocolo: {{protocol}}',
 'calendar-plus', '#EF4444', true),

('coordinator_urgent_appointment', 'appointment_scheduled', 'coordinator',
 'URGENTE: Agendamento Prioritário',
 'Agendamento urgente recebido: {{service_title}} para {{client_name}}. Requer atenção imediata. Protocolo: {{protocol}}',
 'alert-triangle', '#EF4444', true),

('coordinator_system_maintenance', 'system_maintenance', 'coordinator',
 'Manutenção do Sistema Programada',
 'Manutenção programada para {{maintenance_date}} das {{start_time}} às {{end_time}}. Sistema ficará indisponível.',
 'settings', '#6B7280', true),

('coordinator_monthly_report', 'performance_report', 'coordinator',
 'Relatório Mensal Disponível',
 'O relatório mensal de {{month}}/{{year}} está disponível com {{total_appointments}} atendimentos realizados.',
 'file-bar-chart', '#10B981', true);

-- Inserir preferências padrão para diferentes tipos de usuário
INSERT INTO notification_preferences (user_id, user_type, notification_type, email_enabled, push_enabled)
VALUES
-- Usuário comum - preferências conservadoras
('00000000-0000-0000-0000-000000000001', 'user', 'appointment_scheduled', true, true),
('00000000-0000-0000-0000-000000000001', 'user', 'appointment_confirmed', true, true),
('00000000-0000-0000-0000-000000000001', 'user', 'appointment_reminder', true, true),
('00000000-0000-0000-0000-000000000001', 'user', 'document_required', true, true),
('00000000-0000-0000-0000-000000000001', 'user', 'appointment_completed', false, true),

-- Estudante - mais notificações para treinamento
('00000000-0000-0000-0000-000000000002', 'student', 'training_assigned', true, true),
('00000000-0000-0000-0000-000000000002', 'student', 'appointment_scheduled', true, true),
('00000000-0000-0000-0000-000000000002', 'student', 'performance_report', true, false),
('00000000-0000-0000-0000-000000000002', 'student', 'achievement_earned', false, true),

-- Coordenador - todas as notificações importantes
('6774c415-d927-47af-af90-dd30e41d9783', 'coordinator', 'appointment_scheduled', true, true),
('6774c415-d927-47af-af90-dd30e41d9783', 'coordinator', 'system_maintenance', true, true),
('6774c415-d927-47af-af90-dd30e41d9783', 'coordinator', 'performance_report', true, false);

-- Função para criar notificação a partir de template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    template_name_param VARCHAR(100),
    recipient_id_param UUID,
    recipient_type_param user_type_enum,
    variables_param JSONB DEFAULT '{}'::JSONB,
    custom_metadata_param JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
    template_record notification_templates%ROWTYPE;
    notification_id UUID;
    processed_title TEXT;
    processed_message TEXT;
    var_key TEXT;
    var_value TEXT;
BEGIN
    -- Buscar template
    SELECT * INTO template_record
    FROM notification_templates
    WHERE template_name = template_name_param AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template não encontrado: %', template_name_param;
    END IF;

    -- Processar variáveis no título e mensagem
    processed_title := template_record.title_template;
    processed_message := template_record.message_template;

    -- Substituir variáveis
    FOR var_key, var_value IN SELECT * FROM jsonb_each_text(variables_param) LOOP
        processed_title := REPLACE(processed_title, '{{' || var_key || '}}', var_value);
        processed_message := REPLACE(processed_message, '{{' || var_key || '}}', var_value);
    END LOOP;

    -- Inserir notificação
    INSERT INTO notifications (
        recipient_id, recipient_type, title, message, notification_type,
        priority, icon, color, send_email, send_push, send_sms,
        metadata, expires_at, is_persistent
    ) VALUES (
        recipient_id_param, recipient_type_param, processed_title, processed_message,
        template_record.notification_type, template_record.default_priority,
        template_record.default_icon, template_record.default_color,
        template_record.default_send_email, template_record.default_send_push,
        template_record.default_send_sms, custom_metadata_param,
        CASE
            WHEN template_record.default_expires_hours IS NOT NULL
            THEN NOW() + (template_record.default_expires_hours || ' hours')::INTERVAL
            ELSE NULL
        END,
        template_record.is_persistent
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET status = 'read', read_at = NOW()
    WHERE id = notification_id_param AND status = 'unread';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at < NOW()
    AND status != 'unread'
    AND is_persistent = false;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id, user_type);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_templates_timestamp
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_timestamp();

CREATE TRIGGER trigger_update_notification_preferences_timestamp
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_timestamp();

-- Comentários para documentação
COMMENT ON TABLE notifications IS 'Tabela principal de notificações para todos os tipos de usuário';
COMMENT ON TABLE notification_templates IS 'Templates reutilizáveis para diferentes tipos de notificação';
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação personalizadas por usuário';
COMMENT ON TABLE notification_delivery_log IS 'Log de entregas de notificações para auditoria';

COMMENT ON FUNCTION create_notification_from_template IS 'Cria notificação usando template com substituição de variáveis';
COMMENT ON FUNCTION mark_notification_read IS 'Marca notificação como lida';
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Remove notificações expiradas não persistentes';