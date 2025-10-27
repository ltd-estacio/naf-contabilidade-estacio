'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Download, Code, Smartphone, Globe, GitBranch, Package, FileCode, 
  Folder, CheckCircle, AlertCircle, Search, Filter, Clock, Star,
  FolderTree, FileText, Terminal, Settings, RefreshCw, Archive,
  GitCommit, Users, Calendar, Activity, BarChart3, TrendingUp,
  ExternalLink, Copy, Check, Eye, History, BookOpen, Zap,
  Layers, Database, Lock, Unlock, Shield, Key, Info, HelpCircle
} from 'lucide-react'

const REPOSITORIES = [
  {
    id: 'website',
    name: 'Website NAF Estácio',
    description: 'Código fonte completo do site institucional do NAF',
    icon: Globe,
    tech: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Prisma', 'NextAuth.js'],
    size: '156 MB',
    files: '2,847',
    lines: '125,436',
    downloadUrl: 'https://github.com/estevam5s/naf-contabilidade-estacio/archive/refs/heads/main.zip',
    repoUrl: 'https://github.com/estevam5s/naf-contabilidade-estacio',
    branch: 'main',
    lastCommit: 'há 2 horas',
    contributors: 3,
    version: '2.1.0',
    color: 'bg-blue-500',
    structure: [
      { path: 'src/app/', description: 'Rotas e páginas Next.js (App Router)', files: 428 },
      { path: 'src/components/', description: 'Componentes React reutilizáveis', files: 156 },
      { path: 'src/lib/', description: 'Utilitários e helpers', files: 89 },
      { path: 'src/api/', description: 'Endpoints da API', files: 67 },
      { path: 'prisma/', description: 'Schema e migrations do banco', files: 23 },
      { path: 'public/', description: 'Arquivos estáticos', files: 245 },
      { path: 'doc/', description: 'Documentação técnica', files: 78 }
    ],
    features: [
      'Sistema de Autenticação (NextAuth.js)',
      'Dashboard Administrativo Completo',
      'Sistema de Agendamento de Atendimentos',
      'Geração de Relatórios em PDF',
      'Integração com EmailJS',
      'Backup Automático do Banco de Dados',
      'Sistema de Notificações',
      'Chat em Tempo Real',
      'Gestão de Estudantes e Professores',
      'API RESTful Completa'
    ]
  },
  {
    id: 'app',
    name: 'App NAF (Android)',
    description: 'Código fonte do aplicativo mobile Android',
    icon: Smartphone,
    tech: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage', 'React Navigation'],
    size: '89 MB',
    files: '1,523',
    lines: '67,234',
    downloadUrl: 'https://github.com/developing-in-React-Native/naf-app/archive/refs/heads/main.zip',
    repoUrl: 'https://github.com/developing-in-React-Native/naf-app',
    branch: 'main',
    lastCommit: 'há 5 dias',
    contributors: 2,
    version: '1.8.3',
    color: 'bg-green-500',
    structure: [
      { path: 'src/screens/', description: 'Telas do aplicativo', files: 38 },
      { path: 'src/components/', description: 'Componentes React Native', files: 92 },
      { path: 'src/navigation/', description: 'Navegação e rotas', files: 12 },
      { path: 'src/services/', description: 'Serviços e APIs', files: 34 },
      { path: 'src/utils/', description: 'Utilitários', files: 28 },
      { path: 'assets/', description: 'Imagens e recursos', files: 156 }
    ],
    features: [
      'Interface Mobile Responsiva',
      'Agendamento de Atendimentos',
      'Consulta de Serviços Fiscais',
      'Notificações Push',
      'Modo Offline',
      'Autenticação Biométrica',
      'Chat com Assistentes',
      'Histórico de Atendimentos',
      'Download de APK Interno'
    ]
  }
]


export default function SourceCodeManager() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<string>('website')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')
  const [stats, setStats] = useState({
    totalDownloads: 127,
    lastUpdate: '2 horas atrás',
    activeDevs: 3,
    openIssues: 8
  })

  const currentRepo = REPOSITORIES.find(r => r.id === selectedRepo)

  const handleDownload = async (repoId: string, repoName: string, downloadUrl: string) => {
    setDownloading(repoId)
    setDownloadProgress(0)
    
    try {
      // Simular progresso de download
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Aguardar simulação
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Criar link de download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${repoName.toLowerCase().replace(/\s/g, '-')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Atualizar estatísticas
      setStats(prev => ({ ...prev, totalDownloads: prev.totalDownloads + 1 }))

      alert(`✅ Download do ${repoName} iniciado com sucesso!\n\n📦 O arquivo ZIP será salvo na sua pasta de Downloads.`)
    } catch (error) {
      alert('❌ Erro ao baixar código fonte. Tente novamente.')
    } finally {
      setDownloading(null)
      setDownloadProgress(0)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(id)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }


  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                <p className="text-2xl font-bold text-green-600">{stats.lastUpdate}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Desenvolvedores</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeDevs}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues Abertas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.openIssues}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert de Acesso */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Acesso Autorizado:</strong> Como coordenador, você tem permissão para baixar o código fonte completo dos repositórios do NAF.
          Os arquivos serão baixados em formato ZIP.
        </AlertDescription>
      </Alert>

      {/* Seletor de Repositório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Code className="h-6 w-6" />
                Gerenciador de Código Fonte
              </CardTitle>
              <CardDescription className="mt-2">
                Visualize, gerencie e baixe o código fonte dos projetos do NAF
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visão Geral
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Detalhado
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedRepo} onValueChange={setSelectedRepo} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {REPOSITORIES.map(repo => {
            const Icon = repo.icon
            return (
              <TabsTrigger key={repo.id} value={repo.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {repo.name}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {REPOSITORIES.map(repo => {
          const Icon = repo.icon
          const isDownloading = downloading === repo.id

          return (
            <TabsContent key={repo.id} value={repo.id} className="space-y-6">
              {/* Card Principal do Repositório */}
              <Card className="relative overflow-hidden border-2">
                <div className={`absolute top-0 left-0 w-full h-2 ${repo.color}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${repo.color} bg-opacity-10`}>
                        <Icon className={`h-8 w-8 ${repo.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{repo.name}</CardTitle>
                        <CardDescription className="mt-2 text-base">{repo.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {repo.branch}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            v{repo.version}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {repo.lastCommit}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Tecnologias */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Stack de Tecnologias
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {repo.tech.map(tech => (
                        <Badge key={tech} variant="secondary" className="text-sm py-1 px-3">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Estatísticas do Repositório */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tamanho</p>
                      <p className="text-lg font-bold text-gray-900">{repo.size}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Arquivos</p>
                      <p className="text-lg font-bold text-gray-900">{repo.files}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Linhas</p>
                      <p className="text-lg font-bold text-gray-900">{repo.lines}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Contribuidores</p>
                      <p className="text-lg font-bold text-gray-900">{repo.contributors}</p>
                    </div>
                  </div>

                  {/* Links do Repositório */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Links do Repositório
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openInNewTab(repo.repoUrl)}
                      >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Ver no GitHub
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(repo.repoUrl, `repo-${repo.id}`)}
                      >
                        {copiedUrl === `repo-${repo.id}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(repo.downloadUrl, `download-${repo.id}`)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar URL de Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(repo.downloadUrl, `download-${repo.id}`)}
                      >
                        {copiedUrl === `download-${repo.id}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Botão de Download Principal */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-14 text-lg" 
                      onClick={() => handleDownload(repo.id, repo.name, repo.downloadUrl)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Preparando Download... {downloadProgress}%
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Baixar Código Fonte Completo
                        </>
                      )}
                    </Button>

                    {isDownloading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${repo.color} transition-all duration-300`}
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    )}

                    <p className="text-xs text-center text-gray-500">
                      O arquivo será baixado em formato ZIP ({repo.size})
                    </p>
                  </div>
                </CardContent>
              </Card>


              {/* Estrutura de Pastas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Estrutura do Projeto
                  </CardTitle>
                  <CardDescription>
                    Organização das pastas e arquivos do repositório
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {repo.structure?.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900">{item.path}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.files} arquivos</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Funcionalidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Funcionalidades Implementadas
                  </CardTitle>
                  <CardDescription>
                    Principais recursos e sistemas do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {repo.features?.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-gray-900">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Informações de Desenvolvimento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Comandos de Desenvolvimento
                  </CardTitle>
                  <CardDescription>
                    Comandos úteis para trabalhar com o projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Instalar dependências:</p>
                      <code className="text-green-400 font-mono text-sm">npm install</code>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Executar em modo desenvolvimento:</p>
                      <code className="text-green-400 font-mono text-sm">npm run dev</code>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Criar build de produção:</p>
                      <code className="text-green-400 font-mono text-sm">npm run build</code>
                    </div>
                    {repo.id === 'website' && (
                      <>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Executar migrations do Prisma:</p>
                          <code className="text-green-400 font-mono text-sm">npx prisma migrate dev</code>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Abrir Prisma Studio:</p>
                          <code className="text-green-400 font-mono text-sm">npx prisma studio</code>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Requisitos do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Requisitos do Sistema
                  </CardTitle>
                  <CardDescription>
                    Software necessário para executar o projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Node.js</span>
                      </div>
                      <Badge variant="outline">v18.0.0 ou superior</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">npm ou yarn</span>
                      </div>
                      <Badge variant="outline">Última versão</Badge>
                    </div>
                    {repo.id === 'website' && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium">PostgreSQL</span>
                          </div>
                          <Badge variant="outline">v14.0 ou superior</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium">Supabase Account</span>
                          </div>
                          <Badge variant="outline">Obrigatório</Badge>
                        </div>
                      </>
                    )}
                    {repo.id === 'app' && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium">Expo CLI</span>
                          </div>
                          <Badge variant="outline">Última versão</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium">Android Studio</span>
                          </div>
                          <Badge variant="outline">Recomendado</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Variáveis de Ambiente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Variáveis de Ambiente Necessárias
                  </CardTitle>
                  <CardDescription>
                    Configurações que devem ser definidas no arquivo .env
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Após baixar o código, crie um arquivo <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> na raiz do projeto com as variáveis abaixo.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-gray-900 p-4 rounded-lg space-y-2 font-mono text-xs">
                    {repo.id === 'website' ? (
                      <>
                        <div><span className="text-blue-400">NEXT_PUBLIC_SUPABASE_URL</span><span className="text-white">=</span><span className="text-green-400">your-supabase-url</span></div>
                        <div><span className="text-blue-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span><span className="text-white">=</span><span className="text-green-400">your-anon-key</span></div>
                        <div><span className="text-blue-400">SUPABASE_SERVICE_ROLE_KEY</span><span className="text-white">=</span><span className="text-green-400">your-service-role-key</span></div>
                        <div><span className="text-blue-400">NEXTAUTH_SECRET</span><span className="text-white">=</span><span className="text-green-400">your-secret-key</span></div>
                        <div><span className="text-blue-400">NEXTAUTH_URL</span><span className="text-white">=</span><span className="text-green-400">http://localhost:3000</span></div>
                        <div><span className="text-blue-400">DATABASE_URL</span><span className="text-white">=</span><span className="text-green-400">postgresql://...</span></div>
                        <div><span className="text-blue-400">EMAIL_USER</span><span className="text-white">=</span><span className="text-green-400">your-email@gmail.com</span></div>
                        <div><span className="text-blue-400">EMAIL_APP_PASSWORD</span><span className="text-white">=</span><span className="text-green-400">your-app-password</span></div>
                        <div><span className="text-blue-400">EMAILJS_SERVICE_ID</span><span className="text-white">=</span><span className="text-green-400">your-service-id</span></div>
                        <div><span className="text-blue-400">EMAILJS_TEMPLATE_ID</span><span className="text-white">=</span><span className="text-green-400">your-template-id</span></div>
                        <div><span className="text-blue-400">EMAILJS_PUBLIC_KEY</span><span className="text-white">=</span><span className="text-green-400">your-public-key</span></div>
                        <div><span className="text-blue-400">GEMINI_API_KEY</span><span className="text-white">=</span><span className="text-green-400">your-gemini-key</span></div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-blue-400">API_BASE_URL</span><span className="text-white">=</span><span className="text-green-400">https://naf.ltdestacio.com.br</span></div>
                        <div><span className="text-blue-400">SUPABASE_URL</span><span className="text-white">=</span><span className="text-green-400">your-supabase-url</span></div>
                        <div><span className="text-blue-400">SUPABASE_ANON_KEY</span><span className="text-white">=</span><span className="text-green-400">your-anon-key</span></div>
                        <div><span className="text-blue-400">EXPO_PUBLIC_API_URL</span><span className="text-white">=</span><span className="text-green-400">https://naf.ltdestacio.com.br/api</span></div>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      const envText = repo.id === 'website' 
                        ? `NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key\nNEXTAUTH_SECRET=your-secret-key\nNEXTAUTH_URL=http://localhost:3000\nDATABASE_URL=postgresql://...\nEMAIL_USER=your-email@gmail.com\nEMAIL_APP_PASSWORD=your-app-password\nEMAILJS_SERVICE_ID=your-service-id\nEMAILJS_TEMPLATE_ID=your-template-id\nEMAILJS_PUBLIC_KEY=your-public-key\nGEMINI_API_KEY=your-gemini-key`
                        : `API_BASE_URL=https://naf.ltdestacio.com.br\nSUPABASE_URL=your-supabase-url\nSUPABASE_ANON_KEY=your-anon-key\nEXPO_PUBLIC_API_URL=https://naf.ltdestacio.com.br/api`
                      
                      copyToClipboard(envText, `env-${repo.id}`)
                    }}
                  >
                    {copiedUrl === `env-${repo.id}` ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Template .env
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Documentação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Documentação e Recursos
                  </CardTitle>
                  <CardDescription>
                    Links úteis para desenvolvimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <FileText className="h-5 w-5 mr-3 text-blue-500" />
                      <div className="text-left">
                        <p className="font-semibold">README.md</p>
                        <p className="text-xs text-gray-500">Documentação completa do projeto</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <Folder className="h-5 w-5 mr-3 text-yellow-500" />
                      <div className="text-left">
                        <p className="font-semibold">Pasta /doc</p>
                        <p className="text-xs text-gray-500">Documentação técnica detalhada</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <GitCommit className="h-5 w-5 mr-3 text-purple-500" />
                      <div className="text-left">
                        <p className="font-semibold">CHANGELOG.md</p>
                        <p className="text-xs text-gray-500">Histórico de versões e mudanças</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <HelpCircle className="h-5 w-5 mr-3 text-orange-500" />
                      <div className="text-left">
                        <p className="font-semibold">FAQ.md</p>
                        <p className="text-xs text-gray-500">Perguntas frequentes</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Suporte */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">Precisa de Ajuda?</h4>
                      <p className="text-sm text-blue-800 mb-4">
                        Se tiver dúvidas sobre o código ou encontrar problemas, entre em contato com a equipe de desenvolvimento.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Contatar Equipe
                        </Button>
                        <Button size="sm" variant="outline">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Abrir Issue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                const repo = REPOSITORIES.find(r => r.id === 'website')
                if (repo) handleDownload(repo.id, repo.name, repo.downloadUrl)
              }}
            >
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-sm">Download Website</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                const repo = REPOSITORIES.find(r => r.id === 'app')
                if (repo) handleDownload(repo.id, repo.name, repo.downloadUrl)
              }}
            >
              <Smartphone className="h-6 w-6 text-green-500" />
              <span className="text-sm">Download App</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={async () => {
                const website = REPOSITORIES.find(r => r.id === 'website')
                const app = REPOSITORIES.find(r => r.id === 'app')
                
                if (website && app) {
                  if (confirm('Deseja baixar AMBOS os repositórios?\n\nIsso pode levar alguns minutos e ocupar cerca de 245 MB de espaço.')) {
                    await handleDownload(website.id, website.name, website.downloadUrl)
                    setTimeout(async () => {
                      await handleDownload(app.id, app.name, app.downloadUrl)
                    }, 1000)
                  }
                }
              }}
            >
              <Archive className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Download Completo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estatísticas de Uso do Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Downloads este mês</p>
                <p className="text-2xl font-bold text-blue-700">127</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Website</p>
                <p className="text-xl font-bold text-green-700">78 downloads</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">App</p>
                <p className="text-xl font-bold text-purple-700">49 downloads</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer com Avisos */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ Importante:</strong> O código fonte é de propriedade da Estácio e destinado apenas para fins educacionais e de desenvolvimento interno do NAF.
          Não distribua ou publique o código sem autorização expressa.
        </AlertDescription>
      </Alert>
    </div>
  )
}
