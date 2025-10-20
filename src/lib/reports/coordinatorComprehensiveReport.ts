import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const STATUS_METADATA: Record<string, { label: string; category: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'reagendado' | 'other'; order: number }> = {
  PENDENTE: { label: 'Pendente', category: 'pending', order: 1 },
  SOLICITADO: { label: 'Solicitado', category: 'pending', order: 1 },
  AGENDADO: { label: 'Agendado', category: 'scheduled', order: 2 },
  CONFIRMADO: { label: 'Confirmado', category: 'scheduled', order: 2 },
  EM_ANDAMENTO: { label: 'Em andamento', category: 'in_progress', order: 3 },
  EM_PROGRESSO: { label: 'Em andamento', category: 'in_progress', order: 3 },
  EXECUCAO: { label: 'Em andamento', category: 'in_progress', order: 3 },
  CONCLUIDO: { label: 'Concluído', category: 'completed', order: 4 },
  FINALIZADO: { label: 'Concluído', category: 'completed', order: 4 },
  ENCERRADO: { label: 'Concluído', category: 'completed', order: 4 },
  CANCELADO: { label: 'Cancelado', category: 'cancelled', order: 5 },
  CANCELADA: { label: 'Cancelado', category: 'cancelled', order: 5 },
  REAGENDADO: { label: 'Reagendado', category: 'reagendado', order: 2 },
  REAGENDAMENTO: { label: 'Reagendado', category: 'reagendado', order: 2 },
  NO_SHOW: { label: 'Não compareceu', category: 'no_show', order: 6 },
  NAO_COMPARECEU: { label: 'Não compareceu', category: 'no_show', order: 6 },
}

function getStatusMeta(status: unknown) {
  const normalized = String(status || 'DESCONHECIDO').toUpperCase()
  return STATUS_METADATA[normalized] ?? {
    label: normalized
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^./, (c) => c.toUpperCase()),
    category: 'other' as const,
    order: 99,
  }
}

function sanitizeNumber(value: unknown) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export interface CoordinatorReportFilters {
  period?: string
  status?: string
  serviceType?: string
  studentId?: string
}

export interface CoordinatorAttendanceNote {
  id: string
  studentName?: string | null
  note: string
  createdAt: string
}

export interface CoordinatorDetailedAttendance {
  id: string
  type: 'regular' | 'fiscal'
  protocol: string | null
  status: string
  statusLabel: string
  statusCategory: string
  service: {
    name: string
    title?: string | null
    category?: string | null
    difficulty?: string | null
  }
  student: {
    id?: string | null
    name?: string | null
    email?: string | null
    course?: string | null
    semester?: string | null
    phone?: string | null
  }
  client: {
    name?: string | null
    email?: string | null
    phone?: string | null
    cpf?: string | null
    city?: string | null
    state?: string | null
  }
  clientCategory?: string | null
  timing: {
    requestedAt?: string | null
    scheduledDate?: string | null
    scheduledTime?: string | null
    preferredDate?: string | null
    preferredTime?: string | null
    preferredPeriod?: string | null
    startedAt?: string | null
    completedAt?: string | null
    updatedAt?: string | null
  }
  channel?: string | null
  urgency?: string | null
  isOnline?: boolean | null
  rescheduled?: boolean
  satisfaction?: number | null
  durationMinutes?: number | null
  notesCount: number
  notes?: CoordinatorAttendanceNote[]
  summary?: string | null
  internalNotes?: string | null
  feedback?: string | null
}

export interface CoordinatorReportSummary {
  totals: {
    overall: number
    regular: number
    fiscal: number
  }
  statusCounts: Array<{ status: string; label: string; category: string; count: number }>
  categoryCounts: Record<string, number>
  totalStudents: number
  averageSatisfaction: number
  averageDuration: number
  totalNotes: number
  rescheduledCount: number
  metadata: {
    period: string
    generatedAt: string
    filters: {
      status?: string
      serviceType?: string
      studentId?: string
    }
  }
}

export interface CoordinatorServicePerformance {
  id: string
  name: string
  category?: string | null
  total: number
  completionRate: number
  pending: number
  cancelled: number
  averageSatisfaction: number
  averageDuration: number | null
}

export interface CoordinatorStudentInsight {
  id: string
  name?: string | null
  email?: string | null
  course?: string | null
  semester?: string | null
  totalAttendances: number
  completionRate: number
  averageSatisfaction: number
  statuses: Record<string, number>
  notesCount: number
}

export interface CoordinatorComprehensiveReport {
  summary: CoordinatorReportSummary
  statusDistribution: Array<{ status: string; label: string; category: string; count: number }>
  timeline: Array<{ period: string; total: number; completed: number; inProgress: number }>
  courseDistribution: Array<{ course: string; total: number }>
  servicePerformance: CoordinatorServicePerformance[]
  studentInsights: CoordinatorStudentInsight[]
  detailedAttendances: CoordinatorDetailedAttendance[]
  clientCategories: Array<{ category: string; total: number; percent: number }>
  metadata: CoordinatorReportSummary['metadata']
  filterOptions: {
    statuses: Array<{ value: string; label: string }>
    services: Array<{ value: string; label: string; category?: string | null }>
    students: Array<{ value: string; label: string; course?: string | null }>
  }
}

export interface CoordinatorReportContext {
  filters: CoordinatorReportFilters
}

export async function buildCoordinatorComprehensiveReport(
  filters: CoordinatorReportFilters = {},
  clientOverride?: SupabaseClient
): Promise<CoordinatorComprehensiveReport> {
  const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
  const client = clientOverride ?? (hasServiceKey ? supabaseAdmin : supabase)

  const period = filters.period ?? '90d'
  let startDateISO: string | undefined
  let endDateISO: string | undefined

  const now = new Date()
  if (period !== 'all') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : period === '180d' ? 180 : period === '365d' ? 365 : 90
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    startDateISO = start.toISOString()
    endDateISO = now.toISOString()
  }

  const [attendancesResult, fiscalAppointmentsResult, studentsResult, servicesResult] = await Promise.all([
    client
      .from('attendances')
      .select('*')
      .order('created_at', { ascending: false })
      .modify((query) => {
        if (startDateISO) query.gte('created_at', startDateISO)
        if (endDateISO) query.lte('created_at', endDateISO)
        if (filters.status) query.eq('status', filters.status)
        if (filters.serviceType) query.eq('service_type', filters.serviceType)
        if (filters.studentId) query.eq('student_id', filters.studentId)
      }),
    client
      .from('fiscal_appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .modify((query) => {
        if (startDateISO) query.gte('created_at', startDateISO)
        if (endDateISO) query.lte('created_at', endDateISO)
        if (filters.status) query.eq('status', filters.status)
        if (filters.serviceType) query.eq('service_type', filters.serviceType)
        if (filters.studentId) query.eq('assigned_student_id', filters.studentId)
      }),
    client.from('students').select('*'),
    client.from('naf_services').select('*'),
  ])

  const attendances = attendancesResult.data ?? []
  const fiscalAppointments = fiscalAppointmentsResult.data ?? []
  const students = studentsResult.data ?? []
  const services = servicesResult.data ?? []

  const fiscalAppointmentIds = fiscalAppointments
    .map((appointment) => appointment?.id)
    .filter((id): id is string => typeof id === 'string')

  let fiscalNotesMap: Record<string, CoordinatorAttendanceNote[]> = {}

  if (fiscalAppointmentIds.length > 0) {
    const { data: notesData } = await client
      .from('fiscal_appointment_notes')
      .select('id, appointment_id, student_name, note, created_at')
      .in('appointment_id', fiscalAppointmentIds)
      .order('created_at', { ascending: true })

    fiscalNotesMap = (notesData || []).reduce<Record<string, CoordinatorAttendanceNote[]>>((acc, note) => {
      if (!note.appointment_id) return acc
      if (!acc[note.appointment_id]) acc[note.appointment_id] = []
      acc[note.appointment_id].push({
        id: note.id,
        studentName: note.student_name,
        note: note.note,
        createdAt: note.created_at,
      })
      return acc
    }, {})
  }

  const servicesMap = new Map(services.map((service) => [service.slug || service.name, service]))
  const studentsMap = new Map(students.map((student) => [student.id, student]))

  const detailedAttendances: CoordinatorDetailedAttendance[] = []
  const statusDistribution = new Map<string, { label: string; category: string; count: number }>()
  const statusCategoryCounts = new Map<string, number>()
  const timelineMap = new Map<string, { total: number; completed: number; inProgress: number }>()
  const courseDistribution = new Map<string, number>()
  const clientCategoryDistribution = new Map<string, number>()
  const servicePerformance = new Map<string, {
    id: string
    name: string
    category?: string | null
    total: number
    completed: number
    pending: number
    cancelled: number
    satisfactionSum: number
    satisfactionCount: number
    durationSum: number
    durationCount: number
  }>()
  const studentInsights = new Map<string, {
    id: string
    name?: string | null
    email?: string | null
    course?: string | null
    semester?: string | null
    total: number
    statuses: Record<string, number>
    completionCount: number
    satisfactionSum: number
    satisfactionCount: number
    notesCount: number
  }>()

  let totalSatisfaction = 0
  let satisfactionCount = 0
  let totalDuration = 0
  let durationCount = 0
  let totalNotes = 0

  const incrementStatus = (status: string) => {
    const meta = getStatusMeta(status)
    const entry = statusDistribution.get(status) ?? { label: meta.label, category: meta.category, count: 0 }
    entry.count += 1
    statusDistribution.set(status, entry)
    statusCategoryCounts.set(meta.category, (statusCategoryCounts.get(meta.category) ?? 0) + 1)
    return meta
  }

  const pushTimeline = (createdAt: string | null | undefined, meta: { category: string }) => {
    if (!createdAt) return
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const entry = timelineMap.get(key) ?? { total: 0, completed: 0, inProgress: 0 }
    entry.total += 1
    if (meta.category === 'completed') entry.completed += 1
    if (meta.category === 'in_progress') entry.inProgress += 1
    timelineMap.set(key, entry)
  }

  const registerServiceStats = (record: CoordinatorDetailedAttendance, meta: { category: string }) => {
    const key = record.service.name || record.service.title || 'Serviço'
    const service = servicesMap.get(record.service.name) || servicesMap.get(record.service.title || '')
    const entry = servicePerformance.get(key) ?? {
      id: service?.id ?? record.service.name ?? key,
      name: record.service.name || record.service.title || key,
      category: service?.category ?? record.service.category ?? 'Outros',
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      satisfactionSum: 0,
      satisfactionCount: 0,
      durationSum: 0,
      durationCount: 0,
    }
    entry.total += 1
    if (meta.category === 'completed') entry.completed += 1
    if (meta.category === 'pending') entry.pending += 1
    if (meta.category === 'cancelled') entry.cancelled += 1
    if (record.satisfaction) {
      entry.satisfactionSum += record.satisfaction
      entry.satisfactionCount += 1
    }
    if (record.durationMinutes) {
      entry.durationSum += record.durationMinutes
      entry.durationCount += 1
    }
    servicePerformance.set(key, entry)
  }

  const registerStudentStats = (record: CoordinatorDetailedAttendance, meta: { category: string }) => {
    const studentId = record.student.id
    if (!studentId) return
    const stats = studentInsights.get(studentId) ?? {
      id: studentId,
      name: record.student.name,
      email: record.student.email,
      course: record.student.course,
      semester: record.student.semester,
      total: 0,
      statuses: {},
      completionCount: 0,
      satisfactionSum: 0,
      satisfactionCount: 0,
      notesCount: 0,
    }
    stats.total += 1
    stats.statuses[record.status] = (stats.statuses[record.status] ?? 0) + 1
    if (meta.category === 'completed') stats.completionCount += 1
    if (record.satisfaction) {
      stats.satisfactionSum += record.satisfaction
      stats.satisfactionCount += 1
    }
    stats.notesCount += record.notesCount
    studentInsights.set(studentId, stats)

    if (record.student.course) {
      courseDistribution.set(record.student.course, (courseDistribution.get(record.student.course) ?? 0) + 1)
    }
  }

  const processAttendance = (raw: any, type: 'regular' | 'fiscal'): CoordinatorDetailedAttendance => {
    const statusMeta = incrementStatus(raw.status)
    pushTimeline(raw.created_at, statusMeta)

    const studentInfo = type === 'regular'
      ? studentsMap.get(raw.student_id)
      : studentsMap.get(raw.assigned_student_id)

    const serviceName = raw.service_type || raw.service_title || 'Serviço'

    const notes = type === 'fiscal' ? fiscalNotesMap[raw.id] || [] : []

    const record: CoordinatorDetailedAttendance = {
      id: raw.id,
      type,
      protocol: raw.protocol || raw.id,
      status: String(raw.status || 'DESCONHECIDO'),
      statusLabel: statusMeta.label,
      statusCategory: statusMeta.category,
      service: {
        name: serviceName,
        title: raw.service_title,
        category: raw.service_category,
        difficulty: raw.service_difficulty,
      },
      student: {
        id: type === 'regular' ? raw.student_id : raw.assigned_student_id,
        name: raw.student_name || raw.assigned_student_name || studentInfo?.name,
        email: raw.student_email || studentInfo?.email,
        course: studentInfo?.course,
        semester: studentInfo?.semester,
        phone: studentInfo?.phone,
      },
      client: {
        name: raw.client_name,
        email: raw.client_email,
        phone: raw.client_phone,
        cpf: raw.client_cpf,
        city: raw.address_city,
        state: raw.address_state,
      },
      clientCategory: raw.client_category || raw.client_segment || null,
      timing: {
        requestedAt: raw.created_at,
        scheduledDate: raw.scheduled_date || raw.preferred_date || raw.preferred_datetime,
        scheduledTime: raw.scheduled_time,
        preferredDate: raw.preferred_date,
        preferredTime: raw.preferred_time,
        preferredPeriod: raw.preferred_period,
        startedAt: raw.started_at || raw.in_progress_at,
        completedAt: raw.completed_at,
        updatedAt: raw.updated_at,
      },
      channel: raw.channel || raw.mode,
      urgency: raw.urgency || raw.urgency_level,
      isOnline: raw.is_online ?? (raw.channel === 'online'),
      rescheduled: Boolean(raw.reschedule_count && raw.reschedule_count > 0) || /reagend/i.test(`${raw.status || ''}${raw.internal_notes || ''}`),
      satisfaction: sanitizeNumber(raw.client_satisfaction_rating || raw.feedback_rating || raw.rating || 0) || null,
      durationMinutes: sanitizeNumber(raw.duration_minutes || raw.estimated_duration_minutes || raw.duration || 0) || null,
      notesCount: notes.length,
      notes,
      summary: raw.attendance_summary || raw.service_details || raw.client_notes || null,
      internalNotes: raw.internal_notes || null,
      feedback: raw.client_feedback || raw.feedback || raw.feedback_comment || null,
    }

    if (record.satisfaction) {
      totalSatisfaction += record.satisfaction
      satisfactionCount += 1
    }

    if (record.durationMinutes) {
      totalDuration += record.durationMinutes
      durationCount += 1
    }

    totalNotes += notes.length

    registerServiceStats(record, statusMeta)
    registerStudentStats(record, statusMeta)

    if (record.clientCategory) {
      clientCategoryDistribution.set(
        record.clientCategory,
        (clientCategoryDistribution.get(record.clientCategory) ?? 0) + 1
      )
    }

    return record
  }

  attendances.forEach((attendance) => {
    detailedAttendances.push(processAttendance(attendance, 'regular'))
  })

  fiscalAppointments.forEach((appointment) => {
    detailedAttendances.push(processAttendance(appointment, 'fiscal'))
  })

  detailedAttendances.sort((a, b) => (b.timing.requestedAt || '').localeCompare(a.timing.requestedAt || ''))

  const summary: CoordinatorReportSummary = {
    totals: {
      overall: detailedAttendances.length,
      regular: attendances.length,
      fiscal: fiscalAppointments.length,
    },
    statusCounts: Array.from(statusDistribution.entries())
      .map(([status, info]) => ({ status, label: info.label, category: info.category, count: info.count }))
      .sort((a, b) => getStatusMeta(a.status).order - getStatusMeta(b.status).order),
    categoryCounts: Object.fromEntries(statusCategoryCounts),
    totalStudents: students.length,
    averageSatisfaction: satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0,
    averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    totalNotes,
    rescheduledCount: detailedAttendances.filter((record) => record.rescheduled).length,
    metadata: {
      period,
      generatedAt: new Date().toISOString(),
      filters: {
        status: filters.status || undefined,
        serviceType: filters.serviceType || undefined,
        studentId: filters.studentId || undefined,
      },
    },
  }

  const timeline = Array.from(timelineMap.entries())
    .map(([periodKey, value]) => ({ period: periodKey, ...value }))
    .sort((a, b) => a.period.localeCompare(b.period))

  const courseStats = Array.from(courseDistribution.entries())
    .map(([course, total]) => ({ course, total }))
    .sort((a, b) => b.total - a.total)

  const serviceStats = Array.from(servicePerformance.values()).map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category,
    total: service.total,
    completionRate: service.total > 0 ? (service.completed / service.total) * 100 : 0,
    pending: service.pending,
    cancelled: service.cancelled,
    averageSatisfaction: service.satisfactionCount > 0 ? service.satisfactionSum / service.satisfactionCount : 0,
    averageDuration: service.durationCount > 0 ? service.durationSum / service.durationCount : null,
  })).sort((a, b) => b.total - a.total)

  const studentStatsArray = Array.from(studentInsights.values()).map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    course: student.course,
    semester: student.semester,
    totalAttendances: student.total,
    completionRate: student.total > 0 ? (student.completionCount / student.total) * 100 : 0,
    averageSatisfaction: student.satisfactionCount > 0 ? student.satisfactionSum / student.satisfactionCount : 0,
    statuses: student.statuses,
    notesCount: student.notesCount,
  })).sort((a, b) => b.totalAttendances - a.totalAttendances)

  const clientCategories = Array.from(clientCategoryDistribution.entries())
    .map(([category, total]) => ({
      category,
      total,
      percent: summary.totals.overall > 0 ? (total / summary.totals.overall) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    summary,
    statusDistribution: summary.statusCounts,
    timeline,
    courseDistribution: courseStats,
    servicePerformance: serviceStats,
    studentInsights: studentStatsArray,
    detailedAttendances,
    clientCategories,
    metadata: summary.metadata,
    filterOptions: {
      statuses: summary.statusCounts.map((item) => ({ value: item.status, label: item.label })),
      services: serviceStats.map((item) => ({ value: item.name, label: item.name, category: item.category })),
      students: studentStatsArray.map((item) => ({ value: item.id, label: item.name || 'Sem nome', course: item.course })),
    },
  }
}
