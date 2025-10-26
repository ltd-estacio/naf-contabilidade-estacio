'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-states"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  FileText,
  Download
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  category: string
  theme?: string
  requirements?: string
  estimatedDuration?: number
  estimatedTime?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  demandCount?: number
}

interface ServicesData {
  services: Record<string, Service[]>
  total: number
  categories: string[]
}

export default function ServicesManagementPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isAddingService, setIsAddingService] = useState(false)
  const canManageServices = session?.user?.role === 'COORDINATOR' || session?.user?.role === 'TEACHER'

  const loadServices = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/services/manage?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'PESSOA_FISICA': 'Pessoa Física',
      'PRODUTOR_RURAL': 'Produtor Rural',
      'PEQUENA_EMPRESA': 'Pequena Empresa/MEI',
      'OSC': 'Organizações da Sociedade Civil',
      'GERAL': 'Serviços Gerais',
      'CADASTROS_DOCUMENTOS': 'Cadastros e Documentos',
      'IMPOSTO_RENDA': 'Imposto de Renda',
      'CERTIDOES_CONSULTAS': 'Certidões e Consultas',
      'MEI_EMPRESAS': 'MEI e Empresas',
      'RURAL_ITR': 'Rural e ITR',
      'COMERCIO_EXTERIOR': 'Comércio Exterior',
      'ISENCOES_ESPECIAIS': 'Isenções Especiais',
      'PAGAMENTOS_PARCELAMENTOS': 'Pagamentos e Parcelamentos',
      'ESOCIAL_TRABALHISTA': 'E-Social e Trabalhista',
      'ACESSO_DIGITAL': 'Acesso Digital',
      'ATENDIMENTO_PRESENCIAL': 'Atendimento Presencial'
    }
    return categoryNames[category] || category
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Não especificado'
    if (duration < 60) return `${duration} min`
    return `${Math.floor(duration / 60)}h ${duration % 60}min`
  }

  const exportServices = () => {
    if (!services) return
    
    const allServices = Object.values(services.services).flat()
    const csvContent = [
      ['Nome', 'Categoria', 'Descrição', 'Duração', 'Demandas', 'Status'].join(','),
      ...allServices.map(service => [
        `"${service.name}"`,
        `"${getCategoryName(service.category)}"`,
        `"${service.description}"`,
        `"${formatDuration(service.estimatedDuration || service.estimatedTime)}"`,
        service.demandCount || 0,
        service.isActive ? 'Ativo' : 'Inativo'
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `servicos-naf-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingState message="Carregando serviços..." />
  if (error) return <ErrorState message={error} onRetry={loadServices} />
  if (!services) return <EmptyState title="Nenhum serviço encontrado" />

  const allServices = Object.values(services.services).flat()

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serviços NAF</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerenciamento completo dos serviços oferecidos pelo NAF
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportServices}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
            </Button>
            {canManageServices && (
              <Button
                onClick={() => setIsAddingService(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Novo Serviço
              </Button>
            )}
          </div>
        </div>

        {isAddingService && canManageServices && (
          <Card className="mb-6 border-dashed border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-sm text-blue-900">
              <p className="font-medium">Cadastro de novos serviços em breve.</p>
              <p className="mt-2 opacity-80">
                Estamos preparando o fluxo completo de criação diretamente por aqui. Enquanto isso, continue monitorando e ajustando os serviços existentes.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddingService(false)}>
                Fechar aviso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Serviços</p>
                  <p className="text-2xl font-bold">{services.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold">{services.categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold">
                    {allServices.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Demandas</p>
                  <p className="text-2xl font-bold">
                    {allServices.reduce((sum, s) => sum + (s.demandCount || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {services.categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services by Category */}
      <div className="space-y-8">
        {Object.entries(services.services).map(([category, categoryServices]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {getCategoryName(category)}
              </h2>
              <Badge variant="outline">
                {categoryServices.length} serviços
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg leading-tight">
                        {service.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        {service.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {service.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {service.theme && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tema:</span>
                          <Badge variant="outline" className="text-xs">
                            {service.theme}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatDuration(service.estimatedDuration || service.estimatedTime)}</span>
                      </div>
                      {(service.demandCount || 0) > 0 && (
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{service.demandCount} demandas</span>
                        </div>
                      )}
                    </div>

                    {canManageServices && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          Remover
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(services.services).length === 0 && (
        <EmptyState
          title="Nenhum serviço encontrado"
          description="Não há serviços que correspondam aos filtros selecionados."
          action={
            canManageServices ? (
              <Button onClick={() => setIsAddingService(true)}>
                Adicionar Primeiro Serviço
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
