// Dashboard Avançado para Coordenadores - NAF Contábil
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, FileText, CheckCircle, Clock, TrendingUp,
  Calendar, Award, AlertTriangle, Download, RefreshCw,
  BarChart3, PieChart, Activity, Star, Target
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js'
import FiscalAppointmentsSection from './FiscalAppointmentsSection'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

interface DashboardStats {
  totalDemands: number
  totalAttendances: number
  totalStudents: number
  totalTeachers: number
  pendingValidations: number
  completedThisMonth: number
  averageResponseTime: number
  monthlyGrowth: number
  topServices: Array<{ name: string; count: number }>
  studentRanking: Array<{ name: string; attendances: number; hours: number }>
}

interface ChartData {
  labels: string[]
  datasets: unknown[]
}

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeFilter, setTimeFilter] = useState('30') // dias
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' ou 'fiscal-appointments'

  // Dados para gráficos
  const [monthlyData, setMonthlyData] = useState<ChartData | null>(null)
  const [serviceData, setServiceData] = useState<ChartData | null>(null)
  const [performanceData, setPerformanceData] = useState<ChartData | null>(null)
  const [trendsData, setTrendsData] = useState<ChartData | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas principais
      const statsResponse = await fetch(`/api/reports/advanced?type=dashboard&timeFilter=${timeFilter}`)
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.data)
        generateChartData(statsData.data)
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [timeFilter])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const generateChartData = (data: DashboardStats) => {
    // Gráfico mensal de atendimentos
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    const monthlyAttendances = [45, 52, 48, 61, 55, 67] // Dados simulados
    
    setMonthlyData({
      labels: months,
      datasets: [
        {
          label: 'Atendimentos',
          data: monthlyAttendances,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Demandas',
          data: [40, 48, 44, 58, 51, 63],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    })

    // Gráfico de serviços mais solicitados
    setServiceData({
      labels: data.topServices.map(s => s.name),
      datasets: [
        {
          data: data.topServices.map(s => s.count),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'
          ],
          borderWidth: 0
        }
      ]
    })

    // Gráfico de performance dos estudantes
    const topStudents = data.studentRanking.slice(0, 5)
    setPerformanceData({
      labels: topStudents.map(s => s.name.split(' ')[0]),
      datasets: [
        {
          label: 'Horas',
          data: topStudents.map(s => s.hours),
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        },
        {
          label: 'Atendimentos',
          data: topStudents.map(s => s.attendances),
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        }
      ]
    })

    // Gráfico radar de tendências
    setTrendsData({
      labels: ['Qualidade', 'Produtividade', 'Satisfação', 'Pontualidade', 'Inovação'],
      datasets: [
        {
          label: 'NAF Contábil',
          data: [85, 92, 88, 90, 78],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)'
        }
      ]
    })
  }

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/reports/advanced?type=${type}&format=excel`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Coordenador</h1>
            <p className="text-gray-600 dark:text-gray-400">Visão completa do NAF Contábil</p>
          </div>

          <div className="flex gap-2 items-center">
            {activeTab === 'dashboard' && (
              <>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 3 meses</option>
                  <option value="365">Último ano</option>
                </select>

                <Button
                  onClick={refreshData}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                <Button
                  onClick={() => exportReport('dashboard')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700'
              }`}
            >
              <BarChart3 className="h-5 w-5 inline mr-2" />
              Dashboard Geral
            </button>
            <button
              onClick={() => setActiveTab('fiscal-appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fiscal-appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700'
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Agendamentos Fiscais
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'dashboard' ? (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Demandas</p>
                <p className="text-3xl font-bold">{stats.totalDemands}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% este mês
                </p>
              </div>
              <FileText className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Atendimentos</p>
                <p className="text-3xl font-bold">{stats.totalAttendances}</p>
                <p className="text-green-100 text-xs mt-1">
                  {stats.completedThisMonth} concluídos este mês
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Estudantes Ativos</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-purple-100 text-xs mt-1">
                  {stats.totalTeachers} professores
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pendingValidations}</p>
                <p className="text-orange-100 text-xs mt-1">
                  Aguardando validação
                </p>
              </div>
              <Clock className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendências Mensais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências Mensais
            </CardTitle>
            <CardDescription>
              Atendimentos e demandas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData && (
              <div className="h-64">
                <Line 
                  data={monthlyData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Serviços Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Serviços Mais Solicitados
            </CardTitle>
            <CardDescription>
              Top 5 serviços por demanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serviceData && (
              <div className="h-64">
                <Doughnut 
                  data={serviceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance dos Estudantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Estudantes
            </CardTitle>
            <CardDescription>
              Ranking por horas e atendimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData && (
              <div className="h-64">
                <Bar 
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Radar de Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Indicadores de Qualidade
            </CardTitle>
            <CardDescription>
              Métricas de performance geral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendsData && (
              <div className="h-64">
                <Radar 
                  data={trendsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Estudantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Ranking de Estudantes
          </CardTitle>
          <CardDescription>
            Top 10 estudantes por performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.studentRanking.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.attendances} atendimentos • {student.hours}h
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {student.hours}h
                  </Badge>
                  {index < 3 && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Relatório de Atendimentos</h3>
            <p className="text-sm text-blue-700 mb-4">Exportar dados completos de atendimentos</p>
            <Button 
              onClick={() => exportReport('attendance')}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Relatório de Estudantes</h3>
            <p className="text-sm text-green-700 mb-4">Performance e estatísticas dos estudantes</p>
            <Button 
              onClick={() => exportReport('student')}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-900 mb-2">Dados Power BI</h3>
            <p className="text-sm text-purple-700 mb-4">Exportar para análise avançada</p>
            <Button 
              onClick={() => exportReport('powerbi')}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              Exportar Dados
            </Button>
          </CardContent>
        </Card>
      </div>

          {/* Alertas e Notificações */}
          {stats.pendingValidations > 10 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">
                      Atenção: {stats.pendingValidations} atendimentos pendentes de validação
                    </p>
                    <p className="text-sm text-orange-700">
                      Revise e valide os atendimentos em atraso para manter a qualidade do serviço.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Seção de Agendamentos Fiscais */
        <FiscalAppointmentsSection />
      )}
    </div>
  )
}
