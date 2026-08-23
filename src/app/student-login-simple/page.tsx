'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  Home,
  Calendar,
  BookOpen,
  FileText,
  UserPlus,
  ChevronRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import DashboardInlineNav from '@/components/DashboardInlineNav'
import Footer from '@/components/Footer'
import studentSession from '@/lib/studentSession'
import { loadTurnstile, ensureHuman, TURNSTILE_SITE_KEY } from '@/lib/turnstile-client'

export default function StudentLoginSimple() {
  const router = useRouter()

  useEffect(() => { loadTurnstile(); }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const __h = await ensureHuman(); if (!__h.ok) { setError(__h.reason || 'Verificação anti-robô falhou.'); setLoading(false); return; }

    try {
      const response = await fetch('/api/students/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await studentSession.save(data.token, data.student)
        router.push('/student-portal')
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro durante login simples do estudante:', error)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    {
      href: '/',
      label: 'Página Inicial',
      icon: Home,
      description: 'Voltar ao site'
    },
    {
      href: '/naf-scheduling',
      label: 'Agendar Atendimento',
      icon: Calendar,
      description: 'Marcar horário'
    },
    {
      href: '/services',
      label: 'Serviços',
      icon: FileText,
      description: 'Ver serviços'
    },
    {
      href: '/fiscal-guides',
      label: 'Guias Fiscais',
      icon: BookOpen,
      description: 'Consultar guias'
    },
    {
      href: '/student-register',
      label: 'Cadastro',
      icon: UserPlus,
      description: 'Criar conta'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/40 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">NAF Estácio</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Portal Fiscal</span>
            </div>
          </Link>
          <DashboardInlineNav
            label="Menu"
            triggerClassName="bg-white/70 dark:bg-slate-900/70"
          />
        </div>
      </header>

      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-30%] left-1/2 w-[900px] h-[900px] -translate-x-1/2 bg-gradient-to-r from-emerald-200/30 via-teal-200/20 to-cyan-200/10 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-emerald-100/40 via-cyan-100/30 to-transparent dark:from-emerald-900/30 dark:via-cyan-950/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/40 dark:text-emerald-300">
                <Shield className="h-3 w-3" />
                Portal seguro NAF
              </span>
              <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Acesso ao Portal do Estudante
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                Entre com suas credenciais institucionais para acompanhar atendimentos, treinamentos e materiais exclusivos do NAF Estácio Florianópolis.
              </p>
            </div>
            <div className="hidden lg:block text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Precisa de suporte?</p>
              <p>Entre em contato com a coordenação do NAF ou consulte nossos guias fiscais para encontrar respostas rápidas sobre legislação e processos.</p>
            </div>
          </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Login Form */}
            <div className="order-2 lg:order-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo de volta!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Acesse sua conta de estudante para gerenciar seus atendimentos e treinamentos
                </p>
              </div>

              <Card className="dark:bg-gray-900/90 dark:border-gray-800 shadow-2xl backdrop-blur-sm border border-white/60 dark:border-white/10">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl dark:text-white">Login do Estudante</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Entre com suas credenciais institucionais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="dark:text-gray-300 font-medium">Email Institucional</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu.email@estudante.edu.br"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="dark:text-gray-300 font-medium">Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 pr-11 h-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {TURNSTILE_SITE_KEY && (

                      <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" data-language="pt-br" data-size="flexible" />

                    )}


                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Autenticando...</span>
                        </div>
                      ) : (
                        <span>Entrar no Portal</span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ainda não tem uma conta?{' '}
                        <Link
                          href="/student-register"
                          className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                        >
                          Cadastre-se aqui
                        </Link>
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Conexão segura SSL ativa</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Quick Links & Info */}
            <div className="order-1 lg:order-2 space-y-6">
              <Card className="dark:bg-gray-900/90 dark:border-gray-800 border border-white/60 dark:border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <Home className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Links Rápidos
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Navegue rapidamente pelo site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={index}
                        href={link.href}
                        className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{link.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{link.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="dark:bg-gradient-to-br dark:from-emerald-950/50 dark:to-teal-950/50 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 dark:border-emerald-900/30 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="dark:text-white text-emerald-900">
                    Sobre o Portal do Estudante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5 mt-0.5">
                      <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Gerencie seus Atendimentos</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Acompanhe todos os atendimentos fiscais atribuídos a você
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5 mt-0.5">
                      <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Treinamentos e Capacitação</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Acesse cursos e materiais de apoio para seu desenvolvimento
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5 mt-0.5">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Relatórios e Análises</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Visualize seu desempenho e estatísticas de atendimento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
