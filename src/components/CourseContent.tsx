'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ModuleViewer from "./ModuleViewer"
import StudentProgressTracker from "./courses/StudentProgressTracker"
import { useToast } from '@/hooks/use-toast'
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Target,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  type: 'video' | 'text' | 'exercise' | 'quiz'
  duration: number
  completed: boolean
  content?: string
}

interface Theme {
  id: string
  title: string
  description: string
  modules: Module[]
  completed: boolean
  progress: number
}

interface CourseData {
  id: string
  title: string
  description: string
  instructor: string
  difficulty: string
  totalDuration: string
  themes: Theme[]
  totalModules: number
  completedModules: number
}

// Dados dos cursos com conteúdo completo
const coursesData: { [key: string]: CourseData } = {
  '1': {
    id: '1',
    title: 'Aprenda sobre Power BI',
    description: 'Curso completo sobre Microsoft Power BI para análise de dados e criação de dashboards profissionais.',
    instructor: 'Prof. Ana Silva - Especialista em BI',
    difficulty: 'Iniciante',
    totalDuration: '8h',
    totalModules: 24,
    completedModules: 0,
    themes: [
      {
        id: 'theme-1-1',
        title: 'Fundamentos do Power BI',
        description: 'Introdução aos conceitos básicos do Microsoft Power BI e sua importância no mundo dos negócios.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-1-1-1',
            title: 'O que é Business Intelligence',
            description: 'Introdução aos conceitos de BI e sua importância no mundo dos negócios.',
            type: 'text',
            duration: 20,
            completed: false,
            content: 'Business Intelligence (BI) é um conjunto de metodologias, processos, arquiteturas e tecnologias que transformam dados brutos em informações relevantes e úteis para fins de análise de negócios.'
          },
          {
            id: 'module-1-1-2',
            title: 'Conhecendo o Power BI',
            description: 'Visão geral da ferramenta Microsoft Power BI e seus componentes.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-1-3',
            title: 'Interface do Power BI Desktop',
            description: 'Explorando a interface e ferramentas principais do Power BI Desktop.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-1-1-4',
            title: 'Configuração do Ambiente',
            description: 'Como configurar o Power BI Desktop para trabalho eficiente.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-1-1-5',
            title: 'Tipos de Dados e Fontes',
            description: 'Compreendendo diferentes tipos de dados e fontes no Power BI.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-1-6',
            title: 'Exercício Prático - Primeiro Relatório',
            description: 'Criando seu primeiro relatório simples no Power BI.',
            type: 'exercise',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: 'theme-1-2',
        title: 'Conectando e Preparando Dados',
        description: 'Aprenda a conectar-se a diferentes fontes de dados e preparar os dados para análise.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-1-2-1',
            title: 'Conectando a Fontes de Dados',
            description: 'Como conectar o Power BI a diferentes fontes de dados.',
            type: 'video',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-2-2',
            title: 'Power Query Editor',
            description: 'Introdução ao Power Query Editor para transformação de dados.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-2-3',
            title: 'Limpeza e Transformação de Dados',
            description: 'Técnicas para limpar e transformar dados no Power Query.',
            type: 'video',
            duration: 35,
            completed: false
          },
          {
            id: 'module-1-2-4',
            title: 'Criando Relacionamentos',
            description: 'Como criar e gerenciar relacionamentos entre tabelas.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-1-2-5',
            title: 'Modelagem de Dados',
            description: 'Princípios de modelagem de dados para análise eficiente.',
            type: 'text',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-2-6',
            title: 'Exercício - Preparação de Dados',
            description: 'Exercício prático de preparação e modelagem de dados.',
            type: 'exercise',
            duration: 20,
            completed: false
          }
        ]
      },
      {
        id: 'theme-1-3',
        title: 'Visualizações e Dashboards',
        description: 'Criação de visualizações eficazes e dashboards interativos.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-1-3-1',
            title: 'Tipos de Visualizações',
            description: 'Conhecendo os diferentes tipos de visualizações disponíveis.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-3-2',
            title: 'Criando Gráficos Básicos',
            description: 'Como criar gráficos de barras, linhas e pizza.',
            type: 'video',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-3-3',
            title: 'Visualizações Avançadas',
            description: 'Mapas, matrizes e visualizações customizadas.',
            type: 'video',
            duration: 35,
            completed: false
          },
          {
            id: 'module-1-3-4',
            title: 'Filtros e Segmentadores',
            description: 'Implementando filtros e segmentadores interativos.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-1-3-5',
            title: 'Design de Dashboards',
            description: 'Princípios de design para dashboards eficazes.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-3-6',
            title: 'Exercício - Dashboard Completo',
            description: 'Criando um dashboard completo com múltiplas visualizações.',
            type: 'exercise',
            duration: 25,
            completed: false
          }
        ]
      },
      {
        id: 'theme-1-4',
        title: 'DAX e Análises Avançadas',
        description: 'Introdução à linguagem DAX e técnicas avançadas de análise.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-1-4-1',
            title: 'Introdução ao DAX',
            description: 'Conceitos básicos da linguagem DAX.',
            type: 'text',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-4-2',
            title: 'Criando Medidas Calculadas',
            description: 'Como criar medidas usando DAX.',
            type: 'video',
            duration: 35,
            completed: false
          },
          {
            id: 'module-1-4-3',
            title: 'Funções de Tempo Inteligente',
            description: 'Usando funções DAX para análises temporais.',
            type: 'video',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-4-4',
            title: 'Contexto e Filtros em DAX',
            description: 'Compreendendo contexto de linha e filtro em DAX.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-1-4-5',
            title: 'Análises Avançadas',
            description: 'Técnicas avançadas de análise com DAX.',
            type: 'text',
            duration: 30,
            completed: false
          },
          {
            id: 'module-1-4-6',
            title: 'Projeto Final - Análise Completa',
            description: 'Projeto final integrando todos os conceitos aprendidos.',
            type: 'exercise',
            duration: 40,
            completed: false
          }
        ]
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Cadastro de CPF',
    description: 'Curso completo sobre procedimentos de cadastro, alteração e regularização de CPF.',
    instructor: 'Prof. Carlos Oliveira - Especialista Tributário',
    difficulty: 'Iniciante',
    totalDuration: '6h',
    totalModules: 24,
    completedModules: 0,
    themes: [
      {
        id: 'theme-2-1',
        title: 'Legislação e Fundamentos do CPF',
        description: 'Base legal e conceitos fundamentais sobre o Cadastro de Pessoas Físicas.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-2-1-1',
            title: 'História e Criação do CPF',
            description: 'A história e importância do Cadastro de Pessoas Físicas no Brasil.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-1-2',
            title: 'Base Legal do CPF',
            description: 'Legislação que rege o Cadastro de Pessoas Físicas.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-1-3',
            title: 'Obrigatoriedade de Inscrição',
            description: 'Quando é obrigatório ter CPF e quem deve se inscrever.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-1-4',
            title: 'Penalidades e Infrações',
            description: 'Penalidades por não ter CPF ou informações incorretas.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-1-5',
            title: 'Direitos e Deveres',
            description: 'Direitos e deveres relacionados ao CPF.',
            type: 'text',
            duration: 10,
            completed: false
          },
          {
            id: 'module-2-1-6',
            title: 'Quiz - Legislação CPF',
            description: 'Teste seus conhecimentos sobre a legislação do CPF.',
            type: 'quiz',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: 'theme-2-2',
        title: 'Processos de Inscrição',
        description: 'Procedimentos para inscrição no CPF para diferentes situações.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-2-2-1',
            title: 'Inscrição Presencial',
            description: 'Como fazer inscrição de CPF presencialmente.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-2-2-2',
            title: 'Inscrição Online',
            description: 'Procedimentos para inscrição de CPF pela internet.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-2-3',
            title: 'Documentação Necessária',
            description: 'Documentos obrigatórios para cada tipo de inscrição.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-2-4',
            title: 'Inscrição de Menores',
            description: 'Procedimentos especiais para inscrição de menores de idade.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-2-5',
            title: 'Casos Especiais',
            description: 'Situações especiais na inscrição do CPF.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-2-6',
            title: 'Exercício - Processo de Inscrição',
            description: 'Simulação prática de processo de inscrição.',
            type: 'exercise',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: 'theme-2-3',
        title: 'Alterações e Atualizações',
        description: 'Como realizar alterações cadastrais e atualizações de dados.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-2-3-1',
            title: 'Alteração de Dados Cadastrais',
            description: 'Como alterar informações no CPF.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-3-2',
            title: 'Atualização de Endereço',
            description: 'Procedimentos para atualização de endereço.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-3-3',
            title: 'Correção de Informações',
            description: 'Como corrigir informações incorretas no CPF.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-2-3-4',
            title: 'Uso do e-CAC',
            description: 'Utilizando o Centro Virtual de Atendimento.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-3-5',
            title: 'Comprovação de Alterações',
            description: 'Como comprovar alterações realizadas.',
            type: 'text',
            duration: 10,
            completed: false
          },
          {
            id: 'module-2-3-6',
            title: 'Exercício - Alteração Cadastral',
            description: 'Prática de alteração de dados cadastrais.',
            type: 'exercise',
            duration: 20,
            completed: false
          }
        ]
      },
      {
        id: 'theme-2-4',
        title: 'Regularização e Situações Especiais',
        description: 'Procedimentos para regularização e resolução de problemas no CPF.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-2-4-1',
            title: 'CPF Suspenso',
            description: 'Como regularizar CPF suspenso.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-2-4-2',
            title: 'Duplicidade de CPF',
            description: 'Resolução de problemas de duplicidade.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-4-3',
            title: 'CPF de Falecidos',
            description: 'Procedimentos para CPF de pessoas falecidas.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-4-4',
            title: 'Casos Judiciais',
            description: 'CPF em casos judiciais e situações especiais.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-2-4-5',
            title: 'Atendimento Especializado',
            description: 'Quando buscar atendimento especializado.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-2-4-6',
            title: 'Caso Prático - Regularização',
            description: 'Estudo de caso prático de regularização.',
            type: 'exercise',
            duration: 25,
            completed: false
          }
        ]
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Imposto de Renda',
    description: 'Curso abrangente sobre Declaração de Imposto de Renda Pessoa Física.',
    instructor: 'Profa. Maria Santos - Contadora e Consultora Tributária',
    difficulty: 'Intermediário',
    totalDuration: '9h',
    totalModules: 24,
    completedModules: 0,
    themes: [
      {
        id: 'theme-3-1',
        title: 'Introdução ao Imposto de Renda',
        description: 'Conceitos fundamentais sobre o Imposto de Renda Pessoa Física.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-3-1-1',
            title: 'Sistema Tributário Brasileiro',
            description: 'Visão geral do sistema tributário e o papel do IR.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-1-2',
            title: 'Obrigatoriedade de Declarar',
            description: 'Quem deve declarar Imposto de Renda.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-1-3',
            title: 'Prazos e Penalidades',
            description: 'Prazos para entrega e penalidades por atraso.',
            type: 'text',
            duration: 15,
            completed: false
          },
          {
            id: 'module-3-1-4',
            title: 'Tipos de Declaração',
            description: 'Declaração completa, simplificada e em conjunto.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-1-5',
            title: 'Documentos Necessários',
            description: 'Documentação obrigatória para a declaração.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-1-6',
            title: 'Quiz - Conceitos Básicos IR',
            description: 'Teste de conhecimentos sobre conceitos básicos.',
            type: 'quiz',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: 'theme-3-2',
        title: 'Rendimentos e Deduções',
        description: 'Como declarar diferentes tipos de rendimentos e aplicar deduções.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-3-2-1',
            title: 'Rendimentos Tributáveis',
            description: 'Tipos de rendimentos que devem ser declarados.',
            type: 'text',
            duration: 30,
            completed: false
          },
          {
            id: 'module-3-2-2',
            title: 'Rendimentos Isentos',
            description: 'Rendimentos que não sofrem tributação.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-2-3',
            title: 'Deduções Legais',
            description: 'Deduções permitidas por lei.',
            type: 'video',
            duration: 35,
            completed: false
          },
          {
            id: 'module-3-2-4',
            title: 'Despesas Médicas',
            description: 'Como deduzir despesas médicas e odontológicas.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-2-5',
            title: 'Despesas com Educação',
            description: 'Dedução de despesas com educação.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-2-6',
            title: 'Exercício - Cálculo de Deduções',
            description: 'Prática de cálculo de deduções.',
            type: 'exercise',
            duration: 25,
            completed: false
          }
        ]
      },
      {
        id: 'theme-3-3',
        title: 'Bens, Direitos e Dependentes',
        description: 'Declaração de patrimônio e informações sobre dependentes.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-3-3-1',
            title: 'Declaração de Bens e Direitos',
            description: 'Como declarar bens móveis e imóveis.',
            type: 'video',
            duration: 30,
            completed: false
          },
          {
            id: 'module-3-3-2',
            title: 'Inclusão de Dependentes',
            description: 'Quem pode ser incluído como dependente.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-3-3',
            title: 'Ganho de Capital',
            description: 'Cálculo e declaração de ganho de capital.',
            type: 'video',
            duration: 35,
            completed: false
          },
          {
            id: 'module-3-3-4',
            title: 'Dívidas e Ônus Reais',
            description: 'Como informar dívidas e ônus.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-3-5',
            title: 'Evolução Patrimonial',
            description: 'Análise da evolução do patrimônio.',
            type: 'text',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-3-6',
            title: 'Exercício - Declaração de Patrimônio',
            description: 'Prática de declaração de bens e direitos.',
            type: 'exercise',
            duration: 25,
            completed: false
          }
        ]
      },
      {
        id: 'theme-3-4',
        title: 'Programa IRPF e Transmissão',
        description: 'Uso do programa oficial e procedimentos de transmissão.',
        completed: false,
        progress: 0,
        modules: [
          {
            id: 'module-3-4-1',
            title: 'Instalação e Configuração',
            description: 'Como instalar e configurar o programa IRPF.',
            type: 'video',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-4-2',
            title: 'Navegação no Programa',
            description: 'Como navegar pelas funcionalidades do programa.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-4-3',
            title: 'Importação de Dados',
            description: 'Como importar dados de declarações anteriores.',
            type: 'text',
            duration: 20,
            completed: false
          },
          {
            id: 'module-3-4-4',
            title: 'Verificação de Inconsistências',
            description: 'Como identificar e corrigir erros na declaração.',
            type: 'video',
            duration: 30,
            completed: false
          },
          {
            id: 'module-3-4-5',
            title: 'Transmissão da Declaração',
            description: 'Procedimentos para transmitir a declaração.',
            type: 'video',
            duration: 25,
            completed: false
          },
          {
            id: 'module-3-4-6',
            title: 'Projeto Final - Declaração Completa',
            description: 'Elaboração de uma declaração completa.',
            type: 'exercise',
            duration: 45,
            completed: false
          }
        ]
      }
    ]
  }
}

interface CourseContentProps {
  courseId: string
  onBack: () => void
  studentToken?: string
  useRealTimeProgress?: boolean
}

export default function CourseContent({
  courseId,
  onBack,
  studentToken = 'student-1.mock',
  useRealTimeProgress = true
}: CourseContentProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [course, setCourse] = useState(coursesData[courseId])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const { toast } = useToast()

  // Verificar se o estudante está matriculado ao carregar
  useEffect(() => {
    if (useRealTimeProgress && studentToken) {
      checkEnrollmentStatus()
    } else {
      setIsEnrolled(true) // Para modo mock
    }
  }, [courseId, studentToken, useRealTimeProgress])

  const checkEnrollmentStatus = async () => {
    try {
      const response = await fetch(`/api/courses/progress?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsEnrolled(data.success)
      } else {
        setIsEnrolled(false)
      }
    } catch (error) {
      console.error('Erro ao verificar matrícula:', error)
      setIsEnrolled(false)
    }
  }

  const handleEnrollment = async () => {
    try {
      setEnrolling(true)
      console.log('📝 Matriculando no curso:', courseId)

      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: courseId
        })
      })

      const data = await response.json()

      if (response.ok && data.enrollment) {
        console.log('✅ Matrícula realizada:', data)
        setIsEnrolled(true)
        toast({
          title: 'Matrícula realizada! 🎉',
          description: 'Você foi matriculado no curso com sucesso.',
          variant: 'default'
        })
      } else {
        throw new Error(data.message || 'Erro na matrícula')
      }
    } catch (error) {
      console.error('❌ Erro na matrícula:', error)
      toast({
        title: 'Erro na matrícula',
        description: 'Não foi possível realizar a matrícula. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(false)
    }
  }

  // Atualizar progresso local quando um módulo é concluído
  const handleModuleComplete = (moduleId: string) => {
    console.log('✅ Módulo concluído:', moduleId)

    // Atualizar o estado local do curso
    if (course) {
      const updatedCourse = { ...course }

      // Encontrar e atualizar o módulo
      for (const theme of updatedCourse.themes) {
        const moduleIndex = theme.modules.findIndex(m => m.id === moduleId)
        if (moduleIndex !== -1) {
          theme.modules[moduleIndex].completed = true
          // Atualizar estatísticas
          updatedCourse.completedModules += 1
          break
        }
      }

      setCourse(updatedCourse)
    }
  }

  if (!course) {
    return <div>Curso não encontrado</div>
  }

  // Se um módulo foi selecionado, mostrar o ModuleViewer
  if (selectedModule) {
    return (
      <ModuleViewer
        moduleId={selectedModule}
        courseId={courseId}
        onBack={() => setSelectedModule(null)}
        onComplete={handleModuleComplete}
      />
    )
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'exercise':
        return <Target className="h-4 w-4" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800'
      case 'text':
        return 'bg-green-100 text-green-800'
      case 'exercise':
        return 'bg-orange-100 text-orange-800'
      case 'quiz':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStartModule = (moduleId: string) => {
    setSelectedModule(moduleId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
        </div>
        {/* Enrollment Button */}
        {useRealTimeProgress && !isEnrolled && (
          <Button
            onClick={handleEnrollment}
            disabled={enrolling}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {enrolling ? 'Matriculando...' : 'Matricular-se'}
          </Button>
        )}
      </div>

      {/* Real-time Progress or Static Course Info */}
      {useRealTimeProgress && isEnrolled ? (
        <StudentProgressTracker
          courseId={courseId}
          studentToken={studentToken}
          onModuleComplete={handleModuleComplete}
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{course.themes.length}</div>
                <div className="text-sm text-gray-600">Temas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{course.totalModules}</div>
                <div className="text-sm text-gray-600">Módulos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{course.totalDuration}</div>
                <div className="text-sm text-gray-600">Duração</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round((course.completedModules / course.totalModules) * 100)}%</div>
                <div className="text-sm text-gray-600">Progresso</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(course.completedModules / course.totalModules) * 100} className="h-3" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Instrutor:</span> {course.instructor}
            </div>
            {!isEnrolled && useRealTimeProgress && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Atenção:</strong> Você precisa se matricular no curso para acessar o conteúdo e acompanhar seu progresso.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Conteúdo do Curso</h2>

        <Accordion type="multiple" className="space-y-4">
          {course.themes.map((theme, themeIndex) => (
            <AccordionItem key={theme.id} value={theme.id}>
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {themeIndex + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{theme.title}</h3>
                        <p className="text-sm text-gray-600">{theme.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800">
                        {theme.modules.length} módulos
                      </Badge>
                      {theme.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="px-6 pb-4">
                    <div className="grid gap-3">
                      {theme.modules.map((module, moduleIndex) => (
                        <Card key={module.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">
                                  {moduleIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{module.title}</h4>
                                    <Badge className={getModuleTypeColor(module.type)}>
                                      <div className="flex items-center gap-1">
                                        {getModuleIcon(module.type)}
                                        <span className="text-xs">{module.type}</span>
                                      </div>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{module.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {module.duration} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {module.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartModule(module.id)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Iniciar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}