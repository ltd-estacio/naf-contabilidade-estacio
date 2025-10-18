import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['COORDINATOR', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'all'

    // Dados para Power BI Desktop
    const powerBIData = {
      metadata: {
        title: 'NAF Contábil - Dados para Power BI',
        description: 'Dataset completo do sistema NAF para análise no Power BI Desktop',
        lastUpdate: new Date().toISOString(),
        version: '1.0',
        endpoints: {
          users: `${process.env.NEXTAUTH_URL}/api/powerbi/connect?endpoint=users`,
          services: `${process.env.NEXTAUTH_URL}/api/powerbi/connect?endpoint=services`,
          demands: `${process.env.NEXTAUTH_URL}/api/powerbi/connect?endpoint=demands`,
          attendances: `${process.env.NEXTAUTH_URL}/api/powerbi/connect?endpoint=attendances`,
          stats: `${process.env.NEXTAUTH_URL}/api/powerbi/connect?endpoint=stats`
        }
      }
    }

    switch (endpoint) {
      case 'users':
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
            _count: {
              select: {
                demands: true,
                attendances: true
              }
            }
          }
        })
        
        return NextResponse.json({
          data: users.map(user => ({
            ID: user.id,
            Nome: user.name,
            Email: user.email,
            Papel: user.role,
            Telefone: user.phone || 'N/A',
            DataCadastro: user.createdAt.toISOString().split('T')[0],
            TotalDemandas: user._count.demands,
            TotalAtendimentos: user._count.attendances,
            MesAno: user.createdAt.toISOString().substring(0, 7) // YYYY-MM
          }))
        })

      case 'services':
        const services = await prisma.service.findMany({
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            estimatedDuration: true,
            isActive: true,
            _count: {
              select: {
                demands: true
              }
            }
          }
        })
        
        return NextResponse.json({
          data: services.map(service => ({
            ID: service.id,
            Nome: service.name,
            Categoria: service.category,
            Descricao: service.description || 'N/A',
            DuracaoEstimada: service.estimatedDuration,
            Ativo: service.isActive,
            TotalDemandas: service._count.demands,
            PopularidadeScore: service._count.demands * (service.isActive ? 1 : 0.5)
          }))
        })

      case 'demands':
        const demands = await prisma.demand.findMany({
          include: {
            user: {
              select: { name: true, email: true, role: true }
            },
            service: {
              select: { name: true, category: true }
            }
          }
        })
        
        return NextResponse.json({
          data: demands.map(demand => ({
            ID: demand.id,
            Protocolo: demand.protocolNumber,
            Titulo: demand.title || 'N/A',
            Status: demand.status,
            ClienteNome: demand.clientName,
            ClienteEmail: demand.clientEmail || 'N/A',
            ClienteCPF: demand.clientCpf || 'N/A',
            ServicoNome: demand.service?.name || 'N/A',
            ServicoCategoria: demand.service?.category || 'N/A',
            UsuarioNome: demand.user?.name || 'N/A',
            UsuarioPapel: demand.user?.role || 'N/A',
            DataCriacao: demand.createdAt.toISOString().split('T')[0],
            DataAtualizacao: demand.updatedAt.toISOString().split('T')[0],
            MesAno: demand.createdAt.toISOString().substring(0, 7),
            DiaSemana: new Date(demand.createdAt).toLocaleDateString('pt-BR', { weekday: 'long' }),
            Trimestre: `Q${Math.ceil((new Date(demand.createdAt).getMonth() + 1) / 3)}-${new Date(demand.createdAt).getFullYear()}`
          }))
        })

      case 'attendances':
        const attendances = await prisma.attendance.findMany({
          include: {
            user: {
              select: { name: true, email: true, role: true }
            },
            demand: {
              include: {
                service: {
                  select: { name: true, category: true }
                }
              }
            }
          }
        })
        
        return NextResponse.json({
          data: attendances.map(attendance => ({
            ID: attendance.id,
            Protocolo: attendance.protocol,
            Status: attendance.status,
            Categoria: attendance.category,
            Horas: attendance.hours || 0,
            DataAgendamento: attendance.scheduledAt?.toISOString().split('T')[0] || 'N/A',
            DataConclusao: attendance.completedAt?.toISOString().split('T')[0] || 'N/A',
            UsuarioNome: attendance.user?.name || 'N/A',
            UsuarioPapel: attendance.user?.role || 'N/A',
            ServicoNome: attendance.demand?.service?.name || 'N/A',
            ServicoCategoria: attendance.demand?.service?.category || 'N/A',
            MesAno: attendance.scheduledAt?.toISOString().substring(0, 7) || 'N/A',
            DiaSemana: attendance.scheduledAt ? 
              new Date(attendance.scheduledAt).toLocaleDateString('pt-BR', { weekday: 'long' }) : 'N/A',
            Eficiencia: attendance.status === 'COMPLETED' ? 100 : 
                       attendance.status === 'IN_PROGRESS' ? 50 : 0
          }))
        })

      case 'stats':
        const [totalUsers, totalServices, totalDemands, totalAttendances] = await Promise.all([
          prisma.user.count(),
          prisma.service.count({ where: { isActive: true } }),
          prisma.demand.count(),
          prisma.attendance.count()
        ])

        const [pendingDemands, completedAttendances] = await Promise.all([
          prisma.demand.count({ where: { status: 'PENDING' } }),
          prisma.attendance.count({ where: { status: 'COMPLETED' } })
        ])

        const completionRate = totalAttendances > 0 ? 
          Math.round((completedAttendances / totalAttendances) * 100) : 0

        // Dados mensais dos últimos 12 meses
        const monthlyData = []
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          const [monthDemands, monthAttendances] = await Promise.all([
            prisma.demand.count({
              where: {
                createdAt: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              }
            }),
            prisma.attendance.count({
              where: {
                scheduledAt: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              }
            })
          ])

          monthlyData.push({
            MesAno: date.toISOString().substring(0, 7),
            Mes: date.toLocaleDateString('pt-BR', { month: 'long' }),
            Ano: date.getFullYear(),
            Demandas: monthDemands,
            Atendimentos: monthAttendances,
            Eficiencia: monthDemands > 0 ? Math.round((monthAttendances / monthDemands) * 100) : 0
          })
        }

        return NextResponse.json({
          data: {
            resumo: [{
              TotalUsuarios: totalUsers,
              TotalServicos: totalServices,
              TotalDemandas: totalDemands,
              TotalAtendimentos: totalAttendances,
              DemandasPendentes: pendingDemands,
              AtendimentosConcluidos: completedAttendances,
              TaxaConclusao: completionRate,
              DataUltimaAtualizacao: new Date().toISOString().split('T')[0]
            }],
            evolucaoMensal: monthlyData
          }
        })

      default:
        return NextResponse.json({
          ...powerBIData,
          message: 'Use os endpoints específicos para obter dados estruturados para Power BI'
        })
    }

  } catch (error) {
    console.error('Erro na API PowerBI Connect:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
