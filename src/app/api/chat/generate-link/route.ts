import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, expirationHours = 24 } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome do link é obrigatório' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expirationHours)

    // Generate full URL with token and expiration encoded
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const expiresAtTimestamp = expiresAt.getTime()
    const linkUrl = `${baseUrl}?chat_token=${token}&expires=${expiresAtTimestamp}`

    console.log('✅ Link gerado com sucesso:', {
      name,
      token: token.substring(0, 10) + '...',
      expiresAt: expiresAt.toISOString()
    })

    return NextResponse.json({
      success: true,
      link: {
        url: linkUrl,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in generate-link API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
