'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Guide {
  id: string
  title: string
  category: 'federal' | 'estadual' | 'municipal'
  description: string
  steps: Step[]
  legislation: Legislation[]
  documents: string[]
  contacts: Contact[]
  estimatedTime: string
  difficulty: 'básico' | 'intermediário' | 'avançado'
}

interface Step {
  id: number
  title: string
  description: string
  substeps?: string[]
  warnings?: string[]
  tips?: string[]
}

interface Legislation {
  type: 'lei' | 'decreto' | 'instrução_normativa' | 'portaria'
  number: string
  year: number
  title: string
  level: 'federal' | 'estadual' | 'municipal'
  url?: string
}

interface Contact {
  organ: string
  phone: string
  email: string
  address: string
  website: string
  level: 'federal' | 'estadual' | 'municipal'
}

export default function GuidesPage() {
  const { status } = useSession()
  const [guides, setGuides] = useState<Guide[]>([])
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'federal' | 'estadual' | 'municipal'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'básico' | 'intermediário' | 'avançado'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGuides()
  }, [])

  useEffect(() => {
    let filtered = guides

    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(guide => guide.category === categoryFilter)
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(guide => guide.difficulty === difficultyFilter)
    }

    setFilteredGuides(filtered)
  }, [guides, searchTerm, categoryFilter, difficultyFilter])

  const loadGuides = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        setGuides(data)
      } else {
        console.error('Erro ao carregar guias:', response.status)
      }
    } catch (error) {
      console.error('Erro ao carregar guias:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'federal': return 'bg-blue-100 text-blue-800'
      case 'estadual': return 'bg-green-100 text-green-800'
      case 'municipal': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico': return 'bg-green-100 text-green-800'
      case 'intermediário': return 'bg-yellow-100 text-yellow-800'
      case 'avançado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando guias contábeis...</p>
        </div>
      </div>
    )
  }

  // Modal para guia detalhado
  if (selectedGuide) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button 
            onClick={() => setSelectedGuide(null)}
            variant="outline"
            className="mb-4"
          >
            ← Voltar aos Guias
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getCategoryColor(selectedGuide.category)}>
                  {selectedGuide.category}
                </Badge>
                <Badge className={getDifficultyColor(selectedGuide.difficulty)}>
                  {selectedGuide.difficulty}
                </Badge>
                <Badge variant="outline">
                  ⏱️ {selectedGuide.estimatedTime}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{selectedGuide.title}</CardTitle>
              <CardDescription className="text-lg">{selectedGuide.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Documentos Necessários */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📄 Documentos Necessários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedGuide.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Passos Detalhados */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📋 Passo a Passo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedGuide.steps.map((step) => (
                  <div key={step.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {step.id}. {step.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{step.description}</p>
                    
                    {step.substeps && step.substeps.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Substeps:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {step.substeps.map((substep, index) => (
                            <li key={index} className="text-gray-600">{substep}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.warnings && step.warnings.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-red-700 mb-1">⚠️ Atenção:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {step.warnings.map((warning, index) => (
                            <li key={index} className="text-red-600">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.tips && step.tips.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-blue-700 mb-1">💡 Dicas:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {step.tips.map((tip, index) => (
                            <li key={index} className="text-blue-600">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legislação */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📜 Legislação Aplicável</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedGuide.legislation.map((law, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{law.type} nº {law.number}/{law.year}</h4>
                        <p className="text-gray-600">{law.title}</p>
                        <Badge className={getCategoryColor(law.level)} variant="outline">
                          {law.level}
                        </Badge>
                      </div>
                      {law.url && (
                        <a 
                          href={law.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Ver texto →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📞 Contatos Úteis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedGuide.contacts.map((contact, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{contact.organ}</h4>
                      <Badge className={getCategoryColor(contact.level)} variant="outline">
                        {contact.level}
                      </Badge>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📞 {contact.phone}</p>
                        <p>✉️ {contact.email}</p>
                        <p>📍 {contact.address}</p>
                        <a 
                          href={contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block"
                        >
                          🌐 Site oficial →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 Guias Contábeis e Fiscais</h1>
            <p className="text-gray-600">
              Guias passo a passo para solicitações fiscais e contábeis de São José/SC
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">← Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="🔍 Buscar guias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as unknown)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">🏛️ Todas as esferas</option>
          <option value="federal">🇧🇷 Federal</option>
          <option value="estadual">🏛️ Estadual (SC)</option>
          <option value="municipal">🏢 Municipal (São José)</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as unknown)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">📈 Todas as dificuldades</option>
          <option value="básico">🟢 Básico</option>
          <option value="intermediário">🟡 Intermediário</option>
          <option value="avançado">🔴 Avançado</option>
        </select>
      </div>

      {/* Lista de Guias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap gap-1">
                  <Badge className={getCategoryColor(guide.category)}>
                    {guide.category}
                  </Badge>
                  <Badge className={getDifficultyColor(guide.difficulty)}>
                    {guide.difficulty}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">⏱️ {guide.estimatedTime}</span>
              </div>
              <CardTitle className="text-lg">{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  📋 {guide.steps.length} passos detalhados
                </p>
                <p className="text-sm text-gray-600">
                  📜 {guide.legislation.length} leis/decretos
                </p>
                <p className="text-sm text-gray-600">
                  📄 {guide.documents.length} documentos necessários
                </p>
                <p className="text-sm text-gray-600">
                  📞 {guide.contacts.length} contatos úteis
                </p>
              </div>
              <Button 
                onClick={() => setSelectedGuide(guide)}
                className="w-full"
              >
                📖 Ver Guia Completo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg">Nenhum guia encontrado com os filtros aplicados.</p>
          <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou pesquisar por outros termos.</p>
        </div>
      )}
    </div>
  )
}
