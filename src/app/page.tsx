import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, ArrowRight, Phone, Shield, TrendingUp, Clock, MapPin, Mail, Calendar, BookOpen, BarChart3, UserCheck, Zap, CheckCircle } from 'lucide-react'
import NAFServicesShowcase from "@/components/NAFServicesShowcase"
import MainNavigation from '@/components/MainNavigation'
import NAFFooter from '@/components/layout/NAFFooter'
import { getHomeStats } from '@/lib/homeStats'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let statisticsData
  try {
    const { stats } = await getHomeStats()
    statisticsData = stats
  } catch (error) {
    console.error('Error fetching home stats:', error)
    statisticsData = {
      totalAttendances: 2000,
      userSatisfaction: 95,
      availableServices: 21,
      onlineSupport: '24h',
      activeCoordinators: 0,
      sslEnabled: true,
      fiscalCompleted: 0,
    }
  }

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
      <section className="py-20 bg-[#2563eb]">
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
              <Card
                key={index}
                className="bg-white text-center shadow-lg border-0 rounded-2xl hover:-translate-y-1 transition-transform duration-200"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <contact.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg mb-2 text-slate-900">{contact.label}</CardTitle>
                  <CardDescription className="text-slate-600">
                    {contact.value}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/naf-scheduling">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-blue-50 border border-blue-100 shadow-md"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Atendimento
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="relative overflow-hidden py-24 bg-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1 text-sm font-medium tracking-wide">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Aplicativo Oficial do NAF
              </div>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                O NAF na palma da mão: acompanhe atendimentos, receba alertas e organize sua agenda onde estiver.
              </h3>
              <p className="text-lg text-slate-200/80">
                Baixe o aplicativo gratuito do NAF e tenha acesso rápido aos seus atendimentos, notificações em tempo real e materiais de apoio para cada orientação fiscal ou contábil.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Agenda inteligente</p>
                    <p className="text-sm text-slate-200/70">Confirme, reagende e receba lembretes de cada atendimento.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Documentos e orientações</p>
                    <p className="text-sm text-slate-200/70">Acesse registros e materiais compartilhados com poucos toques.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="https://play.google.com/store/apps/details?id=br.com.estacio.naf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-xl bg-white text-slate-900 px-6 py-3 font-semibold shadow-lg shadow-slate-900/30 transition-transform duration-200 hover:-translate-y-1"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white group-hover:scale-105 transition">
                    <svg width="18" height="18" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30 71.5C30 53.55 44.55 39 62.5 39c6.87 0 13.62 1.7 19.64 4.94l260.9 135.86-63.85 63.85L30 108.23V71.5Z" fill="#34A853"/>
                      <path d="M30 143.77 278.19 256 30 368.23v-224.46Z" fill="#FBBC05"/>
                      <path d="M30 403.77v-36.73l314.04-136.28 63.85 63.85-260.9 135.86A62.5 62.5 0 0 1 30 403.77Z" fill="#4285F4"/>
                      <path d="M408.04 294.61 470.6 357.17c16.57 16.57 16.57 43.46 0 60.03-8.29 8.29-19.15 12.44-30.02 12.44-10.86 0-21.73-4.15-30.02-12.44l-47.48-47.48 44.96-75.11Z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-slate-500">Disponível na</span>
                    <span>Google Play</span>
                  </div>
                </Link>
                <p className="text-sm text-slate-300/70">
                  Compatível com Android 8 ou superior • Oferece login seguro para estudantes e coordenadores.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto max-w-xs">
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-blue-500/60 via-blue-400/40 to-emerald-400/30 blur-3xl" />
                <div className="relative rounded-[36px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center gap-6">
                  <div className="rounded-3xl overflow-hidden shadow-lg shadow-slate-900/20">
                    <Image
                      src="/images/naf-app-icon.svg"
                      alt="Ícone do aplicativo NAF"
                      width={240}
                      height={240}
                      priority
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold">App NAF Estácio</p>
                    <p className="text-sm text-slate-200/70">
                      Gerencie solicitações, receba alertas instantâneos e acompanhe o progresso dos atendimentos em um aplicativo intuitivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <NAFFooter />
    </>
  )
}
