import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  userType: z.enum(['student', 'teacher', 'coordinator']).default('student'), // Mudança para userType
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = registerSchema.parse(body)
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    // Converter userType para role do banco
    const roleMapping = {
      'student': 'STUDENT',
      'teacher': 'TEACHER', 
      'coordinator': 'COORDINATOR'
    } as const
    
    const dbRole = roleMapping[validatedData.userType] || 'STUDENT'
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        cpf: validatedData.cpf,
        role: dbRole,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
