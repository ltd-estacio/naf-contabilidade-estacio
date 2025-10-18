import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Services Stats API - Iniciando cálculo de estatísticas reais')

    // 1. Buscar todos os serviços NAF
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('naf_services')
      .select('*')
      .eq('status', 'ativo')

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError)
      throw servicesError
    }

    console.log(`🛠️ Encontrados ${services?.length || 0} serviços NAF`)

    // 2. Buscar solicitações reais da tabela fiscal_appointments
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('fiscal_appointments')
      .select('service_type, service_title, created_at, status')

    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError)
    }

    console.log(`📋 Encontrados ${appointments?.length || 0} agendamentos fiscais`)

    // 3. Verificar se existe tabela de avaliações e buscar dados reais
    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from('service_ratings')
      .select('service_id, rating, created_at')

    const hasRatingsTable = !ratingsError
    console.log(`⭐ Tabela de avaliações ${hasRatingsTable ? 'encontrada' : 'não encontrada'}`)

    // 3.1. Se tabela existe, calcular ratings reais por serviço
    const realRatingAverages: { [key: string]: number } = {}
    if (hasRatingsTable && ratings) {
      console.log(`⭐ Encontradas ${ratings.length} avaliações registradas`)

      // Agrupar e calcular média por service_id
      const ratingsByService: { [key: string]: number[] } = {}
      for (const rating of ratings) {
        const serviceId = rating.service_id
        if (!ratingsByService[serviceId]) {
          ratingsByService[serviceId] = []
        }
        ratingsByService[serviceId].push(rating.rating)
      }

      // Calcular médias
      for (const [serviceId, serviceRatings] of Object.entries(ratingsByService)) {
        const average = serviceRatings.reduce((sum, r) => sum + r, 0) / serviceRatings.length
        realRatingAverages[serviceId] = Math.round(average * 10) / 10
      }

      console.log(`📊 Ratings reais por serviço:`, realRatingAverages)
    }

    // 4. Verificar se existe tabela de visualizações e buscar dados reais
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('service_views')
      .select('service_id, created_at')

    const hasViewsTable = !viewsError
    console.log(`👁️ Tabela de visualizações ${hasViewsTable ? 'encontrada' : 'não encontrada'}`)

    // 4.1. Se tabela existe, buscar contagem real de views por serviço
    const realViewCounts: { [key: string]: number } = {}
    if (hasViewsTable && views) {
      console.log(`📊 Encontradas ${views.length} visualizações registradas`)

      // Contar views por service_id
      for (const view of views) {
        const serviceId = view.service_id
        realViewCounts[serviceId] = (realViewCounts[serviceId] || 0) + 1
      }

      console.log(`📈 Views reais por serviço:`, realViewCounts)
    }

    // 5. Calcular estatísticas por serviço
    const serviceStats = services?.map(service => {
      // Mapear nome do serviço para service_type dos agendamentos
      const serviceTypeMapping: { [key: string]: string[] } = {
        'Declaração de Imposto de Renda': ['IR', 'declaracao_ir', 'Declaração de Imposto de Renda'],
        'Cadastro e Regularização de CPF': ['CPF', 'Cadastro de CPF - Guia Completo'],
        'Orientação MEI': ['MEI', 'MEI - Formalização e Gestão'],
        'Abertura de Empresa': ['abertura_empresa', 'Abertura de Empresa'],
        'E-Social Doméstico': ['esocial_domestico', 'E-Social Doméstico'],
        'Certidões Negativas': ['certidoes_negativas', 'Certidões Negativas'],
        'Parcelamento de Débitos': ['parcelamento_debitos', 'Parcelamento de Débitos'],
        'Orientação Previdenciária': ['orientacao_previdenciaria', 'Orientação Previdenciária'],
        'Planejamento Tributário Pessoal': ['planejamento_tributario', 'Planejamento Tributário Pessoal'],
        'Orientação Fiscal para ONGs': ['orientacao_ongs', 'Orientação Fiscal para ONGs']
      }

      const possibleTypes = serviceTypeMapping[service.name] || [service.name]

      // Contar solicitações reais
      const realRequests = appointments?.filter(apt =>
        possibleTypes.some(type =>
          apt.service_type === type ||
          apt.service_title === type ||
          apt.service_type?.toLowerCase().includes(type.toLowerCase()) ||
          apt.service_title?.toLowerCase().includes(service.name.toLowerCase())
        )
      ).length || 0

      // Usar views reais se disponíveis, senão usar mock
      const realViews = realViewCounts[service.id] || 0
      const useRealViews = hasViewsTable && realViews > 0

      // Usar ratings reais se disponíveis, senão usar mock
      const realRating = realRatingAverages[service.id] || 0
      const useRealRating = hasRatingsTable && realRating > 0

      return {
        ...service,
        // Usar dados reais de visualizações se disponível, senão manter mock
        views_count: useRealViews ? realViews : service.views_count,
        // Usar dados reais de solicitações
        requests_count: realRequests,
        // Usar dados reais de satisfação se disponível, senão manter mock
        satisfaction_rating: useRealRating ? realRating : service.satisfaction_rating,
        // Adicionar metadados sobre fonte dos dados
        data_source: {
          views: useRealViews ? 'real' : 'mock',
          requests: 'real',
          satisfaction: useRealRating ? 'real' : 'mock'
        }
      }
    }) || []

    // 6. Calcular totais
    const totalServices = serviceStats.length
    const totalViews = serviceStats.reduce((sum, s) => sum + (s.views_count || 0), 0)
    const totalRequests = serviceStats.reduce((sum, s) => sum + (s.requests_count || 0), 0)
    const avgSatisfaction = serviceStats.length > 0
      ? serviceStats.reduce((sum, s) => sum + (s.satisfaction_rating || 0), 0) / serviceStats.length
      : 0

    const result = {
      services: serviceStats,
      totals: {
        services: totalServices,
        views: totalViews,
        requests: totalRequests,
        satisfaction: Math.round(avgSatisfaction * 10) / 10
      },
      metadata: {
        hasRatingsTable,
        hasViewsTable,
        appointmentsCount: appointments?.length || 0,
        dataSource: 'mixed', // Indica que alguns dados são reais e outros mock
        generatedAt: new Date().toISOString()
      }
    }

    console.log('✅ Services Stats calculadas:', {
      services: totalServices,
      totalViews,
      totalRequests,
      avgSatisfaction: result.totals.satisfaction
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Erro no Services Stats API:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}