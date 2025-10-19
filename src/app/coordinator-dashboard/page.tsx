'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Target,
  ListChecks,
  LogOut,
  MessageCircle,
  Award,
  User,
  BookOpen,
  Database,
  ShieldCheck,
  HardDriveDownload,
  Info,
  History,
  Link as LinkIcon,
  Globe,
  CalendarClock,
  Shield,
  ArrowRight,
  Cpu,
  Upload,
  FileSpreadsheet,
  FileCheck,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import DashboardInlineNav from '@/components/DashboardInlineNav'
import CoordinatorInterface from '@/components/chat/CoordinatorInterface'
import AdvancedReportsCenter from '@/components/reports/AdvancedReportsCenter'
import BusinessIntelligence from '@/components/coordinator/BusinessIntelligence'
import NAFFooter from '@/components/layout/NAFFooter'
import SimpleChart from '@/components/charts/SimpleChart'
import AppointmentsPanel from '@/components/admin/AppointmentsPanel'
import UsersPanel from '@/components/admin/UsersPanel'
import StudentsPerformancePanel from '@/components/coordinator/StudentsPerformancePanel'
import ChatLinkGenerator from '@/components/coordinator/ChatLinkGenerator'
import BackupCenter from '@/components/coordinator/BackupCenter'
// import { HistoryDashboard } from '@/components/coordinator/HistoryDashboard'

interface ServiceMetrics {
  service_name: string
  service_id?: string
  service_description?: string
  service_category?: string
  service_difficulty?: string
  is_featured?: boolean
  requests_count: number
  completed_count: number
  pending_count: number
  avg_duration_minutes: number
  satisfaction_rating: number
  views_count?: number
}

interface StudentData {
  student_name: string
  course: string
  total_attendances: number
  avg_rating: number
}

interface FiscalAppointmentData {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  urgentAppointments: number
  serviceBreakdown: Record<string, {
    service_type: string
    service_title: string
    total: number
    pending: number
    confirmed: number
    completed: number
    urgent: number
  }>
  recentAppointments: Array<{
    protocol: string
    client_name: string
    service_title: string
    status: string
    urgency_level: string
    created_at: string
  }>
}

interface DashboardData {
  mainMetrics: {
    atendimentosMensais: number
    taxaConclusao: number
    tempoMedio: number
    satisfacao: number
  }
  services: ServiceMetrics[]
  students: StudentData[]
  weeklyData: Array<{
    day: string
    atendimentos: number
    agendamentos: number
  }>
  publicoAlvo: {
    categorias: Array<{
      categoria: string
      quantidade: number
      percentual: number
      taxaConclusao: number
      satisfacaoMedia: number
    }>
    faixasEtarias: Array<{
      faixa: string
      quantidade: number
    }>
    genero: {
      masculino: number
      feminino: number
      naoInformado: number
    }
  }
  fiscalAppointments: FiscalAppointmentData
}

type BackupFormatOption = 'zip' | 'json' | 'sql' | 'csv'

interface BackupFormState {
  format: BackupFormatOption
  includeSchema: boolean
  preview: boolean
  scope: string
  extras: string[]
  compression: 'gzip' | 'store'
  batchSize: number
}

interface BackupHistoryItem {
  id: string
  timestamp: string
  format: BackupFormatOption
  preview: boolean
  scope: string
  extras: string[]
  success: boolean
  rows?: number
  error?: string
}

interface BackupMetadataSummary {
  generatedAt: string
  format: string
  preview: boolean
  tableCount: number
  totalRows: number
  totalBytes: number
  schemaIncluded: boolean
  extras: string[]
  scope: string[]
  fetchDurationMs: number
  serviceRole: boolean
  errorCount: number
  tables?: Array<{
    name: string
    rowCount: number
    estimatedBytes: number
    durationMs: number
    truncated: boolean
    columns: string[]
    empty: boolean
  }>
}

interface AutomationFormOption {
  id: string
  name: string
  url: string
  description: string
}

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<unknown>(null)
  const [chatNotifications, setChatNotifications] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAutomationForm, setSelectedAutomationForm] = useState('ficha-servico')
  const [automationFile, setAutomationFile] = useState<File | null>(null)
  const [automationPreview, setAutomationPreview] = useState<string[]>([])
  const [automationStatus, setAutomationStatus] = useState<'idle' | 'starting' | 'ready' | 'error'>('idle')
  const [automationMessage, setAutomationMessage] = useState('Selecione um arquivo de dados para iniciar a automação.')
  const automationFileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedStudentPortalView, setSelectedStudentPortalView] = useState<string | null>(null)
  const [backupForm, setBackupForm] = useState<BackupFormState>({
    format: 'zip',
    includeSchema: true,
    preview: false,
    scope: 'full',
    extras: ['json', 'csv', 'sql'],
    compression: 'gzip',
    batchSize: 1000
  })
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupError, setBackupError] = useState<string | null>(null)
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadataSummary | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([])
  const router = useRouter()
  // Links antigos foram reorganizados em um componente dedicado de navegação inline

  // Carregar dados do dashboard
  useEffect(() => {
    const loadData = async () => {
      try {
        // Configurar usuário mock para demonstração
        setUser({ email: 'coordenador@naf.edu.br', name: 'Coordenador NAF', id: 'coord-1' })

        // Buscar dados do dashboard
        const response = await fetch('/api/coordinator/simple-dashboard')

        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          setError('Erro ao carregar dados do dashboard')
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        setError('Erro de conexão')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Sistema de notificações de chat completo
  useEffect(() => {
    if (!user?.id) return

    // Função para carregar contagem inicial de mensagens não lidas
    const loadInitialUnreadCount = async () => {
      try {
        const response = await fetch(`/api/chat/unread-count?coordinator_id=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setChatNotifications(data.unread_count || 0)
        }
      } catch (error) {
        console.error('Erro ao carregar contagem inicial:', error)
      }
    }

    loadInitialUnreadCount()

    // Configurar Server-Sent Events para notificações de chat
    const eventSource = new EventSource(`/api/chat/notifications?coordinator_id=${user.id}`)

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)

        console.log('📱 Notificação recebida:', notification)

        if (notification.type === 'new_chat_request' || notification.type === 'pending_chat_request') {
          setChatNotifications(prev => prev + 1)
          playNotificationSound()
        }

        if (notification.type === 'new_message') {
          // Nova mensagem de usuário para o coordenador
          setChatNotifications(prev => prev + (notification.unread_count || 1))
          playNotificationSound()
        }

        if (notification.type === 'chat_summary') {
          // Atualizar com a contagem total pendente
          setChatNotifications(notification.total_pending || 0)
        }
      } catch (error) {
        console.error('Erro ao processar notificação:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [user?.id])

  // Função para tocar som de notificação (DESABILITADA)
  const playNotificationSound = () => {
    // Som desabilitado a pedido do usuário
    // const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DwmmgfCDBrxPDCaiIDF0PV8N5QQAoTV6jn77BdGQhDo+LvlkshBjWQ3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DwmmgfCDBrxPDCaiIDF0PV8N5QQAoTNwgZaLvt559NEAxQp+Puu2EcBjqe2O7IsWgfCTBvyOvObiEIRzLhub+dRgwZaL3uxKc0CwAA')
    // audio.play().catch(console.error)
  }

  // Limpar notificações quando acessar o chat
  const clearChatNotifications = async () => {
    setChatNotifications(0)

    // Marcar todas as mensagens como lidas no backend
    try {
      await fetch('/api/chat/unread-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinator_id: user?.id,
          mark_all: true
        })
      })
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }

  const handleAutomationFormChange = (formId: string) => {
    setSelectedAutomationForm(formId)
    setAutomationStatus('idle')
    setAutomationMessage('Selecione um arquivo de dados para iniciar a automação.')
    setAutomationPreview([])
  }

  const handleAutomationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setAutomationFile(file ?? null)
    setAutomationPreview([])

    if (!file) {
      setAutomationStatus('idle')
      setAutomationMessage('Selecione um arquivo de dados para iniciar a automação.')
      return
    }

    setAutomationStatus('ready')
    setAutomationMessage(`Arquivo ${file.name} pronto para processamento.`)

    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = loadEvent => {
        const text = (loadEvent.target?.result as string) || ''
        const previewLines = text
          .split(/\r?\n/)
          .filter(line => line.trim().length > 0)
          .slice(0, 6)
        setAutomationPreview(previewLines)
      }
      reader.onerror = () => {
        setAutomationPreview([])
        setAutomationStatus('error')
        setAutomationMessage('Não foi possível ler o arquivo CSV. Tente novamente.')
      }
      reader.readAsText(file, 'utf-8')
    }
  }

  const handleAutomationStart = () => {
    if (!automationFile) {
      setAutomationStatus('error')
      setAutomationMessage('Selecione um arquivo CSV ou PDF antes de iniciar a automação.')
      return
    }

    const form = selectedAutomation
    if (!form) {
      setAutomationStatus('error')
      setAutomationMessage('Selecione um formulário válido para continuar.')
      return
    }

    setAutomationStatus('starting')
    setAutomationMessage('Inicializando rotina de automação e abrindo o formulário oficial...')

    setTimeout(() => {
      setAutomationStatus('ready')
      setAutomationMessage('Formulário aberto. A automação pode ser acompanhada na aba recém-aberta.')
    }, 1200)

    window.open(form.url, '_blank', 'noopener,noreferrer')
  }

  const generateId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, exponent)
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`
  }

  const formatDuration = (ms: number) => {
    if (!Number.isFinite(ms) || ms <= 0) return '—'
    if (ms < 1000) return `${ms} ms`
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
    return `${(ms / 1000 / 60).toFixed(1)} min`
  }

  const parseMetadataHeader = (header: string | null): BackupMetadataSummary | null => {
    if (!header) return null
    try {
      return JSON.parse(header) as BackupMetadataSummary
    } catch (error) {
      console.error('Erro ao interpretar metadados do backup:', error)
      return null
    }
  }

  const filenameFromDisposition = (header: string | null, fallback: string) => {
    if (!header) return fallback
    const match = header.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
    const filename = match?.[1] || match?.[2]
    if (!filename) return fallback
    try {
      return decodeURIComponent(filename)
    } catch {
      return filename
    }
  }

  const updateBackupHistory = (entry: BackupHistoryItem) => {
    setBackupHistory(prev => [entry, ...prev].slice(0, 6))
  }

  const handleFormatChange = (format: BackupFormatOption) => {
    setBackupForm(prev => {
      const next: BackupFormState = {
        ...prev,
        format,
        extras: prev.extras,
        compression: prev.compression,
        preview: prev.preview
      }

      if (format !== 'json' && next.preview) {
        next.preview = false
      }

      if (format === 'zip') {
        next.extras = prev.extras.length ? prev.extras : ['json', 'csv', 'sql']
        next.compression = prev.compression === 'store' ? 'gzip' : prev.compression
      } else if (format === 'csv') {
        next.extras = ['csv']
        next.compression = 'gzip'
      } else if (format === 'sql') {
        next.extras = ['sql']
        next.compression = 'store'
      } else {
        next.extras = []
        next.compression = 'store'
      }

      return next
    })
  }

  const toggleExtra = (extra: string) => {
    setBackupForm(prev => {
      if (prev.format !== 'zip') return prev
      const extras = prev.extras.includes(extra)
        ? prev.extras.filter(item => item !== extra)
        : [...prev.extras, extra]
      return { ...prev, extras }
    })
  }

  const scopeToArray = (scope: string): string[] | null => {
    const trimmed = scope.trim()
    if (!trimmed || trimmed.toLowerCase() === 'full') return null
    return trimmed.split(',').map(item => item.trim()).filter(Boolean)
  }

  const handleBackupPreview = async () => {
    setBackupLoading(true)
    setBackupError(null)

    try {
      const response = await fetch('/api/system/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: backupForm.format,
          includeSchema: backupForm.includeSchema,
          preview: true,
          tables: scopeToArray(backupForm.scope) ?? undefined,
          extras: backupForm.extras,
          batchSize: backupForm.batchSize
        })
      })

      const timestamp = new Date().toISOString()

      if (!response.ok) {
        const detail = await response.text()
        const message = detail || 'Não foi possível gerar o preview do backup.'
        setBackupError(message)
        updateBackupHistory({
          id: generateId(),
          timestamp,
          format: backupForm.format,
          preview: true,
          scope: backupForm.scope,
          extras: backupForm.extras,
          success: false,
          error: message
        })
        return
      }

      const data = await response.json()
      const metadata = data?.metadata as BackupMetadataSummary | undefined
      if (metadata) {
        setBackupMetadata(metadata)
        updateBackupHistory({
          id: generateId(),
          timestamp,
          format: backupForm.format,
          preview: true,
          scope: backupForm.scope,
          extras: backupForm.extras,
          success: true,
          rows: metadata.totalRows
        })
      } else {
        setBackupMetadata(null)
      }

    } catch (error: unknown) {
      const message = error?.message || 'Erro inesperado durante o preview.'
      setBackupError(message)
      updateBackupHistory({
        id: generateId(),
        timestamp: new Date().toISOString(),
        format: backupForm.format,
        preview: true,
        scope: backupForm.scope,
        extras: backupForm.extras,
        success: false,
        error: message
      })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleBackupDownload = async () => {
    if (backupForm.preview && backupForm.format !== 'json') {
      setBackupError('O modo preview só está disponível para o formato JSON.')
      return
    }

    setBackupLoading(true)
    setBackupError(null)

    try {
      const params = new URLSearchParams()
      params.set('format', backupForm.format)

      if (!backupForm.includeSchema) {
        params.set('includeSchema', 'false')
      }

      if (backupForm.preview && backupForm.format === 'json') {
        params.set('preview', 'true')
      }

      const tables = scopeToArray(backupForm.scope)
      if (tables && tables.length) {
        params.set('scope', tables.join(','))
      }

      if (backupForm.format === 'zip') {
        if (backupForm.extras.length) {
          params.set('extras', backupForm.extras.join(','))
        }
        params.set('compression', backupForm.compression)
      }

      if (backupForm.format === 'csv') {
        params.set('extras', 'csv')
      }

      if (backupForm.batchSize && backupForm.batchSize !== 1000) {
        params.set('batchSize', String(backupForm.batchSize))
      }

      const response = await fetch(`/api/system/backup?${params.toString()}`)
      const timestamp = new Date().toISOString()

      if (!response.ok) {
        const detail = await response.text()
        const message = detail || 'Falha ao gerar o backup.'
        setBackupError(message)
        updateBackupHistory({
          id: generateId(),
          timestamp,
          format: backupForm.format,
          preview: backupForm.preview,
          scope: backupForm.scope,
          extras: backupForm.extras,
          success: false,
          error: message
        })
        return
      }

      const metadata = parseMetadataHeader(response.headers.get('X-Backup-Metadata'))
      if (metadata) {
        setBackupMetadata(metadata)
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = filenameFromDisposition(contentDisposition, `backup.${backupForm.format}`)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      updateBackupHistory({
        id: generateId(),
        timestamp,
        format: backupForm.format,
        preview: backupForm.preview,
        scope: backupForm.scope,
        extras: backupForm.extras,
        success: true,
        rows: metadata?.totalRows
      })

    } catch (error: unknown) {
      const message = error?.message || 'Erro inesperado ao baixar o backup.'
      setBackupError(message)
      updateBackupHistory({
        id: generateId(),
        timestamp: new Date().toISOString(),
        format: backupForm.format,
        preview: backupForm.preview,
        scope: backupForm.scope,
        extras: backupForm.extras,
        success: false,
        error: message
      })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('coordinator_token')
    localStorage.removeItem('coordinator_user')
    router.push('/coordinator-login')
  }

  const previewAllowed = backupForm.format === 'json'
  const extrasAvailable = backupForm.format === 'zip'
  const backupMetadataErrors = backupMetadata
    ? (backupMetadata as BackupMetadataSummary & { errors?: Array<{ table: string; message: string }> }).errors
    : undefined
  const backupTablesPreview = backupMetadata?.tables?.slice(0, 8) ?? []

  const getMainMetrics = () => {
    if (!dashboardData) return []

    return [
      {
        title: 'Atendimentos Mensais',
        value: dashboardData.mainMetrics.atendimentosMensais,
        change: 12.5,
        trend: 'up' as const,
        icon: Users,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Taxa de Conclusão',
        value: dashboardData.mainMetrics.taxaConclusao,
        change: 2.1,
        trend: 'up' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        suffix: '%'
      },
      {
        title: 'Tempo Médio',
        value: dashboardData.mainMetrics.tempoMedio,
        change: -5.2,
        trend: 'down' as const,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        suffix: ' min'
      },
      {
        title: 'Satisfação',
        value: dashboardData.mainMetrics.satisfacao,
        change: 0.3,
        trend: 'up' as const,
        icon: Star,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        suffix: '/5'
      },
      {
        title: 'Pendentes',
        value: dashboardData.mainMetrics.pendentes ?? dashboardData.fiscalAppointments?.pendingAppointments ?? 0,
        change: 1.8,
        trend: 'up' as const,
        icon: ListChecks,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
      },
      {
        title: 'Urgentes',
        value: dashboardData.mainMetrics.urgentes ?? dashboardData.fiscalAppointments?.urgentAppointments ?? 0,
        change: 0,
        trend: 'stable' as const,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      {
        title: 'Estudantes Ativos',
        value: dashboardData.mainMetrics.estudantesAtivos ?? dashboardData.students?.length ?? 0,
        change: 3.4,
        trend: 'up' as const,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      }
    ]
  }

  const _exportReport = async (type: string, format: string = 'json') => {
    try {
      console.log(`📊 Exporting ${type} report in ${format} format with charts`)

      // Use the advanced reports API for all exports
      const response = await fetch(`/api/reports/advanced?type=${type}&format=${format}`)

      if (!response.ok) {
        throw new Error(`Erro ao gerar relatório: ${response.status}`)
      }

      if (format === 'json') {
        const data = await response.json()
        console.log('Report data with charts:', data)

        // Show enhanced success message with chart information
        const charts = data.charts
        const chartsInfo = charts ? `\nGráficos incluídos: ${Object.keys(charts.pieCharts).length} Pizza, ${Object.keys(charts.barCharts).length} Barras, ${Object.keys(charts.lineCharts).length} Linha` : ''

        alert(`✅ Relatório ${type} gerado com sucesso!${chartsInfo}\nDados e gráficos carregados no dashboard.`)
        return
      }

      // For other formats, trigger download with chart data included
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      // Enhanced filename with proper extensions
      const extensions = {
        'pdf': 'pdf',
        'txt': 'txt',
        'doc': 'docx',
        'docx': 'docx',
        'excel': 'xlsx',
        'powerbi': 'json'
      }

      const extension = extensions[format as keyof typeof extensions] || format
      const filename = `relatorio-naf-${type}-${new Date().toISOString().split('T')[0]}.${extension}`
      a.download = filename

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log(`✅ Report with charts downloaded: ${filename}`)
      alert(`✅ Relatório baixado com sucesso!\nArquivo: ${filename}\nIncluindo todos os gráficos e dados detalhados.`)

    } catch (error) {
      console.error('❌ Error exporting report:', error)
      alert('❌ Erro ao exportar relatório. Verifique sua conexão e tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              onClick={() => window.location.reload()}
              className="ml-2"
              size="sm"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const mainMetrics = getMainMetrics()
  const domainExpiry = new Date('2026-05-03T00:00:00-03:00')
  const domainCycleStart = new Date('2025-05-03T00:00:00-03:00')
  const now = new Date()
  const msInDay = 1000 * 60 * 60 * 24
  const daysRemainingRaw = Math.ceil((domainExpiry.getTime() - now.getTime()) / msInDay)
  const daysRemaining = daysRemainingRaw > 0 ? daysRemainingRaw : 0
  const isExpired = daysRemainingRaw <= 0
  const renewalWindowDays = 60
  const renewalWindowStart = new Date(domainExpiry)
  renewalWindowStart.setDate(renewalWindowStart.getDate() - renewalWindowDays)
  const inRenewalWindow = !isExpired && now >= renewalWindowStart
  const totalCycleDays = Math.max(1, Math.ceil((domainExpiry.getTime() - domainCycleStart.getTime()) / msInDay))
  const daysElapsed = isExpired
    ? totalCycleDays
    : Math.min(totalCycleDays, Math.max(0, Math.ceil((now.getTime() - domainCycleStart.getTime()) / msInDay)))
  const renewalProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalCycleDays) * 100)))
  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const domainStatusLabel = isExpired ? 'Expirado' : inRenewalWindow ? 'Em Renovação' : 'Ativo'
  const domainStatusTone = isExpired
    ? 'bg-red-100 text-red-700'
    : inRenewalWindow
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700'
  const domainStatusSubtext = isExpired
    ? 'Renove imediatamente para evitar indisponibilidade dos serviços.'
    : inRenewalWindow
      ? 'Recomenda-se confirmar a renovação antes do vencimento para manter o domínio protegido.'
      : 'Domínio operacional, renovação sob monitoramento automático.'
  const domainRegistrarUrl = 'https://registro.br/painel/'
  const automationForms: AutomationFormOption[] = [
    {
      id: 'ficha-servico',
      name: 'Ficha do Serviço Prestado - NAF',
      url: 'https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esLOeSofjsRxAvgRIQVYNlxJURFpFREtLWjhKODlZMDBZS09QTkhJNU82QyQlQCN0PWcu&route=shorturl',
      description: 'Automação completa do registro de atendimentos via formulário Microsoft Forms.'
    },
    {
      id: 'boas-praticas',
      name: 'Boas Práticas NAF',
      url: 'https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esDZnJHy5FONNgoCmZesCVIhUOE9GVlhZWlZOTzlFMlVUT0xLOTNDOVdPOS4u&route=shorturl',
      description: 'Coleta de indicadores de melhoria contínua e boas práticas operacionais.'
    }
  ]
  const selectedAutomation = automationForms.find(form => form.id === selectedAutomationForm) ?? automationForms[0]
  const domainTimeline = [
    {
      label: 'Janela de Renovação',
      value: formatDate(renewalWindowStart),
      description: 'Período recomendado para iniciar pagamentos e documentação.',
      icon: CalendarClock,
      tone: 'text-amber-500'
    },
    {
      label: 'Data de Expiração',
      value: formatDate(domainExpiry),
      description: 'Prazo final para renovação sem penalidades.',
      icon: CalendarClock,
      tone: 'text-blue-500'
    },
    {
      label: 'Painel Registro.br',
      value: 'https://registro.br/painel/',
      description: 'Ambiente oficial de administração do domínio.',
      icon: LinkIcon,
      tone: 'text-slate-500'
    }
  ]
  const domainChecklist = [
    {
      title: 'DNS primário operacional',
      status: 'OK',
      tone: 'text-green-600',
      icon: ShieldCheck
    },
    {
      title: 'Renovação automática monitorada',
      status: inRenewalWindow ? 'Revisar' : 'OK',
      tone: inRenewalWindow ? 'text-amber-600' : 'text-green-600',
      icon: Activity
    },
    {
      title: 'Contato técnico atualizado',
      status: 'OK',
      tone: 'text-green-600',
      icon: Users
    }
  ]
  const quickLinks = [
    {
      value: 'overview',
      label: 'Visão Geral',
      description: 'Métricas e KPIs Estratégicos',
      icon: TrendingUp,
      category: 'analytics'
    },
    {
      value: 'students',
      label: 'Estudantes',
      description: 'Desenvolvimento da Equipe',
      icon: Users,
      category: 'management'
    },
    {
      value: 'appointments',
      label: 'Atendimentos',
      description: 'Gestão Inteligente',
      icon: Calendar,
      category: 'operations'
    },
    {
      value: 'fiscal',
      label: 'Fiscal & Compliance',
      description: 'Procedimentos e Orientações',
      icon: BookOpen,
      category: 'compliance'
    },
    {
      value: 'chat',
      label: 'Comunicação',
      description: 'Central de Mensagens',
      icon: MessageCircle,
      category: 'operations'
    },
    {
      value: 'reports',
      label: 'Business Intelligence',
      description: 'Relatórios Estratégicos',
      icon: Download,
      category: 'analytics'
    },
    {
      value: 'security',
      label: 'Backup Atendimentos',
      description: 'Central de Backup Profissional',
      icon: ShieldCheck,
      category: 'security'
    },
    {
      value: 'backup',
      label: 'Segurança Digital',
      description: 'Backup e Recuperação',
      icon: HardDriveDownload,
      category: 'management'
    },
    {
      value: 'automation',
      label: 'Automação Fiscal',
      description: 'Upload inteligente e preenchimento automático',
      icon: Cpu,
      category: 'operations'
    },
    {
      value: 'domain-status',
      label: 'Domínio NAF',
      description: 'Monitoramento do domínio institucional',
      icon: Globe,
      category: 'security'
    },
    {
      value: 'chat-links',
      label: 'Links de Chat',
      description: 'Gerar Acesso ao Chat',
      icon: LinkIcon,
      category: 'analytics'
    }
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-12">
        <header className="bg-white dark:bg-gray-950/80 backdrop-blur-md shadow-lg border-b border-slate-200/50">
        <div className="w-full px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            {/* Brand & Title Section */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                  <DashboardInlineNav
                    label="Menu"
                    triggerClassName="bg-white/80 dark:bg-gray-900/80"
                    className="flex-shrink-0"
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
                        Central de Coordenação NAF
                      </h1>
                      <p className="text-slate-600 font-semibold">COORDENADOR | Painel Executivo</p>
                    </div>
                  </div>
                </div>
              </div>

      <div className="flex items-center gap-3 justify-start sm:justify-end">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/60 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-xs text-slate-600 font-medium">ONLINE</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('automation')
            document.getElementById('coordinator-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="group relative hidden items-center gap-3 rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 sm:flex"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Automação Fiscal</p>
            <p className="text-sm font-bold text-slate-700">Configurar envio</p>
          </div>
          <div className="absolute inset-x-0 top-full hidden translate-y-2 rounded-xl border border-blue-100 bg-white p-3 text-xs text-slate-600 shadow-xl group-hover:block">
            <p className="font-semibold text-slate-700">Ferramenta integrada</p>
            <p className="mt-1 text-[11px] leading-relaxed">Selecione o formulário, faça upload do CSV e o sistema abrirá o Microsoft Forms para automatizar o preenchimento.</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('domain-status')
            document.getElementById('coordinator-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="group relative flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">Domínio</span>
            <span className="text-sm font-bold text-slate-700">naf.ltdestacio.com.br</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Expira em</span>
            <span className="flex items-center gap-1 text-sm font-bold text-slate-800">
              03/05/2026
              <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
            </span>
          </div>

          <div className="absolute inset-x-0 top-full z-10 hidden translate-y-2 overflow-hidden rounded-xl border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-500/20 group-hover:block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Painel de Domínio</p>
                <p className="mt-1 text-sm font-medium text-slate-700">Renovação em <span className="text-blue-600">03/05/2026</span></p>
                <p className="mt-1 text-xs text-slate-500">Gerenciado via <span className="font-semibold text-blue-600">registro.br</span></p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Link href="https://registro.br/painel/" target="_blank" rel="noreferrer">
                  Acessar Registro.br
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-slate-300 hover:border-red-300 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Navigation Grid */}
      <section className="py-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Módulos de Gestão</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickLinks.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.value)
                    document.getElementById('coordinator-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
          {mainMetrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <Card key={index}>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value.toLocaleString('pt-BR')}
                        {metric.suffix || ''}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className={`h-4 w-4 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm ml-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs id="coordinator-tabs" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="sr-only">
            <TabsTrigger className="w-full justify-center" value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="services">Serviços</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="students">Estudantes</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="fiscal">Orient. Fiscais</TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="appointments">
              <Calendar className="h-4 w-4" />
              Atendimentos
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="users">
              <Users className="h-4 w-4" />
              Usuários Cadastrados
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="history">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              onClick={clearChatNotifications}
              className="relative flex w-full items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
              {chatNotifications > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  {chatNotifications > 9 ? '9+' : chatNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="intelligence">
              <BarChart3 className="h-4 w-4" />
              Business Intelligence
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="security">
              <ShieldCheck className="h-4 w-4" />
              Segurança Digital
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="automation">
              <Cpu className="h-4 w-4" />
              Automação Fiscal
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="domain-status">
              <Globe className="h-4 w-4" />
              Domínio NAF
            </TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="reports">Relatórios</TabsTrigger>
            <TabsTrigger className="w-full justify-center gap-2" value="backup">
              <Database className="h-4 w-4" />
              Fazer Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Atendimentos Semanais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Atendimentos por Dia da Semana
                  </CardTitle>
                  <CardDescription>
                    Análise visual da distribuição semanal de atendimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="bar"
                    data={dashboardData.weeklyData.map(day => ({
                      label: day.day,
                      value: day.atendimentos,
                      color: '#3B82F6'
                    }))}
                    height={250}
                    title="Atendimentos Realizados"
                  />

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Comparativo Detalhado:</h4>
                    <div className="space-y-3">
                      {dashboardData.weeklyData.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{day.day}</span>
                            </div>
                            <span className="text-sm font-medium">{day.day === 'Seg' ? 'Segunda' : day.day === 'Ter' ? 'Terça' : day.day === 'Qua' ? 'Quarta' : day.day === 'Qui' ? 'Quinta' : day.day === 'Sex' ? 'Sexta' : day.day === 'Sáb' ? 'Sábado' : 'Domingo'}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{day.atendimentos}</div>
                            <div className="text-xs text-gray-500">{day.agendamentos} agendados</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Público-Alvo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Distribuição do Público-Alvo
                  </CardTitle>
                  <CardDescription>
                    Segmentação visual das categorias atendidas pelo NAF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="pie"
                    data={dashboardData.publicoAlvo?.categorias?.map((categoria, index) => ({
                      label: categoria.categoria,
                      value: categoria.quantidade,
                      color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 4]
                    })) || []}
                    height={200}
                  />

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estatísticas Detalhadas:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {dashboardData.publicoAlvo?.categorias?.map((categoria, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{categoria.categoria}</span>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 4] }}
                            />
                          </div>
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{categoria.quantidade}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{categoria.percentual}% do total</div>
                        </div>
                      )) || <div className="col-span-2 text-center text-gray-500 py-4">Carregando dados...</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas e Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas e Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Meta de atendimentos próxima do limite
                      </p>
                      <p className="text-xs text-yellow-600">
                        87% da meta mensal já atingida. Considere ampliar capacidade.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Novo relatório mensal disponível
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Relatório de performance de outubro já pode ser exportado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulários de Gestão NAF */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Formulários de Gestão NAF
                </CardTitle>
                <CardDescription>
                  Links para acompanhamento de serviços prestados e boas práticas dos estudantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Ficha de Serviço Prestado</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Monitore os registros de atendimentos</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                      Acompanhe os formulários preenchidos pelos estudantes sobre os serviços prestados.
                    </p>
                    <a
                      href="https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esLOeSofjsRxAvgRIQVYNlxJURFpFREtLWjhKODlZMDBZS09QTkhJNU82QyQlQCN0PWcu&route=shorturl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                        📋 Acessar Formulários
                      </Button>
                    </a>
                  </div>

                  <div className="p-6 border border-emerald-200 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">Registro de Boas Práticas</h3>
                        <p className="text-sm text-emerald-700">Revise experiências positivas</p>
                      </div>
                    </div>
                    <p className="text-sm text-emerald-600 mb-4">
                      Visualize e aprove as boas práticas compartilhadas pelos estudantes.
                    </p>
                    <a
                      href="https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esDZnJHy5FONNgoCmZesCVIhUOE9GVlhZWlZOTzlFMlVUT0xLOTNDOVdPOS4u&route=shorturl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all">
                        ⭐ Revisar Práticas
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Gestão de Qualidade</h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    <strong>Para Coordenadores:</strong> Utilize estes formulários para acompanhar a qualidade dos atendimentos,
                    identificar oportunidades de melhoria e reconhecer as melhores práticas dos estudantes.
                    Os dados coletados são fundamentais para o aprimoramento contínuo do NAF.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Performance Overview with Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Performance dos Serviços
                  </CardTitle>
                  <CardDescription>
                    Análise visual das solicitações por serviço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="bar"
                    data={dashboardData.services.map(service => ({
                      label: service.service_name.split(' ')[0], // First word for shorter labels
                      value: service.requests_count,
                      color: '#10B981'
                    }))}
                    height={200}
                    title="Solicitações por Serviço"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Taxa de Conclusão
                  </CardTitle>
                  <CardDescription>
                    Distribuição de status dos atendimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="pie"
                    data={[
                      {
                        label: 'Concluídos',
                        value: dashboardData.services.reduce((total, service) => total + service.completed_count, 0),
                        color: '#10B981'
                      },
                      {
                        label: 'Pendentes',
                        value: dashboardData.services.reduce((total, service) => total + service.pending_count, 0),
                        color: '#F59E0B'
                      },
                      {
                        label: 'Em Andamento',
                        value: dashboardData.services.reduce((total, service) => total + (service.requests_count - service.completed_count - service.pending_count), 0),
                        color: '#3B82F6'
                      }
                    ]}
                    height={200}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Service Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada dos Serviços</CardTitle>
                <CardDescription>
                  Métricas completas e indicadores de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dashboardData.services.map((service, index) => (
                    <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{service.service_name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {service.is_featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    ⭐ Destaque
                                  </Badge>
                                )}
                                {service.service_difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {service.service_difficulty}
                                  </Badge>
                                )}
                                {service.service_category && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:text-blue-300">
                                    {service.service_category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {service.service_description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                              {service.service_description.length > 150
                                ? `${service.service_description.substring(0, 150)}...`
                                : service.service_description}
                            </p>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold text-yellow-600">{service.satisfaction_rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Satisfação</p>
                        </div>
                      </div>

                      {/* Professional Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{service.requests_count}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Solicitações</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{service.completed_count}</p>
                          <p className="text-xs text-green-600 font-medium">Concluídos</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{service.pending_count}</p>
                          <p className="text-xs text-orange-600 font-medium">Pendentes</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{service.avg_duration_minutes}</p>
                          <p className="text-xs text-purple-600 font-medium">Min/Atend.</p>
                        </div>
                        {service.views_count !== undefined && (
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{service.views_count}</p>
                            <p className="text-xs text-indigo-600 font-medium">Visualizações</p>
                          </div>
                        )}
                      </div>

                      {/* Progress Visualization */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Conclusão</span>
                          <span className="text-sm font-bold text-green-600">
                            {service.requests_count > 0 ? ((service.completed_count / service.requests_count) * 100).toFixed(1) : '0.0'}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${service.requests_count > 0 ? (service.completed_count / service.requests_count) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analytics
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Exportar
                          </Button>
                        </div>
                        {service.service_id && (
                          <Link href={`/services`}>
                            <Button size="sm">
                              Ver Detalhes Completos
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Enhanced Student Management with Portal Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Student Overview Cards */}
              <Card className="lg:col-span-4 dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <Users className="h-5 w-5" />
                    Portal Integrado dos Estudantes
                  </CardTitle>
                  <CardDescription>
                    Visão completa do painel dos estudantes integrada ao dashboard do coordenador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Atendimentos Ativos</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {dashboardData.students.reduce((total, student) => total + student.total_attendances, 0)}
                      </p>
                      <p className="text-xs text-emerald-600">Total pelos estudantes</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800">Avaliação Média</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {dashboardData.students.length > 0
                          ? (dashboardData.students.reduce((total, student) => total + student.avg_rating, 0) / dashboardData.students.length).toFixed(1)
                          : '0.0'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Satisfação dos clientes</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Estudantes Ativos</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{dashboardData.students.length}</p>
                      <p className="text-xs text-purple-600">Realizando atendimentos</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Produtividade</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">92%</p>
                      <p className="text-xs text-orange-600">Taxa de eficiência</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance dos Estudantes - Componente Completo */}
              <StudentsPerformancePanel />
            </div>

            {/* Portal Integration Features */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades do Portal do Estudante</CardTitle>
                <CardDescription>
                  Acesso direto às principais funcionalidades disponíveis aos estudantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Dashboard</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visão geral</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Estatísticas principais, próximos atendimentos e progresso
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedStudentPortalView('dashboard')}
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Atendimentos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gestão completa</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Agendamentos, histórico, status e avaliações
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedStudentPortalView('attendances')}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Treinamentos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Capacitação</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Módulos, progresso, certificações e avaliações
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedStudentPortalView('trainings')}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Acompanhar
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Relatórios</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Exportações, métricas pessoais e análises
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedStudentPortalView('reports')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fiscal" className="space-y-6">
            {/* Métricas dos Agendamentos Fiscais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Agendamentos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.fiscalAppointments?.totalAppointments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.fiscalAppointments?.pendingAppointments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmados</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.fiscalAppointments?.confirmedAppointments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgentes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.fiscalAppointments?.urgentAppointments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Serviços Mais Solicitados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <FileText className="h-5 w-5" />
                    Serviços Mais Solicitados
                  </CardTitle>
                  <CardDescription>
                    Distribuição dos agendamentos por tipo de orientação fiscal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.fiscalAppointments?.serviceBreakdown &&
                      Object.values(dashboardData.fiscalAppointments.serviceBreakdown)
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 6)
                        .map((service) => {
                          const percentage = dashboardData.fiscalAppointments?.totalAppointments
                            ? (service.total / dashboardData.fiscalAppointments.totalAppointments) * 100
                            : 0

                          return (
                            <div key={service.service_type} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{service.service_title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {service.total} total
                                    </Badge>
                                    {service.urgent > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {service.urgent} urgente
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                  </div>
                </CardContent>
              </Card>

              {/* Agendamentos Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <Activity className="h-5 w-5" />
                    Agendamentos Recentes
                  </CardTitle>
                  <CardDescription>
                    Últimas solicitações de orientação fiscal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {dashboardData.fiscalAppointments?.recentAppointments?.map((appointment) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'PENDENTE': return 'bg-yellow-100 text-yellow-800'
                          case 'CONFIRMADO': return 'bg-blue-100 text-blue-800'
                          case 'CONCLUIDO': return 'bg-green-100 text-green-800'
                          case 'CANCELADO': return 'bg-red-100 text-red-800'
                          default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }
                      }

                      const getUrgencyColor = (urgency: string) => {
                        switch (urgency) {
                          case 'URGENTE': return 'bg-red-100 text-red-800'
                          case 'ALTA': return 'bg-orange-100 text-orange-800'
                          case 'NORMAL': return 'bg-blue-100 text-blue-800'
                          case 'BAIXA': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }
                      }

                      return (
                        <div key={appointment.protocol} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {appointment.client_name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {appointment.service_title}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {appointment.protocol}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <Badge className={getUrgencyColor(appointment.urgency_level)}>
                                {appointment.urgency_level}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(appointment.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Atendimentos Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsPanel />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Usuários Cadastrados via Chat
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie usuários que se cadastraram através do sistema de chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <History className="h-6 w-6 text-purple-600" />
                  Histórico Completo de Atividades
                </CardTitle>
                <CardDescription>
                  Acompanhe todas as atividades de usuários, conversas e agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Dashboard de histórico em desenvolvimento...</p>
                  <p className="text-sm text-gray-400">Em breve: histórico de usuários, conversas e agendamentos</p>
                </div>
                {/* <HistoryDashboard
                  coordinatorId={user?.id || 'coord-1'}
                  coordinatorName={user?.name || 'Coordenador'}
                /> */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="min-h-[700px] dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <MessageCircle className="h-5 w-5" />
                  Central de Atendimento via Chat
                </CardTitle>
                <CardDescription>
                  À esquerda: solicitações pendentes para aprovar. À direita: chat ativo com o cliente.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <CoordinatorInterface
                  coordinatorId={user?.id || 'coordinator'}
                  coordinatorName={user?.name || user?.email || 'Coordenador'}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <BusinessIntelligence />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <BackupCenter
              coordinatorId={user?.id || 'unknown'}
              coordinatorName={user?.name || 'Coordenador'}
              coordinatorEmail={user?.email || 'coordenador@naf.com'}
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2 border border-slate-200/70 shadow-lg shadow-blue-100/50">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                      <Cpu className="h-6 w-6 text-blue-600" />
                      Automação Fiscal Integrada
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-transparent">Beta</Badge>
                  </div>
                  <CardDescription>
                    Configure a automação com o arquivo exportado do NAF (CSV ou PDF) e deixe o sistema preencher os formulários da Receita Federal automaticamente.
                  </CardDescription>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                    <FileText className="h-4 w-4" />
                    Formulário ativo: {selectedAutomation.name}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {automationForms.map(form => (
                      <button
                        key={form.id}
                        type="button"
                        onClick={() => handleAutomationFormChange(form.id)}
                        className={`group flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                          selectedAutomationForm === form.id
                            ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-200'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            selectedAutomationForm === form.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{form.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{form.description}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-500">
                          <span>automação | forms.office.com</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
                        <label className="flex cursor-pointer flex-col items-center gap-3 text-slate-600">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Arraste e solte o arquivo CSV ou PDF</p>
                            <p className="text-xs text-slate-500">Arquivos exportados na planilha oficial do NAF</p>
                          </div>
                          <input
                            type="file"
                            accept=".csv,.pdf"
                            className="hidden"
                            ref={automationFileInputRef}
                            onChange={handleAutomationFileChange}
                          />
                          <Badge className="border-transparent bg-white text-blue-600">CSV preferencial • PDF compatível</Badge>
                        </label>
                        {automationFile && (
                          <div className="mt-4 rounded-xl bg-white p-3 text-left shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Arquivo selecionado</p>
                            <p className="mt-1 text-sm font-medium text-slate-700">{automationFile.name}</p>
                            <p className="text-xs text-slate-500">{automationFile.type || 'Formato detectado automaticamente'}</p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">Status da automação</span>
                          <Badge
                            className={`border-transparent ${
                              automationStatus === 'starting'
                                ? 'bg-amber-100 text-amber-700'
                                : automationStatus === 'ready'
                                  ? 'bg-green-100 text-green-700'
                                  : automationStatus === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {automationStatus === 'starting' && 'Preparando'}
                            {automationStatus === 'ready' && 'Pronto'}
                            {automationStatus === 'error' && 'Atenção'}
                            {automationStatus === 'idle' && 'Aguardando'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-slate-600">{automationMessage}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={handleAutomationStart}
                          >
                            Iniciar automação
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAutomationFile(null)
                              setAutomationPreview([])
                              setAutomationStatus('idle')
                              setAutomationMessage('Selecione um arquivo de dados para iniciar a automação.')
                              if (automationFileInputRef.current) {
                                automationFileInputRef.current.value = ''
                              }
                            }}
                          >
                            Limpar seleção
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="text-slate-600 hover:text-blue-600">
                            <Link
                              href="https://github.com/ltd-2025-02/naf-contabilidade-estacio/blob/main/doc/ATUALIZACAO_REGISTRO_ATENDIMENTOS.md"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Guia rápido
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">Pré-visualização</span>
                          <Badge className="bg-slate-100 text-slate-600 border-transparent">primeiras linhas</Badge>
                        </div>
                        {automationPreview.length === 0 && (
                          <p className="mt-3 text-xs text-slate-500">
                            Faça o upload de um CSV para visualizar as seis primeiras linhas antes de iniciar a automação.
                          </p>
                        )}
                        {automationPreview.length > 0 && (
                          <div className="mt-3 space-y-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5">
                            {automationPreview.map((line, index) => (
                              <div key={index} className="flex items-start gap-2 bg-white/80 px-3 py-2 text-xs text-slate-600">
                                <span className="font-semibold text-blue-500">{index + 1}</span>
                                <span className="font-mono text-[11px]">{line}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          Como a automação funciona
                        </h4>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                          <li>• O arquivo é interpretado e cada linha é enviada sequencialmente para o formulário selecionado.</li>
                          <li>• Campos obrigatórios são validados antes do envio, reduzindo chances de rejeição.</li>
                          <li>• Logs detalhados podem ser acompanhados na aplicação Python em <code className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-white">automacao-ltd/main.py</code>.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    Pré-Validação inteligente
                  </CardTitle>
                  <CardDescription>
                    Recomendações baseadas na automação em Python (Selenium) para garantir preenchimento perfeito.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-slate-600">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
                    <p className="text-sm font-semibold text-blue-700">Checklist automático</p>
                    <ul className="mt-3 space-y-1">
                      <li>• Certifique-se de que o CSV esteja separado por ponto e vírgula.</li>
                      <li>• Utilize UTF-8 para preservar acentos e cedilhas.</li>
                      <li>• Para PDFs, valide os campos manualmente (entrada assistida).</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700">Resultados esperados</p>
                    <p className="mt-2 leading-relaxed">
                      A automação reproduz os passos presentes na ferramenta desktop (<code className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-white">automacao-ltd</code>) utilizando Selenium e múltiplas verificações de tela. O painel web replica a mesma lógica de pré-configuração.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700">Suporte avançado</p>
                    <p className="mt-2">Todos os envios são registrados em <code className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-white">logs/automation.log</code> e podem ser auditados pelo coordenador.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="domain-status" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden border border-blue-100 shadow-md shadow-blue-100/40 xl:col-span-2">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50" />
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                      <Shield className="h-6 w-6 text-blue-600" />
                      Monitoramento do Domínio
                    </CardTitle>
                    <Badge className={`${domainStatusTone} border-transparent px-3 py-1 text-sm`}>{domainStatusLabel}</Badge>
                  </div>
                  <CardDescription className="text-sm text-slate-600">
                    {domainStatusSubtext}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-white/70 p-4 shadow-sm shadow-blue-100/30 backdrop-blur sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Domínio</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">naf.ltdestacio.com.br</p>
                      <p className="text-xs text-slate-500">Gerenciado via registro.br</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-4 shadow-sm shadow-blue-100/30 backdrop-blur sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Expiração</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">{formatDate(domainExpiry)}</p>
                      <p className="text-xs text-slate-500">{daysRemaining} dias restantes</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-4 shadow-sm shadow-blue-100/30 backdrop-blur sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Janela de Renovação</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">{formatDate(renewalWindowStart)}</p>
                      <p className="text-xs text-slate-500">Recomendada {renewalWindowDays} dias antes</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>Progresso do ciclo 2025 / 2026</span>
                      <span>{renewalProgress}%</span>
                    </div>
                    <Progress value={renewalProgress} className="h-2 bg-blue-100" />
                    <p className="text-xs text-slate-500">
                      A recomendação é confirmar a renovação ao menos 30 dias antes do vencimento para evitar períodos de carência.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {domainChecklist.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={`${item.title}-${index}`}
                          className="flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                        >
                          <Icon className={`h-3.5 w-3.5 ${item.tone}`} />
                          <span>{item.title}</span>
                          <Badge className={`border-transparent bg-slate-100 text-slate-700`}>{item.status}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-blue-600" />
                    Linha do tempo
                  </CardTitle>
                  <CardDescription>Eventos críticos e pontos de atenção do ciclo atual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {domainTimeline.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <Icon className={`h-4 w-4 ${item.tone}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                            <span className="text-xs font-medium text-blue-600">{item.value}</span>
                          </div>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-slate-200/70 shadow-sm shadow-blue-100/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Governança e trâmites de renovação
                </CardTitle>
                <CardDescription>
                  Plano operacional para garantir disponibilidade do domínio institucional e continuidade dos serviços digitais.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
                  <h4 className="text-sm font-semibold text-blue-700">Checklist Executivo</h4>
                  <ul className="mt-3 space-y-2 text-xs text-blue-800">
                    <li>• Confirmar pagamento até <strong>{formatDate(renewalWindowStart)}</strong></li>
                    <li>• Validar dados de contato técnico e cobrança</li>
                    <li>• Registrar evidências no basecamp de compliance</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700">Ações rápidas</h4>
                  <div className="mt-3 flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={domainRegistrarUrl} target="_blank" rel="noreferrer">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Abrir painel do registro.br
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-slate-600 hover:text-blue-600">
                      <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
                      Agendar lembrete no calendário institucional
                    </Button>
                    <Button variant="ghost" className="justify-start text-slate-600 hover:text-blue-600">
                      <Shield className="mr-2 h-4 w-4 text-blue-500" />
                      Baixar relatório de auditoria DNS
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700">Status ampliado</h4>
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <p><span className="font-semibold">Dias restantes:</span> {daysRemaining}</p>
                    <p><span className="font-semibold">Janela de renovação:</span> {formatDate(renewalWindowStart)} a {formatDate(domainExpiry)}</p>
                    <p><span className="font-semibold">Responsável técnico:</span> Equipe de infraestrutura digital</p>
                    <p><span className="font-semibold">Última auditoria:</span> {formatDate(new Date('2024-11-12T00:00:00-03:00'))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Completo do Coordenador</CardTitle>
                <CardDescription>Gere um relatório profissional com gráficos, textos e tabelas do período selecionado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="coord-format" className="text-sm text-gray-600 dark:text-gray-400">Formato</label>
                    <select id="coord-format" className="w-full border rounded px-3 py-2">
                      <option value="pdf">PDF</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="csv">CSV</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="coord-period" className="text-sm text-gray-600 dark:text-gray-400">Período</label>
                    <select id="coord-period" className="w-full border rounded px-3 py-2" defaultValue="30d">
                      <option value="7d">Últimos 7 dias</option>
                      <option value="30d">Últimos 30 dias</option>
                      <option value="90d">Últimos 3 meses</option>
                      <option value="365d">Último ano</option>
                      <option value="all">Todos</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="coord-status" className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                    <select id="coord-status" className="w-full border rounded px-3 py-2">
                      <option value="all">Todos</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="coord-category" className="text-sm text-gray-600 dark:text-gray-400">Categoria (Serviço)</label>
                    <select id="coord-category" className="w-full border rounded px-3 py-2">
                      <option value="all">Todas</option>
                      {dashboardData?.services?.slice(0, 50).map((s: unknown, idx: number) => (
                        <option key={idx} value={s.service_type}>{s.service_type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={async () => {
                      const f = (document.getElementById('coord-format') as HTMLSelectElement)?.value || 'pdf'
                      const p = (document.getElementById('coord-period') as HTMLSelectElement)?.value || '30d'
                      const st = (document.getElementById('coord-status') as HTMLSelectElement)?.value || 'all'
                      const cat = (document.getElementById('coord-category') as HTMLSelectElement)?.value || 'all'
                      try {
                        const res = await fetch(`/api/coordinator/report?format=${encodeURIComponent(f)}&period=${encodeURIComponent(p)}&status=${encodeURIComponent(st)}&category=${encodeURIComponent(cat)}`)
                        if (!res.ok) {
                          const txt = await res.text().catch(() => '')
                          alert(`❌ Erro ao gerar relatório (${res.status}). Detalhe: ${txt?.slice(0,200)}`)
                          return
                        }
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `relatorio-coordenador-${new Date().toISOString().split('T')[0]}.${f === 'xlsx' ? 'xlsx' : (f === 'docx' ? 'docx' : (f === 'csv' ? 'csv' : 'pdf'))}`
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        URL.revokeObjectURL(url)
                      } catch (e) {
                        console.error(e)
                        alert('❌ Erro ao gerar relatório. Verifique sua conexão.')
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Enhanced Report Dashboard */}
            <AdvancedReportsCenter />
          </TabsContent>

          <TabsContent value="chat-links" className="space-y-6">
            <ChatLinkGenerator />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Central de Backup do Supabase
                </CardTitle>
                <CardDescription>
                  Configure e exporte um backup completo das tabelas listadas em <code>database/tables.sql</code>, pronto para restauração no Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="backup-format" className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato do Backup</label>
                    <select
                      id="backup-format"
                      className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2"
                      value={backupForm.format}
                      onChange={(event) => handleFormatChange(event.target.value as BackupFormatOption)}
                    >
                      <option value="zip">Pacote ZIP (recomendado)</option>
                      <option value="json">JSON estruturado</option>
                      <option value="sql">Script SQL</option>
                      <option value="csv">CSV separado por vírgula</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      O formato ZIP inclui vários arquivos (JSON, CSV, SQL) em um único pacote comprimido.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="backup-scope" className="text-sm font-medium text-gray-700 dark:text-gray-300">Escopo das Tabelas</label>
                    <input
                      id="backup-scope"
                      className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2"
                      placeholder="full ou lista: attendances,students,services"
                      value={backupForm.scope}
                      onChange={(event) => setBackupForm(prev => ({ ...prev, scope: event.target.value }))}
                    />
                    <p className="text-xs text-gray-500">
                      Use <code>full</code> para incluir todas as tabelas detectadas ou informe uma lista separada por vírgulas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Opções de Conteúdo</p>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                        checked={backupForm.includeSchema}
                        onChange={(event) => setBackupForm(prev => ({ ...prev, includeSchema: event.target.checked }))}
                      />
                      Incluir schema (<code>database/tables.sql</code>)
                    </label>
                    <label className={`flex items-center gap-2 text-sm ${previewAllowed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                        checked={previewAllowed && backupForm.preview}
                        onChange={(event) => setBackupForm(prev => ({ ...prev, preview: event.target.checked }))}
                        disabled={!previewAllowed}
                      />
                      Pré-visualizar somente metadados (apenas JSON)
                    </label>
                    {!previewAllowed && (
                      <p className="text-xs text-gray-500">
                        Ative o preview selecionando o formato JSON.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="backup-batch-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho do Lote</label>
                    <input
                      type="number"
                      min={100}
                      max={2000}
                      step={100}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2"
                      id="backup-batch-size"
                      value={backupForm.batchSize}
                      onChange={(event) => {
                        const nextValue = Number.parseInt(event.target.value, 10)
                        setBackupForm(prev => ({ ...prev, batchSize: Number.isFinite(nextValue) ? nextValue : prev.batchSize }))
                      }}
                    />
                    <p className="text-xs text-gray-500">Define quantos registros são lidos por requisição (padrão 1000).</p>
                  </div>

                  {extrasAvailable ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arquivos Inclusos no ZIP</p>
                      <div className="flex flex-wrap gap-3">
                        {['json', 'csv', 'sql'].map(extra => (
                          <label key={extra} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                              checked={backupForm.extras.includes(extra)}
                              onChange={() => toggleExtra(extra)}
                            />
                            {extra.toUpperCase()}
                          </label>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="backup-compression" className="text-sm font-medium text-gray-700 dark:text-gray-300">Compressão</label>
                        <select
                          id="backup-compression"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2"
                          value={backupForm.compression}
                          onChange={(event) => setBackupForm(prev => ({ ...prev, compression: event.target.value as 'gzip' | 'store' }))}
                        >
                          <option value="gzip">GZIP (arquivo menor)</option>
                          <option value="store">Sem compressão</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Detalhes do formato</p>
                      <div className="rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-400">
                        <p>
                          • SQL gera comandos <code>INSERT</code> prontos para o Supabase.<br />
                          • CSV exporta um arquivo por tabela dentro de um ZIP.<br />
                          • JSON retorna um objeto estruturado com metadados e dados.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackupPreview}
                    disabled={backupLoading || !previewAllowed}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Pré-visualizar
                  </Button>
                  <Button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleBackupDownload}
                    disabled={backupLoading}
                  >
                    <HardDriveDownload className="mr-2 h-4 w-4" />
                    {backupLoading ? 'Processando…' : 'Gerar Backup'}
                  </Button>
                  <span className="text-xs text-gray-500">
                    O backup é processado diretamente no servidor e baixado automaticamente no navegador.
                  </span>
                </div>
              </CardContent>
            </Card>

            {backupError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{backupError}</AlertDescription>
              </Alert>
            )}

            {backupMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do último backup</CardTitle>
                  <CardDescription>
                    Gerado em {new Date(backupMetadata.generatedAt).toLocaleString('pt-BR')} — {backupMetadata.tableCount} tabela(s), {backupMetadata.totalRows.toLocaleString('pt-BR')} registro(s).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-4">
                      <p className="text-xs uppercase text-gray-500">Formato</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{backupMetadata.format.toUpperCase()}</p>
                    </div>
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-4">
                      <p className="text-xs uppercase text-gray-500">Tamanho estimado</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{formatBytes(backupMetadata.totalBytes)}</p>
                    </div>
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-4">
                      <p className="text-xs uppercase text-gray-500">Tempo de coleta</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{formatDuration(backupMetadata.fetchDurationMs)}</p>
                    </div>
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-4">
                      <p className="text-xs uppercase text-gray-500">Extras</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{backupMetadata.extras?.length ? backupMetadata.extras.join(', ').toUpperCase() : '—'}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs uppercase text-emerald-700">Escopo</p>
                      <p className="text-sm text-emerald-900">
                        {backupMetadata.scope?.length ? backupMetadata.scope.join(', ') : 'Todas as tabelas listadas no schema.'}
                      </p>
                      <p className="mt-2 text-xs text-emerald-700">
                        Schema incluído: {backupMetadata.schemaIncluded ? 'sim' : 'não'} • Serviço privilegiado: {backupMetadata.serviceRole ? 'sim' : 'não'}
                      </p>
                    </div>
                    <div className="rounded border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs uppercase text-blue-700 dark:text-blue-300">Status</p>
                      <p className="text-sm text-blue-900">
                        {backupMetadata.errorCount > 0 ? `${backupMetadata.errorCount} erro(s) identificado(s)` : 'Nenhum erro registrado.'}
                      </p>
                    </div>
                  </div>

                  {backupMetadataErrors && backupMetadataErrors.length > 0 && (
                    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <p className="mb-2 font-medium">Tabelas com falha na exportação:</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {backupMetadataErrors.map((err, index) => (
                          <li key={index}><span className="font-semibold">{err.table}</span>: {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {backupTablesPreview.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tabelas exportadas</h4>
                      <div className="overflow-auto rounded border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">Tabela</th>
                              <th className="px-3 py-2 text-right">Registros</th>
                              <th className="px-3 py-2 text-right">Tamanho</th>
                              <th className="px-3 py-2 text-right">Tempo</th>
                              <th className="px-3 py-2 text-center">Observações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {backupTablesPreview.map(table => (
                              <tr key={table.name}>
                                <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{table.name}</td>
                                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{table.rowCount.toLocaleString('pt-BR')}</td>
                                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatBytes(table.estimatedBytes)}</td>
                                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatDuration(table.durationMs)}</td>
                                <td className="px-3 py-2 text-center text-xs text-gray-500">
                                  {table.truncated ? 'Exportação truncada' : table.empty ? 'Sem registros' : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {backupMetadata.tables && backupMetadata.tables.length > backupTablesPreview.length && (
                        <p className="text-xs text-gray-500">
                          Mostrando {backupTablesPreview.length} de {backupMetadata.tables.length} tabelas. Gere um preview para listas completas.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {backupHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico recente</CardTitle>
                  <CardDescription>Últimas ações realizadas neste painel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 dark:bg-gray-900 dark:border-gray-800">
                  {backupHistory.map(item => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 dark:border-gray-800 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.success ? 'Backup concluído' : 'Backup com falha'} — {item.format.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString('pt-BR')} • Escopo: {item.scope || 'full'}
                          {item.rows !== undefined && ` • Registros: ${item.rows.toLocaleString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        Extras: {item.extras.length ? item.extras.join(', ').toUpperCase() : '—'}
                        {item.error && <p className="text-red-600">{item.error}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <NAFFooter />

      {/* Student Portal Features Dialog */}
      <Dialog open={selectedStudentPortalView !== null} onOpenChange={(open) => !open && setSelectedStudentPortalView(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudentPortalView === 'dashboard' && 'Dashboard do Estudante'}
              {selectedStudentPortalView === 'attendances' && 'Atendimentos do Estudante'}
              {selectedStudentPortalView === 'trainings' && 'Treinamentos do Estudante'}
              {selectedStudentPortalView === 'reports' && 'Relatórios do Estudante'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudentPortalView === 'dashboard' && 'Visualização geral das estatísticas e progresso dos estudantes'}
              {selectedStudentPortalView === 'attendances' && 'Gerenciamento completo dos atendimentos realizados pelos estudantes'}
              {selectedStudentPortalView === 'trainings' && 'Acompanhamento de cursos, certificações e progresso dos estudantes'}
              {selectedStudentPortalView === 'reports' && 'Exportação e análise de métricas de performance dos estudantes'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {selectedStudentPortalView === 'dashboard' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Esta funcionalidade permite visualizar o dashboard completo de qualquer estudante.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Total de Atendimentos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Taxa de Sucesso</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Performance Score</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">Progresso Mensal</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedStudentPortalView === 'attendances' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Gerencie todos os atendimentos dos estudantes.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Funcionalidades de Gestão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Agendamentos</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Gerencie agendamentos ativos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Avaliações</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Veja feedbacks dos clientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedStudentPortalView === 'trainings' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Acompanhe o progresso dos estudantes em treinamentos.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Módulos de Capacitação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Cursos Disponíveis</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Visualize módulos de treinamento</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Certificações</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Gerencie certificados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedStudentPortalView === 'reports' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Exporte relatórios detalhados de performance.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tipos de Relatórios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Relatório de Performance</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Métricas completas de atendimentos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Exportação Múltipla</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">PDF, Excel, CSV ou JSON</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedStudentPortalView(null)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                if (selectedStudentPortalView === 'dashboard') {
                  setActiveTab('performance')
                } else if (selectedStudentPortalView === 'attendances') {
                  setActiveTab('appointments')
                } else if (selectedStudentPortalView === 'reports') {
                  setActiveTab('reports')
                }
                setSelectedStudentPortalView(null)
              }}
            >
              Acessar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
