-- Schema final corrigido para agendamentos de orientações fiscais
-- Sistema NAF Contábil - Fiscal Guidance Appointments

-- Tabela para armazenar agendamentos de orientações fiscais
CREATE TABLE IF NOT EXISTS fiscal_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informações do serviço
    service_type VARCHAR(100) NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,

    -- Dados pessoais do cliente
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_cpf VARCHAR(14),
    client_birth_date DATE,

    -- Endereço
    address_street VARCHAR(255),
    address_number VARCHAR(10),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(2) NOT NULL,
    address_zipcode VARCHAR(9),

    -- Informações específicas do serviço
    service_details JSONB,
    urgency_level VARCHAR(20) DEFAULT 'NORMAL',

    -- Agendamento
    preferred_date DATE,
    preferred_time TIME,
    preferred_period VARCHAR(20),

    -- Status e controle
    status VARCHAR(20) DEFAULT 'PENDENTE',
    protocol VARCHAR(20) UNIQUE,

    -- Atribuição
    assigned_student_id UUID,
    assigned_coordinator_id UUID,

    -- Observações
    client_notes TEXT,
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Validações
    CONSTRAINT valid_status CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    CONSTRAINT valid_urgency CHECK (urgency_level IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')),
    CONSTRAINT valid_period CHECK (preferred_period IN ('MANHA', 'TARDE', 'NOITE'))
);

-- Função para gerar protocolo único (versão corrigida)
CREATE OR REPLACE FUNCTION generate_fiscal_appointment_protocol()
RETURNS TEXT AS $$
DECLARE
    v_protocol TEXT;
    v_exists BOOLEAN;
    v_counter INTEGER := 0;
BEGIN
    LOOP
        -- Gerar protocolo no formato: FAP-YYYYMMDD-XXXX
        v_protocol := 'FAP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0');

        -- Verificar se já existe
        SELECT EXISTS(
            SELECT 1 FROM fiscal_appointments fa WHERE fa.protocol = v_protocol
        ) INTO v_exists;

        -- Se não existe ou tentou muitas vezes, sair do loop
        IF NOT v_exists OR v_counter > 100 THEN
            EXIT;
        END IF;

        v_counter := v_counter + 1;
    END LOOP;

    RETURN v_protocol;
END;
$$ LANGUAGE plpgsql;

-- Trigger function para definir protocolo automaticamente
CREATE OR REPLACE FUNCTION set_fiscal_appointment_protocol()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocol IS NULL THEN
        NEW.protocol := generate_fiscal_appointment_protocol();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar protocolo na inserção
DROP TRIGGER IF EXISTS trig_set_fiscal_appointment_protocol ON fiscal_appointments;
CREATE TRIGGER trig_set_fiscal_appointment_protocol
    BEFORE INSERT ON fiscal_appointments
    FOR EACH ROW
    EXECUTE FUNCTION set_fiscal_appointment_protocol();

-- Trigger function para atualizar timestamp
CREATE OR REPLACE FUNCTION update_fiscal_appointment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trig_update_fiscal_appointment_timestamp ON fiscal_appointments;
CREATE TRIGGER trig_update_fiscal_appointment_timestamp
    BEFORE UPDATE ON fiscal_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_fiscal_appointment_timestamp();

-- Tabela para templates de serviços
CREATE TABLE IF NOT EXISTS fiscal_service_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(100) NOT NULL UNIQUE,
    service_title VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    required_fields JSONB,
    optional_fields JSONB,
    required_documents JSONB,
    estimated_duration_minutes INTEGER DEFAULT 60,
    complexity_level VARCHAR(20) DEFAULT 'MEDIO',
    description TEXT,
    steps JSONB,
    important_notes JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir templates dos serviços (com ON CONFLICT para evitar duplicatas)
INSERT INTO fiscal_service_templates (service_type, service_title, service_category, required_fields, optional_fields, required_documents, description, steps, important_notes) VALUES

('CPF', 'Cadastro de CPF - Guia Completo', 'Cadastros',
'["nome_completo", "data_nascimento", "nome_mae", "sexo"]'::jsonb,
'["nome_pai", "titulo_eleitor", "pis_pasep"]'::jsonb,
'["certidao_nascimento_casamento", "documento_foto", "comprovante_residencia"]'::jsonb,
'Procedimentos para inscrição, alteração e regularização de CPF',
'["Verificar se possui documentos necessários", "Acessar o portal da Receita Federal", "Preencher formulário online ou presencial", "Aguardar processamento e emissão"]'::jsonb,
'["Menores de idade precisam estar acompanhados dos responsáveis", "Documentos devem estar originais e legíveis"]'::jsonb),

('MEI', 'MEI - Formalização e Gestão', 'Microempreendedor',
'["atividade_principal", "endereco_comercial", "possui_funcionario"]'::jsonb,
'["telefone_comercial", "atividades_secundarias"]'::jsonb,
'["cpf", "rg", "comprovante_residencia", "titulo_eleitor"]'::jsonb,
'Como abrir, gerir e cumprir obrigações do MEI',
'["Verificar atividades permitidas no MEI", "Acessar Portal do Empreendedor", "Preencher dados pessoais e da atividade", "Obter CNPJ e licenças municipais", "Emitir DAS mensalmente"]'::jsonb,
'["Faturamento anual não pode ultrapassar R$ 81.000", "Algumas atividades não são permitidas no MEI"]'::jsonb),

('IR', 'Declaração de Imposto de Renda PF', 'Imposto de Renda',
'["ano_exercicio", "possui_dependentes", "valor_rendimentos"]'::jsonb,
'["possui_bens", "despesas_medicas", "despesas_educacao"]'::jsonb,
'["informes_rendimentos", "comprovantes_despesas_medicas", "comprovantes_despesas_educacionais", "documentos_dependentes"]'::jsonb,
'Orientações para declaração anual do IR',
'["Verificar obrigatoriedade de declarar", "Reunir documentos de rendimentos", "Baixar programa IRPF da Receita", "Preencher ficha por ficha", "Transmitir declaração"]'::jsonb,
'["Declaração deve ser enviada até 31 de maio", "Multa por atraso é de R$ 165,74 mínimo"]'::jsonb),

('ITR', 'ITR - Imposto Territorial Rural', 'Rural',
'["area_total_hectares", "area_aproveitada_hectares", "municipio_imovel"]'::jsonb,
'["possui_benfeitoria", "valor_terra_nua", "possui_cnir"]'::jsonb,
'["escritura_imovel", "cnir", "comprovantes_benfeitorias", "documento_area"]'::jsonb,
'Declaração do ITR para propriedades rurais',
'["Verificar obrigatoriedade de declarar", "Reunir documentos da propriedade", "Calcular área total e aproveitável", "Preencher DITR online", "Transmitir e pagar se devido"]'::jsonb,
'["ITR é devido por quem possui imóvel rural em 1º de janeiro", "Grau de utilização influencia no valor do imposto"]'::jsonb),

('CNPJ', 'Abertura de CNPJ', 'Empresarial',
'["tipo_sociedade", "atividade_principal", "capital_social", "endereco_comercial"]'::jsonb,
'["socios_participacao", "atividades_secundarias", "regime_tributario"]'::jsonb,
'["contrato_social", "cpf_rg_socios", "comprovante_endereco", "consulta_viabilidade"]'::jsonb,
'Procedimentos para constituição de pessoa jurídica',
'["Consultar viabilidade do nome", "Elaborar contrato social", "Registrar na Junta Comercial", "Inscrever na Receita Federal", "Obter licenças municipais"]'::jsonb,
'["Nome empresarial deve ser único", "Capital social mínimo depende do tipo de sociedade"]'::jsonb),

('ESOCIAL', 'e-Social Doméstico', 'Trabalhista',
'["cpf_empregado", "data_admissao", "salario", "funcao"]'::jsonb,
'["possui_outros_vinculos", "jornada_trabalho", "vale_transporte"]'::jsonb,
'["cpf_empregador", "dados_empregado", "contrato_trabalho", "exames_medicos"]'::jsonb,
'Cadastro e gestão de empregados domésticos',
'["Cadastrar empregador no e-Social", "Cadastrar empregado doméstico", "Enviar evento de admissão", "Gerar guia DAE mensalmente", "Enviar folha de pagamento"]'::jsonb,
'["Empregado doméstico com mais de 2 dias por semana deve ser registrado", "DAE deve ser paga até dia 7 do mês seguinte"]'::jsonb)

ON CONFLICT (service_type) DO UPDATE SET
    service_title = EXCLUDED.service_title,
    service_category = EXCLUDED.service_category,
    required_fields = EXCLUDED.required_fields,
    optional_fields = EXCLUDED.optional_fields,
    required_documents = EXCLUDED.required_documents,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    important_notes = EXCLUDED.important_notes,
    updated_at = CURRENT_TIMESTAMP;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_status ON fiscal_appointments(status);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_service_type ON fiscal_appointments(service_type);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_client_email ON fiscal_appointments(client_email);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_protocol ON fiscal_appointments(protocol);
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_created_at ON fiscal_appointments(created_at);

-- View para relatórios do dashboard
CREATE OR REPLACE VIEW fiscal_appointments_summary AS
SELECT
    fa.service_type,
    fa.service_title,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN fa.status = 'PENDENTE' THEN 1 END) as pending_count,
    COUNT(CASE WHEN fa.status = 'CONFIRMADO' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN fa.status = 'CONCLUIDO' THEN 1 END) as completed_count,
    COUNT(CASE WHEN fa.status = 'CANCELADO' THEN 1 END) as cancelled_count,
    AVG(CASE WHEN fa.urgency_level = 'BAIXA' THEN 1
             WHEN fa.urgency_level = 'NORMAL' THEN 2
             WHEN fa.urgency_level = 'ALTA' THEN 3
             WHEN fa.urgency_level = 'URGENTE' THEN 4 END) as avg_urgency_score,
    COUNT(CASE WHEN fa.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_appointments
FROM fiscal_appointments fa
GROUP BY fa.service_type, fa.service_title
ORDER BY total_appointments DESC;

-- Inserir dados de exemplo (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM fiscal_appointments LIMIT 1) THEN
        INSERT INTO fiscal_appointments (
            service_type, service_title, service_category,
            client_name, client_email, client_phone, client_cpf,
            address_city, address_state,
            service_details, urgency_level,
            preferred_date, preferred_time, preferred_period,
            status, client_notes
        ) VALUES
        (
            'CPF', 'Cadastro de CPF - Guia Completo', 'Cadastros',
            'Maria Silva Santos', 'maria.silva@email.com', '(11) 99999-0001', '123.456.789-00',
            'São Paulo', 'SP',
            '{"nome_completo": "Maria Silva Santos", "data_nascimento": "1985-03-15", "nome_mae": "Ana Silva", "sexo": "F"}'::jsonb,
            'NORMAL',
            CURRENT_DATE + INTERVAL '5 days', '14:00:00', 'TARDE',
            'PENDENTE', 'Preciso fazer o primeiro CPF para minha filha recém-nascida'
        ),
        (
            'MEI', 'MEI - Formalização e Gestão', 'Microempreendedor',
            'João Carlos Oliveira', 'joao.oliveira@email.com', '(11) 99999-0002', '987.654.321-00',
            'São Paulo', 'SP',
            '{"atividade_principal": "Venda de cosméticos", "endereco_comercial": "Residencial", "possui_funcionario": false}'::jsonb,
            'ALTA',
            CURRENT_DATE + INTERVAL '3 days', '09:00:00', 'MANHA',
            'CONFIRMADO', 'Quero abrir MEI para vender produtos de beleza'
        ),
        (
            'IR', 'Declaração de Imposto de Renda PF', 'Imposto de Renda',
            'Ana Paula Costa', 'ana.costa@email.com', '(11) 99999-0003', '456.789.123-00',
            'São Paulo', 'SP',
            '{"ano_exercicio": "2024", "possui_dependentes": true, "valor_rendimentos": 35000}'::jsonb,
            'URGENTE',
            CURRENT_DATE + INTERVAL '1 day', '16:00:00', 'TARDE',
            'PENDENTE', 'Preciso declarar IR urgente, tenho dependentes e imóvel'
        );
    END IF;
END $$;