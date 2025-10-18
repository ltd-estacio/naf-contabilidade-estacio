import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get('id')

    if (!guideId) {
      return NextResponse.json(
        { error: 'ID do guia é obrigatório' },
        { status: 400 }
      )
    }

    // Mapear IDs para nomes de arquivos
    const fileMap: { [key: string]: string } = {
      'cpf-guide': 'cadastro-cpf.pdf',
      'mei-guide': 'mei-formalizacao.pdf',
      'ir-guide': 'declaracao-ir-pf.pdf',
      'itr-guide': 'itr-territorial-rural.pdf',
      'cnpj-guide': 'abertura-cnpj.pdf',
      'esocial-guide': 'esocial-domestico.pdf',
      'alvara-municipal': 'alvara-funcionamento.pdf',
      'iss-municipal': 'iss-servicos.pdf',
      'icms-estadual': 'icms-mercadorias.pdf'
    }

    const fileName = fileMap[guideId]
    if (!fileName) {
      return NextResponse.json(
        { error: 'Guia não encontrado' },
        { status: 404 }
      )
    }

    const filePath = join(process.cwd(), 'src', 'guia-fiscal', fileName)

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Arquivo PDF não encontrado' },
        { status: 404 }
      )
    }

    // Ler o arquivo
    const fileBuffer = readFileSync(filePath)

    // Retornar o arquivo como resposta
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Erro ao fazer download do guia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}