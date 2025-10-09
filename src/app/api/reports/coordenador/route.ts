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
    const format = searchParams.get('format') || 'json'
    const tipo = searchParams.get('tipo') || 'completo'

    // Buscar todos os dados necessários
    const [users, services, demands, attendances] = await Promise.all([
      prisma.user.findMany({
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          estimatedDuration: true,
          _count: {
            select: {
              demands: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.demand.findMany({
        include: {
          user: {
            select: { name: true, email: true, role: true }
          },
          service: {
            select: { name: true, category: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.attendance.findMany({
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
        },
        orderBy: { scheduledAt: 'desc' }
      })
    ])

    // Calcular estatísticas
    const stats = {
      totalUsuarios: users.length,
      totalServicos: services.length,
      totalDemandas: demands.length,
      totalAtendimentos: attendances.length,
      demandasPendentes: demands.filter(d => d.status === 'PENDING').length,
      atendimentosConcluidos: attendances.filter(a => a.status === 'COMPLETED').length,
      taxaConclusao: attendances.length > 0 ? 
        Math.round((attendances.filter(a => a.status === 'COMPLETED').length / attendances.length) * 100) : 0
    }

    // Dados por categoria
    const categorias: Record<string, number> = {}
    services.forEach(service => {
      categorias[service.category] = (categorias[service.category] || 0) + service._count.demands
    })

    // Dados por mês (últimos 6 meses)
    const hoje = new Date()
    const dadosMensais = []
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1)
      
      const demandasMes = demands.filter(d => 
        d.createdAt >= mes && d.createdAt < proximoMes
      ).length
      
      const atendimentosMes = attendances.filter(a => 
        a.scheduledAt && a.scheduledAt >= mes && a.scheduledAt < proximoMes
      ).length
      
      dadosMensais.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        demandas: demandasMes,
        atendimentos: atendimentosMes
      })
    }

    const relatorioCompleto = {
      geradoEm: new Date().toISOString(),
      geradoPor: session.user.name,
      periodo: `${dadosMensais[0]?.mes} - ${dadosMensais[dadosMensais.length - 1]?.mes}`,
      resumo: stats,
      dadosMensais,
      categorias,
      usuarios: users.map(user => ({
        nome: user.name,
        email: user.email,
        papel: user.role,
        telefone: user.phone || 'N/A',
        dataCadastro: user.createdAt.toLocaleDateString('pt-BR'),
        totalDemandas: user._count.demands,
        totalAtendimentos: user._count.attendances
      })),
      servicos: services.map(service => ({
        nome: service.name,
        categoria: service.category,
        duracaoEstimada: `${service.estimatedDuration} min`,
        totalDemandas: service._count.demands
      })),
      demandasRecentes: demands.slice(0, 10).map(demand => ({
        protocolo: demand.protocolNumber,
        titulo: demand.title || 'N/A',
        status: demand.status,
        cliente: demand.clientName,
        servico: demand.service?.name || 'N/A',
        categoria: demand.service?.category || 'N/A',
        dataCriacao: demand.createdAt.toLocaleDateString('pt-BR'),
        usuario: demand.user?.name || 'N/A'
      })),
      atendimentosRecentes: attendances.slice(0, 10).map(attendance => ({
        protocolo: attendance.protocol,
        status: attendance.status,
        categoria: attendance.category,
        horas: attendance.hours || 0,
        dataAgendamento: attendance.scheduledAt?.toLocaleDateString('pt-BR') || 'N/A',
        usuario: attendance.user?.name || 'N/A',
        servico: attendance.demand?.service?.name || 'N/A'
      }))
    }

    if (format === 'pdf-data') {
      // Retornar dados formatados para PDF
      return NextResponse.json({
        success: true,
        data: relatorioCompleto,
        tipo: 'pdf-ready'
      })
    }

    return NextResponse.json({
      success: true,
      data: relatorioCompleto,
      meta: {
        totalRegistros: users.length + services.length + demands.length + attendances.length,
        ultimaAtualizacao: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório do coordenador:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
