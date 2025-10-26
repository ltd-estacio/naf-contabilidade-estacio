'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Activity,
  TrendingUp,
  Users,
  Settings,
  Star,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Clock,
  Target,
  Award,
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Search
} from 'lucide-react'

interface BIData {
  general?: any
  performance?: any
  students?: any
  services?: any
  satisfaction?: any
  conversion?: any
  growth?: any
  metadata?: any
}

interface ReportFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all'
  startDate?: string
  endDate?: string
  studentId?: string
  status?: string[]
  minRating?: number
  serviceType?: string
  course?: string
  semester?: string
  hasFeedback?: boolean
}

export default function BusinessIntelligence() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BIData>({})
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  // Estados para filtros avançados
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'all',
    status: [],
    hasFeedback: undefined
  })
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [exportingReport, setExportingReport] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Carregando dados do Business Intelligence...')
      const response = await fetch('/api/coordinator/business-intelligence')
      const result = await response.json()

      if (response.ok) {
        setData(result)
        setLastUpdated(new Date().toLocaleString('pt-BR'))
        console.log('✅ Dados carregados com sucesso')
      } else {
        setError(result.error || 'Erro ao carregar dados')
        console.error('❌ Erro:', result.error)
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num || 0)
  }

  const formatPercentage = (num: number) => {
    return `${(num || 0).toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  // Calcular datas baseadas no filtro selecionado
  const getDateRange = (range: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (range) {
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        return { start: weekStart.toISOString(), end: now.toISOString() }
      
      case 'month':
        const monthStart = new Date(today)
        monthStart.setMonth(today.getMonth() - 1)
        return { start: monthStart.toISOString(), end: now.toISOString() }
      
      case 'quarter':
        const quarterStart = new Date(today)
        quarterStart.setMonth(today.getMonth() - 3)
        return { start: quarterStart.toISOString(), end: now.toISOString() }
      
      case 'year':
        const yearStart = new Date(today)
        yearStart.setFullYear(today.getFullYear() - 1)
        return { start: yearStart.toISOString(), end: now.toISOString() }
      
      case 'custom':
        return {
          start: filters.startDate || undefined,
          end: filters.endDate || undefined
        }
      
      default:
        return {}
    }
  }

  // Aplicar filtros e recarregar dados
  const applyFilters = async () => {
    setApplyingFilters(true)
    try {
      const dateRange = getDateRange(filters.dateRange)
      
      // Construir query params
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      if (filters.studentId) params.append('studentId', filters.studentId)
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(s => params.append('status', s))
      }
      if (filters.minRating) params.append('minRating', filters.minRating.toString())
      if (filters.serviceType) params.append('serviceType', filters.serviceType)
      if (filters.course) params.append('course', filters.course)
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.hasFeedback !== undefined) {
        params.append('hasFeedback', filters.hasFeedback.toString())
      }

      const response = await fetch(`/api/coordinator/business-intelligence?${params.toString()}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
        setLastUpdated(new Date().toLocaleString('pt-BR'))
      } else {
        setError(result.error || 'Erro ao aplicar filtros')
      }
    } catch (err) {
      setError('Erro ao aplicar filtros')
      console.error(err)
    } finally {
      setApplyingFilters(false)
    }
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      status: [],
      hasFeedback: undefined
    })
    loadData()
  }

  // Exportar relatório em diferentes formatos
  const exportReport = async (format: 'csv' | 'json' | 'pdf') => {
    setExportingReport(true)
    try {
      const dateRange = getDateRange(filters.dateRange)
      
      const response = await fetch('/api/coordinator/business-intelligence/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          filters: {
            ...filters,
            ...dateRange
          },
          data
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `relatorio-bi-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        setError('Erro ao exportar relatório')
      }
    } catch (err) {
      setError('Erro ao exportar relatório')
      console.error(err)
    } finally {
      setExportingReport(false)
    }
  }

  // Toggle status no filtro
  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }))
  }

  const renderGeneralSection = () => {
    const general = data.general

    if (!general) {
      return <div className="text-center py-8 text-gray-500">Carregando dados gerais...</div>
    }

    // Calcular métricas para os novos cards
    const totalAttendances = general.totals?.total_attendances || 0
    const completedAttendances = general.totals?.completed_attendances || 0
    const completionRate = totalAttendances > 0 ? (completedAttendances / totalAttendances) * 100 : 0

    // Calcular satisfação média
    const avgSatisfaction = data.satisfaction?.satisfactionDistribution?.avg_rating || 0

    // Calcular crescimento (já vem calculado do backend)
    const growthRate = data.growth?.growth_rate || 0

    // Calcular duração média de atendimento
    const avgDuration = data.performance?.performanceStats?.avg_attendance_duration || 0

    return (
      <div className="space-y-6">
        {/* Novos KPI Cards no topo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Taxa de Conclusão */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-gray-600">Taxa Concluído</p>
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {formatPercentage(completionRate)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {getTrendIcon(completionRate - 50)}
                    <span className="text-xs text-gray-500">
                      {completedAttendances} de {totalAttendances} concluídos
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satisfação */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <p className="text-sm text-gray-600">Satisfação</p>
                  </div>
                  <div className="text-4xl font-bold text-yellow-600">
                    {avgSatisfaction.toFixed(1)}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= avgSatisfaction
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crescimento */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <p className="text-sm text-gray-600">Crescimento</p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {formatPercentage(growthRate)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {getTrendIcon(growthRate)}
                    <span className="text-xs text-gray-500">
                      nos últimos 30 dias
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda linha de cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total de Atendimentos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_attendances || 0)}</div>
                <p className="text-sm text-gray-600">Atendimentos</p>
                <div className="text-xs text-gray-500">
                  ✓ Cadastrados no sistema
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estudantes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_students || 0)}</div>
                <p className="text-sm text-gray-600">Estudantes</p>
                <div className="text-xs text-gray-500">
                  ✓ Disponíveis para agendamento
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviços */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Settings className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_services || 0)}</div>
                <p className="text-sm text-gray-600">Serviços</p>
                <div className="text-xs text-gray-500">
                  ✓ Disponíveis para solicitação
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duração Média */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {avgDuration > 0 ? `${Math.round(avgDuration)} min` : '0 min'}
                </div>
                <p className="text-sm text-gray-600">Duração Média</p>
                <div className="text-xs text-gray-500">
                  por atendimento
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Categoria de Cliente
            </CardTitle>
            <CardDescription>Análise detalhada do público atendido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {general.categoryBreakdown?.slice(0, 8).map((cat: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat.category}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {formatNumber(cat.total)} atendimentos
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Taxa: {formatPercentage(cat.completion_rate)}
                        </Badge>
                        {cat.avg_rating > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {cat.avg_rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(cat.completed)}
                    </span>
                  </div>
                  <Progress value={cat.completion_rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Semanais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atendimentos por Dia da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {general.weekdayStats?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium w-12">{day.weekdayName}</span>
                    <Progress value={(day.total / Math.max(...general.weekdayStats.map((d: any) => d.total))) * 100} className="flex-1 h-3" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{formatNumber(day.total)} total</span>
                    <span className="text-sm font-medium text-green-600">{formatNumber(day.completed)} concluídos</span>
                    {day.cancelled > 0 && (
                      <span className="text-sm text-red-600">{formatNumber(day.cancelled)} cancelados</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Mensal (Últimos 12 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {general.monthlyStats?.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{month.monthName} {month.year}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">{formatNumber(month.total)}</span>
                      <span className="text-gray-600"> atendimentos</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{formatNumber(month.completed)}</span>
                      <span className="text-gray-600"> concluídos</span>
                    </div>
                    {month.cancelled > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-red-600">{formatNumber(month.cancelled)}</span>
                        <span className="text-gray-600"> cancelados</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPerformanceSection = () => {
    const performance = data.performance

    if (!performance) {
      return <div className="text-center py-8 text-gray-500">Carregando dados de performance...</div>
    }

    return (
      <div className="space-y-6">
        {/* Top Performing Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top 10 Estudantes por Produtividade
            </CardTitle>
            <CardDescription>Estudantes com melhor desempenho no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.students?.slice(0, 10).map((student: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.student_name}</p>
                      <p className="text-sm text-gray-600">{student.course} • {student.semester}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {student.productivity_score.toFixed(1)} pts
                      </Badge>
                      <div className="text-sm">
                        <span className="font-bold text-blue-600">{student.total_attendances}</span>
                        <span className="text-gray-600"> atendimentos</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-yellow-600">{student.avg_rating.toFixed(1)}</span>
                        <span className="text-gray-600"> ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Top 10 Serviços por Demanda
            </CardTitle>
            <CardDescription>Serviços mais solicitados e concluídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.services?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        <p className="text-sm text-gray-600">{service.category} • {service.difficulty}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{formatNumber(service.total_requests)}</div>
                        <div className="text-xs text-gray-600">solicitações</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Taxa de Conclusão</span>
                          <span className="font-medium">{formatPercentage(service.completion_rate)}</span>
                        </div>
                        <Progress value={service.completion_rate} className="h-2" />
                      </div>
                      {service.avg_rating > 0 && (
                        <Badge variant="secondary">
                          ⭐ {service.avg_rating.toFixed(1)}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {service.avg_duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Métricas de Tempo e Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {performance.performanceStats?.avg_attendance_duration?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média de Atendimento</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {performance.performanceStats?.avg_response_time_hours?.toFixed(1) || 0} h
                </div>
                <div className="text-sm text-gray-600 mt-1">Tempo Médio de Resposta (Chat)</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {performance.performanceStats?.avg_conversation_duration_minutes?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média de Conversa</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudentsSection = () => {
    const students = data.students

    if (!students) {
      return <div className="text-center py-8 text-gray-500">Carregando dados dos estudantes...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(students.statistics?.total || 0)}</div>
              <p className="text-sm text-gray-600">Total de Estudantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{students.statistics?.avg_productivity?.toFixed(2) || 0}</div>
              <p className="text-sm text-gray-600">Produtividade Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{students.statistics?.avg_rating?.toFixed(1) || 0}</div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(students.statistics?.total_hours || 0)}</div>
              <p className="text-sm text-gray-600">Total de Horas</p>
            </CardContent>
          </Card>
        </div>

        {/* Estudantes por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ativos</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(students.byStatus?.active?.length || 0)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inativos</span>
                  <Minus className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {formatNumber(students.byStatus?.inactive?.length || 0)}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Suspensos</span>
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(students.byStatus?.suspended?.length || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 15 Estudantes */}
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Estudantes</CardTitle>
            <CardDescription>Ranking completo de estudantes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.all?.slice(0, 15).map((student: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index < 3 ? 'bg-yellow-500' : index < 6 ? 'bg-gray-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.student_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{student.course}</span>
                        <span>•</span>
                        <span>{student.semester}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{student.status}</Badge>
                      </div>
                      {student.specialties && student.specialties.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {student.specialties.slice(0, 3).map((specialty: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      <span className="text-blue-600">{student.total_attendances}</span> atendimentos
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.completed_attendances} concluídos ({formatPercentage(student.completion_rate)})
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {student.avg_rating.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {student.productivity_score.toFixed(1)} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Curso */}
        <Card>
          <CardHeader>
            <CardTitle>Estudantes por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(students.byCourse || {}).map(([course, courseStudents]: [string, any], index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{course}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{courseStudents.length} estudantes</span>
                    <Badge variant="secondary">
                      {((courseStudents.length / (students.all?.length || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderServicesSection = () => {
    const services = data.services

    if (!services) {
      return <div className="text-center py-8 text-gray-500">Carregando dados dos serviços...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <Settings className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(services.statistics?.total || 0)}</div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Activity className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(services.statistics?.total_requests || 0)}</div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatPercentage(services.statistics?.avg_completion_rate || 0)}</div>
              <p className="text-sm text-gray-600">Taxa Média de Conclusão</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{(services.statistics?.avg_rating || 0).toFixed(1)}</div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Serviços Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 10 Serviços Mais Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.topRequested?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                        <h4 className="font-semibold">{service.service_name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{service.category}</Badge>
                        <Badge variant="secondary">{service.difficulty}</Badge>
                        {service.is_featured && <Badge variant="default">Destaque</Badge>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold text-blue-600">{formatNumber(service.total_requests)}</div>
                      <div className="text-xs text-gray-600">solicitações</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-lg font-bold text-green-600">{service.completed_count}</div>
                      <div className="text-xs text-gray-600">Concluídos</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <div className="text-lg font-bold text-yellow-600">{service.pending_count}</div>
                      <div className="text-xs text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="text-lg font-bold text-purple-600">{formatPercentage(service.completion_rate)}</div>
                      <div className="text-xs text-gray-600">Taxa</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div className="text-lg font-bold text-orange-600">
                        {service.avg_rating > 0 ? `⭐ ${service.avg_rating.toFixed(1)}` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Avaliação</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Serviços por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(services.byCategory || {}).map(([category, catServices]: [string, any], index: number) => {
                const totalRequests = catServices.reduce((sum: number, s: any) => sum + (s.total_requests || 0), 0)
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium capitalize">{category}</span>
                      <div className="text-sm text-gray-600 mt-1">{catServices.length} serviços</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{formatNumber(totalRequests)}</div>
                      <div className="text-xs text-gray-600">solicitações</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Melhor Avaliados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 10 Serviços Melhor Avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.topRated?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">{formatNumber(service.total_requests)} solicitações</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">⭐ {service.avg_rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">de 5.0</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSatisfactionSection = () => {
    const satisfaction = data.satisfaction

    if (!satisfaction) {
      return <div className="text-center py-8 text-gray-500">Carregando dados de satisfação...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais do Chat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_users || 0)}</div>
              <p className="text-sm text-gray-600">Usuários do Chat</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.active_users || 0)} ativos
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Activity className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_conversations || 0)}</div>
              <p className="text-sm text-gray-600">Total de Conversas</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.active_conversations || 0)} ativas
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_feedback || 0)}</div>
              <p className="text-sm text-gray-600">Total de Feedbacks</p>
              <Badge variant="secondary" className="mt-2">
                ⭐ {(satisfaction.statistics?.avg_feedback_rating || 0).toFixed(1)}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_appointments || 0)}</div>
              <p className="text-sm text-gray-600">Agendamentos via Chat</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.completed_appointments || 0)} concluídos
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Satisfação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-yellow-500 mb-2">
                {(satisfaction.satisfactionDistribution?.avg_rating || 0).toFixed(1)}
              </div>
              <div className="text-gray-600">de 5.0</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= (satisfaction.satisfactionDistribution?.avg_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = satisfaction.satisfactionDistribution?.[`rating_${rating}`] || 0
                  const total = satisfaction.satisfactionDistribution?.total_ratings || 1
                  const percentage = (count / total) * 100
                  return (
                    <div key={rating} className="text-center p-2 border rounded">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-gray-600">{rating} ⭐</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>NPS Score:</strong> {satisfaction.satisfactionDistribution?.nps_score?.toFixed(1) || 0}
                {' '}- Baseado em {formatNumber(satisfaction.satisfactionDistribution?.total_ratings || 0)} avaliações
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Crescimento de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(satisfaction.userGrowth?.daily?.slice(-7).reduce((sum: number, d: any) => sum + d.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimos 7 dias</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(satisfaction.userGrowth?.weekly?.slice(-4).reduce((sum: number, w: any) => sum + w.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimas 4 semanas</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(satisfaction.userGrowth?.monthly?.slice(-3).reduce((sum: number, m: any) => sum + m.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimos 3 meses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Conversação */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Conversação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {satisfaction.conversationMetrics?.avg_messages_per_conversation?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Mensagens por Conversa</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {satisfaction.conversationMetrics?.avg_conversation_duration?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {satisfaction.conversationMetrics?.avg_response_time?.toFixed(1) || 0} h
                </div>
                <div className="text-sm text-gray-600 mt-1">Tempo de Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes (Top 20)</CardTitle>
            <CardDescription>Últimos comentários de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfaction.recentFeedback?.slice(0, 20).map((feedback: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feedback.client_name}</span>
                      <Badge variant={feedback.source === 'chat' ? 'secondary' : 'outline'}>
                        {feedback.source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{feedback.feedback}"</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(feedback.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuários do Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados via Chat (Últimos 50)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {satisfaction.chatUsers?.slice(0, 50).map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span>•</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                    </div>
                    {user.city && (
                      <p className="text-xs text-gray-500">
                        {user.city} • {user.occupation || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !data.general) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Carregando Business Intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Business Intelligence - Análise Completa</span>
            </div>
            <Button
              onClick={loadData}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Análise detalhada com dados em tempo real de estudantes, serviços, atendimentos e satisfação do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Última atualização: {lastUpdated}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Painel de Filtros Avançados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle>Filtros de Relatório</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                {showFilters ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Ocultar Filtros
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Mostrar Filtros
                  </>
                )}
              </Button>
              {(filters.dateRange !== 'all' || (filters.status && filters.status.length > 0) || filters.studentId || filters.minRating) && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Personalize os relatórios filtrando por período, estudante, status, avaliação e mais
          </CardDescription>
        </CardHeader>

        {showFilters && (
          <CardContent className="space-y-6">
            {/* Linha 1: Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateRange" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Período do Relatório
                </Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger id="dateRange">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📊 Todos os Dados</SelectItem>
                    <SelectItem value="week">📅 Última Semana</SelectItem>
                    <SelectItem value="month">📆 Último Mês</SelectItem>
                    <SelectItem value="quarter">📈 Último Trimestre</SelectItem>
                    <SelectItem value="year">📊 Último Ano</SelectItem>
                    <SelectItem value="custom">🎯 Período Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.dateRange === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Linha 2: Status dos Atendimentos */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Status dos Atendimentos
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'CONCLUIDO', label: 'Concluído', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                  { value: 'EM_ANDAMENTO', label: 'Em Andamento', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                  { value: 'AGENDADO', label: 'Agendado', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                  { value: 'CANCELADO', label: 'Cancelado', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                  { value: 'NAO_COMPARECEU', label: 'Não Compareceu', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatusFilter(status.value)}
                    className={`${
                      filters.status?.includes(status.value)
                        ? status.color + ' border-2'
                        : 'bg-white'
                    }`}
                  >
                    {filters.status?.includes(status.value) && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Linha 3: Filtros Avançados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRating" className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Avaliação Mínima
                </Label>
                <Select
                  value={filters.minRating?.toString() || '0'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseInt(value) }))}
                >
                  <SelectTrigger id="minRating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todas as Avaliações</SelectItem>
                    <SelectItem value="1">⭐ 1+ Estrela</SelectItem>
                    <SelectItem value="2">⭐⭐ 2+ Estrelas</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3+ Estrelas</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4+ Estrelas</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Curso
                </Label>
                <Input
                  id="course"
                  placeholder="Ex: Ciências Contábeis"
                  value={filters.course || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Semestre
                </Label>
                <Input
                  id="semester"
                  placeholder="Ex: 5"
                  value={filters.semester || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                />
              </div>
            </div>

            {/* Linha 4: Filtro de Feedback */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-pink-600" />
                Feedback do Cliente
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, hasFeedback: true }))}
                  className={filters.hasFeedback === true ? 'bg-pink-100 border-pink-500' : ''}
                >
                  {filters.hasFeedback === true && <CheckCircle className="h-3 w-3 mr-1" />}
                  Com Feedback
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, hasFeedback: false }))}
                  className={filters.hasFeedback === false ? 'bg-gray-100 border-gray-500' : ''}
                >
                  {filters.hasFeedback === false && <CheckCircle className="h-3 w-3 mr-1" />}
                  Sem Feedback
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, hasFeedback: undefined }))}
                  className={filters.hasFeedback === undefined ? 'bg-blue-100 border-blue-500' : ''}
                >
                  {filters.hasFeedback === undefined && <CheckCircle className="h-3 w-3 mr-1" />}
                  Todos
                </Button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={applyFilters}
                  disabled={applyingFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {applyingFilters ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Aplicar Filtros
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => exportReport('csv')}
                  disabled={exportingReport}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button
                  onClick={() => exportReport('json')}
                  disabled={exportingReport}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            </div>

            {/* Indicador de filtros ativos */}
            {(filters.dateRange !== 'all' || (filters.status && filters.status.length > 0) || filters.minRating || filters.course || filters.semester) && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Filtros Ativos:</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filters.dateRange !== 'all' && (
                      <Badge variant="secondary">
                        📅 {filters.dateRange === 'week' ? 'Última Semana' : 
                           filters.dateRange === 'month' ? 'Último Mês' :
                           filters.dateRange === 'quarter' ? 'Último Trimestre' :
                           filters.dateRange === 'year' ? 'Último Ano' : 'Personalizado'}
                      </Badge>
                    )}
                    {filters.status && filters.status.length > 0 && (
                      <Badge variant="secondary">
                        ✓ {filters.status.length} Status
                      </Badge>
                    )}
                    {filters.minRating && (
                      <Badge variant="secondary">
                        ⭐ {filters.minRating}+ Estrelas
                      </Badge>
                    )}
                    {filters.course && (
                      <Badge variant="secondary">
                        🎓 {filters.course}
                      </Badge>
                    )}
                    {filters.semester && (
                      <Badge variant="secondary">
                        📚 Semestre {filters.semester}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Estudantes</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Satisfação</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          {renderGeneralSection()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {renderPerformanceSection()}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {renderStudentsSection()}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {renderServicesSection()}
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-6">
          {renderSatisfactionSection()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
