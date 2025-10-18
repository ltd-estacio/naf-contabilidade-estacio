'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  User,
  FileText,
  Star,
  TrendingUp,
  BarChart3,
  Download,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react'

interface AttendanceRecord {
  id: number
  appointment_id: number
  student_id: string
  student_name: string
  started_at: string
  finished_at: string
  duration_minutes: number
  status: string
  student_notes?: string
  attendance_summary?: string
  client_rating?: number
  fiscal_appointments?: {
    protocol: string
    client_name: string
    service_type: string
    service_title: string
  }
}

interface AttendanceSummary {
  student_id: string
  student_name: string
  total_attendances: number
  completed_attendances: number
  cancelled_attendances: number
  avg_duration_minutes: number
  avg_rating: number
  first_attendance: string
  last_attendance: string
}

interface AttendanceHistoryProps {
  coordinatorId: string
}

export default function AttendanceHistory({ coordinatorId }: AttendanceHistoryProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [selectedStudent])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStudent) params.append('student_id', selectedStudent)

      const response = await fetch(`/api/appointments/history?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setHistory(data.history || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      'CONCLUIDO': <Badge className="bg-green-600">Concluído</Badge>,
      'CANCELADO': <Badge variant="outline" className="bg-gray-100 text-gray-700">Cancelado</Badge>,
      'EM_ANDAMENTO': <Badge className="bg-blue-600">Em Andamento</Badge>,
      'INICIADO': <Badge className="bg-yellow-600">Iniciado</Badge>
    }
    return badges[status] || <Badge>{status}</Badge>
  }

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400 text-sm">Sem avaliação</span>
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    )
  }

  const filteredHistory = history.filter(record =>
    record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.fiscal_appointments?.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.fiscal_appointments?.protocol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Atendimentos</h2>
          <p className="text-gray-600">Acompanhe o desempenho dos estudantes</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por estudante, cliente ou protocolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estudantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os estudantes</SelectItem>
                <SelectItem value="student-1">Ana Silva</SelectItem>
                <SelectItem value="student-2">João Santos</SelectItem>
                <SelectItem value="student-3">Maria Oliveira</SelectItem>
              </SelectContent>
            </Select>

            {selectedStudent && (
              <Button
                variant="outline"
                onClick={() => setSelectedStudent('')}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Atendimentos</p>
                  <p className="text-2xl font-bold">{summary.total_attendances}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{summary.completed_attendances}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Duração Média</p>
                  <p className="text-2xl font-bold">{Math.round(summary.avg_duration_minutes)}min</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold">{summary.avg_rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Realizados ({filteredHistory.length})</CardTitle>
          <CardDescription>
            Registro completo de todos os atendimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum atendimento encontrado</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredHistory.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          {/* Cabeçalho */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {record.fiscal_appointments?.service_title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Protocolo: {record.fiscal_appointments?.protocol}
                              </p>
                            </div>
                            {getStatusBadge(record.status)}
                          </div>

                          {/* Informações */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span><strong>Estudante:</strong> {record.student_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span><strong>Cliente:</strong> {record.fiscal_appointments?.client_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{formatDate(record.started_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span><strong>Duração:</strong> {formatDuration(record.duration_minutes)}</span>
                            </div>
                          </div>

                          {/* Avaliação */}
                          <div className="flex items-center gap-2">
                            {renderStars(record.client_rating)}
                          </div>

                          {/* Resumo */}
                          {record.attendance_summary && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {record.attendance_summary}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowDetailsDialog(true)
                          }}
                          className="ml-4"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Detalhes do Atendimento */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Atendimento</DialogTitle>
            <DialogDescription>
              Informações completas do atendimento realizado
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Protocolo</p>
                  <p className="font-mono">{selectedRecord.fiscal_appointments?.protocol}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Serviço</p>
                  <p>{selectedRecord.fiscal_appointments?.service_title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estudante</p>
                  <p>{selectedRecord.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliente</p>
                  <p>{selectedRecord.fiscal_appointments?.client_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Início</p>
                  <p>{formatDate(selectedRecord.started_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Término</p>
                  <p>{formatDate(selectedRecord.finished_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duração</p>
                  <p>{formatDuration(selectedRecord.duration_minutes)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avaliação</p>
                  {renderStars(selectedRecord.client_rating)}
                </div>
              </div>

              {selectedRecord.attendance_summary && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Resumo do Atendimento</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedRecord.attendance_summary}</p>
                  </div>
                </div>
              )}

              {selectedRecord.student_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Observações do Estudante</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedRecord.student_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
