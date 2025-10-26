'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSchedule() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Teste de Agendamento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Página de testes para funcionalidades de agendamento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Sistema</CardTitle>
              <CardDescription>Validação de agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sistema de testes funcionando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navegação</CardTitle>
              <CardDescription>Links relacionados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/schedule" className="block text-blue-600 hover:underline text-sm">
                  Agendamentos
                </Link>
                <Link href="/test" className="block text-blue-600 hover:underline text-sm">
                  Testes
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
