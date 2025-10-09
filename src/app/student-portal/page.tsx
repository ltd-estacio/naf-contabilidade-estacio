'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  FileText,
  MessageCircle,
  Video,
  MapPin,
  Star,
  Download,
  GraduationCap,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  Settings,
  Bot,
  Sparkles,
  Send,
  Paperclip,
  ListChecks,
  ClipboardList,
  HelpCircle,
  Calculator,
  LogOut,
  Home,
  ChevronDown,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ScrollArea } from "@/components/ui/scroll-area"
import SimpleChart from '@/components/charts/SimpleChart'
import MainNavigation from '@/components/MainNavigation'
import NAFFooter from '@/components/layout/NAFFooter'
import TrainingsSection from '@/components/TrainingsSection'
import ReportGenerator from '@/components/reports/ReportGenerator'
import { StudentChat } from '@/components/chat/StudentChat'
import StudentFiscalAppointments from '@/components/student/StudentFiscalAppointments'

interface StudentProfile {
  id: string
  name: string
  email: string
  phone: string
  course: string
  semester: string
  registrationNumber: string
  specializations: string[]
  status: string
  document: string
  university: string
  lastLogin?: string
  createdAt?: string
}

interface Attendance {
  id: string
  protocol: string
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  service_description: string
  scheduled_date: string
  scheduled_time: string
  status: string
  urgency: string
  is_online: boolean
  client_satisfaction_rating?: number
  supervisor_validation: boolean
}

interface FiscalAppointment {
  id: string
  protocol: string
  service_type: string
  service_title: string
  service_category: string
  client_name: string
  client_email: string
  client_phone: string
  client_cpf?: string
  address_city: string
  address_state: string
  urgency_level: string
  preferred_date?: string
  preferred_time?: string
  preferred_period?: string
  status: string
  client_notes?: string
  internal_notes?: string
  service_details?: Record<string, unknown>
  created_at: string
  updated_at: string
  confirmed_at?: string
  scheduled_at?: string
  completed_at?: string
}

interface TrainingProgress {
  id: string
  training_id: string
  is_completed: boolean
  score?: number
  started_at: string
  completed_at?: string
  training: {
    id: string
    title: string
    description: string
    duration_minutes: number
    difficulty: string
    topics: string[]
    is_mandatory: boolean
  }
}

interface DashboardData {
  profile: StudentProfile
  stats: {
    totalAttendances: number
    completedAttendances: number
    avgRating: number
    completedTrainings: number
    totalTrainings: number
    avgPerformanceScore: number
    successRate: number
  }
  attendances: Attendance[]
  trainings: TrainingProgress[]
  recentEvaluations: StudentEvaluation[]
  fiscalAppointments?: FiscalAppointment[]
}

interface StudentEvaluation {
  id: string
  evaluation_date: string
  technical_score: number
  communication_score: number
  punctuality_score: number
  professionalism_score: number
  overall_score: number
  feedback: string
  strengths: string[]
  improvement_areas: string[]
}

interface AnalyticsData {
  clientCategoryStats: unknown
  serviceTypeStats: unknown
  monthlyPerformance: unknown
  trainingsByDifficulty: unknown
  competencyStats: unknown
  growthIndicators: unknown
  totalEvaluations: number
  averageOverallScore: number
}

export default function StudentPortal() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [_trainingsLoading, setTrainingsLoading] = useState(false)
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<StudentProfile | null>(null)
  const [_trainingsData, setTrainingsData] = useState<unknown>(null)
  const [profileData, setProfileData] = useState<unknown>(null)
  // AI Assistant state
  const [aiMessages, setAiMessages] = useState<{ role: 'user'|'assistant'|'system'; content: string; ts?: number }[]>([
    { role: 'system', content: 'Você é um assistente do NAF para estudantes, especializado em contabilidade brasileira (IRPF, MEI, tributos, obrigações acessórias). Explique de forma clara, com exemplos e checklists quando apropriado. Não ofereça aconselhamento jurídico; cite fontes oficiais (Receita Federal, gov.br) quando útil. Se a pergunta for pessoal/privada, sugira procurar um coordenador ou professor.' }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiModel, setAiModel] = useState('gemini-1.5-flash')
  const [useProfileContext, setUseProfileContext] = useState(true)
  const [profileForm, setProfileForm] = useState<unknown>(null)
  const [availabilityForm, setAvailabilityForm] = useState<unknown[]>([])
  const [passwordForm, setPasswordForm] = useState<{ new?: string; confirm?: string }>({})
  const [assistantFullscreen, setAssistantFullscreen] = useState(false)
  const quickLinks = [
    {
      value: 'dashboard',
      label: 'Dashboard',
      description: 'Resumo geral do estudante',
      icon: BarChart3
    },
    {
      value: 'attendances',
      label: 'Atendimentos Fiscais',
      description: 'Gerencie seus atendimentos fiscais',
      icon: Calculator
    },
    {
      value: 'trainings',
      label: 'Treinamentos',
      description: 'Cursos e certificações',
      icon: BookOpen
    },
    {
      value: 'reports',
      label: 'Relatórios',
      description: 'Exportações e documentos',
      icon: FileText
    },
    {
      value: 'profile',
      label: 'Perfil',
      description: 'Dados cadastrais',
      icon: User
    },
    {
      value: 'chat',
      label: 'Chat',
      description: 'Conversas com coordenadores',
      icon: MessageCircle
    },
    {
      value: 'assistant',
      label: 'Assistente IA',
      description: 'Suporte inteligente',
      icon: Bot
    }
  ]

  // Verificar autenticação e carregar dados
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('student_token')
      const userData = localStorage.getItem('student_user')

      if (!token || !userData) {
        router.push('/student-login-simple')
        return
      }

      try {
        setUser(JSON.parse(userData))

        // Buscar dados do dashboard (API unificada que funciona em produção e desenvolvimento)
        let response = await fetch('/api/students/dashboard-unified', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Se a API unificada falhar, tentar outras como fallback
        if (!response.ok) {
          console.warn('API dashboard-unified falhou, tentando fallback para dashboard-real')
          response = await fetch('/api/students/dashboard-real', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            console.warn('API dashboard-real falhou, tentando fallback para dashboard regular')
            response = await fetch('/api/students/dashboard', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          }
        }

        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          const errorText = await response.text().catch(() => 'Erro desconhecido')
          console.error('Erro da API:', response.status, errorText)
          setError(`Erro ao carregar dados do dashboard: ${response.status}`)
        }
      } catch (error) {
        console.error('Erro de conexão ao carregar dashboard:', error)
        setError('Erro de conexão')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_user')
    router.push('/student-login-simple')
  }

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/analytics-real', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      } else {
        console.error('Erro ao carregar analytics')
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadTrainings = async () => {
    try {
      setTrainingsLoading(true)
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/trainings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTrainingsData(data)
      } else {
        console.error('Erro ao carregar treinamentos')
      }
    } catch (error) {
      console.error('Erro ao carregar treinamentos:', error)
    } finally {
      setTrainingsLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        setProfileForm(data.profile)
        setAvailabilityForm(Array.isArray(data.availability) ? data.availability : [])
      } else {
        console.error('Erro ao carregar perfil')
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const updateProfile = async (payload?: unknown) => {
    try {
      setProfileEditing(true)
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload ?? profileForm)
      })

      if (response.ok) {
        await loadProfile() // Recarregar dados
        setIsEditingProfile(false)
        setPasswordForm({})
        alert('✅ Perfil atualizado com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`❌ Erro: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('❌ Erro de conexão')
    } finally {
      setProfileEditing(false)
    }
  }

  const saveAvailability = async () => {
    try {
      const token = localStorage.getItem('student_token')
      const response = await fetch('/api/students/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability: availabilityForm })
      })
      if (response.ok) {
        await loadProfile()
        alert('✅ Disponibilidade atualizada!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`❌ Erro ao atualizar disponibilidade${errorData?.message ? `: ${errorData.message}` : ''}`)
      }
    } catch (e) {
      console.error('Erro ao salvar disponibilidade:', e)
      alert('❌ Erro de conexão ao salvar disponibilidade')
    }
  }

  const exportReport = async (format: string = 'json') => {
    try {
      const token = localStorage.getItem('student_token')

      // Verificar se o token existe
      if (!token) {
        alert('❌ Sessão expirada. Faça login novamente.')
        handleLogout()
        return
      }

      // Mostrar loading
      const loadingMessage = format === 'excel' ? 'Gerando relatório Excel...' : 'Gerando relatório JSON...'
      console.log(loadingMessage)

      const response = await fetch(`/api/students/reports-mock?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        if (format === 'excel') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = `relatorio-estudante-${new Date().toISOString().split('T')[0]}.xlsx`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          alert('✅ Relatório Excel baixado com sucesso!')
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = `relatorio-estudante-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          alert('✅ Relatório JSON baixado com sucesso!')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          alert('❌ Sessão expirada. Faça login novamente.')
          handleLogout()
        } else {
          throw new Error(errorData.message || `Erro ao gerar relatório: ${response.status}`)
        }
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao exportar relatório: ${errorMessage}`)
    }
  }

  // AI Assistant handlers
  const buildProfileContext = () => {
    if (!useProfileContext || !dashboardData) return ''
    const p = dashboardData.profile
    const s = dashboardData.stats
    return `\n\nContexto do estudante:\n- Nome: ${p.name}\n- Curso: ${p.course} (${p.semester})\n- Universidade: ${p.university}\n- Total de atendimentos: ${s.totalAttendances}, concluídos: ${s.completedAttendances}, sucesso: ${s.successRate}%\n- Avaliação média de clientes: ${s.avgRating}\nUse este contexto apenas para personalizar exemplos e explicações. Não invente dados.`
  }

  const handleSendAi = async () => {
    const prompt = aiInput.trim()
    if (!prompt) return
    setAiInput('')
    const nextMessages = [...aiMessages, { role: 'user' as const, content: prompt + buildProfileContext(), ts: Date.now() }]
    setAiMessages(nextMessages)
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiModel,
          messages: nextMessages,
          generationConfig: { temperature: 0.4, maxOutputTokens: 1200 }
        })
      })
      if (!response.ok) {
        const raw = await response.text().catch(() => '')
        let hint = ''
        try {
          const j = JSON.parse(raw)
          hint = j?.detail || j?.message || raw
        } catch {
          hint = raw
        }
        throw new Error(hint || `HTTP ${response.status}`)
      }
      const data = await response.json()
      const answer = (data?.text as string) || 'Não foi possível gerar uma resposta no momento.'
      setAiMessages((prev) => [...prev, { role: 'assistant', content: answer, ts: Date.now() }])
    } catch (e: unknown) {
      console.error('AI error', e)
      const detail = (e?.message || '').slice(0, 220)
      setAiMessages((prev) => [...prev, { role: 'assistant', content: `❌ Ocorreu um erro ao consultar a IA. Verifique a conexão e a variável .env (GEMINI_API_KEY).\n\nDetalhe: ${detail}`, ts: Date.now() }])
    } finally {
      setAiLoading(false)
    }
  }

  const updateAttendanceStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('student_token')
      const response = await fetch(`/api/students/attendances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Recarregar dados do dashboard
        const dashboardResponse = await fetch('/api/students/dashboard-real', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboardData(data)
        }
      } else {
        const errorData = await response.json()
        alert(`Erro ao atualizar atendimento: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error)
      alert('Erro de conexão ao atualizar atendimento')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AGENDADO': { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      'EM_ANDAMENTO': { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      'CONCLUIDO': { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      'CANCELADO': { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['AGENDADO']
    return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      'BAIXA': { color: 'bg-green-100 text-green-700', label: 'Baixa' },
      'MEDIA': { color: 'bg-yellow-100 text-yellow-700', label: 'Média' },
      'ALTA': { color: 'bg-red-100 text-red-700', label: 'Alta' }
    }
    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig['MEDIA']
    return <Badge variant="outline" className={`${config.color} text-xs`}>{config.label}</Badge>
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando portal...</p>
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

  if (!dashboardData || !user) {
    return null
  }

  const pendingAttendances = Math.max(
    dashboardData.stats.totalAttendances - dashboardData.stats.completedAttendances,
    0
  )
  const openRequests = dashboardData.attendances?.filter(att =>
    ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE'].includes(att.status)
  ).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Fullscreen Assistant Overlay */}
      {assistantFullscreen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-950 z-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold">Assistente de Contabilidade</div>
                <div className="text-xs text-gray-500">Gemini • Conversas informativas</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{aiModel}</Badge>
              <Button variant="outline" size="sm" onClick={() => setAssistantFullscreen(false)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1" fill="none" stroke="currentColor"><path d="M5 9H3V3h6v2H5v4zm14 6h2v6h-6v-2h4v-4zM9 19H5v-4H3v6h6v-2zm10-10V5h-4V3h6v6h-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sair de tela cheia
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4 overflow-auto">
                <Card className="border-emerald-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Bot className="h-5 w-5 text-emerald-600" />
                      Assistente Contábil
                    </CardTitle>
                    <CardDescription>IA para dúvidas gerais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <label htmlFor="assistant-context" className="text-sm text-gray-700 dark:text-gray-300">Usar meu contexto</label>
                      <input
                        id="assistant-context"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={useProfileContext}
                        onChange={(e) => setUseProfileContext(e.target.checked)}
                      />
                    </div>
                    <div>
                      <label htmlFor="assistant-model" className="text-sm text-gray-700 dark:text-gray-300">Modelo</label>
                      <select
                        id="assistant-model"
                        className="w-full border rounded px-2 py-1 text-sm mt-1"
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                      >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      Sugestões Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { title: 'Explique MEI e obrigações mensais', prompt: 'Explique MEI e as obrigações mensais (DAS, notas, limites, funcionário) com exemplos e prazos.', desc: 'Resumo do MEI, DAS e prazos.', icon: <HelpCircle className="h-4 w-4" /> },
                        { title: 'Checklist para IRPF', prompt: 'Crie um checklist de documentos e prazos para IRPF, incluindo rendimentos, bens e dívidas.', desc: 'Organize sua declaração.', icon: <ClipboardList className="h-4 w-4" /> },
                        { title: 'ICMS x ISS x IPI', prompt: 'Explique as diferenças entre ICMS, ISS e IPI com exemplos de aplicação.', desc: 'Comparativo com exemplos.', icon: <ListChecks className="h-4 w-4" /> },
                        { title: 'Pró-labore e lucros', prompt: 'Explique como calcular pró-labore e distribuição de lucros com um exemplo numérico.', desc: 'Passo a passo.', icon: <Calculator className="h-4 w-4" /> },
                      ].map((s, i) => (
                        <button key={i} onClick={() => setAiInput(s.prompt)} className="group text-left rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 transition bg-white dark:bg-gray-950/60 hover:bg-emerald-50 p-3 shadow-sm hover:shadow flex items-start gap-3">
                          <div className="mt-0.5 text-emerald-700 bg-emerald-100 rounded-md p-1.5">{s.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white leading-snug">{s.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{s.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Chat */}
              <div className="lg:col-span-3 h-full">
                <Card className="h-full flex flex-col shadow-lg border-emerald-100 dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="flex-1 p-0 dark:bg-gray-900 dark:border-gray-800">
                    <ScrollArea className="h-[calc(100vh-240px)] px-4">
                      <div className="space-y-4 py-4">
                        {aiMessages.filter(m => m.role !== 'system').map((m, idx) => (
                          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border ${m.role === 'user' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800'}`}>
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                  {m.role === 'user' ? 'Você' : 'Assistente'}
                                  {m.ts ? <span>• {new Date(m.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span> : null}
                                </div>
                                {m.role === 'assistant' && (
                                  <button className={`text-xs ${m.role === 'user' ? 'text-white/80' : 'text-gray-500'} opacity-0 group-hover:opacity-100 transition`} onClick={() => navigator.clipboard.writeText(m.content)} title="Copiar">Copiar</button>
                                )}
                              </div>
                              {m.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap">{m.content}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {aiLoading && <div className="text-xs text-gray-500 px-2">Gerando resposta...</div>}
                        {!aiLoading && aiMessages.filter(m => m.role !== 'system').length === 0 && (
                          <div className="text-center text-gray-500 text-sm py-8">Faça sua primeira pergunta sobre contabilidade.</div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="border-t p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-end gap-2">
                      <Button variant="outline" size="icon" title="Anexar contexto (em breve)"><Paperclip className="h-4 w-4" /></Button>
                      <textarea className="flex-1 border rounded-md px-3 py-2 text-sm min-h-[44px] max-h-[160px] resize-y shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Pergunte algo sobre IRPF, MEI, ICMS, obrigações, etc." value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendAi() }}} />
                      <Button onClick={() => handleSendAi()} disabled={aiLoading || !aiInput.trim()} className="bg-emerald-600 hover:bg-emerald-700"><Send className="h-4 w-4 mr-1" /> Enviar</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header com Navegação */}
      <header className="bg-white dark:bg-gray-950/80 backdrop-blur-md shadow-lg border-b border-slate-200/50">
        <div className="w-full px-6 lg:px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
                  Portal do Estudante
                </h1>
                <p className="text-slate-600 font-medium mt-1">
                  {user?.name || 'Estudante'} | Painel de Controle
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link href="/">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Início
                </Button>
              </Link>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Portais
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link href="/student-portal" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Portal do Estudante</span></Link>
                  <Link href="/coordinator-dashboard" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Dashboard Coordenador</span></Link>
                  <Link href="/naf-management" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Gestão NAF</span></Link>
                </div>
              </div>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Serviços
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link href="/naf-scheduling" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Agendamento</span></Link>
                  <Link href="/services" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Serviços NAF</span></Link>
                  <Link href="/fiscal-guides" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Guias Fiscais</span></Link>
                  <Link href="/schedule" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Agenda Geral</span></Link>
                </div>
              </div>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Acesso
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <div className="absolute hidden group-hover:block top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link href="/student-login-simple" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Login Estudante</span></Link>
                  <Link href="/coordinator-login" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Login Coordenador</span></Link>
                  <Link href="/student-register" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"><span className="text-sm">Cadastro Estudante</span></Link>
                </div>
              </div>
            </nav>

            {/* Logout Button */}
            <Button variant="outline" onClick={handleLogout} className="border-slate-300 hover:border-red-300 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Módulos de Gestão */}
      <section className="py-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Acesso Rápido</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickLinks.map((item) => {
              const Icon = item.icon
              const isActive = selectedTab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setSelectedTab(item.value)
                    document.getElementById('student-portal-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        <Tabs
          id="student-portal-tabs"
          value={selectedTab}
          onValueChange={(val) => {
            setSelectedTab(val)
            if (val === 'profile' && !profileData && !profileLoading) {
              loadProfile()
            }
          }}
        >
          <TabsList className="sr-only">
            <TabsTrigger className="w-full justify-center" value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="attendances">Atendimentos Fiscais</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="trainings">Treinamentos</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="analytics">Analytics</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="reports">Relatórios</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="profile">Perfil</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="chat">Chat</TabsTrigger>
            <TabsTrigger className="w-full justify-center" value="assistant">Assistente IA</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Atendimentos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.totalAttendances}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">Histórico completo</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
                      <p className="text-2xl font-bold text-green-600">{dashboardData.stats.successRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {dashboardData.stats.completedAttendances} de {dashboardData.stats.totalAttendances} concluídos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avaliação Clientes</p>
                      <p className="text-2xl font-bold text-yellow-600">{dashboardData.stats.avgRating.toFixed(1)}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex mt-1">
                    {[1,2,3,4,5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= dashboardData.stats.avgRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance Geral</p>
                      <p className="text-2xl font-bold text-purple-600">{dashboardData.stats.avgPerformanceScore.toFixed(1)}</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Avaliações dos supervisores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atendimentos Pendentes</p>
                      <p className="text-2xl font-bold text-orange-500">{pendingAttendances}</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {dashboardData.stats.totalAttendances} atendimentos registrados no total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solicitações em Aberto</p>
                      <p className="text-2xl font-bold text-blue-500">{openRequests}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Inclui atendimentos em andamento ou aguardando confirmação
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Gráficos de Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Status dos Atendimentos
                  </CardTitle>
                  <CardDescription>Distribuição por status dos seus atendimentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="pie"
                    data={[
                      {
                        label: 'Concluídos',
                        value: dashboardData.stats.completedAttendances,
                        color: '#10B981'
                      },
                      {
                        label: 'Pendentes',
                        value: dashboardData.stats.totalAttendances - dashboardData.stats.completedAttendances,
                        color: '#F59E0B'
                      }
                    ]}
                    height={200}
                  />
                </CardContent>
              </Card>

            </div>

            {/* Avaliações Recentes */}
            {dashboardData.recentEvaluations && dashboardData.recentEvaluations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Avaliações Recentes
                  </CardTitle>
                  <CardDescription>Feedback dos supervisores sobre seu desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentEvaluations?.slice(0, 3).map((evaluation, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-bold">{evaluation.overall_score?.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Técnico:</span>
                            <span className="ml-1 font-medium">{evaluation.technical_score}/5</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Comunicação:</span>
                            <span className="ml-1 font-medium">{evaluation.communication_score}/5</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Pontualidade:</span>
                            <span className="ml-1 font-medium">{evaluation.punctuality_score}/5</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Profissionalismo:</span>
                            <span className="ml-1 font-medium">{evaluation.professionalism_score}/5</span>
                          </div>
                        </div>
                        {evaluation.feedback && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            &ldquo;{evaluation.feedback}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximos Atendimentos Fiscais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Próximos Atendimentos Fiscais
                </CardTitle>
                <CardDescription>Seus atendimentos fiscais agendados para os próximos dias</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.fiscalAppointments && dashboardData.fiscalAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.fiscalAppointments
                      .filter(a => ['CONFIRMADO', 'EM_ANDAMENTO', 'PENDENTE'].includes(a.status))
                      .slice(0, 3)
                      .map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{appointment.client_name}</h4>
                              <Badge
                                className={
                                  appointment.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'EM_ANDAMENTO' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {appointment.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  appointment.urgency_level === 'URGENTE' ? 'border-red-300 text-red-700 bg-red-50' :
                                  appointment.urgency_level === 'ALTA' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                                  'border-blue-300 text-blue-700 bg-blue-50'
                                }
                              >
                                {appointment.urgency_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{appointment.service_title}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{appointment.client_email}</span>
                              </div>
                              {appointment.preferred_date && (
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>{new Date(appointment.preferred_date).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                              {appointment.preferred_time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{appointment.preferred_time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTab('attendances')}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum atendimento fiscal agendado</p>
                    <p className="text-sm text-gray-400 mt-1">Os atendimentos serão atribuídos pelo coordenador</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links de Formulários NAF */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Formulários de Avaliação
                </CardTitle>
                <CardDescription>
                  Links importantes para registro de serviços e boas práticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Ficha de Serviço Prestado</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Registre os atendimentos realizados</p>
                      </div>
                    </div>
                    <a
                      href="https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esLOeSofjsRxAvgRIQVYNlxJURFpFREtLWjhKODlZMDBZS09QTkhJNU82QyQlQCN0PWcu&route=shorturl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        📋 Acessar Formulário
                      </Button>
                    </a>
                  </div>

                  <div className="p-4 border border-emerald-200 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-emerald-900">Registro de Boas Práticas</h3>
                        <p className="text-sm text-emerald-700">Compartilhe experiências positivas</p>
                      </div>
                    </div>
                    <a
                      href="https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esDZnJHy5FONNgoCmZesCVIhUOE9GVlhZWlZOTzlFMlVUT0xLOTNDOVdPOS4u&route=shorturl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        ⭐ Acessar Formulário
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    💡 <strong>Importante:</strong> Utilize estes formulários para manter o registro adequado dos seus atendimentos e contribuir para a melhoria contínua do NAF.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atendimentos Fiscais Tab - Componente Completo */}
          <TabsContent value="attendances" className="mt-6">
            <StudentFiscalAppointments token={localStorage.getItem('student_token') || ''} />
          </TabsContent>

          {/* Treinamentos Tab */}
          <TabsContent value="trainings" className="mt-6">
            <TrainingsSection />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics e Performance</h2>
              <Button
                variant="outline"
                onClick={loadAnalytics}
                disabled={analyticsLoading}
              >
                {analyticsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {analyticsLoading ? 'Carregando...' : 'Atualizar Dados'}
                </span>
              </Button>
            </div>

            {analyticsData ? (
              <div className="space-y-6">
                {/* Indicadores de Crescimento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Indicadores de Crescimento
                    </CardTitle>
                    <CardDescription>Sua evolução ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsData.growthIndicators.attendanceGrowth > 0 ? '+' : ''}
                          {analyticsData.growthIndicators.attendanceGrowth}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Crescimento em Atendimentos</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analyticsData.growthIndicators.ratingImprovement > 0 ? '+' : ''}
                          {analyticsData.growthIndicators.ratingImprovement.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Melhoria na Avaliação</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analyticsData.growthIndicators.trainingProgress.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Progresso em Treinamentos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráficos de Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Estatísticas por Categoria de Cliente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Atendimentos por Categoria
                      </CardTitle>
                      <CardDescription>Performance por tipo de cliente</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SimpleChart
                        type="pie"
                        data={Object.entries(analyticsData?.clientCategoryStats || {}).map(([category, stats]: [string, unknown], index) => ({
                          label: category,
                          value: stats.count,
                          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                        }))}
                        height={200}
                      />
                    </CardContent>
                  </Card>

                  {/* Estatísticas por Tipo de Serviço */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Performance por Serviço
                      </CardTitle>
                      <CardDescription>Taxa de conclusão por tipo de serviço</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SimpleChart
                        type="bar"
                        data={Object.entries(analyticsData?.serviceTypeStats || {}).map(([service, stats]: [string, unknown]) => ({
                          label: service.length > 15 ? service.substring(0, 12) + '...' : service,
                          value: stats.completionRate,
                          color: '#10B981'
                        }))}
                        height={200}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Análise de Competências */}
                {analyticsData.competencyStats && Object.keys(analyticsData.competencyStats).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                        <Award className="h-5 w-5 text-purple-600" />
                        Análise de Competências
                      </CardTitle>
                      <CardDescription>Suas habilidades avaliadas pelos supervisores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(analyticsData?.competencyStats || {}).map(([competency, data]: [string, unknown]) => (
                          <div key={competency} className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {data.avg.toFixed(1)}/5
                            </div>
                            <div className="text-sm font-medium capitalize">{competency}</div>
                            <div className="text-xs text-gray-500">
                              {data.count} avaliações
                            </div>
                            {data.trend !== 0 && (
                              <div className={`text-xs mt-1 ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.trend > 0 ? '↗' : '↘'} {Math.abs(data.trend).toFixed(1)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Mensal */}
                {analyticsData.monthlyPerformance && Object.keys(analyticsData.monthlyPerformance).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Performance Mensal
                      </CardTitle>
                      <CardDescription>Evolução dos seus atendimentos ao longo dos meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SimpleChart
                        type="line"
                        data={Object.entries(analyticsData?.monthlyPerformance || {})
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([month, data]: [string, unknown]) => ({
                            label: month,
                            value: data.completed
                          }))}
                        height={200}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center dark:bg-gray-900 dark:border-gray-800">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Analytics não carregados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Clique em &ldquo;Atualizar Dados&rdquo; para carregar suas estatísticas detalhadas
                  </p>
                  <Button onClick={loadAnalytics} disabled={analyticsLoading}>
                    {analyticsLoading ? 'Carregando...' : 'Carregar Analytics'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <ReportGenerator />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meu Perfil</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={loadProfile}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Carregando...' : 'Atualizar Dados'}
                </Button>
                {!isEditingProfile ? (
                  <Button variant="outline" onClick={() => {
                    if (!profileData && !profileLoading) loadProfile()
                    setIsEditingProfile(true)
                    if (profileData?.profile) setProfileForm(profileData.profile)
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => updateProfile()} disabled={profileEditing}>
                      {profileEditing ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditingProfile(false)
                        setPasswordForm({})
                        if (profileData?.profile) setProfileForm(profileData.profile)
                        if (profileData?.availability) setAvailabilityForm(profileData.availability)
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {profileData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                    <div>
                      <label htmlFor="profile-name" className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome Completo</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-name"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.name || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.name}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-lg">{profileData.profile.email}</p>
                    </div>
                    <div>
                      <label htmlFor="profile-phone" className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefone</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-phone"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.phone || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.phone || 'Não informado'}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-document" className="text-sm font-medium text-gray-600 dark:text-gray-400">Documento</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-document"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.document || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, document: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.document || 'Não informado'}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-birth-date" className="text-sm font-medium text-gray-600 dark:text-gray-400">Data de Nascimento</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-birth-date"
                          type="date"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.birth_date ? new Date(profileForm.birth_date).toISOString().substring(0, 10) : ''}
                          onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">
                          {profileData.profile.birth_date
                            ? new Date(profileData.profile.birth_date).toLocaleDateString('pt-BR')
                            : 'Não informado'
                          }
                        </p>
                      )}
                    </div>
                    {isEditingProfile && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <input
                          type="password"
                          placeholder="Nova senha (opcional)"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={passwordForm.new || ''}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        />
                        <input
                          type="password"
                          placeholder="Confirmar senha"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={passwordForm.confirm || ''}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!passwordForm.new) return alert('Informe a nova senha')
                            if (passwordForm.new !== passwordForm.confirm) return alert('As senhas não conferem')
                            updateProfile({ ...profileForm, password: passwordForm.new })
                          }}
                        >
                          Alterar Senha
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Informações Acadêmicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      Informações Acadêmicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                    <div>
                      <label htmlFor="profile-university" className="text-sm font-medium text-gray-600 dark:text-gray-400">Universidade</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-university"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.university || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.university || 'Não informado'}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-course" className="text-sm font-medium text-gray-600 dark:text-gray-400">Curso</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-course"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.course || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.course}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-semester" className="text-sm font-medium text-gray-600 dark:text-gray-400">Semestre</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-semester"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.semester || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.semester}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-registration" className="text-sm font-medium text-gray-600 dark:text-gray-400">Matrícula</label>
                      {isEditingProfile ? (
                        <input
                          id="profile-registration"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={profileForm?.registration_number || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, registration_number: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{profileData.profile.registration_number || 'Não informado'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Especializações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      Especializações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditingProfile ? (
                      <div className="space-y-2">
                        <input
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Separadas por vírgula (ex: MEI, IRPF, ICMS)"
                          value={(profileForm?.specializations || []).join(', ')}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            specializations: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                          })}
                        />
                        <p className="text-xs text-gray-500">Pressione salvar para atualizar suas especializações.</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData?.profile?.specializations && profileData.profile.specializations.length > 0 ? (
                          profileData.profile.specializations.map((spec: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">Nenhuma especialização cadastrada</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Estatísticas do Perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Estatísticas do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Atendimentos</span>
                      <span className="text-sm font-bold">{profileData.stats.totalAttendances}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Atendimentos Concluídos</span>
                      <span className="text-sm font-bold">{profileData.stats.completedAttendances}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Sucesso</span>
                      <span className="text-sm font-bold">{profileData.stats.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avaliação Média</span>
                      <span className="text-sm font-bold">{profileData.stats.avgRating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={profileData.profile.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}>
                        {profileData.profile.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Último Login</span>
                      <span className="text-sm">
                        {profileData.profile.last_login
                          ? new Date(profileData.profile.last_login).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Membro desde</span>
                      <span className="text-sm">
                        {new Date(profileData.profile.created_at || '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Horários de Disponibilidade */}
                <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Horários de Disponibilidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => {
                        const daySlots = (availabilityForm || []).filter((slot: unknown) => slot.day_of_week === index)
                        return (
                          <div key={day} className="border rounded-lg p-3">
                            <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">{day}</div>
                            {daySlots.length > 0 ? (
                              daySlots.map((slot: unknown, i: number) => (
                                <div key={`${day}-${i}`} className="flex items-center gap-2 mb-2">
                                  {isEditingProfile ? (
                                    <>
                                      <label htmlFor={`start-time-${day}-${i}`} className="sr-only">Horário de início para {day}</label>
                                      <input
                                        id={`start-time-${day}-${i}`}
                                        type="time"
                                        className="border rounded px-2 py-1 text-xs"
                                        value={slot.start_time}
                                        onChange={(e) => {
                                          const idx = availabilityForm.indexOf(slot)
                                          const next = availabilityForm.map((s, si) => si === idx ? { ...s, start_time: e.target.value } : s)
                                          setAvailabilityForm(next)
                                        }}
                                      />
                                      <span className="text-xs text-gray-500">até</span>
                                      <label htmlFor={`end-time-${day}-${i}`} className="sr-only">Horário de término para {day}</label>
                                      <input
                                        id={`end-time-${day}-${i}`}
                                        type="time"
                                        className="border rounded px-2 py-1 text-xs"
                                        value={slot.end_time}
                                        onChange={(e) => {
                                          const idx = availabilityForm.indexOf(slot)
                                          const next = availabilityForm.map((s, si) => si === idx ? { ...s, end_time: e.target.value } : s)
                                          setAvailabilityForm(next)
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAvailabilityForm(availabilityForm.filter((s) => s !== slot))}
                                      >
                                        Remover
                                      </Button>
                                    </>
                                  ) : (
                                    <div className="text-xs bg-blue-50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                      {slot.start_time} - {slot.end_time}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">Indisponível</div>
                            )}
                            {isEditingProfile && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAvailabilityForm([
                                  ...availabilityForm,
                                  { day_of_week: index, start_time: '08:00', end_time: '12:00', is_active: true }
                                ])}
                              >
                                Adicionar Horário
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {isEditingProfile && (
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={saveAvailability}>Salvar Disponibilidade</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center dark:bg-gray-900 dark:border-gray-800">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Dados do perfil não carregados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Clique em &ldquo;Atualizar Dados&rdquo; para carregar suas informações
                  </p>
                  <Button onClick={loadProfile} disabled={profileLoading}>
                    {profileLoading ? 'Carregando...' : 'Carregar Perfil'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Chat do Estudante
                </CardTitle>
                <CardDescription>
                  Gerencie conversas transferidas e solicitações de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user && (
                  <StudentChat
                    studentId={user.id}
                    studentName={user.name}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="assistant" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar with tips and presets */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Bot className="h-5 w-5 text-emerald-600" />
                      Assistente Contábil
                    </CardTitle>
                    <CardDescription>
                      IA para dúvidas e orientação geral
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <label htmlFor="assistant-context-inline" className="text-sm text-gray-700 dark:text-gray-300">Usar meu contexto</label>
                      <input
                        id="assistant-context-inline"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={useProfileContext}
                        onChange={(e) => setUseProfileContext(e.target.checked)}
                      />
                    </div>
                    <div>
                      <label htmlFor="assistant-model-inline" className="text-sm text-gray-700 dark:text-gray-300">Modelo</label>
                      <select
                        id="assistant-model-inline"
                        className="w-full border rounded px-2 py-1 text-sm mt-1"
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                      >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Dica: peça checklists, exemplos práticos, ou modelos de documentos (ex: e-mail para cliente).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      Sugestões Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: 'Explique MEI e obrigações mensais',
                          prompt: 'Explique MEI e as obrigações mensais (DAS, notas, limites, funcionário) com exemplos e prazos.',
                          desc: 'Resumo do MEI, DAS, documentos e prazos oficiais.',
                          icon: <HelpCircle className="h-4 w-4" />
                        },
                        {
                          title: 'Checklist para IRPF (documentos e prazos)',
                          prompt: 'Crie um checklist de documentos e prazos para IRPF, incluindo rendimentos, bens e dívidas.',
                          desc: 'Checklist prático para organizar a declaração.',
                          icon: <ClipboardList className="h-4 w-4" />
                        },
                        {
                          title: 'Diferença entre ICMS, ISS e IPI',
                          prompt: 'Explique as diferenças entre ICMS, ISS e IPI com exemplos de aplicação.',
                          desc: 'Comparativo simples com exemplos cotidianos.',
                          icon: <ListChecks className="h-4 w-4" />
                        },
                        {
                          title: 'Como calcular pró-labore e lucros',
                          prompt: 'Explique como calcular pró-labore e distribuição de lucros com um exemplo numérico.',
                          desc: 'Passo a passo com fórmula e boa prática.',
                          icon: <Calculator className="h-4 w-4" />
                        },
                        {
                          title: 'Fluxo de caixa mensal simples',
                          prompt: 'Monte um exemplo de fluxo de caixa mensal simples e explique como analisar.',
                          desc: 'Modelo básico e interpretação do resultado.',
                          icon: <ListChecks className="h-4 w-4" />
                        },
                        {
                          title: 'Modelo de resposta ao cliente',
                          prompt: 'Crie um modelo de resposta educada para cliente com dúvida comum (IRPF atrasado).',
                          desc: 'Tom profissional e orientações iniciais.',
                          icon: <ClipboardList className="h-4 w-4" />
                        },
                      ].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setAiInput(s.prompt)}
                          className="group text-left rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 transition bg-white dark:bg-gray-950/60 hover:bg-emerald-50 p-3 shadow-sm hover:shadow flex items-start gap-3"
                        >
                          <div className="mt-0.5 text-emerald-700 bg-emerald-100 rounded-md p-1.5">
                            {s.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white leading-snug">{s.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{s.desc}</div>
                            <div className="mt-2 text-xs text-emerald-700 hidden group-hover:block">Clique para preencher no campo de pergunta</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat area */}
              <div className="lg:col-span-3">
                <Card className="h-[70vh] flex flex-col shadow-lg border-emerald-100 dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-3 dark:bg-gray-900 dark:border-gray-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        Assistente de Contabilidade
                        <Badge variant="outline" className="ml-2">{aiModel}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setAssistantFullscreen(true)} title="Tela cheia">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"><path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Tire dúvidas gerais. As respostas são informativas e não substituem orientação profissional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 dark:bg-gray-900 dark:border-gray-800">
                    <ScrollArea className="h-[calc(70vh-140px)] px-4">
                      <div className="space-y-4 py-4">
                        {aiMessages
                          .filter(m => m.role !== 'system')
                          .map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border ${m.role === 'user' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800'}`}>
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <div className="flex items-center gap-2 text-xs opacity-70">
                                    {m.role === 'user' ? 'Você' : 'Assistente'}
                                    {m.ts ? <span>• {new Date(m.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span> : null}
                                  </div>
                                  {m.role === 'assistant' && (
                                    <button
                                      className={`text-xs ${m.role === 'user' ? 'text-white/80' : 'text-gray-500'} opacity-0 group-hover:opacity-100 transition`}
                                      onClick={() => navigator.clipboard.writeText(m.content)}
                                      title="Copiar"
                                    >
                                      Copiar
                                    </button>
                                  )}
                                </div>
                                {m.role === 'assistant' ? (
                                  <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-strong:text-inherit prose-p:my-2 prose-li:my-1">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-wrap">{m.content}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        {aiLoading && (
                          <div className="text-xs text-gray-500 px-2">Gerando resposta...</div>
                        )}
                        {!aiLoading && aiMessages.filter(m => m.role !== 'system').length === 0 && (
                          <div className="text-center text-gray-500 text-sm py-8">Faça sua primeira pergunta sobre contabilidade.</div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="border-t p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">Respeite dados pessoais. Evite compartilhar informações sensíveis.</div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setAiMessages(prev => prev.filter(m => m.role === 'system'))}>Limpar chat</Button>
                          <Button onClick={() => handleSendAi()} disabled={aiLoading || !aiInput.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                            <Send className="h-4 w-4 mr-1" /> Enviar
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button variant="outline" size="icon" title="Anexar contexto (em breve)">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      <textarea
                        className="flex-1 border rounded-md px-3 py-2 text-sm min-h-[44px] max-h-[160px] resize-y shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="Pergunte algo sobre IRPF, MEI, ICMS, obrigações, etc."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendAi()
                          }
                        }}
                      />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Gerar checklist', 'Exemplo prático', 'Referências oficiais', 'Resumo em tópicos'].map((t, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={() => setAiInput(prev => `${prev}${prev ? '\n' : ''}${t}: `)}>
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes do Atendimento */}
      {selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Detalhes do Atendimento</CardTitle>
                  <CardDescription>
                    {selectedAttendance.client_name} - {selectedAttendance.service_type}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAttendance(null)}
                >
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</p>
                  <p className="font-medium">{selectedAttendance.client_name}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {selectedAttendance.client_email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{selectedAttendance.client_email}</span>
                      </div>
                    )}
                    {selectedAttendance.client_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{selectedAttendance.client_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atendimento</p>
                  <p className="font-medium">{selectedAttendance.service_type}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedAttendance.status)}
                    {getUrgencyBadge(selectedAttendance.urgency)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data e Horário</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{new Date(selectedAttendance.scheduled_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{selectedAttendance.scheduled_time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {selectedAttendance.is_online ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span>{selectedAttendance.is_online ? 'Online' : 'Presencial'}</span>
                  </div>
                </div>
              </div>

              {selectedAttendance.service_description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descrição</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedAttendance.service_description}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t">
                {selectedAttendance.status === 'AGENDADO' && (
                  <Button onClick={() => {
                    updateAttendanceStatus(selectedAttendance.id, 'EM_ANDAMENTO')
                    setSelectedAttendance(null)
                  }}>
                    <Clock className="h-4 w-4 mr-2" />
                    Iniciar Atendimento
                  </Button>
                )}
                {selectedAttendance.status === 'EM_ANDAMENTO' && (
                  <Button onClick={() => {
                    updateAttendanceStatus(selectedAttendance.id, 'CONCLUIDO')
                    setSelectedAttendance(null)
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir Atendimento
                  </Button>
                )}
                {selectedAttendance.client_email && (
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contatar Cliente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <NAFFooter />
    </div>
  )
}
