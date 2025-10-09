-- Tabela para Solicitações de Transferência de Chat
-- Suporta transferências tanto para estudantes quanto para coordenadores

CREATE TABLE IF NOT EXISTS chat_transfer_requests (
    id VARCHAR(100) PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    from_coordinator_id UUID NOT NULL,
    from_coordinator_name VARCHAR(255) NOT NULL,

    -- Campos para transferência para estudante
    to_student_id VARCHAR(100),
    to_student_name VARCHAR(255),

    -- Campos para transferência para coordenador
    to_coordinator_id UUID,
    to_coordinator_name VARCHAR(255),

    -- Tipo de transferência
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('to_student', 'to_coordinator')),

    -- Informações da transferência
    reason TEXT,
    message TEXT,

    -- Status e timestamps
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_message TEXT,

    -- Garantir que existe um destinatário (estudante OU coordenador)
    CONSTRAINT check_recipient CHECK (
        (to_student_id IS NOT NULL AND to_coordinator_id IS NULL) OR
        (to_student_id IS NULL AND to_coordinator_id IS NOT NULL)
    )
);

-- Tabela para Logs de Transferência
CREATE TABLE IF NOT EXISTS chat_transfer_logs (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    from_coordinator_id UUID,
    to_coordinator_id UUID,
    to_student_id VARCHAR(100),
    request_type VARCHAR(20) CHECK (request_type IN ('to_student', 'to_coordinator')),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    transferred_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_conversation ON chat_transfer_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_from_coordinator ON chat_transfer_requests(from_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_to_student ON chat_transfer_requests(to_student_id);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_to_coordinator ON chat_transfer_requests(to_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_status ON chat_transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_created_at ON chat_transfer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_requests_expires_at ON chat_transfer_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_chat_transfer_logs_conversation ON chat_transfer_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_logs_status ON chat_transfer_logs(status);
CREATE INDEX IF NOT EXISTS idx_chat_transfer_logs_requested_at ON chat_transfer_logs(requested_at DESC);

-- Comentários para documentação
COMMENT ON TABLE chat_transfer_requests IS 'Solicitações de transferência de chat entre coordenadores e estudantes';
COMMENT ON COLUMN chat_transfer_requests.transfer_type IS 'Tipo: to_student (para estudante) ou to_coordinator (para coordenador)';
COMMENT ON COLUMN chat_transfer_requests.status IS 'Status: pending, accepted, rejected, expired';
COMMENT ON COLUMN chat_transfer_requests.expires_at IS 'Data de expiração da solicitação (geralmente 10-30 minutos)';

COMMENT ON TABLE chat_transfer_logs IS 'Histórico completo de todas as transferências de chat';

-- Confirmação
SELECT 'Tabelas de transferência criadas com sucesso!' as result;
