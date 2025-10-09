import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando diagnóstico do sistema...')

    // 1. Verificar variáveis de ambiente
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Faltando',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    }

    console.log('📋 Variáveis de ambiente:', envVars)

    // 2. Testar conexão básica com Supabase
    const supabaseTest = {
      connection: '❌ Falhou',
      error: null
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select('id')
        .limit(1)

      if (error) {
        supabaseTest.error = error.message
        console.log('❌ Erro na conexão Supabase:', error)
      } else {
        supabaseTest.connection = '✅ OK'
        console.log('✅ Conexão Supabase funcionando')
      }
    } catch (error) {
      supabaseTest.error = String(error)
      console.log('❌ Exceção na conexão:', error)
    }

    // 3. Testar inserção simples
    const insertTest = {
      status: '❌ Falhou',
      error: null
    }

    try {
      // Primeiro tentar inserir um registro de teste
      const testStudent = {
        email: `teste.diagnostico.${Date.now()}@exemplo.com`,
        password_hash: 'hash_teste',
        name: 'Teste Diagnóstico',
        course: 'Teste',
        semester: '1º',
        status: 'ATIVO',
        specializations: [],
        available_hours: []
      }

      const { data, error } = await supabaseAdmin
        .from('students')
        .insert(testStudent)
        .select()
        .single()

      if (error) {
        insertTest.error = error.message
        console.log('❌ Erro no insert:', error)
      } else if (data) {
        insertTest.status = '✅ OK'
        console.log('✅ Insert funcionando, ID:', data.id)

        // Limpar o registro de teste
        await supabaseAdmin
          .from('students')
          .delete()
          .eq('id', data.id)
      } else {
        insertTest.error = 'Nenhum dado retornado'
      }
    } catch (error) {
      insertTest.error = String(error)
      console.log('❌ Exceção no insert:', error)
    }

    // 4. Resultado final
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: envVars,
      supabaseConnection: supabaseTest,
      insertTest: insertTest,
      summary: {
        allSystemsOperational:
          envVars.NEXT_PUBLIC_SUPABASE_URL === '✅ Definida' &&
          envVars.SUPABASE_SERVICE_ROLE_KEY === '✅ Definida' &&
          supabaseTest.connection === '✅ OK' &&
          insertTest.status === '✅ OK'
      }
    }

    console.log('📊 Resultado do diagnóstico:', diagnosticResult)

    return NextResponse.json(diagnosticResult)

  } catch (error) {
    console.error('💥 Erro crítico no diagnóstico:', error)
    return NextResponse.json({
      error: 'Erro crítico no diagnóstico',
      details: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}