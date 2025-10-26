'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Link as LinkIcon,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface Appointment {
  id: number
  protocol: string
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  service_title: string
  scheduled_datetime: string
  appointment_status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'NAO_COMPARECEU'
  urgency_level: 'NORMAL' | 'URGENTE'
  chat_link_token?: string
  chat_link_expires_at?: string
  appointment_started_at?: string
  appointment_finished_at?: string
  appointment_duration_minutes?: number
  student_notes?: string
  attendance_summary?: string
}

interface StudentAppointmentsProps {
  studentId: string
  studentName: string
}

export default function StudentAppointments({ studentId, studentName }: StudentAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [studentNotes, setStudentNotes] = useState('')
  const [attendanceSummary, setAttendanceSummary] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'PENDENTE' | 'EM_ATENDIMENTO' | 'CONCLUIDO'>('ALL')

  useEffect(() => {
    loadAppointments()
  }, [studentId, filter])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const filterParam = filter === 'ALL' ? '' : `&status=${filter}`
      const response = await fetch(`/api/appointments/student?student_id=${studentId}${filterParam}`)
      const data = await response.json()

      if (response.ok) {
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateLink = async (appointment: Appointment) => {
    try {
      const response = await fetch('/api/appointments/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointment.id,
          student_id: studentId,
          expires_in_hours: 48
        })
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedLink(data.link)
        setSelectedAppointment(appointment)
        setShowLinkDialog(true)
        await loadAppointments()
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
    }
  }

  const startAppointment = async (appointment: Appointment) => {
    try {
      const response = await fetch('/api/appointments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointment.id,
          student_id: studentId,
          student_name: studentName
        })
      })

      if (response.ok) {
        await loadAppointments()
      }
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
    }
  }

  const finishAppointment = async () => {
    if (!selectedAppointment) return

    try {
      const response = await fetch('/api/appointments/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          student_id: studentId,
          student_notes: studentNotes,
          attendance_summary: attendanceSummary
        })
      })

      if (response.ok) {
        setShowFinishDialog(false)
        setStudentNotes('')
        setAttendanceSummary('')
        setSelectedAppointment(null)
        await loadAppointments()
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const getStatusBadge = (status: Appointment['appointment_status']) => {
    const badges = {
      PENDENTE: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pendente</Badge>,
      EM_ATENDIMENTO: <Badge className="bg-blue-600 text-white">Em Atendimento</Badge>,
      CONCLUIDO: <Badge className="bg-green-600 text-white">Concluído</Badge>,
      CANCELADO: <Badge variant="outline" className="bg-gray-100 text-gray-700">Cancelado</Badge>,
      NAO_COMPARECEU: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Não Compareceu</Badge>
    }
    return badges[status] || <Badge>{status}</Badge>
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

  const filteredAppointments = appointments

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Meus Atendimentos</h2>
          <p className="text-gray-600">Gerencie seus agendamentos e atendimentos</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'PENDENTE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('PENDENTE')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'EM_ATENDIMENTO' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('EM_ATENDIMENTO')}
          >
            Em Atendimento
          </Button>
          <Button
            variant={filter === 'CONCLUIDO' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('CONCLUIDO')}
          >
            Concluídos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAppointments}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Carregando atendimentos...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum atendimento encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.service_title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs">{appointment.protocol}</span>
                      {appointment.urgency_level === 'URGENTE' && (
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(appointment.appointment_status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações do Cliente */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{appointment.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{appointment.client_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.client_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(appointment.scheduled_datetime)}</span>
                  </div>
                </div>

                {/* Informações do Atendimento */}
                {appointment.appointment_started_at && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Clock className="h-4 w-4" />
                      <span>
                        Iniciado em {formatDate(appointment.appointment_started_at)}
                      </span>
                    </div>
                    {appointment.appointment_duration_minutes && (
                      <p className="text-sm text-blue-600 mt-1">
                        Duração: {appointment.appointment_duration_minutes} minutos
                      </p>
                    )}
                  </div>
                )}

                {/* Link Gerado */}
                {appointment.chat_link_token && (
                  <Alert className="bg-green-50 border-green-200">
                    <LinkIcon className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-700">
                      Link gerado! Expira em {formatDate(appointment.chat_link_expires_at || '')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {appointment.appointment_status === 'PENDENTE' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => generateLink(appointment)}
                        disabled={!!appointment.chat_link_token}
                        className="flex-1"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {appointment.chat_link_token ? 'Link Gerado' : 'Gerar Link'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startAppointment(appointment)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                    </>
                  )}

                  {appointment.appointment_status === 'EM_ATENDIMENTO' && (
                    <>
                      {appointment.chat_link_token && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGeneratedLink(`${window.location.origin}/atendimento/${appointment.chat_link_token}`)
                            setSelectedAppointment(appointment)
                            setShowLinkDialog(true)
                          }}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Link
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowFinishDialog(true)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar
                      </Button>
                    </>
                  )}

                  {appointment.appointment_status === 'CONCLUIDO' && (
                    <Badge className="w-full justify-center bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Atendimento Concluído
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Link Gerado */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link do Atendimento Gerado</DialogTitle>
            <DialogDescription>
              Compartilhe este link com o cliente para que ele possa acessar o chat de atendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Link de Acesso:</p>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={copyLink}
                >
                  {linkCopied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-sm text-green-600 mt-2">✓ Link copiado!</p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Este link expira em 48 horas. O cliente poderá acessar o chat apenas através deste link.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
            >
              Fechar
            </Button>
            <Button onClick={() => window.open(generatedLink, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Finalizar Atendimento */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar Atendimento</DialogTitle>
            <DialogDescription>
              Preencha as informações sobre o atendimento realizado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Resumo do Atendimento *
              </label>
              <Textarea
                value={attendanceSummary}
                onChange={(e) => setAttendanceSummary(e.target.value)}
                placeholder="Descreva brevemente o que foi realizado no atendimento..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Observações e Notas (opcional)
              </label>
              <Textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Adicione observações importantes, documentos pendentes, próximos passos, etc..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={finishAppointment}
              disabled={!attendanceSummary.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Atendimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
