'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react'

interface ChartData {
  month: string
  usuarios: number
  atendimentos: number
  servicos: number
}

interface ServiceData {
  name: string
  value: number
  color: string
}

interface DailyData {
  day: string
  agendamentos: number
  conclusoes: number
}

export default function Analytics() {
  const { data: _session } = useSession()
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [serviceData, setServiceData] = useState<ServiceData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalAttendances: 0,
    totalServices: 0,
    growthRate: 0
  })

  useEffect(() => {
    // Dados simulados - em produção viria da API
    const mockMonthlyData: ChartData[] = [
      { month: 'Jan', usuarios: 12, atendimentos: 45, servicos: 38 },
      { month: 'Fev', usuarios: 19, atendimentos: 62, servicos: 55 },
      { month: 'Mar', usuarios: 15, atendimentos: 58, servicos: 49 },
      { month: 'Abr', usuarios: 23, atendimentos: 78, servicos: 67 },
      { month: 'Mai', usuarios: 28, atendimentos: 95, servicos: 82 },
      { month: 'Jun', usuarios: 31, atendimentos: 112, servicos: 98 },
      { month: 'Jul', usuarios: 25, atendimentos: 88, servicos: 76 },
      { month: 'Ago', usuarios: 34, atendimentos: 125, servicos: 108 },
      { month: 'Set', usuarios: 39, atendimentos: 142, servicos: 125 },
      { month: 'Out', usuarios: 42, atendimentos: 156, servicos: 138 },
      { month: 'Nov', usuarios: 48, atendimentos: 178, servicos: 152 },
      { month: 'Dez', usuarios: 52, atendimentos: 195, servicos: 168 }
    ]

    const mockServiceData: ServiceData[] = [
      { name: 'Cadastro CPF', value: 35, color: '#8884d8' },
      { name: 'MEI', value: 28, color: '#82ca9d' },
      { name: 'Imposto de Renda', value: 22, color: '#ffc658' },
      { name: 'Inscrição Municipal', value: 18, color: '#ff7300' },
      { name: 'ICMS', value: 15, color: '#8dd1e1' },
      { name: 'ITR', value: 12, color: '#d084d0' },
      { name: 'Outros', value: 25, color: '#87d068' }
    ]

    const mockDailyData: DailyData[] = [
      { day: 'Seg', agendamentos: 8, conclusoes: 6 },
      { day: 'Ter', agendamentos: 12, conclusoes: 10 },
      { day: 'Qua', agendamentos: 15, conclusoes: 13 },
      { day: 'Qui', agendamentos: 18, conclusoes: 16 },
      { day: 'Sex', agendamentos: 22, conclusoes: 19 },
      { day: 'Sáb', agendamentos: 5, conclusoes: 4 },
      { day: 'Dom', agendamentos: 2, conclusoes: 2 }
    ]

    setMonthlyData(mockMonthlyData)
    setServiceData(mockServiceData)
    setDailyData(mockDailyData)

    // Calcular estatísticas totais
    const totalUsers = mockMonthlyData.reduce((sum, item) => sum + item.usuarios, 0)
    const totalAttendances = mockMonthlyData.reduce((sum, item) => sum + item.atendimentos, 0)
    const totalServices = mockMonthlyData.reduce((sum, item) => sum + item.servicos, 0)
    
    // Calcular taxa de crescimento (comparando últimos 2 meses)
    const currentMonth = mockMonthlyData[mockMonthlyData.length - 1]
    const previousMonth = mockMonthlyData[mockMonthlyData.length - 2]
    const growthRate = previousMonth ? 
      ((currentMonth.usuarios - previousMonth.usuarios) / previousMonth.usuarios * 100) : 0

    setTotalStats({
      totalUsers,
      totalAttendances,
      totalServices,
      growthRate
    })

    setLoading(false)
  }, [])

  const exportChartData = () => {
    const data = {
      resumo: {
        geradoEm: new Date().toISOString(),
        totalUsuarios: totalStats.totalUsers,
        totalAtendimentos: totalStats.totalAttendances,
        totalServicos: totalStats.totalServices,
        crescimentoMensal: `${totalStats.growthRate.toFixed(1)}%`
      },
      dadosMensais: monthlyData,
      servicosMaisSolicitados: serviceData,
      atendimentosDiarios: dailyData
    }

    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `analytics_naf_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics e Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Visualize o desempenho e estatísticas do NAF</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportChartData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${totalStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalStats.growthRate >= 0 ? '+' : ''}{totalStats.growthRate.toFixed(1)}%
              </span> desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atendimentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">
              Média de {(totalStats.totalAttendances / 12).toFixed(1)} por mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {((totalStats.totalServices / totalStats.totalAttendances) * 100).toFixed(1)}% taxa de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalStats.totalServices / totalStats.totalAttendances) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Atendimentos que viram serviços completos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <p className="text-sm text-gray-600">
            Acompanhe o crescimento de usuários, atendimentos e serviços ao longo do ano
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'usuarios' ? 'Usuários' : 
                    name === 'atendimentos' ? 'Atendimentos' : 'Serviços'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="usuarios" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="atendimentos" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="servicos" 
                  stackId="3" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Serviços Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Solicitados</CardTitle>
            <p className="text-sm text-gray-600">
              Distribuição dos tipos de serviços prestados
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Atendimentos por Dia da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Dia da Semana</CardTitle>
            <p className="text-sm text-gray-600">
              Padrão de agendamentos e conclusões durante a semana
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="agendamentos" fill="#8884d8" name="Agendamentos" />
                  <Bar dataKey="conclusoes" fill="#82ca9d" name="Conclusões" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Mês</th>
                  <th className="text-left p-3 font-medium">Novos Usuários</th>
                  <th className="text-left p-3 font-medium">Atendimentos</th>
                  <th className="text-left p-3 font-medium">Serviços Concluídos</th>
                  <th className="text-left p-3 font-medium">Taxa de Conclusão</th>
                  <th className="text-left p-3 font-medium">Crescimento</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => {
                  const conclusionRate = (data.servicos / data.atendimentos * 100).toFixed(1)
                  const growth = index > 0 
                    ? ((data.usuarios - monthlyData[index - 1].usuarios) / monthlyData[index - 1].usuarios * 100).toFixed(1)
                    : '0.0'
                  
                  return (
                    <tr key={data.month} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{data.month}</td>
                      <td className="p-3">{data.usuarios}</td>
                      <td className="p-3">{data.atendimentos}</td>
                      <td className="p-3">{data.servicos}</td>
                      <td className="p-3">{conclusionRate}%</td>
                      <td className="p-3">
                        <span className={`${parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">📈 Pontos Positivos</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Crescimento consistente de novos usuários</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Alta taxa de conclusão de serviços ({((totalStats.totalServices / totalStats.totalAttendances) * 100).toFixed(1)}%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Quinta-feira é o dia mais produtivo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Serviços de CPF e MEI são os mais demandados</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">💡 Oportunidades</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>Aumentar disponibilidade aos finais de semana</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>Criar campanhas para serviços menos procurados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>Implementar sistema de follow-up automático</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>Capacitar mais voluntários para atender demanda</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
