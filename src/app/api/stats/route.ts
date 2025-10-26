import { NextRequest, NextResponse } from 'next/server'
import { getHomeStats } from '@/lib/homeStats'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Home Stats API - Iniciando busca de dados públicos')

    const { stats: finalStats, breakdown } = await getHomeStats()

    console.log('✅ Home Stats API - Estatísticas finais:', finalStats)

    return NextResponse.json({
      success: true,
      data: finalStats,
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: 'Supabase - Dados Reais',
        breakdown
      }
    })

  } catch (error) {
    console.error('❌ Erro na Home Stats API:', error)

    // Retornar dados fallback em caso de erro
    return NextResponse.json({
      success: false,
      data: {
        totalAttendances: 2000,
        userSatisfaction: 95,
        availableServices: 21,
        onlineSupport: '24h',
        activeCoordinators: 3,
        fiscalCompleted: 0,
        sslEnabled: true
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: 'Fallback Data',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    })
  }
}
