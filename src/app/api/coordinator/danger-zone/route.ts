import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Log de auditoria
async function logAuditAction(action: string, coordinatorId: string, success: boolean, details?: string) {
  try {
    await supabase.from('audit_logs').insert({
      action_type: action,
      user_id: coordinatorId,
      success,
      details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error)
  }
}

// Criar backup automático antes de operações destrutivas
async function createAutomaticBackup() {
  try {
    const tables = ['fiscal_appointments', 'attendances', 'appointments', 'attendance_feedback']
    const backupData: Record<string, unknown[]> = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      if (!error && data) {
        backupData[table] = data
      }
    }

    // Armazenar backup com timestamp
    const backupRecord = {
      backup_date: new Date().toISOString(),
      backup_type: 'automatic_danger_zone',
      data: JSON.stringify(backupData),
      tables_count: Object.keys(backupData).length,
      records_count: Object.values(backupData).reduce((sum, records) => sum + records.length, 0)
    }

    await supabase.from('system_backups').insert(backupRecord)

    return { success: true, message: 'Backup automático criado com sucesso' }
  } catch (error) {
    console.error('Erro ao criar backup automático:', error)
    return { success: false, message: 'Falha ao criar backup automático' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, twoFactorCode, coordinatorId } = body

    // Validar código 2FA (em produção, isso seria feito com um serviço real de 2FA)
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      return NextResponse.json(
        { error: 'Código 2FA inválido' },
        { status: 400 }
      )
    }

    // Validar coordenador
    if (!coordinatorId) {
      return NextResponse.json(
        { error: 'Coordenador não identificado' },
        { status: 401 }
      )
    }

    let result: { success: boolean; message: string; data?: unknown }

    switch (action) {
      case 'delete':
        // Criar backup antes de deletar
        const backupResult = await createAutomaticBackup()
        if (!backupResult.success) {
          await logAuditAction('DANGER_DELETE_FAILED', coordinatorId, false, 'Falha no backup automático')
          return NextResponse.json(
            { error: 'Não foi possível criar backup de segurança. Operação cancelada.' },
            { status: 500 }
          )
        }

        // Deletar dados de atendimentos
        try {
          const tablesToClear = ['fiscal_appointments', 'attendance_feedback', 'appointments']
          
          for (const table of tablesToClear) {
            const { error } = await supabase.from(table).delete().neq('id', 0)
            if (error) {
              throw new Error(`Erro ao limpar tabela ${table}: ${error.message}`)
            }
          }

          await logAuditAction('DANGER_DELETE_SUCCESS', coordinatorId, true, 'Dados de atendimentos removidos com backup criado')
          result = {
            success: true,
            message: '✅ Dados apagados com sucesso! Backup automático foi criado.'
          }
        } catch (error) {
          await logAuditAction('DANGER_DELETE_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro ao apagar dados: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      case 'confirm':
        // Verificar integridade dos dados
        try {
          const checks = []
          
          // Verificar fiscal_appointments
          const { count: fiscalCount, error: fiscalError } = await supabase
            .from('fiscal_appointments')
            .select('*', { count: 'exact', head: true })
          
          if (!fiscalError) {
            checks.push({ table: 'fiscal_appointments', count: fiscalCount || 0, status: 'OK' })
          }

          // Verificar attendances
          const { count: attendanceCount, error: attendanceError } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
          
          if (!attendanceError) {
            checks.push({ table: 'attendances', count: attendanceCount || 0, status: 'OK' })
          }

          // Verificar backup recente
          const { data: recentBackup, error: backupError } = await supabase
            .from('system_backups')
            .select('*')
            .order('backup_date', { ascending: false })
            .limit(1)

          const backupAge = recentBackup?.[0] 
            ? Math.floor((Date.now() - new Date(recentBackup[0].backup_date).getTime()) / (1000 * 60 * 60 * 24))
            : null

          await logAuditAction('DANGER_CONFIRM_SUCCESS', coordinatorId, true, JSON.stringify(checks))
          
          result = {
            success: true,
            message: `✅ Verificação concluída!\n\n${checks.map(c => `• ${c.table}: ${c.count} registros - ${c.status}`).join('\n')}\n\nÚltimo backup: ${backupAge !== null ? `${backupAge} dias atrás` : 'Nenhum backup encontrado'}`,
            data: { checks, backupAge }
          }
        } catch (error) {
          await logAuditAction('DANGER_CONFIRM_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro na verificação: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      case 'view':
        // Visualizar dados sensíveis
        try {
          const statistics = {
            fiscal_appointments: 0,
            attendances: 0,
            students: 0,
            total_records: 0
          }

          // Contar registros
          const { count: fiscalCount } = await supabase
            .from('fiscal_appointments')
            .select('*', { count: 'exact', head: true })
          
          const { count: attendanceCount } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
          
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })

          statistics.fiscal_appointments = fiscalCount || 0
          statistics.attendances = attendanceCount || 0
          statistics.students = studentCount || 0
          statistics.total_records = (fiscalCount || 0) + (attendanceCount || 0) + (studentCount || 0)

          await logAuditAction('DANGER_VIEW_SUCCESS', coordinatorId, true, 'Dados sensíveis acessados')
          
          result = {
            success: true,
            message: `✅ Dados carregados!\n\n• Agendamentos Fiscais: ${statistics.fiscal_appointments}\n• Atendimentos: ${statistics.attendances}\n• Estudantes: ${statistics.students}\n• Total: ${statistics.total_records} registros`,
            data: statistics
          }
        } catch (error) {
          await logAuditAction('DANGER_VIEW_FAILED', coordinatorId, false, (error as Error).message)
          return NextResponse.json(
            { error: `Erro ao visualizar dados: ${(error as Error).message}` },
            { status: 500 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no endpoint danger-zone:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
