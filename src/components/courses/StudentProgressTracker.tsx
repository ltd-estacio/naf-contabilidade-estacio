'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Circle,
  Clock,
  Play,
  BookOpen,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ModuleProgress {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  completion_percentage: number
  module_order: number
  time_spent?: number
  theme_modules?: {
    course_themes?: {
      title: string
      theme_order: number
    }
  }
}

interface CourseProgress {
  enrollment_id: string
  student_id: string
  course_id: string
  course_title: string
  enrollment_status: string
  overall_progress: number
  total_modules_completed: number
  total_modules_in_course: number
  calculated_progress: number
  last_activity_at: string
  enrollment_date: string
}

interface StudentProgressTrackerProps {
  courseId: string
  studentToken: string
  onModuleComplete?: (moduleId: string) => void
}

export default function StudentProgressTracker({
  courseId,
  studentToken,
  onModuleComplete
}: StudentProgressTrackerProps) {
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [modules, setModules] = useState<ModuleProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingModule, setUpdatingModule] = useState<string | null>(null)
  const { toast } = useToast()

  // Buscar progresso inicial
  useEffect(() => {
    fetchProgress()
  }, [courseId, studentToken])

  const fetchProgress = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/courses/progress?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar progresso')
      }

      const data = await response.json()

      if (data.success) {
        setProgress(data.progress)
        setModules(data.modules || [])
      } else {
        throw new Error(data.message || 'Erro ao carregar progresso')
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error)
      toast({
        title: 'Erro ao carregar progresso',
        description: 'Não foi possível carregar o progresso do curso.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateModuleProgress = async (
    moduleId: string,
    status: 'in_progress' | 'completed',
    completionPercentage: number = 0
  ) => {
    try {
      setUpdatingModule(moduleId)

      const response = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: courseId,
          module_id: moduleId,
          status: status,
          completion_percentage: completionPercentage
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar progresso')
      }

      const data = await response.json()

      if (data.success) {
        // Atualizar estado local
        setModules(prev =>
          prev.map(module =>
            module.id === moduleId
              ? { ...module, status, completion_percentage: completionPercentage }
              : module
          )
        )

        // Recalcular progresso geral
        const completedModules = modules.filter(m =>
          m.id === moduleId ? status === 'completed' : m.status === 'completed'
        ).length

        if (progress) {
          setProgress(prev => prev ? {
            ...prev,
            total_modules_completed: completedModules,
            calculated_progress: Math.round((completedModules / modules.length) * 100),
            overall_progress: Math.round((completedModules / modules.length) * 100),
            last_activity_at: new Date().toISOString()
          } : null)
        }

        if (status === 'completed') {
          toast({
            title: 'Módulo concluído! 🎉',
            description: 'Parabéns! Você completou mais um módulo.',
            variant: 'default'
          })

          onModuleComplete?.(moduleId)
        } else {
          toast({
            title: 'Progresso atualizado',
            description: 'Seu progresso foi salvo com sucesso.',
            variant: 'default'
          })
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error)
      toast({
        title: 'Erro ao atualizar progresso',
        description: 'Não foi possível salvar seu progresso. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingModule(null)
    }
  }

  const completeModule = (moduleId: string) => {
    updateModuleProgress(moduleId, 'completed', 100)
  }

  const startModule = (moduleId: string) => {
    updateModuleProgress(moduleId, 'in_progress', 0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-800">Em andamento</Badge>
      default:
        return <Badge variant="outline">Não iniciado</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
              Progresso não encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Não foi possível carregar o progresso deste curso.
            </p>
            <Button onClick={fetchProgress} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo do Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Seu Progresso - {progress.course_title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-gray-600">
                  {progress.total_modules_completed}/{progress.total_modules_in_course} módulos
                </span>
              </div>
              <Progress
                value={progress.calculated_progress || 0}
                className="h-3"
              />
              <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                {progress.calculated_progress || 0}% concluído
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {progress.total_modules_completed}
                </p>
                <p className="text-sm text-gray-600">Módulos concluídos</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {progress.total_modules_in_course}
                </p>
                <p className="text-sm text-gray-600">Total de módulos</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {progress.calculated_progress >= 100 ? '1' : '0'}
                </p>
                <p className="text-sm text-gray-600">Cursos concluídos</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {new Date(progress.last_activity_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Última atividade</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Módulos */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhum módulo encontrado para este curso.</p>
              </div>
            ) : (
              modules
                .sort((a, b) => a.module_order - b.module_order)
                .map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(module.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </p>
                        {module.theme_modules?.course_themes && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tema: {module.theme_modules.course_themes.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(module.status)}
                          {module.completion_percentage > 0 && (
                            <span className="text-xs text-gray-500">
                              {module.completion_percentage}% concluído
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {module.status === 'not_started' && (
                        <Button
                          onClick={() => startModule(module.id)}
                          disabled={updatingModule === module.id}
                          variant="outline"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}

                      {module.status === 'in_progress' && (
                        <Button
                          onClick={() => completeModule(module.id)}
                          disabled={updatingModule === module.id}
                          variant="default"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}

                      {module.status === 'completed' && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}