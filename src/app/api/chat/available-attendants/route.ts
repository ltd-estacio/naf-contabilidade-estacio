import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET - Buscar estudantes e coordenadores disponíveis para transferência
 * Query params:
 * - type: 'coordinator' | 'student' | 'all' (padrão: 'all')
 * - exclude_id: ID do atendente atual para excluir da lista
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const excludeId = searchParams.get('exclude_id')

    const attendants: Array<{
      id: string
      name: string
      email?: string
      type: 'coordinator' | 'student'
      available: boolean
      specialties?: string[]
      active_chats?: number
    }> = []

    // Buscar coordenadores disponíveis
    if (type === 'coordinator' || type === 'all') {
      try {
        let coordQuery = supabaseAdmin
          .from('coordinator_users')
          .select('id, email, is_active, created_at')
          .eq('is_active', true)

        if (excludeId) {
          coordQuery = coordQuery.neq('id', excludeId)
        }

        const { data: coordinators, error: coordError } = await coordQuery

        if (!coordError && coordinators) {
          // Buscar quantidade de chats ativos de cada coordenador
          const { data: activeChats } = await supabaseAdmin
            .from('chat_conversations')
            .select('coordinator_id, id')
            .in('status', ['active_human', 'waiting_human'])
            .in('coordinator_id', coordinators.map(c => c.id))

          const chatCounts = activeChats?.reduce((acc, chat) => {
            acc[chat.coordinator_id] = (acc[chat.coordinator_id] || 0) + 1
            return acc
          }, {} as Record<string, number>) || {}

          coordinators.forEach(coord => {
            const activeChatCount = chatCounts[coord.id] || 0
            attendants.push({
              id: coord.id,
              name: formatNameFromEmail(coord.email),
              email: coord.email,
              type: 'coordinator',
              available: activeChatCount < 5, // Disponível se tiver menos de 5 chats ativos
              specialties: getCoordinatorSpecialties(coord.email),
              active_chats: activeChatCount
            })
          })
        }
      } catch (error) {
        console.error('Erro ao buscar coordenadores:', error)
      }
    }

    // Buscar estudantes disponíveis
    if (type === 'student' || type === 'all') {
      try {
        let studentQuery = supabaseAdmin
          .from('students')
          .select('id, name, email, status, course')
          .eq('status', 'ATIVO')

        if (excludeId) {
          studentQuery = studentQuery.neq('id', excludeId)
        }

        const { data: students, error: studentError } = await studentQuery

        if (!studentError && students) {
          // Buscar quantidade de chats ativos de cada estudante
          const { data: activeChats } = await supabaseAdmin
            .from('chat_conversations')
            .select('student_id, id')
            .in('status', ['active_human', 'waiting_human'])
            .not('student_id', 'is', null)
            .in('student_id', students.map(s => s.id))

          const chatCounts = activeChats?.reduce((acc, chat) => {
            if (chat.student_id) {
              acc[chat.student_id] = (acc[chat.student_id] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>) || {}

          students.forEach(student => {
            const activeChatCount = chatCounts[student.id] || 0
            attendants.push({
              id: student.id,
              name: student.name,
              email: student.email,
              type: 'student',
              available: activeChatCount < 3, // Disponível se tiver menos de 3 chats ativos
              specialties: getStudentSpecialties(student.course),
              active_chats: activeChatCount
            })
          })
        }
      } catch (error) {
        console.error('Erro ao buscar estudantes:', error)
      }
    }

    // Ordenar: disponíveis primeiro, depois por número de chats ativos
    attendants.sort((a, b) => {
      if (a.available !== b.available) {
        return a.available ? -1 : 1
      }
      return (a.active_chats || 0) - (b.active_chats || 0)
    })

    return NextResponse.json({
      success: true,
      attendants,
      total: attendants.length,
      available_count: attendants.filter(a => a.available).length
    })

  } catch (error) {
    console.error('Erro ao buscar atendentes disponíveis:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar atendentes disponíveis',
        attendants: []
      },
      { status: 500 }
    )
  }
}

/**
 * Formata nome a partir do email
 */
function formatNameFromEmail(email: string): string {
  const username = email.split('@')[0]
  return username
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

/**
 * Determina especialidades do coordenador baseado no email
 */
function getCoordinatorSpecialties(email: string): string[] {
  const emailLower = email.toLowerCase()

  if (emailLower.includes('admin') || emailLower.includes('coordenador')) {
    return ['Imposto de Renda', 'Tributário', 'Gestão Contábil']
  } else if (emailLower.includes('fiscal')) {
    return ['Legislação Fiscal', 'Tributos', 'Compliance']
  } else if (emailLower.includes('mei') || emailLower.includes('empresarial')) {
    return ['MEI', 'Empresarial', 'e-Social']
  } else if (emailLower.includes('rural') || emailLower.includes('itr')) {
    return ['ITR', 'Rural', 'Agronegócio']
  }

  return ['Consultoria Geral', 'Atendimento Fiscal']
}

/**
 * Determina especialidades do estudante baseado no curso
 */
function getStudentSpecialties(course?: string): string[] {
  if (!course) return ['Atendimento Geral']

  const courseLower = course.toLowerCase()

  if (courseLower.includes('contab')) {
    return ['Contabilidade', 'Balanços', 'Demonstrativos']
  } else if (courseLower.includes('admin') || courseLower.includes('gestão')) {
    return ['Gestão', 'Planejamento', 'Consultoria']
  } else if (courseLower.includes('direito')) {
    return ['Legislação', 'Tributário', 'Compliance']
  } else if (courseLower.includes('economia')) {
    return ['Análise Econômica', 'Planejamento Tributário']
  }

  return ['Atendimento Geral', 'Orientação Básica']
}
