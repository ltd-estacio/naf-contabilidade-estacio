'use client'

import { useState, useCallback } from 'react'

export interface ChatbotState {
  isOpen: boolean
  isMinimized: boolean
  hasUnreadMessages: boolean
  lastActivity: Date | null
}

export const useChatbot = () => {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    isMinimized: false,
    hasUnreadMessages: false,
    lastActivity: null
  })

  const openChatbot = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      hasUnreadMessages: false,
      lastActivity: new Date()
    }))
  }, [])

  const closeChatbot = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false
    }))
  }, [])

  const minimizeChatbot = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: true
    }))
  }, [])

  const maximizeChatbot = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: false,
      hasUnreadMessages: false
    }))
  }, [])

  const markUnreadMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasUnreadMessages: !prev.isOpen
    }))
  }, [])

  const updateActivity = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastActivity: new Date()
    }))
  }, [])

  return {
    state,
    openChatbot,
    closeChatbot,
    minimizeChatbot,
    maximizeChatbot,
    markUnreadMessages,
    updateActivity
  }
}
