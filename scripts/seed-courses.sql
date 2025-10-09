-- Inserção dos dados iniciais dos cursos NAF

-- 1. CURSO: Power BI
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440001',
'Aprenda sobre Power BI',
'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais. Aprenda desde os conceitos básicos até técnicas avançadas de visualização de dados.',
'internal',
'power_bi',
'iniciante',
480, -- 8 horas
true,
'Prof. Ana Silva - Especialista em BI',
ARRAY['Análise de Dados', 'Dashboards Interativos', 'DAX', 'Power Query', 'Visualização de Dados', 'Business Intelligence'],
ARRAY['Conhecimentos básicos de Excel', 'Noções de análise de dados'],
'active');

-- 2. CURSO: Cadastro de CPF
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440002',
'Cadastro de CPF',
'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF. Aprenda toda a legislação e processos práticos para orientar contribuintes.',
'internal',
'cpf',
'iniciante',
360, -- 6 horas
true,
'Prof. Carlos Oliveira - Especialista Tributário',
ARRAY['Legislação do CPF', 'Processos de Cadastro', 'Regularização', 'Atendimento ao Contribuinte', 'Documentação Necessária', 'Sistemas da Receita Federal'],
ARRAY['Conhecimentos básicos de tributação'],
'active');

-- 3. CURSO: Imposto de Renda
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, instructor_name, skills_learned, prerequisites, status) VALUES
('550e8400-e29b-41d4-a716-446655440003',
'Imposto de Renda',
'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física. Aprenda todos os aspectos da declaração, desde o preenchimento até estratégias de planejamento tributário.',
'internal',
'imposto_renda',
'intermediario',
540, -- 9 horas
true,
'Profa. Maria Santos - Contadora e Consultora Tributária',
ARRAY['DIRPF', 'Planejamento Tributário', 'Dedução de Despesas', 'Bens e Direitos', 'Rendimentos', 'Legislação Tributária', 'Programa IRPF'],
ARRAY['Conhecimentos básicos de contabilidade', 'Noções de tributação'],
'active');

-- TEMAS DO CURSO POWER BI
-- Tema 1: Fundamentos do Power BI
INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
'Fundamentos do Power BI',
'Introdução aos conceitos básicos do Microsoft Power BI e sua importância no mundo dos negócios.',
1, 120,
ARRAY['Entender o que é Business Intelligence', 'Conhecer a interface do Power BI Desktop', 'Compreender os diferentes componentes do Power BI', 'Configurar o ambiente de trabalho']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
'Conectando e Preparando Dados',
'Aprenda a conectar-se a diferentes fontes de dados e preparar os dados para análise.',
2, 120,
ARRAY['Conectar a diversas fontes de dados', 'Usar o Power Query Editor', 'Limpar e transformar dados', 'Criar relacionamentos entre tabelas']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
'Visualizações e Dashboards',
'Criação de visualizações eficazes e dashboards interativos.',
3, 120,
ARRAY['Criar gráficos e visualizações', 'Usar filtros e segmentadores', 'Projetar dashboards eficazes', 'Aplicar princípios de design']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
'DAX e Análises Avançadas',
'Introdução à linguagem DAX e técnicas avançadas de análise.',
4, 120,
ARRAY['Compreender a linguagem DAX', 'Criar medidas calculadas', 'Usar funções de tempo inteligente', 'Implementar análises avançadas']);

-- TEMAS DO CURSO CPF
-- Tema 1: Legislação e Fundamentos
INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002',
'Legislação e Fundamentos do CPF',
'Base legal e conceitos fundamentais sobre o Cadastro de Pessoas Físicas.',
1, 90,
ARRAY['Conhecer a legislação do CPF', 'Entender a importância do CPF', 'Identificar obrigatoriedade de inscrição', 'Compreender penalidades']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002',
'Processos de Inscrição',
'Procedimentos para inscrição no CPF para diferentes situações.',
2, 90,
ARRAY['Realizar inscrição presencial', 'Usar sistemas online', 'Atender menores de idade', 'Lidar com situações especiais']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002',
'Alterações e Atualizações',
'Como realizar alterações cadastrais e atualizações de dados.',
3, 90,
ARRAY['Alterar dados cadastrais', 'Atualizar endereço', 'Corrigir informações', 'Usar o e-CAC']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002',
'Regularização e Situações Especiais',
'Procedimentos para regularização e resolução de problemas no CPF.',
4, 90,
ARRAY['Regularizar CPF suspenso', 'Resolver duplicidade', 'Lidar com óbito', 'Atender casos especiais']);

-- TEMAS DO CURSO IMPOSTO DE RENDA
-- Tema 1: Introdução ao Imposto de Renda
INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003',
'Introdução ao Imposto de Renda',
'Conceitos fundamentais sobre o Imposto de Renda Pessoa Física.',
1, 135,
ARRAY['Entender o sistema tributário brasileiro', 'Conhecer a obrigatoriedade de declarar', 'Compreender prazos e penalidades', 'Identificar tipos de declaração']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003',
'Rendimentos e Deduções',
'Como declarar diferentes tipos de rendimentos e aplicar deduções.',
2, 135,
ARRAY['Declarar rendimentos tributáveis', 'Aplicar deduções legais', 'Calcular base de cálculo', 'Otimizar a declaração']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003',
'Bens, Direitos e Dependentes',
'Declaração de patrimônio e informações sobre dependentes.',
3, 135,
ARRAY['Declarar bens e direitos', 'Incluir dependentes', 'Calcular ganho de capital', 'Informar dívidas e ônus']);

INSERT INTO course_themes (id, course_id, title, description, theme_order, estimated_duration, learning_objectives) VALUES
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003',
'Programa IRPF e Transmissão',
'Uso do programa oficial e procedimentos de transmissão.',
4, 135,
ARRAY['Usar o programa IRPF', 'Importar dados', 'Verificar inconsistências', 'Transmitir declaração']);

-- CURSOS EXTERNOS
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440004',
'Contabilidade com foco na gestão da informação contábil',
'Curso oferecido pela Escola Virtual do Governo Federal sobre gestão da informação contábil.',
'external',
'external_course',
'intermediario',
300,
false,
'https://www.escolavirtual.gov.br/curso/548',
'Escola Virtual Gov.br',
ARRAY['Gestão da Informação Contábil', 'Sistemas Contábeis', 'Relatórios Gerenciais'],
'active');

INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440005',
'Contabilidade pública e conformidade na gestão',
'Curso sobre contabilidade pública e procedimentos de conformidade.',
'external',
'external_course',
'avancado',
360,
false,
'https://www.escolavirtual.gov.br/curso/480',
'Escola Virtual Gov.br',
ARRAY['Contabilidade Pública', 'Conformidade', 'Gestão Pública'],
'active');

INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440006',
'Contabilidade com Foco na Gestão do Patrimônio Público',
'Gestão e controle do patrimônio público através da contabilidade.',
'external',
'external_course',
'intermediario',
240,
false,
'https://www.escolavirtual.gov.br/curso/342',
'Escola Virtual Gov.br',
ARRAY['Patrimônio Público', 'Controle Patrimonial', 'Gestão Pública'],
'active');

INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440007',
'Conceitos Básicos de Finanças e Contabilidade para Empresas Estatais',
'Fundamentos financeiros e contábeis específicos para empresas estatais.',
'external',
'external_course',
'iniciante',
180,
false,
'https://www.escolavirtual.gov.br/curso/1345',
'Escola Virtual Gov.br',
ARRAY['Finanças Públicas', 'Contabilidade Estatal', 'Gestão Financeira'],
'active');

INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440008',
'Contabilidade Empresarial',
'Curso abrangente sobre contabilidade empresarial oferecido pela EV.org.br.',
'external',
'external_course',
'intermediario',
420,
false,
'https://www.ev.org.br/cursos/contabilidade-empresarial',
'EV.org.br',
ARRAY['Contabilidade Empresarial', 'Demonstrações Financeiras', 'Análise Contábil'],
'active');

-- MANUAIS
INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440009',
'Manual de Atendimentos',
'Manual oficial da Receita Federal para procedimentos de atendimento no NAF.',
'manual',
'manual',
'iniciante',
60,
true,
'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-NAF/manual',
'Receita Federal do Brasil',
ARRAY['Procedimentos de Atendimento', 'Qualidade no Atendimento', 'Protocolos NAF'],
'active');

INSERT INTO courses (id, title, description, category, type, difficulty_level, estimated_duration, is_mandatory, external_url, instructor_name, skills_learned, status) VALUES
('550e8400-e29b-41d4-a716-446655440010',
'Manual do Referencial NAF',
'Manual de referência para funcionamento e gestão do Núcleo de Apoio Contábil e Fiscal.',
'manual',
'manual',
'intermediario',
90,
true,
'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/referencial-naf',
'Receita Federal do Brasil',
ARRAY['Gestão NAF', 'Procedimentos Administrativos', 'Diretrizes Operacionais'],
'active');