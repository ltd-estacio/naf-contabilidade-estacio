// Sistema de Relatórios Avançado - NAF Contábil
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ReportFilters {
  startDate?: string
  endDate?: string
  serviceType?: string
  status?: string
  studentId?: string
  teacherId?: string
  category?: string
}

interface DashboardStats {
  totalDemands: number
  totalAttendances: number
  totalStudents: number
  totalTeachers: number
  pendingValidations: number
  completedThisMonth: number
  averageResponseTime: number
  topServices: Array<{ name: string; count: number }>
  studentRanking: Array<{ name: string; attendances: number; hours: number }>
  monthlyGrowth: number
}

interface ChartData {
  pieCharts: {
    statusDistribution: Array<{ label: string; value: number; color?: string }>
    serviceDistribution: Array<{ label: string; value: number; color?: string }>
    studentPerformance: Array<{ label: string; value: number; color?: string }>
  }
  barCharts: {
    monthlyTrends: Array<{ label: string; value: number }>
    topStudents: Array<{ label: string; value: number }>
    servicePopularity: Array<{ label: string; value: number }>
  }
  lineCharts: {
    attendanceGrowth: Array<{ label: string; value: number }>
    demandTrends: Array<{ label: string; value: number }>
  }
}

class ReportsService {
  
  // Obter estatísticas gerais do dashboard (usando dados mock)
  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      // Simular dados realistas para desenvolvimento
      const mockStats: DashboardStats = {
        totalDemands: 156,
        totalAttendances: 234,
        totalStudents: 45,
        totalTeachers: 12,
        pendingValidations: 18,
        completedThisMonth: 67,
        averageResponseTime: 24,
        topServices: [
          { name: 'Consultoria Fiscal', count: 45 },
          { name: 'Imposto de Renda PF', count: 38 },
          { name: 'Abertura de MEI', count: 32 },
          { name: 'Contabilidade Empresarial', count: 28 },
          { name: 'Orientação Tributária', count: 23 }
        ],
        studentRanking: [
          { name: 'Ana Silva Santos', attendances: 25, hours: 120 },
          { name: 'Carlos Eduardo Lima', attendances: 22, hours: 110 },
          { name: 'Maria Fernanda Costa', attendances: 20, hours: 95 },
          { name: 'João Pedro Oliveira', attendances: 18, hours: 88 },
          { name: 'Luisa Martins Rocha', attendances: 16, hours: 80 },
          { name: 'Rafael Souza Pereira', attendances: 15, hours: 75 },
          { name: 'Fernanda Alves Silva', attendances: 14, hours: 70 },
          { name: 'Bruno Castro Mendes', attendances: 13, hours: 65 },
          { name: 'Camila Reis Santos', attendances: 12, hours: 60 },
          { name: 'Diego Ferreira Lima', attendances: 11, hours: 55 }
        ],
        monthlyGrowth: 15.2
      }

      return mockStats

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      throw error
    }
  }

  // Gerar relatório de atendimentos (usando dados mock)
  async generateAttendanceReport(filters: ReportFilters) {
    try {
      // Simular dados de atendimentos
      const mockAttendances = [
        {
          id: '1',
          protocol: 'ATD-2024-001',
          category: 'FISCAL',
          theme: 'Imposto de Renda',
          hours: 3,
          status: 'COMPLETED',
          isValidated: true,
          description: 'Orientação sobre declaração de IR para pessoa física',
          createdAt: new Date('2024-01-15'),
          user: {
            name: 'Ana Silva Santos',
            email: 'ana.santos@estudante.com',
            role: 'STUDENT'
          },
          demand: {
            service: {
              name: 'Consultoria em Imposto de Renda',
              category: 'FISCAL',
              theme: 'Tributação'
            }
          }
        },
        {
          id: '2',
          protocol: 'ATD-2024-002',
          category: 'CONTABIL',
          theme: 'Abertura de Empresa',
          hours: 4,
          status: 'COMPLETED',
          isValidated: true,
          description: 'Auxílio na abertura de MEI',
          createdAt: new Date('2024-01-16'),
          user: {
            name: 'Carlos Eduardo Lima',
            email: 'carlos.lima@estudante.com',
            role: 'STUDENT'
          },
          demand: {
            service: {
              name: 'Abertura de MEI',
              category: 'CONTABIL',
              theme: 'Empresarial'
            }
          }
        },
        {
          id: '3',
          protocol: 'ATD-2024-003',
          category: 'FISCAL',
          theme: 'Consultoria Tributária',
          hours: 2,
          status: 'IN_PROGRESS',
          isValidated: false,
          description: 'Orientação sobre regime tributário',
          createdAt: new Date('2024-01-17'),
          user: {
            name: 'Maria Fernanda Costa',
            email: 'maria.costa@estudante.com',
            role: 'STUDENT'
          },
          demand: {
            service: {
              name: 'Consultoria Tributária',
              category: 'FISCAL',
              theme: 'Tributação'
            }
          }
        }
      ]

      // Aplicar filtros básicos
      let filteredAttendances = mockAttendances

      if (filters.status) {
        filteredAttendances = filteredAttendances.filter(a => a.status === filters.status)
      }

      if (filters.category) {
        filteredAttendances = filteredAttendances.filter(a => a.category === filters.category)
      }

      return {
        data: filteredAttendances,
        summary: {
          total: filteredAttendances.length,
          validated: filteredAttendances.filter(a => a.isValidated).length,
          pending: filteredAttendances.filter(a => !a.isValidated).length,
          totalHours: filteredAttendances.reduce((sum, a) => sum + (a.hours || 0), 0),
          averageHours: filteredAttendances.length > 0
            ? filteredAttendances.reduce((sum, a) => sum + (a.hours || 0), 0) / filteredAttendances.length
            : 0
        }
      }

    } catch (error) {
      console.error('Erro ao gerar relatório de atendimentos:', error)
      throw error
    }
  }

  // Gerar relatório de demandas (usando dados mock)
  async generateDemandReport(filters: ReportFilters) {
    try {
      // Simular dados de demandas
      const mockDemands = [
        {
          id: '1',
          protocolNumber: 'DEM-2024-001',
          clientName: 'João Silva Empresa ME',
          clientEmail: 'joao@empresame.com',
          status: 'COMPLETED',
          priority: 'NORMAL',
          description: 'Consultoria para abertura de empresa',
          createdAt: new Date('2024-01-10'),
          service: {
            name: 'Abertura de MEI',
            category: 'CONTABIL',
            theme: 'Empresarial'
          },
          attendances: [
            {
              id: '1',
              user: {
                name: 'Ana Silva Santos',
                email: 'ana.santos@estudante.com'
              }
            }
          ]
        },
        {
          id: '2',
          protocolNumber: 'DEM-2024-002',
          clientName: 'Maria Oliveira',
          clientEmail: 'maria@email.com',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          description: 'Consultoria sobre Imposto de Renda',
          createdAt: new Date('2024-01-12'),
          service: {
            name: 'Consultoria em Imposto de Renda',
            category: 'FISCAL',
            theme: 'Tributação'
          },
          attendances: [
            {
              id: '2',
              user: {
                name: 'Carlos Eduardo Lima',
                email: 'carlos.lima@estudante.com'
              }
            }
          ]
        },
        {
          id: '3',
          protocolNumber: 'DEM-2024-003',
          clientName: 'Pedro Santos Ltda',
          clientEmail: 'pedro@santosltda.com',
          status: 'PENDING',
          priority: 'NORMAL',
          description: 'Consultoria tributária empresarial',
          createdAt: new Date('2024-01-14'),
          service: {
            name: 'Consultoria Tributária',
            category: 'FISCAL',
            theme: 'Tributação'
          },
          attendances: []
        }
      ]

      // Aplicar filtros básicos
      let filteredDemands = mockDemands

      if (filters.status) {
        filteredDemands = filteredDemands.filter(d => d.status === filters.status)
      }

      if (filters.serviceType) {
        filteredDemands = filteredDemands.filter(d =>
          d.service?.name.toLowerCase().includes(filters.serviceType.toLowerCase())
        )
      }

      // Estatísticas por status
      const statusStats = filteredDemands.reduce((acc: unknown, demand) => {
        acc[demand.status] = (acc[demand.status] || 0) + 1
        return acc
      }, {})

      // Estatísticas por serviço
      const serviceStats = filteredDemands.reduce((acc: unknown, demand) => {
        const serviceName = demand.service?.name || 'Não informado'
        acc[serviceName] = (acc[serviceName] || 0) + 1
        return acc
      }, {})

      return {
        data: filteredDemands,
        summary: {
          total: filteredDemands.length,
          statusStats,
          serviceStats,
          withAttendance: filteredDemands.filter(d => d.attendances.length > 0).length,
          averageAttendances: filteredDemands.length > 0
            ? filteredDemands.reduce((sum, d) => sum + d.attendances.length, 0) / filteredDemands.length
            : 0
        }
      }

    } catch (error) {
      console.error('Erro ao gerar relatório de demandas:', error)
      throw error
    }
  }

  // Gerar relatório de estudantes (usando dados mock)
  async generateStudentReport() {
    try {
      // Simular dados de estudantes com estatísticas
      const mockStudents = [
        {
          id: '1',
          name: 'Ana Silva Santos',
          email: 'ana.santos@estudante.com',
          createdAt: new Date('2023-02-15'),
          totalAttendances: 25,
          validatedAttendances: 22,
          pendingAttendances: 3,
          totalHours: 120,
          averageHours: 5.5,
          lastAttendance: new Date('2024-01-15'),
          performance: 'Excelente'
        },
        {
          id: '2',
          name: 'Carlos Eduardo Lima',
          email: 'carlos.lima@estudante.com',
          createdAt: new Date('2023-03-20'),
          totalAttendances: 22,
          validatedAttendances: 20,
          pendingAttendances: 2,
          totalHours: 110,
          averageHours: 5.0,
          lastAttendance: new Date('2024-01-16'),
          performance: 'Excelente'
        },
        {
          id: '3',
          name: 'Maria Fernanda Costa',
          email: 'maria.costa@estudante.com',
          createdAt: new Date('2023-01-10'),
          totalAttendances: 20,
          validatedAttendances: 18,
          pendingAttendances: 2,
          totalHours: 95,
          averageHours: 4.8,
          lastAttendance: new Date('2024-01-17'),
          performance: 'Muito Bom'
        },
        {
          id: '4',
          name: 'João Pedro Oliveira',
          email: 'joao.oliveira@estudante.com',
          createdAt: new Date('2023-04-05'),
          totalAttendances: 18,
          validatedAttendances: 16,
          pendingAttendances: 2,
          totalHours: 88,
          averageHours: 4.9,
          lastAttendance: new Date('2024-01-14'),
          performance: 'Muito Bom'
        },
        {
          id: '5',
          name: 'Luisa Martins Rocha',
          email: 'luisa.rocha@estudante.com',
          createdAt: new Date('2023-06-12'),
          totalAttendances: 16,
          validatedAttendances: 14,
          pendingAttendances: 2,
          totalHours: 80,
          averageHours: 5.0,
          lastAttendance: new Date('2024-01-13'),
          performance: 'Muito Bom'
        }
      ]

      return {
        data: mockStudents,
        summary: {
          total: mockStudents.length,
          active: mockStudents.filter(s => s.totalAttendances > 0).length,
          averageHours: mockStudents.reduce((sum, s) => sum + s.totalHours, 0) / mockStudents.length,
          topPerformer: mockStudents[0] || null
        }
      }

    } catch (error) {
      console.error('Erro ao gerar relatório de estudantes:', error)
      throw error
    }
  }

  // Calcular performance do estudante
  private calculateStudentPerformance(hours: number, attendances: number): string {
    if (hours >= 40 && attendances >= 20) return 'Excelente'
    if (hours >= 20 && attendances >= 10) return 'Muito Bom'
    if (hours >= 10 && attendances >= 5) return 'Bom'
    if (hours >= 5 && attendances >= 2) return 'Regular'
    return 'Iniciante'
  }

  // Exportar relatório para PDF com gráficos (versão profissional)
  async exportToPDF(reportType: 'attendance' | 'demand' | 'student', data: unknown[], chartData: ChartData): Promise<unknown> {
    try {
      const doc: unknown = new (jsPDF as unknown)('p', 'pt', 'a4')

      const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() }

      // Helpers
      const pad = 24
      const titleColor = [16, 185, 129] // emerald-500
      const axisColor = [107, 114, 128] // gray-500
      const gridColor = [229, 231, 235] // gray-200

      const truncate = (s: string, n: number) => (s?.length > n ? s.slice(0, n - 1) + '…' : s || '')

      const drawHeader = () => {
        doc.setFillColor(236, 253, 245) // emerald-50
        doc.rect(0, 0, page.w, 80, 'F')
        doc.setFontSize(20)
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2])
        doc.text('Relatório NAF Contábil', pad, 40)
        doc.setFontSize(12)
        doc.setTextColor(31, 41, 55)
        const tipo = reportType === 'attendance' ? 'Atendimentos' : reportType === 'demand' ? 'Demandas' : 'Estudantes'
        doc.text(`Tipo: ${tipo}`, pad, 58)
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pad, 74)
      }

      const drawKpi = (x: number, y: number, w: number, h: number, label: string, value: string, accent: [number, number, number]) => {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, y, w, h, 6, 6, 'F')
        doc.setDrawColor(accent[0], accent[1], accent[2])
        doc.setLineWidth(1)
        doc.roundedRect(x, y, w, h, 6, 6)
        doc.setFontSize(10)
        doc.setTextColor(107, 114, 128)
        doc.text(label, x + 12, y + 18)
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text(value, x + 12, y + 40)
      }

      const drawAxes = (x: number, y: number, w: number, h: number) => {
        // grid
        doc.setDrawColor(gridColor[0], gridColor[1], gridColor[2])
        doc.setLineWidth(0.5)
        for (let i = 0; i <= 4; i++) {
          const gy = y + 10 + (h - 20) * (i / 4)
          doc.line(x + 30, gy, x + w - 10, gy)
        }
        // axes
        doc.setDrawColor(axisColor[0], axisColor[1], axisColor[2])
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
        const barW = Math.max(8, innerW / (series.length * 1.6))
        series.forEach((s, i) => {
          const bh = ((h - 30) * s.value) / max
          const bx = x + 40 + i * (barW + 6)
          const by = y + h - 10 - bh
          doc.setFillColor(color[0], color[1], color[2])
          doc.rect(bx, by, barW, bh, 'F')
          // label
          doc.setFontSize(8)
          doc.setTextColor(75, 85, 99)
          doc.text(truncate(s.label, Math.floor(barW / 3)), bx, y + h)
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
        // x labels
        doc.setFontSize(8)
        doc.setTextColor(75, 85, 99)
        series.forEach((s, i) => {
          const px = x + 30 + i * stepX
          doc.text(truncate(s.label, 6), px - 8, y + h)
        })
      }

      // Header
      drawHeader()

      // KPI row (simples)
      const kpiY = 96
      const kpiW = (page.w - pad * 2 - 18) / 3
      drawKpi(pad, kpiY, kpiW, 54, 'Registros', `${data.length.toString()} itens`, [59, 130, 246])
      drawKpi(pad + kpiW + 9, kpiY, kpiW, 54, 'Período', 'Últimos meses', [16, 185, 129])
      drawKpi(pad + (kpiW + 9) * 2, kpiY, kpiW, 54, 'Gerado em', new Date().toLocaleDateString('pt-BR'), [245, 158, 11])

      // Charts grid
      const chartTop = kpiY + 70
      const colW = (page.w - pad * 2 - 12) / 2
      const chartH = 160

      // Bar: Popularidade de Serviços (ou status distrib.)
      const barSeries = (chartData.barCharts.servicePopularity?.slice(0, 8) || []).map(s => ({ label: s.label, value: s.value }))
      if (barSeries.length) {
        drawBarChart(pad, chartTop, colW, chartH, barSeries, 'Popularidade de Serviços', [59, 130, 246])
      }

      // Line: Crescimento de Atendimentos
      const lineSeries = (chartData.lineCharts.attendanceGrowth?.slice(-10) || [])
      if (lineSeries.length) {
        drawLineChart(pad + colW + 12, chartTop, colW, chartH, lineSeries, 'Crescimento de Atendimentos', [16, 185, 129])
      }

      // Bar: Top Estudantes (horas)
      const bar2Top = chartTop + chartH + 36
      const topStudents = (chartData.barCharts.topStudents?.slice(0, 10) || []).map(s => ({ label: s.label, value: s.value }))
      if (topStudents.length) {
        drawBarChart(pad, bar2Top, colW, chartH, topStudents, 'Top 10 Estudantes (horas)', [245, 158, 11])
      }

      // Bar: Tendência Mensal
      const monthly = (chartData.barCharts.monthlyTrends?.slice(-8) || [])
      if (monthly.length) {
        drawBarChart(pad + colW + 12, bar2Top, colW, chartH, monthly, 'Tendência Mensal (atendimentos)', [139, 92, 246])
      }

      // Nova página para tabelas
      doc.addPage()

      doc.setFontSize(14)
      doc.setTextColor(31, 41, 55)
      doc.text('Dados Detalhados', pad, 40)
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      doc.text('Abaixo, uma amostra dos registros com colunas mais relevantes ao tipo de relatório.', pad, 56)

      // Build table data
      const head: string[][] = []
      const body: unknown[][] = []
      switch (reportType) {
        case 'attendance':
          head.push(['Protocolo', 'Aluno', 'Categoria', 'Horas', 'Status', 'Criado'])
          data.slice(0, 50).forEach((a: unknown) => {
            body.push([
              a.protocol || '-',
              a.user?.name || '-',
              a.category || '-',
              (a.hours || 0).toString(),
              a.status || '-',
              a.createdAt ? new Date(a.createdAt).toLocaleDateString('pt-BR') : '-'
            ])
          })
          break
        case 'demand':
          head.push(['Protocolo', 'Cliente', 'Serviço', 'Prioridade', 'Status', 'Criado'])
          data.slice(0, 50).forEach((d: unknown) => {
            body.push([
              d.protocolNumber || '-',
              d.clientName || '-',
              d.service?.name || '-',
              d.priority || '-',
              d.status || '-',
              d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : '-'
            ])
          })
          break
        case 'student':
          head.push(['Nome', 'Email', 'Atendimentos', 'Horas', 'Média/h', 'Performance'])
          data.slice(0, 50).forEach((s: unknown) => {
            body.push([
              s.name || '-',
              s.email || '-',
              (s.totalAttendances || 0).toString(),
              (s.totalHours || 0).toString(),
              (s.averageHours || 0).toFixed(1),
              s.performance || '-'
            ])
          })
          break
      }

      (doc as unknown).autoTable({
        head,
        body,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      })

      // Rodapé com paginação
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(`Relatório gerado pelo Sistema NAF • Página ${i} de ${pageCount}`, pad, page.h - 24)
      }

      const arr = doc.output('arraybuffer') as ArrayBuffer
      return new Uint8Array(arr)
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error)
      // Fallback seguro: gerar PDF simples textual
      try {
        const doc: unknown = new (jsPDF as unknown)('p', 'pt', 'a4')
        doc.setFontSize(18)
        doc.text('Relatório NAF Contábil (modo simplificado)', 24, 40)
        doc.setFontSize(12)
        const tipo = reportType === 'attendance' ? 'Atendimentos' : reportType === 'demand' ? 'Demandas' : 'Estudantes'
        doc.text(`Tipo: ${tipo}`, 24, 60)
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 24, 76)
        let y = 100
        doc.setFontSize(14)
        doc.text('Resumo dos Gráficos (texto):', 24, y)
        y += 14
        doc.setFontSize(10)
        if (chartData?.barCharts?.topStudents?.length) {
          doc.text('Top Estudantes:', 24, y)
          y += 12
          chartData.barCharts.topStudents.slice(0, 10).forEach((s, i) => {
            if (y > 760) { doc.addPage(); y = 40 }
            doc.text(`${i + 1}. ${s.label}: ${s.value}h`, 30, y)
            y += 12
          })
        }
        if (y > 760) { doc.addPage(); y = 40 }
        doc.setFontSize(14)
        doc.text('Dados (amostra):', 24, y)
        y += 14
        doc.setFontSize(9)
        data.slice(0, 40).forEach((item, idx) => {
          if (y > 780) { doc.addPage(); y = 40 }
          const line = JSON.stringify(item, (k, v) => typeof v === 'object' ? v : v, 0).slice(0, 100)
          doc.text(`${idx + 1}. ${line}`, 24, y)
          y += 12
        })
        const arr = doc.output('arraybuffer') as ArrayBuffer
        return new Uint8Array(arr)
      } catch (fallbackErr) {
        console.error('Falha no fallback PDF:', fallbackErr)
        throw error
      }
    }
  }

  // Exportar relatório para TXT com gráficos
  async exportToTXT(reportType: 'attendance' | 'demand' | 'student', data: unknown[], chartData: ChartData): Promise<Buffer> {
    try {
      let content = '='.repeat(80) + '\n'
      content += 'RELATÓRIO NAF CONTÁBIL\n'
      content += '='.repeat(80) + '\n\n'
      content += `Tipo: ${reportType === 'attendance' ? 'Atendimentos' : reportType === 'demand' ? 'Demandas' : 'Estudantes'}\n`
      content += `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`

      // Seção de Gráficos
      content += '-'.repeat(50) + '\n'
      content += 'RESUMO DOS GRÁFICOS\n'
      content += '-'.repeat(50) + '\n\n'

      // Gráfico de Pizza - Status
      if (chartData.pieCharts.statusDistribution.length > 0) {
        content += 'DISTRIBUIÇÃO POR STATUS:\n'
        const totalStatus = chartData.pieCharts.statusDistribution.reduce((sum, x) => sum + x.value, 0)
        chartData.pieCharts.statusDistribution.forEach(item => {
          const percentage = ((item.value / totalStatus) * 100).toFixed(1)
          content += `  • ${item.label.padEnd(20)}: ${item.value.toString().padStart(6)} (${percentage.padStart(5)}%)\n`
        })
        content += '\n'
      }

      // Gráfico de Pizza - Serviços
      if (chartData.pieCharts.serviceDistribution.length > 0) {
        content += 'DISTRIBUIÇÃO POR SERVIÇOS:\n'
        chartData.pieCharts.serviceDistribution.forEach(item => {
          content += `  • ${item.label.padEnd(30)}: ${item.value.toString().padStart(6)}\n`
        })
        content += '\n'
      }

      // Top Estudantes
      if (chartData.barCharts.topStudents.length > 0) {
        content += 'TOP 10 ESTUDANTES POR HORAS:\n'
        chartData.barCharts.topStudents.forEach((item, index) => {
          content += `  ${(index + 1).toString().padStart(2)}. ${item.label.padEnd(25)}: ${item.value.toString().padStart(6)}h\n`
        })
        content += '\n'
      }

      // Dados Detalhados
      content += '-'.repeat(50) + '\n'
      content += 'DADOS DETALHADOS\n'
      content += '-'.repeat(50) + '\n\n'

      // Cabeçalho da tabela baseado no tipo
      switch (reportType) {
        case 'attendance':
          content += 'PROTOCOLO'.padEnd(15) + 'ESTUDANTE'.padEnd(25) + 'CATEGORIA'.padEnd(20) + 'HORAS'.padEnd(8) + 'STATUS'.padEnd(15) + 'DATA\n'
          content += '-'.repeat(88) + '\n'
          data.slice(0, 100).forEach(item => {
            content += (item.protocol || 'N/A').substring(0, 14).padEnd(15) +
                      (item.user?.name || 'N/A').substring(0, 24).padEnd(25) +
                      (item.category || 'N/A').substring(0, 19).padEnd(20) +
                      (item.hours || 0).toString().padEnd(8) +
                      (item.status || 'N/A').substring(0, 14).padEnd(15) +
                      new Date(item.createdAt).toLocaleDateString('pt-BR') + '\n'
          })
          break
        case 'demand':
          content += 'PROTOCOLO'.padEnd(15) + 'CLIENTE'.padEnd(25) + 'SERVIÇO'.padEnd(25) + 'STATUS'.padEnd(15) + 'DATA\n'
          content += '-'.repeat(85) + '\n'
          data.slice(0, 100).forEach(item => {
            content += (item.protocolNumber || 'N/A').substring(0, 14).padEnd(15) +
                      (item.clientName || 'N/A').substring(0, 24).padEnd(25) +
                      (item.service?.name || 'N/A').substring(0, 24).padEnd(25) +
                      (item.status || 'N/A').substring(0, 14).padEnd(15) +
                      new Date(item.createdAt).toLocaleDateString('pt-BR') + '\n'
          })
          break
        case 'student':
          content += 'NOME'.padEnd(25) + 'EMAIL'.padEnd(30) + 'ATEND.'.padEnd(8) + 'HORAS'.padEnd(8) + 'PERFORMANCE\n'
          content += '-'.repeat(76) + '\n'
          data.slice(0, 100).forEach(item => {
            content += (item.name || 'N/A').substring(0, 24).padEnd(25) +
                      (item.email || 'N/A').substring(0, 29).padEnd(30) +
                      (item.totalAttendances || 0).toString().padEnd(8) +
                      (item.totalHours || 0).toString().padEnd(8) +
                      (item.performance || 'N/A') + '\n'
          })
          break
      }

      content += '\n' + '='.repeat(80) + '\n'
      content += 'Fim do Relatório\n'
      content += '='.repeat(80)

      return Buffer.from(content, 'utf-8')

    } catch (error) {
      console.error('Erro ao exportar para TXT:', error)
      throw error
    }
  }

  // Exportar relatório para DOCX com gráficos
  async exportToDOCX(reportType: 'attendance' | 'demand' | 'student', data: unknown[], chartData: ChartData): Promise<Buffer> {
    try {
      // Simulação de geração DOCX (em uma implementação real, usaria bibliotecas como docx)
      let content = `RELATÓRIO NAF CONTÁBIL - ${reportType.toUpperCase()}\n\n`
      content += `Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n`

      content += 'GRÁFICOS E ESTATÍSTICAS:\n\n'

      // Adicionar dados dos gráficos
      if (chartData.pieCharts.statusDistribution.length > 0) {
        content += 'Distribuição por Status:\n'
        chartData.pieCharts.statusDistribution.forEach(item => {
          content += `- ${item.label}: ${item.value}\n`
        })
        content += '\n'
      }

      content += 'DADOS DETALHADOS:\n\n'

      // Adicionar dados em formato de texto estruturado
      data.slice(0, 50).forEach((item, index) => {
        content += `Registro ${index + 1}:\n`
        Object.keys(item).forEach(key => {
          if (typeof item[key] !== 'object') {
            content += `  ${key}: ${item[key]}\n`
          }
        })
        content += '\n'
      })

      return Buffer.from(content, 'utf-8')

    } catch (error) {
      console.error('Erro ao exportar para DOCX:', error)
      throw error
    }
  }

  // Exportar relatório para Excel
  async exportToExcel(reportType: 'attendance' | 'demand' | 'student', data: unknown[]): Promise<Buffer> {
    try {
      const workbook = XLSX.utils.book_new()
      
      let worksheetData: unknown[] = []
      let sheetName = ''

      switch (reportType) {
        case 'attendance':
          sheetName = 'Relatório de Atendimentos'
          worksheetData = data.map(item => ({
            'Protocolo': item.protocol,
            'Estudante': item.user?.name || 'N/A',
            'Email Estudante': item.user?.email || 'N/A',
            'Categoria': item.category,
            'Tema': item.theme,
            'Horas': item.hours,
            'Status': item.status,
            'Validado': item.isValidated ? 'Sim' : 'Não',
            'Data Criação': new Date(item.createdAt).toLocaleDateString('pt-BR'),
            'Descrição': item.description
          }))
          break

        case 'demand':
          sheetName = 'Relatório de Demandas'
          worksheetData = data.map(item => ({
            'Protocolo': item.protocolNumber,
            'Cliente': item.clientName,
            'Email Cliente': item.clientEmail,
            'Serviço': item.service?.name || 'N/A',
            'Categoria': item.service?.category || 'N/A',
            'Status': item.status,
            'Prioridade': item.priority,
            'Atendimentos': item.attendances?.length || 0,
            'Data Criação': new Date(item.createdAt).toLocaleDateString('pt-BR'),
            'Descrição': item.description
          }))
          break

        case 'student':
          sheetName = 'Relatório de Estudantes'
          worksheetData = data.map(item => ({
            'Nome': item.name,
            'Email': item.email,
            'Total Atendimentos': item.totalAttendances,
            'Atendimentos Validados': item.validatedAttendances,
            'Atendimentos Pendentes': item.pendingAttendances,
            'Total Horas': item.totalHours,
            'Horas Médias': item.averageHours.toFixed(2),
            'Performance': item.performance,
            'Último Atendimento': item.lastAttendance ? new Date(item.lastAttendance).toLocaleDateString('pt-BR') : 'N/A',
            'Data Cadastro': new Date(item.createdAt).toLocaleDateString('pt-BR')
          }))
          break
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Gerar buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      return buffer

    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      throw error
    }
  }

  // Gerar dados para gráficos
  async generateChartData(): Promise<ChartData> {
    try {
      const [attendanceData, demandData, studentData, dashboardStats] = await Promise.all([
        this.generateAttendanceReport({}),
        this.generateDemandReport({}),
        this.generateStudentReport(),
        this.getDashboardStats()
      ])

      // Cores para os gráficos
      const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

      // Gráfico de pizza - Distribuição por Status
      const statusDistribution = Object.entries(demandData.summary.statusStats).map(([status, count], index) => ({
        label: status,
        value: count as number,
        color: pieColors[index % pieColors.length]
      }))

      // Gráfico de pizza - Distribuição por Serviços
      const serviceDistribution = Object.entries(demandData.summary.serviceStats)
        .slice(0, 8)
        .map(([service, count], index) => ({
          label: service.length > 20 ? service.substring(0, 17) + '...' : service,
          value: count as number,
          color: pieColors[index % pieColors.length]
        }))

      // Gráfico de pizza - Performance dos Estudantes
      const performanceGroups = studentData.data.reduce((acc: unknown, student) => {
        acc[student.performance] = (acc[student.performance] || 0) + 1
        return acc
      }, {})

      const studentPerformance = Object.entries(performanceGroups).map(([performance, count], index) => ({
        label: performance,
        value: count as number,
        color: pieColors[index % pieColors.length]
      }))

      // Gráfico de barras - Top 10 Estudantes
      const topStudents = studentData.data
        .slice(0, 10)
        .map(student => ({
          label: student.name.length > 15 ? student.name.substring(0, 12) + '...' : student.name,
          value: student.totalHours
        }))

      // Gráfico de barras - Popularidade dos Serviços
      const servicePopularity = dashboardStats.topServices.map(service => ({
        label: service.name.length > 20 ? service.name.substring(0, 17) + '...' : service.name,
        value: service.count
      }))

      // Dados de tendência mensal (simulado)
      const now = new Date()
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
        return {
          label: monthName,
          value: Math.floor(Math.random() * 50) + 20 // Simulado
        }
      })

      // Crescimento de atendimentos (simulado)
      const attendanceGrowth = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
        return {
          label: monthName,
          value: Math.floor(Math.random() * 100) + 50 // Simulado
        }
      })

      // Tendência de demandas (simulado)
      const demandTrends = Array.from({ length: 8 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1)
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
        return {
          label: monthName,
          value: Math.floor(Math.random() * 80) + 30 // Simulado
        }
      })

      return {
        pieCharts: {
          statusDistribution,
          serviceDistribution,
          studentPerformance
        },
        barCharts: {
          monthlyTrends,
          topStudents,
          servicePopularity
        },
        lineCharts: {
          attendanceGrowth,
          demandTrends
        }
      }

    } catch (error) {
      console.error('Erro ao gerar dados para gráficos:', error)
      throw error
    }
  }

  // Gerar dados para Power BI
  async generatePowerBIData() {
    try {
      const [attendanceData, demandData, studentData, chartData] = await Promise.all([
        this.generateAttendanceReport({}),
        this.generateDemandReport({}),
        this.generateStudentReport(),
        this.generateChartData()
      ])

      return {
        attendances: attendanceData.data,
        demands: demandData.data,
        students: studentData.data,
        charts: chartData,
        summary: {
          totalAttendances: attendanceData.summary.total,
          totalDemands: demandData.summary.total,
          totalStudents: studentData.summary.total,
          generatedAt: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Erro ao gerar dados para Power BI:', error)
      throw error
    }
  }
}

export const reportsService = new ReportsService()

// API Routes
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Advanced Reports API - Processing request')

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const format = searchParams.get('format')

    console.log(`📊 Report type: ${type}, Format: ${format}`)

    switch (type) {
      case 'dashboard':
        const stats = await reportsService.getDashboardStats()
        return NextResponse.json({ success: true, data: stats })

      case 'general':
        // Alias para dashboard stats
        const generalStats = await reportsService.getDashboardStats()
        const generalChartData = await reportsService.generateChartData()

        if (format === 'json') {
          return NextResponse.json({
            success: true,
            data: generalStats,
            charts: generalChartData
          })
        }

        // Para outros formatos, usar dados de atendimentos como base
        const attendanceData = await reportsService.generateAttendanceReport({})

        if (format === 'excel') {
          const buffer = await reportsService.exportToExcel('attendance', attendanceData.data)
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="relatorio-geral-${new Date().toISOString().split('T')[0]}.xlsx"`
            }
          })
        }

        if (format === 'pdf') {
          const buffer = await reportsService.exportToPDF('attendance', attendanceData.data, generalChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf"`
            }
          })
        }

        if (format === 'txt') {
          const buffer = await reportsService.exportToTXT('attendance', attendanceData.data, generalChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': `attachment; filename="relatorio-geral-${new Date().toISOString().split('T')[0]}.txt"`
            }
          })
        }

        if (format === 'doc' || format === 'docx') {
          const buffer = await reportsService.exportToDOCX('attendance', attendanceData.data, generalChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': `attachment; filename="relatorio-geral-${new Date().toISOString().split('T')[0]}.docx"`
            }
          })
        }

        break

      case 'attendance':
        const attendanceReport = await reportsService.generateAttendanceReport({
          startDate: searchParams.get('startDate') || undefined,
          endDate: searchParams.get('endDate') || undefined,
          status: searchParams.get('status') || undefined,
          studentId: searchParams.get('studentId') || undefined,
          category: searchParams.get('category') || undefined
        })

        // Gerar dados de gráficos para exportação
        const chartData = await reportsService.generateChartData()

        if (format === 'excel') {
          const buffer = await reportsService.exportToExcel('attendance', attendanceReport.data)
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="relatorio-atendimentos-${new Date().toISOString().split('T')[0]}.xlsx"`
            }
          })
        }

        if (format === 'pdf') {
          const buffer = await reportsService.exportToPDF('attendance', attendanceReport.data, chartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="relatorio-atendimentos-${new Date().toISOString().split('T')[0]}.pdf"`
            }
          })
        }

        if (format === 'txt') {
          const buffer = await reportsService.exportToTXT('attendance', attendanceReport.data, chartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': `attachment; filename="relatorio-atendimentos-${new Date().toISOString().split('T')[0]}.txt"`
            }
          })
        }

        if (format === 'doc' || format === 'docx') {
          const buffer = await reportsService.exportToDOCX('attendance', attendanceReport.data, chartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': `attachment; filename="relatorio-atendimentos-${new Date().toISOString().split('T')[0]}.docx"`
            }
          })
        }

        return NextResponse.json({ success: true, data: attendanceReport, charts: chartData })

      case 'demand':
        const demandReport = await reportsService.generateDemandReport({
          startDate: searchParams.get('startDate') || undefined,
          endDate: searchParams.get('endDate') || undefined,
          status: searchParams.get('status') || undefined,
          serviceType: searchParams.get('serviceType') || undefined
        })

        const demandChartData = await reportsService.generateChartData()

        if (format === 'excel') {
          const buffer = await reportsService.exportToExcel('demand', demandReport.data)
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="relatorio-demandas-${new Date().toISOString().split('T')[0]}.xlsx"`
            }
          })
        }

        if (format === 'pdf') {
          const buffer = await reportsService.exportToPDF('demand', demandReport.data, demandChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="relatorio-demandas-${new Date().toISOString().split('T')[0]}.pdf"`
            }
          })
        }

        if (format === 'txt') {
          const buffer = await reportsService.exportToTXT('demand', demandReport.data, demandChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': `attachment; filename="relatorio-demandas-${new Date().toISOString().split('T')[0]}.txt"`
            }
          })
        }

        if (format === 'doc' || format === 'docx') {
          const buffer = await reportsService.exportToDOCX('demand', demandReport.data, demandChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': `attachment; filename="relatorio-demandas-${new Date().toISOString().split('T')[0]}.docx"`
            }
          })
        }

        return NextResponse.json({ success: true, data: demandReport, charts: demandChartData })

      case 'student':
        const studentReport = await reportsService.generateStudentReport()
        const studentChartData = await reportsService.generateChartData()

        if (format === 'excel') {
          const buffer = await reportsService.exportToExcel('student', studentReport.data)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="relatorio-estudantes-${new Date().toISOString().split('T')[0]}.xlsx"`
            }
          })
        }

        if (format === 'pdf') {
          const buffer = await reportsService.exportToPDF('student', studentReport.data, studentChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="relatorio-estudantes-${new Date().toISOString().split('T')[0]}.pdf"`
            }
          })
        }

        if (format === 'txt') {
          const buffer = await reportsService.exportToTXT('student', studentReport.data, studentChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': `attachment; filename="relatorio-estudantes-${new Date().toISOString().split('T')[0]}.txt"`
            }
          })
        }

        if (format === 'doc' || format === 'docx') {
          const buffer = await reportsService.exportToDOCX('student', studentReport.data, studentChartData)
          return new NextResponse(buffer as unknown, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': `attachment; filename="relatorio-estudantes-${new Date().toISOString().split('T')[0]}.docx"`
            }
          })
        }

        return NextResponse.json({ success: true, data: studentReport, charts: studentChartData })

      case 'powerbi':
        const powerbiData = await reportsService.generatePowerBIData()
        return NextResponse.json({ success: true, data: powerbiData })

      default:
        return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro no sistema de relatórios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
