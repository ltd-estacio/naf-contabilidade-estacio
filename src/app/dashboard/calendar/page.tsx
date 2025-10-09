'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Filter, RefreshCw } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  type: 'schedule' | 'attendance'
  status: string
  clientName?: string
  serviceName?: string
  createdAt: string
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    schedules: 0,
    attendances: 0,
    completed: 0,
    pending: 0
  })

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (dateFilter) {
        params.append('startDate', dateFilter)
        const endDate = new Date(dateFilter)
        endDate.setMonth(endDate.getMonth() + 1)
        params.append('endDate', endDate.toISOString().split('T')[0])
      }
      
      const response = await fetch(`/api/schedule?${params}`)
      if (!response.ok) {
        throw new Error(`Erro ao carregar eventos: ${response.status}`)
      }
      
      const result = await response.json()
      const eventsList = result.data || []
      
      setEvents(eventsList)
      
      // Calcular estatísticas
      const schedules = eventsList.filter((e: Event) => e.type === 'schedule').length
      const attendances = eventsList.filter((e: Event) => e.type === 'attendance').length
      const completed = eventsList.filter((e: Event) => e.status === 'completed').length
      const pending = eventsList.filter((e: Event) => e.status === 'pending' || e.status === 'scheduled').length
      
      setStats({
        total: eventsList.length,
        schedules,
        attendances,
        completed,
        pending
      })
      
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [dateFilter])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'schedules') return event.type === 'schedule'
    if (filter === 'attendances') return event.type === 'attendance'
    if (filter === 'completed') return event.status === 'completed'
    if (filter === 'pending') return event.status === 'pending' || event.status === 'scheduled'
    return true
  })

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  const getEventBadgeColor = (type: string, status: string) => {
    if (type === 'schedule') {
      return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
    }
    return status === 'completed' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Você precisa fazer login para acessar o calendário.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Calendário Integrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Agendamentos e atendimentos unificados
          </p>
        </div>
        <Button onClick={loadEvents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de Eventos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.schedules}</div>
            <div className="text-sm text-gray-600">Agendamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.attendances}</div>
            <div className="text-sm text-gray-600">Atendimentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Concluídos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                <SelectItem value="schedules">Agendamentos</SelectItem>
                <SelectItem value="attendances">Atendimentos</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
              placeholder="Filtrar por mês"
            />
            
            {(filter !== 'all' || dateFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilter('all')
                  setDateFilter('')
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Carregando eventos...
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">
              ❌ {error}
            </div>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              {filter === 'all' && !dateFilter ? 
                'Nenhum evento encontrado. Crie seu primeiro agendamento!' :
                'Nenhum evento encontrado com os filtros aplicados.'
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge className={getEventBadgeColor(event.type, event.status)}>
                        {event.type === 'schedule' ? 'Agendamento' : 'Atendimento'}
                      </Badge>
                      <Badge variant="outline">
                        {event.status === 'completed' ? 'Concluído' : 
                         event.status === 'pending' ? 'Pendente' : 
                         event.status === 'scheduled' ? 'Agendado' : event.status}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDateTime(event.startTime)}</span>
                      </div>
                      
                      {event.clientName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{event.clientName}</span>
                        </div>
                      )}
                      
                      {event.serviceName && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{event.serviceName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
