// Sistema de Notificações Avançado por Email - NAF Contábil
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

interface NotificationRequest {
  type: 'schedule_confirmation' | 'attendance_validation' | 'demand_update' | 'reminder' | 'batch_reminder'
  recipients?: string[]
  data: unknown
}

// Enviar notificação individual
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json() as NotificationRequest
    const { type, data } = body

    switch (type) {
      case 'schedule_confirmation':
        const confirmationSent = await emailService.sendNotification({
          type: 'schedule_confirmation',
          recipient: {
            name: data.clientName,
            email: data.clientEmail
          },
          data: {
            protocol: data.protocol,
            clientName: data.clientName,
            serviceName: data.serviceName,
            date: new Date(data.date).toLocaleDateString('pt-BR'),
            time: data.time,
            location: data.location,
            requiredDocs: data.requiredDocs || []
          }
        })

        return NextResponse.json({ 
          success: confirmationSent,
          message: confirmationSent ? 'Confirmação enviada' : 'Erro ao enviar confirmação'
        })

      case 'attendance_validation':
        const validationSent = await emailService.sendNotification({
          type: 'attendance_validation',
          recipient: {
            name: data.studentName,
            email: data.studentEmail
          },
          data: {
            studentName: data.studentName,
            protocol: data.protocol,
            clientName: data.clientName,
            serviceType: data.serviceType,
            hours: data.hours,
            date: new Date(data.date).toLocaleDateString('pt-BR'),
            validatedBy: data.validatedBy,
            feedback: data.feedback,
            totalHours: data.totalHours,
            totalAttendances: data.totalAttendances,
            level: data.level
          }
        })

        return NextResponse.json({ 
          success: validationSent,
          message: validationSent ? 'Notificação de validação enviada' : 'Erro ao enviar notificação'
        })

      case 'reminder':
        const reminderSent = await emailService.sendNotification({
          type: 'reminder',
          recipient: {
            name: data.clientName,
            email: data.clientEmail
          },
          data: {
            protocol: data.protocol,
            clientName: data.clientName,
            serviceName: data.serviceName,
            date: new Date(data.date).toLocaleDateString('pt-BR'),
            time: data.time,
            location: data.location
          }
        })

        return NextResponse.json({ 
          success: reminderSent,
          message: reminderSent ? 'Lembrete enviado' : 'Erro ao enviar lembrete'
        })

      case 'batch_reminder':
        const appointments = data.appointments || []
        let successCount = 0
        
        for (const appointment of appointments) {
          const sent = await emailService.sendNotification({
            type: 'reminder',
            recipient: {
              name: appointment.clientName,
              email: appointment.clientEmail
            },
            data: appointment
          })
          
          if (sent) successCount++
          
          // Delay para evitar spam
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return NextResponse.json({ 
          success: true,
          message: `${successCount}/${appointments.length} lembretes enviados`
        })

      default:
        return NextResponse.json({ error: 'Tipo de notificação inválido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro no sistema de notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Obter histórico de notificações
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Simulação de histórico de notificações
    const notifications = [
      {
        id: '1',
        type: 'EMAIL',
        title: 'Confirmação de Agendamento',
        message: 'Agendamento NAF-2025-001 confirmado',
        recipientEmail: 'cliente@exemplo.com',
        status: 'SENT',
        createdAt: new Date().toISOString(),
        metadata: '{}'
      },
      {
        id: '2',
        type: 'EMAIL',
        title: 'Atendimento Validado',
        message: 'Atendimento ATD-2025-002 validado',
        recipientEmail: 'estudante@naf.teste',
        status: 'SENT',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: '{}'
      }
    ]

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: notifications.length,
        limit: 50,
        offset: 0,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Envio automático de lembretes (para cron job)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Simulação de agendamentos para amanhã
    const tomorrowAppointments = [
      {
        id: '1',
        protocol: 'AGD-2025-001',
        clientName: 'João Silva',
        clientEmail: 'joao@exemplo.com',
        serviceName: 'Cadastro CPF',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        time: '09:00',
        location: 'Sala 101'
      },
      {
        id: '2',
        protocol: 'AGD-2025-002',
        clientName: 'Maria Santos',
        clientEmail: 'maria@exemplo.com',
        serviceName: 'Orientação MEI',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        time: '14:00',
        location: 'Sala 102'
      }
    ]

    let remindersSent = 0

    for (const appointment of tomorrowAppointments) {
      try {
        const sent = await emailService.sendNotification({
          type: 'reminder',
          recipient: {
            name: appointment.clientName,
            email: appointment.clientEmail
          },
          data: appointment
        })

        if (sent) {
          remindersSent++
        }

        // Delay entre envios
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Erro ao enviar lembrete para ${appointment.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${remindersSent} lembretes automáticos enviados`,
      data: {
        appointmentsFound: tomorrowAppointments.length,
        remindersSent
      }
    })

  } catch (error) {
    console.error('Erro no envio automático de lembretes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
