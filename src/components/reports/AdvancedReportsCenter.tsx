'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle,
  Star,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Settings
} from 'lucide-react'

interface ReportMetrics {
  generalStats?: unknown
  performanceMetrics?: unknown
  studentReports?: unknown
  serviceReports?: unknown
  satisfactionAnalysis?: unknown
  powerBICompatibleData?: unknown
}

type ReportType = 'general' | 'performance' | 'students' | 'services' | 'satisfaction' | 'powerbi'
type ExportFormat = 'json' | 'pdf' | 'excel' | 'csv'

export default function AdvancedReportsCenter() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportMetrics>({})
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ReportType>('general')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [period, setPeriod] = useState('30d')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Load data for specific report type
  const loadReportData = async (type: ReportType) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`🔄 Loading ${type} report data...`)

      const response = await fetch(`/api/coordinator/reports/advanced?type=${type}&format=json&period=${period}`)
      const result = await response.json()

      if (result.success) {
        setData(prevData => ({
          ...prevData,
          [type]: result.data
        }))
        setLastUpdated(new Date().toLocaleString('pt-BR'))
        console.log(`✅ ${type} report loaded successfully`)
      } else {
        setError(result.error || `Erro ao carregar relatório ${type}`)
        console.error(`❌ Error loading ${type} report:`, result.error)
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Export report in specified format
  const exportReport = async (type: ReportType, format: ExportFormat) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`📤 Exporting ${type} report as ${format}...`)

      const response = await fetch(`/api/coordinator/reports/advanced?type=${type}&format=${format}&period=${period}`)

      if (format === 'json') {
        const result = await response.json()
        if (result.success) {
          // Download JSON file
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.json`
          a.click()
          URL.revokeObjectURL(url)
        } else {
          setError(result.error || 'Erro ao exportar relatório')
        }
      } else {
        // Handle binary formats (PDF, Excel)
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url

          const contentDisposition = response.headers.get('content-disposition')
          const filename = contentDisposition
            ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
            : `relatorio-${type}-${new Date().toISOString().split('T')[0]}.${format}`

          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
          console.log(`✅ ${type} report exported as ${format}`)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Erro ao exportar relatório')
        }
      }
    } catch (err) {
      setError('Erro ao exportar relatório')
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadReportData('general')
  }, [period])

  // Load data when tab changes
  useEffect(() => {
    if (!data[activeTab]) {
      loadReportData(activeTab)
    }
  }, [activeTab])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderGeneralReport = () => {
    const generalData = data.general?.generalStats

    if (!generalData) {
      return (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar o relatório geral</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(generalData.totalAttendances)}</p>
                  <p className="text-sm text-gray-600">Atendimentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatPercentage(generalData.completionRate)}</p>
                  <p className="text-sm text-gray-600">Taxa Conclusão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{generalData.averageSatisfaction.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Satisfação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-5 w-5 ${generalData.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <p className="text-2xl font-bold">{formatPercentage(generalData.monthlyGrowth)}</p>
                  <p className="text-sm text-gray-600">Crescimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estudantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatNumber(generalData.totalStudents)}</div>
              <p className="text-sm text-gray-600">estudantes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatNumber(generalData.totalServices)}</div>
              <p className="text-sm text-gray-600">serviços disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Duração Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{generalData.averageDuration} min</div>
              <p className="text-sm text-gray-600">por atendimento</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderPerformanceReport = () => {
    const performanceData = data.performance

    if (!performanceData) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar o relatório de performance</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Top Performing Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Serviços por Performance</CardTitle>
            <CardDescription>Serviços com melhor desempenho geral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.topPerformingServices?.slice(0, 5).map((service: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">{service.requests_count} solicitações</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{service.performance_score}</Badge>
                      <div className="text-sm text-gray-600">
                        {formatPercentage(service.completion_rate)} conclusão
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance dos Estudantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceData.studentPerformance?.filter((s: unknown) => s.performance_level === 'Excelente').length || 0}
                </div>
                <p className="text-sm text-gray-600">Estudantes Excelentes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceData.studentPerformance?.filter((s: unknown) => s.avg_rating >= 4.0).length || 0}
                </div>
                <p className="text-sm text-gray-600">Com Avaliação 4.0+</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {performanceData.studentPerformance?.filter((s: unknown) => s.total_attendances >= 10).length || 0}
                </div>
                <p className="text-sm text-gray-600">Com 10+ Atendimentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudentsReport = () => {
    const studentsData = data.students

    if (!studentsData) {
      return (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar o relatório de estudantes</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Student Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Estudantes</CardTitle>
            <CardDescription>Top 10 estudantes por número de atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentsData.studentRankings?.slice(0, 10).map((student: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.student_name}</p>
                      <p className="text-sm text-gray-600">{student.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{student.total_attendances}</div>
                    <div className="text-sm text-gray-600">
                      {student.avg_rating.toFixed(1)} ⭐ • {formatPercentage(student.completion_rate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productivity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">Mais Produtivos</h4>
                <div className="space-y-2">
                  {studentsData.productivityAnalysis?.slice(0, 5).map((student: unknown, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{student.student_name}</span>
                      <Badge variant="outline">{student.productivity_score} pts</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Estudantes Ativos</h4>
                <div className="text-3xl font-bold text-green-600">
                  {studentsData.activeStudents?.length || 0}
                </div>
                <p className="text-sm text-gray-600">estudantes com atendimentos realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderServicesReport = () => {
    const servicesData = data.services

    if (!servicesData) {
      return (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar o relatório de serviços</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Service Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicesData.servicePopularity?.slice(0, 10).map((service: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">
                      {service.completed_count} concluídos de {service.requests_count} total
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{service.requests_count}</div>
                    <div className="text-sm text-gray-600">solicitações</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Efetividade dos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicesData.serviceEffectiveness?.slice(0, 5).map((service: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">Satisfação: {service.avg_satisfaction.toFixed(1)}/5</p>
                  </div>
                  <div className="text-right">
                    <Progress value={service.completion_rate} className="w-20 mb-1" />
                    <div className="text-sm text-gray-600">{formatPercentage(service.completion_rate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSatisfactionReport = () => {
    const satisfactionData = data.satisfaction

    if (!satisfactionData) {
      return (
        <div className="text-center py-8">
          <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar o relatório de satisfação</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Overall Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfação Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-500 mb-2">
                {satisfactionData.overallSatisfaction?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600">de 5.0</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= (satisfactionData.overallSatisfaction || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfactionData.ratingDistribution?.map((rating: unknown) => (
                <div key={rating.rating} className="flex items-center space-x-3">
                  <div className="w-12 text-right">{rating.rating} ⭐</div>
                  <Progress value={rating.percentage} className="flex-1" />
                  <div className="w-20 text-right">
                    {rating.count} ({formatPercentage(rating.percentage)})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Services */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Melhor Avaliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfactionData.satisfactionByService?.slice(0, 5).map((service: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">{service.requests_count} avaliações</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {service.avg_satisfaction?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">de 5.0</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPowerBIReport = () => {
    const powerbiData = data.powerbi

    if (!powerbiData) {
      return (
        <div className="text-center py-8">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Carregue os dados para visualizar as informações do Power BI</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Power BI Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Integração Power BI</span>
            </CardTitle>
            <CardDescription>
              Dados formatados e otimizados para importação no Microsoft Power BI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {powerbiData.attendances?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Atendimentos</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {powerbiData.students?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Estudantes</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {powerbiData.services?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Serviços</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {powerbiData.fiscalAppointments?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Agendamentos</div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Instruções para Power BI:</strong>
                <br />
                1. Exporte os dados em formato Excel ou CSV
                <br />
                2. No Power BI, use "Obter Dados" → "Web" e cole a URL da API
                <br />
                3. Configure atualizações automáticas para dados em tempo real
                <br />
                4. Use os campos temporais (year, month, quarter) para criar visualizações dinâmicas
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Exportação Rápida para Power BI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => exportReport('powerbi', 'excel')}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel (Recomendado)</span>
              </Button>
              <Button
                onClick={() => exportReport('powerbi', 'csv')}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>CSV</span>
              </Button>
              <Button
                onClick={() => exportReport('powerbi', 'json')}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>JSON</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Central de Relatórios Avançados</span>
          </CardTitle>
          <CardDescription>
            Sistema completo de relatórios com análises detalhadas, exportação e integração Power BI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="90d">90 dias</SelectItem>
                    <SelectItem value="365d">1 ano</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-gray-500" />
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => loadReportData(activeTab)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>

              <Button
                onClick={() => exportReport(activeTab, exportFormat)}
                disabled={loading}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          {lastUpdated && (
            <div className="mt-4 text-sm text-gray-500">
              Última atualização: {lastUpdated}
            </div>
          )}

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportType)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Estudantes</span>
          </TabsTrigger>
          <TabsTrigger value="powerbi" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Power BI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          {renderGeneralReport()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {renderPerformanceReport()}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {renderStudentsReport()}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {renderServicesReport()}
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-6">
          {renderSatisfactionReport()}
        </TabsContent>

        <TabsContent value="powerbi" className="mt-6">
          {renderPowerBIReport()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Carregando relatórios...</p>
        </div>
      )}
    </div>
  )
}