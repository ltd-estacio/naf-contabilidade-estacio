'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, Send, Users, Search, Settings, 
  UserCircle, Check, CheckCheck, Phone,
  Video, Paperclip, Smile, MoreVertical, X
} from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  senderId: string
  senderName: string
  senderRole: 'COORDINATOR' | 'TEACHER' | 'STUDENT'
  timestamp: Date
  read: boolean
  type: 'text' | 'file' | 'system'
}

interface ChatRoom {
  id: string
  name: string
  type: 'direct' | 'group' | 'support'
  participants: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount: number
  isActive: boolean
}

interface ChatParticipant {
  id: string
  name: string
  role: 'COORDINATOR' | 'TEACHER' | 'STUDENT'
  avatar?: string
  online: boolean
  lastSeen?: Date
}

export default function ChatSystem() {
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: 'support',
      name: 'Suporte NAF',
      type: 'support',
      participants: [
        { id: '1', name: 'João Silva', role: 'COORDINATOR', online: true },
        { id: '2', name: 'Maria Santos', role: 'TEACHER', online: true }
      ],
      lastMessage: {
        id: '1',
        text: 'Olá! Como posso ajudar?',
        senderId: '1',
        senderName: 'João Silva',
        senderRole: 'COORDINATOR',
        timestamp: new Date(),
        read: false,
        type: 'text'
      },
      unreadCount: 1,
      isActive: true
    },
    {
      id: 'teachers',
      name: 'Professores NAF',
      type: 'group',
      participants: [
        { id: '2', name: 'Maria Santos', role: 'TEACHER', online: true },
        { id: '3', name: 'Pedro Costa', role: 'TEACHER', online: false, lastSeen: new Date(Date.now() - 300000) },
        { id: '4', name: 'Ana Lima', role: 'TEACHER', online: true }
      ],
      lastMessage: {
        id: '2',
        text: 'Reunião às 14h na sala 201',
        senderId: '2',
        senderName: 'Maria Santos',
        senderRole: 'TEACHER',
        timestamp: new Date(Date.now() - 600000),
        read: true,
        type: 'text'
      },
      unreadCount: 0,
      isActive: true
    },
    {
      id: 'students-help',
      name: 'Ajuda aos Estudantes',
      type: 'group',
      participants: [
        { id: '5', name: 'Carlos Souza', role: 'STUDENT', online: true },
        { id: '6', name: 'Lucia Ferreira', role: 'STUDENT', online: false },
        { id: '7', name: 'Roberto Silva', role: 'STUDENT', online: true }
      ],
      lastMessage: {
        id: '3',
        text: 'Dúvida sobre declaração de IR',
        senderId: '5',
        senderName: 'Carlos Souza',
        senderRole: 'STUDENT',
        timestamp: new Date(Date.now() - 1800000),
        read: true,
        type: 'text'
      },
      unreadCount: 2,
      isActive: true
    }
  ])

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(rooms[0])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      text: 'Olá! Bem-vindo ao sistema de chat do NAF. Como posso ajudar você hoje?',
      senderId: '1',
      senderName: 'João Silva',
      senderRole: 'COORDINATOR',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: 'text'
    },
    {
      id: 'm2',
      text: 'Preciso de ajuda com o agendamento de um atendimento.',
      senderId: 'current-user',
      senderName: 'Você',
      senderRole: 'STUDENT',
      timestamp: new Date(Date.now() - 3000000),
      read: true,
      type: 'text'
    },
    {
      id: 'm3',
      text: 'Claro! Posso te ajudar com isso. Que tipo de serviço você precisa?',
      senderId: '1',
      senderName: 'João Silva',
      senderRole: 'COORDINATOR',
      timestamp: new Date(Date.now() - 2700000),
      read: true,
      type: 'text'
    },
    {
      id: 'm4',
      text: 'Preciso de orientação sobre declaração de Imposto de Renda.',
      senderId: 'current-user',
      senderName: 'Você',
      senderRole: 'STUDENT',
      timestamp: new Date(Date.now() - 2400000),
      read: true,
      type: 'text'
    },
    {
      id: 'm5',
      text: 'Perfeito! Vou te conectar com um de nossos especialistas em IR. Um momento.',
      senderId: '1',
      senderName: 'João Silva',
      senderRole: 'COORDINATOR',
      timestamp: new Date(Date.now() - 2100000),
      read: true,
      type: 'text'
    },
    {
      id: 'm6',
      text: 'Maria Santos entrou na conversa',
      senderId: 'system',
      senderName: 'Sistema',
      senderRole: 'COORDINATOR',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      type: 'system'
    },
    {
      id: 'm7',
      text: 'Olá! Sou professora especialista em IR. Vou te ajudar com sua declaração.',
      senderId: '2',
      senderName: 'Maria Santos',
      senderRole: 'TEACHER',
      timestamp: new Date(Date.now() - 1500000),
      read: true,
      type: 'text'
    },
    {
      id: 'm8',
      text: 'Ótimo! Muito obrigado. Quando posso agendar um atendimento?',
      senderId: 'current-user',
      senderName: 'Você',
      senderRole: 'STUDENT',
      timestamp: new Date(Date.now() - 1200000),
      read: true,
      type: 'text'
    },
    {
      id: 'm9',
      text: 'Tenho disponibilidade amanhã às 14h ou na sexta às 10h. Qual prefere?',
      senderId: '2',
      senderName: 'Maria Santos',
      senderRole: 'TEACHER',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      type: 'text'
    },
    {
      id: 'm10',
      text: 'Amanhã às 14h seria perfeito!',
      senderId: 'current-user',
      senderName: 'Você',
      senderRole: 'STUDENT',
      timestamp: new Date(Date.now() - 600000),
      read: true,
      type: 'text'
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simular usuário digitando
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isTyping])

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return

    const message: ChatMessage = {
      id: `m${Date.now()}`,
      text: newMessage,
      senderId: 'current-user',
      senderName: 'Você',
      senderRole: 'STUDENT',
      timestamp: new Date(),
      read: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simular resposta automática
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `m${Date.now() + 1}`,
        text: 'Mensagem recebida! Em breve responderemos.',
        senderId: selectedRoom.participants[0].id,
        senderName: selectedRoom.participants[0].name,
        senderRole: selectedRoom.participants[0].role,
        timestamp: new Date(),
        read: false,
        type: 'text'
      }
      setMessages(prev => [...prev, autoReply])
    }, 2000)
  }

  // Marcar mensagens como lidas
  const markAsRead = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, unreadCount: 0 } : room
    ))
  }

  // Filtrar salas
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COORDINATOR':
        return 'text-purple-600'
      case 'TEACHER':
        return 'text-blue-600'
      case 'STUDENT':
        return 'text-green-600'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'COORDINATOR':
        return 'Coordenador'
      case 'TEACHER':
        return 'Professor'
      case 'STUDENT':
        return 'Estudante'
      default:
        return 'Usuário'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}m atrás`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  return (
    <div className="h-[800px] flex bg-white dark:bg-gray-950 rounded-lg border overflow-hidden">
      {/* Sidebar - Lista de Chats */}
      <div className="w-80 border-r flex flex-col">
        {/* Header do Chat */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat NAF
            </h2>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Salas */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => {
                setSelectedRoom(room)
                markAsRead(room.id)
              }}
              className={`w-full text-left p-4 border-b hover:bg-gray-50 dark:bg-gray-900 transition-colors ${
                selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {room.type === 'support' ? (
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {room.participants.some(p => p.online) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {room.name}
                    </h3>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTime(room.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {room.lastMessage ? (
                        <span>
                          <span className={getRoleColor(room.lastMessage.senderRole)}>
                            {room.lastMessage.senderName}:
                          </span>{' '}
                          {room.lastMessage.text}
                        </span>
                      ) : (
                        'Nenhuma mensagem'
                      )}
                    </p>
                    {room.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    {room.participants.slice(0, 3).map((participant) => (
                      <div
                        key={participant.id}
                        className={`w-2 h-2 rounded-full ${
                          participant.online ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                        title={participant.name}
                      ></div>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {room.participants.length} participantes
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Principal */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Header da Conversa */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedRoom.type === 'support' ? (
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {selectedRoom.participants.some(p => p.online) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{selectedRoom.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRoom.participants.filter(p => p.online).length} online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRoomSettings(!showRoomSettings)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Participantes (quando expandido) */}
          {showRoomSettings && (
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Participantes ({selectedRoom.participants.length})</h4>
                <Button variant="outline" size="sm" onClick={() => setShowRoomSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 bg-white dark:bg-gray-950 px-3 py-2 rounded-lg border"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      participant.online ? 'bg-green-400' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">{participant.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getRoleBadge(participant.role)}
                    </Badge>
                    {!participant.online && participant.lastSeen && (
                      <span className="text-xs text-gray-500">
                        {formatLastSeen(participant.lastSeen)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'system' ? (
                  <div className="text-center w-full">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {message.text}
                    </span>
                  </div>
                ) : (
                  <div className={`max-w-xs lg:max-w-md ${
                    message.senderId === 'current-user' ? 'order-1' : 'order-2'
                  }`}>
                    {message.senderId !== 'current-user' && (
                      <div className="flex items-center gap-2 mb-1">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                        <span className={`text-xs font-medium ${getRoleColor(message.senderRole)}`}>
                          {message.senderName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getRoleBadge(message.senderRole)}
                        </Badge>
                      </div>
                    )}
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.senderId === 'current-user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>

                    <div className={`flex items-center gap-1 mt-1 ${
                      message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.senderId === 'current-user' && (
                        message.read ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage()
                    }
                  }}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Estado sem chat selecionado */
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Selecione uma conversa
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha uma conversa na lista para começar a conversar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
