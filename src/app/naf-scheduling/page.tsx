'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ptBR } from 'date-fns/locale'
import { sendAppointmentConfirmationEmail } from '@/lib/emailjs'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import MainNavigation from '@/components/MainNavigation'
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  CheckCircle,
  Users,
  Building2,
  Sprout,
  Heart,
  AlertTriangle,
  Monitor
} from 'lucide-react'

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

const getNextAvailableDate = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)

  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1)
  }

  return date
}

interface TimeSlot {
  time: string
  available: boolean
  student?: string
  service?: string
}

interface AppointmentRequest {
  id?: string
  protocol?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientCategory: 'PESSOA_FISICA' | 'MEI' | 'RURAL' | 'OSC'
  serviceType: string
  preferredDate: Date | null
  preferredTime: string
  description: string
  documents: string[]
  urgency: 'BAIXA' | 'MEDIA' | 'ALTA'
  isOnline: boolean | null
}

interface NAFService {
  id: string
  name: string
  slug: string
  description: string
  category: string
  subcategory?: string
  difficulty: string
  status: string
  estimated_duration_minutes?: number
  required_documents?: string[]
}

// Mapear categorias da tabela naf_services para categorias do agendamento
const categoryMapping: { [key: string]: 'PESSOA_FISICA' | 'MEI' | 'RURAL' | 'OSC' } = {
  'servicos_disponíveis': 'PESSOA_FISICA',
  'servicos_tributarios': 'PESSOA_FISICA',
  'servicos_empresariais': 'MEI',
  'documentacao': 'PESSOA_FISICA',
  'servicos_mei': 'MEI',
  'servicos_rural': 'RURAL',
  'servicos_osc': 'OSC'
}

function NAFSchedulingSystem() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => getNextAvailableDate())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [nafServices, setNafServices] = useState<{ [key: string]: string[] }>({
    'PESSOA_FISICA': [],
    'MEI': [],
    'RURAL': [],
    'OSC': []
  })
  const [servicesLoading, setServicesLoading] = useState(true)
  const [appointment, setAppointment] = useState<AppointmentRequest>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCategory: 'PESSOA_FISICA',
    serviceType: '',
    preferredDate: null,
    preferredTime: '',
    description: '',
    documents: [],
    urgency: 'MEDIA',
    isOnline: null
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState<boolean | null>(null) // null = não tentou, true = sucesso, false = falhou

  // Buscar serviços da API ao carregar o componente
  useEffect(() => {
    fetchServices()
  }, [])

  // Ler parâmetros da URL e preencher automaticamente
  useEffect(() => {
    const serviceFromUrl = searchParams.get('service')
    const categoryFromUrl = searchParams.get('category')

    if (serviceFromUrl) {
      setAppointment(prev => ({
        ...prev,
        serviceType: decodeURIComponent(serviceFromUrl)
      }))
    }

    if (categoryFromUrl) {
      const mappedCategory = categoryMapping[categoryFromUrl]
      if (mappedCategory) {
        setAppointment(prev => ({
          ...prev,
          clientCategory: mappedCategory
        }))
      }
    }
  }, [searchParams])

  const fetchServices = async () => {
    try {
      setServicesLoading(true)
      const response = await fetch('/api/services')
      const data: NAFService[] = await response.json()

      if (response.ok && Array.isArray(data)) {
        // Organizar serviços por categoria
        const servicesByCategory: { [key: string]: string[] } = {
          'PESSOA_FISICA': [],
          'MEI': [],
          'RURAL': [],
          'OSC': []
        }

        data.forEach(service => {
          const mappedCategory = categoryMapping[service.category]
          if (mappedCategory && servicesByCategory[mappedCategory]) {
            servicesByCategory[mappedCategory].push(service.name)
          }
        })

        setNafServices(servicesByCategory)
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  // Documentos necessários por categoria
  const requiredDocuments = {
    'PESSOA_FISICA': [
      'RG ou documento oficial com foto',
      'CPF',
      'Comprovante de residência',
      'Comprovante de renda (se aplicável)'
    ],
    'MEI': [
      'CPF',
      'RG',
      'Comprovante de residência',
      'Título de eleitor',
      'Documentos específicos da atividade'
    ],
    'RURAL': [
      'CPF',
      'RG',
      'Documentos da propriedade rural',
      'CNIR (se houver)',
      'Comprovantes de atividade rural'
    ],
    'OSC': [
      'CNPJ',
      'Estatuto social atualizado',
      'Ata de eleição da diretoria',
      'Certidões de regularidade'
    ]
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const candidate = new Date(date)
    candidate.setHours(0, 0, 0, 0)

    return candidate < today
  }

  const handleDateSelection = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      setAppointment(prev => ({
        ...prev,
        preferredDate: null,
        preferredTime: ''
      }))
      return
    }

    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    setSelectedDate(normalizedDate)
    setAppointment(prev => {
      const isSameDay = prev.preferredDate?.toDateString() === normalizedDate.toDateString()
      return {
        ...prev,
        preferredDate: normalizedDate,
        preferredTime: isSameDay ? prev.preferredTime : ''
      }
    })
  }

  const handleTimeSelection = (slot: TimeSlot) => {
    if (!selectedDate || !slot.available || loading) {
      return
    }

    setAppointment(prev => ({
      ...prev,
      preferredDate: selectedDate,
      preferredTime: slot.time
    }))
  }

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    try {
      setLoading(true)
      const dateString = date.toISOString().split('T')[0]

      const response = await fetch(`/api/fiscal-appointments/availability?date=${dateString}`)
      const data = await response.json()

      if (response.ok && data.slots) {
        const formattedSlots = data.slots.map((slot: { time: string; available: boolean }) => ({
          time: slot.time,
          available: slot.available,
          status: slot.available ? 'Disponível' : 'Ocupado'
        }))
        setAvailableSlots(formattedSlots)
      } else {
        console.error('Erro ao buscar horários disponíveis')
        // Fallback para horários vazios se der erro
        const emptySlots = TIME_SLOTS.map(time => ({
          time,
          available: true,
          status: 'Disponível'
        }))
        setAvailableSlots(emptySlots)
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      // Fallback para horários vazios se der erro
      const emptySlots = TIME_SLOTS.map(time => ({
        time,
        available: true,
        status: 'Disponível'
      }))
      setAvailableSlots(emptySlots)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, fetchAvailableSlots])

  const handleSubmit = async () => {
    if (!appointment.preferredDate || !appointment.preferredTime) {
      alert('Selecione a data e o horário do atendimento antes de continuar.')
      return
    }

    if (appointment.isOnline === null) {
      alert('Informe se o atendimento será online ou presencial antes de continuar.')
      return
    }

    setLoading(true)
    try {
      // Preparar dados para a API fiscal-appointments
      const appointmentData = {
        // Dados pessoais
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        clientPhone: appointment.clientPhone,

        // Endereço (usando valores padrão se não fornecidos)
        addressCity: 'Florianópolis',
        addressState: 'SC',

        // Serviço
        serviceType: appointment.serviceType,
        serviceTitle: appointment.serviceType,
        serviceCategory: appointment.clientCategory,
        urgencyLevel: appointment.urgency === 'MEDIA' ? 'NORMAL' : appointment.urgency,

        // Agendamento
        preferredDate: appointment.preferredDate?.toISOString().split('T')[0],
        preferredTime: appointment.preferredTime,

        // Observações
        clientNotes: appointment.description,

        // Detalhes específicos
        serviceDetails: {
          isOnline: appointment.isOnline === true,
          clientCategory: appointment.clientCategory
        }
      }

      // Fazer chamada real para a API
      const response = await fetch('/api/fiscal-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Erro da API:', result)
        console.error('❌ Status:', response.status)
        console.error('❌ Message:', result.message)
        console.error('❌ Error:', result.error)
        console.error('❌ Code:', result.code)
        console.error('❌ Details:', result.details)
        console.error('❌ Debug:', result.debug)

        const errorMsg = result.error || result.message || 'Erro ao criar agendamento'
        throw new Error(errorMsg)
      }

      console.log('✅ Agendamento criado com sucesso:', result)

      // Atualizar o appointment com o protocolo gerado
      setAppointment(prev => ({
        ...prev,
        id: result.appointment.id,
        protocol: result.protocol
      }))

      // Enviar email de confirmação
      try {
        const categoryLabels = {
          'PESSOA_FISICA': 'Pessoa Física Hipossuficiente',
          'MEI': 'Microempreendedor Individual',
          'RURAL': 'Pequeno Proprietário Rural',
          'OSC': 'Organização da Sociedade Civil'
        }

        const emailResult = await sendAppointmentConfirmationEmail({
          protocol: result.protocol,
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          clientPhone: appointment.clientPhone,
          serviceType: appointment.serviceType,
          clientCategory: categoryLabels[appointment.clientCategory] || appointment.clientCategory,
          preferredDate: appointment.preferredDate?.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || '',
          preferredTime: appointment.preferredTime,
          modality: appointment.isOnline === null
            ? 'Não informado'
            : appointment.isOnline
              ? 'Online'
              : 'Presencial'
        })

        if (emailResult.success) {
          console.log('✅ Email de confirmação enviado com sucesso!')
          setEmailSent(true)
        } else {
          console.warn('⚠️ Agendamento criado, mas houve erro ao enviar o email')
          setEmailSent(false)
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError)
        setEmailSent(false)
        // Não bloqueia o fluxo, apenas registra o erro
      }

      setStep(4) // Ir para tela de confirmação
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'PESSOA_FISICA':
        return { 
          label: 'Pessoa Física Hipossuficiente', 
          icon: Users, 
          color: 'text-blue-600',
          description: 'Renda familiar até 5 salários mínimos'
        }
      case 'MEI':
        return { 
          label: 'Microempreendedor Individual', 
          icon: Building2, 
          color: 'text-green-600',
          description: 'Faturamento anual até R$ 81.000'
        }
      case 'RURAL':
        return { 
          label: 'Pequeno Proprietário Rural', 
          icon: Sprout, 
          color: 'text-emerald-600',
          description: 'Propriedade até 4 módulos fiscais'
        }
      case 'OSC':
        return { 
          label: 'Organização da Sociedade Civil', 
          icon: Heart, 
          color: 'text-purple-600',
          description: 'Entidade sem fins lucrativos'
        }
      default:
        return { label: category, icon: Users, color: 'text-gray-600', description: '' }
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Informações Pessoais
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preencha seus dados para agendamento no NAF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clientName">Nome Completo *</Label>
          <Input
            id="clientName"
            value={appointment.clientName}
            onChange={(e) => setAppointment(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="clientEmail">E-mail *</Label>
          <Input
            id="clientEmail"
            type="email"
            value={appointment.clientEmail}
            onChange={(e) => setAppointment(prev => ({ ...prev, clientEmail: e.target.value }))}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="clientPhone">Telefone *</Label>
          <Input
            id="clientPhone"
            value={appointment.clientPhone}
            onChange={(e) => setAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <Label htmlFor="clientCategory">Categoria do Atendimento *</Label>
          <Select 
            value={appointment.clientCategory} 
            onValueChange={(value: unknown) => setAppointment(prev => ({ ...prev, clientCategory: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PESSOA_FISICA">Pessoa Física Hipossuficiente</SelectItem>
              <SelectItem value="MEI">Microempreendedor Individual</SelectItem>
              <SelectItem value="RURAL">Pequeno Proprietário Rural</SelectItem>
              <SelectItem value="OSC">Organização da Sociedade Civil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {appointment.clientCategory && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {(() => {
                const categoryInfo = getCategoryInfo(appointment.clientCategory)
                const IconComponent = categoryInfo.icon
                return (
                  <>
                    <IconComponent className={`h-5 w-5 ${categoryInfo.color} dark:${categoryInfo.color.replace('text-', 'text-').replace('-600', '-400')} mt-0.5`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{categoryInfo.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{categoryInfo.description}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Documentos necessários:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {requiredDocuments[appointment.clientCategory]?.map((doc, index) => (
                            <li key={index}>• {doc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Serviço Solicitado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Escolha o serviço NAF que você precisa
        </p>
      </div>

      <div>
        <Label htmlFor="serviceType">Tipo de Serviço *</Label>
        <Select
          value={appointment.serviceType}
          onValueChange={(value) => setAppointment(prev => ({ ...prev, serviceType: value }))}
          disabled={servicesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={servicesLoading ? "Carregando serviços..." : "Selecione o serviço"} />
          </SelectTrigger>
          <SelectContent>
            {nafServices[appointment.clientCategory]?.map((service, index) => (
              <SelectItem key={index} value={service}>{service}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {servicesLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Buscando serviços disponíveis...
          </p>
        )}
      </div>

        <div>
          <Label htmlFor="description">Descrição da Solicitação</Label>
          <Textarea
            id="description"
            value={appointment.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAppointment(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva brevemente sua necessidade ou dúvida específica..."
            rows={4}
          />
        </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="urgency">Nível de Urgência</Label>
          <Select 
            value={appointment.urgency} 
            onValueChange={(value: unknown) => setAppointment(prev => ({ ...prev, urgency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAIXA">Baixa - Posso aguardar</SelectItem>
              <SelectItem value="MEDIA">Média - Prazo normal</SelectItem>
              <SelectItem value="ALTA">Alta - Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const hasSelectedTime = Boolean(appointment.preferredTime)
    const hasFormatSelected = appointment.isOnline !== null
    const presencialSelected = appointment.isOnline === false
    const onlineSelected = appointment.isOnline === true

    const selectedDateLabel = selectedDate
      ? selectedDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long'
        })
      : 'Selecione uma data'

    const selectedTimeLabel = hasSelectedTime
      ? appointment.preferredTime
      : selectedDate
        ? 'Escolha um horário disponível'
        : 'Selecione uma data primeiro'

    const formatLabel = appointment.isOnline === null
      ? 'Selecione a modalidade'
      : appointment.isOnline
        ? 'Online'
        : 'Presencial'

    const formatHelper = appointment.isOnline === null
      ? 'Escolha entre atendimento presencial ou online.'
      : appointment.isOnline
        ? 'Você receberá o link do atendimento por e-mail.'
        : 'Chegue com alguns minutos de antecedência ao campus.'

    const FormatIcon = appointment.isOnline === false ? Building2 : Monitor

    const summaryItems = [
      {
        label: 'Data',
        value: selectedDateLabel,
        helper: selectedDate
          ? 'Para alterar, clique em outro dia do calendário.'
          : 'Clique em um dia disponível.',
        icon: CalendarIcon,
        active: Boolean(selectedDate)
      },
      {
        label: 'Horário',
        value: selectedTimeLabel,
        helper: selectedDate
          ? hasSelectedTime
            ? 'Horário confirmado. Você pode escolher outro se preferir.'
            : 'Selecione um dos horários disponíveis ao lado.'
          : 'Escolha uma data antes de selecionar o horário.',
        icon: Clock,
        active: hasSelectedTime
      },
      {
        label: 'Formato',
        value: formatLabel,
        helper: formatHelper,
        icon: FormatIcon,
        active: hasFormatSelected
      }
    ]

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Data e Horário
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha o melhor dia, horário e formato para seu atendimento
          </p>
        </div>

        <Card className="overflow-hidden dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {summaryItems.map(item => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={`rounded-xl border bg-white dark:bg-gray-900/40 p-4 shadow-sm transition-colors ${
                      item.active
                        ? 'border-blue-400 dark:border-blue-600'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-lg ${
                          item.active
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                          {item.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.helper}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Calendário
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Domingos indisponíveis
                  </span>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900/40 p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelection}
                    disabled={(date: Date) => isPastDate(date) || date.getDay() === 0}
                    locale={ptBR}
                    className="w-full mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedDate
                        ? selectedDate.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long'
                          })
                        : 'Horários'}
                    </p>
                    {selectedDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        BRT
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4">
                    {!selectedDate ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-10 w-10 opacity-40" />
                        Escolha uma data
                      </div>
                    ) : loading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-r-transparent"></div>
                        Carregando...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => {
                          const isSelected =
                            appointment.preferredTime === slot.time &&
                            appointment.preferredDate?.toDateString() === selectedDate?.toDateString()

                          return (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              disabled={!slot.available || loading}
                              onClick={() => handleTimeSelection(slot)}
                              className={`justify-center h-12 text-sm font-semibold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                                  : slot.available
                                    ? 'border-gray-200 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-600'
                                    : 'border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              {slot.time}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-6 w-6 opacity-40" />
                        Sem horários
                      </div>
                    )}
                  </div>
                  {selectedDate && !loading && availableSlots.length > 0 && (
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Disponível
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                        Ocupado
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Formato do Atendimento *
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAppointment(prev => ({ ...prev, isOnline: false }))}
                      className={`h-20 justify-start gap-3 border-2 text-left transition-all ${
                        presencialSelected
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 dark:border-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        presencialSelected
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">Presencial</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">No NAF</span>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAppointment(prev => ({ ...prev, isOnline: true }))}
                      className={`h-20 justify-start gap-3 border-2 text-left transition-all ${
                        onlineSelected
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 dark:border-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        onlineSelected
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">Online</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Link por email</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Agendamento Confirmado!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Seu atendimento foi agendado com sucesso
        </p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-4 text-left">
            <div className="flex justify-between">
              <span className="font-medium dark:text-gray-300">Protocolo:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{appointment.protocol || 'Aguardando...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-gray-300">Data:</span>
              <span className="dark:text-gray-300">{appointment.preferredDate?.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-gray-300">Horário:</span>
              <span className="dark:text-gray-300">{appointment.preferredTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-gray-300">Serviço:</span>
              <span className="dark:text-gray-300">{appointment.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-gray-300">Modalidade:</span>
              <span className="dark:text-gray-300">
                {appointment.isOnline === null
                  ? 'Não informado'
                  : appointment.isOnline
                    ? 'Online'
                    : 'Presencial'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Email */}
      {emailSent === true && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-green-800 dark:text-green-200">Email de Confirmação Enviado!</h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Verifique sua caixa de entrada em <strong>{appointment.clientEmail}</strong>
          </p>
        </div>
      )}

      {emailSent === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Aviso sobre Email</h3>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Não foi possível enviar o email de confirmação automaticamente. Por favor, anote seu protocolo: <strong>{appointment.protocol}</strong>
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Próximos Passos:</h3>
        <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1 text-left">
          {emailSent !== true && <li>• Guarde o número do protocolo para consultas futuras</li>}
          <li>• Prepare os documentos necessários</li>
          <li>• Chegue 10 minutos antes do horário agendado</li>
          <li>• Em caso de dúvidas, entre em contato conosco</li>
        </ul>
      </div>

      <div className="flex space-x-4 justify-center">
        <Button onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-2" />
          Imprimir Comprovante
        </Button>
        <Button variant="outline" onClick={() => {
          setStep(1)
          setAppointment({
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            clientCategory: 'PESSOA_FISICA',
            serviceType: '',
            preferredDate: null,
            preferredTime: '',
            description: '',
            documents: [],
            urgency: 'MEDIA',
            isOnline: null
          })
        }}>
          Novo Agendamento
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <MainNavigation />

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NAF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agendamento de Atendimento
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistema integrado de agendamento NAF
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Etapa {step} de 3: {
                  step === 1 ? 'Dados Pessoais' :
                  step === 2 ? 'Serviço' :
                  'Data e Horário'
                }
              </div>
            </div>
          </div>
        )}

        <Card className="max-w-5xl mx-auto dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {step < 4 && (
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Voltar
                </Button>
                <Button 
                  onClick={() => {
                    if (step === 3) {
                      handleSubmit()
                    } else {
                      setStep(step + 1)
                    }
                  }}
                  disabled={
                    (step === 1 && (!appointment.clientName || !appointment.clientEmail || !appointment.clientPhone)) ||
                    (step === 2 && !appointment.serviceType) ||
                    (step === 3 && (!appointment.preferredDate || !appointment.preferredTime || appointment.isOnline === null)) ||
                    loading
                  }
                >
                  {loading ? 'Processando...' : (step === 3 ? 'Confirmar Agendamento' : 'Próximo')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function NAFSchedulingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando agendamento...</div>}>
      <NAFSchedulingSystem />
    </Suspense>
  )
}
