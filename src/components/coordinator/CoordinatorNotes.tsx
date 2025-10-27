'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, Search, Filter, Star, Pin, Archive, Trash2, Edit, Eye, 
  Calendar, Tag, Paperclip, FileText, Save, X, AlertCircle,
  TrendingUp, BarChart3, Clock, Hash, BookOpen, Sparkles,
  Copy, Download, Upload, RefreshCw, Layout, Grid, List
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Note {
  id: string
  title: string
  content: string
  summary: string
  category: string
  priority: string
  status: string
  tags: string[]
  note_date: string
  is_pinned: boolean
  is_favorite: boolean
  is_private: boolean
  word_count: number
  reading_time_minutes: number
  attachments: any[]
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { value: 'ADMINISTRACAO', label: 'Administração', color: 'bg-blue-500', icon: '💼' },
  { value: 'CONTABILIDADE', label: 'Contabilidade', color: 'bg-green-500', icon: '🧮' },
  { value: 'SISTEMAS_INFORMACAO', label: 'Sistemas de Informação', color: 'bg-purple-500', icon: '💻' },
  { value: 'GERAL', label: 'Geral', color: 'bg-gray-500', icon: '📄' },
  { value: 'REUNIAO', label: 'Reunião', color: 'bg-orange-500', icon: '👥' },
  { value: 'ESTUDANTES', label: 'Estudantes', color: 'bg-pink-500', icon: '🎓' },
  { value: 'PROFESSORES', label: 'Professores', color: 'bg-teal-500', icon: '👨‍🏫' },
  { value: 'ATENDIMENTOS', label: 'Atendimentos', color: 'bg-red-500', icon: '🎧' }
]

const PRIORITIES = [
  { value: 'LOW', label: 'Baixa', color: 'text-gray-500' },
  { value: 'MEDIUM', label: 'Média', color: 'text-blue-500' },
  { value: 'HIGH', label: 'Alta', color: 'text-orange-500' },
  { value: 'URGENT', label: 'Urgente', color: 'text-red-500' }
]

const TEMPLATES = [
  {
    id: 'meeting',
    name: 'Reunião de Departamento',
    icon: '👥',
    content: `# Reunião de Departamento

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Participantes:** 

## Pauta
1. 

## Discussões


## Decisões Tomadas


## Ações Futuras
- [ ] 

## Observações
`
  },
  {
    id: 'student',
    name: 'Acompanhamento de Estudante',
    icon: '🎓',
    content: `# Acompanhamento: [NOME DO ESTUDANTE]

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Curso:** 
**Semestre:** 

## Situação Atual


## Desempenho Acadêmico


## Questões Observadas


## Recomendações


## Próximos Passos
- [ ] 
`
  },
  {
    id: 'attendance',
    name: 'Atendimento NAF',
    icon: '🎧',
    content: `# Atendimento NAF

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Estudante Responsável:** 
**Cliente:** 
**Serviço:** 

## Descrição do Atendimento


## Documentos Necessários


## Orientações Fornecidas


## Status


## Observações
`
  }
]

export default function CoordinatorNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL')
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GERAL',
    priority: 'MEDIUM',
    tags: [] as string[],
    is_private: false
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadNotes()
    loadStats()
  }, [])

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/coordinator/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/coordinator/notes/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleCreateNote = async () => {
    if (!formData.title || !formData.content) {
      alert('Preencha título e conteúdo!')
      return
    }

    try {
      const response = await fetch('/api/coordinator/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadNotes()
        await loadStats()
        setShowNewNoteDialog(false)
        resetForm()
        alert('Anotação criada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar anotação:', error)
      alert('Erro ao criar anotação')
    }
  }

  const handleTogglePinned = async (noteId: string) => {
    try {
      const response = await fetch(`/api/coordinator/notes/${noteId}/pin`, {
        method: 'PATCH'
      })
      if (response.ok) await loadNotes()
    } catch (error) {
      console.error('Erro ao fixar anotação:', error)
    }
  }

  const handleToggleFavorite = async (noteId: string) => {
    try {
      const response = await fetch(`/api/coordinator/notes/${noteId}/favorite`, {
        method: 'PATCH'
      })
      if (response.ok) await loadNotes()
    } catch (error) {
      console.error('Erro ao favoritar anotação:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return

    try {
      const response = await fetch(`/api/coordinator/notes/${noteId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadNotes()
        await loadStats()
      }
    } catch (error) {
      console.error('Erro ao excluir anotação:', error)
    }
  }

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setFormData({
      ...formData,
      content: template.content,
      title: template.name
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'GERAL',
      priority: 'MEDIUM',
      tags: [],
      is_private: false
    })
    setTagInput('')
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || note.category === selectedCategory
    const matchesPriority = selectedPriority === 'ALL' || note.priority === selectedPriority
    return matchesSearch && matchesCategory && matchesPriority
  })

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const regularNotes = filteredNotes.filter(n => !n.is_pinned)

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Anotações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_notes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{stats?.active_notes || 0} ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Fixadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.pinned_notes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Importantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Favoritas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats?.favorite_notes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Marcadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Arquivadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats?.archived_notes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Guardadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Ferramentas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Categorias</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Prioridades</SelectItem>
                {PRIORITIES.map(pri => (
                  <SelectItem key={pri.value} value={pri.value}>
                    {pri.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Novo */}
            <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Anotação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Anotação</DialogTitle>
                  <DialogDescription>
                    Crie uma nova anotação para registrar suas atividades como coordenador
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Templates */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Templates Rápidos</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TEMPLATES.map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="justify-start"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <span className="mr-2">{template.icon}</span>
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título *</label>
                    <Input
                      placeholder="Digite o título da anotação..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Conteúdo *</label>
                    <Textarea
                      placeholder="Digite o conteúdo da anotação... (suporte a Markdown)"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.content.split(/\s+/).filter(Boolean).length} palavras • 
                      {Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)} min de leitura
                    </p>
                  </div>

                  {/* Categoria e Prioridade */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categoria</label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Prioridade</label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map(pri => (
                            <SelectItem key={pri.value} value={pri.value}>
                              {pri.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Adicionar tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                          {tag} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Privacidade */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={formData.is_private}
                      onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="private" className="text-sm">
                      Marcar como privada (apenas você poderá ver)
                    </label>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateNote}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Anotação
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Notas Fixadas */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-blue-600" />
            Fixadas ({pinnedNotes.length})
          </h3>
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePinned={handleTogglePinned}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notas Regulares */}
      <div>
        {pinnedNotes.length > 0 && (
          <h3 className="text-lg font-semibold mb-4">
            Todas as Anotações ({regularNotes.length})
          </h3>
        )}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {regularNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePinned={handleTogglePinned}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>

        {filteredNotes.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma anotação encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'ALL' || selectedPriority !== 'ALL'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira anotação'}
              </p>
              <Button onClick={() => setShowNewNoteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Anotação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function NoteCard({ 
  note, 
  onTogglePinned, 
  onToggleFavorite, 
  onDelete 
}: { 
  note: Note
  onTogglePinned: (id: string) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}) {
  const category = CATEGORIES.find(c => c.value === note.category)
  const priority = PRIORITIES.find(p => p.value === note.priority)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={category?.color}>{category?.icon} {category?.label}</Badge>
              <Badge variant="outline" className={priority?.color}>{priority?.label}</Badge>
            </div>
            <CardTitle className="text-lg">{note.title}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePinned(note.id)}
            >
              <Pin className={`h-4 w-4 ${note.is_pinned ? 'fill-current text-blue-600' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onToggleFavorite(note.id)}
            >
              <Star className={`h-4 w-4 ${note.is_favorite ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.content.substring(0, 150)}...</p>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {note.reading_time_minutes} min
            </span>
            <span>{note.word_count} palavras</span>
          </div>
          <span>{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(note.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
