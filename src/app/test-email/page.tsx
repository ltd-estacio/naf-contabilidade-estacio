'use client'

import React, { useState } from 'react'
import { sendAppointmentConfirmationEmail } from '@/lib/emailjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    console.log('🧪 Iniciando teste de email...')
    console.log('Email:', email)
    console.log('Nome:', name)

    try {
      const emailResult = await sendAppointmentConfirmationEmail({
        protocol: 'FAP-TEST-20251003',
        clientName: name,
        clientEmail: email,
        clientPhone: '(48) 98461-4449',
        serviceType: 'Declaração de Imposto de Renda - TESTE',
        clientCategory: 'Pessoa Física Hipossuficiente',
        preferredDate: 'sexta-feira, 3 de outubro de 2025',
        preferredTime: '14:00',
        modality: 'Presencial'
      })

      console.log('Resultado:', emailResult)
      setResult(emailResult)
    } catch (error) {
      console.error('Erro no teste:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste de Envio de Email - EmailJS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="test-email" className="block text-sm font-medium mb-2">Email de Teste</label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="test-name" className="block text-sm font-medium mb-2">Nome de Teste</label>
              <Input
                id="test-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome"
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={loading || !email || !name}
              className="w-full"
            >
              {loading ? 'Enviando...' : 'Enviar Email de Teste'}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <h3 className={`font-bold mb-2 ${
                  result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.success ? '✅ Sucesso!' : '❌ Erro!'}
                </h3>
                <pre className="text-xs overflow-auto bg-black/5 dark:bg-white/5 p-3 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📝 Instruções:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Digite seu email real</li>
                <li>Digite seu nome</li>
                <li>Clique em &ldquo;Enviar Email de Teste&rdquo;</li>
                <li><strong>IMPORTANTE: Abra o Console (F12 → Console)</strong> para ver logs detalhados</li>
                <li>Verifique sua caixa de entrada (pode ir para spam)</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold mb-2">🔍 Possíveis Erros:</h4>
              <ul className="space-y-2 text-xs">
                <li>❌ <strong>&ldquo;Template not found&rdquo;</strong> - Template ID incorreto ou não existe</li>
                <li>❌ <strong>&ldquo;Service not found&rdquo;</strong> - Service ID incorreto</li>
                <li>❌ <strong>&ldquo;Invalid public key&rdquo;</strong> - Public Key incorreta</li>
                <li>❌ <strong>&ldquo;Failed to send email&rdquo;</strong> - Verifique se configurou o template no EmailJS</li>
                <li>❌ <strong>CORS error</strong> - Domínio não autorizado no EmailJS</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold mb-2">⚠️ Configurações do EmailJS:</h4>
              <ul className="space-y-1 font-mono text-xs">
                <li>Service ID: service_xehr3ta</li>
                <li>Template ID: template_ofyjueh</li>
                <li>Public Key: nGm0I7osOMW7psoqF</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
