import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Buscar chats aceitos por um coordenador
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coordinatorId = searchParams.get('coordinator_id')

    if (!coordinatorId) {
      return NextResponse.json(
        { error: 'coordinator_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar conversas aceitas por este coordenador
    const { data: conversations, error } = await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .eq('chat_accepted_by', coordinatorId)
      .eq('status', 'active_human')
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Buscar última mensagem de cada conversa
    const conversationsWithLastMessage = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: lastMessage } = await supabaseAdmin
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          last_message: lastMessage
        }
      })
    )

    return NextResponse.json({ acceptedChats: conversationsWithLastMessage })

  } catch (error) {
    console.error('Erro ao buscar chats aceitos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
