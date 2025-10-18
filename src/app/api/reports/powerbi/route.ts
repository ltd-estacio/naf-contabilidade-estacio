import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Power BI Reports API - Processing request')

    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    const client = hasServiceKey ? supabaseAdmin : supabase

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'general'
    const format = searchParams.get('format') || 'json' // json, csv, xlsx
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || '30d'

    console.log(`📊 Report type: ${type}, Format: ${format}, Period: ${period}`)

    // Calculate date range
    let startDateISO: string | undefined
    let endDateISO: string | undefined

    if (startDate && endDate) {
      startDateISO = startDate
      endDateISO = endDate
    } else if (period !== 'all') {
      const now = new Date()
      const days = period === '7d' ? 7 :
                  period === '30d' ? 30 :
                  period === '90d' ? 90 :
                  period === '365d' ? 365 : 30

      startDateISO = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
      endDateISO = now.toISOString()
    }

    let data: unknown = []
    let filename = `powerbi-${type}-${new Date().toISOString().split('T')[0]}`

    switch (type) {
      case 'general':
        console.log('📊 Generating general Power BI dataset...')

        // Fetch all main data from Supabase
        let attendancesQuery = client
          .from('attendances')
          .select('*')
          .order('created_at', { ascending: false })

        if (startDateISO) attendancesQuery = attendancesQuery.gte('created_at', startDateISO)
        if (endDateISO) attendancesQuery = attendancesQuery.lte('created_at', endDateISO)

        const { data: attendances, error: attendancesError } = await attendancesQuery

        const { data: students, error: studentsError } = await client
          .from('students')
          .select('*')
          .eq('status', 'ATIVO')

        const { data: services, error: servicesError } = await client
          .from('naf_services')
          .select('*')
          .eq('status', 'ativo')

        let fiscalQuery = client
          .from('fiscal_appointments')
          .select('*')
          .order('created_at', { ascending: false })

        if (startDateISO) fiscalQuery = fiscalQuery.gte('created_at', startDateISO)
        if (endDateISO) fiscalQuery = fiscalQuery.lte('created_at', endDateISO)

        const { data: fiscalAppointments, error: fiscalError } = await fiscalQuery

        const { data: chatConversations, error: chatError } = await client
          .from('chat_conversations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5000)

        if (attendancesError) console.error('Attendances error:', attendancesError)
        if (studentsError) console.error('Students error:', studentsError)
        if (servicesError) console.error('Services error:', servicesError)
        if (fiscalError) console.error('Fiscal error:', fiscalError)
        if (chatError) console.error('Chat error:', chatError)

        // Process and structure data for Power BI
        data = {
          metadata: {
            generatedAt: new Date().toISOString(),
            period,
            startDate: startDateISO,
            endDate: endDateISO,
            totalAttendances: attendances?.length || 0,
            totalStudents: students?.length || 0,
            totalServices: services?.length || 0,
            totalFiscalAppointments: fiscalAppointments?.length || 0,
            totalChatConversations: chatConversations?.length || 0
          },

          // Main dataset for Power BI - Attendances with enriched data
          attendances: (attendances || []).map((attendance: unknown) => {
            const createdDate = new Date(attendance.created_at)
            const scheduledDate = attendance.scheduled_date ? new Date(attendance.scheduled_date) : null

            return {
              // Primary Keys
              attendanceId: attendance.id,
              studentId: attendance.student_id,
              protocol: attendance.protocol || `ATD-${attendance.id}`,

              // Attendance Info
              status: attendance.status,
              serviceType: attendance.service_type,
              clientCategory: attendance.client_category,
              clientAge: attendance.client_age,
              clientGender: attendance.client_gender,
              durationMinutes: attendance.duration_minutes || 0,
              satisfactionRating: attendance.client_satisfaction_rating || 0,

              // Temporal Dimensions for Power BI
              createdAt: createdDate.toISOString(),
              scheduledAt: scheduledDate?.toISOString() || null,
              createdYear: createdDate.getFullYear(),
              createdMonth: createdDate.getMonth() + 1,
              createdQuarter: Math.ceil((createdDate.getMonth() + 1) / 3),
              createdWeek: Math.ceil(createdDate.getDate() / 7),
              createdDayOfWeek: createdDate.getDay(),
              createdDayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()],
              monthYear: `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`,

              // Calculated Fields
              isCompleted: attendance.status === 'CONCLUIDO' ? 1 : 0,
              isPending: ['AGENDADO', 'EM_ANDAMENTO'].includes(attendance.status) ? 1 : 0,
              isCancelled: attendance.status === 'CANCELADO' ? 1 : 0,
              hasRating: attendance.client_satisfaction_rating ? 1 : 0,
              isHighSatisfaction: (attendance.client_satisfaction_rating || 0) >= 4 ? 1 : 0,
              isLongDuration: (attendance.duration_minutes || 0) > 60 ? 1 : 0
            }
          }),

          // Students dataset
          students: (students || []).map((student: unknown) => {
            const createdDate = new Date(student.created_at)
            const studentAttendances = (attendances || []).filter((a: unknown) => a.student_id === student.id)

            return {
              studentId: student.id,
              studentName: student.name,
              email: student.email,
              course: student.course,
              semester: student.semester,
              status: student.status,
              createdAt: createdDate.toISOString(),
              createdYear: createdDate.getFullYear(),
              createdMonth: createdDate.getMonth() + 1,

              // Performance Metrics
              totalAttendances: studentAttendances.length,
              completedAttendances: studentAttendances.filter((a: unknown) => a.status === 'CONCLUIDO').length,
              avgSatisfaction: studentAttendances.length > 0
                ? studentAttendances
                    .filter((a: unknown) => a.client_satisfaction_rating)
                    .reduce((sum: number, a: unknown) => sum + a.client_satisfaction_rating, 0) /
                  Math.max(1, studentAttendances.filter((a: unknown) => a.client_satisfaction_rating).length)
                : 0,
              totalHours: studentAttendances.reduce((sum: number, a: unknown) => sum + (a.duration_minutes || 0), 0) / 60
            }
          }),

          // Services analysis
          services: (services || []).map((service: unknown) => {
            const serviceAttendances = (attendances || []).filter((a: unknown) => a.service_type === service.name)

            return {
              serviceId: service.id,
              serviceName: service.name,
              category: service.category,
              status: service.status,
              priority: service.priority_order,

              // Demand Metrics
              totalRequests: serviceAttendances.length,
              completedRequests: serviceAttendances.filter((a: unknown) => a.status === 'CONCLUIDO').length,
              avgSatisfaction: serviceAttendances.length > 0
                ? serviceAttendances
                    .filter((a: unknown) => a.client_satisfaction_rating)
                    .reduce((sum: number, a: unknown) => sum + a.client_satisfaction_rating, 0) /
                  Math.max(1, serviceAttendances.filter((a: unknown) => a.client_satisfaction_rating).length)
                : 0,
              avgDuration: serviceAttendances.length > 0
                ? serviceAttendances.reduce((sum: number, a: unknown) => sum + (a.duration_minutes || 0), 0) / serviceAttendances.length
                : 0
            }
          }),

          // Fiscal appointments
          fiscalAppointments: (fiscalAppointments || []).map((appointment: unknown) => {
            const createdDate = new Date(appointment.created_at)

            return {
              appointmentId: appointment.id,
              protocol: appointment.protocol,
              clientName: appointment.client_name,
              clientEmail: appointment.client_email,
              serviceType: appointment.service_type,
              serviceTitle: appointment.service_title,
              status: appointment.status,
              urgencyLevel: appointment.urgency_level,
              createdAt: createdDate.toISOString(),
              createdYear: createdDate.getFullYear(),
              createdMonth: createdDate.getMonth() + 1,
              monthYear: `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`,

              // Flags
              isUrgent: appointment.urgency_level === 'URGENTE' ? 1 : 0,
              isCompleted: appointment.status === 'CONCLUIDO' ? 1 : 0,
              isPending: appointment.status === 'PENDENTE' ? 1 : 0
            }
          }),

          // Chat conversations
          chatConversations: (chatConversations || []).slice(0, 1000).map((conversation: unknown) => {
            const createdDate = new Date(conversation.created_at)

            return {
              conversationId: conversation.id,
              studentId: conversation.student_id,
              status: conversation.status,
              hasUnreadMessages: conversation.has_unread_messages ? 1 : 0,
              createdAt: createdDate.toISOString(),
              createdYear: createdDate.getFullYear(),
              createdMonth: createdDate.getMonth() + 1,
              monthYear: `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
            }
          })
        }
        break

      case 'powerbi-flat':
        // Flat dataset optimized for Power BI with all data in one table
        console.log('📊 Generating flat Power BI dataset...')

        let flatQuery = client
          .from('attendances')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10000) // Limit for performance

        if (startDateISO) flatQuery = flatQuery.gte('created_at', startDateISO)
        if (endDateISO) flatQuery = flatQuery.lte('created_at', endDateISO)

        const { data: flatAttendances } = await flatQuery

        data = (flatAttendances || []).map((attendance: unknown) => {
          const createdDate = new Date(attendance.created_at)
          const scheduledDate = attendance.scheduled_date ? new Date(attendance.scheduled_date) : null

          return {
            // IDs
            attendance_id: attendance.id,
            student_id: attendance.student_id,
            protocol: attendance.protocol || `ATD-${attendance.id}`,

            // Core Data
            status: attendance.status,
            service_type: attendance.service_type,
            client_category: attendance.client_category,
            client_age: attendance.client_age,
            client_gender: attendance.client_gender,
            duration_minutes: attendance.duration_minutes || 0,
            satisfaction_rating: attendance.client_satisfaction_rating || 0,

            // Temporal Fields
            created_at: createdDate.toISOString(),
            scheduled_at: scheduledDate?.toISOString() || null,
            year: createdDate.getFullYear(),
            month: createdDate.getMonth() + 1,
            quarter: Math.ceil((createdDate.getMonth() + 1) / 3),
            week: Math.ceil(createdDate.getDate() / 7),
            day_of_week: createdDate.getDay(),
            day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()],
            month_year: `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`,

            // Boolean Flags (as 0/1 for Power BI)
            is_completed: attendance.status === 'CONCLUIDO' ? 1 : 0,
            is_pending: ['AGENDADO', 'EM_ANDAMENTO'].includes(attendance.status) ? 1 : 0,
            is_cancelled: attendance.status === 'CANCELADO' ? 1 : 0,
            has_rating: attendance.client_satisfaction_rating ? 1 : 0,
            is_high_satisfaction: (attendance.client_satisfaction_rating || 0) >= 4 ? 1 : 0,
            is_long_duration: (attendance.duration_minutes || 0) > 60 ? 1 : 0
          }
        })

        filename = `powerbi-flat-${new Date().toISOString().split('T')[0]}`
        break

      default:
        return NextResponse.json({ error: 'Tipo de relatório não suportado' }, { status: 400 })
    }

    // Gerar resposta baseada no formato
    if (format === 'csv') {
      // Converter para CSV
      let csvContent = ''
      
      if (type === 'powerbi-dataset' && Array.isArray(data)) {
        // Header
        const headers = Object.keys(data[0] || {})
        csvContent = headers.join(',') + '\n'
        
        // Rows
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header]
            // Escapar aspas e adicionar aspas se necessário
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          csvContent += values.join(',') + '\n'
        })
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    }

    if (format === 'xlsx') {
      // Gerar arquivo Excel (XLSX)
      let worksheetData: unknown[] = []
      
      if (type === 'powerbi-dataset' && Array.isArray(data)) {
        worksheetData = data
      } else if (type === 'general' && data.demandas) {
        // Para relatório geral, usar dados das demandas como principal
        worksheetData = data.demandas
      } else if (Array.isArray(data)) {
        worksheetData = data
      } else {
        // Se não for array, converter objeto em array de uma linha
        worksheetData = [data]
      }

      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      
      // Adicionar o worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, type === 'general' ? 'Relatório Geral' : 'Dados')
      
      // Se for relatório geral, adicionar planilhas adicionais
      if (type === 'general' && data.usuarios && data.servicos && data.atendimentos) {
        const worksheetUsuarios = XLSX.utils.json_to_sheet(data.usuarios)
        const worksheetServicos = XLSX.utils.json_to_sheet(data.servicos)
        const worksheetAtendimentos = XLSX.utils.json_to_sheet(data.atendimentos)
        
        XLSX.utils.book_append_sheet(workbook, worksheetUsuarios, 'Usuários')
        XLSX.utils.book_append_sheet(workbook, worksheetServicos, 'Serviços')
        XLSX.utils.book_append_sheet(workbook, worksheetAtendimentos, 'Atendimentos')
      }

      // Converter para buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`
        }
      })
    }

    if (format === 'excel') {
      // Para Excel, retornar JSON com instruções para conversão no frontend
      return NextResponse.json({
        success: true,
        data,
        format: 'excel',
        filename: `${filename}.xlsx`,
        instructions: 'Use a biblioteca XLSX para converter este JSON em Excel no frontend'
      })
    }

    // Formato padrão: JSON
    return NextResponse.json({
      success: true,
      data,
      type,
      format,
      generatedAt: new Date().toISOString(),
      totalRecords: Array.isArray(data) ? data.length : Object.keys(data).length,
      filename: `${filename}.json`
    })

  } catch (error) {
    console.error('Erro ao gerar relatório Power BI:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
