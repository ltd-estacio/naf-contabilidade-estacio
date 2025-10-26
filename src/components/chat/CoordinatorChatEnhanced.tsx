'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Clock,
  Search,
  RefreshCw,
  Circle,
  Check,
  X,
  UserCheck,
  AlertCircle,
  ArrowRightLeft,
  Bell,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_type: 'user' | 'assistant' | 'coordinator'
  sender_name?: string
  is_ai_response?: boolean
  created_at: string
  is_read?: boolean
}

interface Conversation {
  id: string
  user_id: string
  user_name: string
  user_email?: string
  status: string
  is_online?: boolean
  unread_count?: number
  last_message?: Message
  updated_at: string
  messages?: Message[]
  human_requested?: boolean
  human_request_timestamp?: string
  coordinator_id?: string
  chat_accepted_by?: string
}

interface Coordinator {
  id: string
  name: string
  email: string
  specialties: string[]
  is_online: boolean
  status: string
}

interface Student {
  id: string
  name: string
  email: string
  course: string
  semester: string
  is_online: boolean
}

interface NotificationData {
  type: string
  conversation_id?: string
  user_name?: string
  message: string
  timestamp: string
  urgency?: string
  waiting_time?: string
  total_pending?: number
}

interface TransferRequest {
  id: string
  conversation_id: string
  from_coordinator_id: string
  from_coordinator_name: string
  to_coordinator_id?: string
  to_coordinator_name?: string
  to_student_id?: string
  to_student_name?: string
  transfer_type: 'to_coordinator' | 'to_student'
  reason: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  expires_at: string
}

interface CoordinatorChatEnhancedProps {
  coordinatorId: string
  coordinatorName: string
}

export default function CoordinatorChatEnhanced({ coordinatorId, coordinatorName }: CoordinatorChatEnhancedProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [availableCoordinators, setAvailableCoordinators] = useState<Coordinator[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferReason, setTransferReason] = useState('')
  const [transferMessage, setTransferMessage] = useState('')
  const [transferType, setTransferType] = useState<'coordinator' | 'student'>('coordinator')
  const [selectedTransferCoordinator, setSelectedTransferCoordinator] = useState('')
  const [selectedTransferStudent, setSelectedTransferStudent] = useState('')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [showAcceptTransferDialog, setShowAcceptTransferDialog] = useState(false)
  const [selectedIncomingTransfer, setSelectedIncomingTransfer] = useState<TransferRequest | null>(null)
  const [acceptTransferMessage, setAcceptTransferMessage] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const notificationSoundRef = useRef<HTMLAudioElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Efeito para configurar notificações em tempo real
  useEffect(() => {
    // Configurar Server-Sent Events para notificações
    const eventSource = new EventSource(`/api/chat/notifications?coordinator_id=${coordinatorId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const notification: NotificationData = JSON.parse(event.data)

        if (notification.type === 'connected') {
          console.log('Conectado ao sistema de notificações')
          return
        }

        // Adicionar notificação
        setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Manter apenas 10

        // Contar notificações não lidas
        if (notification.type === 'new_chat_request' || notification.type === 'pending_chat_request') {
          setUnreadNotifications(prev => prev + 1)

          // Tocar som se habilitado
          if (soundEnabled && notificationSoundRef.current) {
            notificationSoundRef.current.play().catch(console.error)
          }
        }

        // Atualizar lista de conversas se for uma nova solicitação
        if (notification.type === 'new_chat_request' || notification.type === 'pending_chat_request') {
          loadConversations()
        }
      } catch (error) {
        console.error('Erro ao processar notificação:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [coordinatorId, soundEnabled])

  // Carregar coordenadores disponíveis
  useEffect(() => {
    loadAvailableCoordinators()
    loadAvailableStudents()
  }, [coordinatorId])

  // Carregar conversas iniciais e solicitações de transferência
  useEffect(() => {
    loadConversations()
    loadTransferRequests()

    // Polling para atualizar solicitações
    const pollingInterval = setInterval(() => {
      loadTransferRequests()
    }, 15000)

    return () => {
      clearInterval(pollingInterval)
    }
  }, [coordinatorId])

  // Auto scroll para nova mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/conversations?coordinator_id=${coordinatorId}`)

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      } else {
        console.error('Erro ao carregar conversas')
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableCoordinators = async () => {
    try {
      const response = await fetch(`/api/chat/transfer-chat?exclude_id=${coordinatorId}`)

      if (response.ok) {
        const data = await response.json()
        setAvailableCoordinators(data.coordinators || [])
      }
    } catch (error) {
      console.error('Erro ao carregar coordenadores:', error)
    }
  }

  const loadTransferRequests = async () => {
    try {
      const response = await fetch(`/api/chat/transfer-chat?coordinator_id=${coordinatorId}`)

      if (response.ok) {
        const data = await response.json()
        const newRequests = data.transfer_requests || []

        // Verificar se há novas solicitações
        const previousCount = transferRequests.length
        if (newRequests.length > previousCount) {
          setUnreadNotifications(prev => prev + (newRequests.length - previousCount))

          // Tocar som se habilitado
          if (soundEnabled && notificationSoundRef.current) {
            notificationSoundRef.current.play().catch(console.error)
          }
        }

        setTransferRequests(newRequests)
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações de transferência:', error)
    }
  }

  const loadAvailableStudents = async () => {
    try {
      // Mock students for now - you can replace with real API
      const mockStudents = [
        {
          id: 'student-1',
          name: 'Ana Silva',
          email: 'ana.silva@estudante.com',
          course: 'Ciências Contábeis',
          semester: '6º',
          is_online: true
        },
        {
          id: 'student-2',
          name: 'João Santos',
          email: 'joao.santos@estudante.com',
          course: 'Ciências Contábeis',
          semester: '8º',
          is_online: false
        },
        {
          id: 'student-3',
          name: 'Maria Oliveira',
          email: 'maria.oliveira@estudante.com',
          course: 'Ciências Contábeis',
          semester: '7º',
          is_online: true
        }
      ]
      setAvailableStudents(mockStudents)
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}`)

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const acceptChat = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/accept-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName,
          action: 'accept'
        })
      })

      if (response.ok) {
        await loadConversations()
        // Automaticamente selecionar a conversa aceita
        const acceptedConv = conversations.find(c => c.id === conversationId)
        if (acceptedConv) {
          setSelectedConversation(acceptedConv)
          await loadMessages(conversationId)
        }
      }
    } catch (error) {
      console.error('Erro ao aceitar chat:', error)
    }
  }

  const rejectChat = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/accept-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName,
          action: 'reject'
        })
      })

      if (response.ok) {
        await loadConversations()
      }
    } catch (error) {
      console.error('Erro ao rejeitar chat:', error)
    }
  }

  const transferChat = async () => {
    if (!selectedConversation) return

    if (transferType === 'coordinator' && !selectedTransferCoordinator) return
    if (transferType === 'student' && !selectedTransferStudent) return

    try {
      if (transferType === 'coordinator') {
        const targetCoordinator = availableCoordinators.find(c => c.id === selectedTransferCoordinator)

        const response = await fetch('/api/chat/transfer-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: selectedConversation.id,
            from_coordinator_id: coordinatorId,
            to_coordinator_id: selectedTransferCoordinator,
            from_coordinator_name: coordinatorName,
            to_coordinator_name: targetCoordinator?.name || 'Coordenador',
            reason: transferReason
          })
        })

        if (response.ok) {
          setTransferDialogOpen(false)
          setTransferReason('')
          setTransferMessage('')
          setSelectedTransferCoordinator('')
          setSelectedConversation(null)
          await loadConversations()
        }
      } else if (transferType === 'student') {
        const targetStudent = availableStudents.find(s => s.id === selectedTransferStudent)

        const response = await fetch('/api/chat/transfer-to-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: selectedConversation.id,
            from_coordinator_id: coordinatorId,
            to_student_id: selectedTransferStudent,
            from_coordinator_name: coordinatorName,
            to_student_name: targetStudent?.name || 'Estudante',
            reason: transferReason,
            message: transferMessage || `Olá! O coordenador ${coordinatorName} gostaria de transferir este atendimento para você. Você aceita assumir este chat?`
          })
        })

        if (response.ok) {
          setTransferDialogOpen(false)
          setTransferReason('')
          setTransferMessage('')
          setSelectedTransferStudent('')
          setSelectedConversation(null)
          await loadConversations()
        }
      }
    } catch (error) {
      console.error('Erro ao transferir chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content: newMessage,
          sender_type: 'coordinator',
          sender_id: coordinatorId,
          sender_name: coordinatorName
        })
      })

      if (response.ok) {
        setNewMessage('')
        await loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const acceptIncomingTransfer = async (transferRequest: TransferRequest) => {
    try {
      const response = await fetch('/api/chat/accept-transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_request_id: transferRequest.id,
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName,
          action: 'accept',
          message: acceptTransferMessage
        })
      })

      if (response.ok) {
        setShowAcceptTransferDialog(false)
        setAcceptTransferMessage('')
        setSelectedIncomingTransfer(null)
        await loadTransferRequests()
        await loadConversations()
      }
    } catch (error) {
      console.error('Erro ao aceitar transferência:', error)
    }
  }

  const rejectIncomingTransfer = async (transferRequest: TransferRequest) => {
    try {
      const response = await fetch('/api/chat/accept-transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_request_id: transferRequest.id,
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName,
          action: 'reject',
          message: 'Não posso atender no momento'
        })
      })

      if (response.ok) {
        await loadTransferRequests()
      }
    } catch (error) {
      console.error('Erro ao rejeitar transferência:', error)
    }
  }

  const clearNotifications = () => {
    setUnreadNotifications(0)
    setNotifications([])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getStatusBadge = (status: string, humanRequested?: boolean) => {
    if (humanRequested && status === 'active') {
      return <Badge className="bg-orange-100 text-orange-800 text-xs">Aguardando</Badge>
    }

    switch (status) {
      case 'active_human':
        return <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>
      case 'active':
        return <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 text-xs">IA</Badge>
      case 'ended':
        return <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs">Finalizado</Badge>
      default:
        return <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs">{status}</Badge>
    }
  }

  const getWaitingTime = (timestamp?: string) => {
    if (!timestamp) return ''

    const now = new Date()
    const requested = new Date(timestamp)
    const minutes = Math.floor((now.getTime() - requested.getTime()) / (1000 * 60))

    if (minutes < 1) return 'menos de 1min'
    if (minutes < 60) return `${minutes}min`

    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}min`
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-[600px] flex flex-col space-y-4">
      {/* Audio para notificações */}
      <audio ref={notificationSoundRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmccCz2V3/LTeSMJKIfN7deSQgsVYLPl8KhUIwg8lOPxs2QdCDCZ2+/NfCMJKI/O7dOSPQwRa7vt4pmDRAkYc7bn8qh..." />
      </audio>

      {/* Solicitações de Transferência Pendentes */}
      {transferRequests.length > 0 && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Você tem {transferRequests.length} solicitaç{transferRequests.length === 1 ? 'ão' : 'ões'} de transferência pendente{transferRequests.length === 1 ? '' : 's'}</strong>
                <div className="mt-2 space-y-2">
                  {transferRequests.slice(0, 3).map((request) => (
                    <Card key={request.id} className="bg-white">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              De: <span className="text-blue-600">{request.from_coordinator_name}</span>
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Motivo:</strong> {request.reason}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatMessageTime(request.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedIncomingTransfer(request)
                                setShowAcceptTransferDialog(true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-auto"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectIncomingTransfer(request)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header com notificações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Central de Atendimento</h3>
          <Badge variant="outline">{filteredConversations.length} conversas</Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão de notificações */}
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            className="relative"
          >
            {unreadNotifications > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* Controle de som */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={loadConversations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notificações recentes */}
      {notifications.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {notifications.slice(0, 3).map((notif, index) => (
                <div key={index} className="text-sm">
                  <strong>{notif.user_name || 'Sistema'}:</strong> {notif.message}
                  {notif.waiting_time && <span className="text-gray-500 ml-2">({notif.waiting_time})</span>}
                </div>
              ))}
              {notifications.length > 3 && (
                <div className="text-xs text-gray-500">+{notifications.length - 3} mais...</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 space-x-4 min-h-0">
        {/* Lista de conversas */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Carregando conversas...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation)
                        loadMessages(conversation.id)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {conversation.user_name || 'Usuário'}
                              </h4>
                              {conversation.is_online && (
                                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                              )}
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusBadge(conversation.status, conversation.human_requested)}
                              {conversation.human_requested && conversation.human_request_timestamp && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getWaitingTime(conversation.human_request_timestamp)}
                                </Badge>
                              )}
                            </div>

                            {conversation.user_email && (
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.user_email}
                              </p>
                            )}
                          </div>

                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>

                        {/* Botões de ação para conversas pendentes */}
                        {conversation.human_requested && conversation.status === 'active' && (
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                acceptChat(conversation.id)
                              }}
                              className="flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                rejectChat(conversation.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de mensagens */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.user_name || 'Usuário'}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(selectedConversation.status, selectedConversation.human_requested)}
                      {selectedConversation.user_email && (
                        <span className="text-sm text-gray-500">
                          {selectedConversation.user_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão de transferir chat */}
                  {selectedConversation.status === 'active_human' && selectedConversation.coordinator_id === coordinatorId && (
                    <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transferir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transferir Chat</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Tipo de transferência */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">Transferir para:</label>
                            <div className="flex space-x-2">
                              <Button
                                variant={transferType === 'coordinator' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setTransferType('coordinator')
                                  setSelectedTransferStudent('')
                                }}
                                className="flex-1"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Coordenador
                              </Button>
                              <Button
                                variant={transferType === 'student' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setTransferType('student')
                                  setSelectedTransferCoordinator('')
                                }}
                                className="flex-1"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Estudante
                              </Button>
                            </div>
                          </div>

                          {/* Seleção de coordenador */}
                          {transferType === 'coordinator' && (
                            <div>
                              <label className="text-sm font-medium">Para qual coordenador?</label>
                              <Select value={selectedTransferCoordinator} onValueChange={setSelectedTransferCoordinator}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar coordenador..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCoordinators.map((coord) => (
                                  <SelectItem key={coord.id} value={coord.id}>
                                    <div className="flex items-center space-x-2">
                                      <span>{coord.name}</span>
                                      {coord.is_online && (
                                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {coord.specialties[0]}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            </div>
                          )}

                          {/* Seleção de estudante */}
                          {transferType === 'student' && (
                            <div>
                              <label className="text-sm font-medium">Para qual estudante?</label>
                              <Select value={selectedTransferStudent} onValueChange={setSelectedTransferStudent}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar estudante..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStudents.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                      <div className="flex items-center space-x-2">
                                        <div>
                                          <div className="font-medium">{student.name}</div>
                                          <div className="text-xs text-gray-500">{student.course} - {student.semester}</div>
                                        </div>
                                        {student.is_online && (
                                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Motivo da transferência (opcional)</label>
                            <Textarea
                              value={transferReason}
                              onChange={(e) => setTransferReason(e.target.value)}
                              placeholder="Ex: Cliente precisa de especialista em MEI..."
                              rows={3}
                            />
                          </div>

                          {/* Mensagem personalizada para estudante */}
                          {transferType === 'student' && (
                            <div>
                              <label className="text-sm font-medium">Mensagem para o estudante (opcional)</label>
                              <Textarea
                                value={transferMessage}
                                onChange={(e) => setTransferMessage(e.target.value)}
                                placeholder="Personalize a mensagem enviada ao estudante..."
                                rows={2}
                              />
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={transferChat}
                              disabled={
                                (transferType === 'coordinator' && !selectedTransferCoordinator) ||
                                (transferType === 'student' && !selectedTransferStudent)
                              }
                              className="flex-1"
                            >
                              Transferir Chat
                            </Button>
                            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'coordinator' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_type === 'coordinator'
                              ? 'bg-blue-600 text-white'
                              : message.sender_type === 'assistant'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-white border text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.sender_type === 'user' && <User className="h-4 w-4" />}
                            {message.sender_type === 'assistant' && <Bot className="h-4 w-4" />}
                            {message.sender_type === 'coordinator' && <UserCheck className="h-4 w-4" />}
                            <span className="text-xs opacity-70">
                              {message.sender_name || message.sender_type}
                            </span>
                          </div>

                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>

                          <div className="text-xs opacity-50 mt-2">
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input de mensagem */}
                {selectedConversation.status === 'active_human' && selectedConversation.coordinator_id === coordinatorId && (
                  <div className="flex space-x-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog de Aceitar Transferência */}
      <Dialog open={showAcceptTransferDialog} onOpenChange={setShowAcceptTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar Transferência de Chat</DialogTitle>
          </DialogHeader>

          {selectedIncomingTransfer && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>De:</strong> {selectedIncomingTransfer.from_coordinator_name}
                </p>
                <p className="text-sm mt-2">
                  <strong>Motivo:</strong> {selectedIncomingTransfer.reason}
                </p>
                <p className="text-sm mt-2">
                  <strong>Mensagem:</strong>
                </p>
                <p className="text-sm mt-1">{selectedIncomingTransfer.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Mensagem para o cliente (opcional):
                </label>
                <Textarea
                  value={acceptTransferMessage}
                  onChange={(e) => setAcceptTransferMessage(e.target.value)}
                  placeholder="Digite uma mensagem para o cliente..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => selectedIncomingTransfer && acceptIncomingTransfer(selectedIncomingTransfer)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Aceitar Transferência
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAcceptTransferDialog(false)
                setAcceptTransferMessage('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}