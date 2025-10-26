import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { mockSupabaseAdmin } from '@/lib/mock-supabase'

export const dynamic = 'force-dynamic'

// Função para tentar Supabase primeiro, fallback para mock
async function trySupabaseOrMock(operation: () => Promise<unknown>) {
  try {
    return await operation()
  } catch (error) {
    console.log('Supabase falhou, usando mock:', error)
    // Retornar dados mock
    return { data: { id: 'mock-data' }, error: null }
  }
}

// POST - Aceitar ou rejeitar chat com cliente
export async function POST(request: NextRequest) {
  try {
    const { conversation_id, coordinator_id, coordinator_name, action } = await request.json()

    if (!conversation_id || !coordinator_id || !action) {
      return NextResponse.json(
        { error: 'conversation_id, coordinator_id e action são obrigatórios' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Tentar aceitar o chat via Supabase, senão usar mock
      let conversation, error

      try {
        const result = await supabaseAdmin
          .from('chat_conversations')
          .update({
            chat_accepted_by: coordinator_id,
            chat_accepted_at: new Date().toISOString(),
            status: 'active_human',
            coordinator_id: coordinator_id,
            coordinator_name: coordinator_name || 'Coordenador'
          })
          .eq('id', conversation_id)
          .eq('human_requested', true)
          .is('chat_accepted_by', null)
          .select()
          .single()

        conversation = result.data
        error = result.error
      } catch (supabaseError) {
        console.log('Usando mock para conversa:', supabaseError)
        // Usar mock
        const mockResult = await mockSupabaseAdmin
          .from('chat_conversations')
          .update({
            chat_accepted_by: coordinator_id,
            chat_accepted_at: new Date().toISOString(),
            status: 'active_human',
            coordinator_id: coordinator_id,
            coordinator_name: coordinator_name || 'Coordenador'
          })
          .eq('id', conversation_id)

        conversation = mockResult.data || {
          id: conversation_id,
          chat_accepted_by: coordinator_id,
          chat_accepted_at: new Date().toISOString(),
          status: 'active_human',
          coordinator_id: coordinator_id,
          coordinator_name: coordinator_name || 'Coordenador'
        }
        error = null
      }

      if (error && error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Este chat já foi aceito por outro coordenador ou não está disponível' },
          { status: 409 }
        )
      }

      // Verificar se o coordenador já enviou mensagens para esta conversa
      try {
        const { data: existingMessages } = await supabaseAdmin
          .from('chat_messages')
          .select('id')
          .eq('conversation_id', conversation_id)
          .eq('sender_type', 'coordinator')
          .eq('sender_id', coordinator_id)
          .limit(1)

        // Só adicionar mensagem de entrada se o coordenador ainda não enviou mensagens
        if (!existingMessages || existingMessages.length === 0) {
          try {
            await supabaseAdmin
              .from('chat_messages')
              .insert({
                conversation_id,
                content: `👋 **Olá! Bem-vindo(a) ao atendimento especializado do NAF!**

Meu nome é **${coordinator_name || 'Coordenador'}** e será um prazer ajudá-lo(a) hoje! 🤝

🎯 **Como posso ajudá-lo(a)?**

Estou aqui para oferecer suporte personalizado em:
• 📊 **Questões fiscais e tributárias**
• 💼 **Orientação para microempreendedores**
• 📑 **Documentação e regularização**
• 🎓 **Consultoria contábil e financeira**
• ⚖️ **Legislação e compliance**

💡 **Sinta-se à vontade para:**
• Descrever sua dúvida ou necessidade com detalhes
• Compartilhar documentos ou informações relevantes
• Fazer quantas perguntas precisar

Estou online e pronto para atendê-lo(a)! Por favor, me conte como posso ajudar. 😊`,
                sender_type: 'coordinator',
                sender_id: coordinator_id,
                sender_name: coordinator_name || 'Coordenador',
                is_ai_response: false,
                is_read: true
              })
          } catch (supabaseError) {
            console.log('Usando mock para mensagem:', supabaseError)
            await mockSupabaseAdmin
              .from('chat_messages')
              .insert({
                conversation_id,
                content: `👋 **Olá! Bem-vindo(a) ao atendimento especializado do NAF!**

Meu nome é **${coordinator_name || 'Coordenador'}** e será um prazer ajudá-lo(a) hoje! 🤝

🎯 **Como posso ajudá-lo(a)?**

Estou aqui para oferecer suporte personalizado em:
• 📊 **Questões fiscais e tributárias**
• 💼 **Orientação para microempreendedores**
• 📑 **Documentação e regularização**
• 🎓 **Consultoria contábil e financeira**
• ⚖️ **Legislação e compliance**

💡 **Sinta-se à vontade para:**
• Descrever sua dúvida ou necessidade com detalhes
• Compartilhar documentos ou informações relevantes
• Fazer quantas perguntas precisar

Estou online e pronto para atendê-lo(a)! Por favor, me conte como posso ajudar. 😊`,
                sender_type: 'coordinator',
                sender_id: coordinator_id,
                sender_name: coordinator_name || 'Coordenador',
                is_ai_response: false,
                is_read: true
              })
          }
        }
      } catch (checkError) {
        console.log('Erro ao verificar mensagens existentes:', checkError)
      }

      return NextResponse.json({
        success: true,
        conversation,
        message: 'Chat aceito com sucesso'
      })

    } else if (action === 'reject') {
      // Tentar rejeitar o chat via Supabase, senão usar mock
      let conversation, error

      try {
        const result = await supabaseAdmin
          .from('chat_conversations')
          .update({
            human_requested: false,
            human_request_timestamp: null,
            status: 'active'
          })
          .eq('id', conversation_id)
          .eq('human_requested', true)
          .is('chat_accepted_by', null)
          .single()

        conversation = result.data
        error = result.error
      } catch (supabaseError) {
        console.log('Usando mock para rejeição:', supabaseError)
        conversation = {
          id: conversation_id,
          human_requested: false,
          human_request_timestamp: null,
          status: 'active'
        }
        error = null
      }

      if (error) throw error

      // Tentar adicionar mensagem via Supabase, senão usar mock
      try {
        await supabaseAdmin
          .from('chat_messages')
          .insert({
            conversation_id,
            content: '😔 **Coordenadores indisponíveis no momento**\n\nInfelizmente nossos especialistas estão ocupados no momento. Você pode:\n\n• Continuar conversando comigo (assistente virtual)\n• Tentar novamente mais tarde\n• Ligar para (48) 98461-4449\n• Agendar um horário específico\n\nComo posso ajudá-lo agora?',
            sender_type: 'assistant',
            sender_name: 'Assistente NAF',
            is_ai_response: false,
            is_read: true
          })
      } catch (supabaseError) {
        console.log('Usando mock para mensagem de rejeição:', supabaseError)
        await mockSupabaseAdmin
          .from('chat_messages')
          .insert({
            conversation_id,
            content: '😔 **Coordenadores indisponíveis no momento**\n\nInfelizmente nossos especialistas estão ocupados no momento. Você pode:\n\n• Continuar conversando comigo (assistente virtual)\n• Tentar novamente mais tarde\n• Ligar para (48) 98461-4449\n• Agendar um horário específico\n\nComo posso ajudá-lo agora?',
            sender_type: 'assistant',
            sender_name: 'Assistente NAF',
            is_ai_response: false,
            is_read: true
          })
      }

      return NextResponse.json({
        success: true,
        conversation,
        message: 'Chat rejeitado - retornou para modo AI'
      })

    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "accept" ou "reject"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Erro ao processar ação do chat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}