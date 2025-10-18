import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'


export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Permitir acesso sem autenticação para testes, mas com funcionalidade limitada
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceId = searchParams.get('serviceId')
    
    const whereClause: unknown = {}

    // Se há sessão, aplicar filtros baseados no role
    if (session?.user) {
      const userId = session.user.id
      const userRole = session.user.role

      if (userRole === 'STUDENT' || userRole === 'USER') {
        whereClause.userId = userId
      }
    }

    // Filtros adicionais
    if (status) {
      whereClause.status = status
    }
    if (serviceId) {
      whereClause.serviceId = serviceId
    }

    const demands = await prisma.demand.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        },
        service: {
          select: { name: true, category: true, estimatedDuration: true }
        },
        attendances: {
          select: { id: true, status: true, scheduledAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: session?.user ? undefined : 10 // Limitar a 10 se não autenticado
    })

    return NextResponse.json(demands)
  } catch (error) {
    console.error('Erro ao buscar demandas:', error)
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
    const { serviceId, description, priority, additionalInfo } = body

    if (!serviceId || !description) {
      return NextResponse.json(
        { error: 'Serviço e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: 'Serviço não encontrado ou inativo' },
        { status: 404 }
      )
    }

    // Gerar protocolo único
    const protocolNumber = `NAF${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const demand = await prisma.demand.create({
      data: {
        userId: session.user.id,
        serviceId,
        description,
        priority: priority || 'MEDIUM',
        additionalInfo: additionalInfo || '',
        protocolNumber,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        service: {
          select: { name: true, category: true, estimatedDuration: true }
        }
      }
    })

    // Enviar email de confirmação automaticamente
    try {
      await emailService.sendDemandConfirmation({
        userName: demand.user.name || '',
        userEmail: demand.user.email,
        serviceName: demand.service.name,
        protocolNumber: demand.protocolNumber,
        description: demand.description,
        estimatedTime: demand.service.estimatedDuration || undefined
      })
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError)
      // Não falhamos a criação da demanda se o email falhar
    }

    return NextResponse.json(demand, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar demanda:', error)
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
    const { id, status, notes, assignedTo } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID da demanda é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar permissões
    const demand = await prisma.demand.findUnique({
      where: { id }
    })

    if (!demand) {
      return NextResponse.json(
        { error: 'Demanda não encontrada' },
        { status: 404 }
      )
    }

    // Usuários só podem atualizar suas próprias demandas (descrição)
    // Professores e coordenadores podem atualizar status e notas
    const userRole = session.user.role
    const userId = session.user.id

    if (userRole === 'STUDENT' || userRole === 'USER') {
      if (demand.userId !== userId) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }
      // Usuários só podem adicionar informações, não mudar status
      const updatedDemand = await prisma.demand.update({
        where: { id },
        data: {
          additionalInfo: body.additionalInfo || demand.additionalInfo
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true, category: true } }
        }
      })
      return NextResponse.json(updatedDemand)
    }

    // Professores e coordenadores podem atualizar status
    const updateData: unknown = {}
    if (status) updateData.status = status
    if (notes) updateData.notes = notes
    if (assignedTo) updateData.assignedTo = assignedTo

    const updatedDemand = await prisma.demand.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true, category: true } }
      }
    })

    return NextResponse.json(updatedDemand)
  } catch (error) {
    console.error('Erro ao atualizar demanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
