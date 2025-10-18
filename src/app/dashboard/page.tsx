// Versão simplificada para evitar erros de build
'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard NAF Contábil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistema de gestão do Núcleo de Apoio Contábil e Fiscal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
              <CardDescription>Gestão de serviços do NAF</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acesse a gestão completa dos serviços oferecidos
              </p>
              <Link href="/services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver serviços →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>Sistema de agendamento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie agendamentos e atendimentos
              </p>
              <Link href="/schedule" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver agendamentos →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Relatórios e estatísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize relatórios do sistema
              </p>
              <Link href="/monitor" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver relatórios →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
