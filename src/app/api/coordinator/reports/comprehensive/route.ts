import { NextRequest, NextResponse } from 'next/server'
import { buildCoordinatorComprehensiveReport } from '@/lib/reports/coordinatorComprehensiveReport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') ?? 'all'
  const rawStatus = searchParams.get('status') ?? ''
  const rawService = searchParams.get('serviceType') ?? ''
  const rawStudent = searchParams.get('studentId') ?? ''

  const statusFilter = rawStatus && rawStatus.toUpperCase() !== 'ALL' ? rawStatus : undefined
  const serviceFilter = rawService && rawService.toLowerCase() !== 'all' ? rawService : undefined
  const studentFilter = rawStudent && rawStudent.toLowerCase() !== 'all' ? rawStudent : undefined

  try {
    const report = await buildCoordinatorComprehensiveReport({
      period,
      status: statusFilter,
      serviceType: serviceFilter,
      studentId: studentFilter,
    })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('❌ Erro ao gerar relatório abrangente:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
