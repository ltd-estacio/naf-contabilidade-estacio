
const additionalGuides = [
  {
    id: 'icms-inscricao-estadual',
    title: 'ICMS - Inscrição Estadual em Santa Catarina',
    category: 'estadual',
    description: 'Guia completo para obtenção da Inscrição Estadual em SC, incluindo atividades comerciais, industriais e prestação de serviços sujeitos ao ICMS',
    estimatedTime: '60-120 minutos',
    difficulty: 'intermediário',
    steps: [
      {
        id: 1,
        title: 'Análise da Necessidade de Inscrição Estadual',
        description: 'Determine se sua atividade exige Inscrição Estadual e qual regime tributário escolher',
        substeps: [
          'Verifique se sua atividade está sujeita ao ICMS (comércio, indústria, serviços de transporte e comunicação)',
          'Analise se é contribuinte habitual ou eventual do ICMS',
          'Consulte a tabela de atividades sujeitas ao ICMS em Santa Catarina',
          'Determine o regime tributário: Simples Nacional, Lucro Presumido ou Lucro Real',
          'Verifique benefícios fiscais disponíveis para sua atividade e região',
          'Consulte se há incentivos específicos para pequenas empresas',
          'Analise obrigações acessórias conforme o porte da empresa',
          'Verifique necessidade de inscrição para vendas interestaduais',
          'Confirme se já possui CNPJ ativo na Receita Federal'
        ],
        warnings: [
          'Exercer atividade sujeita ao ICMS sem inscrição é infração grave',
          'Escolha inadequada do regime tributário pode gerar ônus fiscal desnecessário',
          'Algumas atividades têm alíquotas diferenciadas de ICMS',
          'Vendas interestaduais têm regras específicas de tributação',
          'Atraso na inscrição pode gerar multas e juros'
        ],
        tips: [
          'Procure orientação no escritório regional da SEF/SC mais próximo',
          'Use o simulador de regime tributário disponível no site da SEF/SC',
          'Consulte contadores especializados em tributação estadual',
          'Verifique se sua atividade tem sazonalidade que afete a tributação',
          'Considere localização estratégica para aproveitar incentivos regionais'
        ]
      },
      {
        id: 2,
        title: 'Preparação da Documentação e Cadastro Básico',
        description: 'Organize todos os documentos necessários e prepare informações para o cadastro',
        substeps: [
          'Reúna documentos pessoais dos sócios: RG, CPF, comprovante de residência',
          'Prepare contrato social da empresa registrado na Junta Comercial',
          'Obtenha certidões negativas: Federal, Estadual, Municipal, FGTS, Trabalhista',
          'Prepare comprovante de endereço do estabelecimento',
          'Obtenha croqui de localização do estabelecimento',
          'Prepare planta baixa do estabelecimento (quando exigida)',
          'Reúna alvará de funcionamento municipal (se já obtido)',
          'Prepare licenças sanitárias ou ambientais (quando aplicáveis)',
          'Organize documentos específicos conforme tipo de atividade',
          'Prepare procuração se usar representante'
        ],
        warnings: [
          'Documentos vencidos invalidam o processo de inscrição',
          'Endereço deve coincidir com o cadastrado na Junta Comercial',
          'Certidões negativas têm prazo de validade limitado',
          'Informações falsas caracterizam crime contra ordem tributária',
          'Alterações societárias devem estar atualizadas na Junta Comercial'
        ],
        tips: [
          'Providencie certidões próximo à data de protocolo para evitar vencimento',
          'Mantenha cópias autenticadas de todos os documentos',
          'Verifique se o imóvel tem restrições para atividade comercial',
          'Para sociedades, todos os sócios devem estar com CPF regularizado',
          'Fotografe o estabelecimento para facilitar eventuais vistorias'
        ]
      },
      {
        id: 3,
        title: 'Protocolo da Inscrição no Sistema e-CAD/SC',
        description: 'Realize a inscrição através do sistema eletrônico da Secretaria da Fazenda',
        substeps: [
          'Acesse o portal e-CAD da SEF/SC: www.sef.sc.gov.br',
          'Crie usuário e senha no sistema ou use certificado digital',
          'Selecione "Nova Inscrição Estadual" no menu principal',
          'Preencha dados da empresa: razão social, CNPJ, endereço',
          'Informe dados dos sócios com participação societária',
          'Selecione atividades econômicas (CNAEs) que serão exercidas',
          'Escolha o regime tributário do ICMS aplicável',
          'Informe dados do estabelecimento: área, estrutura, funcionários',
          'Anexe digitalizações de todos os documentos exigidos',
          'Revise todas as informações e submeta o requerimento'
        ],
        warnings: [
          'Sistema tem horário de funcionamento limitado para protocolos',
          'Documentos anexados devem estar em formato e tamanho corretos',
          'Dados incorretos podem atrasar análise e aprovação',
          'CNAEs selecionados definem obrigações tributárias futuras',
          'Não é possível alterar informações após submissão'
        ],
        tips: [
          'Prepare todos os documentos em PDF antes de iniciar',
          'Use conexão estável para evitar perda de dados durante upload',
          'Salve o número do protocolo para acompanhamento',
          'Imprima comprovante de protocolo para seus controles',
          'Acompanhe regularmente o status do processo no sistema'
        ]
      },
      {
        id: 4,
        title: 'Acompanhamento da Análise e Vistoria',
        description: 'Acompanhe a análise documental e prepare-se para eventual vistoria fiscal',
        substeps: [
          'Monitore status do processo através do e-CAD periodicamente',
          'Responda rapidamente a eventuais exigências ou complementações',
          'Prepare estabelecimento para vistoria fiscal quando solicitada',
          'Mantenha responsável disponível para atender fiscalização',
          'Tenha documentos originais disponíveis para conferência',
          'Organize livros fiscais e equipamentos de controle se já possuir',
          'Prepare declarações adicionais se solicitadas pela fiscalização',
          'Acompanhe prazos para cumprimento de exigências',
          'Protocole recursos ou esclarecimentos quando necessário',
          'Aguarde deferimento e emissão do Certificado de Inscrição Estadual'
        ],
        warnings: [
          'Não atender vistoria pode resultar em indeferimento',
          'Prazos para complementação são improrrogáveis',
          'Funcionamento sem inscrição durante análise pode gerar multa',
          'Informações divergentes na vistoria invalidam o processo',
          'Alterações no estabelecimento durante análise devem ser comunicadas'
        ],
        tips: [
          'Mantenha contato telefônico atualizado para agendamento de vistoria',
          'Tenha assessoria contábil disponível durante processo',
          'Documente todas as comunicações com a fiscalização',
          'Prepare check-list dos itens verificados em vistoria',
          'Solicite orientações específicas quando houver dúvidas'
        ]
      },
      {
        id: 5,
        title: 'Início das Atividades e Obrigações Fiscais',
        description: 'Inicie as atividades comerciais cumprindo todas as obrigações tributárias estaduais',
        substeps: [
          'Receba e confira dados do Certificado de Inscrição Estadual',
          'Configure sistema de emissão de notas fiscais eletrônicas (NFe/NFCe)',
          'Solicite autorização para impressão de documentos fiscais se necessário',
          'Implemente controles fiscais conforme exigências da legislação',
          'Configure apuração e recolhimento do ICMS conforme regime escolhido',
          'Inicie escrituração dos livros fiscais obrigatórios',
          'Implemente rotinas de entrega de obrigações acessórias (SINTEGRA, EFD)',
          'Configure controles de estoque e movimentação de mercadorias',
          'Estabeleça rotinas de cálculo e pagamento do ICMS',
          'Mantenha atualizado cadastro estadual com eventuais alterações'
        ],
        warnings: [
          'ICMS deve ser recolhido mesmo sem movimento (substituição tributária)',
          'Atraso na entrega de obrigações acessórias gera multas automáticas',
          'Notas fiscais emitidas incorretamente podem ser rejeitadas',
          'Controles fiscais inadequados facilitam autuações fiscais',
          'Alterações cadastrais devem ser comunicadas em até 30 dias'
        ],
        tips: [
          'Invista em sistema de gestão integrado para facilitar controles',
          'Mantenha backup de todos os documentos fiscais eletrônicos',
          'Faça conciliações mensais entre sistema e obrigações fiscais',
          'Estabeleça rotinas de revisão antes dos vencimentos',
          'Considere assessoria contábil especializada em ICMS'
        ]
      }
    ],
    legislation: [
      {
        type: 'lei',
        number: '10297',
        year: 1996,
        title: 'Código Tributário do Estado de Santa Catarina',
        level: 'estadual',
        url: 'http://legislacao.sef.sc.gov.br'
      },
      {
        type: 'decreto',
        number: '2870',
        year: 2001,
        title: 'Regulamento do ICMS de Santa Catarina',
        level: 'estadual',
        url: 'http://legislacao.sef.sc.gov.br'
      }
    ],
    documents: [
      'Contrato social registrado na Junta Comercial',
      'Documentos pessoais dos sócios (RG, CPF)',
      'Comprovante de endereço do estabelecimento',
      'Certidões negativas (Federal, Estadual, Municipal)',
      'Alvará de funcionamento municipal',
      'Croqui de localização do estabelecimento',
      'Planta baixa (quando exigida)',
      'Licenças específicas conforme atividade'
    ],
    contacts: [
      {
        organ: 'SEF/SC - Secretaria da Fazenda - São José',
        phone: '(48) 3664-4000',
        email: 'sao.jose@sef.sc.gov.br',
        address: 'Rua Presidente Getúlio Vargas, 122 - Centro - São José/SC',
        website: 'https://www.sef.sc.gov.br',
        level: 'estadual'
      },
      {
        organ: 'Junta Comercial de Santa Catarina - JUCESC',
        phone: '(48) 3224-7400',
        email: 'atendimento@jucesc.sc.gov.br',
        address: 'Rua Tenente Silveira, 60 - Centro - Florianópolis/SC',
        website: 'https://www.jucesc.sc.gov.br',
        level: 'estadual'
      }
    ]
  },
  {
    id: 'iss-inscricao-municipal',
    title: 'ISS - Inscrição Municipal e Gestão de Impostos em São José/SC',
    category: 'municipal',
    description: 'Guia detalhado para inscrição municipal, cálculo e recolhimento do ISS, alvará de funcionamento e demais obrigações municipais em São José/SC',
    estimatedTime: '45-90 minutos',
    difficulty: 'intermediário',
    steps: [
      {
        id: 1,
        title: 'Identificação de Atividades Sujeitas ao ISS',
        description: 'Determine se sua atividade está sujeita ao ISS e qual a alíquota aplicável em São José/SC',
        substeps: [
          'Consulte Lista de Serviços anexa à Lei Complementar 116/2003',
          'Verifique enquadramento específico da sua atividade na legislação municipal',
          'Identifique alíquota aplicável conforme tabela de São José/SC',
          'Verifique se há benefícios fiscais para sua atividade ou localização',
          'Confirme local de prestação do serviço para definir município competente',
          'Analise se atividade se enquadra em regime especial de tributação',
          'Verifique obrigatoriedade de inscrição municipal prévia',
          'Consulte necessidade de licenças específicas para sua atividade',
          'Confirme se atividade pode ser exercida na zona escolhida'
        ],
        warnings: [
          'Prestação de serviços sem inscrição municipal constitui infração',
          'Local de prestação determina qual município deve recolher ISS',
          'Algumas atividades têm alíquotas diferenciadas ou fixas',
          'Funcionamento em local inadequado pode gerar fechamento',
          'Atividades não previstas em lei podem gerar discussões tributárias'
        ],
        tips: [
          'Consulte Código de Posturas Municipal antes de escolher local',
          'Verifique tabela atualizada de alíquotas no site da prefeitura',
          'Para dúvidas sobre enquadramento, procure orientação fiscal',
          'Analise benefícios de diferentes localizações no município',
          'Considere custos totais além do ISS (IPTU, taxas, etc.)'
        ]
      },
      {
        id: 2,
        title: 'Obtenção do Alvará de Funcionamento',
        description: 'Solicite alvará de funcionamento junto à Prefeitura de São José conforme sua atividade',
        substeps: [
          'Acesse portal de serviços da Prefeitura de São José/SC',
          'Verifique documentos exigidos conforme tipo de atividade',
          'Preencha formulário de solicitação de alvará online',
          'Anexe plantas baixas e croqui de localização quando exigidos',
          'Informe dados do estabelecimento: área, estrutura, capacidade',
          'Declare todas as atividades que serão exercidas no local',
          'Pague taxas municipais correspondentes',
          'Aguarde análise técnica e eventual vistoria',
          'Atenda exigências técnicas se solicitadas',
          'Retire alvará após aprovação final'
        ],
        warnings: [
          'Vistoria pode identificar inadequações que impeçam funcionamento',
          'Algumas atividades exigem licenças adicionais (sanitária, ambiental)',
          'Funcionamento sem alvará gera multas e pode levar ao fechamento',
          'Alterações no estabelecimento podem exigir novo alvará',
          'Prazos de validade do alvará variam conforme atividade'
        ],
        tips: [
          'Consulte Plano Diretor para verificar atividades permitidas na zona',
          'Mantenha documentos do imóvel atualizados (IPTU, matrícula)',
          'Para atividades de risco, consulte Corpo de Bombeiros previamente',
          'Considere contratar arquiteto para adequações se necessário',
          'Mantenha contato atualizado para agendamento de vistorias'
        ]
      },
      {
        id: 3,
        title: 'Inscrição no Cadastro Municipal de Contribuintes',
        description: 'Realize inscrição municipal e configure sistema de apuração do ISS',
        substeps: [
          'Acesse sistema de cadastro municipal online',
          'Preencha dados da empresa: razão social, CNPJ, endereço',
          'Informe dados dos sócios e representantes legais',
          'Selecione atividades econômicas sujeitas ao ISS',
          'Declare estimativa de faturamento anual',
          'Escolha regime de apuração: mensal, trimestral ou anual',
          'Configure forma de cálculo: alíquota normal ou beneficiada',
          'Anexe documentos obrigatórios digitalizados',
          'Confirme dados bancários para débito automático se desejar',
          'Submeta requerimento e aguarde análise'
        ],
        warnings: [
          'Dados incorretos podem gerar problemas na apuração do ISS',
          'Estimativa de faturamento influencia obrigações acessórias',
          'Regime de apuração define prazos de recolhimento',
          'Alterações posteriores podem ter limitações',
          'Débito automático requer conta corrente em nome da empresa'
        ],
        tips: [
          'Mantenha backup de todos os comprovantes de protocolo',
          'Anote número da inscrição municipal para controles futuros',
          'Configure lembretes para vencimentos de obrigações',
          'Verifique se há integração com sistema contábil usado',
          'Solicite orientações sobre obrigações específicas da atividade'
        ]
      },
      {
        id: 4,
        title: 'Emissão de Notas Fiscais e Controles Fiscais',
        description: 'Configure sistema de emissão de notas fiscais e implemente controles municipais',
        substeps: [
          'Solicite autorização para emissão de Nota Fiscal Eletrônica (NFSe)',
          'Configure sistema de emissão através de software credenciado',
          'Teste emissão de notas fiscais no ambiente de homologação',
          'Implemente controles de numeração sequencial das notas',
          'Configure cálculo automático do ISS conforme alíquotas',
          'Estabeleça rotinas de backup dos arquivos eletrônicos',
          'Implemente controles de retenção de ISS quando aplicável',
          'Configure relatórios fiscais exigidos pela legislação',
          'Estabeleça rotinas de conciliação entre vendas e notas emitidas',
          'Treine equipe para emissão correta de documentos fiscais'
        ],
        warnings: [
          'Notas fiscais com erro podem ser rejeitadas pelo sistema',
          'Falta de emissão de nota fiscal constitui sonegação',
          'Numeração deve ser rigorosamente sequencial',
          'Retenção indevida de ISS pode gerar multas',
          'Backup inadequado pode resultar em perda de dados fiscais'
        ],
        tips: [
          'Use certificado digital para maior segurança nas emissões',
          'Mantenha sistema sempre atualizado conforme legislação',
          'Estabeleça rotinas de verificação da situação das notas',
          'Configure alertas para problemas na emissão',
          'Mantenha relacionamento próximo com suporte técnico do software'
        ]
      },
      {
        id: 5,
        title: 'Apuração e Recolhimento Mensal do ISS',
        description: 'Estabeleça rotinas de cálculo, apuração e pagamento do ISS municipal',
        substeps: [
          'Apure mensalmente receita de serviços prestados',
          'Calcule ISS devido conforme alíquotas aplicáveis',
          'Considere deduções legais quando permitidas',
          'Verifique retenções de ISS feitas por tomadores',
          'Gere guia de recolhimento através do sistema municipal',
          'Efetue pagamento até o vencimento (dia 10 do mês seguinte)',
          'Mantenha comprovantes de pagamento organizados',
          'Entregue declarações mensais quando exigidas',
          'Concilie valores pagos com escrituração contábil',
          'Acompanhe regularidade da situação fiscal municipal'
        ],
        warnings: [
          'Atraso no pagamento gera multa de 2% + juros + correção',
          'ISS em atraso impede emissão de certidões negativas',
          'Cálculo incorreto pode gerar autuação fiscal',
          'Retenções não compensadas resultam em pagamento duplicado',
          'Declarações em atraso têm multas específicas'
        ],
        tips: [
          'Configure débito automático para evitar esquecimentos',
          'Use planilhas de controle para acompanhar cálculos',
          'Mantenha comprovantes organizados por mês/ano',
          'Revise cálculos antes do vencimento para evitar erros',
          'Consulte situação fiscal regularmente no portal municipal'
        ]
      }
    ],
    legislation: [
      {
        type: 'lei',
        number: '4470',
        year: 2006,
        title: 'Código Tributário Municipal de São José/SC',
        level: 'municipal',
        url: 'https://www.pmsj.sc.gov.br/legislacao'
      },
      {
        type: 'lei',
        number: '116',
        year: 2003,
        title: 'Lista de Serviços Sujeitos ao ISS',
        level: 'federal',
        url: 'http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm'
      }
    ],
    documents: [
      'Contrato social da empresa',
      'Documentos dos sócios (RG, CPF)',
      'Comprovante de endereço do estabelecimento',
      'Alvará de funcionamento',
      'Certidões negativas municipais',
      'Planta baixa do estabelecimento',
      'Licenças específicas conforme atividade'
    ],
    contacts: [
      {
        organ: 'Prefeitura de São José - Secretaria da Fazenda',
        phone: '(48) 3381-9000',
        email: 'fazenda@pmsj.sc.gov.br',
        address: 'Av. Acioni Souza Filho, 2674 - Kobrasol - São José/SC',
        website: 'https://www.pmsj.sc.gov.br',
        level: 'municipal'
      },
      {
        organ: 'Sala do Empreendedor - São José/SC',
        phone: '(48) 3381-9085',
        email: 'empreendedor@pmsj.sc.gov.br',
        address: 'Av. Acioni Souza Filho, 2674 - Kobrasol - São José/SC',
        website: 'https://www.pmsj.sc.gov.br/empreendedor',
        level: 'municipal'
      }
    ]
  }
]

export { additionalGuides }
