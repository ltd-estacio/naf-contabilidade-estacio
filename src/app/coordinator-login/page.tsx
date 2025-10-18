'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, Shield, BarChart3, CheckCircle2, Users, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'
import Footer from '@/components/Footer'

export default function CoordinatorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/coordinator/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar token no localStorage ou sessionStorage
        localStorage.setItem('coordinator_token', data.token)
        localStorage.setItem('coordinator_user', JSON.stringify(data.user))

        // Redirecionar para o dashboard
        router.push('/coordinator-dashboard')
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro durante login do coordenador:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Verificar se já está logado
  useEffect(() => {
    const token = localStorage.getItem('coordinator_token')
    if (token) {
      router.push('/coordinator-dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <MainNavigation />

      {/* Background visuals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-35%] right-[-15%] w-[900px] h-[900px] bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-purple-200/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-sky-100/40 via-blue-100/30 to-transparent dark:from-sky-900/30 dark:via-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            {/* Login Card */}
            <Card className="border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">Acesso do Coordenador</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Autentique-se para gerenciar atendimentos, equipes e indicadores estratégicos.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-2 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  Conexão segura com criptografia TLS e monitoramento em tempo real.
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-2">
                {error && (
                  <Alert className="border-red-200/80 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                    <AlertDescription>{error}</AlertDescription>
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
                        placeholder="seu.email@estacio.br"
                        className="pl-10 h-12 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-500/40"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar no Sistema'
                )}
              </Button>
            </form>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="grid gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Autenticação reforçada com logs de auditoria
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Acesso restrito aos coordenadores autorizados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-xl p-8">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 mb-6">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Painel Executivo</p>
                    <h2 className="text-2xl font-bold">Gestão integrada do NAF</h2>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Operações em tempo real</p>
                      <p>Visualize fila de atendimentos, disponibilidade de estudantes e evolução dos casos.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Gestão de equipes</p>
                      <p>Distribua atendimentos com poucos cliques e acompanhe o desempenho dos alunos.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Indicadores completos</p>
                      <p>Relatórios estratégicos, comparativos e métricas de atendimento em um único painel.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl text-white p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-100">
                  <Shield className="h-4 w-4" /> Segurança e conformidade
                </div>
                <p className="text-lg font-semibold leading-snug">
                  Acompanhe todo o ciclo do atendimento fiscal com transparência e governança.
                </p>
                <p className="text-sm text-blue-100/80">
                  O painel oferece recursos exclusivos para coordenadores monitorarem a operação do NAF e obterem insights decisivos.
                </p>
                <Link href="/naf-management" className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                  Explorar recursos avançados
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
