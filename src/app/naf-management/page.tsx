'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  XCircle,
  AlertTriangle,
  Activity,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import SimpleChart from '@/components/charts/SimpleChart'
import NAFFooter from '@/components/layout/NAFFooter'

interface AppointmentData {
  id: string
  protocol: string
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  service_title: string
  service_category?: string
  status: string
  urgency_level: string
  preferred_date: string
  preferred_period: string
  client_notes: string
  created_at: string
  address_city: string
  address_state: string
}

interface ServiceStats {
  service_type: string
  service_title: string
  total_appointments: number
  pending_count: number
  confirmed_count: number
  completed_count: number
  cancelled_count: number
  avg_urgency_score: number
  recent_appointments: number
}

export default function NAFManagementPage() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [stats, setStats] = useState<ServiceStats[]>([])
  const [overview, setOverview] = useState<unknown>(null)
  const [reportFormat, setReportFormat] = useState<'pdf'|'xlsx'|'csv'|'docx'>('pdf')
  const [reportStatus, setReportStatus] = useState<string>('all')
  const [reportCategory, setReportCategory] = useState<string>('all')
  const [reportPeriod, setReportPeriod] = useState<string>('6m')
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [user, setUser] = useState<unknown>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const quickLinks = [
    {
      value: 'overview',
      label: 'Visão Geral',
      description: 'Indicadores estratégicos',
      icon: TrendingUp
    },
    {
      value: 'appointments',
      label: 'Atendimentos',
      description: 'Fila e andamento',
      icon: Calendar
    },
    {
      value: 'services',
      label: 'Serviços',
      description: 'Desempenho por categoria',
      icon: FileText
    },
    {
      value: 'reports',
      label: 'Relatórios',
      description: 'Exportações e backups',
      icon: BarChart3
    }
  ]

  // Download report helper
  const downloadReport = async (format: string) => {
    try {
      setReportLoading(true)
      const params = new URLSearchParams({
        format,
        period: reportPeriod,
        status: reportStatus,
        category: reportCategory,
      })
      const res = await fetch(`/api/naf/management/report?${params.toString()}`)
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        alert(`❌ Erro ao gerar relatório (${res.status}). Detalhe: ${txt?.slice(0,200)}`)
        return
      }
      if (format === 'pdf' || format === 'xlsx' || format === 'docx' || format === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-naf-management-${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : (format === 'docx' ? 'docx' : (format === 'csv' ? 'csv' : 'pdf'))}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } else {
        const data = await res.json()
        console.log('Relatório JSON', data)
      }
    } catch (e: unknown) {
      console.error('Erro ao gerar relatório', e)
      alert('❌ Erro ao gerar relatório. Verifique sua conexão e tente novamente.')
    } finally { setReportLoading(false) }
  }

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('naf_auth_token')
      const userData = localStorage.getItem('naf_user_data')

      if (!token || !userData) {
        router.push('/naf-login')
        return
      }

      try {
        setUser(JSON.parse(userData))
      } catch (_error) {
        router.push('/naf-login')
      }
    }

    checkAuth()
  }, [router])

  // Load dashboard data
  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        const [aptsRes, overviewRes] = await Promise.all([
          fetch('/api/fiscal-appointments'),
          fetch('/api/naf/management/overview')
        ])

        if (aptsRes.ok) {
          const data = await aptsRes.json()
          setAppointments(data.appointments || [])
          setStats(data.stats || [])
        }

        if (overviewRes.ok) {
          const ov = await overviewRes.json()
          setOverview(ov.data)
        } else {
          console.warn('Não foi possível carregar overview NAF Management')
        }
      } catch (loadError) {
        console.error('Erro de conexão ao carregar dados do NAF Management', loadError)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Calculate dashboard metrics (from overview when disponível)
  const totalAppointments = overview?.totalAppointments ?? appointments.length
  const completedAppointments = overview?.completedAppointments ?? appointments.filter(a => a.status === 'CONCLUIDO').length
  const pendingAppointments = overview?.pendingAppointments ?? appointments.filter(a => a.status === 'PENDENTE').length
  const confirmedAppointments = overview?.confirmedAppointments ?? overview?.statusCounts?.CONFIRMADO ?? appointments.filter(a => a.status === 'CONFIRMADO').length
  const activeStudents = overview?.activeStudents ?? 0
  const inProgressAppointments = overview?.inProgressAppointments ?? overview?.statusCounts?.EM_ANDAMENTO ?? appointments.filter(a => a.status === 'EM_ANDAMENTO').length
  const cancelledAppointments = overview?.cancelledAppointments ?? overview?.statusCounts?.CANCELADO ?? appointments.filter(a => a.status === 'CANCELADO').length
  const urgentAppointments = overview?.urgentAppointments ?? appointments.filter(a => a.urgency_level === 'URGENTE').length
  const newAppointments30Days = overview?.newAppointments30Days ?? appointments.filter(a => {
    const createdAt = new Date(a.created_at || a.preferred_date)
    if (Number.isNaN(createdAt.getTime())) return false
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 30)
    return createdAt >= threshold
  }).length
  const completionRate = overview?.completionRate ?? (totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0)
  const averageMonthlyVolume = overview?.monthlyTrends?.length
    ? Math.round(
        overview.monthlyTrends.reduce((sum: number, item: unknown) => sum + (item.value || 0), 0) /
          overview.monthlyTrends.length
      )
    : 0

  // Conversão do mês atual (concluídos/total)
  const currentIndex = (overview?.monthlyTrends?.length || 0) - 1
  const currentTotal = currentIndex >= 0 ? overview?.monthlyTrends?.[currentIndex]?.value || 0 : 0
  const currentCompleted = currentIndex >= 0 ? overview?.monthlyCompleted?.[currentIndex]?.value || 0 : 0
  const currentConversionPct = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0

  const overviewMetricsCards = [
    {
      title: 'Total de Atendimentos',
      value: totalAppointments,
      description: '+23% este mês',
      icon: BarChart3,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Concluídos',
      value: completedAppointments,
      description: `${totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}% do total`,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Pendentes',
      value: pendingAppointments,
      description: 'Aguardando atendimento',
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Estudantes Ativos',
      value: activeStudents,
      description: 'Realizando atendimentos',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Confirmados',
      value: confirmedAppointments,
      description: 'Agendamentos confirmados',
      icon: CheckCircle,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Em Andamento',
      value: inProgressAppointments,
      description: 'Atendimentos em progresso',
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      description: `${completedAppointments} concluídos`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Cancelados',
      value: cancelledAppointments,
      description: 'Atendimentos a reagendar',
      icon: XCircle,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    },
    {
      title: 'Urgentes',
      value: urgentAppointments,
      description: 'Exigem atenção imediata',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: 'Novos (30 dias)',
      value: newAppointments30Days,
      description: 'Agendamentos recentes',
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Média Mensal',
      value: averageMonthlyVolume,
      description: 'Atendimentos por mês',
      icon: Activity,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Conversão (Mês)',
      value: `${currentConversionPct}%`,
      description: 'Concluídos / Total',
      icon: TrendingUp,
      iconBg: 'bg-fuchsia-100',
      iconColor: 'text-fuchsia-600'
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('naf_auth_token')
    localStorage.removeItem('naf_user_data')
    router.push('/naf-login')
  }

  const getFilteredAppointments = () => {
    if (selectedStatus === 'all') return appointments
    return appointments.filter(appointment => appointment.status === selectedStatus)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-800'
      case 'EM_ANDAMENTO': return 'bg-orange-100 text-orange-800'
      case 'CONCLUIDO': return 'bg-green-100 text-green-800'
      case 'CANCELADO': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'BAIXA': return 'bg-green-100 text-green-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'ALTA': return 'bg-orange-100 text-orange-800'
      case 'URGENTE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel NAF...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header com Navegação */}
      <header className="bg-white dark:bg-gray-950/80 backdrop-blur-md shadow-lg border-b border-slate-200/50">
        <div className="w-full px-6 lg:px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            {/* Título */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Gestão NAF
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Painel Executivo
                </p>
              </div>
            </div>

            {/* Navegação - Inline */}
            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                  🏠 Início
                </Button>
              </Link>

              {/* Portais Dropdown */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                  👥 Portais ▼
                </Button>
                <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-slate-200 dark:border-gray-700 min-w-[200px] z-[9999]">
                  <Link href="/student-portal" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    🎓 Portal Estudantil
                  </Link>
                  <Link href="/coordinator-dashboard" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    📊 Central de Coordenação
                  </Link>
                </div>
              </div>

              {/* Serviços Dropdown */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                  📋 Serviços ▼
                </Button>
                <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-slate-200 dark:border-gray-700 min-w-[200px] z-[9999]">
                  <Link href="/services" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    📚 Catálogo de Serviços
                  </Link>
                  <Link href="/schedule" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    📅 Agendar Atendimento
                  </Link>
                </div>
              </div>

              {/* Acesso Dropdown */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                  🔐 Acesso ▼
                </Button>
                <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-slate-200 dark:border-gray-700 min-w-[200px] z-[9999]">
                  <Link href="/student-login" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    🎓 Login Estudante
                  </Link>
                  <Link href="/coordinator-login" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    👨‍💼 Login Coordenador
                  </Link>
                  <Link href="/naf-login" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-sm">
                    ⚙️ Login Gestão
                  </Link>
                </div>
              </div>
            </nav>

            {/* Botão de Logout */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Módulos de Gestão */}
      <section className="py-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Módulos de Gestão</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickLinks.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.value)
                    document.getElementById('naf-management-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <Tabs id="naf-management-tabs" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="sr-only">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {overviewMetricsCards.map((metric, index) => {
                const IconComp = metric.icon
                return (
                  <Card key={`${metric.title}-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                          {metric.description && (
                            <p className="text-sm text-gray-500">{metric.description}</p>
                          )}
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.iconBg}`}>
                          <IconComp className={`h-6 w-6 ${metric.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atendimentos por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Atendimentos por Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chart visualization */}
                  <SimpleChart
                    type="pie"
                    data={['CONCLUIDO','EM_ANDAMENTO','PENDENTE','CONFIRMADO','CANCELADO'].map((label, i) => ({
                      label: label === 'CONCLUIDO' ? 'Concluído' : label === 'EM_ANDAMENTO' ? 'Em Andamento' : label === 'PENDENTE' ? 'Pendente' : label === 'CONFIRMADO' ? 'Confirmado' : 'Cancelado',
                      value: overview?.statusCounts?.[label] ?? appointments.filter(a => a.status === label).length,
                      color: ['#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444'][i]
                    }))}
                    height={180}
                  />
                  <div className="space-y-3">
                    {['CONCLUIDO','EM_ANDAMENTO','PENDENTE','CONFIRMADO','CANCELADO'].map((label) => {
                      const count = overview?.statusCounts?.[label] ?? appointments.filter(a => a.status === label).length
                      const pct = totalAppointments > 0 ? (count / totalAppointments) * 100 : 0
                      const pretty = label === 'CONCLUIDO' ? 'Concluído' :
                                    label === 'EM_ANDAMENTO' ? 'Em Andamento' :
                                    label === 'PENDENTE' ? 'Pendente' :
                                    label === 'CONFIRMADO' ? 'Confirmado' :
                                    label === 'CANCELADO' ? 'Cancelado' : label
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{pretty}</span>
                            <span className="text-sm text-gray-500">{count} atendimentos</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Atendimentos por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Atendimentos por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chart visualization */}
                  {(() => {
                    const counts = overview?.categoryCounts || appointments.reduce((acc: unknown, a) => { acc[a.service_category || 'OUTROS'] = (acc[a.service_category || 'OUTROS'] || 0) + 1; return acc }, {})
                    const entries = Object.entries(counts).sort((a: unknown, b: unknown) => b[1] - a[1]).slice(0, 6)
                    return (
                      <SimpleChart
                        type="bar"
                        data={entries.map(([cat, count]: unknown, idx: number) => ({ label: String(cat), value: Number(count), color: ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'][idx % 6] }))}
                        height={180}
                      />
                    )
                  })()}
                  <div className="space-y-3">
                    {(() => {
                      const counts = overview?.categoryCounts || appointments.reduce((acc: unknown, a) => { acc[a.service_category || 'OUTROS'] = (acc[a.service_category || 'OUTROS'] || 0) + 1; return acc }, {})
                      const entries = Object.entries(counts).sort((a: unknown, b: unknown) => b[1] - a[1]).slice(0, 6)
                      return entries.map(([cat, count]: unknown) => (
                        <div key={cat}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{cat}</span>
                            <span className="text-sm text-gray-500">{count}</span>
                          </div>
                          <Progress value={totalAppointments > 0 ? (count / totalAppointments) * 100 : 0} className="h-2" />
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tendência Mensal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência Mensal de Atendimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="line"
                    data={(overview?.monthlyTrends || []).map((p: unknown) => ({ label: p.label, value: p.value, color: '#2563EB' }))}
                    height={220}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Concluídos por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="line"
                    data={(overview?.monthlyCompleted || []).map((p: unknown) => ({ label: p.label, value: p.value, color: '#10B981' }))}
                    height={220}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Conversão Mensal (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="line"
                    data={(overview?.monthlyTrends || []).map((t: unknown, i: number) => {
                      const total = t.value || 0
                      const comp = overview?.monthlyCompleted?.[i]?.value || 0
                      const pct = total > 0 ? Math.round((comp / total) * 100) : 0
                      return { label: t.label, value: pct, color: '#8B5CF6' }
                    })}
                    height={220}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Atendimentos */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Gerenciar Atendimentos</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="all">Todos os Status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {getFilteredAppointments().map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge className={getUrgencyColor(appointment.urgency_level)}>
                            {appointment.urgency_level}
                          </Badge>
                          <span className="text-sm font-mono text-gray-500">
                            {appointment.protocol}
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white dark:text-white mb-2">
                          {appointment.service_title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{appointment.client_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{appointment.client_email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.client_phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.address_city}, {appointment.address_state}</span>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {appointment.client_notes || 'Nenhuma observação'}
                          </p>
                        </div>

                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Criado em: {new Date(appointment.created_at).toLocaleDateString('pt-BR')} às {new Date(appointment.created_at).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getFilteredAppointments().length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou aguarde novas solicitações.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Relatórios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="report-format" className="text-sm text-gray-600">Formato</label>
                    <select
                      id="report-format"
                      className="w-full border rounded px-3 py-2"
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'xlsx' | 'csv' | 'docx')}
                    >
                      <option value="pdf">PDF</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="csv">CSV</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-period" className="text-sm text-gray-600">Período</label>
                    <select
                      id="report-period"
                      className="w-full border rounded px-3 py-2"
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                    >
                      <option value="3m">Últimos 3 meses</option>
                      <option value="6m">Últimos 6 meses</option>
                      <option value="12m">Últimos 12 meses</option>
                      <option value="all">Todos</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-status" className="text-sm text-gray-600">Status</label>
                    <select
                      id="report-status"
                      className="w-full border rounded px-3 py-2"
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-category" className="text-sm text-gray-600">Categoria</label>
                    <select
                      id="report-category"
                      className="w-full border rounded px-3 py-2"
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                    >
                      <option value="all">Todas</option>
                      {/* Opcional: popular dinamicamente com overview.categoryCounts */}
                      {overview && overview.categoryCounts && Object.keys(overview.categoryCounts).map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={async () => { await downloadReport(reportFormat) }} className="bg-emerald-600 hover:bg-emerald-700" disabled={reportLoading}>
                    {reportLoading ? 'Gerando...' : 'Baixar Relatório'}
                  </Button>
                  <Button variant="outline" onClick={async () => { await downloadReport('pdf') }} disabled={reportLoading}>PDF Rápido</Button>
                </div>
                <p className="text-xs text-gray-500">Inclui KPIs, status, categorias, tendências e tabela detalhada. Utilize os filtros para segmentar os dados (em breve).</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Serviços */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                'Cadastro de CPF - Guia Completo',
                'MEI - Formalização e Gestão',
                'Declaração de Imposto de Renda PF',
                'ITR - Imposto Territorial Rural',
                'Abertura de CNPJ',
                'e-Social Doméstico',
                'Alvará de Funcionamento Municipal',
                'ISS - Imposto sobre Serviços',
                'ICMS - Imposto sobre Circulação de Mercadorias'
              ].map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total de solicitações</span>
                        <span className="font-semibold">{stats.find(s => s.service_title === service)?.total_appointments || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pendentes</span>
                        <span className="text-yellow-600">{stats.find(s => s.service_title === service)?.pending_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Concluídos</span>
                        <span className="text-green-600">{stats.find(s => s.service_title === service)?.completed_count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seção Precisa de Orientação Personalizada */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Precisa de Orientação Personalizada?
                </h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Nossa equipe especializada está pronta para oferecer orientação personalizada
                  em questões fiscais e contábeis. Agende uma consulta individual para receber
                  suporte direcionado às suas necessidades específicas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/schedule">
                    <Button
                      variant="secondary"
                      className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 text-blue-600 hover:bg-blue-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Orientação
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Entre em Contato
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <NAFFooter />
    </div>
  )
}
