import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } from 'docx'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'pdf').toLowerCase()
    const period = (searchParams.get('period') || '6m').toLowerCase() // 3m|6m|12m|all
    const statusFilter = (searchParams.get('status') || 'all').toUpperCase()
    const categoryFilter = searchParams.get('category') || 'all'

    // Choose the best client (service if available, else anon)
    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    // Compute period start
    let startDateISO: string | undefined = undefined
    if (period !== 'all') {
      const now = new Date()
      const months = period === '3m' ? 3 : period === '12m' ? 12 : 6
      const start = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      startDateISO = start.toISOString()
    }

    // Helper to apply filters
    const applyFilters = (q: unknown, st?: string) => {
      let query = q
      if (startDateISO) query = query.gte('created_at', startDateISO)
      if (categoryFilter && categoryFilter !== 'all') query = query.eq('service_category', categoryFilter)
      if (st && st !== 'all') query = query.eq('status', st)
      if (!st && statusFilter !== 'all') query = query.eq('status', statusFilter)
      return query
    }

    // Load filtered appointments sample/table
    let baseSelect = client
      .from('fiscal_appointments')
      .select('id, protocol, client_name, service_title, service_category, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)
    baseSelect = applyFilters(baseSelect)
    const { data: appointments } = await baseSelect

    const statuses = ['PENDENTE','CONFIRMADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO'] as const
    const statusCounts: Record<string, number> = {}
    for (const st of statuses) {
      let countQuery = client
        .from('fiscal_appointments')
        .select('id', { count: 'exact', head: true })
      countQuery = applyFilters(countQuery, st)
      const { count } = await countQuery
      statusCounts[st] = count || 0
    }
    let totalQuery = client
      .from('fiscal_appointments')
      .select('id', { count: 'exact', head: true })
    totalQuery = applyFilters(totalQuery)
    const { count: totalAppointments } = await totalQuery

    const { count: activeStudents } = await client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ATIVO')

    // Category counts and monthly series
    let eventsQuery = client
      .from('fiscal_appointments')
      .select('service_category, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5000)
    eventsQuery = applyFilters(eventsQuery)
    const { data: eventsData } = await eventsQuery

    const categoryCounts: Record<string, number> = {}
    const monthlyCounts: Record<string, number> = {}
    const monthlyCompletedCounts: Record<string, number> = {}
    for (const row of eventsData || []) {
      const cat = (row as unknown)?.service_category || 'OUTROS'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      const d = new Date((row as unknown)?.created_at)
      const key = isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key) {
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1
        if ((row as unknown)?.status === 'CONCLUIDO') monthlyCompletedCounts[key] = (monthlyCompletedCounts[key] || 0) + 1
      }
    }

    const now = new Date()
    const monthKeys: string[] = []
    const monthLabels: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))
    }

    // Handlers by format
    if (format === 'csv') {
      const rows: string[] = []
      rows.push('protocol,client_name,service_title,service_category,status,created_at')
      for (const a of appointments || []) {
        rows.push([
          a.protocol,
          JSON.stringify(a.client_name || ''),
          JSON.stringify(a.service_title || ''),
          JSON.stringify(a.service_category || ''),
          a.status,
          a.created_at
        ].join(','))
      }
      const csv = rows.join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio-naf-management-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'excel' || format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(appointments || [])
      XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos')
      const summary = [
        { metric: 'Total', value: totalAppointments || 0 },
        ...Object.entries(statusCounts).map(([k, v]) => ({ metric: `Status ${k}`, value: v })),
        { metric: 'Estudantes Ativos', value: activeStudents || 0 },
      ]
      const ws2 = XLSX.utils.json_to_sheet(summary)
      XLSX.utils.book_append_sheet(wb, ws2, 'Resumo')
      // Categorias
      const ws3 = XLSX.utils.json_to_sheet(Object.entries(categoryCounts).map(([k, v]) => ({ categoria: k, total: v })))
      XLSX.utils.book_append_sheet(wb, ws3, 'Categorias')
      // Séries mensais
      const ws4 = XLSX.utils.json_to_sheet(monthKeys.map((k, i) => ({ mes: monthLabels[i], total: monthlyCounts[k] || 0, concluidos: monthlyCompletedCounts[k] || 0 })))
      XLSX.utils.book_append_sheet(wb, ws4, 'Mensal')
      // Resumo Visual (barras textuais)
      const maxStatus = Math.max(1, ...Object.values(statusCounts))
      const maxMonthly = Math.max(1, ...monthKeys.map(k => monthlyCounts[k] || 0))
      const bar = (val: number, max: number, width = 30) => '█'.repeat(Math.max(1, Math.round((val / max) * width)))
      const visualRows: unknown[] = []
      visualRows.push(['KPI', 'Valor'])
      visualRows.push(['Total', totalAppointments || 0])
      visualRows.push(['Concluídos', statusCounts['CONCLUIDO'] || 0])
      visualRows.push(['Estudantes Ativos', activeStudents || 0])
      visualRows.push([])
      visualRows.push(['Status', 'Qtd', 'Barra'])
      ;(['CONCLUIDO','EM_ANDAMENTO','PENDENTE','CONFIRMADO','CANCELADO'] as const).forEach(s => {
        const v = statusCounts[s] || 0
        visualRows.push([s, v, bar(v, maxStatus)])
      })
      visualRows.push([])
      visualRows.push(['Mensal', 'Total', 'Concluídos', 'Conversão %', 'Barra (Total)'])
      monthKeys.forEach((k, i) => {
        const tot = monthlyCounts[k] || 0
        const comp = monthlyCompletedCounts[k] || 0
        const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0
        visualRows.push([monthLabels[i], tot, comp, pct, bar(tot, maxMonthly)])
      })
      const ws5 = XLSX.utils.aoa_to_sheet(visualRows)
      XLSX.utils.book_append_sheet(wb, ws5, 'ResumoVisual')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio-naf-management-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    if (format === 'doc' || format === 'docx') {
      const children: unknown[] = []
      children.push(new Paragraph({ children: [new TextRun({ text: 'Relatório NAF Management', bold: true, size: 28 })], alignment: AlignmentType.CENTER }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`, size: 20 })], alignment: AlignmentType.CENTER }))
      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ children: [new TextRun({ text: 'Resumo', bold: true, size: 24 })] }))
      for (const [k, v] of Object.entries({ Total: totalAppointments || 0, ...statusCounts, EstudantesAtivos: activeStudents || 0 })) {
        children.push(new Paragraph({ children: [new TextRun({ text: `${k}: ${v}` })] }))
      }
      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ children: [new TextRun({ text: 'Categorias (Top)', bold: true, size: 24 })] }))
      Object.entries(categoryCounts).sort((a: unknown, b: unknown) => b[1] - a[1]).slice(0, 10)
        .forEach(([k, v]) => children.push(new Paragraph({ children: [new TextRun({ text: `${k}: ${v}` })] })))
      children.push(new Paragraph({ text: '' }))
      children.push(new Paragraph({ children: [new TextRun({ text: 'Amostra de Atendimentos', bold: true, size: 24 })] }))
      const head = new TableRow({ children: ['Protocolo','Cliente','Serviço','Categoria','Status','Criado em'].map(h => new TableCell({ children: [new Paragraph(h)] })) })
      const rows = (appointments || []).slice(0, 50).map(a => new TableRow({
        children: [a.protocol, a.client_name, a.service_title, a.service_category, a.status, new Date(a.created_at).toLocaleDateString('pt-BR')]
          .map(val => new TableCell({ children: [new Paragraph(String(val || '-'))] }))
      }))
      children.push(new Table({ rows: [head, ...rows] }))
      const doc = new Document({ sections: [{ properties: {}, children }] })
      const buffer = await Packer.toBuffer(doc)
      return new NextResponse(buffer as unknown, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="relatorio-naf-management-${new Date().toISOString().split('T')[0]}.docx"`
        }
      })
    }

    // Default: PDF
    const doc: unknown = new (jsPDF as unknown)('p', 'pt', 'a4')
    const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() }
    const pad = 24

    // Try to load logo (from env REPORT_LOGO_URL or /logo.png at base URL)
    let logoDataUrl: string | null = null
    try {
      const candidate = process.env.REPORT_LOGO_URL || `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png`
      if (candidate && candidate.startsWith('http')) {
        const r = await fetch(candidate)
        if (r.ok) {
          const buf = await r.arrayBuffer()
          const bin = Buffer.from(buf).toString('base64')
          logoDataUrl = `data:image/png;base64,${bin}`
        }
      }
    } catch {}

    const drawHeader = () => {
      doc.setFillColor(236, 253, 245) // emerald-50
      doc.rect(0, 0, page.w, 80, 'F')
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, 'PNG', pad, 20, 80, 32)
        } catch {}
      }
      doc.setFontSize(20)
      doc.setTextColor(16, 185, 129)
      doc.text('Relatório NAF Management', logoDataUrl ? pad + 96 : pad, 40)
      doc.setFontSize(12)
      doc.setTextColor(31, 41, 55)
      const filtersDesc = [
        period !== 'all' ? `Período: ${period.toUpperCase()}` : 'Período: TODOS',
        statusFilter !== 'ALL' ? `Status: ${statusFilter}` : 'Status: TODOS',
        categoryFilter !== 'all' ? `Categoria: ${categoryFilter}` : 'Categoria: TODAS'
      ].join('  •  ')
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  •  ${filtersDesc}`, logoDataUrl ? pad + 96 : pad, 60)
    }
    const drawFooter = () => {
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(`NAF Management • Página ${i} de ${pageCount}`, pad, page.h - 20)
      }
    }
    const drawKpi = (x: number, y: number, w: number, h: number, label: string, value: string, color: [number, number, number]) => {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(x, y, w, h, 6, 6, 'F')
      doc.setDrawColor(color[0], color[1], color[2])
      doc.roundedRect(x, y, w, h, 6, 6)
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(label, x + 12, y + 18)
      doc.setFontSize(18)
      doc.setTextColor(31, 41, 55)
      doc.text(value, x + 12, y + 40)
    }

    // Chart helpers (vector drawing)
    const drawAxes = (x: number, y: number, w: number, h: number) => {
      doc.setDrawColor(229, 231, 235) // grid lines
      doc.setLineWidth(0.5)
      for (let i = 0; i <= 4; i++) {
        const gy = y + 10 + (h - 20) * (i / 4)
        doc.line(x + 30, gy, x + w - 10, gy)
      }
      doc.setDrawColor(107, 114, 128) // axes
      doc.line(x + 30, y + 10, x + 30, y + h - 10)
      doc.line(x + 30, y + h - 10, x + w - 10, y + h - 10)
    }

    const drawBarChart = (x: number, y: number, w: number, h: number, series: { label: string; value: number }[], title: string, color: [number, number, number]) => {
      doc.setFontSize(12)
      doc.setTextColor(31, 41, 55)
      doc.text(title, x, y - 6)
      drawAxes(x, y, w, h)
      const max = Math.max(1, ...series.map(s => s.value))
      const innerW = w - 50
      const barW = Math.max(8, innerW / Math.max(1, series.length * 1.6))
      series.forEach((s, i) => {
        const bh = ((h - 30) * s.value) / max
        const bx = x + 40 + i * (barW + 6)
        const by = y + h - 10 - bh
        doc.setFillColor(color[0], color[1], color[2])
        doc.rect(bx, by, barW, bh, 'F')
        doc.setFontSize(8)
        doc.setTextColor(75, 85, 99)
        doc.text(String(s.label).slice(0, 8), bx, y + h)
      })
    }

    const drawLineChart = (x: number, y: number, w: number, h: number, series: { label: string; value: number }[], title: string, color: [number, number, number]) => {
      doc.setFontSize(12)
      doc.setTextColor(31, 41, 55)
      doc.text(title, x, y - 6)
      drawAxes(x, y, w, h)
      const max = Math.max(1, ...series.map(s => s.value))
      const innerW = w - 50
      const stepX = innerW / Math.max(1, series.length - 1)
      doc.setDrawColor(color[0], color[1], color[2])
      doc.setLineWidth(1.5)
      series.forEach((s, i) => {
        const px = x + 30 + i * stepX
        const py = y + h - 10 - ((h - 30) * s.value) / max
        if (i > 0) {
          const ppX = x + 30 + (i - 1) * stepX
          const ppY = y + h - 10 - ((h - 30) * series[i - 1].value) / max
          doc.line(ppX, ppY, px, py)
        }
        doc.setFillColor(color[0], color[1], color[2])
        doc.circle(px, py, 2, 'F')
      })
      doc.setFontSize(8)
      doc.setTextColor(75, 85, 99)
      series.forEach((s, i) => {
        const px = x + 30 + i * stepX
        doc.text(String(s.label).slice(0, 6), px - 8, y + h)
      })
    }

    drawHeader()
    const kpiY = 96
    const kpiW = (page.w - pad * 2 - 18) / 3
    const completed = statusCounts['CONCLUIDO'] || 0
    const confirmed = statusCounts['CONFIRMADO'] || 0
    const emAndamento = statusCounts['EM_ANDAMENTO'] || 0
    drawKpi(pad, kpiY, kpiW, 54, 'Total', String(totalAppointments || 0), [59, 130, 246])
    drawKpi(pad + kpiW + 9, kpiY, kpiW, 54, 'Concluídos', String(completed), [16, 185, 129])
    drawKpi(pad + (kpiW + 9) * 2, kpiY, kpiW, 54, 'Estudantes Ativos', String(activeStudents || 0), [139, 92, 246])

    // Resumo Executivo + Status distribution (com conversão)
    let y = kpiY + 70
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Resumo Executivo', pad, y)
    y += 14
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    const total = totalAppointments || 0
    const concluidos = statusCounts['CONCLUIDO'] || 0
    const conv = total > 0 ? Math.round((concluidos / total) * 100) : 0
    const topCatEntry = Object.entries(categoryCounts).sort((a: unknown, b: unknown) => b[1] - a[1])[0]
    const topCatText = topCatEntry ? `${topCatEntry[0]} (${topCatEntry[1]})` : 'N/D'
    const execLines = [
      `• Total de atendimentos considerados: ${total.toLocaleString('pt-BR')}. Concluídos: ${concluidos.toLocaleString('pt-BR')} (conversão ${conv}%).`,
      `• Estudantes ativos: ${activeStudents || 0}. Categoria mais recorrente: ${topCatText}.`
    ]
    execLines.forEach(line => {
      const wrapped = doc.splitTextToSize(line, page.w - pad * 2)
      if (y + wrapped.length * 12 > page.h - 40) { doc.addPage(); y = 40 }
      doc.text(wrapped, pad, y)
      y += wrapped.length * 12
    })
    if (y + 100 > page.h - 40) { doc.addPage(); y = 40 }
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Distribuição por Status', pad, y)
    y += 14
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    for (const key of statuses) {
      doc.text(`${key}: ${statusCounts[key] || 0}`, pad, y)
      y += 12
    }
    doc.text(`Conversão (Concluídos/Total): ${conv}%`, pad, y + 4)

    // New page for vector charts + table
    doc.addPage()
    const colW = (page.w - pad * 2 - 12) / 2
    const chartH = 160
    const topY = 60
    // Título explicativo dos gráficos
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text('Análises Visuais', pad, 40)
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    const introLines = doc.splitTextToSize(
      'Os gráficos abaixo apresentam a distribuição por status e por categoria e, em seguida, a tendência mensal do volume total de atendimentos, dos concluídos e da taxa de conversão.',
      page.w - pad * 2
    )
    doc.text(introLines, pad, 56)

    // Status chart
    const statusSeriesVec = ['CONCLUIDO','EM_ANDAMENTO','PENDENTE','CONFIRMADO','CANCELADO'].map((label) => ({
      label: label === 'CONCLUIDO' ? 'Concl.' : label === 'EM_ANDAMENTO' ? 'And.' : label === 'PENDENTE' ? 'Pend.' : label === 'CONFIRMADO' ? 'Conf.' : 'Canc.',
      value: statusCounts[label] || 0
    }))
    drawBarChart(pad, topY + 12, colW, chartH, statusSeriesVec, 'Distribuição por Status', [16, 185, 129])
    // Categoria chart
    const catEntries2 = Object.entries(categoryCounts).sort((a: unknown, b: unknown) => b[1] - a[1]).slice(0, 8)
    drawBarChart(pad + colW + 12, topY, colW, chartH, catEntries2.map(([k,v]) => ({ label: String(k).slice(0,8), value: Number(v) })), 'Atendimentos por Categoria', [59, 130, 246])

    // Monthly line charts
    const lineTop = topY + chartH + 36
    const monthlySeries = monthKeys.map((k, i) => ({ label: monthLabels[i], value: monthlyCounts[k] || 0 }))
    const completedSeries = monthKeys.map((k, i) => ({ label: monthLabels[i], value: monthlyCompletedCounts[k] || 0 }))
    const conversionSeries = monthKeys.map((k, i) => {
      const t = monthlyCounts[k] || 0
      const c = monthlyCompletedCounts[k] || 0
      const pct = t > 0 ? Math.round((c / t) * 100) : 0
      return { label: monthLabels[i], value: pct }
    })
    drawLineChart(pad, lineTop, colW, chartH, monthlySeries, 'Tendência Mensal (Total)', [37, 99, 235])
    drawLineChart(pad + colW + 12, lineTop, colW, chartH, completedSeries, 'Concluídos por Mês', [16, 185, 129])
    const my = lineTop + chartH + 36
    drawLineChart(pad, my, page.w - pad * 2, chartH, conversionSeries, 'Conversão Mensal (%)', [139, 92, 246])

    // Table (sample)
    autoTable(doc, {
      head: [['Protocolo', 'Cliente', 'Serviço', 'Categoria', 'Status', 'Criado em']],
      body: (appointments || []).slice(0, 100).map((a: unknown) => [
        a.protocol || '-',
        a.client_name || '-',
        a.service_title || '-',
        a.service_category || '-',
        a.status || '-',
        a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '-'
      ]),
      startY: my + 10,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255,255,255] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })

    // Marca d'água discreta
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(48)
      doc.setTextColor(200)
      try {
        doc.text('NAF – Uso Interno', page.w / 2, page.h / 2, { align: 'center', angle: -30 as unknown })
      } catch {
        doc.text('NAF – Uso Interno', page.w / 2, page.h / 2, { align: 'center' })
      }
    }

    // Footer and output
    drawFooter()
    const arr = doc.output('arraybuffer') as ArrayBuffer
    const pdfResp = new Uint8Array(arr)
    return new NextResponse(pdfResp, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-naf-management-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error: unknown) {
    console.error('Erro no relatório NAF Management:', error)
    const msg = typeof error?.message === 'string' ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
