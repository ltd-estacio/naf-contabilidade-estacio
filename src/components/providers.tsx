'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import UserOnboarding from './UserOnboarding'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <UserOnboarding />
    </SessionProvider>
  )
}
