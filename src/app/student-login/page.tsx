'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, BookOpen, Mail, ArrowLeft, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import studentSession from '@/lib/studentSession'
import { loadTurnstile, ensureHuman, TURNSTILE_SITE_KEY } from '@/lib/turnstile-client'

export default function StudentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()


  useEffect(() => { loadTurnstile(); }, [])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const __h = await ensureHuman(); if (!__h.ok) { setError(__h.reason || 'Verificação anti-robô falhou.'); setLoading(false); return; }

    try {
      const response = await fetch('/api/students/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar sessão do estudante no storage assíncrono
        await studentSession.save(data.token, data.student)

        // Redirecionar para o portal
        router.push('/student-portal')
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro durante login do estudante:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Verificar se já está logado
  useEffect(() => {
    let cancelled = false

    const checkExistingSession = async () => {
      const token = await studentSession.getToken()
      if (token && !cancelled) {
        router.push('/student-portal')
      }
    }

    checkExistingSession()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com botão voltar */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="space-y-4 pb-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-800">
                Portal do Estudante
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 dark:bg-gray-900 dark:border-gray-800">
                Acesse seu portal NAF para gerenciar atendimentos e treinamentos
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 dark:bg-gray-900 dark:border-gray-800">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@estudante.edu.br"
                    className="pl-10 h-12 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {TURNSTILE_SITE_KEY && (

                <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" data-language="pt-br" data-size="flexible" />

              )}


              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Acessar Portal'
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500">
                  Ainda não tem uma conta?
                </p>
                <Link href="/student-register">
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Criar Conta de Estudante
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Sistema seguro e criptografado
                </p>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Seus dados estão protegidos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer informativo */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            NAF - Portal do Estudante
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Núcleo de Apoio Contábil e Fiscal
          </p>
        </div>

        {/* Credenciais de teste para desenvolvimento */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            Contas de Teste Disponíveis:
          </h4>
          <div className="space-y-2 text-xs text-amber-700">
            <div>
              <strong>Ana Santos:</strong> ana.santos@estudante.edu.br
            </div>
            <div>
              <strong>João Silva:</strong> joao.silva@estudante.edu.br
            </div>
            <div>
              <strong>Maria Costa:</strong> maria.costa@estudante.edu.br
            </div>
            <div className="mt-2 pt-2 border-t border-amber-300">
              <strong>Senha padrão:</strong> 123456 (para todas as contas)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
