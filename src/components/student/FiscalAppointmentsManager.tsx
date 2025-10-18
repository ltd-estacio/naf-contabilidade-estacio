'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Download,
  Eye,
  Play,
  Square,
  FileText,
  MessageSquare
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

interface Stats {
  total: number
  pendentes: number
  confirmados: number
  emAndamento: number
  concluidos: number
  cancelados: number
}

export default function FiscalAppointmentsManager() {
  const [appointments, setAppointments] = useState<FiscalAppointment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<FiscalAppointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [completedAppointment, setCompletedAppointment] = useState<FiscalAppointment | null>(null)
  const [error, setError] = useState('')

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('student_token')
      if (!token) return

      const response = await fetch('/api/students/fiscal-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.fiscalAppointments || [])

        // Calcular stats localmente se não fornecido
        const fiscalAppts = data.fiscalAppointments || []
        const calculatedStats = {
          total: fiscalAppts.length,
          pendentes: fiscalAppts.filter((a: FiscalAppointment) => a.status === 'PENDENTE').length,
          confirmados: fiscalAppts.filter((a: FiscalAppointment) => a.status === 'CONFIRMADO').length,
          emAndamento: fiscalAppts.filter((a: FiscalAppointment) => a.status === 'EM_ANDAMENTO').length,
          concluidos: fiscalAppts.filter((a: FiscalAppointment) => a.status === 'CONCLUIDO').length,
          cancelados: fiscalAppts.filter((a: FiscalAppointment) => a.status === 'CANCELADO').length,
        }
        setStats(calculatedStats)
      } else {
        setError('Erro ao carregar atendimentos')
      }
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error)
      setError('Erro ao carregar atendimentos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadAppointments()
  }

  const handleStartAppointment = async (appointment: FiscalAppointment) => {
    try {
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          status: 'EM_ANDAMENTO'
        })
      })

      if (response.ok) {
        await loadAppointments()
        alert('Atendimento iniciado com sucesso!')
      } else {
        alert('Erro ao iniciar atendimento')
      }
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
      alert('Erro ao iniciar atendimento')
    }
  }

  const handleFinishAppointment = async (appointment: FiscalAppointment) => {
    try {
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/fiscal-appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          status: 'CONCLUIDO'
        })
      })

      if (response.ok) {
        await loadAppointments()
        setCompletedAppointment(appointment)
        setShowFeedbackModal(true)
      } else {
        alert('Erro ao finalizar atendimento')
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
      alert('Erro ao finalizar atendimento')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      'PENDENTE': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'CONFIRMADO': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'EM_ANDAMENTO': { color: 'bg-purple-100 text-purple-800', icon: Play },
      'CONCLUIDO': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'CANCELADO': { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig['PENDENTE']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, string> = {
      'BAIXA': 'bg-gray-100 text-gray-700',
      'NORMAL': 'bg-blue-100 text-blue-700',
      'ALTA': 'bg-orange-100 text-orange-700',
      'URGENTE': 'bg-red-100 text-red-700'
    }

    const color = urgencyConfig[urgency] || urgencyConfig['NORMAL']

    return (
      <Badge className={`${color} border-0`}>
        {urgency === 'URGENTE' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {urgency}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Meus Atendimentos Fiscais</h2>
          <p className="text-gray-600">Gerencie seus atendimentos fiscais</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-100">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-yellow-100">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pendentes}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-100">Confirmados</p>
              <p className="text-2xl font-bold">{stats.confirmados}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-purple-100">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.emAndamento}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-green-100">Concluídos</p>
              <p className="text-2xl font-bold">{stats.concluidos}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-red-100">Cancelados</p>
              <p className="text-2xl font-bold">{stats.cancelados}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos</CardTitle>
          <CardDescription>
            Lista de todos os seus atendimentos fiscais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">Você ainda não possui atendimentos fiscais</p>
              <p className="text-sm text-gray-400">
                Os atendimentos fiscais serão atribuídos pelo coordenador
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Info Principal */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {appointment.protocol}
                        </Badge>
                        {getStatusBadge(appointment.status)}
                        {getUrgencyBadge(appointment.urgency_level)}
                      </div>

                      <h4 className="font-semibold text-lg">{appointment.service_title}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {appointment.client_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {appointment.client_email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {appointment.client_phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {appointment.address_city}, {appointment.address_state}
                        </div>
                      </div>

                      {appointment.preferred_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          Preferência: {new Date(appointment.preferred_date).toLocaleDateString('pt-BR')}
                          {appointment.preferred_time && ` às ${appointment.preferred_time}`}
                        </div>
                      )}

                      {appointment.client_notes && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                          <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{appointment.client_notes}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      {appointment.status === 'CONFIRMADO' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartAppointment(appointment)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Atendimento
                        </Button>
                      )}

                      {appointment.status === 'EM_ANDAMENTO' && (
                        <Button
                          size="sm"
                          onClick={() => handleFinishAppointment(appointment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Finalizar Atendimento
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalhes do Atendimento</CardTitle>
              <CardDescription>Protocolo: {selectedAppointment.protocol}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Serviço</h4>
                <p>{selectedAppointment.service_title}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.service_category}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Informações do Cliente</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {selectedAppointment.client_name}</p>
                  <p><strong>Email:</strong> {selectedAppointment.client_email}</p>
                  <p><strong>Telefone:</strong> {selectedAppointment.client_phone}</p>
                  {selectedAppointment.client_cpf && (
                    <p><strong>CPF:</strong> {selectedAppointment.client_cpf}</p>
                  )}
                  <p><strong>Localização:</strong> {selectedAppointment.address_city}, {selectedAppointment.address_state}</p>
                </div>
              </div>

              {selectedAppointment.client_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Observações do Cliente</h4>
                  <p className="text-sm">{selectedAppointment.client_notes}</p>
                </div>
              )}

              {selectedAppointment.internal_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Observações Internas</h4>
                  <p className="text-sm">{selectedAppointment.internal_notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Feedback */}
      {showFeedbackModal && completedAppointment && (
        <FeedbackModal
          appointment={completedAppointment}
          onClose={() => {
            setShowFeedbackModal(false)
            setCompletedAppointment(null)
          }}
        />
      )}
    </div>
  )
}
