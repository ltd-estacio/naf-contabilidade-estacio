import React from 'react'
import { headers } from 'next/headers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, ArrowRight, Phone, Shield, TrendingUp, Clock, MapPin, Mail, Calendar, BookOpen, BarChart3, UserCheck, Zap } from 'lucide-react'
import NAFServicesShowcase from "@/components/NAFServicesShowcase"
import MainNavigation from '@/components/MainNavigation'
import NAFFooter from '@/components/layout/NAFFooter'

export const dynamic = 'force-dynamic'

async function resolveBaseUrl() {
  // Prioritize explicit environment configuration
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    || process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  if (!baseUrl) {
    // Use incoming request headers when rendering on the server
    const headersList = headers()
    const protocol = headersList.get('x-forwarded-proto') ?? 'https'
    const host = headersList.get('host')
    if (host) {
      baseUrl = `${protocol}://${host}`
    }
  }

  // Development fallback keeps legacy localhost behaviour
  if (!baseUrl && process.env.NODE_ENV !== 'production') {
    baseUrl = 'http://localhost:4000'
  }

  if (!baseUrl) {
    baseUrl = 'https://naf.ltdestacio.com.br'
  }

  if (baseUrl && !baseUrl.includes('localhost') && baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://')
  }

  return baseUrl
}

async function getStatistics() {
  try {
    const baseUrl = await resolveBaseUrl()

    const response = await fetch(`${baseUrl}/api/stats`, {
      cache: 'no-store' // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error('Failed to fetch statistics')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching statistics:', error)
    // Return fallback data if API fails
    return {
      totalAttendances: 2000,
      userSatisfaction: 95,
      availableServices: 21,
      onlineSupport: '24h'
    }
  }
}

export default async function Home() {
  // Fetch real statistics from API
  const statisticsData = await getStatistics()

  // Use real statistics from API
  const stats = [
    {
      number: `${(statisticsData.fiscalCompleted ?? 0).toLocaleString('pt-BR')}`,
      label: "Orientações Fiscais Concluídas",
      icon: Calendar
    },
    {
      number: `${statisticsData.activeCoordinators ?? 0}`,
      label: "Coordenadores Ativos",
      icon: UserCheck
    },
    {
      number: statisticsData.availableServices.toString(),
      label: "Serviços Disponíveis",
      icon: FileText
    },
    {
      number: statisticsData.sslEnabled ? 'Ativa' : 'Verifique',
      label: "Conexão Segura (SSL)",
      icon: Shield
    }
  ]

  const contactInfo = [
    { icon: MapPin, label: "Endereço", value: "Faculdade Estácio Florianópolis - NAF" },
    { icon: Phone, label: "Telefone", value: "(48) 98461-4449" },
    { icon: Mail, label: "Email", value: "naf@estacio.br" },
    { icon: Calendar, label: "Horário", value: "Seg-Sex: 8h às 17h" }
  ]

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
            NAF Estácio Florianópolis
          </h1>
          <h2 className="text-4xl md:text-5xl font-semibold text-blue-600 dark:text-blue-400 mb-6">
            Núcleo de Apoio Contábil e Fiscal
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto">
            Faculdade Estácio Florianópolis oferece orientação fiscal e contábil gratuita para
            pessoas físicas, microempreendedores individuais, pequenos proprietários
            rurais e organizações da sociedade civil.
          </p>

          {/* Contact Info */}
          <div className="inline-block rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-2 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">📞 Contato: (48) 98461-4449</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/naf-scheduling">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                Agendar Atendimento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 hover:bg-gray-100"
              >
                Verificar Elegibilidade
              </Button>
            </Link>
            <Link href="/faq">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 hover:bg-gray-100"
              >
                Perguntas Frequentes
              </Button>
            </Link>
            <Link href="/about-naf">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 hover:bg-gray-100"
              >
                Sobre o NAF Estácio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Atendimento por Agendamento Prévio Section */}
      <section className="py-8 bg-amber-50 dark:bg-amber-900/20 w-full">
        <div className="w-full px-4">
          <div className="flex items-center justify-center gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-1">📞 Atendimento por Agendamento Prévio</h3>
              <p className="text-amber-700 dark:text-amber-400">
                Entre em contato pelo telefone <strong className="text-amber-800 dark:text-amber-200">(48) 98461-4449</strong> ou agende online
              </p>
            </div>
            <Link href="/contact" className="flex-shrink-0">
              <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white">
                Falar Conosco
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/60 dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
              Principais Serviços
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Acesse todos os serviços através do nosso dashboard unificado
            </p>
          </div>
          
          <NAFServicesShowcase />
          
          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">
                Ver Todos os Serviços NAF
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Acesso Rápido
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Portais dedicados para cada tipo de usuário
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <Link href="/student-login-simple">
              <Card className="w-full max-w-sm bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <UserCheck className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Portal do Estudante</h3>
                  <p className="text-blue-100 text-sm">Gerencie suas atividades e treinamentos</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/coordinator-dashboard">
              <Card className="w-full max-w-sm bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Dashboard Coordenador</h3>
                  <p className="text-blue-100 text-sm">Métricas e análises avançadas</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/fiscal-guides">
              <Card className="w-full max-w-sm bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Guias Fiscais</h3>
                  <p className="text-blue-100 text-sm">Legislações e procedimentos</p>
                </CardContent>
              </Card>
            </Link>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
              Plataforma Consolidada
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Sistema otimizado sem redundâncias e com integração perfeita
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Sistema Unificado</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todas as funcionalidades em um só lugar. Dashboard consolidado com navegação eficiente.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Analytics Avançado</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Relatórios e visualizações completas com integração Power BI nativa.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Eficiência Total</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Zero redundâncias, navegação otimizada e todas as integrações funcionando perfeitamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-blue-100">
              Estamos aqui para ajudar com seus problemas contábeis e fiscais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((contact, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/25 hover:bg-white/20 transition-all duration-300 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <contact.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg mb-2 text-white">{contact.label}</CardTitle>
                  <CardDescription className="text-blue-100">
                    {contact.value}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/naf-scheduling">
              <Button size="lg" className="bg-white/15 text-white border-white/30 hover:bg-white/25 backdrop-blur">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Atendimento
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </main>
      <NAFFooter />
    </>
  )
}
