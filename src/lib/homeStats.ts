import { supabase, supabaseAdmin } from '@/lib/supabase'

type FiscalAppointmentRow = {
  client_satisfaction_rating?: number | null
}

export type HomeStats = {
  totalAttendances: number
  userSatisfaction: number
  availableServices: number
  onlineSupport: string
  activeCoordinators: number
  sslEnabled: boolean
  fiscalCompleted: number
}

export type HomeStatsBreakdown = {
  attendancesCompleted: number
  fiscalAppointmentsCompleted: number
  allFiscalAppointments: number
  totalServicesCombined: number
  nafServicesActive: number
  coordinatorsActive: number
  sslEnabled: boolean
  satisfactionBasedOnRatings: number
}

export type HomeStatsResult = {
  stats: HomeStats
  breakdown: HomeStatsBreakdown
}

export async function getHomeStats(): Promise<HomeStatsResult> {
  const db = supabaseAdmin ?? supabase

  // Fiscal appointments (orientações fiscais)
  const { data: completedFiscal, error: fiscalCompletedError } = await db
    .from('fiscal_appointments')
    .select('id, client_satisfaction_rating')
    .eq('status', 'CONCLUIDO')

  if (fiscalCompletedError) {
    throw fiscalCompletedError
  }

  const fiscalCompleted = completedFiscal?.length ?? 0

  const { data: allFiscalAppointments, error: allFiscalError } = await db
    .from('fiscal_appointments')
    .select('id')

  if (allFiscalError) {
    throw allFiscalError
  }

  const allFiscalCount = allFiscalAppointments?.length ?? 0

  // Serviços NAF ativos
  const { data: nafServices, error: nafServicesError } = await db
    .from('naf_services')
    .select('id, status')
    .eq('status', 'ativo')

  if (nafServicesError) {
    throw nafServicesError
  }

  const availableServices = nafServices?.length ?? 0

  // Coordenadores ativos
  const { data: coordinators, error: coordinatorsError } = await db
    .from('coordinator_users')
    .select('id')
    .eq('is_active', true)

  if (coordinatorsError) {
    throw coordinatorsError
  }

  const activeCoordinators = coordinators?.length ?? 0

  // Satisfação (quando houver avaliações em fiscal appointments)
  const ratings = (completedFiscal as FiscalAppointmentRow[] | null)?.filter(
    (a) => typeof a.client_satisfaction_rating === 'number'
  ) ?? []

  let satisfactionPercentage = 0
  if (ratings.length > 0) {
    const average =
      ratings.reduce((sum, item) => sum + (item.client_satisfaction_rating ?? 0), 0) /
      ratings.length
    satisfactionPercentage = Math.round((average / 5) * 100)
  }

  const totalAttendances = fiscalCompleted
  const totalServices = fiscalCompleted

  const sslEnabled =
    ((process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || '').startsWith('https://')) ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').startsWith('https://')

  return {
    stats: {
      totalAttendances: totalServices,
      userSatisfaction: satisfactionPercentage > 0 ? satisfactionPercentage : 95,
      availableServices,
      onlineSupport: '24h',
      activeCoordinators,
      sslEnabled,
      fiscalCompleted,
    },
    breakdown: {
      attendancesCompleted: totalAttendances,
      fiscalAppointmentsCompleted: fiscalCompleted,
      allFiscalAppointments: allFiscalCount,
      totalServicesCombined: totalServices,
      nafServicesActive: availableServices,
      coordinatorsActive: activeCoordinators,
      sslEnabled,
      satisfactionBasedOnRatings: ratings.length,
    },
  }
}
