// Criar coordenadores usando a tabela coordinator_users existente
async function createCoordinatorUsers() {
  const SUPABASE_URL = 'https://gaevnrnthqxiwrdypour.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw';

  console.log('👨‍💼 Criando coordenadores no sistema...\n');

  try {
    // Verificar tabelas existentes
    console.log('📋 Verificando tabelas existentes...');

    // Tentar a tabela coordinator_users
    const checkUsers = await fetch(`${SUPABASE_URL}/rest/v1/coordinator_users?limit=1`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });

    if (checkUsers.ok) {
      console.log('✅ Tabela coordinator_users existe');

      // Verificar usuários existentes
      const existingUsers = await fetch(`${SUPABASE_URL}/rest/v1/coordinator_users?select=*`, {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY
        }
      });

      if (existingUsers.ok) {
        const users = await existingUsers.json();
        console.log(`📊 ${users.length} coordenadores existentes:`);

        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
        });

        // Criar novos coordenadores se necessário
        const newCoordinators = [
          {
            email: 'ana.oliveira@naf.edu.br',
            password: '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', // senha: 123456
            is_active: true
          },
          {
            email: 'roberto.santos@naf.edu.br',
            password: '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO', // senha: 123456
            is_active: true
          }
        ];

        console.log('\n📝 Inserindo novos coordenadores...');
        for (const coord of newCoordinators) {
          const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/coordinator_users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`,
              'apikey': ANON_KEY,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(coord)
          });

          const result = await insertResponse.text();

          if (insertResponse.ok || insertResponse.status === 409) {
            console.log(`✅ ${coord.email} criado/já existe`);
          } else {
            console.log(`❌ Erro ao criar ${coord.email}:`, insertResponse.status, result);
          }
        }

        // Listar todos os coordenadores novamente
        console.log('\n📊 Lista final de coordenadores:');
        const finalUsers = await fetch(`${SUPABASE_URL}/rest/v1/coordinator_users?select=*`, {
          headers: {
            'Authorization': `Bearer ${ANON_KEY}`,
            'apikey': ANON_KEY
          }
        });

        if (finalUsers.ok) {
          const finalList = await finalUsers.json();
          console.log(`✅ Total: ${finalList.length} coordenadores no sistema:\n`);

          finalList.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email}`);
            console.log(`      🆔 ID: ${user.id}`);
            console.log(`      ✅ Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
            console.log(`      📅 Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}\n`);
          });

          // Criar dados mock para o sistema
          console.log('🔧 Criando dados de perfil para coordenadores...');
          const coordinatorProfiles = [
            {
              id: finalList[0]?.id || 'coord-001',
              name: 'Dr. Carlos Silva',
              email: finalList[0]?.email || 'coordenador.estacio.ltd2025@developer.com.br',
              specialties: ['Imposto de Renda', 'Tributário', 'Pessoa Física'],
              is_online: true,
              phone: '(48) 99999-0001'
            },
            {
              id: finalList[1]?.id || 'coord-002',
              name: 'Dra. Ana Oliveira',
              email: finalList[1]?.email || 'ana.oliveira@naf.edu.br',
              specialties: ['MEI', 'Empresarial', 'e-Social'],
              is_online: true,
              phone: '(48) 99999-0002'
            },
            {
              id: finalList[2]?.id || 'coord-003',
              name: 'Prof. Roberto Santos',
              email: finalList[2]?.email || 'roberto.santos@naf.edu.br',
              specialties: ['ITR', 'Rural', 'Contabilidade'],
              is_online: false,
              phone: '(48) 99999-0003'
            }
          ];

          // Salvar profiles em arquivo para uso posterior
          const fs = require('fs');
          fs.writeFileSync('./coordinator-profiles.json', JSON.stringify(coordinatorProfiles, null, 2));
          console.log('✅ Perfis salvos em coordinator-profiles.json');

          console.log('\n🎉 COORDENADORES CONFIGURADOS COM SUCESSO!');
          console.log('📋 Credenciais de login para todos:');
          console.log('   📧 Email: conforme listado acima');
          console.log('   🔐 Senha: 123456');
        }
      }
    } else {
      console.log('❌ Tabela coordinator_users não encontrada:', checkUsers.status);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createCoordinatorUsers();