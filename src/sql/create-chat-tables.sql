-- Script para criar tabelas do chat no Supabase

-- Tabela de conversas do chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'active_human', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ended_by VARCHAR(50),
  human_requested BOOLEAN DEFAULT FALSE,
  human_request_timestamp TIMESTAMP WITH TIME ZONE,
  chat_accepted_by VARCHAR(255),
  chat_accepted_at TIMESTAMP WITH TIME ZONE,
  coordinator_id VARCHAR(255),
  coordinator_name VARCHAR(255),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'assistant', 'coordinator')),
  sender_id VARCHAR(255),
  sender_name VARCHAR(255),
  is_ai_response BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Tabela de feedback do chat
CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_human_requested ON chat_conversations(human_requested);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_coordinator_id ON chat_conversations(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Inserir algumas conversas de teste
INSERT INTO chat_conversations (
  id,
  user_id,
  user_name,
  user_email,
  status,
  human_requested,
  human_request_timestamp,
  created_at
) VALUES
(
  'test-conversation-1',
  'user-123',
  'Maria Silva',
  'maria@email.com',
  'active',
  true,
  NOW(),
  NOW()
),
(
  'test-conversation-2',
  'user-456',
  'João Santos',
  'joao@email.com',
  'active',
  true,
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '10 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Inserir algumas mensagens de teste
INSERT INTO chat_messages (
  conversation_id,
  content,
  sender_type,
  sender_id,
  sender_name,
  is_ai_response,
  is_read,
  created_at
) VALUES
(
  'test-conversation-1',
  'Olá, preciso de ajuda com declaração de IR',
  'user',
  'user-123',
  'Maria Silva',
  false,
  true,
  NOW() - INTERVAL '2 minutes'
),
(
  'test-conversation-1',
  'Olá! Posso ajudá-la com a declaração de IR. Qual é sua dúvida específica?',
  'assistant',
  'assistant',
  'Assistente NAF',
  true,
  true,
  NOW() - INTERVAL '1 minute'
),
(
  'test-conversation-1',
  'Gostaria de falar com um especialista humano',
  'user',
  'user-123',
  'Maria Silva',
  false,
  true,
  NOW()
) ON CONFLICT DO NOTHING;