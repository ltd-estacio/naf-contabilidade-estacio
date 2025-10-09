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
  Star
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

export default function StudentFiscalAppointments({ token }: StudentFiscalAppointmentsProps) {
  const [appointments, setAppointments] = useState<FiscalAppointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    confirmados: 0,
    emAndamento: 0,
    concluidos: 0,
    cancelados: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<FiscalAppointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')
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
      'CANCELADO': { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDENTE']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
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
          </select>

          <Button onClick={loadAppointments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
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
              {filter === 'all' ? 'Nenhum atendimento fiscal atribuído' : `Nenhum atendimento ${filter.toLowerCase()}`}
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
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
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
                    </>
                  )}

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

                  {!['CONCLUIDO', 'CANCELADO'].includes(appointment.status) && (
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
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
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
              {selectedAppointment.status !== 'CONCLUIDO' && selectedAppointment.status !== 'CANCELADO' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações do Atendimento</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
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
