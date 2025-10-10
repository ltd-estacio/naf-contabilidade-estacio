'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Link as LinkIcon, ExternalLink, RefreshCw, Clock } from 'lucide-react'

interface GeneratedLink {
  url: string
  token: string
  expiresAt: string
  createdAt: string
}

export default function ChatLinkGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [expirationHours, setExpirationHours] = useState('24')

  const generateLink = async () => {
    if (!linkName.trim()) {
      alert('Por favor, insira um nome para identificar o link')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/chat/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: linkName,
          expirationHours: parseInt(expirationHours)
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedLink(data.link)
      } else {
        alert(data.error || 'Erro ao gerar link')
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      alert('Erro ao gerar link de chat')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Erro ao copiar link')
    }
  }

  const openInNewTab = () => {
    if (!generatedLink) return
    window.open(generatedLink.url, '_blank')
  }

  const resetForm = () => {
    setGeneratedLink(null)
    setLinkName('')
    setExpirationHours('24')
    setCopied(false)
  }

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="shadow-lg border-gray-200 dark:border-gray-800">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Gerador de Links de Chat</CardTitle>
              <CardDescription className="text-base mt-1">
                Crie links personalizados para permitir acesso ao chat sem login
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!generatedLink ? (
            <>
              {/* Form to generate link */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkName" className="text-sm font-medium">
                    Nome/Identificação do Link
                  </Label>
                  <Input
                    id="linkName"
                    placeholder="Ex: Link para Cliente João Silva"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nome é apenas para sua referência interna
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration" className="text-sm font-medium">
                    Tempo de Validade (horas)
                  </Label>
                  <select
                    id="expiration"
                    value={expirationHours}
                    onChange={(e) => setExpirationHours(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="1">1 hora</option>
                    <option value="6">6 horas</option>
                    <option value="12">12 horas</option>
                    <option value="24">24 horas</option>
                    <option value="48">48 horas</option>
                    <option value="72">72 horas</option>
                    <option value="168">7 dias</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Após este período, o link não poderá mais ser usado
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Como funciona?
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Ao gerar o link, qualquer pessoa que acessá-lo poderá visualizar e usar o chat
                      do NAF sem precisar fazer login. O link expira automaticamente após o período definido.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateLink}
                disabled={isGenerating || !linkName.trim()}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Gerando Link...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Gerar Link Personalizado
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Display generated link */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <Check className="mr-1 h-3 w-3" />
                    Link Gerado
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Expira em {formatExpirationDate(generatedLink.expiresAt)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Link Gerado</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={generatedLink.url}
                      className="font-mono text-sm h-11"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-shrink-0 h-11 px-4"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={openInNewTab}
                      variant="outline"
                      className="flex-shrink-0 h-11 px-4"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compartilhe este link com o usuário que deseja dar acesso ao chat
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Atenção
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Este link permitirá acesso ao chat até <strong>{formatExpirationDate(generatedLink.expiresAt)}</strong>.
                        Após esta data, será necessário gerar um novo link.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 h-11"
                  >
                    Gerar Novo Link
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
