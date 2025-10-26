// Criar coordenadores no Supabase
async function createCoordinators() {
  const SUPABASE_URL = 'https://gaevnrnthqxiwrdypour.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw';

  console.log('👨‍💼 Criando coordenadores no sistema...\n');

  const coordinators = [
    {
      id: 'coord-naf-001',
      name: 'Dr. Carlos Silva',
      email: 'carlos.silva@naf.edu.br',
      specialties: ['Imposto de Renda', 'Tributário', 'Pessoa Física'],
      status: 'active',
      is_online: true,
      phone: '(48) 99999-0001',
      created_at: new Date().toISOString()
    },
    {
      id: 'coord-naf-002',
      name: 'Dra. Ana Oliveira',
      email: 'ana.oliveira@naf.edu.br',
      specialties: ['MEI', 'Empresarial', 'e-Social'],
      status: 'active',
      is_online: true,
      phone: '(48) 99999-0002',
      created_at: new Date().toISOString()
    },
    {
      id: 'coord-naf-003',
      name: 'Prof. Roberto Santos',
      email: 'roberto.santos@naf.edu.br',
      specialties: ['ITR', 'Rural', 'Contabilidade'],
      status: 'active',
      is_online: false,
      phone: '(48) 99999-0003',
      created_at: new Date().toISOString()
    }
  ];

  try {
    // Verificar se a tabela coordinators existe
    console.log('📋 Verificando tabela coordinators...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/coordinators?limit=1`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });

    if (checkResponse.ok) {
      console.log('✅ Tabela coordinators existe');

      // Inserir coordenadores
      for (const coordinator of coordinators) {
        console.log(`📝 Inserindo: ${coordinator.name}...`);

        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/coordinators`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`,
            'apikey': ANON_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(coordinator)
        });

        const result = await insertResponse.text();

        if (insertResponse.ok || insertResponse.status === 409) {
          console.log(`✅ ${coordinator.name} criado/atualizado`);
        } else {
          console.log(`❌ Erro ao criar ${coordinator.name}:`, insertResponse.status, result);
        }
      }

      // Verificar coordenadores criados
      console.log('\n📊 Verificando coordenadores no sistema...');
      const listResponse = await fetch(`${SUPABASE_URL}/rest/v1/coordinators?select=*`, {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY
        }
      });

      if (listResponse.ok) {
        const coordinatorsList = await listResponse.json();
        console.log(`✅ ${coordinatorsList.length} coordenadores no sistema:`);

        coordinatorsList.forEach((coord, index) => {
          console.log(`   ${index + 1}. ${coord.name} (${coord.email})`);
          console.log(`      📧 Status: ${coord.status}`);
          console.log(`      🟢 Online: ${coord.is_online ? 'Sim' : 'Não'}`);
          console.log(`      🎯 Especialidades: ${coord.specialties ? coord.specialties.join(', ') : 'N/A'}\n`);
        });
      }

    } else if (checkResponse.status === 404) {
      console.log('❌ Tabela coordinators não existe. Criando...');

      // Tentar criar a tabela (isso pode não funcionar via REST API)
      console.log('ℹ️ Você precisa criar a tabela coordinators no Supabase Dashboard');
      console.log('SQL para criar a tabela:');
      console.log(`
CREATE TABLE coordinators (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  specialties TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  is_online BOOLEAN DEFAULT false,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
    } else {
      console.log('❌ Erro ao verificar tabela coordinators:', checkResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createCoordinators();