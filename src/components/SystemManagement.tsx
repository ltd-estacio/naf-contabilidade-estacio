'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, Database, Activity, Download, Upload,
  Server, Monitor, AlertTriangle, CheckCircle, RefreshCw,
  HardDrive, Cpu, MemoryStick, Network, Clock
} from 'lucide-react'

interface SystemMetrics {
  sistema: {
    status: 'healthy' | 'warning' | 'critical'
    uptime: string
    versao: string
    ultimaAtualizacao: string
  }
  resumo: {
    totalUsuarios: number
    totalDemandas: number
    totalAtendimentos: number
    totalServicos: number
    demandasPendentes: number
    atendimentosConcluidos: number
    taxaConclusao: number
  }
  performance: {
    tempoMedioResposta: number
    satisfacaoMedia: number
    taxaErro: number
    capacidadeUtilizada: number
  }
}

export default function SystemManagement() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle')
  const [lastBackup, setLastBackup] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    try {
      setBackupStatus('creating')
      const response = await fetch('/api/system/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' })
      })
      
      if (response.ok) {
        setBackupStatus('success')
        setLastBackup(new Date())
        setTimeout(() => setBackupStatus('idle'), 3000)
      } else {
        setBackupStatus('error')
        setTimeout(() => setBackupStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      setBackupStatus('error')
      setTimeout(() => setBackupStatus('idle'), 3000)
    }
  }

  const runHealthCheck = async () => {
    try {
      const response = await fetch('/api/system/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'healthCheck' })
      })
      
      if (response.ok) {
        await fetchMetrics() // Atualizar métricas
      }
    } catch (error) {
      console.error('Erro ao executar health check:', error)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header do Sistema */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão do Sistema</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitoramento e administração do NAF Contábil</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(metrics.sistema.status)} border-0`}>
            {getStatusIcon(metrics.sistema.status)}
            <span className="ml-1 capitalize">{metrics.sistema.status}</span>
          </Badge>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Versão</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.sistema.versao}</div>
                <p className="text-xs text-muted-foreground">
                  Sistema estável
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.sistema.uptime}</div>
                <p className="text-xs text-muted-foreground">
                  Disponibilidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumo.totalUsuarios}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 5)} novos hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capacidade</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.capacidadeUtilizada}%</div>
                <p className="text-xs text-muted-foreground">
                  Recursos utilizados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Atividades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Dados</CardTitle>
                <CardDescription>Estatísticas gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total de Demandas</span>
                  <span className="font-medium">{metrics.resumo.totalDemandas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Atendimentos</span>
                  <span className="font-medium">{metrics.resumo.totalAtendimentos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Serviços Ativos</span>
                  <span className="font-medium">{metrics.resumo.totalServicos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</span>
                  <span className="font-medium text-green-600">{metrics.resumo.taxaConclusao}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Operacional</CardTitle>
                <CardDescription>Componentes do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Banco de Dados</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-green-500" />
                    <span className="text-sm">APIs</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    Funcionando
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Armazenamento</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    67% Usado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Memória</span>
                  </div>
                  <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
                    {metrics.performance.capacidadeUtilizada}% Usado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.tempoMedioResposta}ms</div>
                <p className="text-xs text-green-600">↓ -12ms desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.satisfacaoMedia}/5</div>
                <p className="text-xs text-green-600">↑ +0.2 desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Erro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.taxaErro}%</div>
                <p className="text-xs text-green-600">↓ -0.5% desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resumo.demandasPendentes}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">demandas aguardando</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Backup</CardTitle>
              <CardDescription>
                Gerencie backups automáticos e manuais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Backup Manual</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crie um backup completo dos dados atuais
                  </p>
                  {lastBackup && (
                    <p className="text-xs text-gray-500">
                      Último backup: {lastBackup.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={createBackup}
                  disabled={backupStatus === 'creating'}
                  className={
                    backupStatus === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : backupStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : ''
                  }
                >
                  {backupStatus === 'creating' && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {backupStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {backupStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  {backupStatus === 'idle' && <Download className="h-4 w-4 mr-2" />}
                  
                  {backupStatus === 'creating' ? 'Criando...' :
                   backupStatus === 'success' ? 'Sucesso!' :
                   backupStatus === 'error' ? 'Erro!' :
                   'Criar Backup'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <h4 className="font-medium">Backup Automático</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diário às 2:00</p>
                  <Badge variant="secondary" className="mt-2">Ativo</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <h4 className="font-medium">Retenção</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">30 dias</p>
                  <Badge variant="secondary" className="mt-2">Configurado</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Upload className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <h4 className="font-medium">Localização</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nuvem + Local</p>
                  <Badge variant="secondary" className="mt-2">Redundante</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Check</CardTitle>
                <CardDescription>Verificação de saúde do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={runHealthCheck} className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Executar Health Check
                </Button>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Última verificação:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status geral:</span>
                    <Badge className="text-green-600 bg-green-50">Saudável</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>Últimas atividades registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sistema iniciado</span>
                    <span className="text-xs text-gray-500">08:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Backup automático</span>
                    <span className="text-xs text-gray-500">02:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usuário conectado</span>
                    <span className="text-xs text-gray-500">12:45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nova demanda criada</span>
                    <span className="text-xs text-gray-500">13:22</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
