'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface ChatUser {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  occupation?: string
  service_interest?: string[]
  created_at: string
}

interface Appointment {
  id: string
  user_id?: string
  conversation_id?: string
  coordinator_id?: string
  scheduled_date: string
  scheduled_time: string
  scheduled_datetime: string
  service_type: string
  service_description?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  updated_at: string
  chat_users?: ChatUser
  // Campos específicos de fiscal_appointments
  protocol?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  client_category?: string
  urgency_level?: string
  preferred_date?: string
  preferred_time?: string
  source?: 'chat' | 'fiscal' // Para identificar a origem
  progress_notes?: AppointmentNote[]
}

interface AppointmentNote {
  id: string
  appointment_id: string
  student_id?: string | null
  student_name?: string | null
  note: string
  created_at: string
  updated_at?: string
}

export default function AppointmentsPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtros
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog de edição
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  // Estados para transferência de estudante
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferringAppointment, setTransferringAppointment] = useState<Appointment | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string, name: string, email: string, course: string, semester: string}>>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [transferring, setTransferring] = useState(false)

  const supabaseRealtime = useMemo(() => getSupabaseBrowserClient(), [])
  const realtimeRefreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadAppointments = useCallback(async (options?: { skipLoadingState?: boolean }) => {
    const skipLoadingState = options?.skipLoadingState ?? false

    if (!skipLoadingState) {
      setLoading(true)
    }
    try {
      // Buscar agendamentos do chat
      const chatResponse = await fetch('/api/chat/appointments?all=true')
      const chatData = await chatResponse.json()

      // Buscar agendamentos fiscais
      const fiscalResponse = await fetch('/api/fiscal-appointments')
      const fiscalData = await fiscalResponse.json()

      let allAppointments: Appointment[] = []

      // Adicionar agendamentos do chat
      if (chatResponse.ok && chatData.appointments) {
        const chatAppointments = chatData.appointments.map((apt: Appointment) => ({
          ...apt,
          source: 'chat' as const
        }))
        allAppointments = [...chatAppointments]
      }

      // Adicionar agendamentos fiscais
      if (fiscalResponse.ok && fiscalData.appointments) {
        const fiscalAppointments = fiscalData.appointments.map((apt: {
          id: string
          protocol: string
          client_name: string
          client_email: string
          client_phone: string
          client_category: string
          service_type: string
          service_title: string
          preferred_date: string
          preferred_time: string
          urgency_level: string
          status: string
          client_notes?: string
          created_at: string
          updated_at: string
          progress_notes?: AppointmentNote[]
        }) => ({
          id: apt.id,
          protocol: apt.protocol,
          client_name: apt.client_name,
          client_email: apt.client_email,
          client_phone: apt.client_phone,
          client_category: apt.client_category,
          scheduled_date: apt.preferred_date,
          scheduled_time: apt.preferred_time || '00:00',
          scheduled_datetime: `${apt.preferred_date}T${apt.preferred_time || '00:00'}`,
          service_type: apt.service_title || apt.service_type,
          service_description: apt.client_notes,
          priority: apt.urgency_level === 'ALTA' ? 'high' as const :
                   apt.urgency_level === 'URGENTE' ? 'urgent' as const :
                   apt.urgency_level === 'BAIXA' ? 'low' as const : 'normal' as const,
          status: apt.status === 'PENDENTE' ? 'scheduled' as const :
                 apt.status === 'CONFIRMADO' ? 'confirmed' as const :
                 apt.status === 'EM_ANDAMENTO' ? 'in_progress' as const :
                 apt.status === 'CONCLUIDO' ? 'completed' as const :
                 apt.status === 'CANCELADO' ? 'cancelled' as const :
                 apt.status === 'NAO_COMPARECEU' ? 'no_show' as const : 'scheduled' as const,
          notes: apt.client_notes,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          urgency_level: apt.urgency_level,
          source: 'fiscal' as const,
          progress_notes: Array.isArray(apt.progress_notes) ? apt.progress_notes : []
        }))
        allAppointments = [...allAppointments, ...fiscalAppointments]
      }

      setAppointments(allAppointments)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setError('Erro de conexão')
    } finally {
      if (!skipLoadingState) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, dateFilter, searchTerm])

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Filtro por data
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.scheduled_date === dateFilter)
    }

    // Filtro por busca (nome, email, serviço, protocolo)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(apt =>
        // Campos de chat
        apt.chat_users?.name?.toLowerCase().includes(search) ||
        apt.chat_users?.email?.toLowerCase().includes(search) ||
        // Campos de fiscal
        apt.client_name?.toLowerCase().includes(search) ||
        apt.client_email?.toLowerCase().includes(search) ||
        apt.protocol?.toLowerCase().includes(search) ||
        // Campos comuns
        apt.service_type.toLowerCase().includes(search) ||
        apt.service_description?.toLowerCase().includes(search)
      )
    }

    // Ordenar por data mais próxima
    filtered.sort((a, b) => a.scheduled_datetime.localeCompare(b.scheduled_datetime))

    setFilteredAppointments(filtered)
  }

  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeRefreshTimeout.current) {
      clearTimeout(realtimeRefreshTimeout.current)
    }

    realtimeRefreshTimeout.current = setTimeout(() => {
      loadAppointments({ skipLoadingState: true })
    }, 400)
  }, [loadAppointments])

  useEffect(() => {
    const client = supabaseRealtime
    if (!client) {
      return
    }

    const channelName = `coordinator-fiscal-appointments-${Math.random().toString(36).slice(2, 10)}`
    const channel = client
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fiscal_appointments'
      }, () => {
        scheduleRealtimeRefresh()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fiscal_appointment_notes'
      }, () => {
        scheduleRealtimeRefresh()
      })
      .subscribe()

    return () => {
      if (realtimeRefreshTimeout.current) {
        clearTimeout(realtimeRefreshTimeout.current)
        realtimeRefreshTimeout.current = null
      }

      client.removeChannel(channel)
    }
  }, [supabaseRealtime, scheduleRealtimeRefresh])

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string, source?: 'chat' | 'fiscal') => {
    try {
      // Determinar qual API usar baseado na origem do agendamento
      const apiUrl = source === 'fiscal' ? '/api/fiscal-appointments' : '/api/chat/appointments'

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          status,
          notes: notes || '',
          coordinator_id: 'coord-admin' // ID do coordenador atual
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Status atualizado com sucesso!')
        loadAppointments()
      } else {
        setError(data.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setError('Erro de conexão')
    }
  }

  const deleteAppointment = async (appointmentId: string, source?: 'chat' | 'fiscal') => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

    try {
      // Determinar qual API usar baseado na origem do agendamento
      const apiUrl = source === 'fiscal' ? '/api/fiscal-appointments' : '/api/chat/appointments'

      const response = await fetch(`${apiUrl}?appointment_id=${appointmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Agendamento cancelado com sucesso!')
        loadAppointments()
      } else {
        setError(data.error || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      setError('Erro de conexão')
    }
  }

  // Função para abrir modal de transferência
  const openTransferDialog = async (appointment: Appointment) => {
    setTransferringAppointment(appointment)
    setShowTransferDialog(true)
    setLoadingStudents(true)
    setSelectedStudent('')
    setTransferReason('')
    
    try {
      // Buscar estudantes disponíveis
      const response = await fetch('/api/fiscal-appointments/transfer')
      
      if (response.ok) {
        const result = await response.json()
        setAvailableStudents(result.students || [])
      } else {
        console.error('Erro ao carregar estudantes disponíveis')
        setAvailableStudents([])
        setError('Erro ao carregar lista de estudantes')
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
      setAvailableStudents([])
      setError('Erro de conexão ao carregar estudantes')
    } finally {
      setLoadingStudents(false)
    }
  }

  // Função para executar transferência
  const executeTransfer = async () => {
    if (!transferringAppointment || !selectedStudent) {
      setError('Selecione um estudante para a transferência')
      return
    }

    setTransferring(true)

    try {
      const response = await fetch('/api/fiscal-appointments/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointment_id: transferringAppointment.id,
          to_student_id: selectedStudent,
          reason: transferReason || 'Transferência manual pelo coordenador'
        })
      })

      if (response.ok) {
        setSuccess('✅ Atendimento transferido com sucesso!')
        setShowTransferDialog(false)
        setTransferringAppointment(null)
        setSelectedStudent('')
        setTransferReason('')
        loadAppointments()
      } else {
        const error = await response.json()
        setError(`Erro ao transferir: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao transferir:', error)
      setError('Erro ao transferir atendimento. Tente novamente.')
    } finally {
      setTransferring(false)
    }
  }

  const startChat = async (appointment: Appointment) => {
    // Iniciar chat com o usuário
    if (appointment.conversation_id) {
      window.open(`/coordinator-dashboard?conversation=${appointment.conversation_id}`, '_blank')
    } else {
      setError('Conversa não encontrada para este agendamento')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado'
      case 'confirmed': return 'Confirmado'
      case 'in_progress': return 'Em Andamento'
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      case 'no_show': return 'Não Compareceu'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-blue-500'
      case 'low': return 'bg-gray-50 dark:bg-gray-9000'
      default: return 'bg-gray-50 dark:bg-gray-9000'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const formatScheduledSummary = (dateString?: string, timeString?: string) => {
    if (!dateString) return 'Sem data definida'
    const base = formatDate(dateString)
    const hour = timeString ? ` • ${formatTime(timeString)}` : ''
    return `${base}${hour}`
  }

  const isUpcoming = (scheduledDateTime: string) => {
    return new Date(scheduledDateTime) > new Date()
  }

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }

  const toggleNotes = (appointmentId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto"
          >
            ×
          </Button>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto"
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gerenciamento de Atendimentos
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAppointments()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(a => a.status === 'scheduled').length}
              </div>
              <div className="text-sm text-blue-700">Agendados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredAppointments.filter(a => isToday(a.scheduled_date)).length}
              </div>
              <div className="text-sm text-green-700">Hoje</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAppointments.filter(a => a.status === 'in_progress').length}
              </div>
              <div className="text-sm text-yellow-700">Em Andamento</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredAppointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-emerald-700">Concluídos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, email ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="no_show">Não Compareceu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all')
                  setDateFilter('')
                  setSearchTerm('')
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Carregando agendamentos...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum agendamento encontrado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className={`border-l-4 ${
              isToday(appointment.scheduled_date) ? 'border-l-yellow-500' :
              isUpcoming(appointment.scheduled_datetime) ? 'border-l-blue-500' : 'border-l-gray-300'
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar/Indicador de prioridade */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getPriorityColor(appointment.priority)}`}></div>
                      </div>

                      {/* Detalhes */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {appointment.source === 'fiscal' ? appointment.client_name : appointment.chat_users?.name || 'Usuário não identificado'}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          {appointment.protocol && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 font-mono text-xs">
                              {appointment.protocol}
                            </Badge>
                          )}
                          {isToday(appointment.scheduled_date) && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Hoje
                            </Badge>
                          )}
                          {appointment.source === 'fiscal' && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Agendamento NAF
                            </Badge>
                          )}
                        </div>

                        {appointment.scheduled_date && (
                          <div className="inline-flex items-center gap-3 px-3 py-1 mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Agendado para {formatScheduledSummary(appointment.scheduled_date, appointment.scheduled_time)}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.scheduled_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.scheduled_time)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {appointment.source === 'fiscal' ? appointment.client_email : appointment.chat_users?.email || 'Email não informado'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {appointment.source === 'fiscal' ? appointment.client_phone : appointment.chat_users?.phone || 'Telefone não informado'}
                          </div>
                          {appointment.source === 'fiscal' && appointment.client_category && (
                            <div className="flex items-center gap-2 col-span-2">
                              <Briefcase className="h-4 w-4" />
                              <span className="font-medium">{appointment.client_category}</span>
                            </div>
                          )}
                          {appointment.source === 'chat' && (
                            <>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {appointment.chat_users?.city || 'Cidade não informada'}
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {appointment.chat_users?.occupation || 'Profissão não informada'}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {appointment.service_type}
                          </div>
                          {appointment.service_description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {appointment.service_description}
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                              Observações: {appointment.notes}
                            </div>
                          )}
                        </div>

                        {appointment.source === 'fiscal' && (
                          <div className="mt-3 border border-emerald-100 dark:border-emerald-900 rounded-lg p-3 bg-emerald-50/60 dark:bg-emerald-900/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                  Registro do atendimento
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  {appointment.progress_notes && appointment.progress_notes.length > 0
                                    ? `${appointment.progress_notes.length} anotação(ões) registradas pelo estudante`
                                    : 'Nenhuma anotação registrada até o momento'}
                                </p>
                              </div>
                              {appointment.progress_notes && appointment.progress_notes.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleNotes(appointment.id)}
                                >
                                  {expandedNotes[appointment.id] ? 'Ocultar registro' : 'Ver registro'}
                                </Button>
                              )}
                            </div>

                            {expandedNotes[appointment.id] && appointment.progress_notes && (
                              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                                {appointment.progress_notes.map(note => (
                                  <div key={note.id} className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 rounded-md p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {note.student_name || 'Estudante'}
                                      </span>
                                      <span className="text-[11px] text-gray-500">
                                        {new Date(note.created_at).toLocaleString('pt-BR', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.note}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed', undefined, appointment.source)}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'in_progress', undefined, appointment.source)}
                          className="w-full"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'in_progress', undefined, appointment.source)}
                          className="w-full"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Iniciar Atendimento
                        </Button>
                        {/* Botão de Transferência - apenas para atendimentos fiscais confirmados */}
                        {appointment.source === 'fiscal' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTransferDialog(appointment)}
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transferir
                          </Button>
                        )}
                      </>
                    )}

                    {appointment.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed', undefined, appointment.source)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluir
                        </Button>
                        {/* Botão de Transferência - apenas para atendimentos fiscais em andamento */}
                        {appointment.source === 'fiscal' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTransferDialog(appointment)}
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transferir
                          </Button>
                        )}
                      </>
                    )}

                    {appointment.conversation_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startChat(appointment)}
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir Chat
                      </Button>
                    )}

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAppointment(appointment)
                          setShowEditDialog(true)
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAppointment(appointment.id, appointment.source)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>

          {editingAppointment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={editingAppointment.status}
                  onValueChange={(value) => setEditingAppointment({
                    ...editingAppointment,
                    status: value as 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Observações</label>
                <Textarea
                  value={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    notes: e.target.value
                  })}
                  placeholder="Adicione observações sobre o atendimento..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateAppointmentStatus(
                      editingAppointment.id,
                      editingAppointment.status,
                      editingAppointment.notes,
                      editingAppointment.source
                    )
                    setShowEditDialog(false)
                  }}
                  className="flex-1"
                >
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência de Estudante */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              Transferir Atendimento para Outro Estudante
            </DialogTitle>
          </DialogHeader>

          {transferringAppointment && (
            <div className="space-y-4">
              {/* Informações do Atendimento */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold text-sm mb-2">Atendimento Atual</h4>
                <div className="space-y-1 text-sm">
                  {transferringAppointment.protocol && (
                    <p><span className="text-gray-600">Protocolo:</span> <span className="font-mono font-medium">{transferringAppointment.protocol}</span></p>
                  )}
                  <p><span className="text-gray-600">Serviço:</span> {transferringAppointment.service_type}</p>
                  <p><span className="text-gray-600">Cliente:</span> {transferringAppointment.client_name || transferringAppointment.chat_users?.name}</p>
                  <p><span className="text-gray-600">Status:</span> {getStatusLabel(transferringAppointment.status)}</p>
                </div>
              </div>

              {/* Seleção do Novo Estudante */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selecionar Novo Estudante *
                </label>
                
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8 border border-gray-200 dark:border-gray-800 rounded-md">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Carregando estudantes...</span>
                  </div>
                ) : availableStudents.length > 0 ? (
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Selecione um estudante --" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.course} ({student.semester})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Nenhum estudante disponível para transferência no momento.
                    </p>
                  </div>
                )}
              </div>

              {/* Motivo da Transferência */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Motivo da Transferência (opcional)
                </label>
                <Textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ex: Redistribuição de carga, especialização do estudante, disponibilidade..."
                  rows={3}
                  disabled={transferring}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este motivo será registrado no histórico do atendimento para auditoria.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTransferDialog(false)
                    setTransferringAppointment(null)
                    setSelectedStudent('')
                    setTransferReason('')
                  }}
                  disabled={transferring}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={executeTransfer}
                  disabled={!selectedStudent || transferring || loadingStudents}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {transferring ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Transferindo...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Confirmar Transferência
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
