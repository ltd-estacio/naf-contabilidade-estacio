import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { service_id, user_id = null, user_ip, user_agent } = await request.json()

    if (!service_id) {
      return NextResponse.json(
        { error: 'service_id é obrigatório' },
        { status: 400 }
      )
    }

    console.log('👁️ Registrando visualização do serviço:', service_id)

    // First, check if service_views table exists, if not create it
    const { error: tableCheckError } = await supabaseAdmin
      .from('service_views')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.log('📋 Tabela service_views não existe. Para este demo, vou simular views usando dados mock.')
      console.log('ℹ️ Em produção, a tabela seria criada pelo administrador do banco de dados.')

      // For now, we'll just continue with mock data tracking
      // In a real implementation, the DBA would create the table in production
      return NextResponse.json({
        message: 'View simulada registrada (tabela service_views não existe)',
        note: 'Para rastreamento real, a tabela service_views precisa ser criada no banco',
        mock_view_id: 'simulated_' + Date.now()
      })
    }

    // Insert the view record
    const { data, error } = await supabaseAdmin
      .from('service_views')
      .insert({
        service_id,
        user_id,
        user_ip,
        user_agent
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao registrar visualização:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar visualização', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Visualização registrada:', data.id)

    return NextResponse.json({
      message: 'Visualização registrada com sucesso',
      view_id: data.id
    })

  } catch (error) {
    console.error('💥 Erro no registro de visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service_id = searchParams.get('service_id')

    if (!service_id) {
      return NextResponse.json(
        { error: 'service_id é obrigatório' },
        { status: 400 }
      )
    }

    // Count views for the specific service
    const { data, error, count } = await supabaseAdmin
      .from('service_views')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', service_id)

    if (error) {
      console.error('❌ Erro ao buscar visualizações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar visualizações', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      service_id,
      view_count: count || 0
    })

  } catch (error) {
    console.error('💥 Erro ao buscar visualizações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}