'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Database,
  Download,
  Mail,
  Eye,
  Shield,
  Clock,
  FileText,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Archive,
  Send,
  FileJson,
  FileSpreadsheet,
  FileType,
  AlertTriangle,
  TrendingUp,
  User,
  BarChart3,
  Settings,
  Bell,
  HardDrive,
  Zap,
  Save,
  Trash2,
  FileArchive
} from 'lucide-react'

interface BackupCenterProps {
  coordinatorId: string
  coordinatorName: string
  coordinatorEmail: string
}

interface BackupLog {
  id: string
  backup_type: string
  export_format: string
  file_size_kb: number
  total_records: number
  created_at: string
  success: boolean
  email_sent_to?: string
  execution_time_ms: number
  ip_address?: string
}

interface BackupStats {
  total_backups: number
  total_downloads: number
  total_emails: number
  total_previews: number
  total_records_exported: number
  total_size_kb: number
  avg_execution_time_ms: number
  last_backup_date: string | null
  failed_backups: number
}

export default function BackupCenter({ coordinatorId, coordinatorName, coordinatorEmail }: BackupCenterProps) {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [activeTab, setActiveTab] = useState('backup')

  // Filtros de backup
  const [format, setFormat] = useState('csv')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [includeFeedback, setIncludeFeedback] = useState(true)

  // E-mail
  const [recipientEmail, setRecipientEmail] = useState(coordinatorEmail)
  const [emailMessage, setEmailMessage] = useState('')

  // Preview
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Estado de mensagens
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Configurações Avançadas
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [autoBackupFrequency, setAutoBackupFrequency] = useState('weekly')
  const [autoBackupEmail, setAutoBackupEmail] = useState(coordinatorEmail)
  const [retentionDays, setRetentionDays] = useState('90')
  const [defaultFormat, setDefaultFormat] = useState('csv')
  const [enableCompression, setEnableCompression] = useState(true)
  const [maxFileSizeMB, setMaxFileSizeMB] = useState('50')
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(true)
  const [notifyOnFailure, setNotifyOnFailure] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [configSaved, setConfigSaved] = useState(false)

  useEffect(() => {
    loadLogs()
    loadBackupConfig()
  }, [])

  const loadBackupConfig = () => {
    // Carrega configurações do localStorage
    const savedConfig = localStorage.getItem(`backup-config-${coordinatorId}`)
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setAutoBackupEnabled(config.autoBackupEnabled ?? false)
        setAutoBackupFrequency(config.autoBackupFrequency ?? 'weekly')
        setAutoBackupEmail(config.autoBackupEmail ?? coordinatorEmail)
        setRetentionDays(config.retentionDays ?? '90')
        setDefaultFormat(config.defaultFormat ?? 'csv')
        setEnableCompression(config.enableCompression ?? true)
        setMaxFileSizeMB(config.maxFileSizeMB ?? '50')
        setNotifyOnSuccess(config.notifyOnSuccess ?? true)
        setNotifyOnFailure(config.notifyOnFailure ?? true)
        setIncludeMetadata(config.includeMetadata ?? true)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
  }

  const saveBackupConfig = () => {
    const config = {
      autoBackupEnabled,
      autoBackupFrequency,
      autoBackupEmail,
      retentionDays,
      defaultFormat,
      enableCompression,
      maxFileSizeMB,
      notifyOnSuccess,
      notifyOnFailure,
      includeMetadata,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem(`backup-config-${coordinatorId}`, JSON.stringify(config))
    setConfigSaved(true)
    setSuccessMessage('✅ Configurações salvas com sucesso!')
    
    setTimeout(() => {
      setConfigSaved(false)
      setSuccessMessage('')
    }, 3000)
  }

  const resetBackupConfig = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      localStorage.removeItem(`backup-config-${coordinatorId}`)
      setAutoBackupEnabled(false)
      setAutoBackupFrequency('weekly')
      setAutoBackupEmail(coordinatorEmail)
      setRetentionDays('90')
      setDefaultFormat('csv')
      setEnableCompression(true)
      setMaxFileSizeMB('50')
      setNotifyOnSuccess(true)
      setNotifyOnFailure(true)
      setIncludeMetadata(true)
      setSuccessMessage('✅ Configurações restauradas para o padrão!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const loadLogs = async () => {
    try {
      const response = await fetch(`/api/coordinator/backup/logs?coordinatorId=${coordinatorId}&limit=50`)
      const result = await response.json()

      if (result.success) {
        setLogs(result.data.logs)
        setStats(result.data.statistics)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const applyDefaultConfig = () => {
    setFormat(defaultFormat)
    setIncludeFeedback(includeMetadata)
  }

  const handleDownload = async () => {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/coordinator/backup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatorId,
          coordinatorName,
          coordinatorEmail,
          format,
          filters: {
            status: statusFilter.length > 0 ? statusFilter : undefined
          },
          dateRange: {
            start: dateStart || undefined,
            end: dateEnd || undefined
          },
          includeFeeback: includeFeedback
        })
      })

      const result = await response.json()

      if (result.success) {
        // Converter base64 para blob e fazer download
        const byteCharacters = atob(result.data.content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: result.data.mimeType })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        setSuccessMessage(`✅ Download concluído! ${result.data.totalRecords} registros exportados (${result.data.fileSize.toFixed(2)} KB)`)
        await loadLogs()
      } else {
        setErrorMessage(result.error || 'Erro ao gerar backup')
      }
    } catch (error) {
      setErrorMessage('Erro ao fazer download do backup')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      console.log('📧 Iniciando envio de backup por e-mail...')
      
      // 1. Primeiro, gerar o backup com os dados
      const backupResponse = await fetch('/api/coordinator/backup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatorId,
          coordinatorName,
          coordinatorEmail,
          format: 'json', // Sempre JSON para o anexo do email
          filters: {
            status: statusFilter.length > 0 ? statusFilter : undefined
          },
          dateRange: {
            start: dateStart || undefined,
            end: dateEnd || undefined
          },
          includeFeedback
        })
      })

      const backupResult = await backupResponse.json()
      console.log('📦 Backup gerado:', {
        success: backupResult.success,
        hasData: !!backupResult.data
      })

      if (!backupResponse.ok || !backupResult.success) {
        throw new Error(backupResult.error || 'Erro ao gerar backup')
      }

      // Decodificar o conteúdo base64
      let parsedBackupData: any
      try {
        const base64Content = backupResult.data.content
        const decodedContent = atob(base64Content)
        parsedBackupData = JSON.parse(decodedContent)
        console.log('✅ Dados do backup decodificados:', {
          recordsCount: parsedBackupData.length || 0,
          isArray: Array.isArray(parsedBackupData)
        })
      } catch (decodeError) {
        console.error('❌ Erro ao decodificar backup:', decodeError)
        throw new Error('Erro ao processar dados do backup')
      }

      // Estruturar dados para a API de email
      const backupDataForEmail: Record<string, any[]> = {
        atendimentos: Array.isArray(parsedBackupData) ? parsedBackupData : []
      }

      // Extrair lista de estudantes únicos
      const studentsSet = new Set<string>()
      const studentsList: Array<{name?: string, email?: string, id?: string}> = []
      
      if (Array.isArray(parsedBackupData)) {
        parsedBackupData.forEach((record: any) => {
          const studentId = record.estudante_id || record.student_id
          const studentName = record.estudante_nome || record.student_name
          const studentEmail = record.estudante_email || record.student_email
          
          if (studentId && !studentsSet.has(studentId)) {
            studentsSet.add(studentId)
            studentsList.push({
              id: studentId,
              name: studentName,
              email: studentEmail
            })
          }
        })
      }

      console.log('👥 Estudantes extraídos:', studentsList.length)

      // 2. Enviar o backup por e-mail usando a nova API
      console.log('📧 Enviando para API de e-mail...')
      
      const emailResponse = await fetch('/api/backup/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatorEmail: recipientEmail || coordinatorEmail,
          coordinatorName: coordinatorName || 'Coordenador',
          backupData: backupDataForEmail,
          students: studentsList
        })
      })

      const emailResult = await emailResponse.json()
      console.log('📧 Resultado do envio:', {
        success: emailResult.success,
        error: emailResult.error
      })

      if (!emailResponse.ok || !emailResult.success) {
        throw new Error(emailResult.error || emailResult.details || 'Erro ao enviar e-mail')
      }

      setSuccessMessage(
        `📧 Backup enviado com sucesso para ${recipientEmail || coordinatorEmail}!\n` +
        `📊 ${emailResult.data.total_records} registros exportados\n` +
        `📋 ${emailResult.data.tables_count} tabelas incluídas\n` +
        `👥 ${emailResult.data.students_count} estudantes\n` +
        `📥 Arquivo: ${emailResult.data.filename}`
      )
      setEmailMessage('')
      await loadLogs()
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar e-mail:', error)
      setErrorMessage(error.message || 'Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <FileJson className="h-4 w-4" />
      case 'csv':
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />
      default: return <FileType className="h-4 w-4" />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'json': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'csv': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'excel': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pdf': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'txt': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Central de Backup Profissional</CardTitle>
                <CardDescription>
                  Sistema avançado de backup e controle de atendimentos fiscais
                </CardDescription>
              </div>
            </div>
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Archive className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Total Backups</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_backups}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Downloads</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_downloads}</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">E-mails</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_emails}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Registros</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_records_exported}</div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Volume</span>
                </div>
                <div className="text-2xl font-bold">{formatFileSize(stats.total_size_kb)}</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mensagens de Sucesso/Erro */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Gerar Backup
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Logs
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* ABA: Gerar Backup */}
        <TabsContent value="backup" className="space-y-6">
          {/* Card de Filtros */}
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Filter className="h-5 w-5 text-white" />
                    </div>
                    Configurar Exportação
                  </CardTitle>
                  <CardDescription className="text-base">
                    Personalize os filtros e formato para gerar seu backup
                  </CardDescription>
                </div>
                <Button
                  onClick={applyDefaultConfig}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-300 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4" />
                  Aplicar Padrão
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-8">
              {/* Formato de Exportação - Destaque especial */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <FileArchive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="format" className="text-lg font-semibold">Formato de Exportação</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Escolha o formato que melhor se adapta às suas necessidades
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { value: 'csv', icon: FileSpreadsheet, label: 'CSV', desc: 'Excel/Planilhas' },
                    { value: 'json', icon: FileJson, label: 'JSON', desc: 'APIs/Sistemas' },
                    { value: 'excel', icon: FileSpreadsheet, label: 'Excel', desc: 'Microsoft' },
                    { value: 'txt', icon: FileType, label: 'TXT', desc: 'Texto Simples' }
                  ].map(({ value, icon: Icon, label, desc }) => (
                    <div
                      key={value}
                      onClick={() => setFormat(value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        format === value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <Icon className={`h-8 w-8 ${format === value ? 'text-purple-600' : 'text-gray-500'}`} />
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                        {format === value && (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtros de Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Status dos Atendimentos</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selecione os status que deseja incluir no backup
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'SCHEDULED', label: 'Agendado' },
                    { key: 'IN_PROGRESS', label: 'Em Andamento' },
                    { key: 'COMPLETED', label: 'Concluído' },
                    { key: 'CANCELLED', label: 'Cancelado' },
                    { key: 'NO_SHOW', label: 'Não Compareceu' }
                  ].map(({ key, label }) => (
                    <Badge
                      key={key}
                      variant={statusFilter.includes(key) ? 'default' : 'outline'}
                      className="cursor-pointer py-2 px-4 text-sm transition-all hover:scale-105"
                      onClick={() => toggleStatusFilter(key)}
                    >
                      {statusFilter.includes(key) && <CheckCircle className="h-3 w-3 mr-1" />}
                      {label}
                    </Badge>
                  ))}
                </div>
                
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {statusFilter.length === 0 
                      ? '✅ Todos os status estão incluídos' 
                      : `📊 ${statusFilter.length} status selecionado${statusFilter.length > 1 ? 's' : ''}`
                    }
                  </AlertDescription>
                </Alert>
              </div>

              {/* Filtro de Período */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Período de Análise</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defina o intervalo de datas para filtrar os atendimentos
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <Label htmlFor="dateStart" className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data Inicial
                    </Label>
                    <Input
                      id="dateStart"
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <Label htmlFor="dateEnd" className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data Final
                    </Label>
                    <Input
                      id="dateEnd"
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="border-2"
                    />
                  </div>
                </div>
              </div>

              {/* Opções Adicionais */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Opções Avançadas</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Personalize o conteúdo do seu backup
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="includeFeedback" className="cursor-pointer font-medium">
                        Incluir Metadados Completos
                      </Label>
                      <p className="text-xs text-gray-500">
                        Timestamps, IDs internos e informações detalhadas
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="includeFeedback"
                    checked={includeFeedback}
                    onCheckedChange={setIncludeFeedback}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Download className="h-5 w-5" />
                  Download Direto
                </CardTitle>
                <CardDescription>Baixe o backup imediatamente para seu computador</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Backup...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Fazer Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* E-mail */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Mail className="h-5 w-5" />
                  Enviar por E-mail
                </CardTitle>
                <CardDescription>Receba o backup diretamente no seu e-mail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">E-mail de Destino</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailMessage">Mensagem (Opcional)</Label>
                  <Textarea
                    id="emailMessage"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Digite uma mensagem adicional..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleSendEmail}
                  disabled={loading || !recipientEmail}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por E-mail
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Acessos e Backups
              </CardTitle>
              <CardDescription>
                Registro completo de todas as operações de backup realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhum backup realizado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {log.backup_type === 'download' && <Download className="h-4 w-4 text-blue-600" />}
                            {log.backup_type === 'email' && <Mail className="h-4 w-4 text-purple-600" />}
                            {log.backup_type === 'preview' && <Eye className="h-4 w-4 text-green-600" />}
                            <span className="font-medium capitalize">{log.backup_type}</span>
                            <Badge className={getFormatColor(log.export_format)}>
                              {getFormatIcon(log.export_format)}
                              <span className="ml-1">{log.export_format.toUpperCase()}</span>
                            </Badge>
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Registros:</span> {log.total_records}
                            </div>
                            <div>
                              <span className="font-medium">Tamanho:</span> {formatFileSize(log.file_size_kb)}
                            </div>
                            <div>
                              <span className="font-medium">Tempo:</span> {log.execution_time_ms}ms
                            </div>
                            <div>
                              <span className="font-medium">Data:</span> {new Date(log.created_at).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          {log.email_sent_to && (
                            <div className="mt-2 text-sm text-purple-600">
                              📧 Enviado para: {log.email_sent_to}
                            </div>
                          )}
                          {log.ip_address && (
                            <div className="mt-1 text-xs text-gray-500">
                              IP: {log.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: Configurações */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Avançadas de Backup
              </CardTitle>
              <CardDescription>
                Personalize as preferências de backup, automação e notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup Automático */}
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Backup Automático</h3>
                      <p className="text-sm text-gray-600">Configure backups periódicos automáticos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoBackupEnabled"
                      checked={autoBackupEnabled}
                      onCheckedChange={setAutoBackupEnabled}
                    />
                    <Label htmlFor="autoBackupEnabled" className="cursor-pointer font-medium">
                      {autoBackupEnabled ? 'Ativado' : 'Desativado'}
                    </Label>
                  </div>
                </div>

                {autoBackupEnabled && (
                  <div className="space-y-4 mt-4 pl-4 border-l-2 border-blue-300">
                    <div className="space-y-2">
                      <Label htmlFor="autoBackupFrequency">Frequência de Backup</Label>
                      <Select value={autoBackupFrequency} onValueChange={setAutoBackupFrequency}>
                        <SelectTrigger id="autoBackupFrequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Diário (Todo dia às 2:00 AM)
                            </div>
                          </SelectItem>
                          <SelectItem value="weekly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Semanal (Domingos às 2:00 AM)
                            </div>
                          </SelectItem>
                          <SelectItem value="biweekly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Quinzenal (1º e 15º de cada mês)
                            </div>
                          </SelectItem>
                          <SelectItem value="monthly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Mensal (Primeiro dia do mês)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autoBackupEmail">E-mail para Receber Backups</Label>
                      <Input
                        id="autoBackupEmail"
                        type="email"
                        value={autoBackupEmail}
                        onChange={(e) => setAutoBackupEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                      <p className="text-xs text-gray-500">
                        Os backups automáticos serão enviados para este e-mail
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Retenção de Dados */}
              <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <HardDrive className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Retenção de Dados</h3>
                    <p className="text-sm text-gray-600">Configure por quanto tempo manter os backups</p>
                  </div>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-green-300">
                  <Label htmlFor="retentionDays">Período de Retenção</Label>
                  <Select value={retentionDays} onValueChange={setRetentionDays}>
                    <SelectTrigger id="retentionDays">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias (1 mês)</SelectItem>
                      <SelectItem value="60">60 dias (2 meses)</SelectItem>
                      <SelectItem value="90">90 dias (3 meses) - Recomendado</SelectItem>
                      <SelectItem value="180">180 dias (6 meses)</SelectItem>
                      <SelectItem value="365">365 dias (1 ano)</SelectItem>
                      <SelectItem value="730">730 dias (2 anos)</SelectItem>
                      <SelectItem value="unlimited">Ilimitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Backups mais antigos que este período serão automaticamente removidos do histórico
                  </p>
                </div>
              </div>

              {/* Formato e Compressão */}
              <div className="space-y-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FileArchive className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Formato e Compressão</h3>
                    <p className="text-sm text-gray-600">Configurações de formato e otimização</p>
                  </div>
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-purple-300">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFormat">Formato Padrão de Exportação</Label>
                    <Select value={defaultFormat} onValueChange={setDefaultFormat}>
                      <SelectTrigger id="defaultFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV - Planilha (Recomendado)
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON - Dados Estruturados
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel - Microsoft Excel
                          </div>
                        </SelectItem>
                        <SelectItem value="txt">
                          <div className="flex items-center gap-2">
                            <FileType className="h-4 w-4" />
                            TXT - Texto Simples
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCompression" className="cursor-pointer">
                      Habilitar compressão de arquivos (.zip)
                    </Label>
                    <Switch
                      id="enableCompression"
                      checked={enableCompression}
                      onCheckedChange={setEnableCompression}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Reduz o tamanho dos arquivos em até 70% para facilitar envio e armazenamento
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="maxFileSizeMB">Tamanho Máximo do Arquivo (MB)</Label>
                    <Select value={maxFileSizeMB} onValueChange={setMaxFileSizeMB}>
                      <SelectTrigger id="maxFileSizeMB">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 MB - Pequeno</SelectItem>
                        <SelectItem value="25">25 MB - Médio</SelectItem>
                        <SelectItem value="50">50 MB - Grande (Recomendado)</SelectItem>
                        <SelectItem value="100">100 MB - Muito Grande</SelectItem>
                        <SelectItem value="unlimited">Ilimitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Arquivos maiores serão divididos em partes menores automaticamente
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeMetadata" className="cursor-pointer">
                      Incluir metadados completos (timestamps, IPs, etc.)
                    </Label>
                    <Switch
                      id="includeMetadata"
                      checked={includeMetadata}
                      onCheckedChange={setIncludeMetadata}
                    />
                  </div>
                </div>
              </div>

              {/* Notificações */}
              <div className="space-y-4 p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Bell className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Notificações</h3>
                    <p className="text-sm text-gray-600">Configure alertas e notificações por e-mail</p>
                  </div>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnSuccess" className="cursor-pointer">
                      Notificar quando backup for concluído com sucesso
                    </Label>
                    <Switch
                      id="notifyOnSuccess"
                      checked={notifyOnSuccess}
                      onCheckedChange={setNotifyOnSuccess}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnFailure" className="cursor-pointer">
                      Notificar quando backup falhar (Recomendado)
                    </Label>
                    <Switch
                      id="notifyOnFailure"
                      checked={notifyOnFailure}
                      onCheckedChange={setNotifyOnFailure}
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveBackupConfig}
                  className="flex-1"
                  size="lg"
                  disabled={configSaved}
                >
                  {configSaved ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetBackupConfig}
                  variant="outline"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Restaurar Padrão
                </Button>
              </div>

              {/* Informações de Segurança */}
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Segurança:</strong> Todas as configurações são salvas localmente no seu navegador.
                  Os backups automáticos respeitam as mesmas regras de segurança dos backups manuais.
                </AlertDescription>
              </Alert>

              {/* Status das Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Backup Automático</span>
                  </div>
                  <Badge variant={autoBackupEnabled ? "default" : "secondary"}>
                    {autoBackupEnabled ? `Ativo (${autoBackupFrequency})` : 'Desativado'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Retenção</span>
                  </div>
                  <Badge variant="outline">
                    {retentionDays === 'unlimited' ? 'Ilimitada' : `${retentionDays} dias`}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileArchive className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Formato</span>
                  </div>
                  <Badge variant="outline">
                    {defaultFormat.toUpperCase()} {enableCompression && '+ ZIP'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
