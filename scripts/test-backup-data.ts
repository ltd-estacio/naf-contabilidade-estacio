/**
 * Script de teste para verificar dados nas tabelas de atendimentos
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Configurado' : '✗ Ausente')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Configurado' : '✗ Ausente')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBackupData() {
  console.log('🔍 Verificando dados nas tabelas...\n')

  try {
    // Testar tabela ATTENDANCES
    console.log('📊 Testando tabela ATTENDANCES:')
    const { data: attendances, error: attError, count: attCount } = await supabase
      .from('attendances')
      .select('*', { count: 'exact' })
      .limit(5)

    if (attError) {
      console.error('  ❌ Erro:', attError.message)
    } else {
      console.log(`  ✅ Total de registros: ${attCount}`)
      console.log(`  📝 Primeiros registros:`)
      attendances?.forEach((att: any, idx: number) => {
        console.log(`    ${idx + 1}. Protocol: ${att.protocol}, Status: ${att.status}, Client: ${att.client_name}`)
      })
    }

    console.log('\n📊 Testando tabela FISCAL_APPOINTMENTS:')
    const { data: fiscal, error: fiscalError, count: fiscalCount } = await supabase
      .from('fiscal_appointments')
      .select('*', { count: 'exact' })
      .limit(5)

    if (fiscalError) {
      console.error('  ❌ Erro:', fiscalError.message)
    } else {
      console.log(`  ✅ Total de registros: ${fiscalCount}`)
      console.log(`  📝 Primeiros registros:`)
      fiscal?.forEach((f: any, idx: number) => {
        console.log(`    ${idx + 1}. Protocol: ${f.protocol}, Status: ${f.status}, Client: ${f.client_name}`)
      })
    }

    // Testar tabela STUDENTS
    console.log('\n👨‍🎓 Testando tabela STUDENTS:')
    const { data: students, error: studentsError, count: studentsCount } = await supabase
      .from('students')
      .select('id, name, email, course', { count: 'exact' })
      .limit(5)

    if (studentsError) {
      console.error('  ❌ Erro:', studentsError.message)
    } else {
      console.log(`  ✅ Total de registros: ${studentsCount}`)
      console.log(`  📝 Primeiros registros:`)
      students?.forEach((s: any, idx: number) => {
        console.log(`    ${idx + 1}. Name: ${s.name}, Email: ${s.email}, Course: ${s.course}`)
      })
    }

    // Testar status específicos
    console.log('\n📋 Testando status na tabela ATTENDANCES:')
    const statuses = ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU']
    
    for (const status of statuses) {
      const { count } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)
      
      console.log(`  ${status}: ${count || 0} registros`)
    }

    console.log('\n📋 Testando status na tabela FISCAL_APPOINTMENTS:')
    const fiscalStatuses = ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']
    
    for (const status of fiscalStatuses) {
      const { count } = await supabase
        .from('fiscal_appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)
      
      console.log(`  ${status}: ${count || 0} registros`)
    }

    console.log('\n✅ Teste completo!')

  } catch (error) {
    console.error('❌ Erro ao executar testes:', error)
  }
}

testBackupData()
