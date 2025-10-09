'use client'

import React, { useState, useEffect } from 'react'
import Chatbot from './Chatbot'
import FloatingChatButton from './FloatingChatButton'
import { useChatbot } from './useChatbot'

interface ChatbotWrapperProps {
  enabled?: boolean
  autoShow?: boolean
  welcomeDelay?: number
}

export default function ChatbotWrapper({
  enabled = true,
  autoShow = false,
  welcomeDelay = 10000 // 10 segundos
}: ChatbotWrapperProps) {
  const { state, openChatbot, closeChatbot, markUnreadMessages } = useChatbot()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    // Auto-mostrar chatbot após delay (útil para páginas específicas)
    if (autoShow && !hasShownWelcome && enabled) {
      const timer = setTimeout(() => {
        openChatbot()
        setHasShownWelcome(true)
      }, welcomeDelay)

      return () => clearTimeout(timer)
    }
  }, [autoShow, hasShownWelcome, enabled, welcomeDelay, openChatbot])

  useEffect(() => {
    // Simulação de mensagens não lidas (em produção viria do WebSocket/API)
    const interval = setInterval(() => {
      if (!state.isOpen && Math.random() > 0.95) { // 5% de chance a cada intervalo
        markUnreadMessages()
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => clearInterval(interval)
  }, [state.isOpen, markUnreadMessages])

  if (!enabled) return null

  return (
    <>
      <FloatingChatButton
        onOpenChat={openChatbot}
        hasUnreadMessages={state.hasUnreadMessages}
      />
      
      <Chatbot
        isOpen={state.isOpen}
        onClose={closeChatbot}
      />
    </>
  )
}
