'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle,
  Send,
  X,
  Maximize2,
  Minimize2,
  Bot,
  User as UserIcon,
  Phone
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface NAFChatWidgetProps {
  appointmentId?: number
  protocol?: string
  serviceTitle?: string
}

export default function NAFChatWidget({ appointmentId, protocol, serviceTitle }: NAFChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mensagem de boas-vindas
    if (isOpen && messages.length === 0) {
      addMessage({
        id: '1',
        content: `👋 **Olá! Bem-vindo(a) ao NAF Estácio Florianópolis!**\n\nSou seu **Assistente Virtual** e estou aqui para ajudá-lo(a) com questões fiscais e contábeis! 🤝\n\n🎯 **Posso ajudá-lo(a) com:**\n\n📊 **Questões Fiscais e Tributárias**\n• Declarações de impostos (IRPF, IRPJ)\n• Cálculo de tributos (ICMS, ISS, PIS/COFINS)\n• Regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real)\n• Planejamento tributário\n\n💼 **Apoio a Microempreendedores**\n• Formalização de MEI\n• Regularização de empresas\n• Orientações contábeis para pequenos negócios\n\n${protocol ? `\n📋 **Seu protocolo:** ${protocol}\n📝 **Serviço:** ${serviceTitle || 'Atendimento Fiscal'}\n\n` : ''}Como posso ajudá-lo(a) hoje?`,
        sender: 'assistant',
        timestamp: new Date()
      })
    }
  }, [isOpen, messages.length, protocol, serviceTitle])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputMessage('')
    setIsLoading(true)

    // Simular resposta do assistente (depois conectar com a API real)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Obrigado pela sua mensagem! Um de nossos especialistas irá atendê-lo em breve. Enquanto isso, posso ajudá-lo com informações gerais sobre nossos serviços.',
        sender: 'assistant',
        timestamp: new Date()
      }
      addMessage(assistantMessage)
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white flex items-center justify-center"
          size="lg"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-4'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                <Bot className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Chat NAF</h3>
                <p className="text-sm opacity-90">Assistente Virtual</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/20"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'assistant' && <Bot className="h-4 w-4" />}
                      {message.sender === 'user' && <UserIcon className="h-4 w-4" />}
                      <span className="text-xs opacity-70">
                        {message.sender === 'assistant' ? 'Assistente NAF' : 'Você'}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open('/cadastro', '_blank')}
              >
                <UserIcon className="h-3 w-3 mr-1" />
                Fazer Cadastro
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open('/login', '_blank')}
              >
                Fazer Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open('tel:+554898461-4449')}
              >
                <Phone className="h-3 w-3 mr-1" />
                (48) 98461-4449
              </Button>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
