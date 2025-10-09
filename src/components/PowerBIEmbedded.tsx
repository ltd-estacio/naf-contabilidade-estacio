'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, RefreshCw, Download, TrendingUp, Users, FileText } from 'lucide-react'

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
}

export default function PowerBIEmbedded() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

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
            .slice(0, 5)
        })
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

  const exportarParaPowerBI = async () => {
    try {
      const response = await fetch('/api/reports/powerbi?format=xlsx')
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `naf-dados-powerbi-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar para Power BI:', error)
      setError('Erro ao exportar dados')
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(carregarDados, 30000) // Atualiza a cada 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const calcularPorcentagem = (valor: number, total: number) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Dashboard Power BI - NAF Contábil
          </CardTitle>
          <CardDescription>
            Visualizações automáticas dos dados em tempo real, pronto para integração com Power BI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={carregarDados} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
            
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Auto-refresh Ativo' : 'Ativar Auto-refresh'}
            </Button>
            
            <Button 
              onClick={exportarParaPowerBI}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar para Power BI
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {autoRefresh && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">
                ✅ Atualização automática ativa - Dados sendo atualizados a cada 30 segundos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total de Usuários</p>
                    <p className="text-3xl font-bold text-blue-700">{data.resumo.totalUsuarios}</p>
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
                  </div>
                  <FileText className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Demandas Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-700">{data.resumo.demandasPendentes}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Taxa de Conclusão</p>
                    <p className="text-3xl font-bold text-purple-700">{data.resumo.taxaConclusao}%</p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - Demandas vs Atendimentos</CardTitle>
              <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dadosMensais.map((mes, index) => {
                  const maxValue = Math.max(...data.dadosMensais.map(m => Math.max(m.demandas, m.atendimentos)))
                  const demandasWidth = (mes.demandas / maxValue) * 100
                  const atendimentosWidth = (mes.atendimentos / maxValue) * 100
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{mes.mes}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">Demandas: {mes.demandas}</span>
                          <span className="text-green-600">Atendimentos: {mes.atendimentos}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-blue-600">Demandas</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${demandasWidth}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-right">{mes.demandas}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-green-600">Atendimentos</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${atendimentosWidth}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-right">{mes.atendimentos}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Demandas por Categoria</CardTitle>
              <CardDescription>Análise das categorias mais demandadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.categorias)
                  .sort(([,a], [,b]) => b - a)
                  .map(([categoria, total], index) => {
                    const totalDemandas = Object.values(data.categorias).reduce((sum, val) => sum + val, 0)
                    const porcentagem = calcularPorcentagem(total, totalDemandas)
                    const cores = [
                      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
                      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
                    ]
                    
                    return (
                      <div key={categoria} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{categoria}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{total} demandas</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{porcentagem}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-700 ${cores[index % cores.length]}`}
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Serviços Mais Demandados</CardTitle>
              <CardDescription>Ranking dos serviços com maior procura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topServicos.map((servico, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{servico.nome}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{servico.categoria}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg font-bold">
                      {servico.totalDemandas} demandas
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Integração com Power BI */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">🔗 Integração com Power BI</CardTitle>
              <CardDescription className="text-yellow-700">
                Como usar estes dados no Power BI Desktop
              </CardDescription>
            </CardHeader>
            <CardContent className="text-yellow-800">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">📊 Passo 1: Exportar Dados</h4>
                  <p className="text-sm">Clique em &quot;Exportar para Power BI&quot; para baixar o arquivo Excel com todas as planilhas de dados.</p>
                </div>
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">📈 Passo 2: Importar no Power BI</h4>
                  <p className="text-sm">No Power BI Desktop: Página Inicial → Obter Dados → Excel → Selecione o arquivo baixado.</p>
                </div>
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">🎨 Passo 3: Criar Visualizações</h4>
                  <p className="text-sm">Use os dados importados para criar gráficos, KPIs e dashboards personalizados automaticamente.</p>
                </div>
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">🔄 Atualização Automática</h4>
                  <p className="text-sm">Configure o Power BI para atualizar os dados automaticamente através da API: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/api/reports/powerbi</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
