'use client'

import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  ExternalLink,
  FileText,
  Trophy,
  Target,
  RefreshCw,
  AlertTriangle,
  Scale,
  Building2,
  Map
} from 'lucide-react'
import CourseContent from './CourseContent'
import Link from 'next/link'
import { ALL_GUIDES, type LegislationItem, type LegislationScope } from '@/data/fiscal-guides'

interface Course {
  id: string
  title: string
  description: string
  difficulty: string
  duration: string
  progress: number
  modules: number
  completed: number
  instructor: string
  category: 'internal' | 'external' | 'manual'
  isEnrolled?: boolean
  isMandatory?: boolean
  externalUrl?: string
  pdfUrl?: string
}

interface TrainingsData {
  internalCourses: Course[]
  externalCourses: Course[]
  manuals: Course[]
  legislation: LegislationItem[]
  stats: {
    totalCourses: number
    enrolledCourses: number
    completedCourses: number
    totalProgress: number
  }
}

export default function TrainingsSection() {
  const [trainingsData, setTrainingsData] = useState<TrainingsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('internal')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dados dos cursos (fallback para quando a API não estiver disponível)
  const fallbackCoursesData: TrainingsData = {
    internalCourses: [],
    externalCourses: [
      {
        id: '4',
        title: 'Contabilidade com foco na gestão da informação contábil',
        description: 'Curso oferecido pela Escola Virtual do Governo Federal sobre gestão da informação contábil.',
        difficulty: 'Intermediário',
        duration: '5h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Escola Virtual Gov.br',
        category: 'external',
        externalUrl: 'https://www.escolavirtual.gov.br/curso/548',
        isEnrolled: false,
        isMandatory: false
      },
      {
        id: '5',
        title: 'Contabilidade pública e conformidade na gestão',
        description: 'Curso sobre contabilidade pública e procedimentos de conformidade.',
        difficulty: 'Avançado',
        duration: '6h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Escola Virtual Gov.br',
        category: 'external',
        externalUrl: 'https://www.escolavirtual.gov.br/curso/480',
        isEnrolled: false,
        isMandatory: false
      },
      {
        id: '6',
        title: 'Contabilidade com Foco na Gestão do Patrimônio Público',
        description: 'Gestão e controle do patrimônio público através da contabilidade.',
        difficulty: 'Intermediário',
        duration: '4h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Escola Virtual Gov.br',
        category: 'external',
        externalUrl: 'https://www.escolavirtual.gov.br/curso/342',
        isEnrolled: false,
        isMandatory: false
      },
      {
        id: '7',
        title: 'Conceitos Básicos de Finanças e Contabilidade para Empresas Estatais',
        description: 'Fundamentos financeiros e contábeis específicos para empresas estatais.',
        difficulty: 'Iniciante',
        duration: '3h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Escola Virtual Gov.br',
        category: 'external',
        externalUrl: 'https://www.escolavirtual.gov.br/curso/1345',
        isEnrolled: false,
        isMandatory: false
      },
      {
        id: '8',
        title: 'Contabilidade Empresarial',
        description: 'Curso abrangente sobre contabilidade empresarial oferecido pela EV.org.br.',
        difficulty: 'Intermediário',
        duration: '7h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'EV.org.br',
        category: 'external',
        externalUrl: 'https://www.ev.org.br/cursos/contabilidade-empresarial',
        isEnrolled: false,
        isMandatory: false
      }
    ],
    manuals: [
      {
        id: '9',
        title: 'Manual de Atendimentos',
        description: 'Manual oficial da Receita Federal para procedimentos de atendimento no NAF.',
        difficulty: 'Iniciante',
        duration: '1h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Receita Federal do Brasil',
        category: 'manual',
        pdfUrl: 'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-NAF/manual',
        isMandatory: true
      },
      {
        id: '10',
        title: 'Manual do Referencial NAF',
        description: 'Manual de referência para funcionamento e gestão do Núcleo de Apoio Contábil e Fiscal.',
        difficulty: 'Intermediário',
        duration: '1.5h',
        progress: 0,
        modules: 0,
        completed: 0,
        instructor: 'Receita Federal do Brasil',
        category: 'manual',
        pdfUrl: 'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/referencial-naf',
        isMandatory: true
      }
    ],
    legislation: ALL_GUIDES,
    stats: {
      totalCourses: 7,
      enrolledCourses: 0,
      completedCourses: 0,
      totalProgress: 0
    }
  }

  // Carregar dados dos cursos da API
  const loadCoursesData = async () => {
    try {
      setLoading(true)
      setError(null)

      let token = localStorage.getItem('student_token')

      // Mock token para desenvolvimento se não existir
      if (!token) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50SWQiOiJzdHVkZW50LTEiLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJBbHVubyBUZXN0ZSJ9.mock'
        localStorage.setItem('student_token', mockToken)
        token = mockToken
      }

      console.log('🔄 Carregando cursos da API...')

      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Dados dos cursos carregados:', data)

        // Transformar os dados da API para o formato esperado
        const transformedData = transformApiDataToTrainingsData(data)

        // Se não houver dados da API, usar fallback
        const hasInternalCourses = transformedData.internalCourses.length > 0
        const hasExternalCourses = transformedData.externalCourses.length > 0
        const hasManuals = transformedData.manuals.length > 0

        if (!hasInternalCourses && !hasExternalCourses && !hasManuals) {
          console.warn('⚠️ API retornou vazia, usando dados de fallback')
          setTrainingsData(fallbackCoursesData)
        } else {
          // Mesclar com fallback se alguma categoria estiver vazia
          setTrainingsData({
            internalCourses: hasInternalCourses ? transformedData.internalCourses : fallbackCoursesData.internalCourses,
            externalCourses: hasExternalCourses ? transformedData.externalCourses : fallbackCoursesData.externalCourses,
            manuals: hasManuals ? transformedData.manuals : fallbackCoursesData.manuals,
            legislation: transformedData.legislation,
            stats: transformedData.stats
          })
        }
      } else {
        console.warn('⚠️ API não disponível, usando dados locais')
        setTrainingsData(fallbackCoursesData)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cursos:', error)
      setError('Erro ao carregar cursos. Usando dados locais.')
      setTrainingsData(fallbackCoursesData)
    } finally {
      setLoading(false)
    }
  }

  // Transformar dados da API para o formato do componente
  const transformApiDataToTrainingsData = (apiData: unknown): TrainingsData => {
    const { courses, internalCourses, externalCourses, manuals, stats } = apiData

    return {
      internalCourses: (internalCourses || []).map((course: unknown) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty_level || 'Iniciante',
        duration: course.estimated_duration || '0h',
        progress: course.overall_progress || 0,
        modules: course.modules_count || 0,
        completed: course.completed_modules || 0,
        instructor: course.instructor_name || 'NAF',
        category: 'internal',
        isEnrolled: course.is_enrolled || false,
        isMandatory: course.is_mandatory || false
      })),
      externalCourses: (externalCourses || []).map((course: unknown) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty_level || 'Iniciante',
        duration: course.estimated_duration || '0h',
        progress: course.overall_progress || 0,
        modules: 0,
        completed: 0,
        instructor: course.instructor_name || 'Externo',
        category: 'external',
        externalUrl: course.external_url,
        isEnrolled: course.is_enrolled || false,
        isMandatory: course.is_mandatory || false
      })),
      manuals: (manuals || []).map((manual: unknown) => ({
        id: manual.id,
        title: manual.title,
        description: manual.description,
        difficulty: manual.difficulty_level || 'Iniciante',
        duration: manual.estimated_duration || '1h',
        progress: manual.overall_progress || 0,
        modules: 0,
        completed: 0,
        instructor: manual.instructor_name || 'Receita Federal',
        category: 'manual',
        pdfUrl: manual.external_url,
        isMandatory: manual.is_mandatory || false
      })),
      legislation: ALL_GUIDES,
      stats: {
        totalCourses: stats?.totalCourses || 0,
        enrolledCourses: stats?.enrolledCourses || 0,
        completedCourses: stats?.completedCourses || 0,
        totalProgress: stats?.progressPercentage || 0
      }
    }
  }

  useEffect(() => {
    loadCoursesData()
  }, [])

  const legislationByScope = useMemo(() => {
    const base: Record<LegislationScope, LegislationItem[]> = {
      FEDERAL: [],
      ESTADUAL: [],
      MUNICIPAL: []
    }

    if (!trainingsData?.legislation) {
      return base
    }

    return trainingsData.legislation.reduce((acc, item) => {
      if (acc[item.scope]) {
        acc[item.scope].push(item)
      }
      return acc
    }, { ...base })
  }, [trainingsData])

  const legislationScopes: LegislationScope[] = ['FEDERAL', 'ESTADUAL', 'MUNICIPAL']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
        return 'bg-green-100 text-green-800'
      case 'intermediário':
        return 'bg-yellow-100 text-yellow-800'
      case 'avançado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLegislationScopeConfig = (scope: LegislationScope) => {
    switch (scope) {
      case 'FEDERAL':
        return {
          label: 'Legislação Federal',
          description: 'Guias nacionais e normativos da Receita Federal.',
          badgeClass: 'bg-blue-100 text-blue-700',
          headerClass: 'bg-blue-50 border-blue-200',
          borderClass: 'border-l-blue-500',
          Icon: Scale
        }
      case 'ESTADUAL':
        return {
          label: 'Legislação Estadual',
          description: 'Tributos e obrigações fiscais dos estados.',
          badgeClass: 'bg-purple-100 text-purple-700',
          headerClass: 'bg-purple-50 border-purple-200',
          borderClass: 'border-l-purple-500',
          Icon: Map
        }
      case 'MUNICIPAL':
        return {
          label: 'Legislação Municipal',
          description: 'Licenças e obrigações junto às prefeituras.',
          badgeClass: 'bg-green-100 text-green-700',
          headerClass: 'bg-green-50 border-green-200',
          borderClass: 'border-l-green-500',
          Icon: Building2
        }
      default:
        return {
          label: 'Legislação',
          description: 'Guias fiscais e legislação aplicável.',
          badgeClass: 'bg-gray-100 text-gray-700',
          headerClass: 'bg-gray-50 border-gray-200',
          borderClass: 'border-l-gray-500',
          Icon: Scale
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return dateString
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  // Função para matricular em um curso
  const handleEnrollCourse = async (courseId: string) => {
    try {
      setEnrolling(courseId)
      setError(null)

      let token = localStorage.getItem('student_token')

      // Mock token para desenvolvimento se não existir
      if (!token) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50SWQiOiJzdHVkZW50LTEiLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJBbHVubyBUZXN0ZSJ9.mock'
        localStorage.setItem('student_token', mockToken)
        token = mockToken
      }

      console.log('📝 Matriculando no curso:', courseId)

      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_id: courseId })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Matrícula realizada com sucesso:', data)

        // Recarregar dados dos cursos para atualizar o status
        await loadCoursesData()

        // Feedback positivo
        setError(null)
      } else {
        const errorData = await response.json()
        console.error('❌ Erro na matrícula:', errorData)

        if (response.status === 409) {
          setError('Você já está matriculado neste curso!')
        } else {
          setError('Erro ao realizar matrícula. Tente novamente.')
        }
      }
    } catch (error) {
      console.error('💥 Erro na matrícula:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setEnrolling(null)
    }
  }

  const handleStartCourse = (courseId: string) => {
    setSelectedCourse(courseId)
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    // Recarregar dados quando voltar para atualizar progresso
    loadCoursesData()
  }

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank')
  }

  const handleOpenManual = (url: string) => {
    window.open(url, '_blank')
  }

  // Se um curso foi selecionado, mostrar o conteúdo do curso
  if (selectedCourse) {
    return <CourseContent courseId={selectedCourse} onBack={handleBackToCourses} />
  }

  if (!trainingsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Treinamentos NAF
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Desenvolva suas habilidades com nossos cursos especializados
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadCoursesData}
          disabled={loading}
          className="hover:bg-blue-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Dashboard */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Cursos</p>
                <p className="text-2xl font-bold text-blue-700">{trainingsData.stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Matriculado</p>
                <p className="text-2xl font-bold text-green-700">{trainingsData.stats.enrolledCourses}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Concluídos</p>
                <p className="text-2xl font-bold text-purple-700">{trainingsData.stats.completedCourses}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Progresso</p>
                <p className="text-2xl font-bold text-orange-700">{trainingsData.stats.totalProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="external" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="manuals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manuais
          </TabsTrigger>
          <TabsTrigger value="legislation" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legislação
          </TabsTrigger>
        </TabsList>

        {/* Internal Courses Tab */}
        <TabsContent value="internal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trainingsData.internalCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        {course.isMandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {course.modules} módulos
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {course.completed} de {course.modules} módulos concluídos
                      </p>
                    </div>

                    {/* Instructor */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Instrutor:</span> {course.instructor}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {!course.isEnrolled ? (
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={enrolling === course.id}
                        >
                          {enrolling === course.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Matriculando...
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Matricular-se
                            </>
                          )}
                        </Button>
                      ) : course.progress === 100 ? (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleStartCourse(course.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          onClick={() => handleStartCourse(course.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {course.progress > 0 ? 'Continuar' : 'Iniciar Curso'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* External Courses Tab */}
        <TabsContent value="external" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trainingsData.externalCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Externo
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Oferecido por:</span> {course.instructor}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        onClick={() => handleOpenExternal(course.externalUrl!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Curso
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Manuals Tab */}
        <TabsContent value="manuals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trainingsData.manuals.map((manual) => (
              <Card key={manual.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{manual.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(manual.difficulty)}>
                          {manual.difficulty}
                        </Badge>
                        {manual.isMandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm line-clamp-3">
                    {manual.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Manual Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {manual.duration}
                        </span>
                      </div>
                    </div>

                    {/* Source */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Fonte:</span> {manual.instructor}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        onClick={() => handleOpenManual(manual.pdfUrl!)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Acessar Manual
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="legislation" className="space-y-8">
          {legislationScopes.map(scope => {
            const guides = legislationByScope[scope]
            if (!guides.length) {
              return null
            }

            const { label, description, badgeClass, headerClass, borderClass, Icon } = getLegislationScopeConfig(scope)

            return (
              <div key={scope} className="space-y-4">
                <div className={`rounded-xl border px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${headerClass}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <Icon className="h-5 w-5" />
                      {label}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                      {description}
                    </p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <Link href={`/fiscal-guides?highlight=${guides[0].id}`}>
                      <ExternalLink className="h-4 w-4" />
                      Ver no Guias Fiscais
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {guides.map((guide) => (
                    <Card key={guide.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${borderClass}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg mb-2 line-clamp-2">{guide.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={badgeClass}>{guide.scope}</Badge>
                              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                                {guide.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Atualizado em {formatDate(guide.lastUpdated)}
                          </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed mt-2">
                          {guide.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {guide.steps && guide.steps.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Passo a passo essencial</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              {guide.steps.slice(0, 4).map((step, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {guide.documents && guide.documents.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Documentos importantes</h4>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {guide.documents.slice(0, 4).map((document, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <span>{document}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <Button variant="outline" className="text-sm" asChild>
                            <Link href={`/fiscal-guides?highlight=${guide.id}`}>
                              Consultar detalhes
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex items-center gap-2 text-sm"
                            onClick={() => handleOpenExternal('/fiscal-guides')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Abrir Guias Fiscais
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
            <AlertDescription className="flex flex-col gap-1 text-sm">
              <span>
                Precisa de orientações mais detalhadas? Acesse a seção completa de
                legislações e guias fiscais para visualizar os documentos oficiais e links
                de cada normativa.
              </span>
              <Link
                href="/fiscal-guides"
                className="inline-flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir página de Guias Fiscais
              </Link>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
