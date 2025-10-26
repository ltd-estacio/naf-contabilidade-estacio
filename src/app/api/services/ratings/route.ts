import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { service_id, rating, comment = null, user_id = null, user_name = null } = await request.json()

    if (!service_id || !rating) {
      return NextResponse.json(
        { error: 'service_id e rating são obrigatórios' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    console.log('⭐ Registrando avaliação do serviço:', service_id, 'Rating:', rating)

    // First, check if service_ratings table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from('service_ratings')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.log('📋 Tabela service_ratings não existe. Para este demo, vou simular ratings usando dados mock.')
      console.log('ℹ️ Em produção, a tabela seria criada pelo administrador do banco de dados.')

      // For now, we'll just return a mock response
      return NextResponse.json({
        message: 'Avaliação simulada registrada (tabela service_ratings não existe)',
        note: 'Para avaliações reais, a tabela service_ratings precisa ser criada no banco',
        mock_rating_id: 'simulated_rating_' + Date.now(),
        rating,
        service_id
      })
    }

    // Insert the rating record
    const { data, error } = await supabaseAdmin
      .from('service_ratings')
      .insert({
        service_id,
        rating,
        comment,
        user_id,
        user_name
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao registrar avaliação:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar avaliação', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Avaliação registrada:', data.id, 'Rating:', rating)

    return NextResponse.json({
      message: 'Avaliação registrada com sucesso',
      rating_id: data.id,
      rating: data.rating
    })

  } catch (error) {
    console.error('💥 Erro no registro de avaliação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service_id = searchParams.get('service_id')

    if (!service_id) {
      return NextResponse.json(
        { error: 'service_id é obrigatório' },
        { status: 400 }
      )
    }

    // Get ratings for the specific service
    const { data: ratings, error } = await supabaseAdmin
      .from('service_ratings')
      .select('rating, comment, user_name, created_at')
      .eq('service_id', service_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar avaliações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações', details: error.message },
        { status: 500 }
      )
    }

    // Calculate average rating
    const averageRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    return NextResponse.json({
      service_id,
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      total_ratings: ratings?.length || 0,
      ratings: ratings || []
    })

  } catch (error) {
    console.error('💥 Erro ao buscar avaliações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}