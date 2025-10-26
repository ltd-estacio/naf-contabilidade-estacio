import { NextResponse } from 'next/server'
import { additionalGuides } from './additional-guides'

const guidesData = [
  {
    id: 'cpf-cadastro',
    title: 'Cadastro de CPF - Primeira Via e Regularização',
    category: 'federal',
    description: 'Guia completo para solicitar CPF, incluindo casos especiais, primeira via, segunda via, regularização de situação e correção de dados cadastrais para pessoas físicas de todas as idades',
    estimatedTime: '30-90 minutos',
    difficulty: 'básico',
    steps: [
      {
        id: 1,
        title: 'Análise da Situação e Preparação da Documentação',
        description: 'Identifique sua situação específica e reúna todos os documentos necessários conforme seu caso',
        substeps: [
          'Verifique se você já possui CPF consultando no site da Receita Federal',
          'Identifique seu caso: primeira via, segunda via, regularização ou correção',
          'Para brasileiros: Certidão de nascimento ou casamento (original e legível)',
          'Para estrangeiros: Documento de identidade do país de origem',
          'Documento oficial com foto válido (RG, CNH, Carteira de Trabalho, Passaporte)',
          'Comprovante de residência atualizado (máximo 90 dias) no seu nome ou de cônjuge/pais',
          'Título de eleitor (obrigatório para maiores de 18 anos)',
          'Para menores de 18 anos: presença obrigatória do responsável legal',
          'Certidão de nascimento dos filhos menores (se houver)',
          'Comprovante de renda (se solicitado para casos especiais)'
        ],
        warnings: [
          'Documentos devem estar em perfeito estado de conservação e legíveis',
          'Comprovante de residência deve ser de até 90 dias corridos',
          'Para estrangeiros: documentos devem estar traduzidos por tradutor juramentado',
          'Menores de 16 anos só podem ter CPF com autorização dos pais',
          'Comprovante de residência deve estar no nome do solicitante, cônjuge ou pais/responsáveis'
        ],
        tips: [
          'Tire cópias de todos os documentos antes de sair de casa',
          'Para comprovante de residência, são aceitos: conta de luz, água, telefone, gás, IPTU, extrato bancário',
          'Se não tiver comprovante no seu nome, leve declaração de residência assinada pelo titular',
          'Chegue cedo aos postos para evitar filas longas',
          'Verifique se seu município tem posto da Receita Federal ou use Correios credenciados'
        ]
      },
      {
        id: 2,
        title: 'Agendamento Online ou Atendimento Presencial',
        description: 'Realize o agendamento através do portal da Receita Federal ou compareça diretamente aos postos autorizados',
        substeps: [
          'Acesse o site oficial: cpf.receita.fazenda.gov.br',
          'Clique em "Agendamento de Atendimento" ou "Inscrição de Pessoa Física"',
          'Preencha o formulário com dados pessoais completos e corretos',
          'Escolha o posto de atendimento mais próximo (Receita Federal, Correios, Banco do Brasil)',
          'Selecione data e horário disponíveis',
          'Anote o número do protocolo de agendamento',
          'Imprima o comprovante de agendamento',
          'Para casos urgentes: verifique postos que atendem sem agendamento'
        ],
        warnings: [
          'Dados informados devem ser idênticos aos documentos apresentados',
          'Nome completo deve ser exatamente igual ao da certidão de nascimento',
          'Data de nascimento e nome da mãe são informações críticas para validação',
          'Não falte ao agendamento - taxa de reagendamento é de R$ 7,00',
          'Reagendamento só é possível após 7 dias da data perdida'
        ],
        tips: [
          'Salve o comprovante de agendamento em PDF no celular',
          'Se não conseguir agendar online, tente diferentes horários',
          'Postos dos Correios geralmente têm mais vagas disponíveis',
          'Para casos especiais, procure diretamente a Receita Federal',
          'Guarde o número do protocolo para consultas futuras'
        ]
      },
      {
        id: 3,
        title: 'Comparecimento ao Posto de Atendimento',
        description: 'Compareça ao local escolhido portando todos os documentos e seguindo os procedimentos específicos',
        substeps: [
          'Chegue ao local com 15-30 minutos de antecedência',
          'Apresente o comprovante de agendamento (impresso ou digital)',
          'Entregue todos os documentos originais ao atendente',
          'Forneça dados complementares se solicitados (nome do pai, endereço completo)',
          'Assine os formulários apresentados pelo atendente',
          'Confira todos os dados na tela do computador antes de confirmar',
          'Aguarde a emissão do comprovante de inscrição no CPF',
          'Para primeira via: aguarde a impressão do cartão físico (quando disponível)',
          'Guarde o comprovante de inscrição - serve como documento válido'
        ],
        warnings: [
          'Não esqueça nenhum documento - pode invalidar o atendimento',
          'Menores de 18 anos devem estar acompanhados do responsável legal',
          'Verifique todos os dados antes de assinar - correções posteriores são mais complexas',
          'Multa de R$ 7,00 por não comparecimento ao agendamento',
          'Não é possível fazer CPF para terceiros, mesmo com procuração'
        ],
        tips: [
          'Leve caneta própria para agilizar o processo',
          'Tenha paciência - o processo pode demorar de 10 a 30 minutos',
          'Tire foto do comprovante de inscrição para ter sempre no celular',
          'Anote o número do CPF imediatamente',
          'Se houver erro nos dados, solicite correção imediatamente'
        ]
      },
      {
        id: 4,
        title: 'Validação e Regularização da Situação',
        description: 'Verifique se o CPF foi emitido corretamente e regularize pendências se necessário',
        substeps: [
          'Consulte a situação do CPF no site da Receita Federal após 24 horas',
          'Verifique se todos os dados estão corretos na consulta online',
          'Para CPF irregular: identifique o motivo (pendência de IR, multas, etc.)',
          'Quite todas as pendências fiscais se existirem',
          'Solicite cartão físico pelos Correios se necessário (taxa adicional)',
          'Atualize o CPF em todos os seus documentos e cadastros',
          'Informe o número aos bancos, empregadores e outros órgãos'
        ],
        warnings: [
          'CPF irregular impede várias operações (abertura de conta, empréstimos, etc.)',
          'Pendências de IR devem ser resolvidas para regularizar a situação',
          'Uso de CPF de terceiros é crime previsto em lei',
          'CPF cancelado por óbito só pode ser reativado com documentação específica'
        ],
        tips: [
          'Consulte a situação do CPF periodicamente pelo site da Receita',
          'Mantenha sempre seus dados atualizados',
          'Use o comprovante de inscrição até receber o cartão físico',
          'Guarde o número do CPF em local seguro',
          'Para empresários: o CPF será usado em todas as atividades comerciais'
        ]
      }
    ],
    legislation: [
      {
        type: 'decreto',
        number: '3000',
        year: 1999,
        title: 'Regulamento do Imposto de Renda - RIR/99',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/decreto/d3000.htm'
      },
      {
        type: 'instrução_normativa',
        number: '1548',
        year: 2015,
        title: 'Disciplina o Cadastro de Pessoas Físicas',
        level: 'federal',
        url: 'http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=68064'
      },
      {
        type: 'lei',
        number: '9532',
        year: 1997,
        title: 'Lei do Imposto de Renda das Pessoas Físicas',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/leis/l9532.htm'
      }
    ],
    documents: [
      'Certidão de nascimento ou casamento (original)',
      'Documento oficial com foto válido (RG, CNH, Carteira de Trabalho)',
      'Comprovante de residência atualizado (máximo 90 dias)',
      'Título de eleitor (obrigatório para maiores de 18 anos)',
      'Para menores: presença obrigatória do responsável legal',
      'Para estrangeiros: documento de identidade do país de origem traduzido',
      'Comprovante de renda (casos especiais)',
      'Certidão de nascimento dos filhos (se houver)'
    ],
    contacts: [
      {
        organ: 'Receita Federal - Unidade São José/SC',
        phone: '(48) 3027-5000',
        email: 'atendimento.sjose@receita.fazenda.gov.br',
        address: 'Av. Lédio João Martins, 1000 - Kobrasol - São José/SC',
        website: 'https://www.gov.br/receitafederal/pt-br',
        level: 'federal'
      },
      {
        organ: 'Correios - Agência São José Centro',
        phone: '(48) 3251-2500',
        email: 'sao.jose@correios.com.br',
        address: 'Rua Felipe Schmidt, 850 - Centro - São José/SC',
        website: 'https://www.correios.com.br',
        level: 'federal'
      }
    ]
  },
  {
    id: 'mei-abertura',
    title: 'MEI - Microempreendedor Individual - Abertura e Gestão Completa',
    category: 'federal',
    description: 'Guia completo para abertura, formalização e gestão do MEI, incluindo atividades permitidas, obrigações, benefícios e processo de desenquadramento',
    estimatedTime: '45-120 minutos',
    difficulty: 'intermediário',
    steps: [
      {
        id: 1,
        title: 'Análise de Viabilidade e Requisitos para MEI',
        description: 'Verifique se você atende aos requisitos e se sua atividade é permitida para MEI',
        substeps: [
          'Confirme se sua atividade está na lista de ocupações permitidas para MEI',
          'Verifique se o faturamento anual não ultrapassa R$ 81.000,00',
          'Confirme que não possui participação em outra empresa como sócio ou titular',
          'Verifique se não é funcionário público federal, estadual ou municipal',
          'Confirme que não possui mais de um estabelecimento',
          'Pode ter apenas 1 empregado contratado',
          'Consulte se a atividade é permitida no seu município (licenciamento)',
          'Verifique restrições específicas do seu ramo de atividade',
          'Analise se MEI é a melhor opção tributária para seu caso'
        ],
        warnings: [
          'Algumas atividades são vedadas para MEI (médicos, advogados, engenheiros, etc.)',
          'Ultrapassar o limite de faturamento pode gerar multas e desenquadramento',
          'Funcionário público pode ter restrições específicas conforme cargo',
          'Atividades que exigem ensino superior não podem ser MEI',
          'Verificar se a atividade precisa de licenças especiais no município'
        ],
        tips: [
          'Use o simulador de enquadramento no Portal do Empreendedor',
          'Consulte o código CNAE da sua atividade antes de iniciar',
          'Se houver dúvidas sobre a atividade, procure orientação no SEBRAE',
          'Verifique se sua atividade permite trabalhar em casa',
          'Considere o crescimento futuro do negócio antes de escolher MEI'
        ]
      },
      {
        id: 2,
        title: 'Formalização Online pelo Portal do Empreendedor',
        description: 'Realize a abertura do MEI através do portal oficial do governo',
        substeps: [
          'Acesse o Portal do Empreendedor: www.gov.br/empresas-e-negocios/pt-br/empreendedor',
          'Clique em "Quero ser MEI" e depois "Formalize-se"',
          'Preencha seus dados pessoais completos (nome, CPF, endereço)',
          'Informe o endereço comercial (pode ser residencial)',
          'Selecione sua atividade principal e até 15 atividades secundárias',
          'Escolha se terá funcionário (pode alterar depois)',
          'Declare se possui other fonte de renda',
          'Revise todos os dados cuidadosamente',
          'Aceite os termos e finalize a inscrição',
          'Imprima o Certificado da Condição de Microempreendedor Individual (CCMEI)'
        ],
        warnings: [
          'Dados incorretos podem gerar problemas futuros com a Receita Federal',
          'Endereço comercial deve ser válido para correspondências',
          'Atividade principal define a contribuição previdenciária',
          'Não é possível alterar a atividade principal facilmente depois',
          'CNPJ é gerado automaticamente e não pode ser escolhido'
        ],
        tips: [
          'Tenha em mãos todos os documentos antes de começar',
          'Use conexão estável de internet para evitar perda de dados',
          'Salve o CCMEI em PDF e também imprima uma cópia',
          'Anote o número do CNPJ imediatamente',
          'O processo é gratuito - desconfie de sites que cobram taxa'
        ]
      },
      {
        id: 3,
        title: 'Obtenção de Licenças e Alvarás Municipais',
        description: 'Providencie as licenças necessárias junto à prefeitura de São José/SC',
        substeps: [
          'Acesse o site da Prefeitura de São José/SC',
          'Verifique se sua atividade precisa de Alvará de Funcionamento',
          'Consulte o código de atividade no Cadastro Municipal',
          'Preencha o requerimento de Licença de Funcionamento',
          'Anexe cópia do CCMEI e documentos pessoais',
          'Pague as taxas municipais (se houver)',
          'Aguarde vistoria (se necessário para sua atividade)',
          'Retire o Alvará de Funcionamento',
          'Para atividades alimentícias: obtenha licença sanitária',
          'Mantenha os alvarás atualizados conforme prazos municipais'
        ],
        warnings: [
          'Funcionar sem alvará pode gerar multas e fechamento',
          'Algumas atividades não podem funcionar em zona residencial',
          'Atividades de risco exigem vistorias do Corpo de Bombeiros',
          'Prazos de renovação variam conforme o tipo de atividade',
          'Mudança de endereço exige novo alvará'
        ],
        tips: [
          'Consulte primeiro se sua atividade é permitida no local escolhido',
          'Mantenha sempre cópias dos alvarás no estabelecimento',
          'Algumas atividades simples podem ser dispensadas de alvará',
          'Procure a Sala do Empreendedor na prefeitura para orientações',
          'Verifique se há incentivos fiscais municipais para MEI'
        ]
      },
      {
        id: 4,
        title: 'Gestão Mensal - DAS e Obrigações',
        description: 'Cumpra as obrigações mensais e anuais do MEI corretamente',
        substeps: [
          'Emita o DAS (Documento de Arrecadação do Simples Nacional) todo mês',
          'Acesse o Portal do Simples Nacional para gerar o DAS',
          'Pague o DAS até o dia 20 de cada mês (ou próximo dia útil)',
          'Valor atual: R$ 67,00 (comércio/indústria) ou R$ 71,00 (serviços)',
          'Mantenha controle de faturamento mensal (não ultrapassar R$ 6.750,00/mês)',
          'Emita notas fiscais quando solicitadas pelos clientes',
          'Guarde todos os comprovantes de pagamento do DAS',
          'Entregue a DASN-SIMEI (Declaração Anual) até 31 de maio',
          'Mantenha registro de receitas e despesas (livro caixa)',
          'Para funcionário: recolha mensalmente o FGTS e INSS'
        ],
        warnings: [
          'Atraso no pagamento do DAS gera multa e juros',
          'Não entregar DASN-SIMEI gera multa mínima de R$ 50,00',
          'Ultrapassar limite de faturamento pode gerar desenquadramento',
          'Falta de controle financeiro dificulta a declaração anual',
          'CNPJ cancelado por falta de pagamento é difícil de reativar'
        ],
        tips: [
          'Configure lembretes mensais para pagamento do DAS',
          'Use aplicativos de controle financeiro específicos para MEI',
          'Mantenha uma conta bancária separada para o negócio',
          'Guarde notas fiscais de compras para deduzir despesas',
          'Considere contratar contador para orientações'
        ]
      }
    ],
    legislation: [
      {
        type: 'lei',
        number: '128',
        year: 2008,
        title: 'Lei Geral da Micro e Pequena Empresa',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11598.htm'
      },
      {
        type: 'lei',
        number: '155',
        year: 2016,
        title: 'Lei do Microempreendedor Individual',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13352.htm'
      }
    ],
    documents: [
      'CPF do titular',
      'RG ou CNH do titular',
      'Comprovante de residência',
      'Número do título de eleitor',
      'Declaração de Imposto de Renda (se obrigatório)',
      'Comprovante de endereço comercial'
    ],
    contacts: [
      {
        organ: 'SEBRAE - São José/SC',
        phone: '(48) 3028-7000',
        email: 'atendimento-sc@sebrae.com.br',
        address: 'Rua Vereador Ângelo Tomazzi, 300 - Kobrasol - São José/SC',
        website: 'https://www.sebrae.com.br/sites/PortalSebrae/ufs/sc',
        level: 'federal'
      },
      {
        organ: 'Prefeitura de São José - Sala do Empreendedor',
        phone: '(48) 3381-9000',
        email: 'empreendedor@pmsj.sc.gov.br',
        address: 'Av. Acioni Souza Filho, 2674 - Kobrasol - São José/SC',
        website: 'https://www.pmsj.sc.gov.br',
        level: 'municipal'
      }
    ]
  },
  {
    id: 'ir-declaracao',
    title: 'Imposto de Renda Pessoa Física - Declaração Completa e Simplificada',
    category: 'federal',
    description: 'Guia detalhado para preenchimento da Declaração de Imposto de Renda, incluindo deduções, rendimentos, bens e direitos, e estratégias de otimização fiscal',
    estimatedTime: '90-180 minutos',
    difficulty: 'avançado',
    steps: [
      {
        id: 1,
        title: 'Verificação de Obrigatoriedade e Preparação',
        description: 'Determine se você é obrigado a declarar e organize toda a documentação necessária',
        substeps: [
          'Verifique se teve rendimentos tributáveis acima de R$ 30.639,90 em 2024',
          'Confirme se teve ganhos de capital ou operações na bolsa de valores',
          'Verifique se possui bens e direitos acima de R$ 800.000,00',
          'Confirme se teve rendimentos isentos acima de R$ 200.000,00',
          'Organize todos os informes de rendimentos (salário, aposentadoria, etc.)',
          'Separe comprovantes de despesas dedutíveis (médicas, educação, previdência)',
          'Reúna documentos de bens e direitos (imóveis, veículos, investimentos)',
          'Prepare informações sobre dependentes (CPF, dados pessoais)',
          'Organize recibos de doações para fundos da criança e idoso',
          'Baixe o programa IRPF 2025 ou use o portal e-CAC'
        ],
        warnings: [
          'Não declarar quando obrigatório gera multa mínima de R$ 165,74',
          'Informações incorretas podem levar à malha fina',
          'Omitir rendimentos é sonegação fiscal e crime',
          'Prazo final é 31 de maio - não há prorrogação',
          'Retificação só é possível por 5 anos após a entrega'
        ],
        tips: [
          'Comece a organizar os documentos em janeiro',
          'Use planilha para controlar todas as informações',
          'Guarde todos os comprovantes por 5 anos',
          'Se tem muitas despesas, calcule se vale a pena fazer declaração completa',
          'Consulte o CPF na Receita Federal para verificar pendências'
        ]
      },
      {
        id: 2,
        title: 'Preenchimento dos Dados Pessoais e Dependentes',
        description: 'Preencha corretamente as informações pessoais e de dependentes',
        substeps: [
          'Acesse o programa IRPF 2025 ou o portal e-CAC',
          'Preencha dados pessoais (nome completo, CPF, data de nascimento)',
          'Informe endereço residencial completo e atualizado',
          'Declare ocupação principal e código correspondente',
          'Inclua informações sobre cônjuge se casado',
          'Adicione dependentes com todos os dados obrigatórios',
          'Para cada dependente: CPF, grau de parentesco, data de nascimento',
          'Informe se dependente tem rendimentos próprios',
          'Declare se houve nascimento ou falecimento de dependentes no ano',
          'Confirme se dependentes também são obrigados a declarar'
        ],
        warnings: [
          'Dados de dependentes devem ser consistentes em toda a declaração',
          'Dependente maior de 21 anos só se estiver estudando',
          'Não incluir dependente que faz declaração própria',
          'Erro nos dados pessoais pode invalidar a declaração',
          'CPF de dependentes deve estar regularizado'
        ],
        tips: [
          'Mantenha dados atualizados na Receita Federal o ano todo',
          'Para dependentes estudantes, tenha comprovantes de matrícula',
          'Se divorciado, verifique quem tem direito a declarar os filhos',
          'Dependente com deficiência tem regras especiais',
          'Atualizar endereço agiliza correspondências da Receita'
        ]
      },
      {
        id: 3,
        title: 'Lançamento de Rendimentos e Retenções',
        description: 'Declare todos os rendimentos recebidos e impostos retidos na fonte',
        substeps: [
          'Lance rendimentos tributáveis (salários, aposentadorias, aluguéis)',
          'Use dados dos informes de rendimentos fornecidos pelas fontes pagadoras',
          'Declare rendimentos de pessoa jurídica com CNPJ e valores mensais',
          'Informe rendimentos de pessoa física (sem CNPJ) quando aplicável',
          'Lance rendimentos isentos e não tributáveis separadamente',
          'Declare 13º salário e outros rendimentos especiais',
          'Informe ganhos de capital (venda de bens, ações, imóveis)',
          'Lance rendimentos de aplicações financeiras',
          'Declare pensão alimentícia recebida ou paga',
          'Confira se imposto retido na fonte está correto'
        ],
        warnings: [
          'Todos os informes devem ser declarados integralmente',
          'Omitir rendimentos pode levar à malha fina ou autuação',
          'Rendimentos do exterior têm regras específicas',
          'Ganhos de capital têm prazos para declaração e pagamento',
          'Divergências com informes das empresas geram inconsistências'
        ],
        tips: [
          'Solicite informes de rendimentos até o final de fevereiro',
          'Confira se todos os informes foram enviados pelas empresas',
          'Para investimentos, use informes dos bancos e corretoras',
          'Rendimentos variáveis devem ser calculados mês a mês',
          'Mantenha controle de todas as fontes de renda'
        ]
      },
      {
        id: 4,
        title: 'Deduções Legais e Otimização Fiscal',
        description: 'Lance todas as deduções permitidas para reduzir o imposto devido',
        substeps: [
          'Declare gastos médicos (consultas, exames, internações, planos de saúde)',
          'Lance despesas com educação (escola, faculdade, cursos técnicos)',
          'Informe contribuições para previdência privada (PGBL/VGBL)',
          'Declare pensão alimentícia paga por decisão judicial',
          'Lance contribuições para previdência social oficial',
          'Informe doações para fundos da criança e adolescente (até 3%)',
          'Declare doações para fundos do idoso (até 3%)',
          'Lance despesas com livro caixa (se tem rendimentos de aluguel)',
          'Informe outras deduções específicas conforme legislação',
          'Compare declaração completa vs. simplificada para escolher a melhor'
        ],
        warnings: [
          'Limite anual para gastos com educação por dependente',
          'Gastos médicos não têm limite, mas devem ser comprovados',
          'Previdência privada tem limite de 12% da renda tributável',
          'Todas as deduções devem ter comprovantes válidos',
          'Doações têm percentual máximo sobre o imposto devido'
        ],
        tips: [
          'Organize comprovantes de gastos médicos e educação',
          'Para planos de saúde, use informes das operadoras',
          'Considere estratégias de planejamento para próximo ano',
          'Gastos do cônjuge podem ser deduzidos na declaração conjunta',
          'Mantenha controle mensal de todas as despesas dedutíveis'
        ]
      },
      {
        id: 5,
        title: 'Finalização e Transmissão da Declaração',
        description: 'Revise, calcule o imposto e transmita a declaração dentro do prazo',
        substeps: [
          'Revise todos os dados lançados na declaração',
          'Execute o cálculo do imposto devido ou a restituir',
          'Confira se há inconsistências ou erros apontados pelo programa',
          'Escolha a forma de pagamento se houver imposto devido',
          'Defina dados bancários para restituição se aplicável',
          'Gere arquivo da declaração para backup',
          'Transmita a declaração via internet',
          'Imprima o comprovante de entrega',
          'Anote o número do recibo da declaração',
          'Acompanhe o processamento no portal e-CAC'
        ],
        warnings: [
          'Declaração só é válida após transmissão e confirmação',
          'Imposto devido deve ser pago até a data de entrega',
          'Dados bancários incorretos atrasam a restituição',
          'Não transmitir até 31 de maio gera multa automática',
          'Malha fina pode ser evitada com dados corretos e consistentes'
        ],
        tips: [
          'Faça backup da declaração em local seguro',
          'Guarde comprovante de entrega por 5 anos',
          'Acompanhe calendário de restituição se aplicável',
          'Se cair na malha fina, regularize pendências rapidamente',
          'Use certificado digital para maior segurança na transmissão'
        ]
      }
    ],
    legislation: [
      {
        type: 'lei',
        number: '9250',
        year: 1995,
        title: 'Lei do Imposto de Renda das Pessoas Físicas',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/leis/l9250.htm'
      },
      {
        type: 'instrução_normativa',
        number: '2010',
        year: 2021,
        title: 'DIRPF 2025 - Declaração de Imposto de Renda',
        level: 'federal',
        url: 'http://normas.receita.fazenda.gov.br'
      }
    ],
    documents: [
      'Informes de rendimentos de todas as fontes',
      'Comprovantes de gastos médicos e odontológicos',
      'Comprovantes de gastos com educação',
      'Extratos de contribuições para previdência privada',
      'Recibos de doações para fundos legais',
      'Dados de bens e direitos (escrituras, extratos)',
      'Comprovantes de operações em bolsa de valores',
      'Documentos de dependentes (CPF, certidões)'
    ],
    contacts: [
      {
        organ: 'Receita Federal - Atendimento Virtual',
        phone: '146',
        email: 'atendimento@receita.fazenda.gov.br',
        address: 'Portal e-CAC - Atendimento Online',
        website: 'https://www.gov.br/receitafederal/pt-br',
        level: 'federal'
      },
      {
        organ: 'Contador Credenciado - Orientações IRPF',
        phone: '(48) 9999-9999',
        email: 'contabilidade@exemplo.com.br',
        address: 'Consulte profissionais credenciados',
        website: 'https://crcsc.org.br',
        level: 'federal'
      }
    ]
  }
]

// Combinar todos os guias
const allGuides = [...guidesData, ...additionalGuides]

export async function GET() {
  return NextResponse.json(allGuides)
}
