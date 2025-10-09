import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get('id')

    console.log('🔍 Government Docs API - ID recebido:', guideId)

    if (!guideId) {
      console.log('❌ ID do guia não fornecido')
      return NextResponse.json(
        { error: 'ID do guia é obrigatório' },
        { status: 400 }
      )
    }

    // Mapeamento de cada guia para sua respectiva legislação e documentos oficiais
    const legislationMap: { [key: string]: {
      title: string
      laws: Array<{
        name: string
        number: string
        year: string
        url: string
        pdfUrl?: string
        type: 'LEI' | 'DECRETO' | 'INSTRUCAO_NORMATIVA' | 'PORTARIA' | 'RESOLUCAO'
      }>
      officialSites: Array<{
        name: string
        url: string
        description: string
      }>
    }} = {
      'cpf-guide': {
        title: 'Cadastro de CPF - Legislação Oficial',
        laws: [
          {
            name: 'Lei nº 4.862/1965 - Criação do CPF',
            number: '4862',
            year: '1965',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l4862.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 64.567/1969 - Regulamenta o CPF',
            number: '64567',
            year: '1969',
            url: 'https://www.planalto.gov.br/ccivil_03/decreto/1950-1969/d64567.htm',
            type: 'DECRETO'
          },
          {
            name: 'Instrução Normativa RFB nº 1.548/2015',
            number: '1548',
            year: '2015',
            url: 'https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=68055',
            type: 'INSTRUCAO_NORMATIVA'
          }
        ],
        officialSites: [
          {
            name: 'Portal da Receita Federal - CPF',
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cpf',
            description: 'Portal oficial da Receita Federal para serviços de CPF'
          },
          {
            name: 'Portal de Serviços - Inscrição no CPF',
            url: 'https://www.gov.br/pt-br/servicos/inscrever-cpf',
            description: 'Serviço online para inscrição no CPF'
          }
        ]
      },
      'mei-guide': {
        title: 'MEI - Legislação Oficial',
        laws: [
          {
            name: 'Lei Complementar nº 123/2006 - Estatuto do MEI',
            number: '123',
            year: '2006',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
            type: 'LEI'
          },
          {
            name: 'Lei Complementar nº 128/2008 - Criação do MEI',
            number: '128',
            year: '2008',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp128.htm',
            type: 'LEI'
          },
          {
            name: 'Resolução CGSN nº 140/2018',
            number: '140',
            year: '2018',
            url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/mei-microempreendedor-individual',
            type: 'RESOLUCAO'
          }
        ],
        officialSites: [
          {
            name: 'Portal do Empreendedor',
            url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor',
            description: 'Portal oficial para formalização e gestão do MEI'
          },
          {
            name: 'Portal do Simples Nacional',
            url: 'http://www8.receita.fazenda.gov.br/simplesnacional/',
            description: 'Portal do Simples Nacional - Receita Federal'
          }
        ]
      },
      'ir-guide': {
        title: 'Declaração de Imposto de Renda PF - Legislação Oficial',
        laws: [
          {
            name: 'Lei nº 5.172/1966 - Código Tributário Nacional',
            number: '5172',
            year: '1966',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 9.580/2018 - Regulamento do IR',
            number: '9580',
            year: '2018',
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/decreto/d9580.htm',
            type: 'DECRETO'
          },
          {
            name: 'Instrução Normativa RFB nº 2.172/2024',
            number: '2172',
            year: '2024',
            url: 'https://normas.receita.fazenda.gov.br/sijut2consulta/consulta.action',
            type: 'INSTRUCAO_NORMATIVA'
          }
        ],
        officialSites: [
          {
            name: 'Portal da Receita Federal - Imposto de Renda',
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda',
            description: 'Portal oficial da Receita Federal para Imposto de Renda'
          },
          {
            name: 'Centro Virtual de Atendimento - e-CAC',
            url: 'https://cav.receita.fazenda.gov.br/autenticacao/login',
            description: 'Centro Virtual de Atendimento da Receita Federal'
          }
        ]
      },
      'itr-guide': {
        title: 'ITR - Imposto Territorial Rural - Legislação Oficial',
        laws: [
          {
            name: 'Lei nº 9.393/1996 - ITR',
            number: '9393',
            year: '1996',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l9393.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 4.382/2002 - Regulamento do ITR',
            number: '4382',
            year: '2002',
            url: 'https://www.planalto.gov.br/ccivil_03/decreto/2002/d4382.htm',
            type: 'DECRETO'
          },
          {
            name: 'Instrução Normativa RFB nº 1.562/2015',
            number: '1562',
            year: '2015',
            url: 'https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=68398',
            type: 'INSTRUCAO_NORMATIVA'
          }
        ],
        officialSites: [
          {
            name: 'Portal da Receita Federal - ITR',
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/itr',
            description: 'Portal oficial da Receita Federal para ITR'
          },
          {
            name: 'Sistema Nacional de Cadastro Rural',
            url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/snci',
            description: 'Sistema Nacional de Cadastro de Imóveis Rurais'
          }
        ]
      },
      'cnpj-guide': {
        title: 'Abertura de CNPJ - Legislação Oficial',
        laws: [
          {
            name: 'Lei nº 8.934/1994 - Registro Público de Empresas',
            number: '8934',
            year: '1994',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l8934.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 1.800/1996 - Regulamenta a Lei 8.934/94',
            number: '1800',
            year: '1996',
            url: 'https://www.planalto.gov.br/ccivil_03/decreto/d1800.htm',
            type: 'DECRETO'
          },
          {
            name: 'Instrução Normativa DREI nº 81/2020',
            number: '81',
            year: '2020',
            url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/entenda-as-diferencas/microempresa-e-empresa-de-pequeno-porte',
            type: 'INSTRUCAO_NORMATIVA'
          }
        ],
        officialSites: [
          {
            name: 'Portal Redesim',
            url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim',
            description: 'Rede Nacional para a Simplificação do Registro e da Legalização de Empresas'
          },
          {
            name: 'Portal da Receita Federal - CNPJ',
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cnpj',
            description: 'Portal oficial da Receita Federal para CNPJ'
          }
        ]
      },
      'esocial-guide': {
        title: 'e-Social Doméstico - Legislação Oficial',
        laws: [
          {
            name: 'Lei Complementar nº 150/2015 - Trabalho Doméstico',
            number: '150',
            year: '2015',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp150.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 8.854/2016 - e-Social Doméstico',
            number: '8854',
            year: '2016',
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8854.htm',
            type: 'DECRETO'
          },
          {
            name: 'Portaria MF nº 1.099/2017',
            number: '1099',
            year: '2017',
            url: 'https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais',
            type: 'PORTARIA'
          }
        ],
        officialSites: [
          {
            name: 'Portal e-Social Doméstico',
            url: 'https://www.gov.br/esocial/pt-br/acesso-ao-sistema/empregador-domestico',
            description: 'Portal oficial do e-Social para empregadores domésticos'
          },
          {
            name: 'Portal Gov.br - Trabalho Doméstico',
            url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/trabalho-domestico',
            description: 'Informações oficiais sobre trabalho doméstico'
          }
        ]
      },
      'alvara-municipal': {
        title: 'Alvará de Funcionamento Municipal - Legislação Base',
        laws: [
          {
            name: 'Lei nº 8.666/1993 - Licitações e Contratos',
            number: '8666',
            year: '1993',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l8666cons.htm',
            type: 'LEI'
          },
          {
            name: 'Lei Complementar nº 123/2006 - Estatuto Nacional da ME e EPP',
            number: '123',
            year: '2006',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto Federal nº 9.094/2017 - Redesim',
            number: '9094',
            year: '2017',
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9094.htm',
            type: 'DECRETO'
          }
        ],
        officialSites: [
          {
            name: 'Portal Redesim',
            url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim',
            description: 'Rede Nacional para Simplificação do Registro e Legalização de Empresas'
          },
          {
            name: 'Portal CNM - Confederação Nacional de Municípios',
            url: 'https://www.cnm.org.br/',
            description: 'Orientações para municípios sobre licenciamento'
          }
        ]
      },
      'iss-municipal': {
        title: 'ISS - Imposto sobre Serviços - Legislação Oficial',
        laws: [
          {
            name: 'Lei Complementar nº 116/2003 - ISS',
            number: '116',
            year: '2003',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 6.603/2008 - Regulamenta LC 116/2003',
            number: '6603',
            year: '2008',
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6603.htm',
            type: 'DECRETO'
          },
          {
            name: 'Lei Complementar nº 157/2016 - Altera LC 116/2003',
            number: '157',
            year: '2016',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp157.htm',
            type: 'LEI'
          }
        ],
        officialSites: [
          {
            name: 'Portal da Transparência - ISS',
            url: 'https://www.gov.br/economia/pt-br/assuntos/planejamento-e-orcamento/plano-plurianual-ppa',
            description: 'Informações sobre tributos municipais'
          },
          {
            name: 'Confederação Nacional de Municípios',
            url: 'https://www.cnm.org.br/areas-de-atuacao/tributario',
            description: 'Orientações municipais sobre ISS'
          }
        ]
      },
      'icms-estadual': {
        title: 'ICMS - Imposto sobre Circulação de Mercadorias - Legislação Oficial',
        laws: [
          {
            name: 'Lei Complementar nº 87/1996 - Lei Kandir',
            number: '87',
            year: '1996',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
            type: 'LEI'
          },
          {
            name: 'Decreto nº 7.212/2010 - Regulamenta LC 87/96',
            number: '7212',
            year: '2010',
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/decreto/d7212.htm',
            type: 'DECRETO'
          },
          {
            name: 'Convênio ICMS 142/2018 - Ajuste SINIEF',
            number: '142',
            year: '2018',
            url: 'https://www.confaz.fazenda.gov.br/legislacao/convenios',
            type: 'DECRETO'
          }
        ],
        officialSites: [
          {
            name: 'CONFAZ - Conselho Nacional de Política Fazendária',
            url: 'https://www.confaz.fazenda.gov.br/',
            description: 'Portal oficial para legislação de ICMS'
          },
          {
            name: 'Portal Nacional da NF-e',
            url: 'http://www.nfe.fazenda.gov.br/',
            description: 'Sistema Nacional de Nota Fiscal Eletrônica'
          }
        ]
      }
    }

    const legislation = legislationMap[guideId]
    if (!legislation) {
      return NextResponse.json(
        { error: 'Guia não encontrado' },
        { status: 404 }
      )
    }

    console.log('📋 Legislação encontrada:', legislation.title)

    // Para ambientes serverless (como Netlify), vamos simplificar e retornar URLs diretas
    // sem fazer chamadas externas que podem causar timeout
    const enrichedLaws = legislation.laws.map((law) => {
      // Aplicar transformações de URL conhecidas sem fazer fetch
      let pdfUrl = law.url

      // Para URLs do Planalto, tentar versão PDF
      if (law.url.includes('planalto.gov.br') && law.url.includes('.htm')) {
        const potentialPdfUrl = law.url.replace('.htm', '.pdf')
        // Para leis antigas, usar URL HTML original (mais confiável)
        pdfUrl = law.year < '2000' ? law.url : potentialPdfUrl
      }

      // Para URLs da Receita Federal
      if (law.url.includes('normas.receita.fazenda.gov.br') && law.url.includes('idAto=')) {
        const idMatch = law.url.match(/idAto=(\d+)/)
        if (idMatch) {
          // Fornecer ambas as opções - PDF e HTML
          pdfUrl = `https://normas.receita.fazenda.gov.br/sijut2consulta/download.action?idAto=${idMatch[1]}&formato=pdf`
        }
      }

      console.log(`📄 ${law.name}: ${law.url} -> ${pdfUrl}`)

      return {
        ...law,
        pdfUrl: pdfUrl
      }
    })

    console.log('✅ Retornando dados processados com sucesso')

    const response = NextResponse.json({
      success: true,
      data: {
        ...legislation,
        laws: enrichedLaws
      }
    })

    // Adicionar headers para melhor performance e cache
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response

  } catch (error) {
    console.error('❌ Erro ao buscar documentos governamentais:', error)

    const errorResponse = NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )

    // Adicionar headers CORS mesmo para erro
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')

    return errorResponse
  }
}

// Adicionar suporte para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}