import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Adicionar coluna client_category
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE fiscal_appointments
        ADD COLUMN IF NOT EXISTS client_category VARCHAR(50);
      `
    })

    if (alterError) {
      console.error('Erro ao adicionar coluna:', alterError)
    }

    // Criar índice
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_fiscal_appointments_client_category
        ON fiscal_appointments(client_category);
      `
    })

    if (indexError) {
      console.error('Erro ao criar índice:', indexError)
    }

    // Atualizar registros existentes
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE fiscal_appointments
        SET client_category = service_details->>'clientCategory'
        WHERE service_details IS NOT NULL
        AND service_details->>'clientCategory' IS NOT NULL
        AND client_category IS NULL;
      `
    })

    if (updateError) {
      console.error('Erro ao atualizar registros:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Migração executada com sucesso!',
      errors: {
        alterError,
        indexError,
        updateError
      }
    })

  } catch (error) {
    console.error('Erro na migração:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao executar migração',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
