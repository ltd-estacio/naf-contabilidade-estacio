import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backupId = params.id

    // Buscar o backup pelo ID
    const { data: backup, error } = await supabase
      .from('system_backups')
      .select('*')
      .eq('id', backupId)
      .single()

    if (error || !backup) {
      return NextResponse.json(
        { error: 'Backup não encontrado' },
        { status: 404 }
      )
    }

    // Parsear os dados do backup
    const backupData = typeof backup.data === 'string' 
      ? JSON.parse(backup.data) 
      : backup.data

    // Criar arquivo JSON formatado
    const jsonContent = JSON.stringify(backupData, null, 2)

    // Criar nome do arquivo com data
    const backupDate = new Date(backup.backup_date)
    const fileName = `backup_naf_${backupDate.toISOString().split('T')[0]}_${backup.id}.json`

    // Retornar o arquivo para download
    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Erro ao baixar backup:', error)
    return NextResponse.json(
      { error: 'Erro ao processar download do backup' },
      { status: 500 }
    )
  }
}
