// Setup das tabelas de chat no Supabase com credenciais corretas
async function setupSupabaseChat() {
  const SUPABASE_URL = 'https://gaevnrnthqxiwrdypour.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw';

  console.log('🔧 Configurando chat no Supabase...');

  try {
    // Verificar se conseguimos acessar o Supabase
    console.log('📡 Testando conexão com Supabase...');
    const pingResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });

    console.log('Ping response:', pingResponse.status);

    if (pingResponse.ok || pingResponse.status === 404) {
      // console.log('✅ Conexão com Supabase estabelecida');

      // Tentar criar/verificar tabela de conversas
      // console.log('📋 Verificando tabelas de chat...');

      // Primeiro, vamos testar se conseguimos fazer uma query básica
      const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_conversations?limit=1`, {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY
        }
      });

      console.log('Test query response:', testResponse.status);

      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('✅ Tabela chat_conversations existe e acessível');
        console.log('Conversas existentes:', data.length);

        // Testar inserção de dados
        console.log('💬 Inserindo conversa de teste...');
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`,
            'apikey': ANON_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: 'user-test',
            user_name: 'Usuário Teste',
            user_email: 'teste@email.com',
            status: 'active',
            human_requested: true,
            human_request_timestamp: new Date().toISOString()
          })
        });

        const insertResult = await insertResponse.text();
        console.log('Insert response:', insertResponse.status, insertResult);

        if (insertResponse.ok || insertResponse.status === 409) {
          console.log('✅ Inserção funcionando');

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
          console.log('Accept result:', acceptResponse.status, acceptResult);

          if (acceptResponse.ok) {
            console.log('🎉 CHAT FUNCIONANDO PERFEITAMENTE!');
            console.log('');
            console.log('✅ Resumo:');
            console.log('  • Conexão Supabase: OK');
            console.log('  • Tabelas de chat: OK');
            console.log('  • API accept-chat: OK');
            console.log('  • Inserção de dados: OK');
            console.log('');
            console.log('🔗 Agora você pode testar o chat no dashboard do coordenador:');
            console.log('  http://localhost:4000/coordinator-dashboard');
          } else {
            console.log('❌ Erro na API accept-chat');
          }
        } else {
          console.log('❌ Erro na inserção de dados');
        }
      } else {
        console.log('❌ Tabela chat_conversations não existe ou não acessível');
        console.log('Você precisa criar as tabelas no Supabase Dashboard');
      }
    } else {
      console.log('❌ Não foi possível conectar ao Supabase');
    }

  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
}

setupSupabaseChat();