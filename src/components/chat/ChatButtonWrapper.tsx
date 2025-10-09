'use client'

import React, { useState, useEffect } from 'react'
import { useShouldShowChat, useChatLink } from '@/hooks/useChatLink'

interface ChatButtonWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper para o botão do chat que controla sua visibilidade baseado em um link de acesso.
 * O botão só será exibido se:
 * 1. O usuário acessou via um link válido gerado por um estudante
 * 2. O link está ativo, não expirou e não atingiu o limite de usos
 *
 * Uso:
 * <ChatButtonWrapper>
 *   <button>Chat NAF</button>
 * </ChatButtonWrapper>
 */
export function ChatButtonWrapper({ children, className }: ChatButtonWrapperProps) {
  const shouldShow = useShouldShowChat()
  const { linkData, registerUsage } = useChatLink()

  // Estado para controlar se já registramos o uso deste link nesta sessão
  const [usageRegistered, setUsageRegistered] = useState(false)

  useEffect(() => {
    // Registrar o acesso ao link (apenas uma vez por sessão)
    if (shouldShow && linkData && !usageRegistered) {
      // Aguardar um pouco antes de registrar para garantir que não é um bot
      const timer = setTimeout(() => {
        registerUsage()
        setUsageRegistered(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [shouldShow, linkData, usageRegistered])

  // Se não deve mostrar, não renderizar nada
  if (!shouldShow) {
    return null
  }

  // Renderizar o botão do chat com animação de entrada
  return (
    <div
      className={`chat-button-wrapper ${className || ''}`}
      style={{
        animation: 'fadeInUp 0.5s ease-out'
      }}
    >
      {children}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Componente de badge opcional que mostra quem criou o link
 */
export function ChatLinkBadge() {
  const { linkData } = useChatLink()

  if (!linkData) return null

  return (
    <div className="text-xs text-gray-500 mt-2 px-2">
      Atendimento por: <span className="font-medium">{linkData.studentName}</span>
    </div>
  )
}

export default ChatButtonWrapper
