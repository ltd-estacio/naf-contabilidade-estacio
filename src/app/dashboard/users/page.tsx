'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Download,
  Search,
  FileText,
  Mail,
  Phone
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'COORDINATOR'
  createdAt: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'pending'
  attendances: number
  completedServices: number
  phone?: string
  document?: string
}

interface UserStats {
  total: number
  active: number
  newThisMonth: number
  attendancesThisMonth: number
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    newThisMonth: 0,
    attendancesThisMonth: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Simulação de dados - em produção viria da API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@naf.teste',
        role: 'STUDENT',
        createdAt: '2024-01-15',
        lastLogin: '2024-02-10',
        status: 'active',
        attendances: 3,
        completedServices: 2,
        phone: '(48) 99999-1111',
        document: '123.456.789-01'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@naf.teste',
        role: 'TEACHER',
        createdAt: '2024-01-10',
        lastLogin: '2024-02-11',
        status: 'active',
        attendances: 15,
        completedServices: 12,
        phone: '(48) 99999-2222',
        document: '987.654.321-02'
      },
      {
        id: '3',
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@naf.teste',
        role: 'COORDINATOR',
        createdAt: '2023-12-01',
        lastLogin: '2024-02-11',
        status: 'active',
        attendances: 50,
        completedServices: 30,
        phone: '(48) 99999-3333',
        document: '456.789.123-03'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@naf.teste',
        role: 'STUDENT',
        createdAt: '2024-02-01',
        lastLogin: '2024-02-05',
        status: 'active',
        attendances: 1,
        completedServices: 0,
        phone: '(48) 99999-4444',
        document: '789.123.456-04'
      },
      {
        id: '5',
        name: 'Pedro Ferreira',
        email: 'pedro.ferreira@naf.teste',
        role: 'STUDENT',
        createdAt: '2024-02-08',
        status: 'pending',
        attendances: 0,
        completedServices: 0,
        phone: '(48) 99999-5555',
        document: '321.654.987-05'
      }
    ]

    setUsers(mockUsers)
    setFilteredUsers(mockUsers)
    
    // Calcular estatísticas
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const newThisMonth = mockUsers.filter(user => {
      const userDate = new Date(user.createdAt)
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear
    }).length

    const attendancesThisMonth = mockUsers.reduce((sum, user) => {
      return sum + (user.lastLogin && new Date(user.lastLogin).getMonth() === currentMonth ? user.attendances : 0)
    }, 0)

    setStats({
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      newThisMonth,
      attendancesThisMonth
    })

    setLoading(false)
  }, [])

  // Filtrar usuários
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.document?.includes(searchTerm)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      STUDENT: { label: 'Aluno', variant: 'default' as const },
      TEACHER: { label: 'Professor', variant: 'secondary' as const },
      COORDINATOR: { label: 'Coordenador', variant: 'destructive' as const }
    }
    return roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'default' as const }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      inactive: { label: 'Inativo', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const }
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const }
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Função', 'Status', 'Data Cadastro', 'Último Login', 'Atendimentos', 'Serviços Completos', 'Telefone', 'Documento']
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      getRoleBadge(user.role).label,
      getStatusBadge(user.status).label,
      new Date(user.createdAt).toLocaleDateString('pt-BR'),
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
      user.attendances.toString(),
      user.completedServices.toString(),
      user.phone || '',
      user.document || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `usuarios_naf_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      users: filteredUsers,
      summary: {
        totalUsers: filteredUsers.length,
        byRole: {
          students: filteredUsers.filter(u => u.role === 'STUDENT').length,
          teachers: filteredUsers.filter(u => u.role === 'TEACHER').length,
          coordinators: filteredUsers.filter(u => u.role === 'COORDINATOR').length
        },
        byStatus: {
          active: filteredUsers.filter(u => u.status === 'active').length,
          inactive: filteredUsers.filter(u => u.status === 'inactive').length,
          pending: filteredUsers.filter(u => u.status === 'pending').length
        }
      }
    }

    const reportContent = `
RELATÓRIO DE USUÁRIOS NAF
Gerado em: ${new Date().toLocaleString('pt-BR')}

RESUMO EXECUTIVO:
- Total de usuários: ${reportData.summary.totalUsers}
- Usuários ativos: ${stats.active}
- Novos usuários este mês: ${stats.newThisMonth}
- Atendimentos este mês: ${stats.attendancesThisMonth}

DISTRIBUIÇÃO POR FUNÇÃO:
- Alunos: ${reportData.summary.byRole.students}
- Professores: ${reportData.summary.byRole.teachers}
- Coordenadores: ${reportData.summary.byRole.coordinators}

DISTRIBUIÇÃO POR STATUS:
- Ativos: ${reportData.summary.byStatus.active}
- Inativos: ${reportData.summary.byStatus.inactive}
- Pendentes: ${reportData.summary.byStatus.pending}

DETALHAMENTO DOS USUÁRIOS:
${filteredUsers.map(user => `
Nome: ${user.name}
Email: ${user.email}
Função: ${getRoleBadge(user.role).label}
Status: ${getStatusBadge(user.status).label}
Cadastro: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}
Último Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
Atendimentos: ${user.attendances}
Serviços Completos: ${user.completedServices}
Telefone: ${user.phone || 'Não informado'}
Documento: ${user.document || 'Não informado'}
`).join('\n---\n')}
    `

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio_usuarios_naf_${new Date().toISOString().split('T')[0]}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando dados dos usuários...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Controle e relatórios de todos os usuários do sistema NAF</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={generateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos os usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">Crescimento mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendancesThisMonth}</div>
            <p className="text-xs text-muted-foreground">Total de atendimentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="user-search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="user-search"
                  placeholder="Nome, email ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role-filter" className="text-sm font-medium">Função</label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="all">Todas as funções</option>
                <option value="STUDENT">Alunos</option>
                <option value="TEACHER">Professores</option>
                <option value="COORDINATOR">Coordenadores</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Resultados</span>
              <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                {filteredUsers.length} usuário(s) encontrado(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Função</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Cadastro</th>
                  <th className="text-left p-3 font-medium">Último Login</th>
                  <th className="text-left p-3 font-medium">Atendimentos</th>
                  <th className="text-left p-3 font-medium">Contato</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.document && (
                          <div className="text-sm text-gray-500">{user.document}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3">
                      <Badge variant={getRoleBadge(user.role).variant}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(user.status).variant}>
                        {getStatusBadge(user.status).label}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-sm">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </td>
                    <td className="p-3">
                      <div className="text-center">
                        <div className="font-medium">{user.attendances}</div>
                        <div className="text-xs text-gray-500">
                          {user.completedServices} completos
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {user.phone && (
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
