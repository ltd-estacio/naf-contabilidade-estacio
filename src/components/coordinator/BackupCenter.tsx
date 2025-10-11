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
  Settings
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

  useEffect(() => {
    loadLogs()
  }, [])

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
      const response = await fetch('/api/coordinator/backup/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatorId,
          coordinatorName,
          coordinatorEmail,
          recipientEmail,
          format,
          filters: {
            status: statusFilter.length > 0 ? statusFilter : undefined
          },
          dateRange: {
            start: dateStart || undefined,
            end: dateEnd || undefined
          },
          includeFeeback: includeFeedback,
          message: emailMessage
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(`📧 E-mail enviado com sucesso para ${recipientEmail}! ${result.data.totalRecords} registros exportados.`)
        setEmailMessage('')
        await loadLogs()
      } else {
        setErrorMessage(result.error || 'Erro ao enviar e-mail')
      }
    } catch (error) {
      setErrorMessage('Erro ao enviar e-mail')
      console.error(error)
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Exportação
              </CardTitle>
              <CardDescription>Configure os filtros para o backup dos atendimentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formato de Exportação */}
              <div className="space-y-2">
                <Label htmlFor="format">Formato de Exportação</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV (Recomendado)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.csv)
                      </div>
                    </SelectItem>
                    <SelectItem value="txt">
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4" />
                        TXT
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label>Status dos Atendimentos</Label>
                <div className="flex flex-wrap gap-2">
                  {['PENDENTE', 'CONFIRMADO', 'AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU'].map(status => (
                    <Badge
                      key={status}
                      variant={statusFilter.includes(status) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleStatusFilter(status)}
                    >
                      {status.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {statusFilter.length === 0 ? 'Todos os status selecionados' : `${statusFilter.length} status selecionado(s)`}
                </p>
              </div>

              {/* Filtro de Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateStart">Data Inicial</Label>
                  <Input
                    id="dateStart"
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateEnd">Data Final</Label>
                  <Input
                    id="dateEnd"
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Opções Adicionais */}
              <div className="space-y-2">
                <Label>Opções de Conteúdo</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeFeedback"
                    checked={includeFeedback}
                    onChange={(e) => setIncludeFeedback(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="includeFeedback" className="cursor-pointer">
                    Incluir feedbacks dos atendimentos
                  </Label>
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
                Configurações de Backup
              </CardTitle>
              <CardDescription>
                Personalize as preferências de backup e notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  As configurações avançadas estarão disponíveis em breve.
                  Por enquanto, utilize as opções de filtro na aba "Gerar Backup".
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
