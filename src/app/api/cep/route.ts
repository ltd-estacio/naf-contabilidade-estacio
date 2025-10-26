import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cep = searchParams.get('cep')

    if (!cep) {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      )
    }

    // Remove formatting from CEP (keep only digits)
    const cleanCep = cep.replace(/\D/g, '')

    // Validate CEP format (must be 8 digits)
    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP deve conter 8 dígitos' },
        { status: 400 }
      )
    }

    // Fetch address data from ViaCEP API
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar CEP' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Check if CEP was not found
    if (data.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    // Return formatted address data
    return NextResponse.json({
      zipcode: cep, // Return with original formatting
      street: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    })
  } catch (error) {
    console.error('Error fetching CEP:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar CEP' },
      { status: 500 }
    )
  }
}
