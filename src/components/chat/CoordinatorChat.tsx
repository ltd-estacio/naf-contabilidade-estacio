'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Clock,
  Search,
  Phone,
  RefreshCw,
  Circle,
  Check,
  X,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
  chat_accepted_by?: string
  chat_accepted_at?: string
  chat_ended_at?: string
}

interface CoordinatorChatProps {
  coordinatorId: string
  coordinatorName: string
}

export default function CoordinatorChat({ coordinatorId, coordinatorName }: CoordinatorChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('pending')
  const [showFeedback, setShowFeedback] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadConversations()
    loadPendingRequests()
    const interval = setInterval(() => {
      loadConversations()
      loadPendingRequests()
      // Recarregar mensagens da conversa selecionada
      if (selectedConversation) {
        loadMessages(selectedConversation.id)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedConversation])

  const loadConversations = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/chat/conversations?coordinator_id=${coordinatorId}`)
      const data = await response.json()
      if (data.conversations) {
        // Filtrar apenas conversas ativas (não pendentes de aprovação)
        const activeConversations = data.conversations.filter((conv: Conversation) =>
          conv.status !== 'waiting_human' && conv.chat_accepted_by
        )
        setConversations(activeConversations)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const response = await fetch(`/api/chat/human-request?coordinator_id=${coordinatorId}`)
      const data = await response.json()
      if (data.pendingRequests) {
        setPendingRequests(data.pendingRequests)
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações pendentes:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}`)
      const data = await response.json()
      if (data.messages) {
        // Só atualizar se houver mudanças
        const currentLength = messages.length
        const newLength = data.messages.length

        if (newLength !== currentLength ||
            JSON.stringify(messages) !== JSON.stringify(data.messages)) {
          setMessages(data.messages)
          console.log(`Mensagens atualizadas: ${newLength} mensagens carregadas`)
        }

        // Marcar mensagens do usuário como lidas
        await fetch('/api/chat/messages', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            sender_type: 'user'
          })
        })
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
    setShowFeedback(conversation.status === 'ended')
  }

  const acceptChat = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/accept-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName,
          action: 'accept'
        })
      })

      const data = await response.json()
      if (data.success) {
        // Recarregar listas
        loadPendingRequests()
        loadConversations()
        // Selecionar a conversa aceita
        const acceptedConv = pendingRequests.find(conv => conv.id === conversationId)
        if (acceptedConv) {
          setSelectedConversation({ ...acceptedConv, status: 'active_human', chat_accepted_by: coordinatorId })
          loadMessages(conversationId)
          setActiveTab('active')
        }
      } else {
        alert(data.error || 'Erro ao aceitar chat')
      }
    } catch (error) {
      console.error('Erro ao aceitar chat:', error)
      alert('Erro ao aceitar chat')
    }
  }

  const rejectChat = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/accept-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          coordinator_id: coordinatorId,
          action: 'reject'
        })
      })

      const data = await response.json()
      if (data.success) {
        loadPendingRequests()
        loadConversations()
      } else {
        alert(data.error || 'Erro ao rejeitar chat')
      }
    } catch (error) {
      console.error('Erro ao rejeitar chat:', error)
      alert('Erro ao rejeitar chat')
    }
  }

  const endChat = async () => {
    if (!selectedConversation) return

    try {
      const response = await fetch('/api/chat/end-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          ended_by: 'coordinator',
          coordinator_id: coordinatorId,
          coordinator_name: coordinatorName
        })
      })

      const data = await response.json()
      if (data.success) {
        setSelectedConversation({ ...selectedConversation, status: 'ended' })
        setShowFeedback(true)
        loadMessages(selectedConversation.id)
        loadConversations()
      }
    } catch (error) {
      console.error('Erro ao finalizar chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !selectedConversation) return

    const coordinatorMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender_type: 'coordinator',
      sender_name: coordinatorName,
      created_at: new Date().toISOString(),
      is_read: true
    }

    setMessages(prev => [...prev, coordinatorMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content: coordinatorMessage.content,
          sender_type: 'coordinator',
          sender_id: coordinatorId,
          sender_name: coordinatorName,
          is_ai_response: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }

      console.log('Mensagem enviada com sucesso:', data)

      // Atualizar lista de conversas
      loadConversations()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      // Remover mensagem otimista em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== coordinatorMessage.id))
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPendingRequests = pendingRequests.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden bg-white">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">Painel de Chat</h3>
              {pendingRequests.length > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadConversations()
                loadPendingRequests()
              }}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'pending')} className="mb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="relative">
                Pendentes
                {pendingRequests.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="relative">
                Ativas
                {conversations.length > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                    {conversations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <Tabs value={activeTab}>
            {/* Aba de Solicitações Pendentes */}
            <TabsContent value="pending">
              <div className="p-2">
                {filteredPendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPendingRequests.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 rounded-lg border border-orange-200 bg-orange-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-sm text-gray-900">
                              {conversation.user_name}
                            </span>
                            <Badge variant="outline" className="text-xs bg-orange-100">
                              Aguardando
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.human_request_timestamp || conversation.updated_at)}
                          </span>
                        </div>
                        {conversation.user_email && (
                          <p className="text-xs text-gray-500 mb-2">{conversation.user_email}</p>
                        )}
                        {conversation.last_message && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate">
                            {conversation.last_message.content.slice(0, 60)}...
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => acceptChat(conversation.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectChat(conversation.id)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Aba de Conversas Ativas */}
            <TabsContent value="active">
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma conversa ativa</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-blue-100 border-blue-200'
                            : 'hover:bg-gray-50 border-transparent'
                        } border`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Circle
                                className={`h-2 w-2 ${
                                  conversation.is_online ? 'text-green-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                              <span className="font-medium text-sm text-gray-900">
                                {conversation.user_name}
                              </span>
                            </div>
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <Badge className="bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                              </Badge>
                            )}
                            {conversation.status === 'ended' && (
                              <Badge variant="outline" className="text-xs">
                                Finalizada
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.updated_at)}
                          </span>
                        </div>
                        {conversation.user_email && (
                          <p className="text-xs text-gray-500 mb-1">{conversation.user_email}</p>
                        )}
                        {conversation.last_message && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {conversation.last_message.content.slice(0, 50)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Circle
                      className={`h-3 w-3 ${
                        selectedConversation.is_online ? 'text-green-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.user_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.is_online ? 'Online' : 'Offline'} •
                        {selectedConversation.user_email || 'Visitante'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    ID: {selectedConversation.user_id.slice(-8)}
                  </Badge>
                  {selectedConversation.status === 'active_human' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={endChat}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Finalizar Chat
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'coordinator' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_type === 'coordinator'
                          ? 'bg-blue-600 text-white'
                          : message.sender_type === 'user'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-green-100 text-green-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender_type === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : message.sender_type === 'coordinator' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.sender_name}
                        </span>
                      </div>
                      <div className="text-sm">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-black/10 px-1 py-0.5 rounded text-xs">{children}</code>,
                            h3: ({ children }) => <h3 className="font-semibold mb-1">{children}</h3>,
                            hr: () => <hr className="my-2 border-current/20" />
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <div className="text-xs opacity-50 mt-1">
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span className="text-sm">Enviando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua resposta..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  Respondendo como: {coordinatorName}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(selectedConversation.updated_at)} • {formatTime(selectedConversation.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa na lista para começar a responder aos clientes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}