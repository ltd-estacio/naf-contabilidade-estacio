-- Sistema de Links de Acesso ao Chat NAF
-- Permite que estudantes gerem links únicos para ativar o chat para usuários específicos

-- Tabela para armazenar links de acesso ao chat
CREATE TABLE IF NOT EXISTS chat_access_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação do link
    link_token VARCHAR(255) NOT NULL UNIQUE,
    link_slug VARCHAR(100) UNIQUE,

    -- Quem criou o link
    created_by_student_id UUID NOT NULL,
    created_by_student_name VARCHAR(255) NOT NULL,

    -- Configurações do link
    title VARCHAR(255) DEFAULT 'Chat NAF - Assistente Virtual',
    description TEXT,
    custom_message TEXT,

    -- Controle de uso
    max_uses INTEGER DEFAULT NULL, -- NULL = ilimitado
    current_uses INTEGER DEFAULT 0,

    -- Validade
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,

    -- Rastreamento
    last_used_at TIMESTAMP WITH TIME ZONE,
    total_conversations_started INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key
    CONSTRAINT chat_access_links_student_fkey FOREIGN KEY (created_by_student_id)
        REFERENCES students(id) ON DELETE CASCADE
);

-- Tabela para rastrear uso dos links
CREATE TABLE IF NOT EXISTS chat_link_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Qual link foi usado
    link_id UUID NOT NULL,
    link_token VARCHAR(255) NOT NULL,

    -- Quem usou
    user_ip VARCHAR(45),
    user_agent TEXT,
    user_id VARCHAR(255), -- ID do chat_user se registrou

    -- Informações da sessão
    conversation_id INTEGER,

    -- Dados geográficos (opcional)
    user_country VARCHAR(100),
    user_city VARCHAR(100),

    -- Timestamp
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT chat_link_usage_link_fkey FOREIGN KEY (link_id)
        REFERENCES chat_access_links(id) ON DELETE CASCADE,
    CONSTRAINT chat_link_usage_conversation_fkey FOREIGN KEY (conversation_id)
        REFERENCES chat_conversations(id) ON DELETE SET NULL
);

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_chat_link_token()
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
    v_exists BOOLEAN;
    v_counter INTEGER := 0;
BEGIN
    LOOP
        -- Gerar token aleatório (formato: CHAT-XXXXXXXX)
        v_token := 'CHAT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

        -- Verificar se já existe
        SELECT EXISTS(
            SELECT 1 FROM chat_access_links WHERE link_token = v_token
        ) INTO v_exists;

        -- Se não existe ou tentou muitas vezes, sair do loop
        IF NOT v_exists OR v_counter > 100 THEN
            EXIT;
        END IF;

        v_counter := v_counter + 1;
    END LOOP;

    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar slug amigável
CREATE OR REPLACE FUNCTION generate_chat_link_slug(student_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_slug TEXT;
    v_base_slug TEXT;
    v_exists BOOLEAN;
    v_counter INTEGER := 1;
BEGIN
    -- Criar slug base a partir do nome do estudante
    v_base_slug := LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(student_name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    ));

    -- Limitar tamanho
    v_base_slug := SUBSTRING(v_base_slug FROM 1 FOR 30);

    v_slug := v_base_slug;

    LOOP
        -- Verificar se já existe
        SELECT EXISTS(
            SELECT 1 FROM chat_access_links WHERE link_slug = v_slug
        ) INTO v_exists;

        -- Se não existe, usar este slug
        IF NOT v_exists THEN
            EXIT;
        END IF;

        -- Adicionar número sequencial
        v_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;

        -- Limite de segurança
        IF v_counter > 1000 THEN
            -- Usar token aleatório como fallback
            v_slug := 'chat-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
            EXIT;
        END IF;
    END LOOP;

    RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_chat_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_update_chat_link_timestamp ON chat_access_links;
CREATE TRIGGER trig_update_chat_link_timestamp
    BEFORE UPDATE ON chat_access_links
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_link_timestamp();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_access_links_token ON chat_access_links(link_token);
CREATE INDEX IF NOT EXISTS idx_chat_access_links_slug ON chat_access_links(link_slug);
CREATE INDEX IF NOT EXISTS idx_chat_access_links_student ON chat_access_links(created_by_student_id);
CREATE INDEX IF NOT EXISTS idx_chat_access_links_active ON chat_access_links(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_link_usage_link ON chat_link_usage_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_chat_link_usage_accessed ON chat_link_usage_logs(accessed_at);

-- View para estatísticas dos links
CREATE OR REPLACE VIEW chat_link_statistics AS
SELECT
    cl.id,
    cl.link_token,
    cl.link_slug,
    cl.created_by_student_id,
    cl.created_by_student_name,
    cl.title,
    cl.max_uses,
    cl.current_uses,
    cl.is_active,
    cl.expires_at,
    cl.created_at,
    cl.last_used_at,
    cl.total_conversations_started,
    COUNT(DISTINCT lu.id) as total_accesses,
    COUNT(DISTINCT lu.user_id) as unique_users,
    COUNT(DISTINCT lu.conversation_id) as conversations_created,
    MAX(lu.accessed_at) as last_access_date
FROM chat_access_links cl
LEFT JOIN chat_link_usage_logs lu ON lu.link_id = cl.id
GROUP BY
    cl.id, cl.link_token, cl.link_slug, cl.created_by_student_id,
    cl.created_by_student_name, cl.title, cl.max_uses, cl.current_uses,
    cl.is_active, cl.expires_at, cl.created_at, cl.last_used_at,
    cl.total_conversations_started;

-- Comentários
COMMENT ON TABLE chat_access_links IS 'Links gerados por estudantes para ativar o chat para usuários';
COMMENT ON TABLE chat_link_usage_logs IS 'Log de uso dos links de acesso ao chat';
COMMENT ON COLUMN chat_access_links.link_token IS 'Token único do link (CHAT-XXXXXXXX)';
COMMENT ON COLUMN chat_access_links.link_slug IS 'Slug amigável para URL (opcional)';
COMMENT ON COLUMN chat_access_links.max_uses IS 'Número máximo de usos (NULL = ilimitado)';
COMMENT ON COLUMN chat_access_links.current_uses IS 'Contador de usos atuais';
