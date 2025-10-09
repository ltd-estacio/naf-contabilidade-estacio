import { NextRequest, NextResponse } from 'next/server'

interface Attendance {
  id: string
  protocol: string
  studentName: string
  studentEmail: string
  clientName: string
  clientDocument: string
  serviceType: string
  status: string
  date: string
  time: string
  duration: number
  description: string
  isValidated: boolean
  validatedBy?: string
  validatedAt?: string
  createdAt: string
}


export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Simular dados para funcionamento sem autenticação por enquanto
    const userRole = 'COORDINATOR'

    // Dados simulados de atendimentos baseados no papel do usuário
    let attendances: Attendance[] = []

    if (userRole === 'COORDINATOR') {
      attendances = [
      ]
    } else if (userRole === 'TEACHER') {
      attendances = []
    } else if (userRole === 'STUDENT') {
      attendances = []
    } else {
      // Usuário comum - não vê atendimentos internos
      attendances = []
    }

    // Aplicar filtros se fornecidos
    if (status) {
      attendances = attendances.filter(att => att.status === status)
    }

    return NextResponse.json({
      attendances,
      total: attendances.length,
      success: true,
      userRole
    })
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', attendances: [], total: 0 },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validações básicas
    if (!data.clientName || !data.serviceType || !data.description) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Dados reais serão inseridos quando implementado o banco de dados
    const newAttendance: Attendance = {
      id: Date.now().toString(),
      protocol: `ATD-2025-${String(Date.now()).slice(-4)}`,
      studentName: 'Sistema em Desenvolvimento',
      studentEmail: 'sistema@naf.teste',
      clientName: data.clientName,
      clientDocument: data.clientDocument || '',
      serviceType: data.serviceType,
      status: 'em_andamento',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      duration: data.duration || 60,
      description: data.description,
      isValidated: false,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Atendimento registrado com sucesso',
      attendance: newAttendance,
      success: true
    })
  } catch (error) {
    console.error('Erro ao criar atendimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, status, validatedBy } = data

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      )
    }

    // Simular atualização do atendimento
    const updatedAttendance = {
      id,
      status,
      validatedBy: validatedBy || 'Usuário Teste',
      validatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Atendimento atualizado com sucesso',
      attendance: updatedAttendance,
      success: true
    })
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
