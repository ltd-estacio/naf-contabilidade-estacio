-- ================================================
-- CORREÇÃO: Tabelas de Transferência de Chat
-- Este script corrige os tipos de dados incompatíveis
-- ================================================

-- 1. REMOVER TABELAS EXISTENTES (se houver erro anterior)
DROP TABLE IF EXISTS chat_notifications CASCADE;
DROP TABLE IF EXISTS chat_transfer_requests CASCADE;

-- 2. CRIAR TABELA chat_transfer_requests COM TIPOS CORRETOS
CREATE TABLE chat_transfer_requests (
  id TEXT PRIMARY KEY,
  conversation_id INTEGER NOT NULL,  -- ✅ CORRIGIDO: INTEGER ao invés de TEXT
  from_user_id TEXT NOT NULL,
  from_user_type TEXT NOT NULL,
  from_user_name TEXT,
  to_user_id TEXT NOT NULL,
  to_user_type TEXT NOT NULL,
  to_user_name TEXT,
  transfer_reason TEXT,
  transfer_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  transferred_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign Key corrigida
  CONSTRAINT chat_transfer_requests_conversation_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id)
    ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_transfer_conversation ON chat_transfer_requests(conversation_id);
CREATE INDEX idx_transfer_to_user ON chat_transfer_requests(to_user_id);
CREATE INDEX idx_transfer_status ON chat_transfer_requests(status);
CREATE INDEX idx_transfer_created ON chat_transfer_requests(created_at DESC);

-- 3. CRIAR TABELA chat_notifications
CREATE TABLE chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('coordinator', 'student', 'user')),
  conversation_id INTEGER,  -- ✅ CORRIGIDO: INTEGER ao invés de TEXT
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Foreign Key corrigida
  CONSTRAINT chat_notifications_conversation_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id)
    ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_notif_user ON chat_notifications(user_id);
CREATE INDEX idx_notif_type ON chat_notifications(notification_type);
CREATE INDEX idx_notif_read ON chat_notifications(is_read);
CREATE INDEX idx_notif_created ON chat_notifications(created_at DESC);
CREATE INDEX idx_notif_user_unread ON chat_notifications(user_id, is_read) WHERE is_read = FALSE;

-- 4. ADICIONAR COLUNAS FALTANTES EM chat_conversations (se não existirem)
ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS transferred_from TEXT,
  ADD COLUMN IF NOT EXISTS transfer_pending BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS coordinator_name TEXT;

-- Índices para colunas novas
CREATE INDEX IF NOT EXISTS idx_conv_transfer_pending ON chat_conversations(transfer_pending) WHERE transfer_pending = TRUE;
CREATE INDEX IF NOT EXISTS idx_conv_student ON chat_conversations(student_id);

-- 5. ATUALIZAR sender_type em chat_messages para aceitar 'system'
ALTER TABLE chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;

ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_sender_type_check
  CHECK (sender_type IN ('user', 'assistant', 'coordinator', 'system'));

-- 6. MENSAGEM DE SUCESSO
DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas de transferência criadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tabelas criadas:';
  RAISE NOTICE '  - chat_transfer_requests (conversation_id: INTEGER)';
  RAISE NOTICE '  - chat_notifications (conversation_id: INTEGER)';
  RAISE NOTICE '';
  RAISE NOTICE 'Colunas adicionadas em chat_conversations:';
  RAISE NOTICE '  - transferred_from';
  RAISE NOTICE '  - transfer_pending';
  RAISE NOTICE '  - student_id';
  RAISE NOTICE '  - student_name';
  RAISE NOTICE '  - coordinator_name';
  RAISE NOTICE '';
  RAISE NOTICE 'Índices criados para performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Agora você pode testar a transferência de conversas!';
END $$;
