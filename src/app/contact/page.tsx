
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NAFFooter from '@/components/layout/NAFFooter'
import { useEffect, useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  FileText,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function Contact() {
  const whatsappPhone = '5548984614449'
  const whatsappMessage = `Olá, equipe NAF Estácio Florianópolis!\n\n` +
    `Solicito atendimento profissional. Seguem informações iniciais:\n\n` +
    `• Assunto: IRPF | MEI | ICMS | CPF/CNPJ | Outros\n` +
    `• Preferência: Data ____  Horário ____\n` +
    `• Atendimento: Online | Presencial\n` +
    `• Localidade: Florianópolis/SC\n` +
    `• Meus dados: Nome ____  Email ____  Telefone ____\n\n` +
    `Agradeço o retorno!`
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
  // Gmail compose with professional template
  const emailTo = 'naf@estacio.br'
  const emailSubject = 'Solicitação de Atendimento - NAF Estácio Florianópolis'
  const emailBody = (
    'Prezados,\n\n' +
    'Solicito atendimento junto ao NAF Estácio Florianópolis. Seguem informações iniciais para agilizar o processo:\n\n' +
    '- Assunto: IRPF | MEI | CPF/CNPJ | Orientação Fiscal | Outro\n' +
    '- Contexto resumido: _________________________________\n' +
    '- Preferência de data/horário: ________________________\n' +
    '- Atendimento: Online | Presencial\n' +
    '- Localidade: Florianópolis/SC\n' +
    '- Nome completo: ____________________\n' +
    '- Telefone: _________________________\n' +
    '- Email: ____________________________\n\n' +
    'Fico à disposição para quaisquer esclarecimentos adicionais.\n\n' +
    'Atenciosamente,\n' +
    '_________________________________'
  )
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  // Simple analytics tracking helper (console + GA if available)
  const trackEvent = (event: string, params?: Record<string, unknown>) => {
    try {
      // Console for debug
      console.log('[analytics]', event, params || {})
      if (typeof window !== 'undefined') {
        const w: unknown = window as unknown
        if (typeof w.gtag === 'function') {
          w.gtag('event', event, params || {})
        } else if (Array.isArray(w.dataLayer)) {
          w.dataLayer.push({ event, ...(params || {}) })
        }
      }
    } catch (error) {
      console.error('[analytics] tracking failed', error)
    }
  }
  // Serviços do banco (naf_services)
  const [services, setServices] = useState<unknown[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true)
        let res = await fetch('/api/naf-services?status=ativo&featured=true&limit=6')
        if (!res.ok) {
          // fallback sem o filtro de destaque
          res = await fetch('/api/naf-services?status=ativo&limit=6')
        }
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data.services) ? data.services : []
          // Ordenar por prioridade (menor primeiro) e nome
          list.sort((a: unknown, b: unknown) => {
            const pa = typeof a.priority_order === 'number' ? a.priority_order : 9999
            const pb = typeof b.priority_order === 'number' ? b.priority_order : 9999
            if (pa !== pb) return pa - pb
            return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')
          })
          setServices(list)
        } else {
          setServicesError('Não foi possível carregar os serviços.')
        }
      } catch (error) {
        console.error('Erro ao carregar serviços do NAF:', error)
        setServicesError('Erro de conexão ao carregar serviços.')
      } finally {
        setLoadingServices(false)
      }
    }
    loadServices()
  }, [])

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavigation />

      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Entre em Contato
          </h1>
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            NAF Estácio Florianópolis
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Estamos prontos para ajudar você com orientações fiscais e contábeis gratuitas
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Telefone */}
          <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:hover:shadow-gray-700/20">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-green-600 dark:text-green-400 mb-2">Telefone</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Ligue diretamente para nós</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">(48) 98461-4449</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">WhatsApp disponível</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Entrar em contato via WhatsApp com mensagem profissional predefinida"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Chamar no WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* E-mail */}
          <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-blue-600 mb-2">E-mail</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Envie suas dúvidas por e-mail</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-blue-600 mb-2">naf@estacio.br</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Resposta em até 24h</p>
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir o Gmail com mensagem profissional predefinida para o NAF"
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar E-mail (Gmail)
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-purple-600 mb-2">Localização</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Venha nos visitar</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-purple-600 mb-2">Faculdade Estácio</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Florianópolis - SC</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Estácio Florianópolis Campus Centro')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir o Google Maps para Estácio Florianópolis (Campus Centro)"
                className="block"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver no Mapa
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Horário e Serviços */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Horário de Atendimento */}
          <Card className="border border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Clock className="h-5 w-5" />
                Horário de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Segunda a Sexta</span>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">8h às 18h</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sábado</span>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">8h às 12h</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Domingo</span>
                <Badge variant="destructive">Fechado</Badge>
              </div>

              <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Atendimento por agendamento prévio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviços Principais */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="h-5 w-5" />
                Serviços Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingServices && (
                  <div className="text-sm text-blue-700">Carregando serviços...</div>
                )}
                {!loadingServices && servicesError && (
                  <div className="text-sm text-red-600">{servicesError}</div>
                )}
                {!loadingServices && !servicesError && services.length === 0 && (
                  <div className="text-sm text-gray-600">Nenhum serviço cadastrado no momento.</div>
                )}
                {!loadingServices && !servicesError && services.length > 0 && (
                  <>
                    {services.map((service: unknown) => (
                      <div key={service.id} className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span>{service.name}</span>
                            {service.is_featured && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Destaque</Badge>
                            )}
                            {service.is_popular && (
                              <Badge variant="outline" className="text-blue-700 border-blue-300">Popular</Badge>
                            )}
                            {service.category && (
                              <Badge variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300">{service.category}</Badge>
                            )}
                          </div>
                          {service.description && (
                            <div className="text-gray-600 dark:text-gray-400 text-sm">{service.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <Link href="/services" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  Ver mais
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Agendar Atendimento */}
          <Link
            href="/naf-scheduling"
            className="block"
            aria-label="Agendar atendimento no NAF"
            onClick={() => trackEvent('contact_action_click', { action: 'schedule', location: 'contact_actions' })}
          >
            <Card className="bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Agendar Atendimento</h3>
                <p className="text-green-100 text-sm">Marque seu horário online</p>
              </CardContent>
            </Card>
          </Link>

          {/* Verificar Elegibilidade */}
          <Link
            href="/eligibility"
            className="block"
            aria-label="Verificar elegibilidade para atendimento"
            onClick={() => trackEvent('contact_action_click', { action: 'eligibility', location: 'contact_actions' })}
          >
            <Card className="bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verificar Elegibilidade</h3>
                <p className="text-blue-100 text-sm">Veja se você pode ser atendido</p>
              </CardContent>
            </Card>
          </Link>

          {/* Guias Fiscais */}
          <Link
            href="/fiscal-guides"
            className="block"
            aria-label="Acessar guias fiscais do NAF"
            onClick={() => trackEvent('contact_action_click', { action: 'guides', location: 'contact_actions' })}
          >
            <Card className="bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Guias Fiscais</h3>
                <p className="text-purple-100 text-sm">Consulte nossos guias</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* About Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sobre o Projeto NAF</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-4xl mx-auto">
              O Núcleo de Apoio Contábil e Fiscal da Faculdade Estácio Florianópolis é um projeto do{' '}
              <strong>Laboratório de Transformação Digital (LTD)</strong>, desenvolvido pelos alunos do curso de{' '}
              <strong>Sistemas de Informação</strong> sob coordenação do{' '}
              <strong>Professor Vagner Cordeiro</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about-naf">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Saiba Mais Sobre o NAF
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Voltar à Página Inicial
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
      <NAFFooter />
    </>
  )
}
