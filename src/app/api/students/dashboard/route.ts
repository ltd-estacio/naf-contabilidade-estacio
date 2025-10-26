import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    // Para testes, aceitar um token específico
    if (token === 'test-token-123') {
      return {
        studentId: 'test-student-123',
        email: 'student@test.com',
        role: 'student'
      }
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId || decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    // Dados mock para o estudante logado
    const mockData = {
      profile: {
        id: studentAuth.studentId,
        name: 'João Silva dos Santos',
        email: studentAuth.email,
        phone: '(11) 99999-9999',
        course: 'Ciências Contábeis',
        semester: '7º Semestre',
        registrationNumber: '2021123456',
        specializations: ['Contabilidade Fiscal', 'Contabilidade Tributária'],
        status: 'ATIVO',
        document: '123.456.789-00',
        university: 'Universidade Estácio de Sá',
        availableHours: ['08:00-12:00', '14:00-18:00'],
        lastLogin: new Date().toISOString(),
        createdAt: '2021-02-15T08:00:00Z'
      },
      stats: {
        totalAttendances: 25,
        completedAttendances: 22,
        avgRating: 4.7,
        completedTrainings: 8,
        totalTrainings: 10,
        avgPerformanceScore: 8.5,
        successRate: 88
      },
      attendances: [
        {
          id: '1',
          protocol: 'ATD-001',
          clientName: 'Maria Santos Silva',
          clientCategory: 'MEI',
          serviceType: 'Orientação Fiscal',
          scheduledDate: '2024-01-15',
          scheduledTime: '09:00',
          status: 'CONCLUIDO',
          urgency: 'NORMAL',
          isOnline: false,
          duration: 60,
          clientRating: 5,
          supervisorValidation: true,
          completedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          protocol: 'ATD-002',
          clientName: 'José Oliveira Pereira',
          clientCategory: 'PF',
          serviceType: 'Imposto de Renda',
          scheduledDate: '2024-01-16',
          scheduledTime: '14:00',
          status: 'EM_ANDAMENTO',
          urgency: 'ALTA',
          isOnline: true,
          duration: 90,
          clientRating: null,
          supervisorValidation: false,
          completedAt: null
        },
        {
          id: '3',
          protocol: 'ATD-003',
          clientName: 'Ana Costa Lima',
          clientCategory: 'ME',
          serviceType: 'Consultoria Contábil',
          scheduledDate: '2024-01-17',
          scheduledTime: '10:30',
          status: 'CONCLUIDO',
          urgency: 'NORMAL',
          isOnline: false,
          duration: 75,
          clientRating: 4,
          supervisorValidation: true,
          completedAt: '2024-01-17T11:45:00Z'
        }
      ],
      trainings: [
        {
          id: '1',
          training: {
            title: 'Fundamentos da Contabilidade Fiscal',
            difficulty: 'BÁSICO',
            duration_minutes: 120
          },
          isCompleted: true,
          score: 9.2,
          startedAt: '2024-01-10T08:00:00Z',
          completedAt: '2024-01-12T17:00:00Z',
          timeSpent: 180,
          attempts: 1
        },
        {
          id: '2',
          training: {
            title: 'Legislação Tributária Avançada',
            difficulty: 'AVANÇADO',
            duration_minutes: 240
          },
          isCompleted: false,
          score: null,
          startedAt: '2024-01-14T08:00:00Z',
          completedAt: null,
          timeSpent: 60,
          attempts: 1
        },
        {
          id: '3',
          training: {
            title: 'Contabilidade Digital',
            difficulty: 'INTERMEDIÁRIO',
            duration_minutes: 180
          },
          isCompleted: true,
          score: 8.5,
          startedAt: '2024-01-08T09:00:00Z',
          completedAt: '2024-01-10T16:30:00Z',
          timeSpent: 200,
          attempts: 2
        }
      ],
      recentEvaluations: [
        {
          id: '1',
          evaluation_date: '2024-01-15',
          technical_score: 9,
          communication_score: 8,
          punctuality_score: 10,
          professionalism_score: 9,
          overall_score: 9,
          feedback: 'Excelente trabalho no atendimento ao cliente. Demonstrou conhecimento técnico sólido.',
          strengths: ['Conhecimento técnico', 'Comunicação clara', 'Pontualidade'],
          improvement_areas: ['Agilidade na documentação', 'Uso de ferramentas digitais']
        },
        {
          id: '2',
          evaluation_date: '2024-01-17',
          technical_score: 8,
          communication_score: 9,
          punctuality_score: 9,
          professionalism_score: 8,
          overall_score: 8.5,
          feedback: 'Boa evolução na comunicação com o cliente. Continue aprimorando o conhecimento técnico.',
          strengths: ['Empatia', 'Organização', 'Postura profissional'],
          improvement_areas: ['Conhecimento de normativas específicas', 'Velocidade de atendimento']
        }
      ]
    }

    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
