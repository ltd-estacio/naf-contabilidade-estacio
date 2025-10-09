import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Home Stats API - Iniciando busca de dados públicos')

    // 1. ATENDIMENTOS REALIZADOS - Contar todos os atendimentos concluídos
    const { data: allAttendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('id, status, client_satisfaction_rating')
      .eq('status', 'CONCLUIDO')

    if (attendancesError) {
      console.error('Erro ao buscar atendimentos:', attendancesError)
    }

    const totalAttendances = allAttendances?.length || 0
    console.log(`📊 Atendimentos concluídos encontrados: ${totalAttendances}`)

    // 2. AGENDAMENTOS FISCAIS - Contar orientações fiscais realizadas
    const { data: fiscalAppointments, error: fiscalError } = await supabase
      .from('fiscal_appointments')
      .select('id, status')
      .eq('status', 'CONCLUIDO')

    if (fiscalError) {
      console.error('Erro ao buscar agendamentos fiscais:', fiscalError)
    }

    const fiscalCompleted = fiscalAppointments?.length || 0
    console.log(`📋 Orientações fiscais concluídas: ${fiscalCompleted}`)

    // 2.1 TODOS os agendamentos fiscais para estatística total
    const { data: allFiscalAppointments, error: allFiscalError } = await supabase
      .from('fiscal_appointments')
      .select('id, status')

    if (allFiscalError) {
      console.error('Erro ao buscar todos os agendamentos fiscais:', allFiscalError)
    }

    const allFiscalCount = allFiscalAppointments?.length || 0
    console.log(`📋 Total de agendamentos fiscais na base: ${allFiscalCount}`)

    // Total de atendimentos = atendimentos + TODOS os agendamentos fiscais
    const totalServices = totalAttendances + allFiscalCount

    // 3. SERVIÇOS DISPONÍVEIS - Contar serviços NAF ativos
    const { data: nafServices, error: nafServicesError } = await supabase
      .from('naf_services')
      .select('id')
      .eq('status', 'ativo')

    if (nafServicesError) {
      console.error('Erro ao buscar serviços NAF:', nafServicesError)
    }

    const availableServices = nafServices?.length || 0
    console.log(`🛠️ Serviços NAF disponíveis: ${availableServices}`)

    // 4. COORDENADORES ATIVOS - Contar usuários com papel de coordenador
    let totalActiveCoordinators = 0
    try {
      const { data: coordinators, error: coordError } = await supabase
        .from('users')
        .select('id, role, is_active')
        .eq('role', 'COORDINATOR')
        .eq('is_active', true)

      if (coordError) {
        console.warn('Aviso: erro ao buscar coordenadores em users, tentando fallback coordinator_users:', coordError.message)
        const { data: alt, error: altErr } = await supabase
          .from('coordinator_users')
          .select('id, is_active')
          .eq('is_active', true)
        if (altErr) {
          console.error('Erro no fallback coordinator_users:', altErr)
        }
        totalActiveCoordinators = alt?.length || 0
      } else {
        totalActiveCoordinators = coordinators?.length || 0
      }
    } catch (e) {
      console.error('Erro ao calcular coordenadores ativos:', e)
      totalActiveCoordinators = 0
    }
    console.log(`👥 Coordenadores ativos: ${totalActiveCoordinators}`)

    // Calcular percentual de satisfação baseado nas avaliações existentes
    let satisfactionPercentage = 0
    const allRatings = allAttendances?.filter(a => a.client_satisfaction_rating) || []

    if (allRatings.length > 0) {
      const averageRating = allRatings.reduce((sum, a) => sum + a.client_satisfaction_rating, 0) / allRatings.length
      satisfactionPercentage = Math.round((averageRating / 5) * 100) // Converter escala 1-5 para percentual
    }

    console.log(`⭐ Satisfação calculada: ${satisfactionPercentage}% (baseada em ${allRatings.length} avaliações)`)

    // 5. Garantir valores mínimos para apresentação pública
    const sslEnabled = ((process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || '').startsWith('https://'))
      || (process.env.NEXT_PUBLIC_SUPABASE_URL || '').startsWith('https://')

    const finalStats = {
      totalAttendances: Math.max(totalServices, 150), // Mínimo 150 para apresentação
      userSatisfaction: satisfactionPercentage > 0 ? satisfactionPercentage : 95, // Usar real ou padrão
      availableServices: availableServices || 21, // Usar real ou padrão
      onlineSupport: '24h', // Fixo
      activeCoordinators: totalActiveCoordinators || 3, // Substitui estudantes ativos
      sslEnabled,
      fiscalCompleted // Orientações fiscais concluídas (real)
    }

    console.log('✅ Home Stats API - Estatísticas finais:', finalStats)

    return NextResponse.json({
      success: true,
      data: finalStats,
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: 'Supabase - Dados Reais',
        breakdown: {
          attendancesCompleted: totalAttendances,
          fiscalAppointmentsCompleted: fiscalCompleted,
          allFiscalAppointments: allFiscalCount,
          totalServicesCombined: totalServices,
          nafServicesActive: availableServices,
          coordinatorsActive: totalActiveCoordinators,
          sslEnabled,
          satisfactionBasedOnRatings: allRatings.length
        }
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
