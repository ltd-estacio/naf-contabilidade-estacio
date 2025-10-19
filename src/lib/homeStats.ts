import { supabase, supabaseAdmin } from '@/lib/supabase'

type AttendanceRow = {
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

  // 1. atendimentos concluídos
  const { data: allAttendances, error: attendancesError } = await db
    .from('attendances')
    .select('id, status, client_satisfaction_rating')
    .eq('status', 'CONCLUIDO')

  if (attendancesError) {
    throw attendancesError
  }

  const totalAttendances = allAttendances?.length ?? 0

  // 2. agendamentos fiscais concluídos
  const { data: fiscalAppointments, error: fiscalError } = await db
    .from('fiscal_appointments')
    .select('id, status')
    .eq('status', 'CONCLUIDO')

  if (fiscalError) {
    throw fiscalError
  }

  const fiscalCompleted = fiscalAppointments?.length ?? 0

  // total agendamentos fiscais (para total geral)
  const { data: allFiscalAppointments, error: allFiscalError } = await db
    .from('fiscal_appointments')
    .select('id, status')

  if (allFiscalError) {
    throw allFiscalError
  }

  const allFiscalCount = allFiscalAppointments?.length ?? 0
  const totalServices = totalAttendances + allFiscalCount

  // serviços ativos
  const { data: nafServices, error: nafServicesError } = await db
    .from('services')
    .select('id')
    .eq('isActive', true)

  if (nafServicesError) {
    throw nafServicesError
  }

  const availableServices = nafServices?.length ?? 0

  // coordenadores ativos
  let activeCoordinators = 0
  const { data: coordinators, error: coordError } = await db
    .from('users')
    .select('id, role, is_active')
    .eq('role', 'COORDINATOR')
    .eq('is_active', true)

  if (coordError) {
    const { data: alt, error: altErr } = await db
      .from('coordinator_users')
      .select('id, is_active')
      .eq('is_active', true)

    if (altErr) {
      throw altErr
    }

    activeCoordinators = alt?.length ?? 0
  } else {
    activeCoordinators = coordinators?.length ?? 0
  }

  // satisfação
  let satisfactionPercentage = 0
  const ratings = (allAttendances as AttendanceRow[] | null)?.filter(
    (a) => typeof a.client_satisfaction_rating === 'number'
  ) ?? []
  if (ratings.length > 0) {
    const average =
      ratings.reduce((sum, item) => sum + (item.client_satisfaction_rating ?? 0), 0) /
      ratings.length
    satisfactionPercentage = Math.round((average / 5) * 100)
  }

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
