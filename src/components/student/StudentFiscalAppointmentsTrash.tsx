'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react'

interface DeletedAppointment {
  id: string
  protocol: string
  service_title: string
  service_category: string
  client_name: string
  client_email: string
  client_phone: string
  status: string
  urgency_level: string
  deleted_at: string
  created_at: string
  completed_at?: string
  internal_notes?: string
}

interface StudentFiscalAppointmentsTrashProps {
  token: string
}

export default function StudentFiscalAppointmentsTrash({ token }: StudentFiscalAppointmentsTrashProps) {
  const [deletedAppointments, setDeletedAppointments] = useState<DeletedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDeletedAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/students/fiscal-appointments/delete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDeletedAppointments(data.deletedAppointments || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar lixeira')
      }
    } catch (err) {
      setError('Erro ao carregar atendimentos excluídos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeletedAppointments()
  }, [token])

  const handleRestore = async (appointmentId: string) => {
    try {
      setRestoring(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/students/fiscal-appointments/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message || 'Atendimento recuperado com sucesso!')
        await loadDeletedAppointments()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao recuperar atendimento')
      }
    } catch (err) {
      setError('Erro ao recuperar atendimento')
      console.error(err)
    } finally {
      setRestoring(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysSinceDeleted = (deletedAt: string) => {
    const days = Math.floor((Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      'BAIXA': { color: 'bg-gray-100 text-gray-700' },
      'NORMAL': { color: 'bg-blue-100 text-blue-700' },
      'ALTA': { color: 'bg-orange-100 text-orange-700' },
      'URGENTE': { color: 'bg-red-100 text-red-700' }
    }

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig['NORMAL']

    return (
      <Badge className={`${config.color} border-0`}>
        {urgency}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Carregando lixeira...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-red-600" />
            Lixeira de Atendimentos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Atendimentos excluídos que podem ser recuperados
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadDeletedAppointments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Os atendimentos excluídos ficam na lixeira e podem ser recuperados a qualquer momento.
        </AlertDescription>
      </Alert>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Atendimentos na Lixeira
              </p>
              <p className="text-4xl font-bold text-red-600 mt-1">{deletedAppointments.length}</p>
            </div>
            <Trash2 className="h-12 w-12 text-red-300" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de atendimentos excluídos */}
      {deletedAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum atendimento na lixeira
            </h3>
            <p className="text-gray-500">
              Os atendimentos excluídos aparecem aqui e podem ser recuperados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deletedAppointments.map((appointment) => {
            const daysSinceDeleted = getDaysSinceDeleted(appointment.deleted_at)

            return (
              <Card
                key={appointment.id}
                className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 opacity-90"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {appointment.protocol}
                        </Badge>
                        {getUrgencyBadge(appointment.urgency_level)}
                        <Badge className="bg-red-100 text-red-800 border-0">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluído
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-1">{appointment.service_title}</h3>
                      <p className="text-sm text-gray-500">
                        Categoria: {appointment.service_category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-red-600 font-medium mb-1">
                        Excluído há {daysSinceDeleted === 0 ? 'hoje' : `${daysSinceDeleted} dia${daysSinceDeleted > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(appointment.deleted_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Cliente:</span>
                        <span>{appointment.client_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{appointment.client_email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Criado em: {formatDate(appointment.created_at)}</span>
                      </div>
                      {appointment.completed_at && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Concluído em: {formatDate(appointment.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Restaurar */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleRestore(appointment.id)}
                      disabled={restoring}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {restoring ? 'Recuperando...' : 'Recuperar Atendimento'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
