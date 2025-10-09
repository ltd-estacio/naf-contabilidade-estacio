'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock3,
  AlertTriangle,
  Users,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  RotateCcw
} from 'lucide-react'

interface Appointment {
  id: string
  user_id: string
  coordinator_id?: string
  scheduled_date: string
  scheduled_time: string
  scheduled_datetime: string
  service_type: string
  service_description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  user?: {
    id: string
    name: string
    email: string
    phone?: string
    city?: string
    occupation?: string
  }
}

interface AppointmentStats {
  total: number
  scheduled: number
  completed: number
  today: number
  thisWeek: number
}

interface AppointmentManagerProps {
  coordinatorId: string
  coordinatorName: string
}

export function AppointmentManager({ coordinatorId, coordinatorName }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    today: 0,
    thisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Carregar agendamentos
  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chat/appointments?upcoming=true`)
      const data = await response.json()

      if (response.ok) {
        setAppointments(data.appointments || [])
        calculateStats(data.appointments || [])
      } else {
        setError(data.error || 'Erro ao carregar agendamentos')
      }
    } catch (error) {
      setError('Erro de conexão')
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const calculateStats = (appointmentList: Appointment[]) => {
    const activeAppointments = appointmentList.filter(a => a.status !== 'cancelled')
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    const stats = {
      total: activeAppointments.length,
      scheduled: activeAppointments.filter(a => a.status === 'scheduled').length,
      completed: activeAppointments.filter(a => a.status === 'completed').length,
      today: activeAppointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_date)
        return appointmentDate.toDateString() === new Date().toDateString()
      }).length,
      thisWeek: activeAppointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_date)
        return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek
      }).length
    }

    setStats(stats)
  }

  // Filtrar agendamentos
  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filtro por data
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
      filtered = filtered.filter(a => a.scheduled_date === selectedDateStr)
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    // Filtro por prioridade
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(a => a.priority === priorityFilter)
    }

    if (statusFilter === 'all') {
      filtered = filtered.filter(a => a.status !== 'cancelled')
    }

    setFilteredAppointments(filtered)
  }

  // Atualizar status do agendamento
  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string,
    options?: {
      successMessage?: string
      notes?: string
    }
  ) => {
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/chat/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          coordinator_id: coordinatorId,
          status: newStatus,
          notes: options?.notes ?? appointmentNotes
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (options?.successMessage) {
          setSuccess(options.successMessage)
        } else {
          setSuccess(`Agendamento ${newStatus === 'confirmed' ? 'confirmado' :
                     newStatus === 'completed' ? 'concluído' :
                     newStatus === 'cancelled' ? 'cancelado' : 'atualizado'} com sucesso!`)
        }
        setShowAppointmentDialog(false)
        setSelectedAppointment(null)
        setAppointmentNotes('')
        await loadAppointments()
        return true
      } else {
        setError(data.error || 'Erro ao atualizar agendamento')
        return false
      }
    } catch (error) {
      setError('Erro de conexão')
      console.error('Erro:', error)
      return false
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/chat/appointments?appointment_id=${appointmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        if (selectedAppointment?.id === appointmentId) {
          setShowAppointmentDialog(false)
          setSelectedAppointment(null)
        }
        const baseMessage = data.message ?? 'Agendamento removido com sucesso!'
        setSuccess(`${baseMessage} Você pode recuperá-lo filtrando por “Cancelado”.`)
        await loadAppointments()
      } else {
        setError(data.error || 'Erro ao remover agendamento')
      }
    } catch (error) {
      console.error('Erro ao remover agendamento:', error)
      setError('Erro de conexão ao remover agendamento')
    } finally {
      setActionLoading(null)
    }
  }

  // Iniciar chat com usuário
  const startChatWithUser = (appointment: Appointment) => {
    // Aqui você pode implementar a lógica para iniciar um chat
    // Por exemplo, abrir o componente de chat ou redirecionar
    console.log('Iniciando chat com usuário:', appointment.user?.name)
    setSuccess(`Iniciando chat com ${appointment.user?.name}`)
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, selectedDate, statusFilter, priorityFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Agendado', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle },
      in_progress: { label: 'Em Andamento', variant: 'default' as const, icon: Clock3 },
      completed: { label: 'Concluído', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
      no_show: { label: 'Não Compareceu', variant: 'destructive' as const, icon: AlertTriangle }
    }

    const config = statusConfig[status] || statusConfig.scheduled
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baixa', className: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
      normal: { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      high: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    }

    const config = priorityConfig[priority] || priorityConfig.normal

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário e Filtros */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calendário */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                className="rounded-md border"
                locale={ptBR}
              />
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Prioridade */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={loadAppointments}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Agendamentos */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agendamentos
              {selectedDate && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="text-center py-8">Carregando agendamentos...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {statusFilter === 'cancelled'
                      ? 'Nenhum agendamento cancelado encontrado para os filtros selecionados.'
                      : 'Nenhum agendamento encontrado para os filtros selecionados.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(appointment.status)}
                                {getPriorityBadge(appointment.priority)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {appointment.scheduled_time}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-medium">{appointment.user?.name || 'Usuário'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.service_type}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {appointment.user?.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {appointment.user.email}
                                </div>
                              )}
                              {appointment.user?.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {appointment.user.phone}
                                </div>
                              )}
                              {appointment.user?.city && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {appointment.user.city}
                                </div>
                              )}
                            </div>

                            {appointment.service_description && (
                              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                {appointment.service_description}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setAppointmentNotes(appointment.notes || '')
                                setShowAppointmentDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {appointment.status !== 'cancelled' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionLoading === appointment.id}
                                  onClick={() => cancelAppointment(appointment.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => startChatWithUser(appointment)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={actionLoading === appointment.id}
                                onClick={async () => {
                                  setActionLoading(appointment.id)
                                  const restored = await updateAppointmentStatus(appointment.id, 'scheduled', {
                                    successMessage: 'Agendamento restaurado com sucesso!'
                                  })
                                  setActionLoading(null)
                                  if (restored) {
                                    setStatusFilter('all')
                                  }
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restaurar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhes do Agendamento */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cliente:</strong>
                  <p>{selectedAppointment.user?.name}</p>
                </div>
                <div>
                  <strong>Data:</strong>
                  <p>{format(new Date(selectedAppointment.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <strong>Horário:</strong>
                  <p>{selectedAppointment.scheduled_time}</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                <div className="col-span-2">
                  <strong>Serviço:</strong>
                  <p>{selectedAppointment.service_type}</p>
                </div>
                {selectedAppointment.service_description && (
                  <div className="col-span-2">
                    <strong>Descrição:</strong>
                    <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1">
                      {selectedAppointment.service_description}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Observações</label>
                <Textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Adicione observações sobre o atendimento..."
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAppointment.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                )}
                {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Clock3 className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                {selectedAppointment.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluir
                  </Button>
                )}
                {selectedAppointment.status !== 'cancelled' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading === selectedAppointment.id}
                      onClick={() => cancelAppointment(selectedAppointment.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startChatWithUser(selectedAppointment)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={async () => {
                      setActionLoading(selectedAppointment.id)
                      const restored = await updateAppointmentStatus(selectedAppointment.id, 'scheduled', {
                        successMessage: 'Agendamento restaurado com sucesso!'
                      })
                      setActionLoading(null)
                      if (restored) {
                        setShowAppointmentDialog(false)
                        setSelectedAppointment(null)
                        setStatusFilter('all')
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restaurar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
