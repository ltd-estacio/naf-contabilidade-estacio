'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, Search, Plus, Edit, Trash2, Mail, Phone, 
  Calendar, Download, UserCheck, UserX,
  Crown, GraduationCap, BookOpen
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'COORDINATOR' | 'TEACHER' | 'STUDENT'
  phone?: string
  createdAt: string
  updatedAt?: string
  isActive: boolean
  totalDemands?: number
  totalAttendances?: number
  lastLogin?: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
  phone: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Carregar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        role: roleFilter,
        limit: '50'
      })
      
      const response = await fetch(`/api/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter])

  // Validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido'
    }
    
    if (!selectedUser && !formData.password.trim()) {
      errors.password = 'Senha é obrigatória'
    }
    
    if (!formData.role) {
      errors.role = 'Tipo de usuário é obrigatório'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Criar usuário
  const handleCreate = async () => {
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchUsers()
        setShowCreateDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        setFormErrors({ general: error.error || 'Erro ao criar usuário' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    } finally {
      setSubmitting(false)
    }
  }

  // Editar usuário
  const handleEdit = async () => {
    if (!validateForm() || !selectedUser) return
    
    try {
      setSubmitting(true)
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedUser.id })
      })
      
      if (response.ok) {
        await fetchUsers()
        setShowEditDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        setFormErrors({ general: error.error || 'Erro ao atualizar usuário' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    } finally {
      setSubmitting(false)
    }
  }

  // Excluir usuário
  const handleDelete = async () => {
    if (!selectedUser) return
    
    try {
      setSubmitting(true)
      const response = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchUsers()
        setShowDeleteDialog(false)
        setSelectedUser(null)
      } else {
        const error = await response.json()
        setFormErrors({ general: error.error || 'Erro ao excluir usuário' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    } finally {
      setSubmitting(false)
    }
  }

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      phone: ''
    })
    setFormErrors({})
    setSelectedUser(null)
  }

  // Abrir dialog de edição
  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || ''
    })
    setFormErrors({})
    setShowEditDialog(true)
  }

  // Abrir dialog de exclusão
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'COORDINATOR':
        return <Crown className="h-4 w-4 text-purple-500" />
      case 'TEACHER':
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'STUDENT':
        return <BookOpen className="h-4 w-4 text-green-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'COORDINATOR':
        return 'Coordenador'
      case 'TEACHER':
        return 'Professor'
      case 'STUDENT':
        return 'Estudante'
      default:
        return 'Usuário'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    coordinators: users.filter(u => u.role === 'COORDINATOR').length,
    teachers: users.filter(u => u.role === 'TEACHER').length,
    students: users.filter(u => u.role === 'STUDENT').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-gray-600">Gerencie todos os usuários do sistema NAF</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordenadores</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coordinators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="COORDINATOR">Coordenadores</option>
                <option value="TEACHER">Professores</option>
                <option value="STUDENT">Estudantes</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista completa de usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  !user.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={
                            user.role === 'COORDINATOR' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }
                        >
                          {getRoleName(user.role)}
                        </Badge>
                        <Badge 
                          variant={user.isActive ? 'secondary' : 'destructive'}
                          className={user.isActive ? 'bg-green-100 text-green-700' : ''}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Desde {formatDate(user.createdAt).split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <div className="text-gray-900 dark:text-white dark:text-white font-medium">
                        {user.totalDemands || 0} demandas
                      </div>
                      <div className="text-gray-600">
                        {user.totalAttendances || 0} atendimentos
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500">
                          Último acesso: {formatDate(user.lastLogin)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou termos de busca.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
