'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, Code, Smartphone, Globe, GitBranch, Package,
  Folder, CheckCircle, Clock, FolderTree, FileText, Terminal, 
  Settings, RefreshCw, Archive, GitCommit, Users, Activity, TrendingUp,
  ExternalLink, Copy, Check, BookOpen, Zap, Layers, Shield, Key, 
  Info, HelpCircle, AlertCircle
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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [stats] = useState({
    totalDownloads: 127,
    lastUpdate: '2 horas atrás',
    activeDevs: 3,
    openIssues: 8
  })

  const handleDownload = async (repoId: string, repoName: string, downloadUrl: string) => {
    setDownloading(repoId)
    setDownloadProgress(0)
    
    try {
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      await new Promise(resolve => setTimeout(resolve, 2500))

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${repoName.toLowerCase().replace(/\s/g, '-')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`✅ Download do ${repoName} iniciado com sucesso!\\n\\n📦 O arquivo ZIP será salvo na sua pasta de Downloads.`)
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

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Acesso Autorizado:</strong> Como coordenador, você tem permissão para baixar o código fonte completo dos repositórios do NAF. Os arquivos serão baixados em formato ZIP.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Code className="h-6 w-6" />
            Gerenciador de Código Fonte
          </CardTitle>
          <CardDescription className="mt-2">
            Visualize, gerencie e baixe o código fonte dos projetos do NAF
          </CardDescription>
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
                  </div>

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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Estrutura do Projeto
                  </CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Funcionalidades Implementadas
                  </CardTitle>
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
            </TabsContent>
          )
        })}
      </Tabs>

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
                  if (confirm('Deseja baixar AMBOS os repositórios?\\n\\nIsso pode levar alguns minutos e ocupar cerca de 245 MB de espaço.')) {
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

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ Importante:</strong> O código fonte é de propriedade da Estácio e destinado apenas para fins educacionais e de desenvolvimento interno do NAF. Não distribua ou publique o código sem autorização expressa.
        </AlertDescription>
      </Alert>
    </div>
  )
}
