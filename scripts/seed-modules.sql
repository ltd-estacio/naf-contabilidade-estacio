-- Inserção dos módulos para cada tema dos cursos

-- ===== MÓDULOS DO TEMA 1 - FUNDAMENTOS DO POWER BI =====
-- Módulo 1
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001',
'O que é Business Intelligence',
'Introdução aos conceitos de BI e sua importância no mundo dos negócios.',
'{
  "sections": [
    {
      "type": "text",
      "content": "Business Intelligence (BI) é um conjunto de metodologias, processos, arquiteturas e tecnologias que transformam dados brutos em informações relevantes e úteis para fins de análise de negócios."
    },
    {
      "type": "list",
      "title": "Componentes principais do BI:",
      "items": [
        "Coleta de dados",
        "Processamento e armazenamento",
        "Análise e visualização",
        "Relatórios e dashboards"
      ]
    },
    {
      "type": "image",
      "url": "/images/bi-cycle.png",
      "alt": "Ciclo do Business Intelligence"
    }
  ]
}',
1, 'lesson', 20,
ARRAY['Definir Business Intelligence', 'Identificar componentes do BI', 'Compreender a importância do BI']);

-- Módulo 2
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001',
'Conhecendo o Power BI',
'Visão geral da ferramenta Microsoft Power BI e seus componentes.',
'{
  "sections": [
    {
      "type": "text",
      "content": "O Microsoft Power BI é uma ferramenta de business intelligence que permite criar visualizações interativas e relatórios de business intelligence com uma interface simples para usuários finais criarem seus próprios relatórios e dashboards."
    },
    {
      "type": "video",
      "title": "Introdução ao Power BI",
      "url": "https://www.youtube.com/embed/yKTSLffVGbk",
      "duration": "10:00"
    },
    {
      "type": "list",
      "title": "Componentes do Power BI:",
      "items": [
        "Power BI Desktop - Para criação de relatórios",
        "Power BI Service - Plataforma na nuvem",
        "Power BI Mobile - Aplicativos móveis",
        "Power BI Report Server - Servidor local"
      ]
    }
  ]
}',
2, 'lesson', 25,
ARRAY['Identificar componentes do Power BI', 'Compreender diferenças entre Desktop e Service']);

-- Módulo 3
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001',
'Interface do Power BI Desktop',
'Explorando a interface e ferramentas principais do Power BI Desktop.',
'{
  "sections": [
    {
      "type": "text",
      "content": "O Power BI Desktop possui três visualizações principais: Relatório, Dados e Relações. Cada uma serve para diferentes etapas do processo de criação de relatórios."
    },
    {
      "type": "interactive",
      "title": "Explorando a Interface",
      "content": "Clique nas diferentes áreas da interface para conhecer suas funcionalidades.",
      "image": "/images/powerbi-interface.png",
      "hotspots": [
        {"x": 50, "y": 100, "info": "Ribbon - Ferramentas principais"},
        {"x": 200, "y": 150, "info": "Painéis laterais"},
        {"x": 400, "y": 300, "info": "Canvas de relatório"}
      ]
    }
  ]
}',
3, 'lesson', 20,
ARRAY['Navegar pela interface do Power BI', 'Identificar painéis e ferramentas']);

-- Módulo 4
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001',
'Configuração do Ambiente',
'Como configurar o Power BI Desktop para trabalho eficiente.',
'{
  "sections": [
    {
      "type": "text",
      "content": "Antes de começar a trabalhar com dados, é importante configurar adequadamente o ambiente do Power BI Desktop."
    },
    {
      "type": "steps",
      "title": "Passos para configuração:",
      "steps": [
        "Abrir o Power BI Desktop",
        "Configurar opções regionais",
        "Ajustar configurações de privacidade",
        "Configurar fontes de dados padrão"
      ]
    }
  ]
}',
4, 'lesson', 15,
ARRAY['Configurar Power BI Desktop', 'Ajustar opções regionais']);

-- Módulo 5
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001',
'Tipos de Dados e Fontes',
'Compreendendo diferentes tipos de dados e fontes no Power BI.',
'{
  "sections": [
    {
      "type": "text",
      "content": "O Power BI pode conectar-se a uma ampla variedade de fontes de dados, desde arquivos simples até bases de dados complexas."
    },
    {
      "type": "table",
      "title": "Principais fontes de dados:",
      "headers": ["Tipo", "Exemplos", "Uso"],
      "rows": [
        ["Arquivos", "Excel, CSV, XML", "Dados estáticos"],
        ["Bancos de dados", "SQL Server, Oracle", "Dados corporativos"],
        ["Serviços online", "SharePoint, Salesforce", "Dados em nuvem"],
        ["Web", "APIs, páginas web", "Dados públicos"]
      ]
    }
  ]
}',
5, 'lesson', 25,
ARRAY['Identificar tipos de fontes de dados', 'Escolher fonte apropriada']);

-- Módulo 6
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001',
'Exercício Prático - Primeiro Relatório',
'Criando seu primeiro relatório simples no Power BI.',
'{
  "sections": [
    {
      "type": "exercise",
      "title": "Criando seu primeiro relatório",
      "description": "Vamos criar um relatório simples usando dados de vendas.",
      "steps": [
        "Baixe o arquivo de dados de exemplo",
        "Importe os dados no Power BI Desktop",
        "Crie um gráfico de barras simples",
        "Adicione um título ao relatório",
        "Salve o arquivo"
      ],
      "files": [
        {"name": "vendas_exemplo.xlsx", "url": "/files/vendas_exemplo.xlsx"}
      ]
    }
  ]
}',
6, 'exercise', 15,
ARRAY['Criar primeiro relatório', 'Importar dados básicos']);

-- ===== EXERCÍCIOS PARA OS MÓDULOS DO TEMA 1 =====
-- Exercício 1 - Módulo 1
INSERT INTO module_exercises (id, module_id, title, description, question_type, question_data, correct_answer, explanation, points, difficulty, exercise_order) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001',
'Conceitos de BI',
'Teste seus conhecimentos sobre Business Intelligence.',
'multiple_choice',
'{
  "question": "O que significa BI (Business Intelligence)?",
  "options": [
    "Business Information",
    "Business Intelligence",
    "Business Integration",
    "Business Innovation"
  ]
}',
'{"correct_option": 1}',
'Business Intelligence é o termo correto que se refere ao conjunto de metodologias para transformar dados em informações úteis.',
10, 'easy', 1);

-- Exercício 2 - Módulo 2
INSERT INTO module_exercises (id, module_id, title, description, question_type, question_data, correct_answer, explanation, points, difficulty, exercise_order) VALUES
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002',
'Componentes do Power BI',
'Identifique os componentes principais do Power BI.',
'multiple_choice',
'{
  "question": "Qual componente do Power BI é usado para criar relatórios?",
  "options": [
    "Power BI Service",
    "Power BI Desktop",
    "Power BI Mobile",
    "Power BI Gateway"
  ]
}',
'{"correct_option": 1}',
'O Power BI Desktop é a ferramenta principal para criação de relatórios e dashboards.',
10, 'easy', 1);

-- ===== MÓDULOS DO TEMA 1 - LEGISLAÇÃO E FUNDAMENTOS DO CPF =====
-- Módulo 1
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440101', '650e8400-e29b-41d4-a716-446655440005',
'História e Criação do CPF',
'A história e importância do Cadastro de Pessoas Físicas no Brasil.',
'{
  "sections": [
    {
      "type": "text",
      "content": "O CPF (Cadastro de Pessoas Físicas) foi criado pela Lei nº 4.862/1965 e regulamentado pelo Decreto nº 64.567/1969. É um documento fundamental para a vida fiscal do cidadão brasileiro."
    },
    {
      "type": "timeline",
      "title": "Marcos históricos do CPF:",
      "events": [
        {"year": "1965", "event": "Criação do CPF pela Lei 4.862"},
        {"year": "1969", "event": "Regulamentação pelo Decreto 64.567"},
        {"year": "1988", "event": "Constituição Federal estabelece o CPF"},
        {"year": "2000", "event": "Modernização dos sistemas"}
      ]
    }
  ]
}',
1, 'lesson', 15,
ARRAY['Conhecer a história do CPF', 'Compreender importância legal']);

-- Módulo 2
INSERT INTO theme_modules (id, theme_id, title, description, content, module_order, module_type, estimated_duration, learning_objectives) VALUES
('750e8400-e29b-41d4-a716-446655440102', '650e8400-e29b-41d4-a716-446655440005',
'Base Legal do CPF',
'Legislação que rege o Cadastro de Pessoas Físicas.',
'{
  "sections": [
    {
      "type": "text",
      "content": "A base legal do CPF está fundamentada em diversas normas que estabelecem sua obrigatoriedade e procedimentos."
    },
    {
      "type": "legal_references",
      "title": "Principais normas:",
      "references": [
        {
          "type": "Lei",
          "number": "4.862/1965",
          "title": "Criação do CPF",
          "url": "https://www.planalto.gov.br/ccivil_03/leis/l4862.htm"
        },
        {
          "type": "Decreto",
          "number": "64.567/1969",
          "title": "Regulamentação",
          "url": "https://www.planalto.gov.br/ccivil_03/decreto/1950-1969/d64567.htm"
        }
      ]
    }
  ]
}',
2, 'lesson', 15,
ARRAY['Identificar base legal', 'Conhecer principais normas']);

-- Continuar com mais módulos para cada tema...
-- (Por brevidade, mostrando apenas alguns exemplos. O padrão se repete para todos os 72 módulos)