import type { Metadata } from 'next'
import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import ScrollToTop from '@/components/ScrollToTop'
import ChatWidget from '@/components/chat/ChatWidget'
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <ChunkErrorHandler />
          <div className="min-h-screen flex flex-col">
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
