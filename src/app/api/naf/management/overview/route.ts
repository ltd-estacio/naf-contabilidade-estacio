import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Counts: total, by status
    const statuses = ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'] as const

    // Total appointments
    const { count: totalAppointments, error: totalErr } = await supabaseAdmin
      .from('fiscal_appointments')
      .select('id', { count: 'exact', head: true })
    if (totalErr) console.error('Erro ao contar total de agendamentos:', totalErr)

    // Counts by status (separate head counts for precisão)
    const statusCounts: Record<string, number> = {}
    for (const st of statuses) {
      const { count, error } = await supabaseAdmin
        .from('fiscal_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('status', st)
      if (error) console.error(`Erro ao contar status ${st}:`, error)
      statusCounts[st] = count || 0
    }

    // Active students
    const { count: activeStudents, error: studentsErr } = await supabaseAdmin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ATIVO')
    if (studentsErr) console.error('Erro ao contar estudantes ativos:', studentsErr)

    // Category counts and monthly trends (fetch minimal fields and aggregate in código)
    const { data: eventsData, error: evErr } = await supabaseAdmin
      .from('fiscal_appointments')
      .select('service_category, created_at, status, urgency_level')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (evErr) console.error('Erro ao buscar eventos para agregação:', evErr)

    const categoryCounts: Record<string, number> = {}
    const monthlyCounts: Record<string, number> = {}
    const monthlyCompletedCounts: Record<string, number> = {}
    let urgentAppointments = 0
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    let newAppointments30Days = 0

    for (const row of eventsData || []) {
      const cat = (row as unknown)?.service_category || 'OUTROS'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1

      const d = new Date((row as unknown)?.created_at)
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1
        if ((row as unknown)?.status === 'CONCLUIDO') {
          monthlyCompletedCounts[key] = (monthlyCompletedCounts[key] || 0) + 1
        }
        if (d >= thirtyDaysAgo) {
          newAppointments30Days++
        }
      }

      if ((row as unknown)?.urgency_level === 'URGENTE') {
        urgentAppointments++
      }
    }

    // Build last 6 months series
    const now = new Date()
    const monthsLabels: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'short' })
      monthsLabels.push(`${label}`)
    }
    const monthKeys = monthsLabels.map((label, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const monthlyTrends = monthKeys.map((k, i) => ({ label: monthsLabels[i], value: monthlyCounts[k] || 0 }))
    const monthlyCompleted = monthKeys.map((k, i) => ({ label: monthsLabels[i], value: monthlyCompletedCounts[k] || 0 }))

    const completedAppointments = statusCounts['CONCLUIDO'] || 0
    const pendingAppointments = statusCounts['PENDENTE'] || 0
    const confirmedAppointments = statusCounts['CONFIRMADO'] || 0
    const inProgressAppointments = statusCounts['EM_ANDAMENTO'] || 0
    const cancelledAppointments = statusCounts['CANCELADO'] || 0
    const completionRate = totalAppointments && totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalAppointments: totalAppointments || 0,
        completedAppointments,
        pendingAppointments,
        confirmedAppointments,
        inProgressAppointments,
        cancelledAppointments,
        activeStudents: activeStudents || 0,
        statusCounts,
        categoryCounts,
        monthlyTrends,
        monthlyCompleted,
        urgentAppointments,
        newAppointments30Days,
        completionRate
      }
    })
  } catch (error) {
    console.error('Erro no overview NAF Management:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
