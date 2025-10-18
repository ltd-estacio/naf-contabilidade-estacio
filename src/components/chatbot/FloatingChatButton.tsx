'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

interface FloatingChatButtonProps {
  onOpenChat: () => void
  hasUnreadMessages?: boolean
}

export default function FloatingChatButton({ 
  onOpenChat, 
  hasUnreadMessages = false 
}: FloatingChatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Mostrar o botão após 3 segundos na página
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animar quando há mensagens não lidas
    if (hasUnreadMessages) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasUnreadMessages])

  const handleClick = () => {
    onOpenChat()
    setIsAnimating(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Indicador de mensagens não lidas */}
        {hasUnreadMessages && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
            <span className="text-white text-xs font-bold">!</span>
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}

        {/* Botão principal */}
        <Button
          onClick={handleClick}
          className={`
            w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
            bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
            border-2 border-white
            ${isAnimating ? 'animate-bounce' : ''}
            ${hasUnreadMessages ? 'ring-4 ring-red-200' : ''}
          `}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl">🤖</span>
          </div>
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            {hasUnreadMessages ? 'Nova mensagem! Clique para ver' : 'Assistente Virtual NAF'}
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>

        {/* Anel de pulsação para chamar atenção */}
        <div className={`
          absolute inset-0 rounded-full border-2 border-blue-400
          ${isAnimating ? 'animate-ping' : 'hidden'}
        `}></div>
      </div>

      {/* Balão de introdução (aparece apenas na primeira visita) */}
      <div className="absolute bottom-20 right-0 w-64 opacity-0 animate-fade-in-delayed">
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Precisa de ajuda?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Sou o assistente virtual do NAF! Posso esclarecer dúvidas sobre 
                MEI, Imposto de Renda, CPF/CNPJ e muito mais.
              </p>
              <Button 
                size="sm" 
                className="mt-2 text-xs" 
                onClick={handleClick}
              >
                Começar conversa
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 right-6 w-4 h-4 bg-white dark:bg-gray-950 border-r border-b border-gray-200 dark:border-gray-800 transform rotate-45 translate-y-2"></div>
        </div>
      </div>
    </div>
  )
}

// CSS adicional para animações personalizadas
const styles = `
  @keyframes fade-in-delayed {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in-delayed {
    animation: fade-in-delayed 0.5s ease-out 5s forwards;
  }
`

// Injetar estilos no head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
