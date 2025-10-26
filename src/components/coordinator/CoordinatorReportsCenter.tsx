'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle,
  TimerReset,
  Users,
  Layers,
  Star,
  FileSpreadsheet,
  FileText,
  BookOpen,
  ClipboardCheck,
  Target,
  ClipboardList,
  CalendarClock,
  MessageSquare,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  no_show: 'bg-slate-200 text-slate-700 border-slate-300',
  reagendado: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-200 text-gray-700 border-gray-300',
}

const CHART_COLORS = ['#2563eb', '#22c55e', '#facc15', '#ef4444', '#14b8a6', '#8b5cf6', '#f97316', '#3b82f6']

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '180d', label: 'Últimos 180 dias' },
  { value: '365d', label: 'Últimos 12 meses' },
  { value: 'all', label: 'Todo o histórico' },
]

type StatusCategory = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'reagendado' | 'other'

type AttendanceRecord = {
  id: string
  type: 'regular' | 'fiscal'
  protocol: string | null
  status: string
  statusLabel: string
  statusCategory: StatusCategory
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
  notes?: Array<{ id: string; studentName?: string | null; note: string; createdAt: string }>
  summary?: string | null
  internalNotes?: string | null
}

type Summary = {
  totals: {
    overall: number
    regular: number
    fiscal: number
  }
  statusCounts: Array<{ status: string; label: string; category: StatusCategory; count: number }>
  categoryCounts: Record<string, number>
  totalStudents: number
  averageSatisfaction: number
  averageDuration: number
  totalNotes: number
  rescheduledCount: number
  metadata: {
    period: string
    generatedAt: string
    filters: Record<string, string | undefined>
  }
}

type ComprehensiveReport = {
  summary: Summary
  statusDistribution: Summary['statusCounts']
  timeline: Array<{ period: string; total: number; completed: number; inProgress: number }>
  courseDistribution: Array<{ course: string; total: number }>
  servicePerformance: Array<{
    id: string
    name: string
    category?: string | null
    total: number
    completionRate: number
    pending: number
    cancelled: number
    averageSatisfaction: number
    averageDuration: number | null
  }>
  studentInsights: Array<{
    id: string
    name?: string | null
    email?: string | null
    course?: string | null
    semester?: string | null
    totalAttendances: number
    completionRate: number
    averageSatisfaction: number
    statuses: Record<string, number>
    notesCount: number
  }>
  detailedAttendances: AttendanceRecord[]
  metadata: Summary['metadata']
}

function formatNumber(value: number, minimumFractionDigits = 0) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits }).format(value)
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins ? `${hrs}h ${mins}min` : `${hrs}h`
}

function toLocaleDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function CoordinatorReportsCenter() {
  const [report, setReport] = useState<ComprehensiveReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('90d')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL('/api/coordinator/reports/comprehensive', window.location.origin)
      url.searchParams.set('period', period)
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)

      const response = await fetch(url.toString())
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Erro ao carregar relatório')
      }

      setReport(payload.data as ComprehensiveReport)
    } catch (err) {
      console.error('❌ Erro ao carregar relatório abrangente:', err)
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }, [period, statusFilter])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const filteredAttendances = useMemo(() => {
    if (!report) return []

    return report.detailedAttendances.filter((attendance) => {
      const matchStatus =
        statusFilter === 'all' || attendance.status.toUpperCase() === statusFilter.toUpperCase()

      const matchSearch = searchTerm
        ? `${attendance.protocol || ''} ${attendance.service.name || ''} ${attendance.student.name || ''} ${attendance.client.name || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true

      return matchStatus && matchSearch
    })
  }, [report, statusFilter, searchTerm])

  const statusOptions = useMemo(() => {
    if (!report) return []
    return report.statusDistribution.map((item) => ({
      value: item.status,
      label: item.label,
    }))
  }, [report])

  const handleExportJSON = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    if (!report) return
    const headers = [
      'Tipo',
      'Protocolo',
      'Status',
      'Serviço',
      'Aluno',
      'Curso',
      'Cliente',
      'Data Solicitação',
      'Data Agendada',
      'Urgência',
      'Notas',
    ]

    const rows = report.detailedAttendances.map((attendance) => [
      attendance.type === 'fiscal' ? 'Fiscal' : 'Regular',
      attendance.protocol ?? attendance.id,
      attendance.statusLabel,
      attendance.service.name,
      attendance.student.name ?? '—',
      attendance.student.course ?? '—',
      attendance.client.name ?? '—',
      toLocaleDate(attendance.timing.requestedAt),
      toLocaleDate(attendance.timing.scheduledDate),
      attendance.urgency ?? '—',
      String(attendance.notesCount ?? 0),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const openNotes = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance)
    setNotesDialogOpen(true)
  }

  return (
    <Card className="border border-slate-200/70 shadow-lg shadow-blue-100/40 dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Relatório Estratégico Consolidado
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Visão completa dos atendimentos, estudantes e serviços com métricas qualificadas, registros de andamento e análises comparativas.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Todos os status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={loadReport}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar dados
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={handleExportJSON}
              disabled={!report}
            >
              <FileText className="h-4 w-4" />
              Exportar JSON
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleExportCSV}
              disabled={!report}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {report?.metadata && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Período: {report.metadata.period === 'all' ? 'Todo o histórico' : report.metadata.period}
            </Badge>
            <span>Gerado em {toLocaleDate(report.metadata.generatedAt)}</span>
            {report.summary?.rescheduledCount ? (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <TimerReset className="h-3.5 w-3.5" />
                {report.summary.rescheduledCount} atendimentos reagendados
              </span>
            ) : null}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-8">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" /> Atualizando indicadores, por favor aguarde...
          </div>
        )}

        {report && !loading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap justify-start gap-2 bg-slate-100/70 p-2 dark:bg-slate-900/70">
              <TabsTrigger value="overview" className="rounded-xl">Resumo Executivo</TabsTrigger>
              <TabsTrigger value="attendances" className="rounded-xl">Atendimentos</TabsTrigger>
              <TabsTrigger value="students" className="rounded-xl">Estudantes</TabsTrigger>
              <TabsTrigger value="services" className="rounded-xl">Serviços</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl">Registros & Notas</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-500">Total de atendimentos</div>
                      <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(report.summary.totals.overall)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(report.summary.totals.regular)} regulares · {formatNumber(report.summary.totals.fiscal)} fiscais
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-emerald-600">Concluídos</div>
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-emerald-600">
                      {formatNumber(
                        report.summary.statusCounts.find((item) => item.category === 'completed')?.count || 0,
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(report.summary.totalStudents)} estudantes monitorados
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-amber-600">Em andamento / pendentes</div>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-amber-600">
                      {formatNumber(
                        (report.summary.statusCounts.find((item) => item.category === 'pending')?.count || 0) +
                          (report.summary.statusCounts.find((item) => item.category === 'scheduled')?.count || 0) +
                          (report.summary.statusCounts.find((item) => item.category === 'in_progress')?.count || 0),
                      )}
                    </div>
                   <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(report.summary.totalNotes)} registros de andamento anexados
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-purple-600">Satisfação média</div>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-purple-600">
                      {Number(report.summary.averageSatisfaction || 0).toFixed(1)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Duração média {formatDuration(report.summary.averageDuration)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Distribuição por status</CardTitle>
                        <CardDescription>Status consolidado dos atendimentos</CardDescription>
                      </div>
                      <Layers className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.statusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number, name: string, props) => [
                            `${value} atendimentos`,
                            props.payload.label,
                          ]}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Evolução mensal</CardTitle>
                        <CardDescription>Atendimentos concluídos versus total</CardDescription>
                      </div>
                      <Target className="h-5 w-5 text-emerald-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
                        <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="inProgress" stroke="#facc15" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Distribuição por curso</CardTitle>
                      <CardDescription>Volume de atendimentos por curso dos estudantes</CardDescription>
                    </div>
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={report.courseDistribution} dataKey="total" nameKey="course" innerRadius={60} outerRadius={100} paddingAngle={4}>
                        {report.courseDistribution.map((entry, index) => (
                          <Cell key={entry.course} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number, name: string) => [`${value} atendimentos`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendances */}
            <TabsContent value="attendances" className="space-y-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Atendimentos detalhados
                  </h3>
                  <p className="text-sm text-slate-500">
                    Visualize o ciclo completo de cada atendimento, incluindo registros de andamento e notas lançadas pelos estudantes.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="search"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 lg:w-64"
                    placeholder="Buscar por protocolo, serviço ou estudante"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {filteredAttendances.length} registros exibidos
                  </Badge>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
                <div className="max-h-[540px] overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Protocolo</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Serviço</th>
                        <th className="px-4 py-3">Estudante</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Agendamento</th>
                        <th className="px-4 py-3">Urgência</th>
                        <th className="px-4 py-3">Notas</th>
                        <th className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-950">
                      {filteredAttendances.map((attendance) => (
                        <tr key={attendance.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            <Badge variant="secondary" className="border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                              {attendance.type === 'fiscal' ? 'Fiscal' : 'Regular'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <div className="font-medium text-slate-900 dark:text-slate-50">{attendance.protocol || attendance.id}</div>
                            <div className="text-xs text-slate-500">Solicitado em {toLocaleDate(attendance.timing.requestedAt)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={STATUS_COLORS[attendance.statusCategory] || STATUS_COLORS.other}>
                              {attendance.statusLabel}
                            </Badge>
                            {attendance.rescheduled && (
                              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
                                Reagendado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <div className="font-medium">{attendance.service.name}</div>
                            {attendance.service.category && (
                              <div className="text-xs text-slate-500">{attendance.service.category}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <div className="font-medium">{attendance.student.name || '—'}</div>
                            <div className="text-xs text-slate-500">
                              {attendance.student.course ? `${attendance.student.course}${attendance.student.semester ? ` · ${attendance.student.semester}º período` : ''}` : '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <div className="font-medium">{attendance.client.name || '—'}</div>
                            <div className="text-xs text-slate-500">{attendance.client.city || '—'}{attendance.client.state ? ` / ${attendance.client.state}` : ''}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <div>{toLocaleDate(attendance.timing.scheduledDate)}</div>
                            {attendance.timing.scheduledTime && (
                              <div className="text-xs text-slate-500">às {attendance.timing.scheduledTime}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            {attendance.urgency ? attendance.urgency : '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                              {attendance.notesCount}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-sm"
                                onClick={() => openNotes(attendance)}
                                disabled={!attendance.notesCount}
                              >
                                <MessageSquare className="h-4 w-4" />
                                Ver notas
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Students */}
            <TabsContent value="students" className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Indicadores por estudante
                </h3>
                <p className="text-sm text-slate-500">
                  Avalie o desempenho dos estudantes, volume de atendimentos, taxa de conclusão e satisfação média.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {report.studentInsights.map((student) => (
                  <Card key={student.id} className="border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            {student.name || 'Aluno'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {student.course ? `${student.course}${student.semester ? ` • ${student.semester}º período` : ''}` : 'Curso não informado'}
                          </div>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200">
                          {formatNumber(student.totalAttendances)} atendimentos
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
                        <div>
                          <div className="text-lg font-semibold text-emerald-600">
                            {student.completionRate.toFixed(0)}%
                          </div>
                          <div>Sucesso</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-indigo-600">
                            {student.averageSatisfaction.toFixed(1)}
                          </div>
                          <div>Satisfação</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-purple-600">
                            {student.notesCount}
                          </div>
                          <div>Notas</div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="mb-2 flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          <ClipboardList className="h-3.5 w-3.5" /> Distribuição de status
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(student.statuses).map(([status, value]) => (
                            <Badge key={status} variant="outline" className="border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                              {status.replace(/_/g, ' ')} · {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Services */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Desempenho por serviço
                </h3>
                <p className="text-sm text-slate-500">
                  Identifique quais serviços concentram maior demanda, taxa de conclusão e satisfação.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left">Serviço</th>
                        <th className="px-4 py-3 text-left">Categoria</th>
                        <th className="px-4 py-3 text-right">Atendimentos</th>
                        <th className="px-4 py-3 text-right">Concluídos</th>
                        <th className="px-4 py-3 text-right">Pendentes</th>
                        <th className="px-4 py-3 text-right">Cancelados</th>
                        <th className="px-4 py-3 text-right">Satisfação média</th>
                        <th className="px-4 py-3 text-right">Duração média</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-950">
                      {report.servicePerformance.map((service) => (
                        <tr key={service.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                            <div className="font-medium">{service.name}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                            {service.category || '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                            {formatNumber(service.total)}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                            {service.total ? `${service.completionRate.toFixed(1)}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-500">
                            {formatNumber(service.pending)}
                          </td>
                          <td className="px-4 py-3 text-right text-rose-500">
                            {formatNumber(service.cancelled)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                            {service.averageSatisfaction ? service.averageSatisfaction.toFixed(1) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                            {formatDuration(service.averageDuration)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Registros de andamento e observações
                </h3>
                <p className="text-sm text-slate-500">
                  Consolide os registros de atendimento em um único painel para consultas rápidas e auditoria.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {filteredAttendances
                  .filter((attendance) => attendance.notesCount > 0)
                  .map((attendance) => (
                    <Card key={`${attendance.id}-notes`} className="border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{attendance.protocol || attendance.id}</CardTitle>
                            <CardDescription>
                              {attendance.service.name} · {attendance.student.name || 'Aluno não identificado'}
                            </CardDescription>
                          </div>
                          <Badge className={STATUS_COLORS[attendance.statusCategory] || STATUS_COLORS.other}>
                            {attendance.statusLabel}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Notas registradas:</span> {attendance.notesCount}
                        </div>
                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/60">
                          {attendance.notes?.slice(0, 3).map((note) => (
                            <div key={note.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>{note.studentName || 'Registro'}</span>
                                <span>{toLocaleDate(note.createdAt)}</span>
                              </div>
                              <p className="mt-1 text-slate-700 dark:text-slate-200">{note.note}</p>
                            </div>
                          ))}
                          {attendance.notesCount > 3 && (
                            <div className="text-right text-[11px] text-blue-600">
                              + {attendance.notesCount - 3} registros adicionais
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => openNotes(attendance)}>
                          <ClipboardCheck className="h-4 w-4" />
                          Visualizar linha do tempo completa
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registro do atendimento</DialogTitle>
            <DialogDescription>
              {selectedAttendance ? (
                <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Protocolo:</span> {selectedAttendance.protocol || selectedAttendance.id}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Serviço:</span> {selectedAttendance.service.name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Aluno responsável:</span> {selectedAttendance.student.name || '—'}
                  </div>
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[420px] space-y-4 overflow-auto pr-3 text-sm">
            {selectedAttendance?.notes?.length ? (
              selectedAttendance.notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{note.studentName || 'Registro'}</span>
                    <span>{toLocaleDate(note.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{note.note}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60">
                Nenhum registro encontrado para este atendimento.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
