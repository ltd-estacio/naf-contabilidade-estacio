'use client'

import React from 'react'
import NAFChatWidget from './NAFChatWidget'

interface ChatWithRegistrationProps {
  appointmentId?: number
  protocol?: string
  serviceTitle?: string
}

export default function ChatWithRegistration({
  appointmentId,
  protocol,
  serviceTitle
}: ChatWithRegistrationProps) {
  return (
    <div className="min-h-screen relative">
      <NAFChatWidget
        appointmentId={appointmentId}
        protocol={protocol}
        serviceTitle={serviceTitle}
      />
    </div>
  )
}
