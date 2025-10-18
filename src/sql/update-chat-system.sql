-- Script SQL para melhorias no sistema de chat NAF
-- Baseado em: src/sql/chat-user-registration-tables.sql
-- Execução: psql -d naf_contabil -f sql/update-chat-system.sql

-- 1. Adicionar coluna de senha na tabela de usuários do chat existente
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Adicionar colunas para coordenadores e estudantes nas tabelas existentes
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS assigned_coordinator_id VARCHAR(50);
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS assigned_student_id VARCHAR(50);
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 2. Criar tabela para sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'student', 'coordinator')),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    assigned_coordinator_id VARCHAR(50),
    assigned_student_id VARCHAR(50),
    transferred_from_user_id VARCHAR(50),
    transferred_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela para mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50),
    sender_id VARCHAR(50),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'student', 'coordinator', 'system')),
    sender_name VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system', 'transfer')),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Adicionar colunas à tabela de agendamentos existente
ALTER TABLE chat_appointments ADD COLUMN IF NOT EXISTS chat_session_id VARCHAR(50);
ALTER TABLE chat_appointments ADD COLUMN IF NOT EXISTS created_by_user_id VARCHAR(50);
ALTER TABLE chat_appointments ADD COLUMN IF NOT EXISTS created_by_user_type VARCHAR(20);
ALTER TABLE chat_appointments ADD COLUMN IF NOT EXISTS assigned_student_id VARCHAR(50);

-- 5. Criar tabela para transferências de atendimento
CREATE TABLE IF NOT EXISTS chat_transfers (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50),
    from_user_id VARCHAR(50) NOT NULL,
    from_user_type VARCHAR(20) NOT NULL CHECK (from_user_type IN ('student', 'coordinator')),
    from_user_name VARCHAR(255) NOT NULL,
    to_user_id VARCHAR(50) NOT NULL,
    to_user_type VARCHAR(20) NOT NULL CHECK (to_user_type IN ('student', 'coordinator')),
    to_user_name VARCHAR(255) NOT NULL,
    transfer_reason TEXT,
    transfer_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Garantir que todas as colunas necessárias existem nas tabelas criadas
-- Adicionar colunas faltantes na tabela chat_sessions se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_type VARCHAR(20);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_phone VARCHAR(20);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS session_token VARCHAR(255);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS assigned_coordinator_id VARCHAR(50);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS assigned_student_id VARCHAR(50);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS transferred_from_user_id VARCHAR(50);
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP;
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Adicionar colunas faltantes na tabela chat_messages se necessário
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS session_id VARCHAR(50);
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id VARCHAR(50);
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20);
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_text TEXT;
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Adicionar colunas faltantes na tabela chat_transfers se necessário
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_transfers') THEN
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS session_id VARCHAR(50);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS from_user_id VARCHAR(50);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS from_user_type VARCHAR(20);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS from_user_name VARCHAR(255);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS to_user_id VARCHAR(50);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS to_user_type VARCHAR(20);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS to_user_name VARCHAR(255);
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS transfer_reason TEXT;
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS transfer_notes TEXT;
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
        ALTER TABLE chat_transfers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 7. Foreign keys serão adicionados posteriormente se necessário
-- (Removido para evitar problemas de dependência durante criação inicial)

-- 8. Criar índices para performance (com verificação de existência das tabelas)
DO $$
BEGIN
    -- Índices para chat_sessions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id, user_type);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'assigned_coordinator_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_coordinators ON chat_sessions(assigned_coordinator_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'assigned_student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_students ON chat_sessions(assigned_student_id);
        END IF;
    END IF;

    -- Índices para chat_messages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'session_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sender_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id, sender_type);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sent_at') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_read') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
        END IF;
    END IF;

    -- Índices para chat_appointments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_appointments') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_appointments' AND column_name = 'chat_session_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_appointments_session ON chat_appointments(chat_session_id);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_chat_appointments_status ON chat_appointments(status);
        CREATE INDEX IF NOT EXISTS idx_chat_appointments_date ON chat_appointments(scheduled_datetime);
    END IF;

    -- Índices para chat_transfers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_transfers') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_transfers' AND column_name = 'session_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_transfers_session ON chat_transfers(session_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_transfers' AND column_name = 'from_user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_transfers_from_user ON chat_transfers(from_user_id, from_user_type);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_transfers' AND column_name = 'to_user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_transfers_to_user ON chat_transfers(to_user_id, to_user_type);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_transfers' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_transfers_status ON chat_transfers(status);
        END IF;
    END IF;
END $$;

-- 8. Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar triggers para atualizar timestamps automaticamente (se não existirem)
DO $$
BEGIN
    -- Trigger para chat_sessions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_chat_sessions_updated_at'
        AND event_object_table = 'chat_sessions'
    ) THEN
        CREATE TRIGGER update_chat_sessions_updated_at
            BEFORE UPDATE ON chat_sessions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para chat_appointments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_chat_appointments_updated_at'
        AND event_object_table = 'chat_appointments'
    ) THEN
        CREATE TRIGGER update_chat_appointments_updated_at
            BEFORE UPDATE ON chat_appointments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 10. Inserir dados de exemplo para desenvolvimento (opcional)
-- Senhas de exemplo usando bcrypt (hash de '123456')
-- Note: Para coordenadores e estudantes, as senhas serão gerenciadas pelo sistema externo

-- 11. Comentários para documentação
COMMENT ON TABLE chat_sessions IS 'Sessões ativas de chat entre clientes e atendentes';
COMMENT ON TABLE chat_messages IS 'Mensagens trocadas durante as sessões de chat';
COMMENT ON TABLE chat_appointments IS 'Agendamentos criados através do chat';
COMMENT ON TABLE chat_transfers IS 'Histórico de transferências entre atendentes';

COMMENT ON COLUMN chat_sessions.user_type IS 'Tipo do usuário: client, student, coordinator';
COMMENT ON COLUMN chat_sessions.status IS 'Status da sessão: active, inactive, transferred';
COMMENT ON COLUMN chat_messages.sender_type IS 'Tipo do remetente: client, student, coordinator, system';
COMMENT ON COLUMN chat_messages.message_type IS 'Tipo da mensagem: text, file, image, system, transfer';

-- Confirmação
SELECT 'Chat system tables created successfully!' as result;