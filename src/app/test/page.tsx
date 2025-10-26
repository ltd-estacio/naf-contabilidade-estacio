'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Test() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Área de Testes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Testes e validações do sistema NAF
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Testes de Sistema</CardTitle>
              <CardDescription>Validação dos componentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sistema funcionando corretamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navegação</CardTitle>
              <CardDescription>Links para outras páginas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-blue-600 hover:underline text-sm">
                  Dashboard
                </Link>
                <Link href="/monitor" className="block text-blue-600 hover:underline text-sm">
                  Monitor
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
