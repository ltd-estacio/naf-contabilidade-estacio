'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Eye,
  Mail,
  FileText,
  Trash2,
  Star,
  TrendingUp,
  User,
  GraduationCap,
  Calendar,
  Award,
  X,
  Phone,
  MapPin,
  Clock,
  Calculator,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  document: string
  course: string
  semester: string
  semesterNumber: number
  courseDuration: number
  registrationNumber: string
  status: string
  isGraduated: boolean
  graduationDate?: string
  registrationYear: number
  registrationSemester: number
  totalAttendances: number
  avgRating: number
  birthDate?: string
  address?: any
  emergencyContact?: any
  specializations: string[]
  profilePictureUrl?: string
  createdAt: string
  lastLogin?: string
  isLastSemester: boolean
  semestersRemaining: number
}

interface StudentProfile {
  id: string
  name: string
  email: string
  phone: string
  course: string
  semester: string
  status: string
  statistics: {
    totalAttendances: number
    completedAttendances: number
    cancelledAttendances: number
    avgRating: number
    completedTrainings: number
    totalTrainingsTime: number
    evaluationsReceived: number
    avgEvaluationScore: number
  }
  recentAttendances: any[]
  recentEvaluations: any[]
  trainingsProgress: any[]
}

export default function StudentsPerformancePanel() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modais
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [fiscalHistoryModalOpen, setFiscalHistoryModalOpen] = useState(false)

  // Dados selecionados
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [emailMessage, setEmailMessage] = useState('')
  const [removeReason, setRemoveReason] = useState('')
  const [fiscalHistory, setFiscalHistory] = useState<any>(null)

  // Estados de loading para ações
  const [actionLoading, setActionLoading] = useState(false)
  const [fiscalHistoryLoading, setFiscalHistoryLoading] = useState(false)

  // Carregar lista de estudantes
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('📚 Carregando lista de estudantes...')
      const response = await fetch('/api/students/list')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📥 Dados recebidos:', data)

      if (data.success) {
        console.log(`✅ ${data.students?.length || 0} estudantes carregados`)
        setStudents(data.students || [])
      } else {
        console.error('❌ Erro na resposta:', data.error)
        setError(data.error || 'Erro ao carregar estudantes')
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estudantes:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Erro ao carregar estudantes: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  // Ver perfil do estudante
  const handleViewProfile = async (student: Student) => {
    setSelectedStudent(student)
    setActionLoading(true)

    try {
      const response = await fetch(`/api/students/${student.id}/profile`)
      const data = await response.json()

      if (data.success) {
        setSelectedProfile(data.profile)
        setProfileModalOpen(true)
      } else {
        setError(data.error || 'Erro ao carregar perfil')
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setError('Erro ao carregar perfil do estudante')
    } finally {
      setActionLoading(false)
    }
  }

  // Contatar estudante
  const handleContact = (student: Student) => {
    setSelectedStudent(student)
    setEmailMessage(`Olá ${student.name},\n\n`)
    setContactModalOpen(true)
  }

  const sendEmail = () => {
    if (!selectedStudent) return

    // Criar link mailto com assunto e corpo pré-preenchidos
    const subject = encodeURIComponent('Contato do NAF - Estácio')
    const body = encodeURIComponent(emailMessage)
    window.location.href = `mailto:${selectedStudent.email}?subject=${subject}&body=${body}`

    setContactModalOpen(false)
    setEmailMessage('')
  }

  // Gerar relatório do estudante
  const handleGenerateReport = async (student: Student) => {
    setSelectedStudent(student)
    setActionLoading(true)

    try {
      const response = await fetch(`/api/students/${student.id}/profile`)
      const data = await response.json()

      if (data.success) {
        setSelectedProfile(data.profile)
        setReportModalOpen(true)
      } else {
        setError(data.error || 'Erro ao gerar relatório')
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err)
      setError('Erro ao gerar relatório')
    } finally {
      setActionLoading(false)
    }
  }

  const downloadReport = () => {
    if (!selectedProfile || !selectedStudent) return

    // Criar conteúdo do relatório
    const reportContent = `
RELATÓRIO DE DESEMPENHO DO ESTUDANTE
NAF Estácio Florianópolis

========================================
DADOS DO ESTUDANTE
========================================
Nome: ${selectedProfile.name}
Email: ${selectedProfile.email}
Telefone: ${selectedProfile.phone}
Curso: ${selectedProfile.course}
Semestre: ${selectedProfile.semester}
Matrícula: ${selectedStudent.registrationNumber}
Status: ${selectedProfile.status}

========================================
ESTATÍSTICAS DE ATENDIMENTO
========================================
Total de Atendimentos: ${selectedProfile.statistics.totalAttendances}
Atendimentos Concluídos: ${selectedProfile.statistics.completedAttendances}
Atendimentos Cancelados: ${selectedProfile.statistics.cancelledAttendances}
Avaliação Média dos Clientes: ${selectedProfile.statistics.avgRating.toFixed(1)} / 5.0

========================================
TREINAMENTOS
========================================
Treinamentos Concluídos: ${selectedProfile.statistics.completedTrainings}
Tempo Total em Treinamentos: ${selectedProfile.statistics.totalTrainingsTime} minutos
Avaliações Recebidas: ${selectedProfile.statistics.evaluationsReceived}
Nota Média de Avaliações: ${selectedProfile.statistics.avgEvaluationScore.toFixed(2)}

========================================
ATENDIMENTOS RECENTES
========================================
${selectedProfile.recentAttendances.map((att, i) => `
${i + 1}. Protocolo: ${att.protocol}
   Cliente: ${att.client_name}
   Serviço: ${att.service_type}
   Data: ${new Date(att.scheduled_date).toLocaleDateString('pt-BR')}
   Status: ${att.status}
   Avaliação: ${att.client_satisfaction_rating ? `${att.client_satisfaction_rating}/5` : 'Não avaliado'}
`).join('\n')}

========================================
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
NAF Estácio Florianópolis
========================================
    `

    // Criar blob e baixar
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${selectedStudent.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Remover estudante
  const handleRemove = (student: Student) => {
    setSelectedStudent(student)
    setRemoveReason(student.isLastSemester ? 'GRADUADO' : '')
    setRemoveModalOpen(true)
  }

  const confirmRemove = async () => {
    if (!selectedStudent) {
      console.error('❌ Nenhum estudante selecionado')
      alert('Erro: Nenhum estudante selecionado')
      return
    }

    setActionLoading(true)
    setError('') // Limpar erros anteriores

    try {
      console.log('🗑️ Removendo estudante:', {
        id: selectedStudent.id,
        name: selectedStudent.name,
        reason: removeReason
      })

      const response = await fetch('/api/students/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          reason: removeReason || 'MANUAL_REMOVAL'
        })
      })

      console.log('📡 Status da resposta:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro HTTP:', response.status, errorText)
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('📥 Resposta da API:', data)

      if (data.success) {
        console.log('✅ Estudante removido com sucesso')
        setRemoveModalOpen(false)
        setRemoveReason('')
        setSelectedStudent(null)
        
        // Recarregar lista de estudantes
        await loadStudents()
        
        alert(`Estudante ${selectedStudent.name} removido com sucesso!`)
      } else {
        console.error('❌ API retornou success: false', data.error)
        throw new Error(data.error || 'Erro desconhecido ao remover estudante')
      }
    } catch (err) {
      console.error('❌ Erro ao remover estudante:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erro de conexão com o servidor'
      setError(`Erro ao remover estudante: ${errorMsg}`)
      alert(`Erro ao remover estudante: ${errorMsg}`)
    } finally {
      setActionLoading(false)
    }
  }

  // Ver histórico de atendimentos fiscais
  const handleViewFiscalHistory = async (student: Student) => {
    setSelectedStudent(student)
    setFiscalHistoryLoading(true)
    setFiscalHistoryModalOpen(true)

    try {
      const response = await fetch(`/api/coordinator/student-fiscal-history?student_id=${student.id}`)
      const data = await response.json()

      if (response.ok) {
        setFiscalHistory(data)
      } else {
        setError(data.message || 'Erro ao carregar histórico fiscal')
      }
    } catch (err) {
      console.error('Erro ao carregar histórico fiscal:', err)
      setError('Erro ao carregar histórico de atendimentos fiscais')
    } finally {
      setFiscalHistoryLoading(false)
    }
  }

  // Exportar lista
  const handleExportList = () => {
    const csvContent = [
      ['Nome', 'Email', 'Curso', 'Semestre', 'Atendimentos', 'Avaliação Média', 'Status'].join(','),
      ...students.map(s =>
        [s.name, s.email, s.course, s.semester, s.totalAttendances, s.avgRating.toFixed(1), s.status].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estudantes_naf_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Verificar estudantes graduados (executar verificação automática)
  const checkGraduatedStudents = async () => {
    setActionLoading(true)
    setError('')
    
    try {
      console.log('🎓 Verificando estudantes graduados...')
      
      const response = await fetch('/api/students/graduation/check', {
        method: 'POST'
      })

      console.log('📡 Status da resposta:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro HTTP:', response.status, errorText)
        throw new Error(`Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('📥 Resposta da API:', data)

      if (data.success) {
        const total = data.totalProcessed || 0
        const students = data.studentsProcessed || []
        
        console.log(`✅ ${total} estudante(s) processado(s)`, students)
        
        if (total > 0) {
          alert(`✅ ${total} estudante(s) graduado(s) identificado(s) e marcado(s)!`)
        } else {
          alert('ℹ️ Nenhum estudante em condições de graduação foi encontrado.')
        }
        
        await loadStudents()
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      console.error('❌ Erro ao verificar graduados:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erro de conexão'
      setError(`Erro ao verificar graduados: ${errorMsg}`)
      alert(`❌ Erro ao verificar graduados: ${errorMsg}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estudantes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between dark:bg-gray-900 dark:border-gray-800">
            <span>Performance dos Estudantes</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={checkGraduatedStudents} disabled={actionLoading}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Verificar Graduados
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportList}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Ranking de performance e estatísticas detalhadas ({students.filter(s => s.status === 'ATIVO').length} ativos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {students
              .filter(s => s.status === 'ATIVO')
              .sort((a, b) => b.avgRating - a.avgRating)
              .map((student, index) => (
              <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.course} - {student.semester}
                        {student.isLastSemester && (
                          <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                            Último Semestre
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{student.totalAttendances}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">atendimentos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(student.avgRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {student.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProfile(student)}
                    disabled={actionLoading}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Perfil
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewFiscalHistory(student)}
                    disabled={actionLoading}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Atend. Fiscais
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(student)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Contatar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(student)}
                    disabled={actionLoading}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Relatórios
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(student)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Ver Perfil */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil do Estudante</DialogTitle>
            <DialogDescription>
              Informações detalhadas e histórico de atendimentos
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                  <p className="font-medium">{selectedProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{selectedProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                  <p className="font-medium">{selectedProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Curso</p>
                  <p className="font-medium">{selectedProfile.course}</p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Atendimentos</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {selectedProfile.statistics.totalAttendances}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">Concluídos</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {selectedProfile.statistics.completedAttendances}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Avaliação</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {selectedProfile.statistics.avgRating.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400">Treinamentos</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {selectedProfile.statistics.completedTrainings}
                  </p>
                </div>
              </div>

              {/* Atendimentos Recentes */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Atendimentos Recentes</h4>
                <div className="space-y-2">
                  {selectedProfile.recentAttendances.slice(0, 3).map((att: any) => (
                    <div key={att.id} className="p-2 border rounded text-sm dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">{att.protocol}</span>
                        <Badge variant={att.status === 'CONCLUIDO' ? 'default' : 'secondary'}>
                          {att.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {att.client_name} - {att.service_type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Contatar */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contatar Estudante</DialogTitle>
            <DialogDescription>
              Enviar email para {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Para:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStudent?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Mensagem:</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                placeholder="Digite sua mensagem aqui..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={sendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Relatórios */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relatório de Desempenho</DialogTitle>
            <DialogDescription>
              Gerar relatório completo de {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total de Atendimentos</p>
                  <p className="text-lg font-bold">{selectedProfile.statistics.totalAttendances}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avaliação Média</p>
                  <p className="text-lg font-bold">{selectedProfile.statistics.avgRating.toFixed(1)}/5.0</p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  O relatório será baixado em formato de texto (.txt) com todas as informações do estudante.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              downloadReport()
              setReportModalOpen(false)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Remover Estudante */}
      <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Estudante</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedStudent?.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                O estudante será marcado como INATIVO. O histórico de atendimentos será preservado.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-1 block">Motivo (opcional):</label>
              <Textarea
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                rows={3}
                placeholder="Digite o motivo da remoção..."
              />
            </div>

            {selectedStudent?.isLastSemester && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Este estudante está no último semestre. Marcar como graduado?
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setRemoveReason('GRADUADO')}
                >
                  Sim, marcar como graduado
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Remoção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Histórico de Atendimentos Fiscais */}
      <Dialog open={fiscalHistoryModalOpen} onOpenChange={setFiscalHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Atendimentos Fiscais</DialogTitle>
            <DialogDescription>
              Atendimentos fiscais realizados por {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          {fiscalHistoryLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando histórico...</p>
            </div>
          ) : fiscalHistory ? (
            <div className="space-y-6">
              {/* Informações do Estudante */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                      <p className="font-medium">{fiscalHistory.student?.name}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-sm">{fiscalHistory.student?.email}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Curso</p>
                      <p className="font-medium">{fiscalHistory.student?.course}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Semestre</p>
                      <p className="font-medium">{fiscalHistory.student?.semester}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Atendimentos Fiscais */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{fiscalHistory.stats?.total || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{fiscalHistory.stats?.pendentes || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pendentes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-500">{fiscalHistory.stats?.confirmados || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Confirmados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{fiscalHistory.stats?.emAndamento || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Em Andamento</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{fiscalHistory.stats?.concluidos || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Concluídos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{fiscalHistory.stats?.cancelados || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cancelados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Avaliações e Feedbacks */}
              {fiscalHistory.feedbacks && fiscalHistory.feedbacks.total > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avaliações Recebidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.round(fiscalHistory.feedbacks.average_rating) ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'}>★</span>
                          ))}
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">{fiscalHistory.feedbacks.average_rating.toFixed(1)}/5</p>
                        <p className="text-xs text-gray-600">Média de Avaliação</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{fiscalHistory.feedbacks.total}</p>
                        <p className="text-xs text-gray-600">Total de Feedbacks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Atendimentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atendimentos Fiscais</CardTitle>
                  <CardDescription>Histórico completo de todos os atendimentos</CardDescription>
                </CardHeader>
                <CardContent>
                  {fiscalHistory.appointments && fiscalHistory.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {fiscalHistory.appointments.map((apt: any) => (
                        <div key={apt.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">{apt.protocol}</Badge>
                              <Badge className={
                                apt.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                                apt.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-800' :
                                apt.status === 'EM_ANDAMENTO' ? 'bg-purple-100 text-purple-800' :
                                apt.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {apt.status}
                              </Badge>
                              <Badge className={
                                apt.urgency_level === 'URGENTE' ? 'bg-red-100 text-red-800' :
                                apt.urgency_level === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                                apt.urgency_level === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {apt.urgency_level}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(apt.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <h5 className="font-medium text-sm mb-1">{apt.service_title}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Cliente: {apt.client_name} | Categoria: {apt.service_category}
                          </p>

                          {apt.completed_at && (
                            <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>Concluído em {new Date(apt.completed_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}

                          {apt.internal_notes && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-1 mb-1">
                                <MessageSquare className="h-3 w-3 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Notas Internas:</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{apt.internal_notes}</p>
                            </div>
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
                    <p className="text-center text-gray-500 py-8">Nenhum atendimento fiscal encontrado</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum dado de atendimentos fiscais disponível
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setFiscalHistoryModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
