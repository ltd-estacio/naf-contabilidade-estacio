-- ========================================
-- SISTEMA DE ANOTAÇÕES DO COORDENADOR
-- ========================================
-- Tabela para armazenar anotações do coordenador
-- com suporte a categorias, tags, anexos e busca avançada
-- ========================================

-- Criar tabela principal de anotações
CREATE TABLE IF NOT EXISTS coordinator_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação do coordenador
  coordinator_id VARCHAR(255) NOT NULL,
  coordinator_name VARCHAR(255) NOT NULL,
  coordinator_email VARCHAR(255) NOT NULL,
  
  -- Conteúdo da anotação
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Resumo gerado automaticamente
  
  -- Categorização
  category VARCHAR(100) NOT NULL, -- 'ADMINISTRACAO', 'CONTABILIDADE', 'SISTEMAS_INFORMACAO', 'GERAL', 'REUNIAO', 'ESTUDANTES', 'PROFESSORES', 'ATENDIMENTOS'
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'ARCHIVED', 'DELETED', 'DRAFT'
  
  -- Tags e palavras-chave
  tags TEXT[], -- Array de tags para busca
  keywords TEXT[], -- Palavras-chave extraídas automaticamente
  
  -- Datas importantes
  note_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Data da ocorrência
  reminder_date TIMESTAMP WITH TIME ZONE, -- Data para lembrete
  due_date DATE, -- Data limite (se aplicável)
  
  -- Relacionamentos
  related_student_ids UUID[], -- IDs de estudantes relacionados
  related_teacher_ids UUID[], -- IDs de professores relacionados
  related_attendance_ids UUID[], -- IDs de atendimentos relacionados
  
  -- Anexos e referências
  attachments JSONB DEFAULT '[]'::jsonb, -- [{name, url, type, size}]
  external_references JSONB DEFAULT '[]'::jsonb, -- [{title, url, description}]
  
  -- Controle de acesso
  is_private BOOLEAN DEFAULT FALSE, -- Anotação privada
  is_pinned BOOLEAN DEFAULT FALSE, -- Fixar no topo
  is_favorite BOOLEAN DEFAULT FALSE, -- Marcar como favorito
  
  -- Versionamento
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES coordinator_notes(id),
  edit_history JSONB DEFAULT '[]'::jsonb, -- [{date, user, changes}]
  
  -- Metadados
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_coordinator_id ON coordinator_notes(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_category ON coordinator_notes(category);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_priority ON coordinator_notes(priority);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_status ON coordinator_notes(status);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_note_date ON coordinator_notes(note_date DESC);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_created_at ON coordinator_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_tags ON coordinator_notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_is_pinned ON coordinator_notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_is_favorite ON coordinator_notes(is_favorite) WHERE is_favorite = TRUE;

-- Índice de busca full-text
CREATE INDEX IF NOT EXISTS idx_coordinator_notes_search ON coordinator_notes 
USING gin(to_tsvector('portuguese', title || ' ' || content));

-- Tabela para categorias customizadas
CREATE TABLE IF NOT EXISTS coordinator_note_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coordinator_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50), -- Cor em hex
  icon VARCHAR(50), -- Nome do ícone
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(coordinator_id, name)
);

-- Tabela para templates de anotações
CREATE TABLE IF NOT EXISTS coordinator_note_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coordinator_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  category VARCHAR(100),
  default_tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE, -- Compartilhável com outros coordenadores
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para lembretes e notificações
CREATE TABLE IF NOT EXISTS coordinator_note_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES coordinator_notes(id) ON DELETE CASCADE,
  coordinator_id VARCHAR(255) NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type VARCHAR(50) NOT NULL, -- 'EMAIL', 'PUSH', 'SMS', 'IN_APP'
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_coordinator_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_coordinator_notes_timestamp ON coordinator_notes;
CREATE TRIGGER trigger_coordinator_notes_timestamp
BEFORE UPDATE ON coordinator_notes
FOR EACH ROW
EXECUTE FUNCTION update_coordinator_notes_timestamp();

-- Função para busca avançada
CREATE OR REPLACE FUNCTION search_coordinator_notes(
  p_coordinator_id VARCHAR(255),
  p_search_term TEXT,
  p_category VARCHAR(100) DEFAULT NULL,
  p_priority VARCHAR(20) DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(500),
  content TEXT,
  category VARCHAR(100),
  priority VARCHAR(20),
  tags TEXT[],
  note_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cn.id,
    cn.title,
    cn.content,
    cn.category,
    cn.priority,
    cn.tags,
    cn.note_date,
    cn.created_at,
    ts_rank(
      to_tsvector('portuguese', cn.title || ' ' || cn.content),
      plainto_tsquery('portuguese', p_search_term)
    ) as relevance
  FROM coordinator_notes cn
  WHERE 
    cn.coordinator_id = p_coordinator_id
    AND cn.status = 'ACTIVE'
    AND (
      p_search_term IS NULL 
      OR to_tsvector('portuguese', cn.title || ' ' || cn.content) @@ plainto_tsquery('portuguese', p_search_term)
    )
    AND (p_category IS NULL OR cn.category = p_category)
    AND (p_priority IS NULL OR cn.priority = p_priority)
    AND (p_tags IS NULL OR cn.tags && p_tags)
    AND (p_date_from IS NULL OR cn.note_date >= p_date_from)
    AND (p_date_to IS NULL OR cn.note_date <= p_date_to)
  ORDER BY 
    cn.is_pinned DESC,
    relevance DESC,
    cn.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas
CREATE OR REPLACE FUNCTION get_coordinator_notes_stats(p_coordinator_id VARCHAR(255))
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_notes', COUNT(*),
    'active_notes', COUNT(*) FILTER (WHERE status = 'ACTIVE'),
    'archived_notes', COUNT(*) FILTER (WHERE status = 'ARCHIVED'),
    'pinned_notes', COUNT(*) FILTER (WHERE is_pinned = TRUE),
    'favorite_notes', COUNT(*) FILTER (WHERE is_favorite = TRUE),
    'by_category', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM coordinator_notes
        WHERE coordinator_id = p_coordinator_id AND status = 'ACTIVE'
        GROUP BY category
      ) cat_counts
    ),
    'by_priority', (
      SELECT json_object_agg(priority, cnt)
      FROM (
        SELECT priority, COUNT(*) as cnt
        FROM coordinator_notes
        WHERE coordinator_id = p_coordinator_id AND status = 'ACTIVE'
        GROUP BY priority
      ) pri_counts
    ),
    'recent_activity', (
      SELECT json_agg(json_build_object(
        'date', DATE(created_at),
        'count', COUNT(*)
      ))
      FROM (
        SELECT DATE(created_at) as created_at
        FROM coordinator_notes
        WHERE coordinator_id = p_coordinator_id
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      ) recent
    )
  ) INTO stats
  FROM coordinator_notes
  WHERE coordinator_id = p_coordinator_id;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Inserir categorias padrão
INSERT INTO coordinator_note_categories (coordinator_id, name, description, color, icon, display_order)
VALUES
  ('DEFAULT', 'Administração', 'Curso de Administração', '#3B82F6', 'Briefcase', 1),
  ('DEFAULT', 'Contabilidade', 'Curso de Contabilidade', '#10B981', 'Calculator', 2),
  ('DEFAULT', 'Sistemas de Informação', 'Curso de Sistemas de Informação', '#8B5CF6', 'Code', 3),
  ('DEFAULT', 'Geral', 'Assuntos gerais', '#6B7280', 'FileText', 4),
  ('DEFAULT', 'Reunião', 'Reuniões e encontros', '#F59E0B', 'Users', 5),
  ('DEFAULT', 'Estudantes', 'Relacionado a estudantes', '#EC4899', 'GraduationCap', 6),
  ('DEFAULT', 'Professores', 'Relacionado a professores', '#14B8A6', 'UserCheck', 7),
  ('DEFAULT', 'Atendimentos', 'Atendimentos NAF', '#EF4444', 'HeadphonesIcon', 8)
ON CONFLICT (coordinator_id, name) DO NOTHING;

-- Inserir templates padrão
INSERT INTO coordinator_note_templates (coordinator_id, name, description, template_content, category, default_tags)
VALUES
  (
    'DEFAULT',
    'Reunião de Departamento',
    'Template para atas de reunião',
    E'# Reunião de Departamento\n\n**Data:** [DATA]\n**Participantes:** [PARTICIPANTES]\n\n## Pauta\n1. \n\n## Discussões\n\n## Decisões Tomadas\n\n## Ações Futuras\n- [ ] \n\n## Observações\n',
    'REUNIAO',
    ARRAY['reunião', 'departamento', 'ata']
  ),
  (
    'DEFAULT',
    'Acompanhamento de Estudante',
    'Template para anotações sobre estudantes',
    E'# Acompanhamento: [NOME DO ESTUDANTE]\n\n**Data:** [DATA]\n**Curso:** [CURSO]\n**Semestre:** [SEMESTRE]\n\n## Situação Atual\n\n## Desempenho Acadêmico\n\n## Questões Observadas\n\n## Recomendações\n\n## Próximos Passos\n- [ ] \n',
    'ESTUDANTES',
    ARRAY['estudante', 'acompanhamento', 'desempenho']
  ),
  (
    'DEFAULT',
    'Atendimento NAF',
    'Template para registrar atendimentos',
    E'# Atendimento NAF\n\n**Data:** [DATA]\n**Estudante Responsável:** [ESTUDANTE]\n**Cliente:** [CLIENTE]\n**Serviço:** [SERVIÇO]\n\n## Descrição do Atendimento\n\n## Documentos Necessários\n\n## Orientações Fornecidas\n\n## Status\n\n## Observações\n',
    'ATENDIMENTOS',
    ARRAY['atendimento', 'naf', 'fiscal']
  )
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE coordinator_notes IS 'Armazena todas as anotações do coordenador com suporte a categorização, tags e busca avançada';
COMMENT ON TABLE coordinator_note_categories IS 'Categorias customizadas para organização das anotações';
COMMENT ON TABLE coordinator_note_templates IS 'Templates reutilizáveis para agilizar criação de anotações';
COMMENT ON TABLE coordinator_note_reminders IS 'Sistema de lembretes para anotações importantes';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Sistema de Anotações do Coordenador';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tabelas criadas:';
  RAISE NOTICE '   • coordinator_notes';
  RAISE NOTICE '   • coordinator_note_categories';
  RAISE NOTICE '   • coordinator_note_templates';
  RAISE NOTICE '   • coordinator_note_reminders';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funções criadas:';
  RAISE NOTICE '   • search_coordinator_notes()';
  RAISE NOTICE '   • get_coordinator_notes_stats()';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Recursos:';
  RAISE NOTICE '   • Categorização avançada';
  RAISE NOTICE '   • Sistema de tags';
  RAISE NOTICE '   • Busca full-text em português';
  RAISE NOTICE '   • Templates reutilizáveis';
  RAISE NOTICE '   • Lembretes e notificações';
  RAISE NOTICE '   • Versionamento de anotações';
  RAISE NOTICE '   • Estatísticas detalhadas';
  RAISE NOTICE '========================================';
END $$;
