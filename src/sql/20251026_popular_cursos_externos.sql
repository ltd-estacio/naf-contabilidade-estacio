-- ===============================================
-- POPULAR CURSOS EXTERNOS - NAF
-- Data: 26/10/2025
-- ===============================================
-- Este script adiciona cursos gratuitos e confiáveis
-- da Escola Virtual do Governo (EV.org.br) e
-- manuais oficiais da Receita Federal
-- ===============================================

-- Limpar cursos de exemplo (opcional)
-- DELETE FROM external_courses WHERE id <= 3;

-- ===============================================
-- CATEGORIA: CURSOS - ESCOLA VIRTUAL GOV.BR
-- ===============================================

INSERT INTO external_courses (
    title,
    description,
    course_url,
    platform,
    category,
    difficulty_level,
    duration,
    is_active,
    thumbnail_url,
    views_count
) VALUES 
(
    'Contabilidade com foco na gestão da informação contábil',
    'Curso oferecido pela Escola Virtual do Governo Federal sobre gestão da informação contábil. Aprenda técnicas e práticas modernas de gestão contábil aplicadas ao setor público.',
    'https://www.escolavirtual.gov.br/curso/548',
    'Escola Virtual Gov.br',
    'Contabilidade',
    'Intermediário',
    '20 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Contabilidade pública e conformidade na gestão',
    'Curso sobre contabilidade pública e procedimentos de conformidade. Aborda aspectos legais, normativos e práticos da contabilidade no setor público.',
    'https://www.escolavirtual.gov.br/curso/480',
    'Escola Virtual Gov.br',
    'Contabilidade',
    'Intermediário',
    '30 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Contabilidade com Foco na Gestão do Patrimônio Público',
    'Gestão e controle do patrimônio público através da contabilidade. Princípios de inventário, depreciação e controle patrimonial no setor público.',
    'https://www.escolavirtual.gov.br/curso/342',
    'Escola Virtual Gov.br',
    'Contabilidade',
    'Avançado',
    '40 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Conceitos Básicos de Finanças e Contabilidade para Empresas Estatais',
    'Fundamentos financeiros e contábeis específicos para empresas estatais. Aborda particularidades da gestão financeira em empresas de economia mista e estatais.',
    'https://www.escolavirtual.gov.br/curso/1345',
    'Escola Virtual Gov.br',
    'Contabilidade',
    'Iniciante',
    '15 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Contabilidade Empresarial',
    'Curso abrangente sobre contabilidade empresarial oferecido pela EV.org.br. Princípios, técnicas e práticas contábeis aplicadas ao ambiente empresarial.',
    'https://www.ev.org.br/cursos/contabilidade-empresarial',
    'EV.org.br',
    'Empresarial',
    'Intermediário',
    '25 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
);

-- ===============================================
-- CATEGORIA: MANUAIS - RECEITA FEDERAL
-- ===============================================

INSERT INTO external_courses (
    title,
    description,
    course_url,
    platform,
    category,
    difficulty_level,
    duration,
    is_active,
    thumbnail_url,
    views_count
) VALUES 
(
    'Manual de Atendimentos NAF',
    'Manual oficial da Receita Federal para procedimentos de atendimento no Núcleo de Apoio Contábil e Fiscal (NAF). Orientações completas sobre todos os serviços oferecidos.',
    'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-NAF/manual',
    'Receita Federal',
    'Fiscal',
    'Intermediário',
    'Consulta',
    TRUE,
    'https://www.gov.br/receitafederal/pt-br/imagens/logo-receita.png',
    0
),
(
    'Manual do Referencial NAF',
    'Manual de referência para funcionamento e gestão do Núcleo de Apoio Contábil e Fiscal. Documento essencial para coordenadores e estudantes que atuam no NAF.',
    'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/referencial-naf',
    'Receita Federal',
    'Fiscal',
    'Avançado',
    'Consulta',
    TRUE,
    'https://www.gov.br/receitafederal/pt-br/imagens/logo-receita.png',
    0
);

-- ===============================================
-- CATEGORIA: LEGISLAÇÃO (MATERIAL DE APOIO)
-- ===============================================

INSERT INTO external_courses (
    title,
    description,
    course_url,
    platform,
    category,
    difficulty_level,
    duration,
    is_active,
    thumbnail_url,
    views_count
) VALUES 
(
    'Portal da Legislação Federal',
    'Acesso ao portal oficial de legislação federal brasileira. Consulta a leis, decretos, portarias e normas da Receita Federal e demais órgãos.',
    'http://www4.planalto.gov.br/legislacao',
    'Planalto',
    'Fiscal',
    'Todos os níveis',
    'Consulta',
    TRUE,
    'https://www.gov.br/planalto/pt-br/imagens/logo-planalto.png',
    0
),
(
    'Legislação Tributária - Receita Federal',
    'Central de conteúdo com toda a legislação tributária brasileira. Inclui Código Tributário Nacional, instruções normativas e portarias.',
    'https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/legislacao',
    'Receita Federal',
    'Tributário',
    'Todos os níveis',
    'Consulta',
    TRUE,
    'https://www.gov.br/receitafederal/pt-br/imagens/logo-receita.png',
    0
);

-- ===============================================
-- CURSOS ADICIONAIS RECOMENDADOS
-- ===============================================

INSERT INTO external_courses (
    title,
    description,
    course_url,
    platform,
    category,
    difficulty_level,
    duration,
    is_active,
    thumbnail_url,
    views_count
) VALUES 
(
    'Imposto de Renda Pessoa Física (IRPF)',
    'Curso completo sobre declaração de Imposto de Renda Pessoa Física. Aprenda a preencher corretamente a declaração e evitar erros comuns.',
    'https://www.escolavirtual.gov.br/curso/157',
    'Escola Virtual Gov.br',
    'Tributário',
    'Iniciante',
    '12 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Microempreendedor Individual (MEI)',
    'Tudo sobre o MEI: como se formalizar, obrigações, benefícios e gestão do microempreendimento. Curso prático e objetivo.',
    'https://www.escolavirtual.gov.br/curso/293',
    'Escola Virtual Gov.br',
    'Empresarial',
    'Iniciante',
    '8 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Simples Nacional',
    'Entenda o regime tributário do Simples Nacional. Quem pode optar, como calcular os tributos e obrigações acessórias.',
    'https://www.escolavirtual.gov.br/curso/294',
    'Escola Virtual Gov.br',
    'Tributário',
    'Intermediário',
    '16 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'E-Social Doméstico',
    'Aprenda a utilizar o e-Social para registro de empregados domésticos. Guia completo de cadastro, folha de pagamento e obrigações.',
    'https://www.escolavirtual.gov.br/curso/389',
    'Escola Virtual Gov.br',
    'Trabalhista',
    'Iniciante',
    '10 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
),
(
    'Certidões Negativas',
    'Como emitir e interpretar certidões negativas de débitos federais, estaduais e municipais. Importância para a regularidade fiscal.',
    'https://www.escolavirtual.gov.br/curso/245',
    'Escola Virtual Gov.br',
    'Fiscal',
    'Iniciante',
    '6 horas',
    TRUE,
    'https://www.gov.br/servidor/pt-br/imagens/logo-escolavirtual.png',
    0
);

-- ===============================================
-- VERIFICAÇÃO
-- ===============================================

-- Contar cursos por categoria
SELECT 
    category,
    COUNT(*) as total_cursos,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as ativos
FROM external_courses
GROUP BY category
ORDER BY total_cursos DESC;

-- Listar todos os cursos ativos
SELECT 
    id,
    title,
    category,
    difficulty_level,
    platform,
    is_active
FROM external_courses
WHERE is_active = TRUE
ORDER BY category, title;

-- Total geral
SELECT 
    COUNT(*) as total_cursos,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as cursos_ativos,
    COUNT(DISTINCT category) as total_categorias,
    COUNT(DISTINCT platform) as total_plataformas
FROM external_courses;

-- ===============================================
-- FIM DO SCRIPT
-- ===============================================
-- Execute este script no SQL Editor do Supabase
-- para popular o banco com cursos oficiais gratuitos
-- ===============================================
