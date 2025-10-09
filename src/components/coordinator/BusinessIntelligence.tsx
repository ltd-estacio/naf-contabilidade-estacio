'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  TrendingUp,
  Users,
  Settings,
  Star,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Clock,
  Target,
  Award,
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface BIData {
  general?: any
  performance?: any
  students?: any
  services?: any
  satisfaction?: any
  conversion?: any
  growth?: any
  metadata?: any
}

export default function BusinessIntelligence() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BIData>({})
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Carregando dados do Business Intelligence...')
      const response = await fetch('/api/coordinator/business-intelligence')
      const result = await response.json()

      if (response.ok) {
        setData(result)
        setLastUpdated(new Date().toLocaleString('pt-BR'))
        console.log('✅ Dados carregados com sucesso')
      } else {
        setError(result.error || 'Erro ao carregar dados')
        console.error('❌ Erro:', result.error)
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num || 0)
  }

  const formatPercentage = (num: number) => {
    return `${(num || 0).toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const renderGeneralSection = () => {
    const general = data.general

    if (!general) {
      return <div className="text-center py-8 text-gray-500">Carregando dados gerais...</div>
    }

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500" />
                  <Badge variant="secondary">{formatNumber(general.totals?.active_students || 0)} ativos</Badge>
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_students || 0)}</div>
                <p className="text-sm text-gray-600">Total de Estudantes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Settings className="h-8 w-8 text-green-500" />
                  <Badge variant="secondary">{formatNumber(general.totals?.active_services || 0)} ativos</Badge>
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_services || 0)}</div>
                <p className="text-sm text-gray-600">Serviços Disponíveis</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <Badge variant="secondary">{formatNumber(general.totals?.completed_attendances || 0)} concluídos</Badge>
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_attendances || 0)}</div>
                <p className="text-sm text-gray-600">Total de Atendimentos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                  <Badge variant="secondary">{formatNumber(general.totals?.total_conversations || 0)} conversas</Badge>
                </div>
                <div className="text-3xl font-bold">{formatNumber(general.totals?.total_chat_users || 0)}</div>
                <p className="text-sm text-gray-600">Usuários do Chat</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Categoria de Cliente
            </CardTitle>
            <CardDescription>Análise detalhada do público atendido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {general.categoryBreakdown?.slice(0, 8).map((cat: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat.category}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {formatNumber(cat.total)} atendimentos
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Taxa: {formatPercentage(cat.completion_rate)}
                        </Badge>
                        {cat.avg_rating > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {cat.avg_rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(cat.completed)}
                    </span>
                  </div>
                  <Progress value={cat.completion_rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Semanais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atendimentos por Dia da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {general.weekdayStats?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium w-12">{day.weekdayName}</span>
                    <Progress value={(day.total / Math.max(...general.weekdayStats.map((d: any) => d.total))) * 100} className="flex-1 h-3" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{formatNumber(day.total)} total</span>
                    <span className="text-sm font-medium text-green-600">{formatNumber(day.completed)} concluídos</span>
                    {day.cancelled > 0 && (
                      <span className="text-sm text-red-600">{formatNumber(day.cancelled)} cancelados</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Mensal (Últimos 12 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {general.monthlyStats?.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{month.monthName} {month.year}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">{formatNumber(month.total)}</span>
                      <span className="text-gray-600"> atendimentos</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{formatNumber(month.completed)}</span>
                      <span className="text-gray-600"> concluídos</span>
                    </div>
                    {month.cancelled > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-red-600">{formatNumber(month.cancelled)}</span>
                        <span className="text-gray-600"> cancelados</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPerformanceSection = () => {
    const performance = data.performance

    if (!performance) {
      return <div className="text-center py-8 text-gray-500">Carregando dados de performance...</div>
    }

    return (
      <div className="space-y-6">
        {/* Top Performing Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top 10 Estudantes por Produtividade
            </CardTitle>
            <CardDescription>Estudantes com melhor desempenho no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.students?.slice(0, 10).map((student: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.student_name}</p>
                      <p className="text-sm text-gray-600">{student.course} • {student.semester}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {student.productivity_score.toFixed(1)} pts
                      </Badge>
                      <div className="text-sm">
                        <span className="font-bold text-blue-600">{student.total_attendances}</span>
                        <span className="text-gray-600"> atendimentos</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-yellow-600">{student.avg_rating.toFixed(1)}</span>
                        <span className="text-gray-600"> ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Top 10 Serviços por Demanda
            </CardTitle>
            <CardDescription>Serviços mais solicitados e concluídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.services?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        <p className="text-sm text-gray-600">{service.category} • {service.difficulty}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{formatNumber(service.total_requests)}</div>
                        <div className="text-xs text-gray-600">solicitações</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Taxa de Conclusão</span>
                          <span className="font-medium">{formatPercentage(service.completion_rate)}</span>
                        </div>
                        <Progress value={service.completion_rate} className="h-2" />
                      </div>
                      {service.avg_rating > 0 && (
                        <Badge variant="secondary">
                          ⭐ {service.avg_rating.toFixed(1)}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {service.avg_duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Métricas de Tempo e Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {performance.performanceStats?.avg_attendance_duration?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média de Atendimento</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {performance.performanceStats?.avg_response_time_hours?.toFixed(1) || 0} h
                </div>
                <div className="text-sm text-gray-600 mt-1">Tempo Médio de Resposta (Chat)</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {performance.performanceStats?.avg_conversation_duration_minutes?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média de Conversa</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudentsSection = () => {
    const students = data.students

    if (!students) {
      return <div className="text-center py-8 text-gray-500">Carregando dados dos estudantes...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(students.statistics?.total || 0)}</div>
              <p className="text-sm text-gray-600">Total de Estudantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{students.statistics?.avg_productivity?.toFixed(2) || 0}</div>
              <p className="text-sm text-gray-600">Produtividade Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{students.statistics?.avg_rating?.toFixed(1) || 0}</div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(students.statistics?.total_hours || 0)}</div>
              <p className="text-sm text-gray-600">Total de Horas</p>
            </CardContent>
          </Card>
        </div>

        {/* Estudantes por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ativos</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(students.byStatus?.active?.length || 0)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inativos</span>
                  <Minus className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {formatNumber(students.byStatus?.inactive?.length || 0)}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Suspensos</span>
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(students.byStatus?.suspended?.length || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 15 Estudantes */}
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Estudantes</CardTitle>
            <CardDescription>Ranking completo de estudantes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.all?.slice(0, 15).map((student: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index < 3 ? 'bg-yellow-500' : index < 6 ? 'bg-gray-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.student_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{student.course}</span>
                        <span>•</span>
                        <span>{student.semester}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{student.status}</Badge>
                      </div>
                      {student.specialties && student.specialties.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {student.specialties.slice(0, 3).map((specialty: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      <span className="text-blue-600">{student.total_attendances}</span> atendimentos
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.completed_attendances} concluídos ({formatPercentage(student.completion_rate)})
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {student.avg_rating.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {student.productivity_score.toFixed(1)} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Curso */}
        <Card>
          <CardHeader>
            <CardTitle>Estudantes por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(students.byCourse || {}).map(([course, courseStudents]: [string, any], index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{course}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{courseStudents.length} estudantes</span>
                    <Badge variant="secondary">
                      {((courseStudents.length / (students.all?.length || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderServicesSection = () => {
    const services = data.services

    if (!services) {
      return <div className="text-center py-8 text-gray-500">Carregando dados dos serviços...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <Settings className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(services.statistics?.total || 0)}</div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Activity className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(services.statistics?.total_requests || 0)}</div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatPercentage(services.statistics?.avg_completion_rate || 0)}</div>
              <p className="text-sm text-gray-600">Taxa Média de Conclusão</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{(services.statistics?.avg_rating || 0).toFixed(1)}</div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Serviços Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 10 Serviços Mais Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.topRequested?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                        <h4 className="font-semibold">{service.service_name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{service.category}</Badge>
                        <Badge variant="secondary">{service.difficulty}</Badge>
                        {service.is_featured && <Badge variant="default">Destaque</Badge>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold text-blue-600">{formatNumber(service.total_requests)}</div>
                      <div className="text-xs text-gray-600">solicitações</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-lg font-bold text-green-600">{service.completed_count}</div>
                      <div className="text-xs text-gray-600">Concluídos</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <div className="text-lg font-bold text-yellow-600">{service.pending_count}</div>
                      <div className="text-xs text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="text-lg font-bold text-purple-600">{formatPercentage(service.completion_rate)}</div>
                      <div className="text-xs text-gray-600">Taxa</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div className="text-lg font-bold text-orange-600">
                        {service.avg_rating > 0 ? `⭐ ${service.avg_rating.toFixed(1)}` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Avaliação</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Serviços por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(services.byCategory || {}).map(([category, catServices]: [string, any], index: number) => {
                const totalRequests = catServices.reduce((sum: number, s: any) => sum + (s.total_requests || 0), 0)
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium capitalize">{category}</span>
                      <div className="text-sm text-gray-600 mt-1">{catServices.length} serviços</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{formatNumber(totalRequests)}</div>
                      <div className="text-xs text-gray-600">solicitações</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Melhor Avaliados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 10 Serviços Melhor Avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.topRated?.slice(0, 10).map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-gray-600">{formatNumber(service.total_requests)} solicitações</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">⭐ {service.avg_rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">de 5.0</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSatisfactionSection = () => {
    const satisfaction = data.satisfaction

    if (!satisfaction) {
      return <div className="text-center py-8 text-gray-500">Carregando dados de satisfação...</div>
    }

    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais do Chat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_users || 0)}</div>
              <p className="text-sm text-gray-600">Usuários do Chat</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.active_users || 0)} ativos
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Activity className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_conversations || 0)}</div>
              <p className="text-sm text-gray-600">Total de Conversas</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.active_conversations || 0)} ativas
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_feedback || 0)}</div>
              <p className="text-sm text-gray-600">Total de Feedbacks</p>
              <Badge variant="secondary" className="mt-2">
                ⭐ {(satisfaction.statistics?.avg_feedback_rating || 0).toFixed(1)}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold">{formatNumber(satisfaction.statistics?.total_appointments || 0)}</div>
              <p className="text-sm text-gray-600">Agendamentos via Chat</p>
              <Badge variant="secondary" className="mt-2">
                {formatNumber(satisfaction.statistics?.completed_appointments || 0)} concluídos
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Satisfação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-yellow-500 mb-2">
                {(satisfaction.satisfactionDistribution?.avg_rating || 0).toFixed(1)}
              </div>
              <div className="text-gray-600">de 5.0</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= (satisfaction.satisfactionDistribution?.avg_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = satisfaction.satisfactionDistribution?.[`rating_${rating}`] || 0
                  const total = satisfaction.satisfactionDistribution?.total_ratings || 1
                  const percentage = (count / total) * 100
                  return (
                    <div key={rating} className="text-center p-2 border rounded">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-gray-600">{rating} ⭐</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>NPS Score:</strong> {satisfaction.satisfactionDistribution?.nps_score?.toFixed(1) || 0}
                {' '}- Baseado em {formatNumber(satisfaction.satisfactionDistribution?.total_ratings || 0)} avaliações
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Crescimento de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(satisfaction.userGrowth?.daily?.slice(-7).reduce((sum: number, d: any) => sum + d.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimos 7 dias</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(satisfaction.userGrowth?.weekly?.slice(-4).reduce((sum: number, w: any) => sum + w.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimas 4 semanas</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(satisfaction.userGrowth?.monthly?.slice(-3).reduce((sum: number, m: any) => sum + m.count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600">Últimos 3 meses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Conversação */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Conversação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {satisfaction.conversationMetrics?.avg_messages_per_conversation?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Mensagens por Conversa</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {satisfaction.conversationMetrics?.avg_conversation_duration?.toFixed(0) || 0} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Duração Média</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {satisfaction.conversationMetrics?.avg_response_time?.toFixed(1) || 0} h
                </div>
                <div className="text-sm text-gray-600 mt-1">Tempo de Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes (Top 20)</CardTitle>
            <CardDescription>Últimos comentários de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfaction.recentFeedback?.slice(0, 20).map((feedback: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feedback.client_name}</span>
                      <Badge variant={feedback.source === 'chat' ? 'secondary' : 'outline'}>
                        {feedback.source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{feedback.feedback}"</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(feedback.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuários do Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados via Chat (Últimos 50)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {satisfaction.chatUsers?.slice(0, 50).map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span>•</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                    </div>
                    {user.city && (
                      <p className="text-xs text-gray-500">
                        {user.city} • {user.occupation || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !data.general) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Carregando Business Intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Business Intelligence - Análise Completa</span>
            </div>
            <Button
              onClick={loadData}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Análise detalhada com dados em tempo real de estudantes, serviços, atendimentos e satisfação do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Última atualização: {lastUpdated}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Estudantes</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Satisfação</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          {renderGeneralSection()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {renderPerformanceSection()}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {renderStudentsSection()}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {renderServicesSection()}
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-6">
          {renderSatisfactionSection()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
