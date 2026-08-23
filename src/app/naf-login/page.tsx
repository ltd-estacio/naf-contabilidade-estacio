'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, Building2 } from "lucide-react"
import { loadTurnstile, ensureHuman, TURNSTILE_SITE_KEY } from '@/lib/turnstile-client'

export default function NAFLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()


  useEffect(() => { loadTurnstile(); }, [])
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const __h = await ensureHuman(); if (!__h.ok) { setError(__h.reason || 'Verificação anti-robô falhou.'); setLoading(false); return; }

    try {
      const response = await fetch('/api/naf/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()

        // Store auth token
        localStorage.setItem('naf_auth_token', data.token)
        localStorage.setItem('naf_user_data', JSON.stringify(data.user))

        // Redirect to NAF management
        router.push('/naf-management')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Credenciais inválidas. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro durante login do NAF:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white dark:bg-gray-950/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center pb-8 dark:bg-gray-900 dark:border-gray-800">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-800">
            Gestão NAF
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
            Acesse o painel administrativo do Núcleo de Apoio Fiscal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {TURNSTILE_SITE_KEY && (

              <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" data-language="pt-br" data-size="flexible" />

            )}


            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acesso restrito a coordenadores autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
