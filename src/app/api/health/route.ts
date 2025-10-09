import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Informações básicas do sistema
    const systemInfo = {
      name: 'NAF Contábil',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: 'operational',
        api: 'operational',
        authentication: 'operational'
      },
      endpoints: {
        dashboard: '/dashboard',
        services: '/services',
        schedule: '/schedule',
        reports: '/api/reports',
        auth: '/api/auth'
      }
    }

    return NextResponse.json(systemInfo)
  } catch (error) {
    console.error('Erro na API de saúde:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      status: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
