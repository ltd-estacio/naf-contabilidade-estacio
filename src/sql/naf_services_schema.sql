-- Schema para Serviços NAF
-- Sistema completo de gerenciamento de serviços

-- Enum para categorias de serviços
CREATE TYPE service_category AS ENUM (
    'servicos_disponíveis',
    'servicos_tributarios',
    'servicos_empresariais',
    'documentacao'
);

-- Enum para status dos serviços
CREATE TYPE service_status AS ENUM (
    'ativo',
    'inativo',
    'em_desenvolvimento'
);

-- Enum para nível de dificuldade
CREATE TYPE service_difficulty AS ENUM (
    'basico',
    'intermediario',
    'avancado'
);

-- Tabela principal de serviços NAF
CREATE TABLE IF NOT EXISTS naf_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,

    -- Categorização
    category service_category NOT NULL,
    subcategory VARCHAR(100),
    difficulty service_difficulty DEFAULT 'basico',

    -- Status e disponibilidade
    status service_status DEFAULT 'ativo',
    is_featured BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    priority_order INTEGER DEFAULT 0,

    -- Detalhes técnicos
    estimated_duration_minutes INTEGER,
    required_documents TEXT[],
    prerequisites TEXT[],

    -- Informações visuais
    icon_name VARCHAR(50),
    color_scheme VARCHAR(20) DEFAULT 'blue',
    banner_image_url TEXT,

    -- Informações de contato/processo
    contact_info JSONB,
    process_steps JSONB,

    -- SEO e metadados
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],

    -- Estatísticas
    views_count INTEGER DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    satisfaction_rating DECIMAL(3,2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_naf_services_category ON naf_services(category);
CREATE INDEX IF NOT EXISTS idx_naf_services_status ON naf_services(status);
CREATE INDEX IF NOT EXISTS idx_naf_services_featured ON naf_services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_naf_services_popular ON naf_services(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_naf_services_slug ON naf_services(slug);
CREATE INDEX IF NOT EXISTS idx_naf_services_priority ON naf_services(priority_order DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_naf_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_naf_services_updated_at ON naf_services;
CREATE TRIGGER update_naf_services_updated_at
    BEFORE UPDATE ON naf_services
    FOR EACH ROW
    EXECUTE FUNCTION update_naf_services_updated_at();

-- Inserir dados iniciais dos serviços NAF
INSERT INTO naf_services (
    name, slug, description, detailed_description, category, subcategory,
    difficulty, is_featured, is_popular, priority_order, estimated_duration_minutes,
    required_documents, prerequisites, icon_name, color_scheme, process_steps
) VALUES
-- Serviços Tributários
(
    'Declaração de Imposto de Renda',
    'declaracao-imposto-renda',
    'Orientação completa para declaração do Imposto de Renda Pessoa Física',
    'Auxílio na elaboração da Declaração de Imposto de Renda Pessoa Física, incluindo orientações sobre deduções, rendimentos e documentação necessária.',
    'servicos_tributarios',
    'Imposto de Renda',
    'intermediario',
    true,
    true,
    1,
    120,
    ARRAY['CPF', 'Comprovante de rendimentos', 'Recibos de despesas dedutíveis', 'Declaração do ano anterior'],
    ARRAY['Organizar documentos fiscais do ano', 'CPF regularizado'],
    'Calculator',
    'blue',
    '{"steps": ["Organização de documentos", "Preenchimento da declaração", "Conferência dos dados", "Transmissão", "Acompanhamento"]}'::jsonb
),
(
    'Cadastro e Regularização de CPF',
    'cadastro-regularizacao-cpf',
    'Inscrição, alteração e regularização de CPF para pessoas físicas',
    'Serviço completo de inscrição de CPF para brasileiros e estrangeiros, alteração de dados e regularização de situação cadastral.',
    'servicos_tributarios',
    'Cadastros',
    'basico',
    true,
    true,
    2,
    45,
    ARRAY['RG ou documento de identidade', 'Comprovante de residência', 'Título de eleitor (se maior de 18 anos)'],
    ARRAY['Documento de identidade válido'],
    'FileText',
    'green',
    '{"steps": ["Verificação de documentos", "Preenchimento do formulário", "Validação dos dados", "Emissão do CPF"]}'::jsonb
),
(
    'Orientação MEI',
    'orientacao-mei',
    'Abertura, alteração e gestão de Microempreendedor Individual',
    'Consultoria completa sobre MEI: como abrir, alterar dados, emitir notas fiscais, cumprir obrigações e encerrar se necessário.',
    'servicos_empresariais',
    'Microempreendedor',
    'intermediario',
    true,
    true,
    3,
    90,
    ARRAY['CPF', 'RG', 'Comprovante de residência', 'Número do título de eleitor'],
    ARRAY['CPF regularizado', 'Idade mínima de 18 anos'],
    'Users',
    'purple',
    '{"steps": ["Verificação de requisitos", "Cadastro no portal", "Definição de atividade", "Emissão do CNPJ", "Orientações sobre obrigações"]}'::jsonb
),

-- Serviços Empresariais
(
    'Abertura de Empresa',
    'abertura-empresa',
    'Orientação para abertura de micro e pequenas empresas',
    'Consultoria sobre os procedimentos para abertura de empresa, escolha do tipo societário, documentação necessária e primeiros passos.',
    'servicos_empresariais',
    'Constituição',
    'avancado',
    true,
    false,
    4,
    180,
    ARRAY['Documentos pessoais dos sócios', 'Comprovante de endereço comercial', 'Contrato social', 'Consulta de viabilidade'],
    ARRAY['Definição do objeto social', 'Capital social mínimo'],
    'Building2',
    'orange',
    '{"steps": ["Consulta de viabilidade", "Elaboração do contrato", "Registro na Junta Comercial", "Inscrições fiscais", "Licenças e alvarás"]}'::jsonb
),
(
    'E-Social Doméstico',
    'esocial-domestico',
    'Cadastro e gestão de empregados domésticos no E-Social',
    'Auxílio no cadastramento de empregados domésticos, geração de guias e cumprimento das obrigações do E-Social Doméstico.',
    'servicos_tributarios',
    'Trabalhistas',
    'intermediario',
    false,
    true,
    5,
    75,
    ARRAY['CPF do empregador', 'Dados do empregado', 'Carteira de trabalho', 'Comprovante de residência'],
    ARRAY['Cadastro no E-Social Doméstico'],
    'UserCheck',
    'indigo',
    '{"steps": ["Cadastro inicial", "Inclusão do empregado", "Configuração de eventos", "Geração de guias", "Acompanhamento mensal"]}'::jsonb
),

-- Documentação
(
    'Certidões Negativas',
    'certidoes-negativas',
    'Emissão de certidões de regularidade fiscal e trabalhista',
    'Orientação para obtenção de certidões negativas federais, estaduais e municipais para pessoas físicas e jurídicas.',
    'documentacao',
    'Certidões',
    'basico',
    false,
    true,
    6,
    30,
    ARRAY['CPF ou CNPJ', 'Dados pessoais/empresariais completos'],
    ARRAY['Situação fiscal regularizada'],
    'Shield',
    'red',
    '{"steps": ["Identificação das certidões necessárias", "Acesso aos portais", "Emissão das certidões", "Verificação de validade"]}'::jsonb
),
(
    'Parcelamento de Débitos',
    'parcelamento-debitos',
    'Orientação sobre parcelamento de débitos tributários',
    'Consultoria sobre as modalidades de parcelamento de débitos com a Receita Federal, INSS e outros órgãos.',
    'servicos_tributarios',
    'Regularização',
    'intermediario',
    false,
    false,
    7,
    60,
    ARRAY['CPF ou CNPJ', 'Extrato de débitos', 'Comprovante de renda'],
    ARRAY['Débitos identificados'],
    'TrendingUp',
    'yellow',
    '{"steps": ["Levantamento de débitos", "Análise de modalidades", "Simulação de parcelamento", "Formalização do pedido", "Acompanhamento"]}'::jsonb
),

-- Serviços Disponíveis Gerais
(
    'Orientação Previdenciária',
    'orientacao-previdenciaria',
    'Consultoria sobre direitos e benefícios previdenciários',
    'Esclarecimentos sobre aposentadoria, auxílios, pensões e outros benefícios do INSS.',
    'servicos_disponíveis',
    'Previdência',
    'intermediario',
    false,
    true,
    8,
    90,
    ARRAY['CPF', 'CNIS (Cadastro Nacional de Informações Sociais)', 'Carteira de trabalho'],
    ARRAY['Cadastro no Meu INSS'],
    'Clock',
    'teal',
    '{"steps": ["Análise do histórico contributivo", "Identificação de direitos", "Orientação sobre procedimentos", "Acompanhamento de pedidos"]}'::jsonb
),
(
    'Planejamento Tributário Pessoal',
    'planejamento-tributario-pessoal',
    'Orientação para otimização da carga tributária pessoa física',
    'Consultoria sobre estratégias legais para redução da carga tributária e aproveitamento de benefícios fiscais.',
    'servicos_tributarios',
    'Planejamento',
    'avancado',
    true,
    false,
    9,
    150,
    ARRAY['Declarações de IR anteriores', 'Comprovantes de rendimentos', 'Comprovantes de gastos dedutíveis'],
    ARRAY['Histórico fiscal organizado'],
    'BarChart3',
    'emerald',
    '{"steps": ["Diagnóstico fiscal", "Identificação de oportunidades", "Planejamento de estratégias", "Implementação", "Monitoramento"]}'::jsonb
),
(
    'Orientação Fiscal para ONGs',
    'orientacao-fiscal-ongs',
    'Consultoria fiscal especializada para organizações da sociedade civil',
    'Auxílio em questões fiscais específicas para ONGs, associações e fundações sem fins lucrativos.',
    'servicos_empresariais',
    'Terceiro Setor',
    'avancado',
    false,
    false,
    10,
    120,
    ARRAY['Estatuto social', 'CNPJ', 'Declarações anteriores', 'Comprovantes de atividades'],
    ARRAY['Registro como entidade sem fins lucrativos'],
    'Heart',
    'pink',
    '{"steps": ["Análise da situação fiscal", "Orientação sobre obrigações", "Auxílio em declarações", "Planejamento fiscal", "Acompanhamento"]}'::jsonb
);

-- Atualizar estatísticas dos serviços (simulando uso)
UPDATE naf_services SET
    views_count = FLOOR(RANDOM() * 1000) + 100,
    requests_count = FLOOR(RANDOM() * 200) + 10,
    satisfaction_rating = ROUND((RANDOM() * 2 + 3)::numeric, 2)
WHERE status = 'ativo';

-- Comentários para documentação
COMMENT ON TABLE naf_services IS 'Tabela principal de serviços oferecidos pelo NAF';
COMMENT ON COLUMN naf_services.slug IS 'URL amigável única para o serviço';
COMMENT ON COLUMN naf_services.is_featured IS 'Serviço destacado na página inicial';
COMMENT ON COLUMN naf_services.is_popular IS 'Serviço popular (mais procurado)';
COMMENT ON COLUMN naf_services.priority_order IS 'Ordem de exibição (menor número = maior prioridade)';
COMMENT ON COLUMN naf_services.process_steps IS 'JSON com as etapas do processo do serviço';
COMMENT ON COLUMN naf_services.contact_info IS 'JSON com informações de contato específicas do serviço';