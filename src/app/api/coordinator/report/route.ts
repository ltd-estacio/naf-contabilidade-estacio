import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel } from 'docx'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'pdf').toLowerCase()
    const period = (searchParams.get('period') || '30d').toLowerCase() // 7d|30d|90d|365d|all
    const statusFilter = (searchParams.get('status') || 'all').toUpperCase()
    const categoryFilter = (searchParams.get('category') || 'all')

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Compute date range
    let startDateISO: string | undefined
    if (period !== 'all') {
      const now = new Date()
      const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '365d' ? 365 : 30
      const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      startDateISO = start.toISOString()
    }

    // Attendances for period
    let aQuery = client.from('attendances').select('*')
    if (startDateISO) aQuery = aQuery.gte('created_at', startDateISO)
    if (statusFilter !== 'ALL') aQuery = aQuery.eq('status', statusFilter)
    if (categoryFilter !== 'all') aQuery = aQuery.eq('service_type', categoryFilter)
    aQuery = aQuery.order('created_at', { ascending: false })
    const { data: attendances } = await aQuery

    const totalAtt = attendances?.length || 0
    const completed = attendances?.filter(a => a.status === 'CONCLUIDO') || []
    const taxaConclusao = totalAtt > 0 ? Math.round((completed.length / totalAtt) * 100) : 0
    const tempoMedio = completed.length > 0 ? Math.round((completed.reduce((s, a) => s + (a.duration_minutes || 60), 0) / completed.length)) : 60

    // Weekly data
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const weeklyData = daysOfWeek.map((d, idx) => {
      const dayA = (attendances || []).filter(a => new Date(a.scheduled_date).getDay() === idx)
      return {
        day: d,
        atendimentos: dayA.filter(a => ['CONCLUIDO','EM_ANDAMENTO'].includes(a.status)).length,
        agendamentos: dayA.filter(a => a.status === 'AGENDADO').length
      }
    })

    // Student performance
    const { data: activeStudents } = await client
      .from('students')
      .select('id, name, course')
      .eq('status', 'ATIVO')
      .order('created_at', { ascending: false })
      .limit(30)
    const studentsPerf = await Promise.all((activeStudents || []).map(async (s) => {
      const { data: stA } = await client
        .from('attendances')
        .select('id, status, client_satisfaction_rating, duration_minutes')
        .eq('student_id', s.id)
      const total = stA?.length || 0
      const avgRating = (stA?.filter(x => x.client_satisfaction_rating).reduce((sum, x) => sum + x.client_satisfaction_rating, 0) || 0) /
        Math.max(1, (stA?.filter(x => x.client_satisfaction_rating).length || 0))
      return { name: s.name, course: (s as unknown).course || '', totalAttendances: total, avgRating: Math.round(avgRating * 10) / 10 }
    }))

    // Services performance
    const serviceGroups: Record<string, unknown> = {}
    ;(attendances || []).forEach((a: unknown) => {
      const type = a.service_type || 'OUTROS'
      if (!serviceGroups[type]) serviceGroups[type] = { service_type: type, requests_count: 0, completed_count: 0, pending_count: 0, ratings: [] as number[], avg_duration_minutes: 0 }
      serviceGroups[type].requests_count++
      if (a.status === 'CONCLUIDO') serviceGroups[type].completed_count++
      if (a.status === 'PENDENTE') serviceGroups[type].pending_count++
      if (a.client_satisfaction_rating) serviceGroups[type].ratings.push(a.client_satisfaction_rating)
      if (a.duration_minutes) serviceGroups[type].avg_duration_minutes = (serviceGroups[type].avg_duration_minutes + a.duration_minutes) / 2
    })
    const servicesPerf = Object.values(serviceGroups).map((s: unknown) => ({
      ...s,
      satisfaction_rating: s.ratings.length ? Math.round((s.ratings.reduce((p: number, c: number) => p + c, 0) / s.ratings.length) * 10) / 10 : 0,
      avg_duration_minutes: Math.round(s.avg_duration_minutes)
    })).sort((a: unknown, b: unknown) => b.requests_count - a.requests_count)

    // Público-alvo
    const clientCategories: Record<string, number> = {}
    ;(attendances || []).forEach((a: unknown) => {
      const cat = a.client_category || 'Não informado'
      clientCategories[cat] = (clientCategories[cat] || 0) + 1
    })
    const totalClients = Object.values(clientCategories).reduce((s, v) => s + v, 0)
    const publicoAlvo = Object.entries(clientCategories).map(([categoria, quantidade]) => ({
      categoria,
      quantidade: quantidade as number,
      percentual: totalClients > 0 ? Math.round(((quantidade as number) / totalClients) * 1000) / 10 : 0
    })).sort((a, b) => b.quantidade - a.quantidade)

    // Fiscal appointments
    let fQuery = client.from('fiscal_appointments').select('*').order('created_at', { ascending: false })
    if (startDateISO) fQuery = fQuery.gte('created_at', startDateISO)
    const { data: fiscalAppointments } = await fQuery
    const recentAppointments = (fiscalAppointments || []).slice(0, 20).map(a => ({
      protocol: a.protocol,
      client_name: a.client_name,
      service_title: a.service_title,
      status: a.status,
      urgency_level: a.urgency_level,
      created_at: a.created_at
    }))

    const statusCounts: Record<string, number> = {}
    ;(attendances || []).forEach((a: unknown) => {
      const status = (a.status || 'N/D').toString().toUpperCase()
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const urgencyCounts: Record<string, number> = {}
    ;(attendances || []).forEach((a: unknown) => {
      const urgency = (a.urgency_level || 'N/D').toString().toUpperCase()
      urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1
    })

    const statusOrder = ['PENDENTE', 'AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']
    const statusDistribution = Array.from(new Set([...statusOrder, ...Object.keys(statusCounts)])).map(status => ({
      status,
      quantidade: statusCounts[status] || 0,
      percentual: totalAtt > 0 ? Math.round(((statusCounts[status] || 0) / totalAtt) * 1000) / 10 : 0
    })).filter(row => row.quantidade > 0)

    const urgencyOrder = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE', 'N/D']
    const urgencyDistribution = Array.from(new Set([...urgencyOrder, ...Object.keys(urgencyCounts)])).map(level => ({
      nivel: level,
      quantidade: urgencyCounts[level] || 0,
      percentual: totalAtt > 0 ? Math.round(((urgencyCounts[level] || 0) / totalAtt) * 1000) / 10 : 0
    })).filter(row => row.quantidade > 0)

    const ratingValues = (attendances || [])
      .map(a => typeof a.client_satisfaction_rating === 'number' ? a.client_satisfaction_rating : null)
      .filter((n): n is number => n !== null && !Number.isNaN(n))
    const avgSatisfaction = ratingValues.length
      ? Math.round((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length) * 10) / 10
      : 0

    const backlogAppointments = (attendances || []).filter((a: unknown) => ['PENDENTE', 'EM_ANDAMENTO', 'CONFIRMADO'].includes((a.status || '').toString().toUpperCase()))
    const backlogCount = backlogAppointments.length

    const monthlyBuckets: Record<string, { total: number; completed: number; cancelled: number }> = {}
    ;(attendances || []).forEach((a: unknown) => {
      const dtRaw = a.created_at || a.scheduled_date
      if (!dtRaw) return
      const dt = new Date(dtRaw)
      if (Number.isNaN(dt.getTime())) return
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyBuckets[key]) {
        monthlyBuckets[key] = { total: 0, completed: 0, cancelled: 0 }
      }
      monthlyBuckets[key].total += 1
      if ((a.status || '').toString().toUpperCase() === 'CONCLUIDO') monthlyBuckets[key].completed += 1
      if ((a.status || '').toString().toUpperCase() === 'CANCELADO') monthlyBuckets[key].cancelled += 1
    })

    const monthlyTrend = Object.entries(monthlyBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [year, month] = key.split('-')
        const label = `${month}/${year}`
        const completionRate = value.total > 0 ? Math.round((value.completed / value.total) * 1000) / 10 : 0
        return { key, label, ...value, completionRate }
      })

    const monthlySeries = monthlyTrend.map(m => ({ label: m.label, value: m.total }))
    const monthlyCompletionSeries = monthlyTrend.map(m => ({ label: m.label, value: m.completionRate }))

    const lastMonth = monthlyTrend[monthlyTrend.length - 1]
    const prevMonth = monthlyTrend[monthlyTrend.length - 2]
    const monthGrowth = lastMonth && prevMonth
      ? (prevMonth.total === 0
        ? (lastMonth.total > 0 ? 100 : 0)
        : Math.round(((lastMonth.total - prevMonth.total) / prevMonth.total) * 1000) / 10)
      : 0
    const avgMonthlyCompletion = monthlyTrend.length
      ? Math.round((monthlyTrend.reduce((sum, entry) => sum + entry.completionRate, 0) / monthlyTrend.length) * 10) / 10
      : taxaConclusao

    const sortedStudentsPerf = [...(studentsPerf || [])].sort((a, b) => b.totalAttendances - a.totalAttendances)
    const topStudents = sortedStudentsPerf.slice(0, 10)
    const avgAttendancesPerStudent = sortedStudentsPerf.length
      ? Math.round(((totalAtt || 0) / Math.max(sortedStudentsPerf.length, 1)) * 10) / 10
      : 0

    const topServices = servicesPerf.slice(0, 12)
    const servicesNeedingAttention = [...servicesPerf]
      .sort((a: unknown, b: unknown) => (a.satisfaction_rating || 0) - (b.satisfaction_rating || 0))
      .slice(0, 6)

    const publicoResumo = publicoAlvo.slice(0, 12)

    const now = Date.now()
    const criticalAppointments = (attendances || [])
      .map((a: unknown) => {
        const created = a.created_at ? new Date(a.created_at) : null
        const daysOpen = created && !Number.isNaN(created.getTime())
          ? Math.floor((now - created.getTime()) / (1000 * 60 * 60 * 24))
          : 0
        const status = (a.status || 'N/D').toString().toUpperCase()
        const urgencyLevel = (a.urgency_level || 'NORMAL').toString().toUpperCase()
        return {
          protocolo: a.protocol || a.id || '-',
          cliente: a.client_name || a.client_email || '-',
          servico: a.service_title || a.service_type || '-',
          status,
          urgencia: urgencyLevel,
          criadoEm: a.created_at,
          diasAberto: daysOpen
        }
      })
      .filter(item => ['PENDENTE', 'EM_ANDAMENTO', 'CONFIRMADO'].includes(item.status) && (item.diasAberto >= 7 || ['ALTA', 'URGENTE'].includes(item.urgencia)))
      .sort((a, b) => b.diasAberto - a.diasAberto)
      .slice(0, 12)

    const urgentCount = urgencyCounts['URGENTE'] || 0
    const highUrgencyCount = (urgencyCounts['ALTA'] || 0) + urgentCount
    const cancellationRate = totalAtt > 0 ? Math.round(((statusCounts['CANCELADO'] || 0) / totalAtt) * 1000) / 10 : 0

    const insights: string[] = []
    if (monthGrowth !== 0) {
      insights.push(`Variação de volume em relação ao mês anterior: ${monthGrowth > 0 ? '+' : ''}${monthGrowth}% de atendimentos.`)
    }
    insights.push(`Taxa média de conclusão no período: ${avgMonthlyCompletion}% (meta atual: ${taxaConclusao}%).`)
    if (avgSatisfaction) {
      insights.push(`Satisfação média dos atendimentos avaliados: ${avgSatisfaction.toFixed(1)} de 5.`)
    }
    if (highUrgencyCount > 0) {
      insights.push(`Foram registradas ${highUrgencyCount} ocorrências de alta urgência, sendo ${urgentCount} urgentes.`)
    }
    if (backlogCount > 0) {
      insights.push(`Backlog atual: ${backlogCount} atendimentos aguardando conclusão.`)
    }
    if (criticalAppointments.length > 0) {
      insights.push(`Há ${criticalAppointments.length} pendências consideradas críticas (≥7 dias ou alta urgência).`)
    }
    if (topServices.length > 0) {
      insights.push(`Serviço mais demandado: ${topServices[0].service_type} (${topServices[0].requests_count} solicitações).`)
    }
    if (publicoResumo.length > 0) {
      insights.push(`Principal público atendido: ${publicoResumo[0].categoria} (${publicoResumo[0].percentual}% do total).`)
    }
    if (avgAttendancesPerStudent) {
      insights.push(`Média de ${avgAttendancesPerStudent} atendimentos por estudante ativo no período.`)
    }
    insights.push(`Tempo médio de atendimento registrado: ${tempoMedio} minutos.`)

    // Generate formats
    if (format === 'csv') {
      const rows: string[] = []
      rows.push('protocolo,cliente,servico,status,urgencia,criado_em')
      recentAppointments.forEach(a => rows.push([
        a.protocol,
        JSON.stringify(a.client_name || ''),
        JSON.stringify(a.service_title || ''),
        a.status,
        a.urgency_level,
        a.created_at
      ].join(',')))
      return new NextResponse(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendances || []), 'Atendimentos')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(servicesPerf || []), 'Serviços')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsPerf || []), 'Estudantes')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(publicoAlvo || []), 'PublicoAlvo')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusDistribution || []), 'StatusResumo')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(urgencyDistribution || []), 'Urgencias')
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          monthlyTrend.map(item => ({
            mes: item.label,
            total: item.total,
            concluidos: item.completed,
            cancelados: item.cancelled,
            taxaConclusao: item.completionRate
          }))
        ),
        'Mensal'
      )
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(criticalAppointments || []), 'PendenciasCriticas')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recentAppointments || []), 'Agendamentos')
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(insights.map((texto, index) => ({ ordem: index + 1, insight: texto }))),
        'Insights'
      )
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    if (format === 'doc' || format === 'docx') {
      const children: unknown[] = []
      const nowLocale = new Date().toLocaleString('pt-BR')

      children.push(new Paragraph({
        children: [new TextRun({ text: 'Relatório do Coordenador - NAF', bold: true, size: 28 })],
        alignment: AlignmentType.CENTER
      }))
      children.push(new Paragraph({
        children: [new TextRun({ text: `Gerado em: ${nowLocale}`, size: 20 })],
        alignment: AlignmentType.CENTER
      }))

      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ text: 'Resumo Executivo', heading: HeadingLevel.HEADING_1 }))
      children.push(new Paragraph({ text: `Total de atendimentos no período: ${totalAtt}`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Taxa de conclusão consolidada: ${taxaConclusao}%`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Taxa média de conclusão mensal: ${avgMonthlyCompletion}%`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Tempo médio por atendimento: ${tempoMedio} minutos`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Satisfação média registrada: ${avgSatisfaction ? avgSatisfaction.toFixed(1) : 'N/D'} / 5`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Média de atendimentos por estudante ativo: ${avgAttendancesPerStudent || 0}`, bullet: { level: 0 } }))

      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ text: 'Indicadores-Chave', heading: HeadingLevel.HEADING_2 }))
      children.push(new Paragraph({ text: `Backlog atual (pendentes e em andamento): ${backlogCount}`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Atendimentos de alta ou urgência: ${highUrgencyCount} (sendo ${urgentCount} urgentes)`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Taxa de cancelamento: ${cancellationRate}%`, bullet: { level: 0 } }))
      children.push(new Paragraph({ text: `Variação recente de volume (último mês): ${monthGrowth > 0 ? '+' : ''}${monthGrowth}%`, bullet: { level: 0 } }))

      if (statusDistribution.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Distribuição por Status', heading: HeadingLevel.HEADING_2 }))
        const statusHeader = new TableRow({
          children: ['Status', 'Quantidade', 'Percentual (%)'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const statusRows = statusDistribution.map(item => new TableRow({
          children: [
            item.status,
            item.quantidade.toLocaleString('pt-BR'),
            item.percentual.toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [statusHeader, ...statusRows] }))
      }

      if (urgencyDistribution.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Distribuição por Urgência', heading: HeadingLevel.HEADING_2 }))
        const urgencyHeader = new TableRow({
          children: ['Urgência', 'Quantidade', 'Percentual (%)'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const urgencyRows = urgencyDistribution.map(item => new TableRow({
          children: [
            item.nivel,
            item.quantidade.toLocaleString('pt-BR'),
            item.percentual.toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [urgencyHeader, ...urgencyRows] }))
      }

      if (monthlyTrend.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Evolução Mensal', heading: HeadingLevel.HEADING_2 }))
        const monthlyHeader = new TableRow({
          children: ['Mês', 'Total', 'Concluídos', 'Cancelados', 'Taxa Conclusão (%)'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const monthlyRows = monthlyTrend.map(item => new TableRow({
          children: [
            item.label,
            item.total.toLocaleString('pt-BR'),
            item.completed.toLocaleString('pt-BR'),
            item.cancelled.toLocaleString('pt-BR'),
            item.completionRate.toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [monthlyHeader, ...monthlyRows] }))
      }

      if (topServices.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Top Serviços por Volume', heading: HeadingLevel.HEADING_2 }))
        const servicesHeader = new TableRow({
          children: ['Serviço', 'Solicitações', 'Concluídos', 'Pendentes', 'Satisfação', 'Duração Média (min)'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const servicesRows = topServices.map(service => new TableRow({
          children: [
            service.service_type || '—',
            service.requests_count?.toLocaleString('pt-BR') ?? '0',
            service.completed_count?.toLocaleString('pt-BR') ?? '0',
            service.pending_count?.toLocaleString('pt-BR') ?? '0',
            (service.satisfaction_rating ?? 0).toLocaleString('pt-BR'),
            (service.avg_duration_minutes ?? 0).toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [servicesHeader, ...servicesRows] }))
      }

      if (servicesNeedingAttention.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Serviços com Menor Satisfação', heading: HeadingLevel.HEADING_2 }))
        const servicesAttentionHeader = new TableRow({
          children: ['Serviço', 'Solicitações', 'Satisfação', 'Pendentes'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const servicesAttentionRows = servicesNeedingAttention.map(service => new TableRow({
          children: [
            service.service_type || '—',
            service.requests_count?.toLocaleString('pt-BR') ?? '0',
            (service.satisfaction_rating ?? 0).toLocaleString('pt-BR'),
            service.pending_count?.toLocaleString('pt-BR') ?? '0'
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [servicesAttentionHeader, ...servicesAttentionRows] }))
      }

      if (topStudents.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Estudantes Destaque', heading: HeadingLevel.HEADING_2 }))
        const studentsHeader = new TableRow({
          children: ['Estudante', 'Curso', 'Atendimentos', 'Nota Média'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const studentsRows = topStudents.map(student => new TableRow({
          children: [
            student.name || '—',
            student.course || '—',
            student.totalAttendances.toLocaleString('pt-BR'),
            (student.avgRating || 0).toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [studentsHeader, ...studentsRows] }))
      }

      if (publicoResumo.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Distribuição por Público-Alvo', heading: HeadingLevel.HEADING_2 }))
        const publicoHeader = new TableRow({
          children: ['Segmento', 'Quantidade', 'Percentual (%)'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const publicoRows = publicoResumo.map(item => new TableRow({
          children: [
            item.categoria,
            item.quantidade.toLocaleString('pt-BR'),
            item.percentual.toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [publicoHeader, ...publicoRows] }))
      }

      if (criticalAppointments.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Pendências Prioritárias', heading: HeadingLevel.HEADING_2 }))
        const criticalHeader = new TableRow({
          children: ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Urgência', 'Dias em Aberto'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const criticalRows = criticalAppointments.map(item => new TableRow({
          children: [
            item.protocolo,
            item.cliente,
            item.servico,
            item.status,
            item.urgencia,
            item.diasAberto.toLocaleString('pt-BR')
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [criticalHeader, ...criticalRows] }))
      }

      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ text: 'Agendamentos Recentes', heading: HeadingLevel.HEADING_2 }))
      if (recentAppointments.length) {
        const recentHeader = new TableRow({
          children: ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Urgência', 'Criado em'].map(text => new TableCell({ children: [new Paragraph(text)] }))
        })
        const recentRows = recentAppointments.map(a => new TableRow({
          children: [
            a.protocol || '-',
            a.client_name || '-',
            a.service_title || '-',
            (a.status || '-').toString(),
            (a.urgency_level || '-').toString(),
            a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : '-'
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
        }))
        children.push(new Table({ rows: [recentHeader, ...recentRows] }))
      } else {
        children.push(new Paragraph({ text: 'Não há agendamentos recentes para o período selecionado.' }))
      }

      if (insights.length) {
        children.push(new Paragraph({ text: '' }))
        children.push(new Paragraph({ text: 'Insights e Recomendações', heading: HeadingLevel.HEADING_2 }))
        insights.forEach(texto => {
          children.push(new Paragraph({ text: texto, bullet: { level: 0 } }))
        })
      }

      const doc = new Document({ sections: [{ properties: {}, children }] })
      const buffer = await Packer.toBuffer(doc)
      return new NextResponse(buffer as unknown, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.docx"`
        }
      })
    }

    // PDF com gráficos vetoriais
    const doc: unknown = new (jsPDF as unknown)('p', 'pt', 'a4')
    const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() }
    const pad = 24

    // Optional logo
    let logoDataUrl: string | null = null
    try {
      const candidate = process.env.REPORT_LOGO_URL || `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png`
      if (candidate && candidate.startsWith('http')) {
        const r = await fetch(candidate)
        if (r.ok) {
          const buf = await r.arrayBuffer()
          logoDataUrl = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`
        }
      }
    } catch {}

    const drawHeader = () => {
      doc.setFillColor(236, 253, 245)
      doc.rect(0, 0, page.w, 80, 'F')
      if (logoDataUrl) {
        try { doc.addImage(logoDataUrl, 'PNG', pad, 20, 80, 32) } catch {}
      }
      doc.setFontSize(20); doc.setTextColor(16, 185, 129)
      doc.text('Relatório do Coordenador - NAF', logoDataUrl ? pad + 96 : pad, 40)
      doc.setFontSize(12); doc.setTextColor(31, 41, 55)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  •  Período: ${period.toUpperCase()}`, logoDataUrl ? pad + 96 : pad, 60)
    }
    const drawFooter = () => {
      const pages = doc.getNumberOfPages()
      for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(107,114,128); doc.text(`Relatório do Coordenador • Pág. ${i}/${pages}`, pad, page.h - 18) }
    }
    const drawAxes = (x: number, y: number, w: number, h: number) => {
      doc.setDrawColor(229,231,235); doc.setLineWidth(0.5)
      for (let i = 0; i <= 4; i++) { const gy = y + 10 + (h - 20) * (i/4); doc.line(x + 30, gy, x + w - 10, gy) }
      doc.setDrawColor(107,114,128); doc.line(x + 30, y + 10, x + 30, y + h - 10); doc.line(x + 30, y + h - 10, x + w - 10, y + h - 10)
    }
    const drawBar = (x: number, y: number, w: number, h: number, series: {label: string; value: number}[], title: string, color: [number,number,number]) => {
      doc.setFontSize(12); doc.setTextColor(31,41,55); doc.text(title, x, y - 6)
      drawAxes(x,y,w,h)
      const max = Math.max(1, ...series.map(s => s.value)); const innerW = w - 50; const barW = Math.max(8, innerW / Math.max(1, series.length * 1.6))
      series.forEach((s,i)=>{ const bh=((h-30)*s.value)/max; const bx=x+40+i*(barW+6); const by=y+h-10-bh; doc.setFillColor(...color); doc.rect(bx,by,barW,bh,'F'); doc.setFontSize(8); doc.setTextColor(75,85,99); doc.text(String(s.label).slice(0,8), bx, y+h) })
    }
    const drawLine = (x: number, y: number, w: number, h: number, series: {label: string; value: number}[], title: string, color: [number,number,number]) => {
      doc.setFontSize(12); doc.setTextColor(31,41,55); doc.text(title, x, y - 6)
      drawAxes(x,y,w,h)
      const max=Math.max(1,...series.map(s=>s.value)); const innerW=w-50; const stepX=innerW/Math.max(1, series.length-1)
      doc.setDrawColor(...color); doc.setLineWidth(1.5)
      series.forEach((s,i)=>{ const px=x+30+i*stepX; const py=y+h-10-((h-30)*s.value)/max; if(i>0){ const ppx=x+30+(i-1)*stepX; const ppy=y+h-10-((h-30)*series[i-1].value)/max; doc.line(ppx,ppy,px,py)} doc.setFillColor(...color); doc.circle(px,py,2,'F') })
      doc.setFontSize(8); doc.setTextColor(75,85,99); series.forEach((s,i)=>{ const px=x+30+i*stepX; doc.text(String(s.label).slice(0,6), px-8, y+h) })
    }

    // Build series from data
    const weeklySeries = weeklyData.map(w => ({ label: w.day, value: w.atendimentos }))
    const publicoSeries = publicoResumo.map(p => ({ label: p.categoria, value: p.quantidade }))
    const servicesSeries = topServices.slice(0, 8).map(s => ({ label: s.service_type || 'OUTROS', value: s.requests_count }))
    const studentsSeries = topStudents.slice(0, 8).map(s => ({ label: (s.name || 'Estudante').split(' ')[0], value: s.totalAttendances }))

    // Draw PDF
    drawHeader()
    let currentY = 100
    doc.setFontSize(14); doc.setTextColor(31,41,55); doc.text('Resumo Executivo', pad, currentY)
    currentY += 18
    doc.setFontSize(10); doc.setTextColor(55,65,81)
    const exec = [
      `• Total de atendimentos: ${totalAtt.toLocaleString('pt-BR')}  •  Taxa de conclusão: ${taxaConclusao}%  •  Taxa média mensal: ${avgMonthlyCompletion}%`,
      `• Satisfação média: ${avgSatisfaction ? avgSatisfaction.toFixed(1) : 'N/D'} / 5  •  Tempo médio: ${tempoMedio} min  •  Cancelamentos: ${cancellationRate}%`,
      `• Backlog atual: ${backlogCount}  •  Ocorrências de alta/urgência: ${highUrgencyCount} (urgentes: ${urgentCount})`,
      `• Serviços mais solicitados: ${topServices.slice(0,3).map(s => s.service_type || '—').join(', ') || 'N/D'}  •  Público principal: ${publicoResumo[0]?.categoria || 'N/D'}`
    ]
    exec.forEach(line => {
      const lines = doc.splitTextToSize(line, page.w - pad * 2)
      if (currentY + lines.length * 12 > page.h - 120) {
        doc.addPage(); drawHeader(); currentY = 100; doc.setFontSize(10); doc.setTextColor(55,65,81)
      }
      doc.text(lines, pad, currentY)
      currentY += lines.length * 12
    })

    const colW = (page.w - pad * 2 - 12) / 2
    const chartHeight = 160

    const addTable = (title: string, head: string[], body: (string | number)[][]) => {
      if (!body.length) return
      if (currentY + 80 > page.h - 120) {
        doc.addPage(); drawHeader(); currentY = 100
      }
      doc.setFontSize(12); doc.setTextColor(31,41,55); doc.text(title, pad, currentY)
      autoTable(doc, {
        startY: currentY + 10,
        head: [head],
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [0,87,184], textColor: [255,255,255] },
        alternateRowStyles: { fillColor: [249,250,251] }
      })
      const finalY = ((doc as unknown).lastAutoTable?.finalY ?? (currentY + 40)) + 16
      currentY = finalY
    }

    addTable('Distribuição por Status', ['Status', 'Quantidade', '%'], statusDistribution.map(item => [
      item.status,
      item.quantidade.toLocaleString('pt-BR'),
      `${item.percentual.toLocaleString('pt-BR')}%`
    ]))

    addTable('Distribuição por Urgência', ['Nível', 'Quantidade', '%'], urgencyDistribution.map(item => [
      item.nivel,
      item.quantidade.toLocaleString('pt-BR'),
      `${item.percentual.toLocaleString('pt-BR')}%`
    ]))

    if (currentY + chartHeight + 60 > page.h - 80) {
      doc.addPage(); drawHeader(); currentY = 100
    }
    drawBar(pad, currentY + 20, colW, chartHeight, weeklySeries, 'Atendimentos por Dia da Semana', [0,87,184])
    drawBar(pad + colW + 12, currentY + 20, colW, chartHeight, publicoSeries, 'Distribuição do Público-Alvo', [16,185,129])
    currentY += chartHeight + 60

    doc.addPage(); drawHeader()
    let page2Y = 100
    const fullWidth = page.w - pad * 2

    if (monthlySeries.length) {
      drawLine(pad, page2Y + 20, fullWidth, chartHeight, monthlySeries, 'Evolução Mensal de Atendimentos', [0,87,184])
      page2Y += chartHeight + 60
    }
    if (monthlyCompletionSeries.length) {
      drawLine(pad, page2Y, fullWidth, chartHeight, monthlyCompletionSeries, 'Taxa de Conclusão Mensal (%)', [16,185,129])
      page2Y += chartHeight + 60
    }

    if (page2Y + chartHeight + 40 > page.h - 80) {
      doc.addPage(); drawHeader(); page2Y = 100
    }
    drawBar(pad, page2Y, colW, chartHeight, servicesSeries, 'Top Serviços por Volume', [245,158,11])
    drawBar(pad + colW + 12, page2Y, colW, chartHeight, studentsSeries, 'Estudantes Destaque (Atendimentos)', [59,130,246])
    page2Y += chartHeight + 40

    const addTablePage2 = (title: string, head: string[], body: (string | number)[][]) => {
      if (!body.length) return
      if (page2Y + 80 > page.h - 120) {
        doc.addPage(); drawHeader(); page2Y = 100
      }
      doc.setFontSize(12); doc.setTextColor(31,41,55); doc.text(title, pad, page2Y)
      autoTable(doc, {
        startY: page2Y + 10,
        head: [head],
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37,99,235], textColor: [255,255,255] },
        alternateRowStyles: { fillColor: [248,250,252] }
      })
      page2Y = ((doc as unknown).lastAutoTable?.finalY ?? (page2Y + 40)) + 16
    }

    addTablePage2('Top Serviços – Detalhes', ['Serviço', 'Solicitações', 'Concluídos', 'Pendentes', 'Satisfação', 'Duração Média (min)'],
      topServices.map(service => [
        service.service_type || '—',
        service.requests_count?.toLocaleString('pt-BR') ?? '0',
        service.completed_count?.toLocaleString('pt-BR') ?? '0',
        service.pending_count?.toLocaleString('pt-BR') ?? '0',
        (service.satisfaction_rating ?? 0).toLocaleString('pt-BR'),
        (service.avg_duration_minutes ?? 0).toLocaleString('pt-BR')
      ]))

    addTablePage2('Serviços com Menor Satisfação', ['Serviço', 'Solicitações', 'Satisfação', 'Pendentes'],
      servicesNeedingAttention.map(service => [
        service.service_type || '—',
        service.requests_count?.toLocaleString('pt-BR') ?? '0',
        (service.satisfaction_rating ?? 0).toLocaleString('pt-BR'),
        service.pending_count?.toLocaleString('pt-BR') ?? '0'
      ]))

    addTablePage2('Estudantes Destaque', ['Estudante', 'Curso', 'Atendimentos', 'Nota Média'],
      topStudents.map(student => [
        student.name || '—',
        student.course || '—',
        student.totalAttendances.toLocaleString('pt-BR'),
        (student.avgRating || 0).toLocaleString('pt-BR')
      ]))

    doc.addPage(); drawHeader()
    let page3Y = 100

    const addTablePage3 = (title: string, head: string[], body: (string | number)[][]) => {
      if (!body.length) return
      if (page3Y + 80 > page.h - 120) {
        doc.addPage(); drawHeader(); page3Y = 100
      }
      doc.setFontSize(12); doc.setTextColor(31,41,55); doc.text(title, pad, page3Y)
      autoTable(doc, {
        startY: page3Y + 10,
        head: [head],
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [22,163,74], textColor: [255,255,255] },
        alternateRowStyles: { fillColor: [240,253,244] }
      })
      page3Y = ((doc as unknown).lastAutoTable?.finalY ?? (page3Y + 40)) + 16
    }

    addTablePage3('Distribuição por Público-Alvo', ['Segmento', 'Quantidade', '%'],
      publicoResumo.map(item => [
        item.categoria,
        item.quantidade.toLocaleString('pt-BR'),
        `${item.percentual.toLocaleString('pt-BR')}%`
      ]))

    addTablePage3('Pendências Prioritárias', ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Urgência', 'Dias Aberto'],
      criticalAppointments.map(item => [
        item.protocolo,
        item.cliente,
        item.servico,
        item.status,
        item.urgencia,
        item.diasAberto.toLocaleString('pt-BR')
      ]))

    addTablePage3('Agendamentos Recentes', ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Urgência', 'Criado em'],
      recentAppointments.map(a => [
        a.protocol || '-',
        a.client_name || '-',
        a.service_title || '-',
        (a.status || '-').toString(),
        (a.urgency_level || '-').toString(),
        a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : '-'
      ]))

    if (insights.length) {
      if (page3Y + insights.length * 12 + 40 > page.h - 80) {
        doc.addPage(); drawHeader(); page3Y = 100
      }
      doc.setFontSize(14); doc.setTextColor(31,41,55); doc.text('Insights e Recomendações', pad, page3Y)
      page3Y += 20
      doc.setFontSize(10); doc.setTextColor(55,65,81)
      insights.forEach(texto => {
        const wrapped = doc.splitTextToSize(`• ${texto}`, page.w - pad * 2)
        if (page3Y + wrapped.length * 12 > page.h - 80) {
          doc.addPage(); drawHeader(); page3Y = 100; doc.setFontSize(10); doc.setTextColor(55,65,81)
        }
        doc.text(wrapped, pad, page3Y)
        page3Y += wrapped.length * 12
      })
    }

    // Watermark & footer
    const pages = doc.getNumberOfPages(); for (let i=1;i<=pages;i++){ doc.setPage(i); doc.setFontSize(48); doc.setTextColor(200); try { doc.text('NAF – Uso Interno', page.w/2, page.h/2, { align: 'center', angle: -30 as unknown }) } catch { doc.text('NAF – Uso Interno', page.w/2, page.h/2, { align: 'center' }) }}
    drawFooter()
    const arr = doc.output('arraybuffer') as ArrayBuffer
    return new NextResponse(new Uint8Array(arr), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.pdf"` } })

  } catch (error: unknown) {
    console.error('Erro no relatório do Coordenador:', error)
    return NextResponse.json({ error: String(error?.message || 'Erro interno') }, { status: 500 })
  }
}
