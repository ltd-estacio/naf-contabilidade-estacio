import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CoordinatorClient from './coordinator-client'

export const metadata: Metadata = {
  title: 'Dashboard do Coordenador - NAF Contábil',
  description: 'Relatórios, análises e Power BI para coordenadores do NAF',
}

export default async function CoordenadorPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'COORDINATOR') {
    redirect('/login')
  }

  return <CoordinatorClient session={session} />
}
