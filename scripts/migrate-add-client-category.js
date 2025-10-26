const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🔄 Iniciando migração...')

  try {
    // Como não podemos executar ALTER TABLE diretamente via Supabase JS,
    // vamos apenas verificar se a coluna já existe verificando os dados
    console.log('📋 Verificando estrutura atual...')

    const { data, error } = await supabase
      .from('fiscal_appointments')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao verificar tabela:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('📊 Estrutura atual da tabela:')
      console.log(Object.keys(data[0]))

      if ('client_category' in data[0]) {
        console.log('✅ Coluna client_category já existe!')
      } else {
        console.log('⚠️  Coluna client_category NÃO existe!')
        console.log('\n📝 Execute o seguinte SQL no painel do Supabase (SQL Editor):')
        console.log('─'.repeat(70))
        console.log(`
-- Adicionar coluna client_category
ALTER TABLE fiscal_appointments
ADD COLUMN IF NOT EXISTS client_category VARCHAR(50);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_client_category
ON fiscal_appointments(client_category);

-- Atualizar registros existentes
UPDATE fiscal_appointments
SET client_category = service_details->>'clientCategory'
WHERE service_details IS NOT NULL
AND service_details->>'clientCategory' IS NOT NULL
AND client_category IS NULL;
        `)
        console.log('─'.repeat(70))
        console.log('\n💡 Acesse: https://gaevnrnthqxiwrdypour.supabase.co/project/_/sql')
      }
    } else {
      console.log('⚠️  Tabela vazia, não há dados para verificar')
    }

  } catch (error) {
    console.error('❌ Erro na migração:', error)
  }
}

runMigration()
