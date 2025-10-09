'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainNavigation from '@/components/MainNavigation'
import {
  Calculator,
  FileText,
  Users,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Clock,
  Star,
  TrendingUp,
  Building2,
  BookOpen,
  Shield,
  UserCheck,
  BarChart3,
  Heart
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

const statusLabels = {
  'ativo': 'Ativo',
  'inativo': 'Inativo',
  'em_desenvolvimento': 'Em Desenvolvimento'
}

export default function NAFServicesAdmin() {
  const [services, setServices] = useState<NAFService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchServices()
  }, [selectedCategory, selectedStatus])

  const fetchServices = async () => {
    try {
      setLoading(true)
      let url = '/api/naf-services?'

      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`
      }
      if (selectedStatus !== 'all') {
        url += `status=${selectedStatus}&`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setServices(data.services || [])
      } else {
        console.error('Erro ao buscar serviços:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <MainNavigation />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gerenciamento de Serviços NAF
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administre todos os serviços oferecidos pelo Núcleo de Apoio Fiscal
              </p>
            </div>
            <Button className="w-fit">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                     bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredServices.length} serviços
            </span>
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = getIconComponent(service.icon_name)
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
                            {categoryLabels[service.category as keyof typeof categoryLabels]}
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
                      <Badge variant="outline" className="text-xs">
                        {difficultyLabels[service.difficulty]}
                      </Badge>
                      <Badge
                        variant={service.status === 'ativo' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {statusLabels[service.status]}
                      </Badge>
                      {service.is_popular && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar os filtros ou criar um novo serviço.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}