import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    // Buscar agendamentos do banco de dados
    const whereClause: unknown = {}
    
    if (startDate && endDate) {
      whereClause.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Buscar atendimentos relacionados
    const attendances = await prisma.attendance.findMany({
      where: {
        scheduledAt: {
          gte: startDate ? new Date(startDate) : new Date(),
          lte: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        },
        demand: {
          include: {
            service: {
              select: { name: true, category: true, theme: true }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // Combinar agendamentos e atendimentos em um formato unificado
    const events = [
      ...schedules.map(schedule => ({
        id: schedule.id,
        type: 'schedule',
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        isOnline: schedule.isOnline,
        meetingUrl: schedule.meetingUrl,
        userName: schedule.user.name,
        userEmail: schedule.user.email,
        userRole: schedule.user.role,
        status: 'SCHEDULED',
        createdAt: schedule.createdAt
      })),
      ...attendances.map(attendance => ({
        id: attendance.id,
        type: 'attendance',
        title: `${attendance.demand?.service?.name || 'Atendimento'} - ${attendance.category}`,
        description: attendance.description,
        startTime: attendance.scheduledAt,
        endTime: attendance.scheduledAt ? new Date(attendance.scheduledAt.getTime() + (attendance.hours * 60 * 60 * 1000)) : null,
        location: null,
        isOnline: false,
        meetingUrl: null,
        userName: attendance.user.name,
        userEmail: attendance.user.email,
        userRole: attendance.user.role,
        status: attendance.status,
        protocol: attendance.protocol,
        category: attendance.category,
        theme: attendance.theme,
        hours: attendance.hours,
        isValidated: attendance.isValidated,
        serviceName: attendance.demand?.service?.name,
        serviceCategory: attendance.demand?.service?.category,
        createdAt: attendance.createdAt
      }))
    ]

    // Ordenar por data (filtrar eventos com startTime válido)
    events.sort((a, b) => {
      const dateA = new Date(a.startTime || 0).getTime()
      const dateB = new Date(b.startTime || 0).getTime()
      return dateA - dateB
    })

    return NextResponse.json({
      success: true,
      data: events,
      total: events.length
    })

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      isOnline,
      meetingUrl,
      type = 'schedule',
      serviceId,
      clientName,
      clientEmail,
      clientCpf,
      clientPhone
    } = body

    // Validações básicas
    if (!title || !startTime) {
      return NextResponse.json(
        { error: 'Título e data/hora são obrigatórios' },
        { status: 400 }
      )
    }

    if (type === 'schedule') {
      // Criar agendamento simples
      const schedule = await prisma.schedule.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
          location,
          isOnline: isOnline || false,
          meetingUrl,
          userId: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        data: schedule,
        message: 'Agendamento criado com sucesso!'
      })
    }
    
    if (type === 'attendance' && serviceId) {
      // Criar demanda e atendimento integrados
      const protocolNumber = `NAF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      // Criar demanda primeiro
      const demand = await prisma.demand.create({
        data: {
          protocolNumber,
          protocol: `AGENDA-${Date.now()}`,
          clientName: clientName || 'Cliente Agendamento',
          clientEmail: clientEmail || session.user.email!,
          clientCpf: clientCpf || '',
          clientPhone: clientPhone || '',
          serviceId,
          description: description || 'Agendamento via calendário',
          status: 'PENDING',
          priority: 'MEDIUM',
          userId: session.user.id
        }
      })

      // Criar atendimento vinculado
      const attendanceProtocol = `ATD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      const attendance = await prisma.attendance.create({
        data: {
          protocol: attendanceProtocol,
          demandId: demand.id,
          userId: session.user.id,
          category: 'Agendamento',
          theme: title,
          description: description || 'Atendimento agendado via calendário',
          hours: endTime ? 
            Math.abs(new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60) : 
            1.0,
          scheduledAt: new Date(startTime),
          status: 'SCHEDULED',
          isValidated: false
        }
      })

      // Criar agendamento também
      const schedule = await prisma.schedule.create({
        data: {
          title: `${title} - ${attendanceProtocol}`,
          description: `Atendimento: ${description}`,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
          location,
          isOnline: isOnline || false,
          meetingUrl,
          userId: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          demand,
          attendance,
          schedule
        },
        message: 'Agendamento completo criado com sucesso!'
      })
    }

    return NextResponse.json(
      { error: 'Tipo de agendamento inválido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type, ...updateData } = body

    if (type === 'schedule') {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          ...updateData,
          startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
          endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        }
      })

      return NextResponse.json({
        success: true,
        data: schedule,
        message: 'Agendamento atualizado com sucesso!'
      })
    }

    if (type === 'attendance') {
      const attendance = await prisma.attendance.update({
        where: { id },
        data: {
          ...updateData,
          scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : undefined,
        }
      })

      return NextResponse.json({
        success: true,
        data: attendance,
        message: 'Atendimento atualizado com sucesso!'
      })
    }

    return NextResponse.json(
      { error: 'Tipo inválido para atualização' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (type === 'schedule') {
      await prisma.schedule.delete({
        where: { id }
      })
    } else if (type === 'attendance') {
      await prisma.attendance.delete({
        where: { id }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Agendamento removido com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
