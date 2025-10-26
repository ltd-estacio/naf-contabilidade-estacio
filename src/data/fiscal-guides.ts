export type LegislationScope = 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL'

export interface LegislationItem {
  id: string
  title: string
  description: string
  scope: LegislationScope
  category: string
  lastUpdated: string
  steps?: string[]
  documents?: string[]
  url?: string
}

export const FEDERAL_GUIDES: LegislationItem[] = [
  {
    id: 'cpf-guide',
    title: 'Cadastro de CPF - Guia Completo',
    description: 'Procedimentos para inscrição, alteração e regularização do CPF, incluindo documentação obrigatória.',
    scope: 'FEDERAL',
    category: 'Cadastros',
    lastUpdated: '2024-01-15',
    steps: [
      'Verificar se possui documentos necessários',
      'Acessar o portal da Receita Federal',
      'Preencher formulário online ou presencial',
      'Aguardar processamento e emissão'
    ],
    documents: [
      'Certidão de nascimento ou casamento',
      'RG ou documento oficial com foto',
      'Título de eleitor (se maior de 18 anos)',
      'Comprovante de residência'
    ]
  },
  {
    id: 'mei-guide',
    title: 'MEI - Formalização e Gestão',
    description: 'Como abrir, gerir e cumprir as obrigações do Microempreendedor Individual (MEI).',
    scope: 'FEDERAL',
    category: 'Microempreendedor',
    lastUpdated: '2024-01-10',
    steps: [
      'Verificar atividades permitidas no MEI',
      'Acessar o Portal do Empreendedor',
      'Preencher dados pessoais e da atividade',
      'Obter CNPJ e licenças municipais',
      'Emitir DAS mensalmente'
    ],
    documents: [
      'CPF',
      'RG',
      'Comprovante de residência',
      'Título de eleitor'
    ]
  },
  {
    id: 'ir-guide',
    title: 'Declaração de Imposto de Renda PF',
    description: 'Orientações completas para a declaração anual do Imposto de Renda da Pessoa Física.',
    scope: 'FEDERAL',
    category: 'Imposto de Renda',
    lastUpdated: '2024-02-01',
    steps: [
      'Verificar obrigatoriedade de declarar',
      'Reunir documentos de rendimentos',
      'Baixar programa IRPF da Receita',
      'Preencher cada ficha do programa',
      'Transmitir declaração'
    ],
    documents: [
      'Informes de rendimentos',
      'Comprovantes de despesas médicas',
      'Comprovantes de despesas educacionais',
      'Documentos dos dependentes'
    ]
  },
  {
    id: 'itr-guide',
    title: 'ITR - Imposto Territorial Rural',
    description: 'Passo a passo para declarar o ITR referente às propriedades rurais.',
    scope: 'FEDERAL',
    category: 'Rural',
    lastUpdated: '2024-01-20',
    steps: [
      'Verificar obrigatoriedade de declarar',
      'Reunir documentos da propriedade',
      'Calcular área total e aproveitável',
      'Preencher DITR online',
      'Transmitir e pagar se devido'
    ],
    documents: [
      'Escritura do imóvel',
      'CNIR (se houver)',
      'Comprovantes de benfeitorias',
      'Documento de área'
    ]
  },
  {
    id: 'cnpj-guide',
    title: 'Abertura de CNPJ',
    description: 'Procedimentos para constituição de pessoa jurídica e obtenção de licenças.',
    scope: 'FEDERAL',
    category: 'Empresarial',
    lastUpdated: '2024-01-05',
    steps: [
      'Consultar viabilidade do nome',
      'Elaborar contrato social',
      'Registrar na Junta Comercial',
      'Inscrever na Receita Federal',
      'Obter licenças municipais'
    ],
    documents: [
      'Contrato social',
      'CPF e RG dos sócios',
      'Comprovante de endereço',
      'Consulta de viabilidade'
    ]
  },
  {
    id: 'esocial-guide',
    title: 'eSocial Doméstico',
    description: 'Cadastro e gestão de empregados domésticos pelo eSocial.',
    scope: 'FEDERAL',
    category: 'Trabalhista',
    lastUpdated: '2024-01-12',
    steps: [
      'Cadastrar empregador no eSocial',
      'Cadastrar empregado doméstico',
      'Enviar evento de admissão',
      'Gerar guia DAE mensalmente',
      'Enviar folha de pagamento'
    ],
    documents: [
      'CPF do empregador',
      'Dados do empregado',
      'Contrato de trabalho',
      'Exames médicos'
    ]
  }
]

export const MUNICIPAL_GUIDES: LegislationItem[] = [
  {
    id: 'alvara-municipal',
    title: 'Alvará de Funcionamento Municipal',
    description: 'Como obter a licença municipal de funcionamento para empresas.',
    scope: 'MUNICIPAL',
    category: 'Licenças',
    lastUpdated: '2024-01-08',
    steps: [
      'Consultar código de atividade municipal',
      'Verificar zoneamento do local',
      'Reunir documentação exigida',
      'Protocolar pedido na prefeitura',
      'Aguardar vistoria e aprovação'
    ],
    documents: [
      'CNPJ ou CPF',
      'Contrato de locação ou escritura',
      'Projeto arquitetônico (se exigido)',
      'Auto de vistoria do corpo de bombeiros'
    ]
  },
  {
    id: 'iss-municipal',
    title: 'ISS - Imposto sobre Serviços',
    description: 'Entenda as regras principais do ISS para prestadores de serviços.',
    scope: 'MUNICIPAL',
    category: 'Tributos Municipais',
    lastUpdated: '2024-01-15',
    steps: [
      'Identificar local de prestação do serviço',
      'Verificar alíquota aplicável',
      'Emitir nota fiscal de serviço',
      'Calcular imposto devido',
      'Recolher até o vencimento'
    ],
    documents: [
      'Inscrição municipal',
      'Notas fiscais emitidas',
      'Livro de registro de serviços',
      'Guias de recolhimento'
    ]
  }
]

export const STATE_GUIDES: LegislationItem[] = [
  {
    id: 'icms-estadual',
    title: 'ICMS - Imposto sobre Circulação de Mercadorias',
    description: 'Principais obrigações e rotinas para contribuintes do ICMS.',
    scope: 'ESTADUAL',
    category: 'Tributos Estaduais',
    lastUpdated: '2024-01-10',
    steps: [
      'Verificar enquadramento no regime',
      'Emitir notas fiscais corretamente',
      'Escriturar livros fiscais',
      'Apurar ICMS mensalmente',
      'Transmitir obrigações acessórias'
    ],
    documents: [
      'Inscrição estadual',
      'Notas fiscais de entrada e saída',
      'Livros fiscais',
      'SPED Fiscal'
    ]
  }
]

export const ALL_GUIDES: LegislationItem[] = [
  ...FEDERAL_GUIDES,
  ...STATE_GUIDES,
  ...MUNICIPAL_GUIDES
]
