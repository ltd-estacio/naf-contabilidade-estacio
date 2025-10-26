'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Users,
  Star
} from 'lucide-react'

interface ChatUser {
  id: string
  conversation_id?: string
  name: string
  email: string
  phone?: string
  cpf?: string
  birth_date?: string
  address?: string
  city?: string
  state?: string
  occupation?: string
  company?: string
  income_range?: string
  preferred_contact?: string
  service_interest?: string[]
  registration_source?: string
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
  updated_at: string
}

export default function UsersPanel() {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')

  // Dialog de detalhes
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter, cityFilter, serviceFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/user-registration?all=true')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filtro por busca (nome, email, telefone)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.occupation?.toLowerCase().includes(search)
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Filtro por cidade
    if (cityFilter) {
      filtered = filtered.filter(user =>
        user.city?.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    // Filtro por serviço de interesse
    if (serviceFilter) {
      filtered = filtered.filter(user =>
        user.service_interest?.some(service =>
          service.toLowerCase().includes(serviceFilter.toLowerCase())
        )
      )
    }

    // Ordenar por data de cadastro mais recente
    filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch('/api/chat/user-registration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          status
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Status atualizado com sucesso!')
        loadUsers()
      } else {
        setError(data.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setError('Erro de conexão')
    }
  }

  const startChatWithUser = (user: ChatUser) => {
    if (user.conversation_id) {
      window.open(`/coordinator-dashboard?conversation=${user.conversation_id}`, '_blank')
    } else {
      setError('Conversa não encontrada para este usuário')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'blocked': return 'Bloqueado'
      default: return status
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

  const getContactPreferenceIcon = (preference: string) => {
    switch (preference) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const uniqueCities = [...new Set(users.map(u => u.city).filter(Boolean))]
  const uniqueServices = [...new Set(users.flatMap(u => u.service_interest || []))]

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto"
          >
            ×
          </Button>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto"
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Cadastrados via Chat
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredUsers.length}
              </div>
              <div className="text-sm text-blue-700">Total de Usuários</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-green-700">Ativos</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredUsers.filter(u => {
                  const today = new Date()
                  const userDate = new Date(u.created_at)
                  const diffTime = Math.abs(today.getTime() - userDate.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays <= 7
                }).length}
              </div>
              <div className="text-sm text-yellow-700">Novos (7 dias)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {uniqueCities.length}
              </div>
              <div className="text-sm text-purple-700">Cidades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, email, telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cidade</label>
              <Input
                placeholder="Filtrar por cidade..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Serviço</label>
              <Input
                placeholder="Filtrar por serviço..."
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCityFilter('')
                  setServiceFilter('')
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Carregando usuários...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum usuário encontrado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Detalhes */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {user.name}
                          </h3>
                          <Badge className={getStatusColor(user.status)}>
                            {getStatusLabel(user.status)}
                          </Badge>
                          {user.preferred_contact && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getContactPreferenceIcon(user.preferred_contact)}
                              {user.preferred_contact}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone || 'Não informado'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {user.city || 'Não informado'}, {user.state || 'UF'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {user.occupation || 'Não informado'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Cadastrado em {formatDate(user.created_at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            {user.service_interest?.[0] || 'Serviço não informado'}
                          </div>
                        </div>

                        {user.service_interest && user.service_interest.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Serviços de interesse:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {user.service_interest.map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserDialog(true)
                      }}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>

                    {user.conversation_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startChatWithUser(user)}
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir Chat
                      </Button>
                    )}

                    <div className="flex gap-1">
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserStatus(user.id, 'inactive')}
                          className="flex-1"
                        >
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="flex-1"
                        >
                          <UserCheck className="h-4 w-4" />
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de detalhes do usuário */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.cpf || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.city || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.state || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profissão</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.occupation || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Empresa</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.company || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Faixa de Renda</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.income_range || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contato Preferido</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.preferred_contact || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Cadastro</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {getStatusLabel(selectedUser.status)}
                  </Badge>
                </div>
              </div>

              {/* Serviços de interesse */}
              {selectedUser.service_interest && selectedUser.service_interest.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Serviços de Interesse
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.service_interest.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Endereço completo */}
              {selectedUser.address && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço Completo</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.address}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowUserDialog(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                {selectedUser.conversation_id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      startChatWithUser(selectedUser)
                      setShowUserDialog(false)
                    }}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Abrir Chat
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}