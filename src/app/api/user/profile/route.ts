import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        address: true,
        role: true,
        createdAt: true,
        demands: {
          include: {
            service: true,
            attendances: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        lastDemand: user.demands[0] || null,
        totalDemands: user.demands.length,
        completedServices: user.demands.filter((d: unknown) => d.attendances.some((a: unknown) => a.status === 'COMPLETED')).length
      }
    })

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, phone, cpf, address } = data

    // Atualizar dados do usuário
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        cpf: cpf || undefined,
        address: address || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        address: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
