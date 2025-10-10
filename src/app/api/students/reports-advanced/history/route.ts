import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const supabase = supabaseAdmin

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
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
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
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Obter parâmetros de paginação
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Buscar histórico de relatórios do estudante
    const { data: reports, error: reportsError, count } = await supabase
      .from('report_history')
      .select('*', { count: 'exact' })
      .eq('student_id', studentAuth.studentId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reportsError) {
      console.error('Erro ao buscar histórico de relatórios:', reportsError)
      return NextResponse.json(
        { message: 'Erro ao buscar histórico de relatórios' },
        { status: 500 }
      )
    }

    // Formatar dados do histórico
    const formattedReports = reports?.map(report => ({
      id: report.id,
      reportType: report.report_type,
      template: report.template,
      format: report.format,
      generatedAt: report.generated_at,
      fileSize: report.file_size,
      stats: {
        totalAttendances: report.total_attendances,
        completedAttendances: report.completed_attendances,
        successRate: report.success_rate,
        avgRating: report.avg_rating,
        totalTrainings: report.total_trainings,
        completedTrainings: report.completed_trainings
      },
      customTemplate: report.custom_template
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedReports,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar histórico de relatórios:', error)
    return NextResponse.json(
      {
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
