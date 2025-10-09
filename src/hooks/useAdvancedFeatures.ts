import { useState, useEffect } from 'react'

export interface DashboardMetrics {
  totalDemandas: number
  totalAtendimentos: number
  atendimentosPendentes: number
  estudantesAtivos: number
  professorAtivos: number
  crescimentoMensal: number
  satisfacaoMedia: number
  tempoMedioAtendimento: number
}

export interface ChartData {
  monthlyDemands: Array<{
    month: string
    demandas: number
    atendimentos: number
    crescimento: number
  }>
  serviceDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  studentPerformance: Array<{
    name: string
    atendimentos: number
    horas: number
    satisfacao: number
  }>
  timeDistribution: Array<{
    hora: string
    demandas: number
    capacidade: number
  }>
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/reports/advanced?type=dashboard')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const data = await response.json()
      
      setMetrics(data.metrics)
      setChartData(data.chartData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    chartData,
    loading,
    error,
    refreshData
  }
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    timestamp: Date
  }>>([])

  const addNotification = (notification: Omit<typeof notifications[0], 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
    
    // Remove notificação após 10 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
    }, 10000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Sistema de notificações push removido conforme solicitado

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  }
}

export const useEmailNotifications = () => {
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<Date | null>(null)

  const sendTestEmail = async () => {
    try {
      setSending(true)
      
      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'test',
          data: {
            to: 'coordenador@naf.contabil',
            subject: 'Teste do Sistema de Notificações',
            templateData: {
              userName: 'Coordenador',
              systemStatus: 'Funcionando perfeitamente',
              timestamp: new Date().toLocaleString('pt-BR')
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar email de teste')
      }

      const result = await response.json()
      setLastSent(new Date())
      
      return { success: true, message: result.message }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    } finally {
      setSending(false)
    }
  }

  const sendBatchReminders = async () => {
    try {
      setSending(true)
      
      const response = await fetch('/api/email-notifications', {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar lembretes')
      }

      const result = await response.json()
      setLastSent(new Date())
      
      return { success: true, message: result.message }
    } catch (error) {
      console.error('Erro ao enviar lembretes:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    } finally {
      setSending(false)
    }
  }

  return {
    sending,
    lastSent,
    sendTestEmail,
    sendBatchReminders
  }
}

export const useAdvancedReports = () => {
  const [generating, setGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const generateReport = async (type: string, format: 'excel' | 'pdf' | 'json' = 'excel') => {
    try {
      setGenerating(true)
      
      const response = await fetch(`/api/reports/advanced?type=${type}&format=${format}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao gerar relatório de ${type}`)
      }

      // Criar download do arquivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.href = url
      link.download = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      setLastGenerated(new Date())
      
      return { success: true, message: `Relatório de ${type} gerado com sucesso` }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    } finally {
      setGenerating(false)
    }
  }

  const exportToPowerBI = async () => {
    try {
      setGenerating(true)
      
      const response = await fetch('/api/reports/advanced?type=powerbi')
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados para Power BI')
      }

      const data = await response.json()
      
      // Copiar dados para área de transferência
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      
      setLastGenerated(new Date())
      
      return { 
        success: true, 
        message: 'Dados exportados para Power BI (copiados para área de transferência)',
        data 
      }
    } catch (error) {
      console.error('Erro ao exportar para Power BI:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    } finally {
      setGenerating(false)
    }
  }

  return {
    generating,
    lastGenerated,
    generateReport,
    exportToPowerBI
  }
}
