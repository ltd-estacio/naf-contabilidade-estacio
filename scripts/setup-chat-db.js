// Setup das tabelas de chat no Supabase
async function setupChatTables() {
  const SUPABASE_URL = 'https://gaevnrnthqxiwrdypour.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcxMTE3MywiZXhwIjoyMDczMjg3MTczfQ.1aKzZEOl_tEn3wKv2Z6Rw4X-sGqnOTfOxI4TnXpTGao';

  console.log('🔧 Configurando tabelas de chat...');

  try {
    // Tentar inserir uma conversa de teste
    const conversationData = {
      id: 'test-conversation-1',
      user_id: 'user-123',
      user_name: 'Maria Silva',
      user_email: 'maria@email.com',
      status: 'active',
      human_requested: true,
      human_request_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    console.log('📝 Inserindo conversa de teste...');
    const conversationResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(conversationData)
    });

    const conversationResult = await conversationResponse.text();
    console.log('Conversa response:', conversationResponse.status, conversationResult);

    if (conversationResponse.ok || conversationResponse.status === 409) {
      console.log('✅ Tabela chat_conversations disponível');

      // Tentar inserir uma mensagem de teste
      const messageData = {
        conversation_id: 'test-conversation-1',
        content: 'Teste de mensagem do sistema',
        sender_type: 'user',
        sender_id: 'user-123',
        sender_name: 'Maria Silva',
        is_ai_response: false,
        is_read: true,
        created_at: new Date().toISOString()
      };

      console.log('💬 Inserindo mensagem de teste...');
      const messageResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(messageData)
      });

      const messageResult = await messageResponse.text();
      console.log('Mensagem response:', messageResponse.status, messageResult);

      if (messageResponse.ok || messageResponse.status === 409) {
        console.log('✅ Tabela chat_messages disponível');

        // Testar a API de accept-chat
        console.log('🧪 Testando API accept-chat...');
        const acceptResponse = await fetch('http://localhost:4000/api/chat/accept-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: 'test-conversation-1',
            coordinator_id: 'coord-456',
            coordinator_name: 'Coordenador Teste',
            action: 'accept'
          })
        });

        const acceptResult = await acceptResponse.json();
        console.log('Accept chat result:', acceptResponse.status, acceptResult);

        if (acceptResponse.ok) {
          console.log('🎉 Chat funcionando perfeitamente!');
        } else {
          console.log('❌ Ainda há erro na API accept-chat');
        }

      } else {
        console.log('❌ Erro ao acessar tabela chat_messages');
      }
    } else {
      console.log('❌ Erro ao acessar tabela chat_conversations');
    }

  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
}

setupChatTables();