import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId && !decoded.id && decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Student Analytics - Iniciando análise de performance')

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

    const studentId = studentAuth.studentId || studentAuth.id

    // 1. Buscar todos os atendimentos do estudante
    const { data: attendances, error: attendancesError } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)

    if (attendancesError) {
      console.error('❌ Erro ao buscar atendimentos:', attendancesError)
    }

    console.log(`📋 Analisando ${attendances?.length || 0} atendimentos`)

    // 2. Buscar avaliações do estudante
    const { data: evaluations, error: evaluationsError } = await supabaseAdmin
      .from('student_evaluations')
      .select('*')
      .eq('student_id', studentId)

    if (evaluationsError) {
      console.error('❌ Erro ao buscar avaliações:', evaluationsError)
    }

    console.log(`⭐ Analisando ${evaluations?.length || 0} avaliações`)

    // 3. Buscar progresso em treinamentos
    const { data: trainingProgress, error: trainingError } = await supabaseAdmin
      .from('student_training_progress')
      .select(`
        *,
        trainings:training_id (
          difficulty,
          topics
        )
      `)
      .eq('student_id', studentId)

    if (trainingError) {
      console.error('❌ Erro ao buscar treinamentos:', trainingError)
    }

    console.log(`📚 Analisando ${trainingProgress?.length || 0} treinamentos`)

    // 4. Análise por categoria de cliente
    const clientCategoryStats: unknown = {}
    attendances?.forEach(attendance => {
      const category = attendance.client_category || 'Outros'
      if (!clientCategoryStats[category]) {
        clientCategoryStats[category] = {
          count: 0,
          completed: 0,
          avgRating: 0,
          totalRating: 0,
          ratingCount: 0
        }
      }

      clientCategoryStats[category].count++
      if (attendance.status === 'CONCLUIDO') {
        clientCategoryStats[category].completed++
      }
      if (attendance.client_satisfaction_rating) {
        clientCategoryStats[category].totalRating += attendance.client_satisfaction_rating
        clientCategoryStats[category].ratingCount++
        clientCategoryStats[category].avgRating =
          clientCategoryStats[category].totalRating / clientCategoryStats[category].ratingCount
      }
    })

    // 5. Análise por tipo de serviço
    const serviceTypeStats: unknown = {}
    attendances?.forEach(attendance => {
      const service = attendance.service_type || 'Outros'
      if (!serviceTypeStats[service]) {
        serviceTypeStats[service] = {
          count: 0,
          completed: 0,
          completionRate: 0
        }
      }

      serviceTypeStats[service].count++
      if (attendance.status === 'CONCLUIDO') {
        serviceTypeStats[service].completed++
      }
      serviceTypeStats[service].completionRate =
        (serviceTypeStats[service].completed / serviceTypeStats[service].count) * 100
    })

    // 6. Performance mensal
    const monthlyPerformance: unknown = {}
    attendances?.forEach(attendance => {
      const date = new Date(attendance.scheduled_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyPerformance[monthKey]) {
        monthlyPerformance[monthKey] = {
          total: 0,
          completed: 0,
          avgRating: 0,
          totalRating: 0,
          ratingCount: 0
        }
      }

      monthlyPerformance[monthKey].total++
      if (attendance.status === 'CONCLUIDO') {
        monthlyPerformance[monthKey].completed++
      }
      if (attendance.client_satisfaction_rating) {
        monthlyPerformance[monthKey].totalRating += attendance.client_satisfaction_rating
        monthlyPerformance[monthKey].ratingCount++
        monthlyPerformance[monthKey].avgRating =
          monthlyPerformance[monthKey].totalRating / monthlyPerformance[monthKey].ratingCount
      }
    })

    // 7. Análise de treinamentos por dificuldade
    const trainingsByDifficulty: unknown = {}
    trainingProgress?.forEach(progress => {
      const difficulty = progress.trainings?.difficulty || 'BÁSICO'
      if (!trainingsByDifficulty[difficulty]) {
        trainingsByDifficulty[difficulty] = {
          total: 0,
          completed: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0
        }
      }

      trainingsByDifficulty[difficulty].total++
      if (progress.is_completed) {
        trainingsByDifficulty[difficulty].completed++
      }
      if (progress.score) {
        trainingsByDifficulty[difficulty].totalScore += progress.score
        trainingsByDifficulty[difficulty].scoreCount++
        trainingsByDifficulty[difficulty].avgScore =
          trainingsByDifficulty[difficulty].totalScore / trainingsByDifficulty[difficulty].scoreCount
      }
    })

    // 8. Análise de competências (das avaliações)
    const competencyStats: unknown = {}
    evaluations?.forEach(evaluation => {
      const competencies = [
        { name: 'technical', score: evaluation.technical_score },
        { name: 'communication', score: evaluation.communication_score },
        { name: 'punctuality', score: evaluation.punctuality_score },
        { name: 'professionalism', score: evaluation.professionalism_score }
      ]

      competencies.forEach(({ name, score }) => {
        if (score) {
          if (!competencyStats[name]) {
            competencyStats[name] = {
              total: 0,
              count: 0,
              avg: 0,
              trend: 0
            }
          }
          competencyStats[name].total += score
          competencyStats[name].count++
          competencyStats[name].avg = competencyStats[name].total / competencyStats[name].count
        }
      })
    })

    // 9. Indicadores de crescimento
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)

    const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    const currentMonthData = monthlyPerformance[currentMonthKey] || { completed: 0, avgRating: 0 }
    const lastMonthData = monthlyPerformance[lastMonthKey] || { completed: 0, avgRating: 0 }

    const attendanceGrowth = currentMonthData.completed - lastMonthData.completed
    const ratingImprovement = currentMonthData.avgRating - lastMonthData.avgRating

    const totalTrainings = trainingProgress?.length || 0
    const completedTrainings = trainingProgress?.filter(tp => tp.is_completed).length || 0
    const trainingProgressPercentage = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0

    const growthIndicators = {
      attendanceGrowth,
      ratingImprovement,
      trainingProgress: trainingProgressPercentage
    }

    const result = {
      data: {
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
    }

    console.log('✅ Analytics processado:', {
      attendances: attendances?.length || 0,
      evaluations: evaluations?.length || 0,
      trainings: trainingProgress?.length || 0,
      categories: Object.keys(clientCategoryStats).length,
      services: Object.keys(serviceTypeStats).length
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro no analytics do estudante:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
