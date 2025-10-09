'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import MainNavigation from '@/components/MainNavigation'
import {
  BookOpen,
  Search,
  ExternalLink,
  FileText,
  Building2,
  Users,
  Scale,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { ALL_GUIDES, type LegislationItem } from '@/data/fiscal-guides'

export default function FiscalGuidesPage() {
  const [legislations, setLegislations] = useState<LegislationItem[]>([])
  const [filteredLegislations, setFilteredLegislations] = useState<LegislationItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScope, setSelectedScope] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [loadingGuide, setLoadingGuide] = useState<string | null>(null)

  const handleDownloadGuide = async (guideId: string) => {
    try {
      console.log('🔍 Buscando documentos oficiais para:', guideId)
      setLoadingGuide(guideId)

      // Primeiro, tentar buscar documentos oficiais via API governamental
      const govResponse = await fetch(`/api/government-docs?id=${guideId}`)

      console.log('📡 Resposta da API:', govResponse.status, govResponse.statusText)

      if (govResponse.ok) {
        const govData = await govResponse.json()
        console.log('📋 Dados recebidos:', govData)

        if (govData.success && govData.data.laws.length > 0) {
          // Mostrar modal com opções de documentos oficiais
          console.log('✅ Mostrando modal com documentos oficiais')
          showOfficialDocumentsModal(govData.data)
          return
        } else {
          console.log('⚠️ Dados inválidos ou vazios, usando fallback')
        }
      } else {
        console.log('❌ Erro na API, usando fallback. Status:', govResponse.status)
      }

      // Fallback: baixar guia local
      console.log('📥 Tentando fallback para download local')
      const response = await fetch(`/api/download-guide?id=${guideId}`)

      if (!response.ok) {
        throw new Error(`Erro ao baixar o guia: ${response.status} ${response.statusText}`)
      }

      // Obter o blob do PDF
      const blob = await response.blob()

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob)

      // Criar link temporário e fazer download
      const link = document.createElement('a')
      link.href = url

      // Definir nome do arquivo baseado no ID
      const fileNames: { [key: string]: string } = {
        'cpf-guide': 'Guia-Cadastro-CPF.pdf',
        'mei-guide': 'Guia-MEI-Formalizacao.pdf',
        'ir-guide': 'Guia-Declaracao-IR-PF.pdf',
        'itr-guide': 'Guia-ITR-Territorial-Rural.pdf',
        'cnpj-guide': 'Guia-Abertura-CNPJ.pdf',
        'esocial-guide': 'Guia-eSocial-Domestico.pdf',
        'alvara-municipal': 'Guia-Alvara-Funcionamento.pdf',
        'iss-municipal': 'Guia-ISS-Servicos.pdf',
        'icms-estadual': 'Guia-ICMS-Mercadorias.pdf'
      }

      link.download = fileNames[guideId] || 'guia-fiscal.pdf'
      document.body.appendChild(link)
      link.click()

      // Limpeza
      link.remove()
      window.URL.revokeObjectURL(url)

      console.log('✅ Download local realizado com sucesso')

    } catch (error) {
      console.error('❌ Erro completo:', error)

      // Mostrar erro mais detalhado para debug
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao acessar documentos oficiais: ${errorMessage}\n\nVerifique o console para mais detalhes.`)
    } finally {
      setLoadingGuide(null)
    }
  }

  const showOfficialDocumentsModal = (data: unknown) => {
    const modalContent = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 800px; max-height: 90vh; overflow-y: auto; margin: 20px;">
          <div style="display: flex; justify-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">${data.title}</h2>
            <button onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 5px;">&times;</button>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #059669; font-weight: 600; margin-bottom: 15px; font-size: 18px;">📜 Documentos Oficiais da Legislação</h3>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
              <p style="color: #065f46; margin: 0; font-size: 14px;">
                <strong>✅ Documentos Oficiais Verificados</strong><br>
                Todos os links abaixo direcionam para os textos oficiais das leis e decretos no Portal do Planalto e órgãos governamentais.
              </p>
            </div>
            ${data.laws.map((law: unknown) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 12px; background: #fafafa;">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                  <div style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${law.type}</span>
                      <span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${law.year}</span>
                    </div>
                    <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${law.name}</h4>
                  </div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <a href="${law.pdfUrl || law.url}" target="_blank" rel="noopener noreferrer"
                     style="background: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                    📄 Ver Documento Oficial
                  </a>
                  ${law.pdfUrl && law.pdfUrl !== law.url ? `
                    <a href="${law.url}" target="_blank" rel="noopener noreferrer"
                       style="background: #6b7280; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                      🔗 Versão HTML
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #0369a1; font-weight: 600; margin-bottom: 15px; font-size: 18px;">🏛️ Portais Oficiais</h3>
            ${data.officialSites.map((site: unknown) => `
              <div style="border: 1px solid #e0f2fe; border-radius: 8px; padding: 15px; margin-bottom: 12px; background: #f0f9ff;">
                <h4 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">${site.name}</h4>
                <p style="margin: 0 0 12px 0; color: #0369a1; font-size: 14px;">${site.description}</p>
                <a href="${site.url}" target="_blank" rel="noopener noreferrer"
                   style="background: #0ea5e9; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                  🌐 Acessar Portal Oficial
                </a>
              </div>
            `).join('')}
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">⚡ Acesso Direto às Leis</h4>
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              Clique nos botões "Ver Documento Oficial" para acessar diretamente os textos das leis nos portais governamentais oficiais,
              garantindo que você tenha sempre a versão mais atualizada da legislação.
            </p>
          </div>

          <div style="text-align: center;">
            <button onclick="closeModal()"
                    style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalContent;
    modalDiv.id = 'official-docs-modal';

    // Adicionar função de fechar ao window
    (window as unknown).closeModal = () => {
      const modal = document.getElementById('official-docs-modal');
      if (modal) {
        modal.remove();
      }
    };

    document.body.appendChild(modalDiv);
  }

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      const allGuides = ALL_GUIDES
      setLegislations(allGuides)
      setFilteredLegislations(allGuides)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = legislations

    if (selectedScope !== 'ALL') {
      filtered = filtered.filter(item => item.scope === selectedScope)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLegislations(filtered)
  }, [searchTerm, selectedScope, legislations])

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'FEDERAL': return <Building2 className="h-4 w-4" />
      case 'ESTADUAL': return <Scale className="h-4 w-4" />
      case 'MUNICIPAL': return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'FEDERAL': return 'bg-blue-100 text-blue-800'
      case 'ESTADUAL': return 'bg-green-100 text-green-800'
      case 'MUNICIPAL': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando guias fiscais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-950 dark:to-gray-900 dark:from-gray-950 dark:to-gray-900">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
            Guias Fiscais e Legislação
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Acesse orientações detalhadas sobre procedimentos fiscais federais, estaduais e municipais.
            Guias passo a passo para facilitar o cumprimento das obrigações.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por tema, procedimento ou categoria..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedScope === 'ALL' ? 'default' : 'outline'}
                onClick={() => setSelectedScope('ALL')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={selectedScope === 'FEDERAL' ? 'default' : 'outline'}
                onClick={() => setSelectedScope('FEDERAL')}
                size="sm"
              >
                Federal
              </Button>
              <Button
                variant={selectedScope === 'ESTADUAL' ? 'default' : 'outline'}
                onClick={() => setSelectedScope('ESTADUAL')}
                size="sm"
              >
                Estadual
              </Button>
              <Button
                variant={selectedScope === 'MUNICIPAL' ? 'default' : 'outline'}
                onClick={() => setSelectedScope('MUNICIPAL')}
                size="sm"
              >
                Municipal
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLegislations.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-950 dark:bg-gray-900 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getScopeColor(guide.scope)} flex items-center gap-1`}>
                        {getScopeIcon(guide.scope)}
                        {guide.scope}
                      </Badge>
                      <Badge variant="outline">{guide.category}</Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white dark:text-white">{guide.title}</CardTitle>
                    <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">{guide.description}</CardDescription>
                  </div>
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="steps" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="steps">Procedimentos</TabsTrigger>
                    <TabsTrigger value="docs">Documentos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="steps" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white dark:text-white">Passo a passo:</h4>
                      <ol className="space-y-2">
                        {guide.steps?.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </TabsContent>
                  <TabsContent value="docs" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white dark:text-white">Documentos necessários:</h4>
                      <ul className="space-y-2">
                        {guide.documents?.map((doc, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <Link href="/schedule" className="flex-1">
                    <Button size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Orientação
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadGuide(guide.id)}
                    disabled={loadingGuide === guide.id}
                  >
                    {loadingGuide === guide.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Carregando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Legislação Oficial
                      </>
                    )}
                  </Button>
                  {guide.url && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portal Oficial
                    </Button>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Última atualização: {new Date(guide.lastUpdated).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLegislations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
              Nenhum guia encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        )}

        {/* Quick Links */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white border-0">
            <CardContent className="py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Precisa de Orientação Personalizada?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Agende atendimento gratuito com nossa equipe de estudantes e professores
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/schedule">
                    <Button size="lg" variant="secondary" className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800">
                      <Calendar className="h-5 w-5 mr-2" />
                      Agendar Atendimento
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white dark:bg-gray-950 dark:bg-gray-950 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400">
                      Ver Todos os Serviços
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
