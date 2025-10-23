/**
 * Script para listar todas as tabelas e seus dados
 */

// Carregar variáveis de ambiente PRIMEIRO
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

console.log('🔧 Variáveis carregadas:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configurado' : '✗ Ausente')
console.log()

// Criar cliente Supabase DEPOIS de carregar as env
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listAllTables() {
  console.log('📊 Listando todas as tabelas e contagens...\n')

  const tables = [
    'attendances',
    'fiscal_appointments',
    'students',
    'coordinator_users',
    'backup_logs',
    'chat_conversations',
    'chat_messages',
    'trainings',
    'courses',
    'naf_services'
  ]

  for (const table of tables) {
    try {
      const { count, error } = await (supabaseAdmin as any)
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: ERRO - ${error.message}`)
      } else {
        console.log(`${count && count > 0 ? '✅' : '⚪'} ${table}: ${count || 0} registros`)
        
        // Se tiver dados, mostrar uma amostra
        if (count && count > 0) {
          const { data } = await (supabaseAdmin as any)
            .from(table)
            .select('*')
            .limit(1)
          
          if (data && data.length > 0) {
            console.log(`   📝 Exemplo de campos:`, Object.keys(data[0]).slice(0, 5).join(', '))
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ERRO - ${err}`)
    }
  }

  console.log('\n✅ Verificação completa!')
}

listAllTables()
