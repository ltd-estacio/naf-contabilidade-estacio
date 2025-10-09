import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { studentId, reason } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'ID do estudante é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se o estudante existe
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      return NextResponse.json(
        { success: false, error: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status para INATIVO em vez de deletar
    // (preserva histórico de atendimentos)

    // Montar objeto de atualização baseado nas colunas disponíveis
    const updateData: any = {
      status: 'INATIVO',
      updated_at: new Date().toISOString()
    }

    // Adicionar campos de graduação se eles existirem na tabela
    if (reason === 'GRADUADO') {
      // Tentar adicionar campos de graduação (podem não existir ainda)
      updateData.is_graduated = true
      updateData.graduation_date = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)

    if (updateError) {
      console.error('Erro ao remover estudante:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // Registrar log de atividade
    await supabase.from('student_activity_logs').insert({
      student_id: studentId,
      activity_type: 'STUDENT_REMOVED',
      activity_data: { reason: reason || 'MANUAL_REMOVAL' }
    })

    return NextResponse.json({
      success: true,
      message: 'Estudante removido com sucesso',
      studentId,
      reason
    })
  } catch (error) {
    console.error('Erro ao processar remoção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar remoção' },
      { status: 500 }
    )
  }
}
