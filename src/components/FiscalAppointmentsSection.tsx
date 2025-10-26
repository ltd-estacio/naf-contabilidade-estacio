'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  UserCheck,
  Users,
  TrendingUp,
  X,
  ArrowRightLeft
} from 'lucide-react'

interface FiscalAppointment {
  id?: string
  protocol: string
  client_name: string
  client_email: string
  service_title: string
  status: string
  urgency_level: string
  created_at: string
  assigned_student_id?: string
  assigned_student_name?: string
}

interface FiscalAppointmentsData {
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
  recentAppointments: FiscalAppointment[]
}

interface StudentHistoryData {
  student: {
    id: string
    name: string
    email: string
    course: string
    semester: string
    university: string
  }
  appointments: unknown[]
  stats: {
    total: number
    pendentes: number
    confirmados: number
    emAndamento: number
    concluidos: number
    cancelados: number
  }
  serviceCategories: Record<string, number>
  feedbacks?: {
    total: number
    average_rating: number
  }
}

interface AvailableStudent {
  id: string
  name: string
  email: string
  course: string
  semester: string
}

export default function FiscalAppointmentsSection() {
  const [data, setData] = useState<FiscalAppointmentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [showStudentHistory, setShowStudentHistory] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentHistory, setStudentHistory] = useState<StudentHistoryData | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Estados para transferência de estudante
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<FiscalAppointment | null>(null)
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([])
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>('')
  const [transferReason, setTransferReason] = useState<string>('')
  const [transferring, setTransferring] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coordinator/simple-dashboard')

      if (response.ok) {
        const result = await response.json()
        if (result.fiscalAppointments) {
          setData(result.fiscalAppointments)
        }
      } else {
        // Se a API falhar, usar dados mock para demonstração
        console.log('API não disponível, usando dados mock')
        setData({
          totalAppointments: 15,
          pendingAppointments: 8,
          confirmedAppointments: 4,
          completedAppointments: 2,
          urgentAppointments: 3,
          serviceBreakdown: {
            'CPF': {
              service_type: 'CPF',
              service_title: 'Cadastro de CPF - Guia Completo',
              total: 6,
              pending: 4,
              confirmed: 2,
              completed: 0,
              urgent: 1
            },
            'MEI': {
              service_type: 'MEI',
              service_title: 'MEI - Formalização e Gestão',
              total: 4,
              pending: 2,
              confirmed: 1,
              completed: 1,
              urgent: 1
            },
            'IR': {
              service_type: 'IR',
              service_title: 'Declaração de Imposto de Renda PF',
              total: 3,
              pending: 1,
              confirmed: 1,
              completed: 1,
              urgent: 1
            },
            'ITR': {
              service_type: 'ITR',
              service_title: 'ITR - Imposto Territorial Rural',
              total: 2,
              pending: 1,
              confirmed: 0,
              completed: 0,
              urgent: 0
            }
          },
          recentAppointments: [
            {
              protocol: 'FAP-20250921-1534',
              client_name: 'Maria Silva Santos',
              client_email: 'maria.silva@email.com',
              service_title: 'Cadastro de CPF - Guia Completo',
              status: 'PENDENTE',
              urgency_level: 'NORMAL',
              created_at: new Date().toISOString()
            },
            {
              protocol: 'FAP-20250921-1422',
              client_name: 'João Carlos Oliveira',
              client_email: 'joao.oliveira@email.com',
              service_title: 'MEI - Formalização e Gestão',
              status: 'CONFIRMADO',
              urgency_level: 'ALTA',
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              protocol: 'FAP-20250921-1315',
              client_name: 'Ana Paula Costa',
              client_email: 'ana.costa@email.com',
              service_title: 'Declaração de Imposto de Renda PF',
              status: 'PENDENTE',
              urgency_level: 'URGENTE',
              created_at: new Date(Date.now() - 7200000).toISOString()
            },
            {
              protocol: 'FAP-20250921-1100',
              client_name: 'Carlos Eduardo Silva',
              client_email: 'carlos.silva@email.com',
              service_title: 'ITR - Imposto Territorial Rural',
              status: 'PENDENTE',
              urgency_level: 'NORMAL',
              created_at: new Date(Date.now() - 14400000).toISOString()
            },
            {
              protocol: 'FAP-20250921-0945',
              client_name: 'Fernanda Oliveira',
              client_email: 'fernanda.oliveira@email.com',
              service_title: 'MEI - Formalização e Gestão',
              status: 'CONCLUIDO',
              urgency_level: 'NORMAL',
              created_at: new Date(Date.now() - 21600000).toISOString()
            }
          ]
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos agendamentos fiscais:', error)
      // Fallback para dados mock em caso de erro
      setData({
        totalAppointments: 15,
        pendingAppointments: 8,
        confirmedAppointments: 4,
        completedAppointments: 2,
        urgentAppointments: 3,
        serviceBreakdown: {},
        recentAppointments: []
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const loadStudentHistory = async (studentId: string) => {
    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/coordinator/student-fiscal-history?student_id=${studentId}`)

      if (response.ok) {
        const result = await response.json()
        setStudentHistory(result)
        setSelectedStudentId(studentId)
      } else {
        console.error('Erro ao carregar histórico do estudante')
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Função para abrir modal de transferência
  const openTransferModal = async (appointment: FiscalAppointment) => {
    setSelectedAppointment(appointment)
    setShowTransferModal(true)
    setLoadingStudents(true)
    
    try {
      // Buscar estudantes disponíveis
      const response = await fetch(`/api/fiscal-appointments/transfer?current_student_id=${appointment.assigned_student_id || ''}`)
      
      if (response.ok) {
        const result = await response.json()
        setAvailableStudents(result.students || [])
      } else {
        console.error('Erro ao carregar estudantes disponíveis')
        setAvailableStudents([])
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
      setAvailableStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Função para executar a transferência
  const executeTransfer = async () => {
    if (!selectedAppointment || !selectedNewStudent) {
      alert('Selecione um estudante para a transferência')
      return
    }

    setTransferring(true)

    try {
      const response = await fetch('/api/fiscal-appointments/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          from_student_id: selectedAppointment.assigned_student_id,
          to_student_id: selectedNewStudent,
          reason: transferReason || 'Transferência manual pelo coordenador'
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ Atendimento transferido com sucesso!')
        
        // Fechar modal e resetar estado
        setShowTransferModal(false)
        setSelectedAppointment(null)
        setSelectedNewStudent('')
        setTransferReason('')
        
        // Recarregar dados
        await refreshData()
      } else {
        const error = await response.json()
        alert(`❌ Erro ao transferir atendimento: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao transferir:', error)
      alert('❌ Erro ao transferir atendimento. Tente novamente.')
    } finally {
      setTransferring(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDENTE': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'CONFIRMADO': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'CONCLUIDO': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'CANCELADO': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'EM_ANDAMENTO': { color: 'bg-purple-100 text-purple-800', icon: Clock }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDENTE']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
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
        {urgency === 'URGENTE' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {urgency}
      </Badge>
    )
  }

  const filteredAppointments = data?.recentAppointments?.filter(appointment => {
    if (filter === 'all') return true
    return appointment.status === filter
  }) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Erro ao carregar dados dos agendamentos fiscais</p>
          <Button onClick={loadData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitações de Agendamento Fiscal</h2>
          <p className="text-gray-600">Gerenciamento de orientações fiscais solicitadas</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setShowStudentHistory(true)}
            variant="outline"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Histórico por Estudante
          </Button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluídos</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{data.totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{data.pendingAppointments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Confirmados</p>
                <p className="text-2xl font-bold">{data.confirmedAppointments}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Concluídos</p>
                <p className="text-2xl font-bold">{data.completedAppointments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Urgentes</p>
                <p className="text-2xl font-bold">{data.urgentAppointments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamentos Recentes
            <Badge variant="outline" className="ml-2">
              {filteredAppointments.length} de {data.recentAppointments.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Lista dos últimos agendamentos de orientação fiscal solicitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all'
                  ? 'Nenhum agendamento encontrado'
                  : `Nenhum agendamento com status "${filter}" encontrado`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Informações principais */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {appointment.protocol}
                        </Badge>
                        {getStatusBadge(appointment.status)}
                        {getUrgencyBadge(appointment.urgency_level)}
                      </div>

                      <h4 className="font-semibold text-gray-900">{appointment.service_title}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {appointment.client_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {appointment.client_email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        Solicitado em {new Date(appointment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>

                      {appointment.status === 'PENDENTE' && (
                        <Button size="sm">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                      )}

                      {/* Botão de Transferência - Só aparece para atendimentos em andamento ou confirmados */}
                      {(appointment.status === 'EM_ANDAMENTO' || appointment.status === 'CONFIRMADO') && appointment.id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => openTransferModal(appointment)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transferir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por Tipo de Serviço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Serviços Mais Solicitados
          </CardTitle>
          <CardDescription>
            Distribuição dos agendamentos por tipo de serviço fiscal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(data.serviceBreakdown || {}).map((service, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">{service.service_title}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{service.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Pendentes:</span>
                    <span className="font-medium">{service.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Confirmados:</span>
                    <span className="font-medium">{service.confirmed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Concluídos:</span>
                    <span className="font-medium">{service.completed}</span>
                  </div>
                  {service.urgent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">Urgentes:</span>
                      <span className="font-medium">{service.urgent}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(data.serviceBreakdown || {}).length === 0 && (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum serviço encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Histórico por Estudante */}
      {showStudentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Histórico de Atendimentos por Estudante
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Visualize o histórico completo de atendimentos fiscais de cada estudante
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowStudentHistory(false)
                  setStudentHistory(null)
                  setSelectedStudentId(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando histórico...</span>
                </div>
              ) : studentHistory ? (
                <div className="space-y-6">
                  {/* Informações do Estudante */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{studentHistory.student.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{studentHistory.student.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {studentHistory.student.course} - {studentHistory.student.semester} | {studentHistory.student.university}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStudentHistory(null)
                            setSelectedStudentId(null)
                          }}
                        >
                          Voltar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{studentHistory.stats.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{studentHistory.stats.pendentes}</p>
                        <p className="text-xs text-gray-600">Pendentes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-blue-500">{studentHistory.stats.confirmados}</p>
                        <p className="text-xs text-gray-600">Confirmados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">{studentHistory.stats.emAndamento}</p>
                        <p className="text-xs text-gray-600">Em Andamento</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{studentHistory.stats.concluidos}</p>
                        <p className="text-xs text-gray-600">Concluídos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{studentHistory.stats.cancelados}</p>
                        <p className="text-xs text-gray-600">Cancelados</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estatísticas de Feedback */}
                  {studentHistory.feedbacks && studentHistory.feedbacks.total > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Avaliações Recebidas</CardTitle>
                        <CardDescription>Feedbacks dos clientes atendidos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(studentHistory.feedbacks?.average_rating || 0) ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'}>★</span>
                              ))}
                            </div>
                            <p className="text-2xl font-bold text-yellow-700">{studentHistory.feedbacks?.average_rating.toFixed(1)}/5</p>
                            <p className="text-xs text-gray-600">Média de Avaliação</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-2xl font-bold text-blue-700">{studentHistory.feedbacks?.total}</p>
                            <p className="text-xs text-gray-600">Total de Feedbacks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lista de Atendimentos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Atendimentos Fiscais</CardTitle>
                      <CardDescription>Histórico completo de todos os atendimentos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {studentHistory.appointments.length > 0 ? (
                        <div className="space-y-3">
                          {studentHistory.appointments.map((apt: any, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono text-xs">{apt.protocol}</Badge>
                                  {getStatusBadge(apt.status)}
                                  {getUrgencyBadge(apt.urgency_level)}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(apt.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <h5 className="font-medium text-sm mb-1">{apt.service_title}</h5>
                              <p className="text-xs text-gray-600 mb-2">Cliente: {apt.client_name}</p>
                              {apt.completed_at && (
                                <p className="text-xs text-green-600">
                                  ✓ Concluído em {new Date(apt.completed_at).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              {apt.feedback && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">Feedback do Cliente</span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-700 dark:text-gray-300">Avaliação Geral:</span>
                                      <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <span key={i} className={i < apt.feedback.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                                        ))}
                                      </div>
                                      <span className="font-medium text-gray-900 dark:text-gray-100">({apt.feedback.rating}/5)</span>
                                    </div>
                                    {apt.feedback.service_quality && (
                                      <p className="text-gray-700 dark:text-gray-300">Qualidade: {apt.feedback.service_quality}/5</p>
                                    )}
                                    {apt.feedback.student_attention && (
                                      <p className="text-gray-700 dark:text-gray-300">Atenção: {apt.feedback.student_attention}/5</p>
                                    )}
                                    {apt.feedback.problem_resolution && (
                                      <p className="text-gray-700 dark:text-gray-300">Resolução: {apt.feedback.problem_resolution}/5</p>
                                    )}
                                    {apt.feedback.feedback_text && (
                                      <p className="text-gray-700 dark:text-gray-300 italic mt-2">"{apt.feedback.feedback_text}"</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum atendimento encontrado</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Selecione um estudante para visualizar o histórico de atendimentos
                  </p>
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-500 mb-4">
                      Digite o ID do estudante para visualizar o histórico:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ID do estudante..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            loadStudentHistory(e.currentTarget.value)
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          if (input && input.value) {
                            loadStudentHistory(input.value)
                          }
                        }}
                      >
                        Buscar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Transferência de Estudante */}
      {showTransferModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  Transferir Atendimento para Outro Estudante
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Protocolo: <span className="font-mono font-medium">{selectedAppointment.protocol}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTransferModal(false)
                  setSelectedAppointment(null)
                  setSelectedNewStudent('')
                  setTransferReason('')
                }}
                disabled={transferring}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Informações do Atendimento Atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atendimento Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-medium">{selectedAppointment.service_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{selectedAppointment.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                  {selectedAppointment.assigned_student_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estudante Atual:</span>
                      <span className="font-medium">{selectedAppointment.assigned_student_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Seleção do Novo Estudante */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selecionar Novo Estudante *
                </label>
                
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8 border border-gray-200 dark:border-gray-800 rounded-md">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Carregando estudantes disponíveis...</span>
                  </div>
                ) : availableStudents.length > 0 ? (
                  <select
                    value={selectedNewStudent}
                    onChange={(e) => setSelectedNewStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={transferring}
                  >
                    <option value="">-- Selecione um estudante --</option>
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.course} ({student.semester})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Nenhum estudante disponível para transferência no momento.
                    </p>
                  </div>
                )}
                
                {selectedNewStudent && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ O atendimento será transferido para o estudante selecionado e ele receberá uma notificação.
                    </p>
                  </div>
                )}
              </div>

              {/* Motivo da Transferência */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Motivo da Transferência (opcional)
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ex: Redistribuição de carga, especialização do estudante, disponibilidade..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={transferring}
                />
                <p className="text-xs text-gray-500">
                  Este motivo será registrado no histórico do atendimento para auditoria.
                </p>
              </div>
            </div>

            {/* Footer com Ações */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTransferModal(false)
                  setSelectedAppointment(null)
                  setSelectedNewStudent('')
                  setTransferReason('')
                }}
                disabled={transferring}
              >
                Cancelar
              </Button>
              <Button
                onClick={executeTransfer}
                disabled={!selectedNewStudent || transferring || loadingStudents}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {transferring ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Transferindo...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Confirmar Transferência
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}