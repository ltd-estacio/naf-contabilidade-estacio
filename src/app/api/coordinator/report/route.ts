import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable, { type HookData } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel
} from 'docx'
import { buildCoordinatorComprehensiveReport } from '@/lib/reports/coordinatorComprehensiveReport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return '""'
  const str = String(value).replace(/"/g, '""')
  return `"${str}` + '"'
}

const toDateTimeBR = (value?: string | null) => {
  if (!value) return ''
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleString('pt-BR')
}

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

const formatPercentage = (value: number) => `${round(value, 1)}%`

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'pdf').toLowerCase()
    const period = (searchParams.get('period') || 'all').toLowerCase()
    const statusFilterParam = (searchParams.get('status') || 'all').toUpperCase()
    const categoryFilterParam = searchParams.get('category') || 'all'
    const studentFilterParam = searchParams.get('studentId') || searchParams.get('student') || ''

    const statusFilter = statusFilterParam === 'ALL' ? undefined : statusFilterParam
    const serviceFilter = categoryFilterParam.toLowerCase() === 'all' ? undefined : categoryFilterParam
    const studentFilter = studentFilterParam.toLowerCase() === 'all' ? undefined : studentFilterParam

    const report = await buildCoordinatorComprehensiveReport({
      period,
      status: statusFilter,
      serviceType: serviceFilter,
      studentId: studentFilter,
    })

    const totalAttendances = report.summary.totals.overall
    const statusCountsMap = new Map(report.statusDistribution.map(item => [item.status.toUpperCase(), item.count]))

    const completedCount = report.statusDistribution
      .filter(item => item.category === 'completed')
      .reduce((sum, item) => sum + item.count, 0)

    const conclusionRate = totalAttendances > 0
      ? Math.round((completedCount / totalAttendances) * 100)
      : 0

    const averageDuration = Math.round(report.summary.averageDuration || 0)
    const averageSatisfaction = round(report.summary.averageSatisfaction || 0, 1)

    const monthlyTrend = report.timeline.map(entry => {
      const [year, month] = entry.period.split('-')
      const label = `${month}/${year}`
      const completionRate = entry.total > 0 ? round((entry.completed / entry.total) * 100, 1) : 0
      return { ...entry, label, completionRate }
    })

    const lastMonth = monthlyTrend[monthlyTrend.length - 1]
    const previousMonth = monthlyTrend[monthlyTrend.length - 2]
    const monthGrowth = lastMonth && previousMonth
      ? (previousMonth.total === 0
        ? (lastMonth.total > 0 ? 100 : 0)
        : round(((lastMonth.total - previousMonth.total) / previousMonth.total) * 100, 1))
      : 0

    const averageMonthlyCompletion = monthlyTrend.length
      ? round(monthlyTrend.reduce((sum, item) => sum + item.completionRate, 0) / monthlyTrend.length, 1)
      : conclusionRate

    const averageAttendancesPerStudent = report.summary.totalStudents > 0
      ? round(totalAttendances / report.summary.totalStudents, 1)
      : totalAttendances

    const statusCount = (key: string) => statusCountsMap.get(key.toUpperCase()) || 0

    const agendadosCount = statusCount('AGENDADO') + statusCount('CONFIRMADO') + statusCount('REAGENDADO')
    const emAndamentoCount = statusCount('EM_ANDAMENTO') + statusCount('EM_PROGRESSO') + statusCount('EXECUCAO')
    const naoCompareceuCount = statusCount('NAO_COMPARECEU') + statusCount('NO_SHOW')
    const canceladosCount = statusCount('CANCELADO') + statusCount('CANCELADA')

    const urgencyCounts = report.detailedAttendances.reduce<Record<string, number>>((acc, att) => {
      const key = (att.urgency || 'N/D').toString().toUpperCase()
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const urgentCount = urgencyCounts['URGENTE'] || 0
    const highUrgencyCount = urgentCount + (urgencyCounts['ALTA'] || 0)

    const backlogCount = report.detailedAttendances
      .filter(att => ['pending', 'scheduled', 'in_progress'].includes(att.statusCategory))
      .length

    const criticalAppointments = report.detailedAttendances
      .map(att => {
        const requestedAt = att.timing.requestedAt ? new Date(att.timing.requestedAt) : null
        const daysOpen = requestedAt
          ? Math.floor((Date.now() - requestedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 0
        return {
          protocolo: att.protocol || att.id,
          cliente: att.client.name || att.client.email || '-',
          servico: att.service.name,
          status: att.status,
          statusCategory: att.statusCategory,
          urgencia: (att.urgency || 'NORMAL').toString().toUpperCase(),
          criadoEm: att.timing.requestedAt,
          diasAberto: daysOpen,
        }
      })
      .filter(item => ['pending', 'scheduled', 'in_progress'].includes(item.statusCategory) && (item.diasAberto >= 7 || ['ALTA', 'URGENTE'].includes(item.urgencia)))
      .sort((a, b) => b.diasAberto - a.diasAberto)
      .slice(0, 12)

    const attendanceFeedbacks = report.detailedAttendances
      .filter(att => att.feedback && att.feedback.trim().length > 0)
      .map(att => ({
        protocol: att.protocol || att.id,
        clientName: att.client.name || att.client.email || 'Cliente',
        studentName: att.student.name || 'Estudante',
        serviceType: att.service.name,
        rating: att.satisfaction || 0,
        feedback: att.feedback,
        scheduledDate: att.timing.scheduledDate,
        scheduledTime: att.timing.scheduledTime,
        completedAt: att.timing.completedAt,
        status: att.status,
      }))
      .slice(0, 50)

    const notesFlattened = report.detailedAttendances.flatMap(att =>
      (att.notes || []).map(note => ({
        protocol: att.protocol || att.id,
        service: att.service.name,
        student: att.student.name || 'Estudante',
        note: note.note,
        createdAt: note.createdAt,
      }))
    )

    const weeklyBuckets = Array.from({ length: 7 }).map(() => ({ atendimentos: 0, agendamentos: 0 }))
    report.detailedAttendances.forEach(att => {
      const dateRef = att.timing.scheduledDate || att.timing.requestedAt
      if (!dateRef) return
      const dt = new Date(dateRef)
      if (Number.isNaN(dt.getTime())) return
      const day = dt.getDay()
      if (['completed'].includes(att.statusCategory)) {
        weeklyBuckets[day].atendimentos += 1
      }
      if (['scheduled', 'pending'].includes(att.statusCategory)) {
        weeklyBuckets[day].agendamentos += 1
      }
    })

    const weeklyData = DAYS_OF_WEEK.map((day, index) => ({
      day,
      atendimentos: weeklyBuckets[index].atendimentos,
      agendamentos: weeklyBuckets[index].agendamentos,
    }))

    const topServices = report.servicePerformance.slice(0, 10)
    const topStudents = report.studentInsights.slice(0, 10)

    const cancellationRate = totalAttendances > 0
      ? round((canceladosCount / totalAttendances) * 100, 1)
      : 0

    const insights: string[] = []

    if (monthGrowth !== 0) {
      insights.push(`📈 Variação de volume: ${monthGrowth > 0 ? '+' : ''}${monthGrowth}% em relação ao mês anterior${monthGrowth > 20 ? ' — crescimento relevante' : monthGrowth < -20 ? ' — queda acentuada' : ''}.`)
    }

    insights.push(`✅ Taxa de conclusão geral: ${conclusionRate}% | Média mensal: ${averageMonthlyCompletion}%.`)

    if (agendadosCount > 0) {
      insights.push(`📅 ${agendadosCount} atendimentos aguardam realização (agendados/confirmados).`)
    }

    if (emAndamentoCount > 0) {
      insights.push(`⏳ ${emAndamentoCount} atendimentos estão em andamento.`)
    }

    if (naoCompareceuCount > 0) {
      const naoCompareceuRate = totalAttendances > 0 ? Math.round((naoCompareceuCount / totalAttendances) * 100) : 0
      insights.push(`⚠️ ${naoCompareceuCount} casos de não comparecimento (${naoCompareceuRate}% do total).`)
    }

    if (averageSatisfaction) {
      insights.push(`⭐ Satisfação média registrada: ${averageSatisfaction}/5.`)
    }

    if (highUrgencyCount > 0) {
      insights.push(`🔴 ${highUrgencyCount} demandas com alta urgência identificadas (incluindo ${urgentCount} urgentes).`)
    }

    if (backlogCount > 0) {
      const backlogRate = totalAttendances > 0 ? Math.round((backlogCount / totalAttendances) * 100) : 0
      insights.push(`📊 Backlog atual: ${backlogCount} atendimentos em aberto (${backlogRate}% do total).`)
    }

    if (criticalAppointments.length > 0) {
      insights.push(`⚡ ${criticalAppointments.length} atendimentos críticos (≥7 dias ou urgência alta) requerem prioridade imediata.`)
    }

    if (topServices.length > 0) {
      insights.push(`🏆 Serviço mais demandado: "${topServices[0].name}" (${topServices[0].total} registros).`)
    }

    if (report.clientCategories.length > 0) {
      const topSegment = report.clientCategories[0]
      insights.push(`👥 Público principal: ${topSegment.category} (${round(topSegment.percent, 1)}% dos atendimentos).`)
    }

    if (report.studentInsights.length > 0) {
      const destaque = report.studentInsights[0]
      insights.push(`🌟 Estudante destaque: ${destaque.name || 'Sem nome'} — ${destaque.totalAttendances} atendimentos, conclusão ${round(destaque.completionRate, 1)}%.`)
    }

    if (averageAttendancesPerStudent) {
      insights.push(`📌 Média de ${averageAttendancesPerStudent} atendimentos por estudante ativo.`)
    }

    if (averageDuration) {
      insights.push(`⏱️ Tempo médio por atendimento: ${averageDuration} minutos.`)
    }

    if (attendanceFeedbacks.length > 0) {
      insights.push(`💬 ${attendanceFeedbacks.length} feedbacks qualificados coletados no período.`)
    }

    if (cancellationRate > 0) {
      insights.push(`❌ Taxa de cancelamento: ${cancellationRate}%${cancellationRate > 15 ? ' — atenção: índice elevado' : ''}.`)
    }

    const summaryRows = [
      { label: 'Total de atendimentos (todos os tipos)', value: totalAttendances },
      { label: 'Atendimentos regulares', value: report.summary.totals.regular },
      { label: 'Atendimentos fiscais', value: report.summary.totals.fiscal },
      { label: 'Taxa de conclusão', value: `${conclusionRate}%` },
      { label: 'Tempo médio', value: `${averageDuration} min` },
      { label: 'Satisfação média', value: averageSatisfaction ? `${averageSatisfaction}/5` : 'N/D' },
      { label: 'Atendimentos reagendados', value: report.summary.rescheduledCount },
      { label: 'Backlog atual', value: backlogCount },
      { label: 'Pendências críticas', value: criticalAppointments.length },
      { label: 'Notas de Registro', value: report.summary.totalNotes },
    ]

    const monthlySeries = monthlyTrend.map(item => ({ label: item.label, value: item.total }))
    const monthlyCompletionSeries = monthlyTrend.map(item => ({ label: item.label, value: item.completionRate }))
    const statusChartData = report.statusDistribution.map(item => ({ label: item.label, value: item.count }))
    const serviceChartData = topServices.slice(0, 6).map(item => ({ label: item.name, value: item.total }))

    if (format === 'csv') {
      const header = [
        'Protocolo',
        'Tipo',
        'Serviço',
        'Status',
        'StatusCategoria',
        'Aluno',
        'Curso',
        'Cliente',
        'CategoriaCliente',
        'AgendadoEm',
        'IniciadoEm',
        'ConcluidoEm',
        'Urgencia',
        'Online',
        'Reagendado',
        'Satisfacao',
        'DuracaoMin',
        'NotasRegistradas'
      ]

      const rows = report.detailedAttendances.map(att => ([
        csvEscape(att.protocol || att.id),
        csvEscape(att.type),
        csvEscape(att.service.name),
        csvEscape(att.status),
        csvEscape(att.statusCategory),
        csvEscape(att.student.name || ''),
        csvEscape(att.student.course || ''),
        csvEscape(att.client.name || att.client.email || ''),
        csvEscape(att.clientCategory || ''),
        csvEscape(toDateTimeBR(att.timing.scheduledDate)),
        csvEscape(toDateTimeBR(att.timing.startedAt)),
        csvEscape(toDateTimeBR(att.timing.completedAt)),
        csvEscape(att.urgency || ''),
        csvEscape(att.isOnline ? 'Sim' : 'Não'),
        csvEscape(att.rescheduled ? 'Sim' : 'Não'),
        csvEscape(att.satisfaction ? att.satisfaction.toString() : ''),
        csvEscape(att.durationMinutes ? att.durationMinutes.toString() : ''),
        csvEscape(String(att.notesCount)),
      ]).join(','))

      const csvContent = [header.join(','), ...rows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new()

      const resumoSheet = summaryRows.map(row => ({ Indicador: row.label, Valor: row.value }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumoSheet), 'Resumo')

      const attendancesSheet = report.detailedAttendances.map(att => ({
        Protocolo: att.protocol || att.id,
        Tipo: att.type === 'regular' ? 'Regular' : 'Fiscal',
        Servico: att.service.name,
        Status: att.status,
        CategoriaStatus: att.statusLabel,
        Estudante: att.student.name || '',
        EmailEstudante: att.student.email || '',
        Curso: att.student.course || '',
        Semestre: att.student.semester || '',
        Cliente: att.client.name || '',
        CategoriaCliente: att.clientCategory || '',
        AgendadoEm: toDateTimeBR(att.timing.scheduledDate),
        IniciadoEm: toDateTimeBR(att.timing.startedAt),
        ConcluidoEm: toDateTimeBR(att.timing.completedAt),
        Urgencia: att.urgency || '',
        Online: att.isOnline ? 'Sim' : 'Não',
        Reagendado: att.rescheduled ? 'Sim' : 'Não',
        NotasRegistradas: att.notesCount,
        Satisfacao: att.satisfaction || '',
        DuracaoMin: att.durationMinutes || '',
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendancesSheet), 'Atendimentos')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notesFlattened.map(note => ({
        Protocolo: note.protocol,
        Servico: note.service,
        Estudante: note.student,
        Registro: note.note,
        RegistradoEm: toDateTimeBR(note.createdAt)
      }))), 'RegistroAtendimento')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.statusDistribution.map(item => ({
        Status: item.label,
        Quantidade: item.count,
        Categoria: item.category,
      }))), 'DistribuicaoStatus')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.servicePerformance.map(item => ({
        Servico: item.name,
        Categoria: item.category,
        Total: item.total,
        Conclusao: round(item.completionRate, 1),
        Pendentes: item.pending,
        Cancelados: item.cancelled,
        SatisfacaoMedia: round(item.averageSatisfaction || 0, 2),
        DuracaoMedia: item.averageDuration ? round(item.averageDuration || 0, 2) : '',
      }))), 'Servicos')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.studentInsights.map(item => ({
        Estudante: item.name || '',
        Email: item.email || '',
        Curso: item.course || '',
        Semestre: item.semester || '',
        TotalAtendimentos: item.totalAttendances,
        TaxaConclusao: round(item.completionRate, 1),
        SatisfacaoMedia: round(item.averageSatisfaction || 0, 2),
        NotasRegistradas: item.notesCount,
      }))), 'Estudantes')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.courseDistribution.map(item => ({
        Curso: item.course,
        Total: item.total,
      }))), 'Cursos')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.clientCategories.map(item => ({
        Categoria: item.category,
        Total: item.total,
        Percentual: round(item.percent, 1),
      }))), 'Publico')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyTrend.map(item => ({
        Mes: item.label,
        Total: item.total,
        Concluidos: item.completed,
        EmAndamento: item.inProgress,
        TaxaConclusao: item.completionRate,
      }))), 'Timeline')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(criticalAppointments.map(item => ({
        Protocolo: item.protocolo,
        Cliente: item.cliente,
        Servico: item.servico,
        Status: item.status,
        Urgencia: item.urgencia,
        CriadoEm: toDateTimeBR(item.criadoEm),
        DiasAberto: item.diasAberto,
      }))), 'PendenciasCriticas')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceFeedbacks.map(item => ({
        Protocolo: item.protocol,
        Cliente: item.clientName,
        Estudante: item.studentName,
        Servico: item.serviceType,
        Avaliacao: item.rating,
        Feedback: item.feedback,
        Status: item.status,
        AgendadoEm: toDateTimeBR(item.scheduledDate),
        ConcluidoEm: toDateTimeBR(item.completedAt),
      }))), 'Feedbacks')

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(insights.map((text, index) => ({
        Ordem: index + 1,
        Insight: text,
      }))), 'Insights')

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    if (format === 'doc' || format === 'docx') {
      const nowLocale = new Date().toLocaleString('pt-BR')
      const children: Paragraph[] = []

      const addHeading = (text: string, level: HeadingLevel) => {
        children.push(new Paragraph({ text, heading: level }))
      }

      const addBullet = (text: string) => {
        children.push(new Paragraph({ text, bullet: { level: 0 } }))
      }

      children.push(new Paragraph({
        children: [new TextRun({ text: 'Relatório Executivo do Coordenador - NAF', bold: true, size: 30 })],
        alignment: AlignmentType.CENTER,
      }))
      children.push(new Paragraph({
        children: [new TextRun({ text: `Gerado em: ${nowLocale}`, size: 20 })],
        alignment: AlignmentType.CENTER,
      }))
      children.push(new Paragraph({ text: '' }))

      addHeading('Resumo Executivo', HeadingLevel.HEADING_1)
      summaryRows.forEach(row => addBullet(`${row.label}: ${row.value}`))
      children.push(new Paragraph({ text: '' }))

      addHeading('Principais Insights', HeadingLevel.HEADING_1)
      insights.forEach(text => addBullet(text))
      children.push(new Paragraph({ text: '' }))

      addHeading('Distribuição por Status', HeadingLevel.HEADING_2)
      const statusTableRows = [
        new TableRow({
          children: ['Status', 'Categoria', 'Quantidade'].map(cell =>
            new TableCell({ children: [new Paragraph({ text: cell, bold: true })] })
          ),
        }),
        ...report.statusDistribution.map(item => new TableRow({
          children: [item.label, item.category, String(item.count)].map(cell =>
            new TableCell({ children: [new Paragraph(String(cell))] })
          ),
        })),
      ]
      children.push(new Table({ rows: statusTableRows }))
      children.push(new Paragraph({ text: '' }))

      addHeading('Serviços em Destaque', HeadingLevel.HEADING_2)
      const servicesTableRows = [
        new TableRow({
          children: ['Serviço', 'Total', 'Conclusão (%)', 'Satisfação'].map(cell =>
            new TableCell({ children: [new Paragraph({ text: cell, bold: true })] })
          ),
        }),
        ...topServices.map(item => new TableRow({
          children: [
            item.name,
            String(item.total),
            formatPercentage(item.completionRate),
            item.averageSatisfaction ? String(round(item.averageSatisfaction, 2)) : 'N/D',
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] })),
        })),
      ]
      children.push(new Table({ rows: servicesTableRows }))
      children.push(new Paragraph({ text: '' }))

      addHeading('Estudantes com Maior Atuação', HeadingLevel.HEADING_2)
      const studentsTableRows = [
        new TableRow({
          children: ['Estudante', 'Curso', 'Atendimentos', 'Conclusão (%)', 'Notas'].map(cell =>
            new TableCell({ children: [new Paragraph({ text: cell, bold: true })] })
          ),
        }),
        ...topStudents.map(item => new TableRow({
          children: [
            item.name || 'Sem nome',
            item.course || '-',
            String(item.totalAttendances),
            formatPercentage(item.completionRate),
            String(item.notesCount),
          ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] })),
        })),
      ]
      children.push(new Table({ rows: studentsTableRows }))
      children.push(new Paragraph({ text: '' }))

      if (criticalAppointments.length > 0) {
        addHeading('Pendências Críticas', HeadingLevel.HEADING_2)
        const criticalRows = [
          new TableRow({
            children: ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Urgência', 'Dias em aberto'].map(cell =>
              new TableCell({ children: [new Paragraph({ text: cell, bold: true })] })
            ),
          }),
          ...criticalAppointments.map(item => new TableRow({
            children: [
              item.protocolo,
              item.cliente,
              item.servico,
              item.status,
              item.urgencia,
              String(item.diasAberto),
            ].map(cell => new TableCell({ children: [new Paragraph(String(cell))] })),
          })),
        ]
        children.push(new Table({ rows: criticalRows }))
        children.push(new Paragraph({ text: '' }))
      }

      if (notesFlattened.length > 0) {
        addHeading('Registros de Atendimento (amostra)', HeadingLevel.HEADING_2)
        notesFlattened.slice(0, 15).forEach(note => {
          children.push(new Paragraph({
            text: `${note.protocol} — ${note.student}: ${note.note} (${toDateTimeBR(note.createdAt)})`,
          }))
        })
        if (notesFlattened.length > 15) {
          children.push(new Paragraph({ text: `... ${notesFlattened.length - 15} registro(s) adicional(is).` }))
        }
      }

      const doc = new Document({ sections: [{ properties: {}, children }] })
      const buffer = await Packer.toBuffer(doc)

      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.docx"`
        }
      })
    }

    // -------- PDF ---------
    const pdf = new (jsPDF as unknown as typeof jsPDF)('p', 'pt', 'a4')
    const page = { w: pdf.internal.pageSize.getWidth(), h: pdf.internal.pageSize.getHeight() }
    const pad = 32

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
    } catch (err) {
      console.warn('Falha ao carregar logotipo do relatório', err)
    }

    const drawHeader = () => {
      pdf.setFillColor(236, 248, 255)
      pdf.rect(0, 0, page.w, 90, 'F')
      if (logoDataUrl) {
        try { pdf.addImage(logoDataUrl, 'PNG', pad, 24, 90, 36) } catch {}
      }
      pdf.setFontSize(20)
      pdf.setTextColor(24, 45, 120)
      pdf.text('Relatório Executivo do Coordenador - NAF', logoDataUrl ? pad + 110 : pad, 42)
      pdf.setFontSize(11)
      pdf.setTextColor(55, 65, 81)
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} • Período: ${period.toUpperCase()}`, logoDataUrl ? pad + 110 : pad, 62)
    }

    const drawFooter = () => {
      const pages = pdf.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(120, 132, 149)
        pdf.text(`Relatório Executivo • Pág. ${i}/${pages}`, pad, page.h - 20)
      }
    }

    const drawAxes = (x: number, y: number, w: number, h: number) => {
      pdf.setDrawColor(229, 231, 235)
      pdf.setLineWidth(0.5)
      for (let i = 0; i <= 4; i++) {
        const gy = y + 12 + (h - 24) * (i / 4)
        pdf.line(x + 30, gy, x + w - 10, gy)
      }
      pdf.setDrawColor(120, 132, 149)
      pdf.line(x + 30, y + 12, x + 30, y + h - 12)
      pdf.line(x + 30, y + h - 12, x + w - 10, y + h - 12)
    }

    const drawBar = (
      x: number,
      y: number,
      w: number,
      h: number,
      series: { label: string; value: number }[],
      title: string,
      color: [number, number, number]
    ) => {
      pdf.setFontSize(12)
      pdf.setTextColor(30, 41, 59)
      pdf.text(title, x, y - 6)
      drawAxes(x, y, w, h)
      const max = Math.max(1, ...series.map(s => s.value))
      const innerW = w - 50
      const barW = Math.max(10, innerW / Math.max(1, series.length * 1.6))
      series.forEach((s, i) => {
        const bh = ((h - 30) * s.value) / max
        const bx = x + 40 + i * (barW + 6)
        const by = y + h - 12 - bh
        pdf.setFillColor(...color)
        pdf.rect(bx, by, barW, bh, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(79, 89, 102)
        pdf.text(String(s.label).slice(0, 10), bx, y + h)
      })
    }

    const drawLine = (
      x: number,
      y: number,
      w: number,
      h: number,
      series: { label: string; value: number }[],
      title: string,
      color: [number, number, number]
    ) => {
      pdf.setFontSize(12)
      pdf.setTextColor(31, 41, 55)
      pdf.text(title, x, y - 6)
      drawAxes(x, y, w, h)
      const max = Math.max(1, ...series.map(s => s.value))
      const innerW = w - 50
      const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW
      pdf.setDrawColor(...color)
      pdf.setLineWidth(1.4)
      series.forEach((s, i) => {
        const px = x + 30 + i * stepX
        const py = y + h - 12 - ((h - 30) * s.value) / max
        if (i > 0) {
          const prev = series[i - 1]
          const ppx = x + 30 + (i - 1) * stepX
          const ppy = y + h - 12 - ((h - 30) * prev.value) / max
          pdf.line(ppx, ppy, px, py)
        }
        pdf.setFillColor(...color)
        pdf.circle(px, py, 2.2, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(79, 89, 102)
        pdf.text(String(s.label).slice(0, 6), px - 10, y + h)
      })
    }

    drawHeader()
    let cursorY = 110

    autoTable(pdf, {
      startY: cursorY,
      head: [['Indicador', 'Valor']],
      body: summaryRows.map(row => [row.label, String(row.value)]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      alternatingRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: { 0: { cellWidth: 240 } },
    })

    cursorY = (pdf as any).lastAutoTable.finalY + 16

    autoTable(pdf, {
      startY: cursorY,
      head: [['Insights e Recomendações']],
      body: insights.map(text => [text]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5, textColor: [55, 65, 81] },
      headStyles: { fontSize: 10, fontStyle: 'bold' },
      margin: { left: pad, right: pad },
    })

    cursorY = (pdf as any).lastAutoTable.finalY + 24

    drawBar(pad, cursorY, (page.w - 3 * pad) / 2, 160, statusChartData, 'Distribuição por Status', [37, 99, 235])
    drawLine(pad + (page.w - 3 * pad) / 2 + pad, cursorY, (page.w - 3 * pad) / 2, 160, monthlySeries, 'Volume mensal', [16, 185, 129])

    cursorY += 190

    drawLine(pad, cursorY, (page.w - 3 * pad) / 2, 160, monthlyCompletionSeries, 'Taxa de conclusão mensal (%)', [99, 102, 241])
    drawBar(
      pad + (page.w - 3 * pad) / 2 + pad,
      cursorY,
      (page.w - 3 * pad) / 2,
      160,
      serviceChartData,
      'Top Serviços por volume',
      [245, 158, 11]
    )

    cursorY += 190

    autoTable(pdf, {
      startY: cursorY,
      head: [['Dia', 'Atendimentos', 'Agendamentos']],
      body: weeklyData.map(row => [row.day, String(row.atendimentos), String(row.agendamentos)]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
      margin: { left: pad, right: pad },
    })

    cursorY = (pdf as any).lastAutoTable.finalY + 18

    autoTable(pdf, {
      startY: cursorY,
      head: [['Estudante', 'Curso', 'Atend.', 'Conclusão', 'Notas']],
      body: topStudents.map(student => [
        student.name || 'Sem nome',
        student.course || '-',
        String(student.totalAttendances),
        formatPercentage(student.completionRate),
        String(student.notesCount),
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
      margin: { left: pad, right: pad },
    })

    cursorY = (pdf as any).lastAutoTable.finalY + 18

    if (criticalAppointments.length > 0) {
      autoTable(pdf, {
        startY: cursorY,
        head: [['Protocolo', 'Cliente', 'Serviço', 'Urgência', 'Dias']],
        body: criticalAppointments.map(item => [
          item.protocolo,
          item.cliente,
          item.servico,
          item.urgencia,
          String(item.diasAberto),
        ]),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255] },
        margin: { left: pad, right: pad },
      })
      cursorY = (pdf as any).lastAutoTable.finalY + 18
    }

    autoTable(pdf, {
      startY: cursorY,
      head: [['Registro do Atendimento']],
      body: (notesFlattened.slice(0, 12)).map(note => [
        `${note.protocol} • ${note.student} • ${toDateTimeBR(note.createdAt)}\n${note.note}`
      ]),
      styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
      margin: { left: pad, right: pad },
      didDrawPage: (data: HookData) => {
        if (data.cursor.y > page.h - 80) {
          pdf.addPage()
        }
      }
    })

    drawFooter()

    const pdfBuffer = pdf.output('arraybuffer')

    return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-coordenador-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    console.error('❌ Erro ao gerar relatório do coordenador:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
