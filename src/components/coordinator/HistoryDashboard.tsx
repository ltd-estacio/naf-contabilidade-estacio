'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Search,
  CalendarDays,
  Users,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface User {
  id: string
  conversation_id?: string
  name: string
  email: string
  phone?: string
  cpf?: string
  birth_date?: string
  address?: string
  city?: string
  state?: string
  occupation?: string
  company?: string
  income_range?: string
  preferred_contact?: string
  service_interest?: string
  registration_source?: string
  status: string
  created_at: string
  updated_at: string
}

interface ConversationHistory {
  id: string
  conversation_id: string
  user_id: string
  coordinator_id?: string
  appointment_id?: string
  title: string
  summary: string
  total_messages: number
  started_at: string
  ended_at?: string
  duration_minutes?: number
  status: string
  satisfaction_rating?: number
  satisfaction_feedback?: string
  created_at: string
  updated_at: string
  chat_persistent_messages?: Message[]
}

interface Message {
  id: string
  content: string
  sender_type: string
  sender_name: string
  is_ai_response: boolean
  created_at: string
}

interface Appointment {
  id: string
  user_id: string
  conversation_id?: string
  coordinator_id?: string
  scheduled_date: string
  scheduled_time: string
  scheduled_datetime: string
  service_type: string
  service_description: string
  priority: string
  notes: string
  status: string
  created_at: string
  updated_at: string
  user?: User
}

interface HistoryStats {
  totalUsers: number
  newUsersToday: number
  totalConversations: number
  conversationsToday: number
  totalAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  averageRating: number
}

interface HistoryDashboardProps {
  coordinatorId: string
  coordinatorName: string
}

export function HistoryDashboard({ coordinatorId, coordinatorName }: HistoryDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<ConversationHistory[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<HistoryStats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalConversations: 0,
    conversationsToday: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  // const [selectedUser, setSelectedUser] = useState<User | null>(null)
  // const [selectedConversation, setSelectedConversation] = useState<ConversationHistory | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHistoryData()
  }, [])

  const loadHistoryData = async () => {
    setIsLoading(true)
    try {
      // Carregar usuários
      const usersResponse = await fetch('/api/chat/user-registration')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      // Carregar conversas
      const conversationsResponse = await fetch('/api/chat/conversation-history?include_messages=true')
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        setConversations(conversationsData.histories || [])
      }

      // Carregar agendamentos
      const appointmentsResponse = await fetch('/api/chat/appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.appointments || [])
      }

    } catch (error) {
      console.error('Erro ao carregar dados de histórico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    calculateStats()
  }, [users, conversations, appointments])

  const calculateStats = () => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    const newUsersToday = users.filter(user =>
      format(parseISO(user.created_at), 'yyyy-MM-dd') === todayStr
    ).length

    const conversationsToday = conversations.filter(conv =>
      format(parseISO(conv.started_at), 'yyyy-MM-dd') === todayStr
    ).length

    const upcomingAppointments = appointments.filter(apt =>
      apt.status === 'scheduled' && new Date(apt.scheduled_datetime) > today
    ).length

    const completedAppointments = appointments.filter(apt =>
      apt.status === 'completed'
    ).length

    const ratingsSum = conversations.reduce((sum, conv) =>
      sum + (conv.satisfaction_rating || 0), 0
    )
    const ratingsCount = conversations.filter(conv => conv.satisfaction_rating).length
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

    setStats({
      totalUsers: users.length,
      newUsersToday,
      totalConversations: conversations.length,
      conversationsToday,
      totalAppointments: appointments.length,
      upcomingAppointments,
      completedAppointments,
      averageRating
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedPeriod === 'today') {
      return matchesSearch && isToday(parseISO(user.created_at))
    } else if (selectedPeriod === 'week') {
      return matchesSearch && isThisWeek(parseISO(user.created_at))
    } else if (selectedPeriod === 'month') {
      return matchesSearch && isThisMonth(parseISO(user.created_at))
    }

    return matchesSearch
  })

  const filteredConversations = conversations.filter(conv => {
    const user = users.find(u => u.id === conv.user_id)
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user?.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedPeriod === 'today') {
      return matchesSearch && isToday(parseISO(conv.started_at))
    } else if (selectedPeriod === 'week') {
      return matchesSearch && isThisWeek(parseISO(conv.started_at))
    } else if (selectedPeriod === 'month') {
      return matchesSearch && isThisMonth(parseISO(conv.started_at))
    }

    return matchesSearch
  })

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedPeriod === 'today') {
      return matchesSearch && isToday(parseISO(apt.scheduled_datetime))
    } else if (selectedPeriod === 'week') {
      return matchesSearch && isThisWeek(parseISO(apt.scheduled_datetime))
    } else if (selectedPeriod === 'month') {
      return matchesSearch && isThisMonth(parseISO(apt.scheduled_datetime))
    }

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando histórico...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersToday} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.conversationsToday} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingAppointments} próximos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedAppointments} concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedPeriod === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('today')}
          >
            Hoje
          </Button>
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Esta Semana
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Este Mês
          </Button>
        </div>
      </div>

      {/* Abas de conteúdo */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversas ({filteredConversations.length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos ({filteredAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Usuários */}
        <TabsContent value="users">
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                        {user.city && user.state && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {user.city}, {user.state}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Conversas */}
        <TabsContent value="conversations">
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => {
              const user = users.find(u => u.id === conversation.user_id)
              return (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{conversation.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{conversation.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {user?.name || 'Usuário desconhecido'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {conversation.total_messages} mensagens
                          </div>
                          {conversation.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {conversation.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                          {conversation.status === 'completed' ? 'Concluída' : 'Ativa'}
                        </Badge>
                        {conversation.satisfaction_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{conversation.satisfaction_rating}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(parseISO(conversation.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Aba de Agendamentos */}
        <TabsContent value="appointments">
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{appointment.service_type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.service_description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appointment.user?.name || 'Usuário não encontrado'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(appointment.scheduled_datetime), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.scheduled_time}
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 italic">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        variant={
                          appointment.status === 'scheduled' ? 'default' :
                          appointment.status === 'completed' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {appointment.status === 'scheduled' ? 'Agendado' :
                         appointment.status === 'completed' ? 'Concluído' :
                         appointment.status === 'cancelled' ? 'Cancelado' : appointment.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          appointment.priority === 'high' ? 'border-red-500 text-red-500' :
                          appointment.priority === 'normal' ? 'border-blue-500 text-blue-500' :
                          'border-gray-500 text-gray-500'
                        }
                      >
                        {appointment.priority === 'high' ? 'Alta' :
                         appointment.priority === 'normal' ? 'Normal' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do usuário */}
      {/* Temporariamente comentado para resolver problemas de importação */}
      {/* <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-500">Contato</h4>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.preferred_contact && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className="capitalize">{selectedUser.preferred_contact}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-500">Localização</h4>
                  {selectedUser.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                  {selectedUser.city && selectedUser.state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.city}, {selectedUser.state}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-500">Profissional</h4>
                  {selectedUser.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.occupation}</span>
                    </div>
                  )}
                  {selectedUser.company && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.company}</span>
                    </div>
                  )}
                  {selectedUser.income_range && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.income_range}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-500">Interesse</h4>
                  {selectedUser.service_interest && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.service_interest}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Cadastrado em: {format(parseISO(selectedUser.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  <span>Atualizado em: {format(parseISO(selectedUser.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */}

      {/* Modal de detalhes da conversa */}
      {/* <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Conversa</DialogTitle>
          </DialogHeader>
          {selectedConversation && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedConversation.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedConversation.summary}</p>
                </div>
                <Badge variant={selectedConversation.status === 'completed' ? 'default' : 'secondary'}>
                  {selectedConversation.status === 'completed' ? 'Concluída' : 'Ativa'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedConversation.total_messages}</div>
                  <div className="text-sm text-gray-500">Mensagens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedConversation.duration_minutes || 0}</div>
                  <div className="text-sm text-gray-500">Minutos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedConversation.satisfaction_rating || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Avaliação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {format(parseISO(selectedConversation.started_at), 'HH:mm', { locale: ptBR })}
                  </div>
                  <div className="text-sm text-gray-500">Início</div>
                </div>
              </div>

              {selectedConversation.chat_persistent_messages && selectedConversation.chat_persistent_messages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Mensagens da Conversa</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                    {selectedConversation.chat_persistent_messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.sender_type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-950 border'
                        }`}>
                          <div className="text-xs font-medium mb-1">
                            {message.sender_name}
                          </div>
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {format(parseISO(message.created_at), 'HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConversation.satisfaction_feedback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Feedback do Cliente</h4>
                  <p className="text-yellow-700">{selectedConversation.satisfaction_feedback}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog> */}
    </div>
  )
}