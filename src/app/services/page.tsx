'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainNavigation from '@/components/MainNavigation'
import NAFFooter from '@/components/layout/NAFFooter'
import {
  Calculator,
  FileText,
  Users,
  Search,
  Clock,
  Star,
  TrendingUp,
  Building2,
  BookOpen,
  Shield,
  UserCheck,
  BarChart3,
  Heart,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  Grid,
  List
} from 'lucide-react'

interface NAFService {
  id: string
  name: string
  slug: string
  description: string
  detailed_description?: string
  category: string
  subcategory?: string
  difficulty: 'basico' | 'intermediario' | 'avancado'
  status: 'ativo' | 'inativo' | 'em_desenvolvimento'
  is_featured: boolean
  is_popular: boolean
  priority_order: number
  estimated_duration_minutes?: number
  required_documents?: string[]
  prerequisites?: string[]
  icon_name?: string
  color_scheme?: string
  process_steps?: unknown
  views_count: number
  requests_count: number
  satisfaction_rating: number
  created_at: string
  updated_at: string
  data_source?: {
    views: 'real' | 'mock'
    requests: 'real' | 'mock'
    satisfaction: 'real' | 'mock'
  }
}

interface ServiceStats {
  services: NAFService[]
  totals: {
    services: number
    views: number
    requests: number
    satisfaction: number
  }
  metadata: {
    hasRatingsTable: boolean
    hasViewsTable: boolean
    appointmentsCount: number
    dataSource: string
    generatedAt: string
  }
}

const iconMap: { [key: string]: unknown } = {
  Calculator,
  FileText,
  Users,
  Building2,
  BookOpen,
  Shield,
  UserCheck,
  BarChart3,
  Clock,
  TrendingUp,
  Heart
}

const categoryLabels = {
  'servicos_disponíveis': 'Serviços Disponíveis',
  'servicos_tributarios': 'Serviços Tributários',
  'servicos_empresariais': 'Serviços Empresariais',
  'documentacao': 'Documentação'
}

const difficultyLabels = {
  'basico': 'Básico',
  'intermediario': 'Intermediário',
  'avancado': 'Avançado'
}

const difficultyColors = {
  'basico': 'bg-green-100 text-green-700',
  'intermediario': 'bg-yellow-100 text-yellow-700',
  'avancado': 'bg-red-100 text-red-700'
}

export default function ServicesPage() {
  const [services, setServices] = useState<NAFService[]>([])
  const [statsData, setStatsData] = useState<ServiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('priority')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)

        // Use the new stats API that provides real data
        const response = await fetch('/api/services/stats')
        const data: ServiceStats = await response.json()

        if (response.ok) {
          let servicesData = data.services || []

          // Apply filters
          if (selectedCategory !== 'all') {
            servicesData = servicesData.filter((s: NAFService) => s.category === selectedCategory)
          }
          if (selectedDifficulty !== 'all') {
            servicesData = servicesData.filter((s: NAFService) => s.difficulty === selectedDifficulty)
          }
          if (showFeaturedOnly) {
            servicesData = servicesData.filter((s: NAFService) => s.is_featured)
          }

          // Ordenação
          switch (sortBy) {
            case 'name':
              servicesData.sort((a: NAFService, b: NAFService) => a.name.localeCompare(b.name))
              break
            case 'popular':
              servicesData.sort((a: NAFService, b: NAFService) => b.views_count - a.views_count)
              break
            case 'rating':
              servicesData.sort((a: NAFService, b: NAFService) => b.satisfaction_rating - a.satisfaction_rating)
              break
            default: // priority
              servicesData.sort((a: NAFService, b: NAFService) => a.priority_order - b.priority_order)
          }

          setServices(servicesData)
          setStatsData(data)
        } else {
          console.error('Erro ao buscar estatísticas de serviços:', data.error || data)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de serviços:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [selectedCategory, selectedDifficulty, sortBy, showFeaturedOnly])

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !iconMap[iconName]) {
      return FileText
    }
    return iconMap[iconName]
  }

  const getColorClass = (colorScheme?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      teal: 'bg-teal-100 text-teal-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      pink: 'bg-pink-100 text-pink-600'
    }
    return colorMap[colorScheme || 'blue'] || colorMap.blue
  }

  const groupedServices = Object.entries(categoryLabels).map(([category, label]) => ({
    category,
    label,
    services: filteredServices.filter(service => service.category === category)
  }))

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-950">
      <MainNavigation />

      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Nossos Serviços
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
            O NAF Estácio Florianópolis oferece orientação fiscal e contábil gratuita com
            qualidade profissional. Conheça todos os nossos serviços disponíveis.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Atendimento Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Estudantes Qualificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>Supervisão Profissional</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center dark:bg-gray-900 dark:border-gray-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {statsData?.totals.services || services.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Serviços Disponíveis
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center dark:bg-gray-900 dark:border-gray-800">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {statsData?.totals.views?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Visualizações
                {statsData?.metadata.hasViewsTable === false && (
                  <span className="ml-1 text-xs text-gray-400">(mock)</span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center dark:bg-gray-900 dark:border-gray-800">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {statsData?.totals.requests?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Solicitações
                <span className="ml-1 text-xs text-green-600">(real)</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center dark:bg-gray-900 dark:border-gray-800">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {statsData?.totals.satisfaction?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Satisfação Média
                {statsData?.metadata.hasRatingsTable === false && (
                  <span className="ml-1 text-xs text-gray-400">(mock)</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md
                         bg-white dark:bg-gray-950 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as categorias</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as dificuldades</option>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            >
              <option value="priority">Relevância</option>
              <option value="name">Nome A-Z</option>
              <option value="popular">Mais Populares</option>
              <option value="rating">Melhor Avaliados</option>
            </select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="featured" className="text-sm text-gray-600 dark:text-gray-400">
                  Apenas em destaque
                </label>
              </div>
              <span className="text-sm text-gray-500">
                {filteredServices.length} serviços encontrados
              </span>
            </div>
          </div>
        </div>

        {/* Services Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {groupedServices
              .filter(group => group.services.length > 0)
              .map((group) => (
                <section key={group.category}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {group.label}
                    </h2>
                    <Badge variant="outline" className="px-3 py-1">
                      {group.services.length} serviços
                    </Badge>
                  </div>

                  <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }>
                    {group.services.map((service) => {
                      const IconComponent = getIconComponent(service.icon_name)

                      if (viewMode === 'list') {
                        return (
                          <Card key={service.id} className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
                            <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${getColorClass(service.color_scheme)}`}>
                                  <IconComponent className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                        {service.name}
                                        {service.is_featured && <Star className="inline h-4 w-4 text-yellow-500 ml-2" />}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                        {service.description}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                      <Badge className={difficultyColors[service.difficulty]}>
                                        {difficultyLabels[service.difficulty]}
                                      </Badge>
                                      {service.is_popular && (
                                        <Badge variant="secondary">
                                          <TrendingUp className="h-3 w-3 mr-1" />
                                          Popular
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        <span>{service.views_count}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        <span>{service.satisfaction_rating.toFixed(1)}</span>
                                      </div>
                                      {service.estimated_duration_minutes && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{service.estimated_duration_minutes}min</span>
                                        </div>
                                      )}
                                      <Link href={`/naf-scheduling?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(service.category)}`}>
                                        <Button size="sm">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Agendar
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      }

                      return (
                        <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getColorClass(service.color_scheme)}`}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">
                                    {service.name}
                                    {service.is_featured && <Star className="inline h-4 w-4 text-yellow-500 ml-2" />}
                                  </CardTitle>
                                  <CardDescription className=" dark:bg-gray-900 dark:border-gray-800">
                                    {service.subcategory || group.label}
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                              {service.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge className={difficultyColors[service.difficulty]}>
                                {difficultyLabels[service.difficulty]}
                              </Badge>
                              {service.is_popular && (
                                <Badge variant="secondary">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                              {service.estimated_duration_minutes && (
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {service.estimated_duration_minutes}min
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-gray-500">
                              <div className="text-center">
                                <Eye className="h-4 w-4 mx-auto mb-1" />
                                <span>{service.views_count}</span>
                              </div>
                              <div className="text-center">
                                <Users className="h-4 w-4 mx-auto mb-1" />
                                <span>{service.requests_count}</span>
                              </div>
                              <div className="text-center">
                                <Star className="h-4 w-4 mx-auto mb-1" />
                                <span>{service.satisfaction_rating.toFixed(1)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/services/${service.slug}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Button>
                              </Link>
                              <Link href={`/naf-scheduling?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(service.category)}`}>
                                <Button size="sm">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Agendar
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </section>
              ))}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tente ajustar os filtros de busca ou navegar pelas categorias.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setShowFeaturedOnly(false)
            }}>
              Limpar filtros
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Precisa de um serviço específico?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Entre em contato conosco para orientações personalizadas sobre questões fiscais e contábeis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/naf-scheduling">
              <Button size="lg" variant="secondary">
                <Calendar className="h-5 w-5 mr-2" />
                Agendar Atendimento
              </Button>
            </Link>
            <Link href="tel:(48)98461-4449">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm font-semibold">
                <span className="mr-2">📞</span>
                (48) 98461-4449
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>
      <NAFFooter />
    </>
  )
}
