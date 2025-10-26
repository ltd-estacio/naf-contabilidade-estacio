/**
 * Script para testar a API de backup diretamente
 */

// Carregar variáveis de ambiente ANTES de importar supabase
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

console.log('🔧 Variáveis de ambiente carregadas:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configurado' : '✗ Ausente')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configurado' : '✗ Ausente')
console.log()

import { supabaseAdmin } from '../src/lib/supabase'

async function testBackupAPI() {
  console.log('🔍 Testando API de Backup...\n')

  try {
    console.log('📊 1. Verificando conexão com Supabase...')
    
    // Testar conexão básica
    const { data: testData, error: testError } = await (supabaseAdmin as any)
      .from('attendances')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.error('❌ Erro ao conectar:', testError)
      return
    }

    console.log('✅ Conexão OK!\n')

    console.log('📊 2. Buscando ATTENDANCES...')
    const { data: attendances, error: attError } = await (supabaseAdmin as any)
      .from('attendances')
      .select('*')
      .limit(5)

    if (attError) {
      console.error('❌ Erro:', attError)
    } else {
      console.log(`✅ Encontrados: ${attendances?.length || 0} registros`)
      if (attendances && attendances.length > 0) {
        console.log('📝 Exemplo:', {
          id: attendances[0].id,
          protocol: attendances[0].protocol,
          status: attendances[0].status,
          client_name: attendances[0].client_name
        })
      }
    }

    console.log('\n📊 3. Buscando FISCAL_APPOINTMENTS...')
    const { data: fiscal, error: fiscalError } = await (supabaseAdmin as any)
      .from('fiscal_appointments')
      .select('*')
      .limit(5)

    if (fiscalError) {
      console.error('❌ Erro:', fiscalError)
    } else {
      console.log(`✅ Encontrados: ${fiscal?.length || 0} registros`)
      if (fiscal && fiscal.length > 0) {
        console.log('📝 Exemplo:', {
          id: fiscal[0].id,
          protocol: fiscal[0].protocol,
          status: fiscal[0].status,
          client_name: fiscal[0].client_name
        })
      }
    }

    console.log('\n📊 4. Testando filtros de status...')
    
    // Testar com status específico
    const { data: withStatus, error: statusError } = await (supabaseAdmin as any)
      .from('attendances')
      .select('*')
      .in('status', ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO'])
      .limit(3)

    if (statusError) {
      console.error('❌ Erro com filtro:', statusError)
    } else {
      console.log(`✅ Com filtro de status: ${withStatus?.length || 0} registros`)
    }

    console.log('\n📊 5. Buscando STUDENTS...')
    const { data: students, error: studError } = await (supabaseAdmin as any)
      .from('students')
      .select('id, name, email, course')
      .limit(3)

    if (studError) {
      console.error('❌ Erro:', studError)
    } else {
      console.log(`✅ Encontrados: ${students?.length || 0} estudantes`)
    }

    console.log('\n✅ Teste completo!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testBackupAPI()
