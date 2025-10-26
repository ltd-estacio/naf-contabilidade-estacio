'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
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

const difficultyLabels = {
  'basico': 'Básico',
  'intermediario': 'Intermediário',
  'avancado': 'Avançado'
}

export default function NAFServicesShowcase() {
  const [services, setServices] = useState<NAFService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedServices()
  }, [])

  const loadFeaturedServices = async () => {
    try {
      const response = await fetch('/api/naf-services?featured=true&limit=6')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        console.error('Erro ao carregar serviços:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !iconMap[iconName]) {
      return FileText
    }
    return iconMap[iconName]
  }

  const getColorClass = (colorScheme?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
    }
    return colorMap[colorScheme || 'blue'] || colorMap.blue
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => {
        const IconComponent = getIconComponent(service.icon_name)

        return (
          <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md dark:bg-gray-800 dark:hover:shadow-gray-700/20">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${getColorClass(service.color_scheme)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  {service.status === 'ativo' && (
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Disponível
                    </Badge>
                  )}
                  {service.is_popular && (
                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">
                {service.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 dark:text-gray-400">
                {service.description}
              </CardDescription>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">
                  {difficultyLabels[service.difficulty]}
                </span>
                {service.estimated_duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{service.estimated_duration_minutes}min</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
