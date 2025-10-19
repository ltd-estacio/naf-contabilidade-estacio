'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  RefreshCw,
  Phone,
  Calendar,
  UserPlus,
  CheckCircle,
  Mail,
  MapPin,
  Briefcase,
  LogIn,
  History,
  FileText,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react'

// Função para gerar UUID simples
const generateId = () => {
  return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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
  status: string
  is_online?: boolean
  unread_count?: number
  human_requested?: boolean
  coordinator_id?: string
  chat_accepted_by?: string
  coordinator_name?: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId] = useState(() => `user_${generateId()}`)
  const [requestHumanAgent, setRequestHumanAgent] = useState(false)
  const [chatStatus, setChatStatus] = useState<'ai' | 'waiting_human' | 'active_human' | 'ended'>('ai')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationStep, setRegistrationStep] = useState(0)
  const [registrationData, setRegistrationData] = useState({})
  const [isRegistered, setIsRegistered] = useState(false)
  const [showScheduling, setShowScheduling] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedUser, setLoggedUser] = useState<unknown>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyType, setHistoryType] = useState<'appointments' | 'conversations'>('conversations')
  const [appointmentHistory, setAppointmentHistory] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [currentSession, setCurrentSession] = useState<unknown>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferData, setTransferData] = useState({ reason: '', notes: '', to_user_type: 'coordinator' })
  const [availableAttendants, setAvailableAttendants] = useState([])
  const [selectedAttendant, setSelectedAttendant] = useState('')
  const [hasChatToken, setHasChatToken] = useState(false)
  const [tokenValidated, setTokenValidated] = useState(false)

const messagesContainerRef = useRef<HTMLDivElement>(null)
const lastMessageIdRef = useRef<string | null>(null)

  // Check for chat_token in URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get('chat_token')
    const expiresParam = searchParams.get('expires')

    if (token && expiresParam) {
      // Check if token is expired
      const expiresAt = parseInt(expiresParam)
      const now = Date.now()

      if (expiresAt > now) {
        // Token is valid and not expired
        setHasChatToken(true)
        setTokenValidated(true)
        // Auto-open the chat widget
        setIsOpen(true)
        console.log('✅ Token válido - Chat habilitado')
      } else {
        console.log('❌ Token expirado')
      }
    }
  }, [])

const scrollToBottom = () => {
  const container = messagesContainerRef.current
  if (!container) return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  })
}

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!conversation) {
      lastMessageIdRef.current = null
      setMessages([])
    }
  }, [conversation?.id])

  // Sistema de notificações para o usuário
  useEffect(() => {
    if (!conversation) return

    // Função para carregar contagem de mensagens não lidas
    const loadUnreadCount = async () => {
      try {
        const response = await fetch(`/api/chat/unread-count?user_id=${userId}&conversation_id=${conversation.id}`)
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unread_count || 0)
        }
      } catch (error) {
        console.error('Erro ao carregar contagem não lidas:', error)
      }
    }

    // Carregar contagem inicial
    loadUnreadCount()

    // Verificar periodicamente por novas mensagens não lidas
    const interval = setInterval(() => {
      if (!isOpen) { // Só atualizar contador quando chat está fechado
        loadUnreadCount()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [conversation, userId, isOpen])

  // Marcar mensagens como lidas quando abrir o chat
  useEffect(() => {
    if (isOpen && conversation && unreadCount > 0) {
      const markAsRead = async () => {
        try {
          await fetch('/api/chat/unread-count', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              conversation_id: conversation.id
            })
          })
          setUnreadCount(0)
        } catch (error) {
          console.error('Erro ao marcar como lidas:', error)
        }
      }
      markAsRead()
    }
  }, [isOpen, conversation, userId])

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeConversation()
    }
  }, [isOpen])

  // Polling para buscar novas mensagens quando conectado com coordenador
  useEffect(() => {
    if (!conversation?.id || chatStatus === 'ai' || chatStatus === 'ended') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?conversation_id=${conversation.id}&t=${Date.now()}`, {
          cache: 'no-store'
        })
        const data = await response.json()

        if (data.messages && data.messages.length > 0) {
          const lastMessageId = data.messages[data.messages.length - 1]?.id

          // Se há nova mensagem
          if (lastMessageId && lastMessageId !== lastMessageIdRef.current) {
            setMessages(data.messages)
            lastMessageIdRef.current = lastMessageId
          }
        }
      } catch (error) {
        console.error('Erro ao buscar novas mensagens:', error)
      }
    }, 2000) // Verificar a cada 2 segundos

    return () => clearInterval(interval)
  }, [conversation?.id, chatStatus])

  // Polling para verificar status da conversa (se coordenador aceitou)
  useEffect(() => {
    if (!conversation?.id || chatStatus === 'ended') return

    const statusInterval = setInterval(async () => {
      await checkConversationStatus()
    }, 3000) // Verificar status a cada 3 segundos

    return () => clearInterval(statusInterval)
  }, [conversation?.id, chatStatus])

  const initializeConversation = async () => {
    try {
      // Primeiro tentar buscar conversa existente
      const existingResponse = await fetch(`/api/chat/conversations?user_id=${userId}`)
      const existingData = await existingResponse.json()

      if (existingData.conversation) {
        // Conversa já existe, carregar mensagens
        setConversation(existingData.conversation)

        // Verificar status da conversa
        if (existingData.conversation.human_requested) {
          if (existingData.conversation.coordinator_id) {
            setChatStatus('active_human')
            setRequestHumanAgent(false)
          } else {
            setChatStatus('waiting_human')
            setRequestHumanAgent(true)
          }
        }

        // Carregar mensagens existentes
        await loadMessages(existingData.conversation.id)
        return
      }

      // Se não existe, criar nova
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          user_name: 'Visitante',
          user_email: null
        })
      })

      const data = await response.json()
      if (data.conversation) {
        setConversation(data.conversation)

        // Adicionar mensagem de boas-vindas inicial
        const welcomeMessage: Message = {
          id: generateId(),
          content: `👋 **Olá! Bem-vindo(a) ao NAF Estácio Florianópolis!**

Sou seu **Assistente Virtual** e estou aqui para ajudá-lo(a) com questões fiscais e contábeis! 🤝

🎯 **Posso ajudá-lo(a) com:**

📊 **Questões Fiscais e Tributárias**
• Declarações de impostos (IRPF, IRPJ)
• Cálculo de tributos (ICMS, ISS, PIS/COFINS)
• Regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real)
• Planejamento tributário

💼 **Apoio a Microempreendedores**
• Formalização de MEI
• Regularização de empresas
• Orientações contábeis para pequenos negócios

📑 **Documentação e Regularização**
• Certidões negativas
• Cadastros fiscais
• Regularização de pendências

📚 **Informações Gerais**
• Legislação tributária
• Prazos e obrigações
• Orientações sobre documentos

💡 **Como funciona:**
• Digite sua dúvida e eu responderei instantaneamente
• Se precisar de um **especialista humano**, basta clicar no botão abaixo
• Você também pode **agendar uma consultoria** personalizada

👤 **Quer atendimento personalizado?**
Use os botões abaixo para:
• 📝 **Fazer Cadastro** - Para salvar seu histórico
• 🔑 **Fazer Login** - Se já tem conta
• 🤝 **Falar com Especialista** - Para atendimento humano
• 📅 **Agendar Consultoria** - Para marcar um horário

Estou online e pronto para ajudar! Como posso auxiliá-lo(a) hoje? 😊`,
          sender_type: 'assistant',
          sender_name: 'Assistente NAF',
          is_ai_response: false,
          created_at: new Date().toISOString(),
          is_read: true
        }

        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Erro ao inicializar conversa:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversation) return

    // Se está no processo de cadastro, processar entrada do cadastro
    if (showRegistration) {
      await handleRegistrationInput(inputValue)
      setInputValue('')
      return
    }

    // VERIFICAÇÃO CRÍTICA: Checar se há coordenador ativo antes de prosseguir
    console.log('📤 INÍCIO sendMessage - Estado atual:', {
      chatStatus,
      coordinator_id: conversation.coordinator_id,
      chat_accepted_by: conversation.chat_accepted_by,
      status: conversation.status
    })

    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      sender_type: 'user',
      sender_name: 'Você',
      created_at: new Date().toISOString(),
      is_read: true
    }

    const messageToSend = inputValue
    setMessages(prev => {
      const updated = [...prev, userMessage]
      lastMessageIdRef.current = updated.at(-1)?.id ?? null
      return updated
    })
    setInputValue('')
    setIsLoading(true)

    // Verificar se o usuário quer se cadastrar ou agendar
    const lowerMessage = messageToSend.toLowerCase()

    if (!isRegistered && (
      lowerMessage.includes('cadastr') ||
      lowerMessage.includes('registr') ||
      lowerMessage.includes('quero me cadastrar') ||
      lowerMessage.includes('fazer cadastro')
    )) {
      setIsLoading(false)
      startRegistration()
      return
    }

    if (lowerMessage.includes('agendar') ||
        lowerMessage.includes('marcar') ||
        lowerMessage.includes('consultor') ||
        lowerMessage.includes('horário')) {
      setIsLoading(false)
      startScheduling()
      return
    }

    try {
      // Salvar mensagem do usuário
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          content: userMessage.content,
          sender_type: 'user',
          sender_id: userId,
          sender_name: 'Usuário'
        })
      })

      // ATUALIZAR STATUS DA CONVERSA ANTES DE VERIFICAR
      const updatedConversation = await checkConversationStatus()

      // AGUARDAR UM POUCO PARA GARANTIR ATUALIZAÇÃO
      await new Promise(resolve => setTimeout(resolve, 300))

      const coordinatorId = updatedConversation?.coordinator_id ?? conversation.coordinator_id
      const acceptedBy = updatedConversation?.chat_accepted_by ?? conversation.chat_accepted_by
      const statusCandidates = [
        updatedConversation?.status,
        conversation.status,
        chatStatus
      ].filter(Boolean) as string[]

      const humanStatusDetected = statusCandidates.some(status => status === 'active_human')
      const endedStatusDetected = statusCandidates.some(status => status === 'ended')
      const hasHumanCoordinator = Boolean(coordinatorId || acceptedBy)
      const hasCoordinatorMessages = Boolean(
        updatedConversation?.messages?.some((msg: { sender_type?: string }) => msg.sender_type === 'coordinator') ||
        messages.some(msg => msg.sender_type === 'coordinator')
      )

      // IMPORTANTE: Verificar PRIMEIRO se há coordenador ativo
      console.log('🔍 DEBUG - Estado da conversa atualizado:', {
        conversation_id: conversation.id,
        coordinator_id: coordinatorId,
        status_candidates: statusCandidates,
        chat_accepted_by: acceptedBy,
        chatStatus: chatStatus,
        hasCoordinatorMessages
      })

      if (hasCoordinatorMessages || hasHumanCoordinator || humanStatusDetected) {
        console.log('🚫 Interação humana detectada - não enviando para IA')
        return
      }

      if (endedStatusDetected) {
        console.log('🚫 Chat finalizado - não enviando para IA')
        return
      }

      // Se solicitou agente humano apenas em modo AI, marcar flag
      if (chatStatus === 'ai') {
        const messageContent = messageToSend.toLowerCase()
        const wantsHuman = messageContent.includes('falar com') ||
                           messageContent.includes('agente') ||
                           messageContent.includes('atendente') ||
                           messageContent.includes('pessoa') ||
                           messageContent.includes('humano') ||
                           messageContent.includes('especialista')

        if (wantsHuman) {
          await requestHumanSupport()
          return
        }
      }

      // Buscar resposta da IA apenas se ainda estiver em modo AI
      console.log('⚠️ ATENÇÃO: Enviando mensagem para IA mesmo com coordenador?', {
        chatStatus,
        coordinator_id: conversation.coordinator_id,
        status: conversation.status
      })

      const aiResponse = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          message: messageToSend
        })
      })

      if (!aiResponse.ok) {
        const payload = await aiResponse.json().catch(() => ({})) as { detail?: string; message?: string }
        const detail = payload.detail || payload.message || `HTTP ${aiResponse.status}`
        throw new Error(detail)
      }

      const aiData = await aiResponse.json() as { response?: string; fallback?: boolean; detail?: string }

      const assistantMessage: Message = {
        id: generateId(),
        content: aiData.response || 'Não foi possível gerar uma resposta automática no momento. Nossa equipe foi notificada.',
        sender_type: 'assistant',
        sender_name: 'Assistente NAF',
        is_ai_response: true,
        created_at: new Date().toISOString(),
        is_read: true
      }

      setMessages(prev => {
        const updated = [...prev, assistantMessage]
        lastMessageIdRef.current = updated.at(-1)?.id ?? null
        return updated
      })

      // Salvar resposta da IA
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          content: assistantMessage.content,
          sender_type: 'assistant',
          sender_name: 'Assistente NAF',
          is_ai_response: true
        })
      })

      if (aiData.fallback) {
        setAIFallback(true)
        if (aiData.detail) {
          console.warn('Fallback IA:', aiData.detail)
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: Message = {
        id: generateId(),
        content: '🚨 **Erro Temporário**\n\nDesculpe, ocorreu um erro temporário. Tente:\n\n• Enviar novamente sua mensagem\n• Atualizar a página\n• Entrar em contato: (48) 98461-4449\n\n*Nossa equipe está trabalhando para resolver o problema.*',
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => {
        const updated = [...prev, errorMessage]
        lastMessageIdRef.current = updated.at(-1)?.id ?? null
        return updated
      })
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

  const requestHumanSupport = async () => {
    if (!conversation) return

    try {
      const response = await fetch('/api/chat/human-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          user_id: userId
        })
      })

      const data = await response.json()
      if (data.success) {
        setRequestHumanAgent(true)
        setChatStatus('waiting_human')

        const humanRequestMessage: Message = {
          id: generateId(),
          content: `🤝 **Solicitação Enviada!**

Sua solicitação de atendimento humano foi enviada aos nossos coordenadores.

⏳ **Status:** Aguardando especialista

📞 **Alternativas:**
• Telefone: (48) 98461-4449
• Horário: Segunda a Sexta, 8h às 18h

Em breve um especialista entrará neste chat para ajudá-lo!`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          is_ai_response: false,
          created_at: new Date().toISOString(),
          is_read: true
        }

        setMessages(prev => {
          const updated = [...prev, humanRequestMessage]
          lastMessageIdRef.current = updated.at(-1)?.id ?? null
          return updated
        })
      }
    } catch (error) {
      console.error('Erro ao solicitar atendimento humano:', error)
    }
  }

  const submitFeedback = async (rating: number, comment?: string) => {
    if (!conversation) return

    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          user_id: userId,
          rating,
          feedback_text: comment,
          coordinator_id: conversation.coordinator_id
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowFeedback(false)
        // Recarregar mensagens para mostrar agradecimento
        setTimeout(() => {
          if (conversation) {
            loadMessages(conversation.id)
          }
        }, 500)
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
    }
  }

  // Sistema de cadastro profissional
  const registrationSteps = [
    {
      field: 'name',
      question: '👋 Qual é o seu nome completo?',
      placeholder: 'Ex: João Silva Santos',
      type: 'text',
      icon: User,
      validation: (value: string) => value.trim().length >= 3
    },
    {
      field: 'email',
      question: '📧 Qual é o seu melhor e-mail?',
      placeholder: 'Ex: joao@exemplo.com',
      type: 'email',
      icon: Mail,
      validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    {
      field: 'password',
      question: '🔒 Crie uma senha para acessar sua conta',
      placeholder: 'Mínimo 6 caracteres',
      type: 'password',
      icon: Eye,
      validation: (value: string) => value.length >= 6
    },
    {
      field: 'phone',
      question: '📱 Qual é o seu telefone/WhatsApp?',
      placeholder: 'Ex: (48) 99999-9999',
      type: 'tel',
      icon: Phone,
      validation: (value: string) => value.replace(/\D/g, '').length >= 10
    },
    {
      field: 'city',
      question: '🏙️ Em qual cidade você mora?',
      placeholder: 'Ex: Florianópolis',
      type: 'text',
      icon: MapPin,
      validation: (value: string) => value.trim().length >= 2
    },
    {
      field: 'occupation',
      question: '💼 Qual é a sua profissão/ocupação?',
      placeholder: 'Ex: Contador, Empresário, Estudante',
      type: 'text',
      icon: Briefcase,
      validation: (value: string) => value.trim().length >= 2
    },
    {
      field: 'service_interest',
      question: '🎯 Qual serviço tem mais interesse?',
      placeholder: 'Selecione uma opção',
      type: 'select',
      icon: CheckCircle,
      options: [
        'Declaração de Imposto de Renda',
        'Abertura de MEI',
        'Consultoria Contábil',
        'Planejamento Tributário',
        'Regularização de CPF',
        'Orientação Empresarial',
        'Outros serviços'
      ]
    }
  ]

  const startRegistration = () => {
    setShowRegistration(true)
    setRegistrationStep(0)
    setRegistrationData({})

    const welcomeMessage: Message = {
      id: generateId(),
      content: `✨ **Vamos fazer seu cadastro!**

Olá! Para oferecer o melhor atendimento personalizado, vou fazer algumas perguntas rápidas.

Todas as informações são **100% seguras** e serão usadas apenas para:
• Personalizar seu atendimento
• Salvar histórico de conversas
• Agendar consultorias
• Enviar lembretes importantes

${registrationSteps[0].question}`,
      sender_type: 'assistant',
      sender_name: 'Assistente NAF',
      is_ai_response: false,
      created_at: new Date().toISOString(),
      is_read: true
    }

    setMessages(prev => [...prev, welcomeMessage])
  }

  const handleRegistrationInput = async (value: string) => {
    const currentStep = registrationSteps[registrationStep]

    // Validar entrada
    if (currentStep.validation && !currentStep.validation(value)) {
      const errorMessage: Message = {
        id: generateId(),
        content: `❌ **Entrada inválida**

Por favor, verifique:
• ${currentStep.field === 'name' ? 'Nome deve ter pelo menos 3 caracteres' : ''}
• ${currentStep.field === 'email' ? 'E-mail deve ter formato válido (exemplo@dominio.com)' : ''}
• ${currentStep.field === 'phone' ? 'Telefone deve ter pelo menos 10 dígitos' : ''}
• ${currentStep.field === 'city' ? 'Cidade deve ter pelo menos 2 caracteres' : ''}
• ${currentStep.field === 'occupation' ? 'Profissão deve ter pelo menos 2 caracteres' : ''}

Tente novamente:`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    // Armazenar resposta
    const newData = { ...registrationData, [currentStep.field]: value }
    setRegistrationData(newData)

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: generateId(),
      content: value,
      sender_type: 'user',
      sender_name: 'Você',
      created_at: new Date().toISOString(),
      is_read: true
    }
    setMessages(prev => [...prev, userMessage])

    // Próximo passo ou finalizar
    if (registrationStep < registrationSteps.length - 1) {
      const nextStep = registrationStep + 1
      setRegistrationStep(nextStep)

      setTimeout(() => {
        const nextMessage: Message = {
          id: generateId(),
          content: `✅ **Perfeito!**

${registrationSteps[nextStep].question}`,
          sender_type: 'assistant',
          sender_name: 'Assistente NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, nextMessage])
      }, 1000)
    } else {
      // Finalizar cadastro
      await completeRegistration({ ...newData, [currentStep.field]: value })
    }
  }

  const completeRegistration = async (finalData: unknown) => {
    if (!conversation) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/user-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          ...finalData
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(true)
        setShowRegistration(false)
        setRegistrationData(finalData)

        const successMessage: Message = {
          id: generateId(),
          content: `🎉 **Cadastro concluído com sucesso!**

Olá, **${finalData.name}**! Agora posso oferecer um atendimento completamente personalizado.

**📋 Próximos passos:**
• 💬 **Conversar com especialista** - Conectamos você com um coordenador
• 📅 **Agendar consultoria** - Marque um horário presencial
• ❓ **Perguntas rápidas** - Posso responder dúvidas básicas

**🔒 Seus dados estão seguros:** Usamos criptografia de ponta e seguimos a LGPD.

Como posso ajudá-lo agora?`,
          sender_type: 'assistant',
          sender_name: 'Assistente NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }

        setMessages(prev => [...prev, successMessage])
      } else {
        throw new Error(data.error || 'Erro ao cadastrar')
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      const errorMessage: Message = {
        id: generateId(),
        content: `❌ **Erro no cadastro**

Ops! Ocorreu um problema ao salvar seus dados.

**Você pode:**
• Tentar novamente em alguns minutos
• Entrar em contato: **(48) 98461-4449**
• Continuar sem cadastro (funcionalidade limitada)

Desculpe pelo inconveniente!`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startScheduling = () => {
    if (!isRegistered) {
      const needRegistrationMessage: Message = {
        id: generateId(),
        content: `🔐 **Cadastro necessário**

Para agendar uma consultoria, você precisa estar cadastrado.

**Vantagens do cadastro:**
• Agendamento de consultorias
• Histórico de atendimentos
• Lembretes automáticos
• Atendimento personalizado

Gostaria de se cadastrar agora?`,
        sender_type: 'assistant',
        sender_name: 'Assistente NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, needRegistrationMessage])
      return
    }

    setShowScheduling(true)
    const scheduleMessage: Message = {
      id: generateId(),
      content: `📅 **Vamos agendar sua consultoria!**

Horários disponíveis:
• **Segunda a Quinta:** 8h às 17h
• **Sexta:** 8h às 16h
• **Duração:** 60 minutos
• **Local:** NAF Contábil ou Online

Clique no botão "📅 Agendar Consultoria" abaixo para escolher data e horário.`,
      sender_type: 'assistant',
      sender_name: 'Assistente NAF',
      created_at: new Date().toISOString(),
      is_read: true
    }
    setMessages(prev => [...prev, scheduleMessage])
  }

  // Função para iniciar login
  const startLogin = () => {
    setShowLogin(true)
    setLoginData({ email: '', password: '' })

    const loginMessage: Message = {
      id: generateId(),
      content: `🔐 **Acesso à sua conta**

Para acessar suas informações e histórico, faça login com suas credenciais:

• **E-mail:** Usado no cadastro
• **Senha:** Definida durante o registro
• **Benefícios:** Histórico completo de conversas e agendamentos

Preencha os campos abaixo para entrar na sua conta:`,
      sender_type: 'assistant',
      sender_name: 'Sistema NAF',
      is_ai_response: false,
      created_at: new Date().toISOString(),
      is_read: true
    }

    setMessages(prev => [...prev, loginMessage])
  }

  // Função para processar login
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      const errorMessage: Message = {
        id: generateId(),
        content: `❌ **Campos obrigatórios**

Por favor, preencha:
• E-mail
• Senha

Tente novamente com suas credenciais corretas.`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    try {
      const response = await fetch('/api/chat/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsLoggedIn(true)
        setLoggedUser(result.user)
        setShowLogin(false)

        const successMessage: Message = {
          id: generateId(),
          content: `✅ **Login realizado com sucesso!**

Bem-vindo(a) de volta, **${result.user.name}**!

🎯 **Agora você pode:**
• Ver histórico de conversas
• Acessar histórico de agendamentos
• Solicitar atendimento personalizado
• Acompanhar status dos seus atendimentos

**Coordenador atual:** ${result.user.assigned_coordinator || 'A ser designado'}
**Estudante atual:** ${result.user.assigned_student || 'A ser designado'}

Use os botões abaixo para navegar:`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, successMessage])
      } else {
        const errorMessage: Message = {
          id: generateId(),
          content: `❌ **Erro no login**

${result.message || 'E-mail ou senha incorretos'}

**Verifique:**
• E-mail digitado corretamente
• Senha correta
• Conta já foi criada anteriormente

**Precisa de ajuda?**
• Telefone: (48) 98461-4449
• Criar nova conta se necessário`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Erro no login:', error)
      const errorMessage: Message = {
        id: generateId(),
        content: `🚨 **Erro temporário**

Não foi possível fazer login no momento.

**Tente:**
• Verificar sua conexão com a internet
• Tentar novamente em alguns minutos
• Entrar em contato: (48) 98461-4449`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Função para carregar histórico
  const loadHistory = async (type: 'appointments' | 'conversations') => {
    if (!isLoggedIn || !loggedUser) return

    try {
      const endpoint = type === 'appointments'
        ? '/api/chat/appointment-history'
        : '/api/chat/conversation-history'

      const response = await fetch(`${endpoint}?user_id=${loggedUser.id}`)
      const data = await response.json()

      if (response.ok) {
        if (type === 'appointments') {
          setAppointmentHistory(data.appointments || [])
        } else {
          setConversationHistory(data.conversations || [])
        }

        setHistoryType(type)
        setShowHistory(true)

        const historyMessage: Message = {
          id: generateId(),
          content: `📋 **${type === 'appointments' ? 'Histórico de Agendamentos' : 'Histórico de Conversas'}**

${type === 'appointments'
  ? `Total de agendamentos: **${data.appointments?.length || 0}**

${data.appointments?.map((apt: unknown, index: number) =>
  `**${index + 1}.** ${apt.service_title}
  📅 ${apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('pt-BR') : 'Data a confirmar'}
  👨‍💼 Coordenador: ${apt.coordinator_name || 'A ser designado'}
  👨‍🎓 Estudante: ${apt.student_name || 'A ser designado'}
  📊 Status: ${apt.status}
  ${apt.transferred_from ? `🔄 Transferido de: ${apt.transferred_from}` : ''}
  `).join('\n') || 'Nenhum agendamento encontrado'}`
  : `Total de conversas: **${data.conversations?.length || 0}**

${data.conversations?.map((conv: unknown, index: number) =>
  `**${index + 1}.** Conversa #${conv.id.slice(0, 8)}
  📅 ${new Date(conv.started_at).toLocaleDateString('pt-BR')} às ${new Date(conv.started_at).toLocaleTimeString('pt-BR')}
  👨‍💼 Coordenador: ${conv.coordinator_name || 'A ser designado'}
  👨‍🎓 Estudante: ${conv.student_name || 'A ser designado'}
  📊 Status: ${conv.status}
  💬 Mensagens: ${conv.message_count || 0}
  ${conv.transferred_from ? `🔄 Transferido de: ${conv.transferred_from}` : ''}
  `).join('\n') || 'Nenhuma conversa encontrada'}`
}

Use os botões abaixo para alternar entre os tipos de histórico:`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, historyMessage])
      }
    } catch (error) {
      console.error(`Erro ao carregar ${type}:`, error)
      const errorMessage: Message = {
        id: generateId(),
        content: `❌ **Erro ao carregar ${type === 'appointments' ? 'agendamentos' : 'conversas'}**

Não foi possível carregar seu histórico no momento.

**Tente novamente ou entre em contato:**
📞 (48) 98461-4449`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Função para iniciar transferência
  const startTransfer = async () => {
    if (!isLoggedIn || !loggedUser || !conversation) return

    try {
      // Buscar atendentes disponíveis do banco de dados
      const response = await fetch('/api/chat/available-attendants?type=all')
      const data = await response.json()

      if (data.success && data.attendants) {
        // Filtrar apenas atendentes disponíveis
        const availableOnly = data.attendants.filter((att: any) => att.available)

        if (availableOnly.length === 0) {
          const noAttendantsMessage: Message = {
            id: generateId(),
            content: `⚠️ **Nenhum atendente disponível no momento**

Todos os nossos atendentes estão ocupados no momento.

**Alternativas:**
• Aguarde alguns minutos e tente novamente
• Continue com o atendimento atual
• Ligue: (48) 98461-4449

Tente novamente em alguns instantes.`,
            sender_type: 'assistant',
            sender_name: 'Sistema NAF',
            created_at: new Date().toISOString(),
            is_read: true
          }
          setMessages(prev => [...prev, noAttendantsMessage])
          return
        }

        setAvailableAttendants(availableOnly)
        setShowTransferModal(true)

        const transferMessage: Message = {
          id: generateId(),
          content: `🔄 **Solicitar Transferência**

Encontramos **${availableOnly.length} atendente(s) disponível(is)** para transferência:

• **Coordenadores:** Questões complexas, supervisão, casos especializados
• **Estudantes:** Atendimento especializado por área de conhecimento

**${data.available_count} atendente(s) disponível(is) agora**

Selecione o tipo de atendente e o motivo da transferência no formulário que apareceu.`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, transferMessage])
      } else {
        throw new Error('Erro ao buscar atendentes')
      }

    } catch (error) {
      console.error('Erro ao iniciar transferência:', error)

      const errorMessage: Message = {
        id: generateId(),
        content: `❌ **Erro ao buscar atendentes**

Não foi possível carregar a lista de atendentes disponíveis.

**Tente:**
• Atualizar a página
• Tentar novamente em alguns minutos
• Entrar em contato: (48) 98461-4449`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Função para processar transferência
  const handleTransfer = async () => {
    if (!selectedAttendant || !transferData.reason || !conversation) return

    try {
      const attendant = availableAttendants.find(att => att.id === selectedAttendant)
      if (!attendant) return

      const response = await fetch('/api/chat/transfer-attendant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: conversation.id,
          from_user_id: loggedUser?.id || userId,
          from_user_type: 'client',
          from_user_name: loggedUser?.name || 'Cliente',
          to_user_id: attendant.id,
          to_user_type: attendant.type,
          to_user_name: attendant.name,
          transfer_reason: transferData.reason,
          transfer_notes: transferData.notes
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setShowTransferModal(false)
        setCurrentSession(result.session)

        const successMessage: Message = {
          id: generateId(),
          content: `✅ **Transferência Solicitada!**

Sua solicitação foi enviada para **${attendant.name}** (${attendant.type === 'coordinator' ? 'Coordenador' : 'Estudante'}).

📝 **Motivo:** ${transferData.reason}
${transferData.notes ? `📋 **Observações:** ${transferData.notes}` : ''}

⏳ **Status:** Aguardando aceitação
🕐 **Tempo estimado:** 5-15 minutos

Em breve você será conectado ao novo atendente!`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, successMessage])

        // Reset form
        setTransferData({ reason: '', notes: '', to_user_type: 'coordinator' })
        setSelectedAttendant('')
      } else {
        const errorMessage: Message = {
          id: generateId(),
          content: `❌ **Erro na transferência**

${result.message || 'Não foi possível processar a transferência'}

**Tente:**
• Verificar se selecionou um atendente
• Tentar novamente em alguns minutos
• Entrar em contato: (48) 98461-4449`,
          sender_type: 'assistant',
          sender_name: 'Sistema NAF',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Erro na transferência:', error)
      const errorMessage: Message = {
        id: generateId(),
        content: `🚨 **Erro temporário**

Não foi possível processar a transferência no momento.

**Entre em contato diretamente:**
📞 (48) 98461-4449`,
        sender_type: 'assistant',
        sender_name: 'Sistema NAF',
        created_at: new Date().toISOString(),
        is_read: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}&t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.messages) {
        const fetchedMessages: Message[] = data.messages
        setMessages(fetchedMessages)
        lastMessageIdRef.current = fetchedMessages.at(-1)?.id ?? null

        // Verificar se há mensagens de coordenador
        const hasCoordinatorMessages = fetchedMessages.some(
          (msg) => msg.sender_type === 'coordinator'
        )

        if (hasCoordinatorMessages && chatStatus !== 'active_human' && chatStatus !== 'ended') {
          setChatStatus('active_human')
          setRequestHumanAgent(false)
        }

        // Verificar se o chat foi finalizado
        const hasFinalMessage = fetchedMessages.some(
          (msg) => msg.content.includes('Chat finalizado') || msg.content.includes('**Por favor, avalie nosso atendimento:**')
        )

        if (hasFinalMessage && chatStatus !== 'ended') {
          setChatStatus('ended')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const checkConversationStatus = async () => {
    if (!conversation) return null

    try {
      const response = await fetch(`/api/chat/conversations?user_id=${userId}&t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.conversation) {
        const conv = data.conversation

        console.log('🔄 DEBUG - Status check response:', {
          old_status: chatStatus,
          new_status: conv.status,
          old_coordinator: conversation.coordinator_id,
          new_coordinator: conv.coordinator_id,
          chat_accepted_by: conv.chat_accepted_by
        })

        // Atualizar dados da conversa
        setConversation(prev => ({
          ...prev!,
          ...conv
        }))

        // Atualizar status baseado no status da conversa
        if (conv.status === 'ended' && chatStatus !== 'ended') {
          console.log('🔄 Mudança para ENDED')
          setChatStatus('ended')
          loadMessages(conversation.id) // Carregar mensagens finais
        } else if (conv.status === 'active_human' && chatStatus !== 'active_human') {
          console.log('🔄 Mudança para ACTIVE_HUMAN')
          setChatStatus('active_human')
          setRequestHumanAgent(false)
          loadMessages(conversation.id) // Carregar mensagens do coordenador
        } else if (conv.chat_accepted_by && conv.coordinator_id && chatStatus !== 'active_human') {
          // Se foi aceito por um coordenador, considerar como ativo mesmo que status não esteja atualizado
          console.log('🔄 Coordenador aceitou chat - mudando para ACTIVE_HUMAN')
          setChatStatus('active_human')
          setRequestHumanAgent(false)
          loadMessages(conversation.id) // Carregar mensagens do coordenador
        } else if (conv.status === 'waiting_human' && chatStatus !== 'waiting_human' && !conv.chat_accepted_by) {
          // Só mostrar como waiting se realmente não foi aceito por ninguém
          setChatStatus('waiting_human')
        }

        return conv
      }
    } catch (error) {
      console.error('Erro ao verificar status da conversa:', error)
    }

    return null
  }

  // Função otimizada para carregar apenas mensagens novas
  const loadNewMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}&t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.messages) {
        const fetchedMessages: Message[] = data.messages
        const latestMessageId = fetchedMessages.at(-1)?.id ?? null

        console.log('🔄 DEBUG - loadNewMessages:', {
          previousLastId: lastMessageIdRef.current,
          latestMessageId,
          hasCoordinator: conversation?.coordinator_id
        })

        if (!lastMessageIdRef.current && fetchedMessages.length > 0) {
          console.log('📨 Inicializando mensagens a partir do servidor')
          setMessages(fetchedMessages)
          lastMessageIdRef.current = latestMessageId

          const hasCoordinatorMessages = fetchedMessages.some(
            (msg) => msg.sender_type === 'coordinator'
          )

          if (hasCoordinatorMessages && chatStatus !== 'active_human' && chatStatus !== 'ended') {
            setChatStatus('active_human')
            setRequestHumanAgent(false)
          }

          const hasFinalMessage = fetchedMessages.some(
            (msg) => msg.content.includes('Chat finalizado') || msg.content.includes('**Por favor, avalie nosso atendimento:**')
          )

          if (hasFinalMessage && chatStatus !== 'ended') {
            setChatStatus('ended')
          }
        } else if (latestMessageId && latestMessageId !== lastMessageIdRef.current) {
          console.log('📨 Nova mensagem detectada - atualizando lista')
          setMessages(fetchedMessages)
          lastMessageIdRef.current = latestMessageId

          const hasCoordinatorMessages = fetchedMessages.some(
            (msg) => msg.sender_type === 'coordinator'
          )

          if (hasCoordinatorMessages && chatStatus !== 'active_human' && chatStatus !== 'ended') {
            setChatStatus('active_human')
            setRequestHumanAgent(false)
          }

          const hasFinalMessage = fetchedMessages.some(
            (msg) => msg.content.includes('Chat finalizado') || msg.content.includes('**Por favor, avalie nosso atendimento:**')
          )

          if (hasFinalMessage && chatStatus !== 'ended') {
            setChatStatus('ended')
          }
        } else if (!latestMessageId && fetchedMessages.length === 0) {
          setMessages([])
          lastMessageIdRef.current = null
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens novas:', error)
    }
  }

  // Polling para verificar mudanças de status e novas mensagens
  useEffect(() => {
    if (!conversation) return

    const interval = setInterval(() => {
      if (chatStatus === 'ai') {
        // Verificar apenas status quando em modo AI
        checkConversationStatus()
      } else if (chatStatus === 'waiting_human') {
        // Verificar se coordenador aceitou
        checkConversationStatus()
      } else if (chatStatus === 'active_human' || conversation.coordinator_id) {
        // Verificar novas mensagens com mais frequência quando há coordenador
        loadNewMessages(conversation.id)
        // Também verificar mudanças de status
        checkConversationStatus()
      }
    }, chatStatus === 'active_human' || conversation.coordinator_id ? 2000 : 6000) // 2s para chat humano, 6s para outros

    return () => clearInterval(interval)
  }, [conversation, chatStatus])

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
      setIsMinimized(false)
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const maximizeChat = () => {
    setIsMinimized(false)
  }

  // Only render if user has valid token or is logged in
  if (!tokenValidated && !isLoggedIn) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`w-[480px] max-w-[95vw] shadow-2xl transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[650px] max-h-[85vh]'
        }`}>
          <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-white dark:bg-gray-950 dark:bg-gray-950/20 p-2 rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Chat NAF</CardTitle>
                  <p className="text-xs opacity-90">
                    {chatStatus === 'active_human' && conversation?.coordinator_name
                      ? conversation.coordinator_name
                      : chatStatus === 'waiting_human'
                      ? 'Aguardando especialista...'
                      : 'Assistente Virtual'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isMinimized ? maximizeChat : minimizeChat}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[570px] max-h-[calc(85vh-80px)]">
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.sender_type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.sender_type === 'coordinator'
                            ? 'bg-green-100 text-green-900 border border-green-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender_type === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : message.sender_type === 'coordinator' ? (
                            <User className="h-3 w-3 text-green-600" />
                          ) : (
                            <Bot className="h-3 w-3 text-blue-600" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.sender_name}
                          </span>
                          {message.sender_type === 'coordinator' && (
                            <Badge variant="outline" className="text-xs">
                              Especialista
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-50 mt-1">
                          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg p-3 max-w-[85%]">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600">Digitando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div aria-hidden />
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                    disabled={isLoading || chatStatus === 'ended'}
                  />
                  {chatStatus !== 'ended' && (
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex flex-wrap gap-2">
                    {!isRegistered && !showRegistration && !isLoggedIn && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startRegistration}
                          className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 text-blue-700 border-blue-200"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Fazer Cadastro
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startLogin}
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Fazer Login
                        </Button>
                      </>
                    )}
                    {(isRegistered || isLoggedIn) && chatStatus === 'ai' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={requestHumanSupport}
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <User className="h-3 w-3 mr-1" />
                          Falar com especialista
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startScheduling}
                          className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Agendar Consultoria
                        </Button>
                      </>
                    )}
                    {isLoggedIn && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadHistory('conversations')}
                          className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Histórico
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadHistory('appointments')}
                          className="text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Agendamentos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startTransfer}
                          className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Transferir
                        </Button>
                      </>
                    )}
                    {!isLoggedIn && !isRegistered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => window.open('tel:+5548984614449')}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        (48) 98461-4449
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {chatStatus === 'waiting_human' && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600">
                        Aguardando especialista
                      </Badge>
                    )}
                    {chatStatus === 'active_human' && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                        {conversation?.coordinator_name ? `${conversation.coordinator_name} online` : 'Coordenador online'}
                      </Badge>
                    )}
                    {chatStatus === 'ended' && (
                      <Button
                        size="sm"
                        onClick={() => setShowFeedback(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        ⭐ Avaliar atendimento
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Modal de Feedback */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Avalie nosso atendimento</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Como você avalia o atendimento recebido?</p>

            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedback(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => submitFeedback(feedbackRating)}
                disabled={feedbackRating === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Enviar Avaliação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">🔐 Login NAF</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogin(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowLogin(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleLogin}
                disabled={!loginData.email || !loginData.password}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Entrar
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLogin(false)
                  startRegistration()
                }}
                className="text-xs text-gray-600"
              >
                Não tem conta? Fazer cadastro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {showHistory && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                📋 {historyType === 'appointments' ? 'Histórico de Agendamentos' : 'Histórico de Conversas'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex space-x-2 mb-4">
              <Button
                variant={historyType === 'conversations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => loadHistory('conversations')}
                className="flex-1"
              >
                <History className="h-4 w-4 mr-2" />
                Conversas
              </Button>
              <Button
                variant={historyType === 'appointments' ? 'default' : 'outline'}
                size="sm"
                onClick={() => loadHistory('appointments')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Agendamentos
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyType === 'appointments' ? (
                <div className="space-y-3">
                  {appointmentHistory.length > 0 ? (
                    appointmentHistory.map((apt: unknown, index: number) => (
                      <div key={apt.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{apt.service_title}</h4>
                          <Badge className={
                            apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>📅 Data: {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('pt-BR') : 'A confirmar'}</p>
                          <p>👨‍💼 Coordenador: {apt.coordinator_name || 'A ser designado'}</p>
                          <p>👨‍🎓 Estudante: {apt.student_name || 'A ser designado'}</p>
                          {apt.transferred_from && (
                            <p>🔄 Transferido de: {apt.transferred_from}</p>
                          )}
                          {apt.notes && (
                            <p>📝 Observações: {apt.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum agendamento encontrado</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {conversationHistory.length > 0 ? (
                    conversationHistory.map((conv: unknown, index: number) => (
                      <div key={conv.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">Conversa #{conv.id.slice(0, 8)}</h4>
                          <Badge className={
                            conv.status === 'active' ? 'bg-green-100 text-green-800' :
                            conv.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {conv.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>📅 Iniciada: {new Date(conv.started_at).toLocaleDateString('pt-BR')} às {new Date(conv.started_at).toLocaleTimeString('pt-BR')}</p>
                          {conv.ended_at && (
                            <p>🏁 Finalizada: {new Date(conv.ended_at).toLocaleDateString('pt-BR')} às {new Date(conv.ended_at).toLocaleTimeString('pt-BR')}</p>
                          )}
                          <p>👨‍💼 Coordenador: {conv.coordinator_name || 'A ser designado'}</p>
                          <p>👨‍🎓 Estudante: {conv.student_name || 'A ser designado'}</p>
                          <p>💬 Mensagens: {conv.message_count || 0}</p>
                          {conv.transferred_from && (
                            <p>🔄 Transferido de: {conv.transferred_from}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => setShowHistory(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">🔄 Transferir Atendimento</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTransferModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Atendente
                </label>
                <select
                  value={transferData.to_user_type}
                  onChange={(e) => {
                    setTransferData(prev => ({ ...prev, to_user_type: e.target.value }))
                    setSelectedAttendant('')
                  }}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
                >
                  <option value="coordinator">Coordenador</option>
                  <option value="student">Estudante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selecionar Atendente
                </label>
                <select
                  value={selectedAttendant}
                  onChange={(e) => setSelectedAttendant(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
                >
                  <option value="">Escolha um atendente</option>
                  {availableAttendants
                    .filter(att => att.type === transferData.to_user_type)
                    .map(attendant => (
                      <option key={attendant.id} value={attendant.id}>
                        {attendant.name} {attendant.available ? '🟢' : '🔴'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo da Transferência *
                </label>
                <select
                  value={transferData.reason}
                  onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
                >
                  <option value="">Selecione o motivo</option>
                  <option value="Questão complexa">Questão complexa</option>
                  <option value="Necessita supervisão">Necessita supervisão</option>
                  <option value="Área específica">Área específica de conhecimento</option>
                  <option value="Preferência pessoal">Preferência pessoal</option>
                  <option value="Disponibilidade">Questão de disponibilidade</option>
                  <option value="Outro">Outro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={transferData.notes}
                  onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalhes adicionais sobre a transferência..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!selectedAttendant || !transferData.reason}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Solicitar Transferência
              </Button>
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
              💡 <strong>Dica:</strong> A transferência será enviada ao atendente selecionado. Você receberá uma confirmação quando for aceita.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
