'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Detectar scroll para mostrar/esconder o botão
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  // Função para rolar suavemente para o topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
                 bg-blue-600 hover:bg-blue-700
                 text-white p-4 rounded-full shadow-lg hover:shadow-xl
                 transition-all duration-300 ease-in-out
                 hover:scale-110 active:scale-95
                 border-2 border-blue-500
                 animate-pulse hover:animate-none
                 backdrop-blur-sm bg-opacity-90"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ChevronUp className="h-6 w-6 stroke-2" />
    </button>
  )
}