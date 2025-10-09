'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Link as LinkIcon,
  Copy,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  ExternalLink,
  Users,
  MessageCircle,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface ChatLink {
  id: string
  link_token: string
  link_slug: string
  title: string
  description: string
  custom_message: string
  max_uses: number | null
  current_uses: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  last_used_at: string | null
  statistics?: {
    total_accesses: number
    unique_users: number
    conversations_created: number
    last_access_date: string | null
  }
}

interface ChatLinkManagerProps {
  studentId: string
  studentName: string
}

export default function ChatLinkManager({ studentId, studentName }: ChatLinkManagerProps) {
  const [links, setLinks] = useState<ChatLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Formulário de novo link
  const [formData, setFormData] = useState({
    title: 'Chat NAF - Assistente Virtual',
    description: '',
    customMessage: '',
    maxUses: '',
    expiresInDays: ''
  })

  const loadLinks = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/students/chat-links?studentId=${studentId}`)
      const data = await response.json()

      if (response.ok) {
        setLinks(data.links || [])
      } else {
        console.error('Erro ao carregar links:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar links:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentId) {
      loadLinks()
    }
  }, [studentId])

  const createLink = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/students/chat-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          title: formData.title,
          description: formData.description || null,
          customMessage: formData.customMessage || null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresInDays: formData.expiresInDays ? parseInt(formData.expiresInDays) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Link criado:', data.link)
        setIsDialogOpen(false)
        setFormData({
          title: 'Chat NAF - Assistente Virtual',
          description: '',
          customMessage: '',
          maxUses: '',
          expiresInDays: ''
        })
        loadLinks()
      } else {
        console.error('Erro ao criar link:', data.error)
        alert('Erro ao criar link: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao criar link:', error)
      alert('Erro ao criar link')
    } finally {
      setCreating(false)
    }
  }

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/students/chat-links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          studentId,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadLinks()
      } else {
        const data = await response.json()
        alert('Erro ao atualizar link: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar link:', error)
      alert('Erro ao atualizar link')
    }
  }

  const deleteLink = async (linkId: string) => {
    if (!confirm('Tem certeza que deseja deletar este link? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/students/chat-links?linkId=${linkId}&studentId=${studentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadLinks()
      } else {
        const data = await response.json()
        alert('Erro ao deletar link: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao deletar link:', error)
      alert('Erro ao deletar link')
    }
  }

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(linkId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const getLinkUrl = (link: ChatLink, useSlug = false) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return useSlug
      ? `${baseUrl}/chat/${link.link_slug}`
      : `${baseUrl}/chat?link=${link.link_token}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2">Carregando links...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Gerenciar Links do Chat
              </CardTitle>
              <CardDescription>
                Crie links personalizados para ativar o chat para seus clientes
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Novo Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Link de Acesso ao Chat</DialogTitle>
                  <DialogDescription>
                    Configure as opções do link. Os usuários que acessarem este link poderão ver o botão do chat.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Chat</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Chat NAF - Assistente Virtual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do link para controle interno"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Mensagem Personalizada (opcional)</Label>
                    <Textarea
                      id="customMessage"
                      value={formData.customMessage}
                      onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                      placeholder="Mensagem que será exibida ao usuário quando o chat abrir"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Limite de Usos</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="0"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        placeholder="Ilimitado"
                      />
                      <p className="text-xs text-gray-500">Deixe vazio para ilimitado</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiresInDays">Expira em (dias)</Label>
                      <Input
                        id="expiresInDays"
                        type="number"
                        min="1"
                        value={formData.expiresInDays}
                        onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                        placeholder="Nunca"
                      />
                      <p className="text-xs text-gray-500">Deixe vazio para não expirar</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createLink} disabled={creating}>
                    {creating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Link
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Links */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Nenhum link criado ainda</p>
              <p className="text-sm">Crie seu primeiro link para começar a compartilhar o chat</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => {
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
            const isLimitReached = link.max_uses !== null && link.current_uses >= link.max_uses

            return (
              <Card key={link.id} className={!link.is_active || isExpired || isLimitReached ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                        {link.is_active && !isExpired && !isLimitReached ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {isExpired ? '⏰ Expirado' : isLimitReached ? '🚫 Limite Atingido' : '❌ Inativo'}
                          </Badge>
                        )}
                      </div>
                      {link.description && (
                        <CardDescription className="mb-2">{link.description}</CardDescription>
                      )}
                      <div className="text-xs text-gray-500">
                        Criado em: {new Date(link.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={link.is_active ? "outline" : "default"}
                        onClick={() => toggleLinkStatus(link.id, link.is_active)}
                        disabled={isExpired || isLimitReached}
                      >
                        {link.is_active ? (
                          <><EyeOff className="h-4 w-4" /></>
                        ) : (
                          <><Eye className="h-4 w-4" /></>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* URLs */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={getLinkUrl(link, false)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(getLinkUrl(link, false), link.id + '-token')}
                      >
                        {copiedLink === link.id + '-token' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getLinkUrl(link, false), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={getLinkUrl(link, true)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(getLinkUrl(link, true), link.id + '-slug')}
                      >
                        {copiedLink === link.id + '-slug' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getLinkUrl(link, true), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">{link.statistics?.total_accesses || 0}</div>
                      <div className="text-xs text-gray-600">Acessos</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold">{link.statistics?.conversations_created || 0}</div>
                      <div className="text-xs text-gray-600">Conversas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold">
                        {link.current_uses}{link.max_uses ? `/${link.max_uses}` : ''}
                      </div>
                      <div className="text-xs text-gray-600">Usos</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-2xl font-bold">{link.statistics?.unique_users || 0}</div>
                      <div className="text-xs text-gray-600">Usuários</div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  {(link.expires_at || link.max_uses || link.last_used_at) && (
                    <div className="pt-4 border-t space-y-1 text-sm text-gray-600">
                      {link.expires_at && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Expira em: {new Date(link.expires_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                      {link.last_used_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Último uso: {new Date(link.last_used_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
