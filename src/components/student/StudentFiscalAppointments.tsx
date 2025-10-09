'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Play,
  CheckCheck,
  X,
  FileText,
  Calculator,
  MessageSquare,
  Ban,
  CalendarX,
  Star,
  UserX,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import FeedbackModal from './FeedbackModal'

interface FiscalAppointment {
  id: string
  protocol: string
  service_type: string
  service_title: string
  service_category: string
  client_name: string
  client_email: string
  client_phone: string
  client_cpf?: string
  address_city: string
  address_state: string
  urgency_level: string
  preferred_date?: string
  preferred_time?: string
  preferred_period?: string
  status: string
  client_notes?: string
  internal_notes?: string
  service_details?: Record<string, unknown>
  created_at: string
  updated_at: string
  confirmed_at?: string
  scheduled_at?: string
  completed_at?: string
}

interface StudentFiscalAppointmentsProps {
  token: string
}

// Componente de gráfico simples sem dependências externas
const SimpleChart = ({ data, type = 'bar', title }: {
  data: Array<{label: string, value: number, color?: string}>,
  type?: 'bar' | 'pie',
  title?: string
}) => {
  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
      <div className="space-y-3">
        {title && <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{title}</h4>}
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-blue-500'}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Gráfico de pizza (pie chart) simplificado
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = -90 // Começar do topo

  return (
    <div className="space-y-3">
      {title && <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">{title}</h4>}
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const angle = (percentage / 100) * 360
            const radius = 70
            const centerX = 80
            const centerY = 80

            // Calcular coordenadas do arco
            const startAngle = currentAngle
            const endAngle = currentAngle + angle

            const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
            const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
            const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
            const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

            const largeArc = angle > 180 ? 1 : 0

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${startX} ${startY}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ')

            currentAngle += angle

            return item.value > 0 ? (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                stroke="white"
                strokeWidth="2"
              />
            ) : null
          })}
          <circle cx="80" cy="80" r="40" fill="white" />
          <text x="80" y="85" textAnchor="middle" className="text-lg font-bold fill-gray-900">
            {total}
          </text>
        </svg>
      </div>
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color || 'bg-gray-400'}`} />
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentFiscalAppointments({ token }: StudentFiscalAppointmentsProps) {
  const [appointments, setAppointments] = useState<FiscalAppointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    confirmados: 0,
    emAndamento: 0,
    concluidos: 0,
    cancelados: 0,
    naoCompareceu: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<FiscalAppointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showNoShowModal, setShowNoShowModal] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [noShowNotes, setNoShowNotes] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [reschedulePeriod, setReschedulePeriod] = useState('MANHA')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/students/fiscal-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const appts = data.fiscalAppointments || []
        setAppointments(appts)

        // Calcular estatísticas
        setStats({
          total: appts.length,
          pendentes: appts.filter((a: FiscalAppointment) => a.status === 'PENDENTE').length,
          confirmados: appts.filter((a: FiscalAppointment) => a.status === 'CONFIRMADO').length,
          emAndamento: appts.filter((a: FiscalAppointment) => a.status === 'EM_ANDAMENTO').length,
          concluidos: appts.filter((a: FiscalAppointment) => a.status === 'CONCLUIDO').length,
          cancelados: appts.filter((a: FiscalAppointment) => a.status === 'CANCELADO').length,
          naoCompareceu: appts.filter((a: FiscalAppointment) => a.status === 'NAO_COMPARECEU').length
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao carregar atendimentos')
      }
    } catch (err) {
      setError('Erro ao carregar atendimentos fiscais')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [token])

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string, notes?: string) => {
    try {
      setUpdating(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
          internalNotes: notes
        })
      })

      if (response.ok) {
        setSuccess('Atendimento atualizado com sucesso!')
        await loadAppointments()
        setShowDetails(false)
        setInternalNotes('')

        // Se finalizou, abrir modal de feedback
        if (newStatus === 'CONCLUIDO' && selectedAppointment) {
          setShowFeedbackModal(true)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao atualizar atendimento')
      }
    } catch (err) {
      setError('Erro ao atualizar atendimento')
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      setUpdating(true)
      setError('')

      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          status: 'CANCELADO',
          internalNotes: `Cancelado pelo estudante. Motivo: ${cancelReason}`
        })
      })

      if (response.ok) {
        setSuccess('Atendimento cancelado com sucesso')
        await loadAppointments()
        setShowCancelModal(false)
        setShowDetails(false)
        setCancelReason('')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao cancelar atendimento')
      }
    } catch (err) {
      setError('Erro ao cancelar atendimento')
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleNoShowAppointment = async () => {
    if (!selectedAppointment) return

    try {
      setUpdating(true)
      setError('')

      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          status: 'NAO_COMPARECEU',
          internalNotes: `Cliente não compareceu. ${noShowNotes ? `Observações: ${noShowNotes}` : ''}`
        })
      })

      if (response.ok) {
        setSuccess('Atendimento marcado como "Não Compareceu"')
        await loadAppointments()
        setShowNoShowModal(false)
        setShowDetails(false)
        setNoShowNotes('')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao atualizar atendimento')
      }
    } catch (err) {
      setError('Erro ao atualizar atendimento')
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate) {
      setError('Por favor, selecione uma data')
      return
    }

    try {
      setUpdating(true)
      setError('')

      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          preferred_date: rescheduleDate,
          preferred_time: rescheduleTime || null,
          preferred_period: reschedulePeriod,
          internalNotes: `Reagendado pelo estudante para ${rescheduleDate}${rescheduleTime ? ` às ${rescheduleTime}` : ''}`
        })
      })

      if (response.ok) {
        setSuccess('Atendimento reagendado com sucesso!')
        await loadAppointments()
        setShowRescheduleModal(false)
        setShowDetails(false)
        setRescheduleDate('')
        setRescheduleTime('')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao reagendar atendimento')
      }
    } catch (err) {
      setError('Erro ao reagendar atendimento')
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDENTE': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'CONFIRMADO': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'EM_ANDAMENTO': { color: 'bg-purple-100 text-purple-800', icon: Play },
      'CONCLUIDO': { color: 'bg-green-100 text-green-800', icon: CheckCheck },
      'CANCELADO': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'NAO_COMPARECEU': { color: 'bg-orange-100 text-orange-800', icon: UserX }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDENTE']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      'BAIXA': { color: 'bg-gray-100 text-gray-700' },
      'NORMAL': { color: 'bg-blue-100 text-blue-700' },
      'ALTA': { color: 'bg-orange-100 text-orange-700' },
      'URGENTE': { color: 'bg-red-100 text-red-700' }
    }

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig['NORMAL']

    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        {urgency === 'URGENTE' && <AlertTriangle className="h-3 w-3" />}
        {urgency}
      </Badge>
    )
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const openDetails = (appointment: FiscalAppointment) => {
    setSelectedAppointment(appointment)
    setInternalNotes(appointment.internal_notes || '')
    setShowDetails(true)
  }

  // Calcular dados para gráficos
  const completionRate = stats.total > 0
    ? Math.round((stats.concluidos / stats.total) * 100)
    : 0

  const statusChartData = [
    { label: 'Concluídos', value: stats.concluidos, color: 'bg-green-500' },
    { label: 'Em Andamento', value: stats.emAndamento, color: 'bg-purple-500' },
    { label: 'Confirmados', value: stats.confirmados, color: 'bg-blue-500' },
    { label: 'Pendentes', value: stats.pendentes, color: 'bg-yellow-500' },
    { label: 'Cancelados', value: stats.cancelados, color: 'bg-red-500' },
    { label: 'Não Compareceu', value: stats.naoCompareceu, color: 'bg-orange-500' }
  ]

  const statusPieData = [
    { label: 'Concluídos', value: stats.concluidos, color: '#22c55e' },
    { label: 'Em Andamento', value: stats.emAndamento, color: '#a855f7' },
    { label: 'Confirmados', value: stats.confirmados, color: '#3b82f6' },
    { label: 'Pendentes', value: stats.pendentes, color: '#eab308' },
    { label: 'Cancelados', value: stats.cancelados, color: '#ef4444' },
    { label: 'Não Compareceu', value: stats.naoCompareceu, color: '#f97316' }
  ]

  // Agrupar por categoria de serviço
  const categoryStats: Record<string, number> = {}
  appointments.forEach(apt => {
    categoryStats[apt.service_category] = (categoryStats[apt.service_category] || 0) + 1
  })
  const categoryChartData = Object.entries(categoryStats)
    .map(([label, value]) => ({ label, value, color: 'bg-indigo-500' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Carregando atendimentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Atendimentos Fiscais</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus atendimentos fiscais atribuídos</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">Todos</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluídos</option>
            <option value="CANCELADO">Cancelados</option>
            <option value="NAO_COMPARECEU">Não Compareceu</option>
          </select>

          <Button onClick={loadAppointments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-100">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-100">Pendentes</p>
            <p className="text-3xl font-bold">{stats.pendentes}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-100">Confirmados</p>
            <p className="text-3xl font-bold">{stats.confirmados}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-purple-100">Em Andamento</p>
            <p className="text-3xl font-bold">{stats.emAndamento}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-100">Concluídos</p>
            <p className="text-3xl font-bold">{stats.concluidos}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-100">Cancelados</p>
            <p className="text-3xl font-bold">{stats.cancelados}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-orange-100">Não Compareceu</p>
            <p className="text-3xl font-bold">{stats.naoCompareceu}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Desempenho */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{completionRate}%</div>
                <p className="text-sm text-gray-500">
                  {stats.concluidos} de {stats.total} atendimentos concluídos
                </p>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart data={statusChartData} type="bar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-5 w-5 text-indigo-600" />
                Por Categoria de Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <SimpleChart data={categoryChartData} type="bar" />
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mensagens de erro/sucesso */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Lista de atendimentos */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'Nenhum atendimento fiscal atribuído' : `Nenhum atendimento ${filter.toLowerCase().replace('_', ' ')}`}
            </h3>
            <p className="text-gray-500 mb-4">
              Clique no botão abaixo para verificar se há atendimentos disponíveis
            </p>
            <Button
              onClick={async () => {
                try {
                  setUpdating(true)
                  const response = await fetch('/api/students/assign-appointments', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  })

                  if (response.ok) {
                    const data = await response.json()
                    if (data.count > 0) {
                      setSuccess(`${data.count} atendimentos foram atribuídos a você!`)
                      await loadAppointments()
                    } else {
                      setError('Não há atendimentos disponíveis no momento')
                    }
                  } else {
                    const errorData = await response.json()
                    setError(errorData.message || 'Erro ao buscar atendimentos')
                  }
                } catch (err) {
                  setError('Erro ao buscar atendimentos disponíveis')
                  console.error(err)
                } finally {
                  setUpdating(false)
                }
              }}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? 'Buscando...' : 'Buscar Atendimentos Disponíveis'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">{appointment.protocol}</Badge>
                        {getStatusBadge(appointment.status)}
                        {getUrgencyBadge(appointment.urgency_level)}
                      </div>
                      <h3 className="font-semibold text-lg">{appointment.service_title}</h3>
                      <p className="text-sm text-gray-500">Categoria: {appointment.service_category}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Cliente:</span>
                      <span>{appointment.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{appointment.client_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{appointment.client_phone}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{appointment.address_city}, {appointment.address_state}</span>
                    </div>
                    {appointment.preferred_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Data preferencial: {new Date(appointment.preferred_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {appointment.preferred_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Horário: {appointment.preferred_time} ({appointment.preferred_period})</span>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.client_notes && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Observações do Cliente:</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{appointment.client_notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    onClick={() => openDetails(appointment)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>

                  {/* Botão CONFIRMAR - apenas para status PENDENTE */}
                  {appointment.status === 'PENDENTE' && (
                    <Button
                      onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMADO')}
                      disabled={updating}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                  )}

                  {/* Botões para status CONFIRMADO */}
                  {appointment.status === 'CONFIRMADO' && (
                    <>
                      <Button
                        onClick={() => updateAppointmentStatus(appointment.id, 'EM_ANDAMENTO')}
                        disabled={updating}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowRescheduleModal(true)
                        }}
                        disabled={updating}
                        variant="outline"
                        size="sm"
                      >
                        <CalendarX className="h-4 w-4 mr-2" />
                        Reagendar
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowNoShowModal(true)
                        }}
                        disabled={updating}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Não Compareceu
                      </Button>
                    </>
                  )}

                  {/* Botões para status EM_ANDAMENTO */}
                  {appointment.status === 'EM_ANDAMENTO' && (
                    <Button
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        updateAppointmentStatus(appointment.id, 'CONCLUIDO', internalNotes)
                      }}
                      disabled={updating}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Finalizar
                    </Button>
                  )}

                  {/* Botão Feedback para status CONCLUIDO */}
                  {appointment.status === 'CONCLUIDO' && (
                    <Button
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowFeedbackModal(true)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Feedback
                    </Button>
                  )}

                  {/* Botão CANCELAR - disponível para status que ainda não finalizaram */}
                  {!['CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU'].includes(appointment.status) && (
                    <Button
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowCancelModal(true)
                      }}
                      disabled={updating}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="text-lg font-semibold">Detalhes do Atendimento</h3>
                <p className="text-sm text-gray-500">{selectedAppointment.protocol}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetails(false)
                  setSelectedAppointment(null)
                  setInternalNotes('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Timeline do Atendimento */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline do Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Criado</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedAppointment.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {selectedAppointment.confirmed_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Confirmado</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedAppointment.confirmed_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.scheduled_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Iniciado</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedAppointment.scheduled_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.completed_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Concluído</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedAppointment.completed_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-sm">{selectedAppointment.client_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CPF</label>
                      <p className="text-sm">{selectedAppointment.client_cpf || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">E-mail</label>
                      <p className="text-sm">{selectedAppointment.client_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-sm">{selectedAppointment.client_phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observações do Cliente */}
              {selectedAppointment.client_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Observações do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.client_notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Notas Internas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notas Internas</CardTitle>
                  <CardDescription>Adicione observações sobre o atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Adicione suas observações sobre o atendimento..."
                    rows={4}
                    className="mb-2"
                  />
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, selectedAppointment.status, internalNotes)}
                    disabled={updating}
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Salvar Notas
                  </Button>
                </CardContent>
              </Card>

              {/* Ações do Atendimento */}
              {!['CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU'].includes(selectedAppointment.status) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações do Atendimento</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    {selectedAppointment.status === 'PENDENTE' && (
                      <Button
                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CONFIRMADO', internalNotes)}
                        disabled={updating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Atendimento
                      </Button>
                    )}

                    {selectedAppointment.status === 'CONFIRMADO' && (
                      <>
                        <Button
                          onClick={() => updateAppointmentStatus(selectedAppointment.id, 'EM_ANDAMENTO', internalNotes)}
                          disabled={updating}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Atendimento
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDetails(false)
                            setShowRescheduleModal(true)
                          }}
                          disabled={updating}
                          variant="outline"
                        >
                          <CalendarX className="h-4 w-4 mr-2" />
                          Reagendar
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDetails(false)
                            setShowNoShowModal(true)
                          }}
                          disabled={updating}
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Não Compareceu
                        </Button>
                      </>
                    )}

                    {selectedAppointment.status === 'EM_ANDAMENTO' && (
                      <Button
                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CONCLUIDO', internalNotes)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Finalizar Atendimento
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        setShowDetails(false)
                        setShowCancelModal(true)
                      }}
                      disabled={updating}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Cancelar Atendimento
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                Cancelar Atendimento
              </CardTitle>
              <CardDescription>
                Tem certeza que deseja cancelar este atendimento?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta ação não pode ser desfeita. O cliente será notificado sobre o cancelamento.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Motivo do Cancelamento *
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Por favor, informe o motivo do cancelamento..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                  }}
                  className="flex-1"
                  disabled={updating}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCancelAppointment}
                  disabled={updating || !cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {updating ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Não Compareceu */}
      {showNoShowModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <UserX className="h-5 w-5" />
                Marcar como "Não Compareceu"
              </CardTitle>
              <CardDescription>
                O cliente não compareceu ao atendimento agendado?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Esta ação registrará que o cliente não compareceu ao atendimento.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Observações (Opcional)
                </label>
                <Textarea
                  value={noShowNotes}
                  onChange={(e) => setNoShowNotes(e.target.value)}
                  placeholder="Adicione observações sobre a ausência do cliente..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNoShowModal(false)
                    setNoShowNotes('')
                  }}
                  className="flex-1"
                  disabled={updating}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleNoShowAppointment}
                  disabled={updating}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {updating ? 'Processando...' : 'Confirmar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Reagendamento */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarX className="h-5 w-5" />
                Reagendar Atendimento
              </CardTitle>
              <CardDescription>
                Selecione uma nova data e horário para o atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nova Data *
                </label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Horário (Opcional)
                </label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Período
                </label>
                <select
                  value={reschedulePeriod}
                  onChange={(e) => setReschedulePeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRescheduleModal(false)
                    setRescheduleDate('')
                    setRescheduleTime('')
                  }}
                  className="flex-1"
                  disabled={updating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRescheduleAppointment}
                  disabled={updating || !rescheduleDate}
                  className="flex-1"
                >
                  {updating ? 'Reagendando...' : 'Confirmar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Feedback */}
      {showFeedbackModal && selectedAppointment && (
        <FeedbackModal
          appointment={{
            id: selectedAppointment.id,
            protocol: selectedAppointment.protocol,
            service_title: selectedAppointment.service_title,
            client_name: selectedAppointment.client_name,
            client_email: selectedAppointment.client_email
          }}
          onClose={() => {
            setShowFeedbackModal(false)
            setSelectedAppointment(null)
          }}
        />
      )}
    </div>
  )
}
