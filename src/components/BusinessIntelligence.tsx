// Componente de Business Intelligence - NAF Contábil
// Com 5 seções: Geral, Performance, Estudantes, Serviços e Satisfação

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity, Users, Briefcase, Star, TrendingUp, Clock,
  Award, Target, BarChart3, PieChart, RefreshCw, Download,
  CheckCircle, AlertCircle, MessageSquare, Calendar, Trophy
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

export default function BusinessIntelligence() {
  const [activeTab, setActiveTab] = useState('geral')
  const [periodo, setPeriodo] = useState('30')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [dados, setDados] = useState<any>(null)

  useEffect(() => {
    carregarDados()
  }, [activeTab, periodo])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/business-intelligence?secao=${activeTab}&periodo=${periodo}`)
      const result = await response.json()

      if (result.success) {
        setDados(result.dados)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizar = async () => {
    setRefreshing(true)
    await carregarDados()
    setRefreshing(false)
  }

  if (loading && !dados) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Business Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400">Sistema completo de análises detalhadas, exportação e integração Power BI</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último ano</option>
          </select>

          <Button
            onClick={atualizar}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">
            <Activity className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="estudantes">
            <Users className="h-4 w-4 mr-2" />
            Estudantes
          </TabsTrigger>
          <TabsTrigger value="servicos">
            <Briefcase className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="satisfacao">
            <Star className="h-4 w-4 mr-2" />
            Satisfação
          </TabsTrigger>
        </TabsList>

        {/* ==================== SEÇÃO GERAL ==================== */}
        <TabsContent value="geral" className="space-y-6">
          {dados && (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Atendimentos</p>
                        <p className="text-3xl font-bold">{dados.metricas?.totalAtendimentos || 0}</p>
                        <p className="text-blue-100 text-xs mt-1">Total no período</p>
                      </div>
                      <CheckCircle className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Taxa Conclusão</p>
                        <p className="text-3xl font-bold">{dados.metricas?.taxaConclusao?.toFixed(1) || 0}%</p>
                        <p className="text-green-100 text-xs mt-1">Atendimentos concluídos</p>
                      </div>
                      <Target className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Satisfação</p>
                        <p className="text-3xl font-bold">{dados.metricas?.satisfacaoMedia?.toFixed(1) || 0}</p>
                        <p className="text-yellow-100 text-xs mt-1">De 5.0</p>
                      </div>
                      <Star className="h-12 w-12 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Crescimento</p>
                        <p className="text-3xl font-bold">{dados.metricas?.crescimento?.toFixed(1) || 0}%</p>
                        <p className="text-purple-100 text-xs mt-1">vs. período anterior</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolução Mensal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Evolução de Atendimentos
                    </CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dados.evolucaoMensal && (
                      <div className="h-64">
                        <Line
                          data={{
                            labels: dados.evolucaoMensal.map((m: any) => m.mes),
                            datasets: [{
                              label: 'Atendimentos',
                              data: dados.evolucaoMensal.map((m: any) => m.atendimentos),
                              borderColor: 'rgb(59, 130, 246)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' } },
                            scales: { y: { beginAtZero: true } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Distribuição por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Distribuição por Status
                    </CardTitle>
                    <CardDescription>Status dos atendimentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dados.statusDistribuicao && (
                      <div className="h-64">
                        <Doughnut
                          data={{
                            labels: ['Concluído', 'Em Andamento', 'Agendado', 'Cancelado'],
                            datasets: [{
                              data: [
                                dados.statusDistribuicao.concluido,
                                dados.statusDistribuicao.emAndamento,
                                dados.statusDistribuicao.agendado,
                                dados.statusDistribuicao.cancelado
                              ],
                              backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
                              borderWidth: 0
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Estudantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {dados.estudantesAtivos || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">estudantes ativos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-500" />
                      Serviços
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {dados.servicosDisponiveis || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">serviços disponíveis</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      Duração Média
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {dados.duracaoMedia || 0} min
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">por atendimento</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ==================== SEÇÃO PERFORMANCE ==================== */}
        <TabsContent value="performance" className="space-y-6">
          {dados && (
            <>
              {/* Métricas de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{dados.metricas?.totalAtendimentos || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Atendimentos</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{dados.metricas?.mediaSatisfacao?.toFixed(1) || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Média Satisfação</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{dados.metricas?.horasTotais?.toFixed(0) || 0}h</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Horas Totais</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Estudantes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top 15 Estudantes por Performance
                  </CardTitle>
                  <CardDescription>Ranking baseado em horas e satisfação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Rank</th>
                          <th className="text-left p-2">Nome</th>
                          <th className="text-center p-2">Atendimentos</th>
                          <th className="text-center p-2">Horas</th>
                          <th className="text-center p-2">Satisfação</th>
                          <th className="text-center p-2">Taxa Conclusão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.estudantes?.map((estudante: any, index: number) => (
                          <tr key={estudante.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="p-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-2 font-medium">{estudante.nome}</td>
                            <td className="p-2 text-center">{estudante.totalAtendimentos}</td>
                            <td className="p-2 text-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {estudante.totalHoras}h
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                {estudante.satisfacaoMedia?.toFixed(1) || 'N/A'}
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <Badge variant={estudante.taxaConclusao >= 80 ? 'default' : 'secondary'}>
                                {estudante.taxaConclusao?.toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Performance dos Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Top 10 Serviços Mais Solicitados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dados.servicos?.map((servico: any, index: number) => (
                      <div key={servico.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="font-medium">{servico.nome}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {servico.solicitacoes} solicitações • {servico.visualizacoes} visualizações
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {servico.satisfacao?.toFixed(1)} ★
                          </Badge>
                          <Badge variant="secondary">
                            {servico.taxaConversao?.toFixed(1)}% conversão
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== SEÇÃO ESTUDANTES ==================== */}
        <TabsContent value="estudantes" className="space-y-6">
          {dados && (
            <>
              {/* Estatísticas de Estudantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{dados.estatisticas?.total || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total de Estudantes</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{dados.estatisticas?.ativos || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ativos</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{dados.estatisticas?.mediaSatisfacao?.toFixed(1) || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Satisfação Média</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{dados.estatisticas?.mediaHoras?.toFixed(1) || 0}h</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Média de Horas</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Distribuição */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Curso */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dados.distribuicaoCurso && Object.keys(dados.distribuicaoCurso).length > 0 && (
                      <div className="h-64">
                        <Doughnut
                          data={{
                            labels: Object.keys(dados.distribuicaoCurso),
                            datasets: [{
                              data: Object.values(dados.distribuicaoCurso),
                              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                              borderWidth: 0
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Distribuição por Semestre */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Semestre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dados.distribuicaoSemestre && Object.keys(dados.distribuicaoSemestre).length > 0 && (
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: Object.keys(dados.distribuicaoSemestre),
                            datasets: [{
                              label: 'Estudantes',
                              data: Object.values(dados.distribuicaoSemestre),
                              backgroundColor: 'rgba(59, 130, 246, 0.8)'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tabela Detalhada de Estudantes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Todos os Estudantes ({dados.estudantes?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Curso</th>
                          <th className="text-center p-2">Semestre</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-center p-2">Atendimentos</th>
                          <th className="text-center p-2">Horas</th>
                          <th className="text-center p-2">Satisfação</th>
                          <th className="text-center p-2">Cursos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.estudantes?.slice(0, 50).map((estudante: any) => (
                          <tr key={estudante.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{estudante.nome}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{estudante.email}</div>
                              </div>
                            </td>
                            <td className="p-2">{estudante.curso}</td>
                            <td className="p-2 text-center">{estudante.semestre}</td>
                            <td className="p-2 text-center">
                              <Badge variant={estudante.status === 'ATIVO' ? 'default' : 'secondary'}>
                                {estudante.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">{estudante.totalAtendimentos}</td>
                            <td className="p-2 text-center">{estudante.totalHoras}h</td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                {estudante.satisfacaoMedia?.toFixed(1) || 'N/A'}
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              {estudante.cursosCompletos}/{estudante.cursosMatriculados}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== SEÇÃO SERVIÇOS ==================== */}
        <TabsContent value="servicos" className="space-y-6">
          {dados && (
            <>
              {/* Estatísticas de Serviços */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{dados.estatisticas?.total || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total de Serviços</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{dados.estatisticas?.totalSolicitacoes || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Solicitações</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{dados.estatisticas?.satisfacaoMedia?.toFixed(1) || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Satisfação Média</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{dados.estatisticas?.totalVisualizacoes || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Visualizações</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top 10 Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top 10 Serviços Mais Populares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dados.top10Servicos && dados.top10Servicos.length > 0 && (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: dados.top10Servicos.map((s: any) => s.nome.substring(0, 20)),
                          datasets: [{
                            label: 'Solicitações',
                            data: dados.top10Servicos.map((s: any) => s.solicitacoes),
                            backgroundColor: 'rgba(59, 130, 246, 0.8)'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true } }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabela Completa de Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Todos os Serviços ({dados.servicos?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-center p-2">Solicitações</th>
                          <th className="text-center p-2">Visualizações</th>
                          <th className="text-center p-2">Conversão</th>
                          <th className="text-center p-2">Satisfação</th>
                          <th className="text-center p-2">Conclusão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.servicos?.map((servico: any) => (
                          <tr key={servico.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{servico.nome}</div>
                                {servico.destaque && <Badge variant="outline" className="mt-1 text-xs">Destaque</Badge>}
                              </div>
                            </td>
                            <td className="p-2">{servico.categoria}</td>
                            <td className="p-2 text-center">
                              <Badge variant={servico.status === 'ativo' ? 'default' : 'secondary'}>
                                {servico.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">{servico.solicitacoes}</td>
                            <td className="p-2 text-center">{servico.visualizacoes}</td>
                            <td className="p-2 text-center">{servico.taxaConversao}%</td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                {servico.satisfacao}
                              </div>
                            </td>
                            <td className="p-2 text-center">{servico.taxaConclusao}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== SEÇÃO SATISFAÇÃO ==================== */}
        <TabsContent value="satisfacao" className="space-y-6">
          {dados && (
            <>
              {/* Métricas de Satisfação */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Satisfação Média</p>
                        <p className="text-3xl font-bold">{dados.metricas?.satisfacaoMedia?.toFixed(1) || 0}</p>
                        <p className="text-yellow-100 text-xs mt-1">De 5.0</p>
                      </div>
                      <Star className="h-12 w-12 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{dados.metricas?.totalFeedbacks || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Feedbacks Recebidos</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{dados.metricas?.taxaResolucao || 0}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resolução</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{dados.metricas?.tempoMedioResposta || 0} min</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio Resposta</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição de Ratings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Distribuição de Avaliações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dados.distribuicaoRatings && (
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: ['5 estrelas', '4 estrelas', '3 estrelas', '2 estrelas', '1 estrela'],
                            datasets: [{
                              label: 'Quantidade',
                              data: [
                                dados.distribuicaoRatings[5],
                                dados.distribuicaoRatings[4],
                                dados.distribuicaoRatings[3],
                                dados.distribuicaoRatings[2],
                                dados.distribuicaoRatings[1]
                              ],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(127, 29, 29, 0.8)'
                              ]
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conversas por Dia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversas por Dia (Últimos 7 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dados.conversasPorDia && (
                      <div className="h-64">
                        <Line
                          data={{
                            labels: dados.conversasPorDia.map((d: any) => d.dia),
                            datasets: [{
                              label: 'Conversas',
                              data: dados.conversasPorDia.map((d: any) => d.conversas),
                              borderColor: 'rgb(59, 130, 246)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas do Chat */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Conversas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-bold">{dados.metricas?.conversasTotal || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ativas:</span>
                      <span className="font-bold text-green-600">{dados.metricas?.conversasAtivas || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Finalizadas:</span>
                      <span className="font-bold text-blue-600">{dados.metricas?.conversasFinalizadas || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      Usuários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {dados.metricas?.usuariosCadastrados || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">cadastrados via chat</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      Agendamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {dados.metricas?.agendamentosRealizados || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">realizados via chat</p>
                  </CardContent>
                </Card>
              </div>

              {/* Feedbacks Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Feedbacks Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dados.feedbacksDetalhados?.map((feedback: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(feedback.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {feedback.texto && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{feedback.texto}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-gray-500 pt-6 border-t">
        <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        <p className="mt-1">NAF Contábil - Business Intelligence Dashboard</p>
      </div>
    </div>
  )
}
