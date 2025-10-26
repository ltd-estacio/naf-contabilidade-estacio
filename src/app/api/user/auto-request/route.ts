import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { serviceId, additionalInfo, urgency } = data

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        demands: {
          include: {
            service: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        attendances: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar serviço solicitado
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Gerar protocolo único
    const protocol = `NAF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Criar nova demanda com dados automatizados
    const demand = await prisma.demand.create({
      data: {
        userId: user.id,
        serviceId: serviceId,
        description: `Solicitação automatizada para: ${service.name}`,
        status: 'PENDING',
        urgency: urgency || 'MEDIUM',
        protocol: protocol,
        protocolNumber: protocol,
        category: service.category,
        theme: service.theme || 'Geral',
        // Dados automatizados do usuário
        clientName: user.name || '',
        clientEmail: user.email,
        clientPhone: user.phone || '',
        clientCpf: user.cpf || '',
        clientAddress: user.address || '',
        additionalInfo: additionalInfo || ''
      },
      include: {
        service: true,
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Demanda criada automaticamente com sucesso',
      demand: {
        ...demand,
        autoFilled: {
          name: !!user.name,
          phone: !!user.phone,
          cpf: !!user.cpf,
          address: !!user.address
        }
      }
    })

  } catch (error) {
    console.error('Erro ao criar demanda automatizada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    // Buscar dados do usuário para pré-preenchimento
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        demands: {
          where: serviceId ? { serviceId } : undefined,
          include: {
            service: true,
            attendances: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        attendances: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar histórico de serviços similares
    const similarServices = serviceId ? await prisma.demand.findMany({
      where: {
        userId: user.id,
        serviceId: serviceId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] }
      },
      include: {
        service: true,
        attendances: true
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    }) : []

    return NextResponse.json({
      success: true,
      userData: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        cpf: user.cpf || '',
        address: user.address || ''
      },
      recentDemands: user.demands,
      similarServices,
      completionRate: {
        total: user.demands.length,
        completed: user.demands.filter((d: unknown) => d.status === 'COMPLETED').length,
        pending: user.demands.filter((d: unknown) => d.status === 'PENDING').length
      },
      autoFillCapability: {
        name: !!user.name,
        phone: !!user.phone,
        cpf: !!user.cpf,
        address: !!user.address,
        completionPercentage: Math.round(([user.name, user.phone, user.cpf, user.address].filter(Boolean).length / 4) * 100)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados para preenchimento automático:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
