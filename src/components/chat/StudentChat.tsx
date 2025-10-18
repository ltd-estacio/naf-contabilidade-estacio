'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Bot,
  AlertCircle,
  MessageSquare,
  Users,
  Bell,
  X
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_type: 'student' | 'coordinator' | 'user' | 'assistant' | 'system'
  sender_id: string
  sender_name: string
  is_ai_response: boolean
  is_read: boolean
  created_at: string
}

interface Conversation {
  id: string
  user_id: string
  coordinator_id: string
  status: string
  chat_accepted_by: string | null
  chat_accepted_at: string | null
  created_at: string
  updated_at: string
}

interface TransferRequest {
  id: string
  conversation_id: string
  from_coordinator_id: string
  from_coordinator_name: string
  to_student_id: string
  to_student_name: string
  reason: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  expires_at: string
}

interface StudentChatProps {
  studentId: string
  studentName: string
}

export function StudentChat({ studentId, studentName }: StudentChatProps) {
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [selectedTransferRequest, setSelectedTransferRequest] = useState<TransferRequest | null>(null)
  const [transferResponse, setTransferResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notification, setNotification] = useState('')
  const [notificationVisible, setNotificationVisible] = useState(false)
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Buscar solicitações de transferência
  const fetchTransferRequests = async () => {
    try {
      const response = await fetch(`/api/chat/transfer-to-student?student_id=${studentId}`)
      const data = await response.json()

      if (response.ok) {
        const requests = data.transfer_requests || []
        const newRequests = requests.filter((request: TransferRequest) =>
          !transferRequests.some(existing => existing.id === request.id)
        )

        setTransferRequests(requests)

        if (newRequests.length > 0) {
          const next = newRequests[0]
          triggerNotification(`Novo atendimento encaminhado pelo coordenador ${next.from_coordinator_name}.`)
        }
      } else {
        console.error('Erro ao buscar solicitações:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações de transferência:', error)
    }
  }

  const triggerNotification = (message: string) => {
    setNotification(message)
    setNotificationVisible(true)

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current)
    }

    notificationTimerRef.current = setTimeout(() => {
      setNotificationVisible(false)
    }, 8000)

    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DwmmgfCDBrxPDCaiIDF0PV8N5QQAoTV6jn77BdGQhDo+LvlkshBjWQ3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DwmmgfCDBrxPDCaiIDF0PV8N5QQAoTNwgZaLvt559NEAxQp+Puu2EcBjqe2O7IsWgfCTBvyOvObiEIRzLhub+dRgwZaL3uxKc0CwAA')
    audio.play().catch(() => {})
  }

  // Buscar conversas ativas onde o estudante é responsável
  const fetchActiveConversations = async () => {
    try {
      const response = await fetch(`/api/chat/conversations?student_id=${studentId}&status=active_student`)
      const data = await response.json()

      if (response.ok) {
        setActiveConversations(data.conversations || [])
      } else {
        console.error('Erro ao buscar conversas:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas ativas:', error)
    }
  }

  // Buscar mensagens de uma conversa
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
        scrollToBottom()
      } else {
        console.error('Erro ao buscar mensagens:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    }
  }

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          content: newMessage,
          sender_type: 'student',
          sender_id: studentId,
          sender_name: studentName,
          is_ai_response: false
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedConversation)
      } else {
        setError(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      setError('Erro ao enviar mensagem')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aceitar solicitação de transferência
  const handleAcceptTransfer = async (transferRequest: TransferRequest) => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/accept-transfer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transfer_request_id: transferRequest.id,
          student_id: studentId,
          student_name: studentName,
          action: 'accept',
          message: transferResponse
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Transferência aceita com sucesso!')
        setShowTransferDialog(false)
        setTransferResponse('')
        setSelectedTransferRequest(null)
        await fetchTransferRequests()
        await fetchActiveConversations()
      } else {
        setError(data.error || 'Erro ao aceitar transferência')
      }
    } catch (error) {
      setError('Erro ao aceitar transferência')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rejeitar solicitação de transferência
  const handleRejectTransfer = async (transferRequest: TransferRequest) => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/accept-transfer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transfer_request_id: transferRequest.id,
          student_id: studentId,
          student_name: studentName,
          action: 'reject',
          message: transferResponse
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Transferência recusada')
        setShowTransferDialog(false)
        setTransferResponse('')
        setSelectedTransferRequest(null)
        await fetchTransferRequests()
      } else {
        setError(data.error || 'Erro ao recusar transferência')
      }
    } catch (error) {
      setError('Erro ao recusar transferência')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchTransferRequests()
    fetchActiveConversations()

    // Polling para atualizar solicitações
    const pollingInterval = setInterval(() => {
      fetchTransferRequests()
      fetchActiveConversations()
    }, 15000)

    return () => {
      clearInterval(pollingInterval)
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current)
      }
    }
  }, [studentId])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
            <X className="h-4 w-4" />
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
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {notificationVisible && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-start gap-3">
          <Bell className="h-5 w-5 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Novo atendimento transferido</p>
            <p>{notification}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Solicitações
            {transferRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {transferRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversas Ativas
            {activeConversations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeConversations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Solicitações de Transferência */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Solicitações de Transferência
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transferRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação de transferência pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transferRequests.map((request) => (
                    <Card key={request.id} className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-orange-100">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatMessageTime(request.created_at)}
                              </span>
                            </div>

                            <div>
                              <p className="font-medium">
                                Transferência de: <span className="text-blue-600">{request.from_coordinator_name}</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>Motivo:</strong> {request.reason}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border">
                              <p className="text-sm">{request.message}</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTransferRequest(request)
                                  setShowTransferDialog(true)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTransferRequest(request)
                                  setTransferResponse('Não posso atender no momento')
                                  handleRejectTransfer(request)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Recusar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversas Ativas */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Conversas */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {activeConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa ativa</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activeConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                            selectedConversation === conversation.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <p className="font-medium text-sm">
                                Chat #{conversation.id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatMessageTime(conversation.updated_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Área de Chat */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {selectedConversation ? `Chat #${selectedConversation.slice(0, 8)}` : 'Selecione uma conversa'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Área de Mensagens */}
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === 'student' && message.sender_id === studentId
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender_type === 'student' && message.sender_id === studentId
                                  ? 'bg-blue-600 text-white'
                                  : message.sender_type === 'coordinator'
                                  ? 'bg-green-100 text-green-900'
                                  : message.sender_type === 'system'
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {message.sender_type === 'coordinator' && <User className="h-3 w-3" />}
                                {message.sender_type === 'assistant' && <Bot className="h-3 w-3" />}
                                {message.sender_type === 'system' && <AlertCircle className="h-3 w-3" />}
                                <span className="text-xs font-medium">
                                  {message.sender_name}
                                </span>
                                <span className="text-xs opacity-70">
                                  {formatMessageTime(message.created_at)}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap text-sm">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input de Mensagem */}
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={loading || !newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Aceitar Transferência */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar Transferência de Chat</DialogTitle>
            <DialogDescription>
              Você está prestes a aceitar a transferência do chat de{' '}
              <strong>{selectedTransferRequest?.from_coordinator_name}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedTransferRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p><strong>Motivo:</strong> {selectedTransferRequest.reason}</p>
                <p className="mt-2"><strong>Mensagem:</strong></p>
                <p className="text-sm">{selectedTransferRequest.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Mensagem de resposta (opcional):
                </label>
                <Textarea
                  value={transferResponse}
                  onChange={(e) => setTransferResponse(e.target.value)}
                  placeholder="Digite uma mensagem para o cliente..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => selectedTransferRequest && handleAcceptTransfer(selectedTransferRequest)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Aceitar Transferência'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
