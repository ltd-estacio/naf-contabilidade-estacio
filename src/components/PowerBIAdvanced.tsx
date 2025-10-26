'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, RefreshCw, Download, TrendingUp, Users, FileText, Activity, Calendar, Clock, Award,
  ExternalLink, Share2, Zap, Eye
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Line, AreaChart, Area,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts'

interface DashboardData {
  resumo: {
    totalUsuarios: number
    totalServicos: number
    totalDemandas: number
    totalAtendimentos: number
    demandasPendentes: number
    atendimentosConcluidos: number
    taxaConclusao: number
  }
  dadosMensais: Array<{
    mes: string
    demandas: number
    atendimentos: number
  }>
  categorias: Record<string, number>
  topServicos: Array<{
    nome: string
    categoria: string
    totalDemandas: number
  }>
  usuarios: Array<{
    nome: string
    email: string
    papel: string
    telefone: string
    dataCadastro: string
    totalDemandas: number
    totalAtendimentos: number
  }>
}

const CORES_GRAFICOS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
  '#d084d0', '#87d068', '#ffa940', '#597ef7', '#73d13d'
]

export default function PowerBIAdvanced() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const carregarDados = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reports/coordenador')
      const result = await response.json()
      
      if (result.success) {
        const rawData = result.data
        setData({
          resumo: rawData.resumo,
          dadosMensais: rawData.dadosMensais,
          categorias: rawData.categorias,
          topServicos: rawData.servicos
            .sort((a: unknown, b: unknown) => b.totalDemandas - a.totalDemandas)
            .slice(0, 10),
          usuarios: rawData.usuarios
        })
        setLastUpdate(new Date())
      } else {
        setError(result.error || 'Erro ao carregar dados')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const abrirPowerBIOnline = () => {
    // Simula abertura do Power BI Online com dados
    window.open('https://powerbi.microsoft.com/pt-br/getting-started-with-power-bi/', '_blank')
  }

  const conectarPowerBIDesktop = async () => {
    try {
      // Gerar arquivo de conexão para Power BI Desktop
      const connectionData = {
        server: window.location.origin,
        endpoints: {
          coordenador: '/api/reports/coordenador',
          powerbi: '/api/reports/powerbi',
          services: '/api/services',
          stats: '/api/dashboard/stats'
        },
        instructions: 'Use estes endpoints para conectar seu Power BI Desktop aos dados em tempo real'
      }
      
      const blob = new Blob([JSON.stringify(connectionData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'powerbi-connection-naf.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao gerar arquivo de conexão:', error)
    }
  }

  const exportarDados = async (formato: 'xlsx' | 'json' | 'csv') => {
    try {
      let url = '/api/reports/powerbi'
      let filename = `naf-dados-${new Date().toISOString().split('T')[0]}`
      
      switch (formato) {
        case 'xlsx':
          url += '?format=xlsx'
          filename += '.xlsx'
          break
        case 'json':
          url = '/api/reports/coordenador'
          filename += '.json'
          break
        case 'csv':
          url += '?format=csv'
          filename += '.csv'
          break
      }
      
      const response = await fetch(url)
      const blob = await response.blob()
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      setError('Erro ao exportar dados')
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(carregarDados, 30000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  // Preparar dados para gráficos
  const dadosCategoriasChart = data ? Object.entries(data.categorias).map(([nome, valor]) => ({
    nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome,
    valor,
    nomeCompleto: nome
  })) : []

  const dadosEvolucaoChart = data ? data.dadosMensais.map(item => ({
    ...item,
    eficiencia: item.demandas > 0 ? Math.round((item.atendimentos / item.demandas) * 100) : 0
  })) : []

  const dadosStatusChart = data ? [
    { nome: 'Concluídos', valor: data.resumo.atendimentosConcluidos, cor: '#22c55e' },
    { nome: 'Pendentes', valor: data.resumo.demandasPendentes, cor: '#f59e0b' },
  ] : []

  const dadosPerformanceChart = data ? [
    { nome: 'Taxa de Conclusão', valor: data.resumo.taxaConclusao, max: 100 }
  ] : []

  return (
    <div className="space-y-6">
      {/* Cabeçalho Avançado */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Dashboard Avançado Power BI - NAF Contábil
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Visualizações profissionais com integração direta ao Power BI Online e Desktop
                {lastUpdate && (
                  <span className="block text-sm mt-1">
                    Última atualização: {lastUpdate.toLocaleString('pt-BR')}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="bg-white dark:bg-gray-950/20 text-white">
                {data ? 'Conectado' : 'Carregando...'}
              </Badge>
              {autoRefresh && (
                <Badge variant="secondary" className="bg-green-500 text-white animate-pulse">
                  Auto-refresh Ativo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles Avançados */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Button 
              onClick={carregarDados} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Auto-refresh
            </Button>
            
            <Button 
              onClick={abrirPowerBIOnline}
              className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Power BI Online
            </Button>
            
            <Button 
              onClick={conectarPowerBIDesktop}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Conectar Desktop
            </Button>
            
            <Button 
              onClick={() => exportarDados('xlsx')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            
            <Button 
              onClick={() => exportarDados('json')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              JSON
            </Button>
            
            <Button 
              onClick={() => exportarDados('csv')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos Avançados
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Serviços NAF
            </TabsTrigger>
          </TabsList>

          {/* Tab Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs Principais - Design Melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total de Usuários</p>
                      <p className="text-3xl font-bold text-blue-700">{data.resumo.totalUsuarios}</p>
                      <p className="text-xs text-blue-500 mt-1">Cadastrados no sistema</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Atendimentos</p>
                      <p className="text-3xl font-bold text-green-700">{data.resumo.totalAtendimentos}</p>
                      <p className="text-xs text-green-500 mt-1">Realizados</p>
                    </div>
                    <Activity className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-700">{data.resumo.demandasPendentes}</p>
                      <p className="text-xs text-yellow-500 mt-1">Aguardando atendimento</p>
                    </div>
                    <Clock className="h-12 w-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Taxa de Conclusão</p>
                      <p className="text-3xl font-bold text-purple-700">{data.resumo.taxaConclusao}%</p>
                      <p className="text-xs text-purple-500 mt-1">Eficiência geral</p>
                    </div>
                    <Award className="h-12 w-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Status - Pizza */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Atendimentos</CardTitle>
                <CardDescription>Distribuição entre concluídos e pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={dadosStatusChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                      label={({ nome, valor, percent }: unknown) => `${nome}: ${valor} (${((percent || 0) * 100).toFixed(1)}%)`}
                    >
                      {dadosStatusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Gráficos Avançados */}
          <TabsContent value="charts" className="space-y-6">
            {/* Evolução Mensal - Gráfico Combinado */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal Detalhada</CardTitle>
                <CardDescription>Demandas, atendimentos e eficiência ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={dadosEvolucaoChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="demandas" fill="#8884d8" name="Demandas" />
                    <Bar yAxisId="left" dataKey="atendimentos" fill="#82ca9d" name="Atendimentos" />
                    <Line yAxisId="right" type="monotone" dataKey="eficiencia" stroke="#ff7300" strokeWidth={3} name="Eficiência %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Categorias - Gráfico de Barras Horizontal */}
            <Card>
              <CardHeader>
                <CardTitle>Demandas por Categoria</CardTitle>
                <CardDescription>Análise detalhada das categorias mais solicitadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart layout="horizontal" data={dadosCategoriasChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={120} />
                    <Tooltip
                      formatter={(value: number, _name: string, context?: { payload?: { nomeCompleto?: string } }) => {
                        const displayName = context?.payload?.nomeCompleto ?? _name
                        return [value, `${displayName}: ${value} demandas`]
                      }}
                    />
                    <Bar dataKey="valor" fill="#8884d8">
                      {dadosCategoriasChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radial */}
            <Card>
              <CardHeader>
                <CardTitle>Indicador de Performance</CardTitle>
                <CardDescription>Taxa de conclusão em formato radial</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={dadosPerformanceChart}>
                    <RadialBar dataKey="valor" cornerRadius={10} fill="#8884d8" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conclusão']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Top 10 Serviços */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Serviços Mais Demandados</CardTitle>
                <CardDescription>Ranking completo com análise detalhada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topServicos.map((servico, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{servico.nome}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{servico.categoria}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-lg font-bold">
                          {servico.totalDemandas}
                        </Badge>
                        <div className="text-xs text-gray-500">demandas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise de Tendências */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>Área de tendência ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dadosEvolucaoChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="demandas" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="atendimentos" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Usuários */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Usuários</CardTitle>
                <CardDescription>Distribuição e estatísticas dos usuários cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.usuarios.filter(u => u.papel === 'STUDENT').length}
                    </div>
                    <div className="text-sm text-blue-600">Estudantes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.usuarios.filter(u => u.papel === 'TEACHER').length}
                    </div>
                    <div className="text-sm text-green-600">Professores</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.usuarios.filter(u => u.papel === 'COORDINATOR').length}
                    </div>
                    <div className="text-sm text-purple-600">Coordenadores</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-900">
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Papel</th>
                        <th className="text-center p-3">Demandas</th>
                        <th className="text-center p-3">Atendimentos</th>
                        <th className="text-left p-3">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.usuarios.slice(0, 20).map((usuario, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:bg-gray-900">
                          <td className="p-3 font-medium">{usuario.nome}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{usuario.email}</td>
                          <td className="p-3">
                            <Badge variant={
                              usuario.papel === 'COORDINATOR' ? 'default' : 
                              usuario.papel === 'TEACHER' ? 'secondary' : 'outline'
                            }>
                              {usuario.papel}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">{usuario.totalDemandas}</td>
                          <td className="p-3 text-center">{usuario.totalAtendimentos}</td>
                          <td className="p-3">{usuario.dataCadastro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Power BI */}
          <TabsContent value="services" className="space-y-6">
            {/* Estatísticas de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Serviços Ativos</p>
                      <p className="text-2xl font-bold">21</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Demandas Hoje</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Taxa Sucesso</p>
                      <p className="text-2xl font-bold">94%</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-100" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Tempo Médio</p>
                      <p className="text-2xl font-bold">2.3h</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Serviços NAF Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Todos os Serviços NAF Disponíveis
                </CardTitle>
                <CardDescription>
                  Serviços fiscais e contábeis oferecidos pelo Núcleo de Apoio Contábil Fiscal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { nome: "Cadastro CPF", categoria: "Cadastral", demandas: 45, status: "Ativo", cor: "green" },
                    { nome: "Orientação IR", categoria: "Tributário", demandas: 38, status: "Ativo", cor: "blue" },
                    { nome: "MEI", categoria: "Empresarial", demandas: 32, status: "Ativo", cor: "purple" },
                    { nome: "CNPJ", categoria: "Cadastral", demandas: 28, status: "Ativo", cor: "orange" },
                    { nome: "ITR", categoria: "Tributário", demandas: 22, status: "Ativo", cor: "red" },
                    { nome: "Certidões Negativas", categoria: "Documentos", demandas: 18, status: "Ativo", cor: "teal" },
                    { nome: "Parcelamento", categoria: "Tributário", demandas: 15, status: "Ativo", cor: "indigo" },
                    { nome: "E-Social Doméstico", categoria: "Trabalhista", demandas: 12, status: "Ativo", cor: "pink" },
                    { nome: "Simples Nacional", categoria: "Empresarial", demandas: 25, status: "Ativo", cor: "cyan" },
                    { nome: "Comércio Exterior", categoria: "Internacional", demandas: 8, status: "Ativo", cor: "yellow" },
                    { nome: "DARF", categoria: "Tributário", demandas: 20, status: "Ativo", cor: "emerald" },
                    { nome: "GPS", categoria: "Previdenciário", demandas: 16, status: "Ativo", cor: "rose" }
                  ].map((servico, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{servico.nome}</CardTitle>
                          <Badge 
                            className={`
                              ${servico.cor === 'green' ? 'bg-green-100 text-green-700' :
                                servico.cor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                servico.cor === 'purple' ? 'bg-purple-100 text-purple-700' :
                                servico.cor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                servico.cor === 'red' ? 'bg-red-100 text-red-700' :
                                servico.cor === 'teal' ? 'bg-teal-100 text-teal-700' :
                                servico.cor === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                                servico.cor === 'pink' ? 'bg-pink-100 text-pink-700' :
                                servico.cor === 'cyan' ? 'bg-cyan-100 text-cyan-700' :
                                servico.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                servico.cor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-rose-100 text-rose-700'
                              }
                            `}
                          >
                            {servico.status}
                          </Badge>
                        </div>
                        <CardDescription>{servico.categoria}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{servico.demandas}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Solicitações este mês</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Solicitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agendamento Rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Agendamento Rápido</CardTitle>
                <CardDescription>
                  Solicite atendimento para qualquer serviço NAF de forma rápida e eficiente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Serviço Desejado</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione um serviço</option>
                      <option value="cpf">Cadastro CPF</option>
                      <option value="ir">Orientação IR</option>
                      <option value="mei">MEI</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="itr">ITR</option>
                      <option value="certidoes">Certidões Negativas</option>
                      <option value="parcelamento">Parcelamento</option>
                      <option value="esocial">E-Social Doméstico</option>
                      <option value="simples">Simples Nacional</option>
                      <option value="comercio">Comércio Exterior</option>
                      <option value="darf">DARF</option>
                      <option value="gps">GPS</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Data Preferida</label>
                    <input 
                      type="date" 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Urgência</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-2">Descrição da Necessidade</label>
                    <textarea 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      rows={4}
                      placeholder="Descreva detalhadamente sua necessidade e quaisquer documentos que você já possui..."
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                      <Calendar className="h-5 w-5 mr-2" />
                      Solicitar Agendamento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
