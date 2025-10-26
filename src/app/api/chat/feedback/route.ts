import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Salvar feedback do chat
export async function POST(request: NextRequest) {
  try {
    const { conversation_id, user_id, rating, feedback_text, coordinator_id } = await request.json()

    if (!conversation_id || !user_id || !rating) {
      return NextResponse.json(
        { error: 'conversation_id, user_id e rating são obrigatórios' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating deve estar entre 1 e 5' },
        { status: 400 }
      )
    }

    // Verificar se já existe feedback para esta conversa
    const { data: existingFeedback } = await supabase
      .from('chat_feedback')
      .select('id')
      .eq('conversation_id', conversation_id)
      .eq('user_id', user_id)
      .single()

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback já foi enviado para esta conversa' },
        { status: 409 }
      )
    }

    // Salvar feedback
    const { data: feedback, error } = await supabase
      .from('chat_feedback')
      .insert({
        conversation_id,
        user_id,
        rating,
        feedback_text: feedback_text || null,
        coordinator_id
      })
      .select()
      .single()

    if (error) throw error

    // Adicionar mensagem de agradecimento
    let thankYouMessage = `⭐ **Obrigado pela sua avaliação!**\n\nVocê avaliou nosso atendimento com ${rating} estrela${rating > 1 ? 's' : ''}${rating === 5 ? ' ⭐⭐⭐⭐⭐' : rating === 4 ? ' ⭐⭐⭐⭐' : rating === 3 ? ' ⭐⭐⭐' : rating === 2 ? ' ⭐⭐' : ' ⭐'}`

    if (feedback_text) {
      thankYouMessage += `\n\n💬 **Seu comentário:** "${feedback_text}"`
    }

    thankYouMessage += '\n\nSua opinião é muito importante para melhorarmos nossos serviços!\n\n📞 **Precisa de mais alguma coisa?**\nLigue para (48) 98461-4449 ou inicie um novo chat.'

    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id,
        content: thankYouMessage,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        is_ai_response: false,
        is_read: true
      })

    if (msgError) throw msgError

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Feedback salvo com sucesso'
    })

  } catch (error) {
    console.error('Erro ao salvar feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar feedbacks (para coordenadores)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coordinatorId = searchParams.get('coordinator_id')
    const conversationId = searchParams.get('conversation_id')

    let query = supabase
      .from('chat_feedback')
      .select(`
        *,
        conversation:chat_conversations(
          id,
          user_name,
          user_email,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })

    if (coordinatorId) {
      query = query.eq('coordinator_id', coordinatorId)
    }

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    const { data: feedbacks, error } = await query

    if (error) throw error

    // Calcular estatísticas
    const totalFeedbacks = feedbacks?.length || 0
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0

    const ratingDistribution = {
      1: feedbacks?.filter(f => f.rating === 1).length || 0,
      2: feedbacks?.filter(f => f.rating === 2).length || 0,
      3: feedbacks?.filter(f => f.rating === 3).length || 0,
      4: feedbacks?.filter(f => f.rating === 4).length || 0,
      5: feedbacks?.filter(f => f.rating === 5).length || 0,
    }

    return NextResponse.json({
      feedbacks,
      statistics: {
        total: totalFeedbacks,
        averageRating: Math.round(averageRating * 100) / 100,
        distribution: ratingDistribution
      }
    })

  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}