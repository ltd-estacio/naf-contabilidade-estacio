'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SmartAutoForm from '@/components/SmartAutoForm'
import { 
  CalendarDays, 
  Clock, 
  FileText, 
  CheckCircle, 
  ArrowLeft, 
  Zap,
  User,
  Building2
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  category: string
  estimatedDuration: number
  requirements: string[]
}

export default function SmartSchedulePage() {
  const { status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [demandData, setDemandData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchServices()
    }
  }, [status, router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setShowForm(true)
  }

  const handleFormSubmit = (demand: unknown) => {
    setDemandData(demand)
    setSuccess(true)
    setShowForm(false)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedService(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-6 w-6 animate-spin" />
                <span>Carregando sistema inteligente...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success && demandData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                <span>Solicitação Criada com Sucesso!</span>
              </CardTitle>
              <CardDescription>
                Sua solicitação foi processada automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">📋 Detalhes da Solicitação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Protocolo:</strong> {demandData.protocol}</p>
                    <p><strong>Serviço:</strong> {demandData.service.name}</p>
                    <p><strong>Status:</strong> Pendente</p>
                  </div>
                  <div>
                    <p><strong>Solicitante:</strong> {demandData.clientName}</p>
                    <p><strong>Email:</strong> {demandData.clientEmail}</p>
                    <p><strong>Criado em:</strong> {new Date(demandData.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {demandData.autoFilled && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">🤖 Preenchimento Automático</h4>
                  <div className="text-sm text-blue-800">
                    <p>✅ Dados preenchidos automaticamente: 
                      {Object.entries(demandData.autoFilled).filter(([_, filled]) => filled).map(([field]) => field).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">📬 Próximos Passos</h4>
                <div className="text-sm text-amber-800 space-y-1">
                  <p>• Você receberá um email de confirmação em breve</p>
                  <p>• Um professor/coordenador será designado para seu atendimento</p>
                  <p>• Aguarde contato através do email ou telefone informado</p>
                  <p>• Você pode acompanhar o status no dashboard</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => router.push('/dashboard')} className="flex-1">
                  <User className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
                <Button 
                  onClick={() => {
                    setSuccess(false)
                    setDemandData(null)
                    setSelectedService(null)
                  }} 
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Nova Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showForm && selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-10">
          <div className="mb-6">
            <Button
              onClick={handleFormCancel}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Serviços
            </Button>
          </div>
          
          <SmartAutoForm
            serviceId={selectedService.id}
            serviceName={selectedService.name}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
            🚀 Agendamento Inteligente NAF
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Solicite atendimento de forma automatizada. Seus dados são preenchidos automaticamente 
            para agilizar o processo e evitar retrabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Preenchimento Automático</h3>
                  <p className="text-sm text-blue-700">Dados preenchidos automaticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Verificação Inteligente</h3>
                  <p className="text-sm text-green-700">Validação e correção de dados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">Histórico Inteligente</h3>
                  <p className="text-sm text-purple-700">Sugestões baseadas no histórico</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Selecione o Serviço Desejado</span>
            </CardTitle>
            <CardDescription>
              Escolha o serviço que você precisa. O sistema irá pré-preencher seus dados automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="text-left"
                  onClick={() => handleServiceSelect(service)}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-300">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          <span>Categoria: {service.category}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Duração: {service.estimatedDuration} min</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4" size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Solicitar Automaticamente
                      </Button>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Já possui conta?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Acesse seu dashboard para acompanhar solicitações em andamento
              </p>
              <Link href="/dashboard">
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Acessar Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
