import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

// GET - Listar usuários com filtros

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const _status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Construir filtros
    const where: unknown = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              demands: true,
              attendances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Formatar dados
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalDemands: user._count.demands,
      totalAttendances: user._count.attendances,
      isActive: true // Assumindo que todos são ativos por padrão
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário logado é coordenador
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (currentUser?.role !== 'COORDINATOR') {
      return NextResponse.json({ 
        error: 'Apenas coordenadores podem criar usuários' 
      }, { status: 403 })
    }

    const { name, email, password, role, phone } = await request.json()

    // Validações
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        error: 'Nome, email, senha e tipo são obrigatórios'
      }, { status: 400 })
    }

    if (!['COORDINATOR', 'TEACHER', 'STUDENT'].includes(role)) {
      return NextResponse.json({
        error: 'Tipo de usuário inválido'
      }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'Email já está em uso'
      }, { status: 400 })
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, name, email, role, phone, password } = await request.json()

    if (!id) {
      return NextResponse.json({
        error: 'ID do usuário é obrigatório'
      }, { status: 400 })
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verificar permissões
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (currentUser?.role !== 'COORDINATOR' && currentUser?.id !== id) {
      return NextResponse.json({ 
        error: 'Sem permissão para editar este usuário' 
      }, { status: 403 })
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({
          error: 'Email já está em uso'
        }, { status: 400 })
      }
    }

    // Preparar dados para atualização
    const updateData: unknown = {}
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role && currentUser?.role === 'COORDINATOR') updateData.role = role
    if (phone !== undefined) updateData.phone = phone || null
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({
        error: 'ID do usuário é obrigatório'
      }, { status: 400 })
    }

    // Verificar permissões - apenas coordenadores podem excluir
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (currentUser?.role !== 'COORDINATOR') {
      return NextResponse.json({ 
        error: 'Apenas coordenadores podem excluir usuários' 
      }, { status: 403 })
    }

    // Não permitir auto-exclusão
    if (currentUser?.id === userId) {
      return NextResponse.json({
        error: 'Não é possível excluir sua própria conta'
      }, { status: 400 })
    }

    // Verificar se usuário existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            demands: true,
            attendances: true
          }
        }
      }
    })

    if (!userToDelete) {
      return NextResponse.json({
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verificar se usuário tem atividades associadas
    if (userToDelete._count.demands > 0 || userToDelete._count.attendances > 0) {
      return NextResponse.json({
        error: 'Não é possível excluir usuário com demandas ou atendimentos associados. Considere desativar o usuário.'
      }, { status: 400 })
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Usuário excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
