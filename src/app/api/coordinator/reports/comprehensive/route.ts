import { NextRequest, NextResponse } from 'next/server'
import { buildCoordinatorComprehensiveReport } from '@/lib/reports/coordinatorComprehensiveReport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') ?? '90d'
  const statusFilter = searchParams.get('status') ?? ''
  const serviceFilter = searchParams.get('serviceType') ?? ''
  const studentFilter = searchParams.get('studentId') ?? ''

  try {
    const report = await buildCoordinatorComprehensiveReport({
      period,
      status: statusFilter || undefined,
      serviceType: serviceFilter || undefined,
      studentId: studentFilter || undefined,
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
