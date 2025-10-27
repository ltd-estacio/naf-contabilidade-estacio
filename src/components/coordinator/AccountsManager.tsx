'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Key, Database, Sparkles, Eye, EyeOff, Copy, CheckCircle, ExternalLink, Shield, AlertTriangle } from 'lucide-react'

const ACCOUNTS = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Conta principal de email do sistema',
    icon: Mail,
    color: 'bg-red-500',
    credentials: {
      email: 'souzaestevam925@gmail.com',
      password: 'ltd-estacio@2025',
      appPassword: 'kczj vzqk nlse iddy'
    },
    status: 'active',
    url: 'https://mail.google.com'
  },
  {
    id: 'emailjs',
    name: 'EmailJS',
    description: 'Serviço de envio de emails automatizados',
    icon: Mail,
    color: 'bg-blue-500',
    credentials: {
      email: 'souzaestevam925@gmail.com',
      password: 'souzaestevam925@gmail.com',
      serviceId: 'service_xehr3ta',
      templateId: 'template_d2rfx39',
      publicKey: 'nGm0I7osOMW7psoqF'
    },
    envVars: {
      EMAILJS_SERVICE_ID: 'service_xehr3ta',
      EMAILJS_TEMPLATE_ID: 'template_d2rfx39',
      EMAILJS_PUBLIC_KEY: 'nGm0I7osOMW7psoqF'
    },
    status: 'active',
    url: 'https://dashboard.emailjs.com'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Banco de dados PostgreSQL e autenticação',
    icon: Database,
    color: 'bg-green-500',
    credentials: {
      email: 'testeguetta@gmail.com',
      password: '$VagnerCordeiroltdestacio_2025@estacio'
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://gaevnrnthqxiwrdypour.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTExNzMsImV4cCI6MjA3MzI4NzE3M30.bN-JNpWa3PAd5mg3vhRSTPtOqzwYeP27SV9jVGJyRRw'
    },
    status: 'active',
    url: 'https://supabase.com/dashboard'
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    description: 'API de inteligência artificial generativa',
    icon: Sparkles,
    color: 'bg-purple-500',
    credentials: {
      apiKey: 'AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI'
    },
    envVars: {
      GEMINI_API_KEY: 'AIzaSyCF3MiKx5kpgPC6LVRRRkKfJTm6nWnq4YI'
    },
    status: 'active',
    url: 'https://makersuite.google.com/app/apikey'
  }
]

export default function AccountsManager() {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const togglePasswordVisibility = (accountId: string, field: string) => {
    const key = `${accountId}-${field}`
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(key)) {
      newVisible.delete(key)
    } else {
      newVisible.add(key)
    }
    setVisiblePasswords(newVisible)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItems(new Set(copiedItems).add(id))
    setTimeout(() => {
      const newCopied = new Set(copiedItems)
      newCopied.delete(id)
      setCopiedItems(newCopied)
    }, 2000)
  }

  const isPasswordVisible = (accountId: string, field: string) => {
    return visiblePasswords.has(`${accountId}-${field}`)
  }

  const isCopied = (id: string) => copiedItems.has(id)

  return (
    <div className="space-y-6">
      <Alert className="border-yellow-200 bg-yellow-50">
        <Shield className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Atenção:</strong> Essas informações são altamente confidenciais. Não compartilhe com terceiros.
          Mantenha essas credenciais em local seguro e protegido.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {ACCOUNTS.map(account => {
          const Icon = account.icon
          
          return (
            <Card key={account.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${account.color}`} />
              
              <CardHeader className="pl-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${account.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${account.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{account.name}</CardTitle>
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{account.description}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(account.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pl-6 space-y-4">
                {/* Credenciais de Login */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Credenciais de Login</h4>
                  
                  {Object.entries(account.credentials).map(([key, value]) => {
                    const fieldId = `${account.id}-${key}`
                    const isPassword = key.includes('password') || key.includes('Password') || key.includes('Key') || key.includes('key')
                    const visible = isPasswordVisible(account.id, key)
                    
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-gray-600 uppercase">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <div className="flex gap-1">
                            {isPassword && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => togglePasswordVisibility(account.id, key)}
                              >
                                {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(value, fieldId)}
                            >
                              {isCopied(fieldId) ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <code className="text-sm font-mono break-all">
                          {isPassword && !visible ? '•'.repeat(value.length) : value}
                        </code>
                      </div>
                    )
                  })}
                </div>

                {/* Variáveis de Ambiente */}
                {account.envVars && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Variáveis de Ambiente (.env.local)</h4>
                    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code className="text-xs text-green-400 font-mono whitespace-pre">
                        {Object.entries(account.envVars).map(([key, value]) => 
                          `${key}=${value}`
                        ).join('\n')}
                      </code>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const envText = Object.entries(account.envVars!).map(([key, value]) => 
                          `${key}=${value}`
                        ).join('\n')
                        copyToClipboard(envText, `${account.id}-env`)
                      }}
                    >
                      {isCopied(`${account.id}-env`) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Variáveis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Instruções de Segurança */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Boas Práticas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-red-700">
          <p>• <strong>Nunca compartilhe</strong> essas credenciais com terceiros</p>
          <p>• <strong>Não faça commit</strong> do arquivo .env.local no Git</p>
          <p>• <strong>Mantenha backups</strong> dessas informações em local seguro</p>
          <p>• <strong>Altere senhas periodicamente</strong> para maior segurança</p>
          <p>• <strong>Use autenticação de dois fatores</strong> quando disponível</p>
          <p>• <strong>Monitore acessos suspeitos</strong> nas dashboards das plataformas</p>
        </CardContent>
      </Card>

      {/* Arquivo .env.local Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Arquivo .env.local Completo</CardTitle>
          <CardDescription>Copie e cole no arquivo .env.local na raiz do projeto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-xs text-green-400 font-mono whitespace-pre">
              {ACCOUNTS.filter(acc => acc.envVars).map(acc => 
                Object.entries(acc.envVars!).map(([key, value]) => 
                  `${key}=${value}`
                ).join('\n')
              ).join('\n\n')}
            </code>
          </div>
          <Button 
            className="w-full"
            onClick={() => {
              const allEnvVars = ACCOUNTS
                .filter(acc => acc.envVars)
                .map(acc => 
                  Object.entries(acc.envVars!).map(([key, value]) => 
                    `${key}=${value}`
                  ).join('\n')
                ).join('\n\n')
              copyToClipboard(allEnvVars, 'all-env')
            }}
          >
            {isCopied('all-env') ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Todas as Variáveis Copiadas!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todas as Variáveis de Ambiente
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
