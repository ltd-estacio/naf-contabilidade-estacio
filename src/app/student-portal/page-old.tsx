'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StudentPortalLegacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full shadow-lg border-gray-200 dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            Portal do Estudante (Versão Legada)
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Este layout antigo foi mantido apenas para referência histórica. Utilize o novo portal do estudante para acessar todas as funcionalidades atualizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            O novo portal oferece painéis de desempenho, controle de atendimentos e acompanhamentos de treinamentos com dados reais. Caso precise consultar ou migrar alguma informação, fale com a equipe NAF.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/student-portal">
              <Button>Ir para o novo portal</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Voltar ao início</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
