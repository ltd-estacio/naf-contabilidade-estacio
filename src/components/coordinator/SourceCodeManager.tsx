'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Code, Smartphone, Globe, GitBranch, Package, FileCode, Folder, CheckCircle, AlertCircle } from 'lucide-react'

const REPOSITORIES = [
  {
    id: 'website',
    name: 'Website NAF Estácio',
    description: 'Código fonte completo do site institucional do NAF',
    icon: Globe,
    tech: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    size: '156 MB',
    files: '2,847',
    downloadUrl: '', // URL vazio - código não disponível publicamente
    color: 'bg-blue-500'
  },
  {
    id: 'app',
    name: 'App NAF (Android)',
    description: 'Código fonte do aplicativo mobile Android',
    icon: Smartphone,
    tech: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage'],
    size: '89 MB',
    files: '1,523',
    downloadUrl: '', // URL vazio - código não disponível publicamente
    color: 'bg-green-500'
  }
]

export default function SourceCodeManager() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (repoId: string) => {
    setDownloading(repoId)
    
    // Simular download
    setTimeout(() => {
      alert('Download do código fonte não disponível no momento.\\n\\nMotivo: O código fonte é proprietário e mantido em repositório privado.')
      setDownloading(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Código Proprietário:</strong> O código fonte do site e do app NAF são propriedade da Estácio e mantidos em repositórios privados no GitHub.
          Para acesso ao código completo, entre em contato com o departamento de TI.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {REPOSITORIES.map(repo => {
          const Icon = repo.icon
          const isDownloading = downloading === repo.id

          return (
            <Card key={repo.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${repo.color}`} />
              
              <CardHeader className="pl-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${repo.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${repo.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{repo.name}</CardTitle>
                      <CardDescription className="mt-1">{repo.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pl-6 space-y-4">
                {/* Tecnologias */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">Tecnologias</h4>
                  <div className="flex flex-wrap gap-2">
                    {repo.tech.map(tech => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tamanho</p>
                    <p className="font-semibold">{repo.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Arquivos</p>
                    <p className="font-semibold">{repo.files}</p>
                  </div>
                </div>

                {/* Botão Download */}
                <Button 
                  className="w-full" 
                  onClick={() => handleDownload(repo.id)}
                  disabled={isDownloading || !repo.downloadUrl}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Preparando Download...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {repo.downloadUrl ? 'Baixar Código Fonte' : 'Indisponível'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Código mantido em repositório privado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre o Código Fonte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Repositórios
            </h4>
            <p className="text-sm text-gray-600">
              Os códigos são mantidos em repositórios privados do GitHub sob a organização da Estácio.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estrutura do Projeto
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs">
              <div className="space-y-1">
                <div>📁 naf-website/</div>
                <div className="ml-4">├── 📁 src/app/</div>
                <div className="ml-4">├── 📁 src/components/</div>
                <div className="ml-4">├── 📁 src/lib/</div>
                <div className="ml-4">├── 📁 public/</div>
                <div className="ml-4">└── 📄 package.json</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Documentação
            </h4>
            <p className="text-sm text-gray-600">
              Documentação técnica completa disponível no README.md de cada repositório.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
