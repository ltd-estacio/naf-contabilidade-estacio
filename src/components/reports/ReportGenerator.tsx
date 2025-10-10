'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Settings,
  CheckCircle,
  Info,
  Loader2,
  Eye,
  Calendar,
  User,
  BarChart3,
  Trophy,
  BookOpen,
  Target
} from 'lucide-react'

interface ReportTemplate {
  title: string
  subtitle: string
  includeSummary: boolean
  includeAttendances: boolean
  includeTrainings: boolean
  includeEvaluations: boolean
  includeCharts: boolean
}

interface ReportGeneratorProps {
  className?: string
}

export default function ReportGenerator({ className }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [selectedTemplate, setSelectedTemplate] = useState('complete')
  const [customTemplate, setCustomTemplate] = useState<ReportTemplate>({
    title: 'Relatório de Desempenho do Estudante',
    subtitle: 'Sistema NAF - Núcleo de Apoio Contábil e Fiscal',
    includeSummary: true,
    includeAttendances: true,
    includeTrainings: true,
    includeEvaluations: true,
    includeCharts: false
  })
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)
  const [generationHistory, setGenerationHistory] = useState<Array<{
    id?: string
    format: string
    template: string
    timestamp: string
    filename: string
    reportType?: string
    fileSize?: number
    stats?: {
      totalAttendances: number
      completedAttendances: number
      successRate: number
      avgRating: number
      totalTrainings: number
      completedTrainings: number
    }
  }>>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const formats = [
    {
      value: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Documento portátil ideal para visualização e impressão',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      value: 'docx',
      label: 'Word',
      icon: FileText,
      description: 'Documento editável do Microsoft Word',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      value: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Planilha com dados organizados em abas',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: FileSpreadsheet,
      description: 'Valores separados por vírgula para análise',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      value: 'txt',
      label: 'Texto',
      icon: File,
      description: 'Arquivo de texto simples',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const templates = [
    {
      value: 'complete',
      label: 'Relatório Completo',
      description: 'Inclui todas as seções disponíveis',
      icon: Target,
      includes: ['resumo', 'atendimentos', 'treinamentos', 'avaliações']
    },
    {
      value: 'performance',
      label: 'Foco em Performance',
      description: 'Concentra-se em métricas de desempenho',
      icon: Trophy,
      includes: ['resumo', 'treinamentos', 'avaliações']
    },
    {
      value: 'attendances',
      label: 'Histórico de Atendimentos',
      description: 'Detalhes completos dos atendimentos realizados',
      icon: User,
      includes: ['resumo', 'atendimentos']
    },
    {
      value: 'trainings',
      label: 'Progresso em Treinamentos',
      description: 'Foco no desenvolvimento e capacitação',
      icon: BookOpen,
      includes: ['treinamentos']
    }
  ]

  // Buscar histórico de relatórios do banco de dados
  const fetchReportHistory = async () => {
    try {
      setLoadingHistory(true)
      const token = localStorage.getItem('student_token')
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      const response = await fetch('/api/students/reports-advanced/history?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar histórico')
      }

      const result = await response.json()

      if (result.success && result.data) {
        // Converter dados do banco para o formato do componente
        const historyFromDB = result.data.map((item: unknown) => ({
          id: item.id,
          format: item.format,
          template: item.template,
          timestamp: item.generatedAt,
          filename: `relatorio-${item.template}-${item.format}-${new Date(item.generatedAt).toISOString().split('T')[0]}.${item.format}`,
          reportType: item.reportType,
          fileSize: item.fileSize,
          stats: item.stats
        }))

        setGenerationHistory(historyFromDB)
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de relatórios:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Carregar histórico ao montar o componente
  useEffect(() => {
    fetchReportHistory()
  }, [])

  const generateReport = async (format: string, template?: ReportTemplate) => {
    try {
      setLoading(true)
      setDownloadProgress(0)

      const token = localStorage.getItem('student_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      // Simular progresso
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      let url: string
      let requestData: unknown = {}

      if (template) {
        // Usar endpoint POST para template customizado
        url = '/api/students/reports-advanced'
        requestData = {
          format,
          template
        }
      } else {
        // Usar endpoint GET para templates predefinidos
        url = `/api/students/reports-advanced?format=${format}&template=${selectedTemplate}`
      }

      const response = template
        ? await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          })
        : await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

      clearInterval(progressInterval)
      setDownloadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      // Se for JSON, mostrar dados
      if (format === 'json') {
        const data = await response.json()
        console.log('Dados do relatório:', data)
        alert('✅ Relatório JSON gerado com sucesso! Verifique o console para ver os dados.')
        return
      }

      // Para outros formatos, fazer download
      const blob = await response.blob()
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') ||
                      `relatorio-${format}-${new Date().toISOString().split('T')[0]}.${format}`

      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      // Atualizar histórico local
      setLastGenerated(new Date().toLocaleString('pt-BR'))

      // Recarregar histórico do banco de dados após 1 segundo
      setTimeout(() => {
        fetchReportHistory()
      }, 1000)

      alert(`✅ Relatório ${format.toUpperCase()} baixado com sucesso!`)

    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert(`❌ Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setDownloadProgress(0)
    }
  }

  const generateCustomReport = async () => {
    await generateReport(selectedFormat, customTemplate)
  }

  const generateQuickReport = async (format: string) => {
    await generateReport(format)
  }

  const updateCustomTemplate = (field: keyof ReportTemplate, value: unknown) => {
    setCustomTemplate(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetCustomTemplate = () => {
    setCustomTemplate({
      title: 'Relatório de Desempenho do Estudante',
      subtitle: 'Sistema NAF - Núcleo de Apoio Contábil e Fiscal',
      includeSummary: true,
      includeAttendances: true,
      includeTrainings: true,
      includeEvaluations: true,
      includeCharts: false
    })
  }

  const selectedFormatInfo = formats.find(f => f.value === selectedFormat)
  const selectedTemplateInfo = templates.find(t => t.value === selectedTemplate)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Download className="h-6 w-6 text-emerald-600" />
            Gerador de Relatórios Avançado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gere relatórios profissionais em múltiplos formatos com templates customizáveis
          </p>
        </div>
        {lastGenerated && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Último: {lastGenerated}
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Gerando relatório...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Geração Rápida</TabsTrigger>
          <TabsTrigger value="custom">Relatório Customizado</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Aba: Geração Rápida */}
        <TabsContent value="quick" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seleção de Formato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Formato do Relatório
                </CardTitle>
                <CardDescription>
                  Escolha o formato ideal para suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon
                    return (
                      <div
                        key={format.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedFormat === format.value
                            ? `border-emerald-500 ${format.bgColor} ring-1 ring-emerald-500`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFormat(format.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${format.color}`} />
                          <div className="flex-1">
                            <div className="font-medium">{format.label}</div>
                            <div className="text-sm text-gray-600">{format.description}</div>
                          </div>
                          {selectedFormat === format.value && (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Template do Relatório
                </CardTitle>
                <CardDescription>
                  Selecione o tipo de relatório desejado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((template) => {
                    const Icon = template.icon
                    return (
                      <div
                        key={template.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.value
                            ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-emerald-600" />
                          <div className="flex-1">
                            <div className="font-medium">{template.label}</div>
                            <div className="text-sm text-gray-600">{template.description}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.includes.map((include) => (
                                <Badge key={include} variant="outline" className="text-xs">
                                  {include}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {selectedTemplate === template.value && (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview e Ação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Preview da Seleção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {selectedFormatInfo && <selectedFormatInfo.icon className={`h-5 w-5 ${selectedFormatInfo.color}`} />}
                    <span className="font-medium">{selectedFormatInfo?.label}</span>
                  </div>
                  <span className="text-gray-400">+</span>
                  <div className="flex items-center space-x-2">
                    {selectedTemplateInfo && <selectedTemplateInfo.icon className="h-5 w-5 text-emerald-600" />}
                    <span className="font-medium">{selectedTemplateInfo?.label}</span>
                  </div>
                </div>
                <Button
                  onClick={() => generateQuickReport(selectedFormat)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Geração Rápida - Botões diretos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Geração Rápida por Formato
              </CardTitle>
              <CardDescription>
                Gere relatórios completos diretamente em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {formats.map((format) => {
                  const Icon = format.icon
                  return (
                    <Button
                      key={format.value}
                      variant="outline"
                      className="h-20 flex-col space-y-2 hover:bg-gray-50"
                      onClick={() => generateQuickReport(format.value)}
                      disabled={loading}
                    >
                      <Icon className={`h-6 w-6 ${format.color}`} />
                      <span className="text-sm">{format.label}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Relatório Customizado */}
        <TabsContent value="custom" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Customize seu relatório selecionando exatamente quais seções incluir e personalizando títulos.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações do Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Configurações do Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Título do Relatório</p>
                    <p className="text-lg border rounded p-2">{customTemplate.title}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Subtítulo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 border rounded p-2">{customTemplate.subtitle}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Formato de Saída</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formats.map(format => {
                        const Icon = format.icon
                        return (
                          <Button
                            key={format.value}
                            variant={selectedFormat === format.value ? "default" : "outline"}
                            onClick={() => setSelectedFormat(format.value)}
                            className="flex items-center space-x-2 h-12"
                          >
                            <Icon className={`h-4 w-4 ${format.color}`} />
                            <span>{format.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={resetCustomTemplate}
                    className="w-full"
                  >
                    Restaurar Padrão
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seções a Incluir */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Seções a Incluir
                </CardTitle>
                <CardDescription>
                  Selecione quais seções devem aparecer no relatório
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      customTemplate.includeSummary ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => updateCustomTemplate('includeSummary', !customTemplate.includeSummary)}
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Resumo Estatístico</div>
                        <div className="text-sm text-gray-600">Métricas gerais de performance</div>
                      </div>
                      {customTemplate.includeSummary && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>

                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      customTemplate.includeAttendances ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => updateCustomTemplate('includeAttendances', !customTemplate.includeAttendances)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Atendimentos</div>
                        <div className="text-sm text-gray-600">Histórico detalhado de atendimentos</div>
                      </div>
                      {customTemplate.includeAttendances && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>

                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      customTemplate.includeTrainings ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => updateCustomTemplate('includeTrainings', !customTemplate.includeTrainings)}
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium">Treinamentos</div>
                        <div className="text-sm text-gray-600">Progresso e certificações</div>
                      </div>
                      {customTemplate.includeTrainings && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>

                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      customTemplate.includeEvaluations ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => updateCustomTemplate('includeEvaluations', !customTemplate.includeEvaluations)}
                  >
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <div className="font-medium">Avaliações</div>
                        <div className="text-sm text-gray-600">Feedback dos supervisores</div>
                      </div>
                      {customTemplate.includeEvaluations && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg opacity-50">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="font-medium">Gráficos</div>
                        <div className="text-sm text-gray-600">Visualizações de dados (em desenvolvimento)</div>
                      </div>
                      <Badge variant="outline" className="text-xs">Em breve</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={generateCustomReport}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Gerar Relatório Customizado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Histórico */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Histórico de Relatórios
              </CardTitle>
              <CardDescription>
                Todos os relatórios gerados pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
                  <p className="text-gray-600">Carregando histórico...</p>
                </div>
              ) : generationHistory.length > 0 ? (
                <div className="space-y-3">
                  {generationHistory.map((item, index) => {
                    const formatInfo = formats.find(f => f.value === item.format)
                    const FormatIcon = formatInfo?.icon || FileText

                    return (
                      <div key={item.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-2 rounded ${formatInfo?.bgColor || 'bg-gray-50'}`}>
                            <FormatIcon className={`h-5 w-5 ${formatInfo?.color || 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.filename}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {item.format.toUpperCase()} • Template: {item.template}
                              {item.fileSize && ` • ${(item.fileSize / 1024).toFixed(1)} KB`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(item.timestamp).toLocaleString('pt-BR')}
                            </div>
                            {item.stats && (
                              <div className="flex gap-3 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.stats.totalAttendances} atendimentos
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.stats.successRate}% sucesso
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Gerado
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum relatório gerado ainda</p>
                  <p className="text-sm">Gere seu primeiro relatório para ver o histórico aqui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Dicas de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>PDF:</strong> Ideal para apresentações e arquivo permanente</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>Excel:</strong> Perfeito para análises e manipulação de dados</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>Word:</strong> Permite edição e personalização posterior</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>CSV:</strong> Para importação em outras ferramentas</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>Texto:</strong> Formato simples e universal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}