import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'demand_confirmation': {
        const { demandId } = data
        
        // Buscar dados da demanda
        const demand = await prisma.demand.findUnique({
          where: { id: demandId },
          include: {
            user: true,
            service: true
          }
        })

        if (!demand) {
          return NextResponse.json(
            { error: 'Demanda não encontrada' },
            { status: 404 }
          )
        }

        const emailSent = await emailService.sendDemandConfirmation({
          userName: demand.user?.name || 'Usuário',
          userEmail: demand.user.email,
          serviceName: demand.service.name,
          protocolNumber: demand.protocolNumber,
          description: demand.description,
          estimatedTime: demand.service.estimatedDuration || 30
        })

        return NextResponse.json({ 
          success: emailSent,
          message: emailSent ? 'Email enviado com sucesso' : 'Falha ao enviar email'
        })
      }

      case 'attendance_notification': {
        const { attendanceId } = data
        
        // Buscar dados do atendimento
        const attendance = await prisma.attendance.findUnique({
          where: { id: attendanceId },
          include: {
            user: true
          }
        })

        if (!attendance) {
          return NextResponse.json(
            { error: 'Atendimento não encontrado' },
            { status: 404 }
          )
        }

        const emailSent = await emailService.sendAttendanceNotification({
          userName: attendance.user?.name || 'Usuário',
          userEmail: attendance.user?.email || '',
          attendanceDescription: attendance.description || 'Atendimento',
          hours: attendance.hours,
          isValidated: attendance.isValidated,
          validationNotes: attendance.validationNotes || 'Sem observações'
        })

        return NextResponse.json({ 
          success: emailSent,
          message: emailSent ? 'Email enviado com sucesso' : 'Falha ao enviar email'
        })
      }

      case 'welcome': {
        const { userId } = data
        
        // Buscar dados do usuário
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
          )
        }

        const emailSent = await emailService.sendWelcomeEmail(
          user?.name || 'Usuário',
          user.email,
          user.role
        )

        return NextResponse.json({ 
          success: emailSent,
          message: emailSent ? 'Email enviado com sucesso' : 'Falha ao enviar email'
        })
      }

      case 'custom': {
        const { to, subject, html, text } = data
        
        const emailSent = await emailService.sendEmail({
          to,
          subject,
          html,
          text
        })

        return NextResponse.json({ 
          success: emailSent,
          message: emailSent ? 'Email enviado com sucesso' : 'Falha ao enviar email'
        })
      }

      default:
        return NextResponse.json(
          { error: 'Tipo de email não suportado' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para testar configuração de email
export async function GET() {
  try {
    const testEmailSent = await emailService.sendEmail({
      to: 'teste@gmail.com',
      subject: 'Teste de Configuração NAF',
      html: `
        <h2>🧪 Teste de Email NAF</h2>
        <p>Se você recebeu este email, a configuração está funcionando corretamente!</p>
        <p>Sistema: <strong>NAF - Núcleo de Apoio Contábil Fiscal</strong></p>
        <p>Data/Hora: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
      `
    })

    return NextResponse.json({
      success: testEmailSent,
      message: testEmailSent 
        ? 'Configuração de email testada com sucesso!' 
        : 'Falha no teste de configuração de email',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro no teste de email:', error)
    return NextResponse.json(
      { error: 'Erro ao testar configuração de email' },
      { status: 500 }
    )
  }
}
