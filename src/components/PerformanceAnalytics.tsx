'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, TrendingDown, Activity, Clock, 
  Target, Award, Zap, RefreshCw
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts'

interface PerformanceMetrics {
  overall: {
    score: number
    trend: 'up' | 'down' | 'stable'
    previousScore: number
  }
  efficiency: {
    demandsPerHour: number
    avgResponseTime: number
    completionRate: number
  }
  quality: {
    satisfactionScore: number
    errorRate: number
    reworkRate: number
  }
  productivity: {
    totalDemands: number
    completedDemands: number
    pendingDemands: number
    activeUsers: number
  }
  trends: Array<{
    date: string
    score: number
    demands: number
    satisfaction: number
  }>
}

export default function PerformanceAnalytics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Simular dados de performance (em uma implementação real, viriam da API)
      const mockMetrics: PerformanceMetrics = {
        overall: {
          score: 87,
          trend: 'up',
          previousScore: 82
        },
        efficiency: {
          demandsPerHour: 3.2,
          avgResponseTime: 45, // minutos
          completionRate: 89.5
        },
        quality: {
          satisfactionScore: 4.6,
          errorRate: 2.3,
          reworkRate: 5.8
        },
        productivity: {
          totalDemands: 156,
          completedDemands: 139,
          pendingDemands: 17,
          activeUsers: 23
        },
        trends: [
          { date: '01/09', score: 78, demands: 12, satisfaction: 4.2 },
          { date: '02/09', score: 82, demands: 15, satisfaction: 4.4 },
          { date: '03/09', score: 85, demands: 18, satisfaction: 4.5 },
          { date: '04/09', score: 87, demands: 21, satisfaction: 4.6 },
          { date: '05/09', score: 87, demands: 19, satisfaction: 4.6 }
        ]
      }

      // Adicionar variação realística
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMetrics(mockMetrics)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchMetrics, 120000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const efficiencyData = [
    { name: 'Demandas/Hora', value: metrics.efficiency.demandsPerHour, max: 5 },
    { name: 'Tempo Resposta', value: 60 - metrics.efficiency.avgResponseTime, max: 60 },
    { name: 'Taxa Conclusão', value: metrics.efficiency.completionRate, max: 100 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Performance</h2>
          <p className="text-gray-600">Métricas em tempo real do sistema NAF</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button
            onClick={fetchMetrics}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Score Geral */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Score Geral de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {metrics.overall.score}
            </div>
            <div className="flex-1">
              <Progress value={metrics.overall.score} className="h-3 mb-2" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getTrendIcon(metrics.overall.trend)}
                <span>
                  {metrics.overall.trend === 'up' 
                    ? `+${metrics.overall.score - metrics.overall.previousScore}` 
                    : metrics.overall.trend === 'down'
                    ? `-${metrics.overall.previousScore - metrics.overall.score}`
                    : '0'
                  } pontos desde ontem
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas/Hora</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.efficiency.demandsPerHour}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.efficiency.avgResponseTime}min</div>
            <p className="text-xs text-muted-foreground">
              -8min desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.efficiency.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.quality.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              +0.2 desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Performance</CardTitle>
            <CardDescription>Score geral nos últimos 5 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  fill="url(#scoreGradient)" 
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Eficiência</CardTitle>
            <CardDescription>Métricas normalizadas de 0-100</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Status Operacional</CardTitle>
          <CardDescription>Visão detalhada do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Produtividade</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Demandas Totais</span>
                  <span className="font-medium">{metrics.productivity.totalDemands}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Concluídas</span>
                  <span className="font-medium text-green-600">{metrics.productivity.completedDemands}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendentes</span>
                  <span className="font-medium text-yellow-600">{metrics.productivity.pendingDemands}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Qualidade</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Erro</span>
                  <span className="font-medium text-red-600">{metrics.quality.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retrabalho</span>
                  <span className="font-medium text-yellow-600">{metrics.quality.reworkRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Satisfação</span>
                  <span className="font-medium text-green-600">{metrics.quality.satisfactionScore}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recursos</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usuários Ativos</span>
                  <span className="font-medium">{metrics.productivity.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capacidade</span>
                  <span className="font-medium text-blue-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Disponibilidade</span>
                  <span className="font-medium text-green-600">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
