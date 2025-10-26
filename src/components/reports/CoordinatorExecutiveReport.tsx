'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Activity,
  BarChart3,
  CalendarClock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  NotebookPen,
  PieChart,
  TrendingUp,
  Users
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SimpleChart } from '@/components/charts/SimpleChart'

interface AttendanceNote {
  id: string
  studentName?: string | null
  note: string
  createdAt: string
}

interface DetailedAttendance {
  id: string
  type: 'regular' | 'fiscal'
  protocol: string | null
  status: string
  statusLabel: string
  statusCategory: string
  service: {
    name: string
    title?: string | null
    category?: string | null
    difficulty?: string | null
  }
  student: {
    id?: string | null
    name?: string | null
    email?: string | null
    course?: string | null
    semester?: string | null
    phone?: string | null
  }
  client: {
    name?: string | null
    email?: string | null
    phone?: string | null
    cpf?: string | null
    city?: string | null
    state?: string | null
  }
  clientCategory?: string | null
  timing: {
    requestedAt?: string | null
    scheduledDate?: string | null
    scheduledTime?: string | null
    preferredDate?: string | null
    preferredTime?: string | null
    preferredPeriod?: string | null
    startedAt?: string | null
    completedAt?: string | null
    updatedAt?: string | null
  }
  channel?: string | null
  urgency?: string | null
  isOnline?: boolean | null
  rescheduled?: boolean
  satisfaction?: number | null
  durationMinutes?: number | null
  notesCount: number
  notes?: AttendanceNote[]
  summary?: string | null
  internalNotes?: string | null
  feedback?: string | null
}

interface ReportSummary {
  totals: {
    overall: number
    regular: number
    fiscal: number
  }
  statusCounts: Array<{ status: string; label: string; category: string; count: number }>
  categoryCounts: Record<string, number>
  totalStudents: number
  averageSatisfaction: number
  averageDuration: number
  totalNotes: number
  rescheduledCount: number
  metadata: {
    period: string
    generatedAt: string
    filters: {
      status?: string
      serviceType?: string
      studentId?: string
    }
  }
}

interface CoordinatorReportResponse {
  summary: ReportSummary
  statusDistribution: Array<{ status: string; label: string; category: string; count: number }>
  timeline: Array<{ period: string; total: number; completed: number; inProgress: number }>
  courseDistribution: Array<{ course: string; total: number }>
  servicePerformance: Array<{ id: string; name: string; category?: string | null; total: number; completionRate: number; pending: number; cancelled: number; averageSatisfaction: number; averageDuration: number | null }>
  studentInsights: Array<{ id: string; name?: string | null; email?: string | null; course?: string | null; semester?: string | null; totalAttendances: number; completionRate: number; averageSatisfaction: number; statuses: Record<string, number>; notesCount: number }>
  detailedAttendances: DetailedAttendance[]
  clientCategories: Array<{ category: string; total: number; percent: number }>
  metadata: ReportSummary['metadata']
  filterOptions: {
    statuses: Array<{ value: string; label: string }>
    services: Array<{ value: string; label: string; category?: string | null }>
    students: Array<{ value: string; label: string; course?: string | null }>
  }
}

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '180d', label: 'Últimos 180 dias' },
  { value: '365d', label: 'Últimos 12 meses' },
  { value: 'all', label: 'Todo o histórico' },
]

const statusCategoryStyles: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-800 border border-emerald-100',
  in_progress: 'bg-sky-100 text-sky-800 border border-sky-200',
  scheduled: 'bg-blue-100 text-blue-800 border border-blue-200',
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  cancelled: 'bg-rose-100 text-rose-800 border border-rose-200',
  no_show: 'bg-slate-200 text-slate-700 border border-slate-300',
  reagendado: 'bg-purple-100 text-purple-800 border border-purple-200',
  other: 'bg-gray-100 text-gray-700 border border-gray-200'
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatPercentage = (value: number) => `${(Math.round(value * 10) / 10).toFixed(1)}%`

const CoordinatorExecutiveReport: React.FC = () => {
  const [filters, setFilters] = useState({
    period: 'all',
    status: 'all',
    service: 'all',
    student: 'all'
  })
  const [data, setData] = useState<CoordinatorReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'services' | 'attendances'>('overview')
  const [notesModal, setNotesModal] = useState<{ open: boolean; attendance: DetailedAttendance | null }>({ open: false, attendance: null })
  const [downloading, setDownloading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('period', filters.period)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.service !== 'all') params.set('serviceType', filters.service)
    if (filters.student !== 'all') params.set('studentId', filters.student)

    try {
      const response = await fetch(`/api/coordinator/reports/comprehensive?${params.toString()}`)
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Erro ao carregar relatório')
      }
      setData(json.data as CoordinatorReportResponse)
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar os dados do relatório. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.period, filters.status, filters.service, filters.student])

  const handleExport = async (format: 'pdf' | 'xlsx' | 'docx' | 'csv') => {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      params.set('format', format)
      params.set('period', filters.period)
      params.set('status', filters.status)
      params.set('category', filters.service)
      params.set('studentId', filters.student)

      const response = await fetch(`/api/coordinator/report?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Erro ao exportar relatório (${response.status})`)
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const extension = format === 'docx' ? 'docx' : format
      link.download = `relatorio-coordenador-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar o relatório. Verifique sua conexão e tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  const statusOptions = useMemo(() => {
    const base = data?.filterOptions.statuses || []
    return [{ value: 'all', label: 'Todos os status' }, ...base]
  }, [data])

  const serviceOptions = useMemo(() => {
    const unique = (data?.filterOptions.services || []).reduce<Array<{ value: string; label: string }>>((acc, item) => {
      if (!acc.find(existing => existing.value === item.value)) {
        acc.push({ value: item.value, label: item.label })
      }
      return acc
    }, [])
    return [{ value: 'all', label: 'Todos os serviços' }, ...unique]
  }, [data])

  const studentOptions = useMemo(() => {
    const unique = (data?.filterOptions.students || []).reduce<Array<{ value: string; label: string }>>((acc, item) => {
      if (!acc.find(existing => existing.value === item.value)) {
        const label = item.course ? `${item.label} — ${item.course}` : item.label
        acc.push({ value: item.value, label })
      }
      return acc
    }, [])
    return [{ value: 'all', label: 'Todos os estudantes' }, ...unique]
  }, [data])

  const conclusionRate = useMemo(() => {
    if (!data) return 0
    const completed = data.statusDistribution
      .filter(item => item.category === 'completed')
      .reduce((sum, item) => sum + item.count, 0)
    return data.summary.totals.overall > 0
      ? Math.round((completed / data.summary.totals.overall) * 100)
      : 0
  }, [data])

  const statusChartData = useMemo(() => (
    data?.statusDistribution.map(item => ({ label: item.label, value: item.count })) || []
  ), [data])

  const timelineChartData = useMemo(() => (
    data?.timeline.map(item => ({ label: item.period.split('-').reverse().join('/'), value: item.total })) || []
  ), [data])

  const completionChartData = useMemo(() => (
    data?.timeline.map(item => ({
      label: item.period.split('-').reverse().join('/'),
      value: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
    })) || []
  ), [data])

  const courseChartData = useMemo(() => (
    data?.courseDistribution.slice(0, 8).map(item => ({
      label: item.course || 'Sem curso',
      value: item.total
    })) || []
  ), [data])

  const audienceChartData = useMemo(() => (
    data?.clientCategories.slice(0, 8).map(item => ({
      label: item.category,
      value: Math.round(item.percent * 10) / 10
    })) || []
  ), [data])

  const topStudents = useMemo(() => (
    data?.studentInsights.slice(0, 6) || []
  ), [data])

  const filteredAttendances = useMemo(() => (
    data?.detailedAttendances.slice(0, 75) || []
  ), [data])

  const statusBadge = (attendance: DetailedAttendance) => {
    const styles = statusCategoryStyles[attendance.statusCategory] || statusCategoryStyles.other
    return (
      <Badge className={`${styles} px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide`}>{attendance.statusLabel}</Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Relatório Inteligente do Coordenador</CardTitle>
          <CardDescription>Carregando métricas estratégicas...</CardDescription>
        </CardHeader>
        <CardContent className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600"><Activity className="h-5 w-5" /> Falha ao carregar relatório</CardTitle>
          <CardDescription>{error || 'Não foi possível carregar os dados. Tente novamente em instantes.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchReport}>Tentar novamente</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-blue-100 shadow-sm shadow-blue-100/50">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Relatório Inteligente do Coordenador
            </CardTitle>
            <CardDescription>
              Visão executiva consolidada com registros completos, andamento detalhado e recomendações acionáveis.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={downloading}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} disabled={downloading}>
              <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('docx')} disabled={downloading}>
              <FileText className="h-4 w-4 mr-1" /> Word
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleExport('pdf')} disabled={downloading}>
              <Download className="h-4 w-4 mr-1" /> PDF Profissional
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Período</label>
              <Select value={filters.period} onValueChange={value => setFilters(prev => ({ ...prev, period: value }))}>
                <SelectTrigger className="bg-white/70 border-blue-200">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</label>
              <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-white/70 border-blue-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toUpperCase()}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Serviço</label>
              <Select value={filters.service} onValueChange={value => setFilters(prev => ({ ...prev, service: value }))}>
                <SelectTrigger className="bg-white/70 border-blue-200">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Estudante</label>
              <Select value={filters.student} onValueChange={value => setFilters(prev => ({ ...prev, student: value }))}>
                <SelectTrigger className="bg-white/70 border-blue-200">
                  <SelectValue placeholder="Estudante" />
                </SelectTrigger>
                <SelectContent>
                  {studentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-500 text-xs font-semibold uppercase tracking-wide">
              <TrendingUp className="h-4 w-4" /> Volume Consolidado
            </div>
            <div className="text-3xl font-bold text-blue-950">{data.summary.totals.overall}</div>
            <p className="text-xs text-blue-800">
              {data.summary.totals.regular} atendimentos regulares • {data.summary.totals.fiscal} fiscais
            </p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-100 bg-emerald-50/80">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wide">
              <CheckStatusIcon className="h-4 w-4" /> Taxa de Conclusão
            </div>
            <div className="text-3xl font-bold text-emerald-800">{conclusionRate}%</div>
            <p className="text-xs text-emerald-700">
              Tempo médio: {Math.round(data.summary.averageDuration || 0)} min • Reagendados: {data.summary.rescheduledCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-purple-100 bg-purple-50/80">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wide">
              <Users className="h-4 w-4" /> Engajamento dos Estudantes
            </div>
            <div className="text-3xl font-bold text-purple-900">{data.summary.totalStudents}</div>
            <p className="text-xs text-purple-700">
              {Math.round((data.summary.totalNotes || 0) / Math.max(1, data.summary.totalStudents))} registros por estudante em média
            </p>
          </CardContent>
        </Card>
        <Card className="border border-amber-100 bg-amber-50/80">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wide">
              <NotebookPen className="h-4 w-4" /> Registro do Atendimento
            </div>
            <div className="text-3xl font-bold text-amber-900">{data.summary.totalNotes}</div>
            <p className="text-xs text-amber-700">
              Documentações lançadas pelos estudantes durante o atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as typeof activeTab)}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Panorama</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Estudantes</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Serviços</TabsTrigger>
          <TabsTrigger value="attendances" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Atendimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PieChart className="h-5 w-5 text-blue-600" /> Distribuição por Status
                </CardTitle>
                <CardDescription>Comparativo entre fases do atendimento e pendências críticas.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={statusChartData} type="bar" height={240} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarClock className="h-5 w-5 text-indigo-600" /> Evolução Mensal
                </CardTitle>
                <CardDescription>Volume de atendimentos concluídos ao longo do período selecionado.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={timelineChartData} type="line" height={240} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BarChart3 className="h-5 w-5 text-emerald-600" /> Conclusão Mensal
                </CardTitle>
                <CardDescription>Taxa percentual de conclusão mês a mês.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={completionChartData} type="line" height={240} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users className="h-5 w-5 text-purple-600" /> Top Estudantes
                </CardTitle>
                <CardDescription>Desempenho dos estudantes com maior volume de atendimentos no período.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topStudents.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum atendimento associado a estudantes neste período.</p>
                )}
                {topStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{student.name || 'Estudante sem identificação'}</p>
                      <p className="text-xs text-slate-500">
                        {student.course || 'Curso não informado'} • {student.totalAttendances} atendimentos • Conclusão {formatPercentage(student.completionRate)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {student.notesCount} registro(s)
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PieChart className="h-5 w-5 text-amber-600" /> Público atendido
                </CardTitle>
                <CardDescription>Distribuição percentual das categorias de clientes atendidos.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={audienceChartData} type="bar" height={240} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Performance detalhada dos estudantes</CardTitle>
              <CardDescription>Produtividade, engajamento e qualidade dos registros lançados.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[440px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Estudante</th>
                      <th className="text-left px-4 py-3">Curso</th>
                      <th className="text-right px-4 py-3">Atendimentos</th>
                      <th className="text-right px-4 py-3">Conclusão</th>
                      <th className="text-right px-4 py-3">Satisfação</th>
                      <th className="text-right px-4 py-3">Registros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentInsights.map(student => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{student.name || 'Estudante sem identificação'}</p>
                          <p className="text-xs text-slate-500">{student.email || 'E-mail não informado'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {student.course || '-'} {student.semester ? `• ${student.semester}` : ''}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">{student.totalAttendances}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-600">{formatPercentage(student.completionRate)}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-600">{student.averageSatisfaction ? student.averageSatisfaction.toFixed(2) : 'N/D'}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">{student.notesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Análise de serviços e demandas</CardTitle>
              <CardDescription>Identifique serviços com maior demanda, gargalos e indicadores de conclusão.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[440px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Serviço</th>
                      <th className="text-left px-4 py-3">Categoria</th>
                      <th className="text-right px-4 py-3">Total</th>
                      <th className="text-right px-4 py-3">Conclusão</th>
                      <th className="text-right px-4 py-3">Pendentes</th>
                      <th className="text-right px-4 py-3">Cancelados</th>
                      <th className="text-right px-4 py-3">Satisfação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.servicePerformance.map(service => (
                      <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-medium text-slate-700">{service.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{service.category || '-'}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{service.total}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-600">{formatPercentage(service.completionRate)}</td>
                        <td className="px-4 py-3 text-right text-sm text-amber-600">{service.pending}</td>
                        <td className="px-4 py-3 text-right text-sm text-rose-600">{service.cancelled}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-600">{service.averageSatisfaction ? service.averageSatisfaction.toFixed(2) : 'N/D'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendances" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Linha do tempo dos atendimentos</CardTitle>
              <CardDescription>Detalhamento completo de cada atendimento, status atual, registro do atendimento e feedbacks.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[520px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Atendimento</th>
                      <th className="text-left px-4 py-3">Estudante</th>
                      <th className="text-left px-4 py-3">Cliente</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Agenda</th>
                      <th className="text-left px-4 py-3">Registro</th>
                      <th className="text-left px-4 py-3">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendances.map(attendance => (
                      <tr key={attendance.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={attendance.type === 'fiscal' ? 'border-amber-200 text-amber-700 bg-amber-50/80' : 'border-blue-200 text-blue-700 bg-blue-50/80'}>
                              {attendance.type === 'fiscal' ? 'Fiscal' : 'Regular'}
                            </Badge>
                            <div>
                              <p className="font-semibold text-slate-700">{attendance.protocol || attendance.id}</p>
                              <p className="text-xs text-slate-500">{attendance.service.name}</p>
                            </div>
                          </div>
                          {attendance.clientCategory && (
                            <p className="mt-1 text-xs text-slate-500">Público: {attendance.clientCategory}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{attendance.student.name || 'Não atribuído'}</p>
                          <p className="text-xs text-slate-500">{attendance.student.course || '-'} {attendance.student.semester ? `• ${attendance.student.semester}` : ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{attendance.client.name || 'Cliente não informado'}</p>
                          <p className="text-xs text-slate-500">{attendance.client.email || attendance.client.phone || '-'}</p>
                        </td>
                        <td className="px-4 py-3 space-y-1">
                          {statusBadge(attendance)}
                          <div className="flex flex-wrap gap-1">
                            {attendance.rescheduled && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">Reagendado</Badge>}
                            {attendance.isOnline && <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">On-line</Badge>}
                            {attendance.urgency && <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[10px]">Urgência: {attendance.urgency}</Badge>}
                          </div>
                          {attendance.satisfaction && (
                            <p className="text-xs text-blue-600">Satisfação: {attendance.satisfaction.toFixed(1)}/5</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1 text-slate-700">
                            <CalendarClock className="h-3.5 w-3.5" /> {formatDate(attendance.timing.scheduledDate)} {attendance.timing.scheduledTime ? `• ${attendance.timing.scheduledTime}` : ''}
                          </div>
                          <p>Início: {formatDate(attendance.timing.startedAt)}</p>
                          <p>Conclusão: {formatDate(attendance.timing.completedAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {attendance.notesCount} registro(s)
                            </Badge>
                            {attendance.notesCount > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => setNotesModal({ open: true, attendance })}
                              >
                                Ver registros
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {attendance.feedback ? (
                            <span className="line-clamp-3">“{attendance.feedback}”</span>
                          ) : (
                            <span className="text-slate-400">Sem feedback</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={notesModal.open} onOpenChange={open => setNotesModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registro do Atendimento — {notesModal.attendance?.protocol || notesModal.attendance?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {notesModal.attendance?.notes && notesModal.attendance.notes.length > 0 ? (
              notesModal.attendance.notes.map(note => (
                <div key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    {note.studentName || 'Estudante'} • {formatDateTime(note.createdAt)}
                  </p>
                  <p className="text-sm text-slate-700">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhum registro lançado para este atendimento.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CheckStatusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8.75 12.25L10.75 14.25L15.25 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default CoordinatorExecutiveReport
