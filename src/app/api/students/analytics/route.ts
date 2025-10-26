import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId || decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

async function getStudentAnalytics(studentId: string) {
  try {
    // Análise de performance ao longo do tempo (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: attendancesHistory, error: historyError } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .gte('scheduled_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })

    if (historyError) throw historyError

    // Análise por categoria de cliente
    const clientCategoryStats = attendancesHistory?.reduce((acc: unknown, attendance) => {
      const category = attendance.client_category || 'OUTROS'
      if (!acc[category]) {
        acc[category] = { count: 0, avgRating: 0, totalRating: 0 }
      }
      acc[category].count++
      if (attendance.client_satisfaction_rating) {
        acc[category].totalRating += attendance.client_satisfaction_rating
        acc[category].avgRating = acc[category].totalRating / acc[category].count
      }
      return acc
    }, {}) || {}

    // Análise por tipo de serviço
    const serviceTypeStats = attendancesHistory?.reduce((acc: unknown, attendance) => {
      const serviceType = attendance.service_type || 'OUTROS'
      if (!acc[serviceType]) {
        acc[serviceType] = { count: 0, avgRating: 0, completionRate: 0, completed: 0 }
      }
      acc[serviceType].count++
      if (attendance.status === 'CONCLUIDO') {
        acc[serviceType].completed++
      }
      if (attendance.client_satisfaction_rating) {
        acc[serviceType].totalRating = (acc[serviceType].totalRating || 0) + attendance.client_satisfaction_rating
        acc[serviceType].avgRating = acc[serviceType].totalRating / acc[serviceType].count
      }
      acc[serviceType].completionRate = (acc[serviceType].completed / acc[serviceType].count) * 100
      return acc
    }, {}) || {}

    // Análise mensal de performance
    const monthlyPerformance = attendancesHistory?.reduce((acc: unknown, attendance) => {
      const month = new Date(attendance.scheduled_date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
      if (!acc[month]) {
        acc[month] = {
          count: 0,
          completed: 0,
          avgRating: 0,
          totalRating: 0,
          ratingCount: 0,
          onlineCount: 0,
          presentialCount: 0
        }
      }
      acc[month].count++
      if (attendance.status === 'CONCLUIDO') {
        acc[month].completed++
      }
      if (attendance.client_satisfaction_rating) {
        acc[month].totalRating += attendance.client_satisfaction_rating
        acc[month].ratingCount++
        acc[month].avgRating = acc[month].totalRating / acc[month].ratingCount
      }
      if (attendance.is_online) {
        acc[month].onlineCount++
      } else {
        acc[month].presentialCount++
      }
      return acc
    }, {}) || {}

    // Buscar dados de treinamentos com análise detalhada
    const { data: trainingProgress, error: trainingError } = await supabaseAdmin
      .from('student_training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('student_id', studentId)

    if (trainingError) throw trainingError

    // Análise de treinamentos por dificuldade
    const trainingsByDifficulty = trainingProgress?.reduce((acc: unknown, progress) => {
      const difficulty = progress.training?.difficulty || 'BÁSICO'
      if (!acc[difficulty]) {
        acc[difficulty] = {
          total: 0,
          completed: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0,
          avgTimeSpent: 0,
          totalTimeSpent: 0
        }
      }
      acc[difficulty].total++
      if (progress.is_completed) {
        acc[difficulty].completed++
        if (progress.score) {
          acc[difficulty].totalScore += progress.score
          acc[difficulty].scoreCount++
          acc[difficulty].avgScore = acc[difficulty].totalScore / acc[difficulty].scoreCount
        }
      }
      if (progress.time_spent_minutes) {
        acc[difficulty].totalTimeSpent += progress.time_spent_minutes
        acc[difficulty].avgTimeSpent = acc[difficulty].totalTimeSpent / acc[difficulty].total
      }
      return acc
    }, {}) || {}

    // Buscar avaliações detalhadas
    const { data: evaluations, error: evaluationError } = await supabaseAdmin
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false })

    if (evaluationError) throw evaluationError

    // Análise de competências
    const competencyAnalysis = evaluations?.reduce((acc: unknown, evaluation) => {
      acc.technical = acc.technical || []
      acc.communication = acc.communication || []
      acc.punctuality = acc.punctuality || []
      acc.professionalism = acc.professionalism || []

      acc.technical.push(evaluation.technical_score)
      acc.communication.push(evaluation.communication_score)
      acc.punctuality.push(evaluation.punctuality_score)
      acc.professionalism.push(evaluation.professionalism_score)

      return acc
    }, {}) || {}

    // Calcular médias e tendências das competências
    const competencyStats = Object.keys(competencyAnalysis).reduce((acc: unknown, key) => {
      const scores = competencyAnalysis[key]
      if (scores.length > 0) {
        acc[key] = {
          avg: scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length,
          trend: scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0,
          lastScore: scores[0],
          count: scores.length
        }
      }
      return acc
    }, {})

    // Calcular indicadores de crescimento
    const growthIndicators = {
      attendanceGrowth: 0,
      ratingImprovement: 0,
      trainingProgress: 0
    }

    if (Object.keys(monthlyPerformance).length >= 2) {
      const months = Object.keys(monthlyPerformance).sort()
      const firstMonth = monthlyPerformance[months[0]]
      const lastMonth = monthlyPerformance[months[months.length - 1]]

      growthIndicators.attendanceGrowth = lastMonth.count - firstMonth.count
      growthIndicators.ratingImprovement = lastMonth.avgRating - firstMonth.avgRating
    }

    const completedTrainings = trainingProgress?.filter(t => t.is_completed).length || 0
    const totalTrainings = trainingProgress?.length || 0
    growthIndicators.trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0

    return {
      clientCategoryStats,
      serviceTypeStats,
      monthlyPerformance,
      trainingsByDifficulty,
      competencyStats,
      growthIndicators,
      totalEvaluations: evaluations?.length || 0,
      averageOverallScore: evaluations?.length > 0
        ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length
        : 0
    }

  } catch (error) {
    console.error('Erro ao gerar analytics do estudante:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const analytics = await getStudentAnalytics(studentAuth.studentId)

    // Registrar acesso aos analytics
    await supabaseAdmin
      .from('student_activity_logs')
      .insert({
        student_id: studentAuth.studentId,
        activity_type: 'ANALYTICS_ACCESS',
        activity_data: {
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get('user-agent')
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

    return NextResponse.json({
      success: true,
      data: analytics,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar analytics do estudante:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
