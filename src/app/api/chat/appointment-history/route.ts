import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'user_id é obrigatório' },
        { status: 400 }
      )
    }

    // Mock data para desenvolvimento - em produção, buscar do banco de dados
    const mockAppointments = [
      {
        id: '1',
        user_id: '1',
        service_title: 'Consultoria em Imposto de Renda',
        service_type: 'IRPF',
        appointment_date: '2024-01-15T14:00:00Z',
        status: 'completed',
        coordinator_name: 'Prof. Maria Santos',
        student_name: 'Ana Costa',
        notes: 'Declaração completa com dependentes',
        transferred_from: null,
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        user_id: '1',
        service_title: 'Orientação MEI',
        service_type: 'MEI',
        appointment_date: '2024-02-20T15:30:00Z',
        status: 'confirmed',
        coordinator_name: 'Prof. Maria Santos',
        student_name: 'Carlos Lima',
        notes: 'Primeira consulta sobre abertura de MEI',
        transferred_from: 'Ana Costa',
        created_at: '2024-02-15T09:30:00Z'
      },
      {
        id: '3',
        user_id: '2',
        service_title: 'Consultoria ICMS',
        service_type: 'ICMS',
        appointment_date: '2024-03-10T10:00:00Z',
        status: 'scheduled',
        coordinator_name: 'Prof. Carlos Lima',
        student_name: 'Pedro Alves',
        notes: 'Dúvidas sobre recolhimento de ICMS',
        transferred_from: null,
        created_at: '2024-03-05T14:20:00Z'
      },
      {
        id: '4',
        user_id: '3',
        service_title: 'Planejamento Tributário',
        service_type: 'PLANEJAMENTO',
        appointment_date: null,
        status: 'scheduled',
        coordinator_name: 'Prof. Ana Silva',
        student_name: 'Lucas Santos',
        notes: 'Reunião inicial para entender necessidades',
        transferred_from: null,
        created_at: '2024-03-12T16:45:00Z'
      },
      {
        id: '5',
        user_id: '1',
        service_title: 'Revisão de Declaração',
        service_type: 'IRPF',
        appointment_date: '2024-01-25T11:00:00Z',
        status: 'completed',
        coordinator_name: 'Prof. Maria Santos',
        student_name: 'Ana Costa',
        notes: 'Revisão e correções na declaração de 2023',
        transferred_from: null,
        created_at: '2024-01-20T13:15:00Z'
      }
    ]

    // Filtrar por user_id
    const userAppointments = mockAppointments.filter(apt => apt.user_id === userId)

    // Ordenar por data de criação (mais recente primeiro)
    const sortedAppointments = userAppointments.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      appointments: sortedAppointments,
      total: sortedAppointments.length
    })

  } catch (error) {
    console.error('Erro ao carregar histórico de agendamentos:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}
