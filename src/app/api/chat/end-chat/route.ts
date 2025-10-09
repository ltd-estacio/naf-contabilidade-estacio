import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Finalizar chat
export async function POST(request: NextRequest) {
  try {
    const { conversation_id, ended_by, coordinator_id, coordinator_name } = await request.json()

    if (!conversation_id || !ended_by) {
      return NextResponse.json(
        { error: 'conversation_id e ended_by são obrigatórios' },
        { status: 400 }
      )
    }

    // Finalizar o chat
    const { data: conversation, error } = await supabaseAdmin
      .from('chat_conversations')
      .update({
        status: 'ended',
        chat_ended_by: ended_by,
        chat_ended_at: new Date().toISOString()
      })
      .eq('id', conversation_id)
      .select()
      .single()

    if (error) throw error

    // Adicionar mensagem de finalização
    let endMessage = ''
    if (ended_by === 'coordinator') {
      endMessage = `👋 **Chat finalizado por ${coordinator_name || 'Coordenador'}**\n\nObrigado por usar nossos serviços! Esperamos ter ajudado você.\n\n**Por favor, avalie nosso atendimento:**`
    } else {
      endMessage = '👋 **Chat finalizado pelo cliente**\n\nObrigado por usar nossos serviços!\n\n**Por favor, avalie nosso atendimento:**'
    }

    const { error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id,
        content: endMessage,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        is_ai_response: false,
        is_read: true
      })

    if (msgError) throw msgError

    return NextResponse.json({
      success: true,
      conversation,
      message: 'Chat finalizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao finalizar chat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}