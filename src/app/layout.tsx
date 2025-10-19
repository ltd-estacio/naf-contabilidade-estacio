import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { Providers } from '@/components/providers'
import ScrollToTop from '@/components/ScrollToTop'
import ChatWidget from '@/components/chat/ChatWidget'
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler'

export const metadata: Metadata = {
  title: 'NAF - Núcleo de Apoio Contábil Fiscal',
  description: 'Sistema de gestão e atendimento do Núcleo de Apoio Contábil Fiscal. Oferecemos orientação gratuita em questões fiscais e contábeis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <ChunkErrorHandler />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
          <ChatWidget />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
