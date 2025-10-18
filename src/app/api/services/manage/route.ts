import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Listar todos os serviços

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const where: unknown = {}
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { theme: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { demands: true }
        }
      }
    })
    
    // Agrupar por categoria
    const servicesByCategory = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push({
        ...service,
        demandCount: service._count.demands
      })
      return acc
    }, {} as Record<string, unknown[]>)
    
    return NextResponse.json({
      services: servicesByCategory,
      total: services.length,
      categories: Object.keys(servicesByCategory)
    })
    
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['COORDINATOR', 'TEACHER'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { 
      name, 
      description, 
      category, 
      theme,
      requirements, 
      estimatedDuration,
      estimatedTime, 
      isActive = true 
    } = body
    
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, description, category' },
        { status: 400 }
      )
    }
    
    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        theme: theme || null,
        requirements: requirements || null,
        estimatedDuration: estimatedDuration || null,
        estimatedTime: estimatedTime || null,
        isActive
      }
    })
    
    return NextResponse.json(service, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar serviço
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['COORDINATOR', 'TEACHER'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }
    
    const service = await prisma.service.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(service)
    
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover serviço
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'COORDINATOR') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }
    
    await prisma.service.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Serviço removido com sucesso' })
    
  } catch (error) {
    console.error('Erro ao remover serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
