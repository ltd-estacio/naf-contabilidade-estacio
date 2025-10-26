'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Moon, Sun, Monitor, Check, X, Info } from 'lucide-react'

type StorageTestState = {
  hasLocalStorage: boolean
  storedTheme: string | null
  systemSupported: boolean
  systemPrefersDark: boolean
  currentTheme: string | null
  resolvedTheme: string | null
  systemTheme: string | null
  error?: string
}

export default function ThemeStorageTestPage() {
  const [mounted, setMounted] = useState(false)
  const [storageTest, setStorageTest] = useState<StorageTestState | null>(null)
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    // Testar storage quando componente montar
    const runStorageTest = () => {
      try {
        const testResults: StorageTestState = {
          hasLocalStorage: typeof window !== 'undefined' && !!window.localStorage,
          storedTheme: localStorage.getItem('theme'),
          systemSupported: !!window.matchMedia,
          systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
          currentTheme: theme ?? null,
          resolvedTheme: resolvedTheme ?? null,
          systemTheme: systemTheme ?? null
        }

        setStorageTest(testResults)
      } catch (error) {
        setStorageTest({
          hasLocalStorage: false,
          storedTheme: null,
          systemSupported: false,
          systemPrefersDark: false,
          currentTheme: null,
          resolvedTheme: null,
          systemTheme: null,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }
    
    runStorageTest()
    
    // Re-testar quando tema mudar
    const interval = setInterval(runStorageTest, 1000)
    
    return () => clearInterval(interval)
  }, [theme, resolvedTheme, systemTheme])

  const testPersistence = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    
    // Mostrar instrução para o usuário
    alert(`Tema alterado para ${newTheme}. Agora recarregue a página (F5) para testar se a preferência foi salva.`)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando teste de storage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔍 Teste de Storage - Dark Theme
        </h1>
        
        {/* Status Geral */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Status da Implementação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {storageTest?.hasLocalStorage ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>LocalStorage Disponível</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {storageTest?.systemSupported ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Detecção do Sistema</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {storageTest?.storedTheme ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-orange-500" />
                  )}
                  <span>Tema Armazenado</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p><strong>Tema Atual:</strong> {resolvedTheme || 'Carregando...'}</p>
                <p><strong>Tema do Sistema:</strong> {systemTheme || 'Não detectado'}</p>
                <p><strong>Tema Salvo:</strong> {storageTest?.storedTheme || 'Nenhum'}</p>
                <p><strong>Sistema Prefere Escuro:</strong> {storageTest?.systemPrefersDark ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles de Tema */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Controles de Tema</CardTitle>
            <CardDescription>Use os botões abaixo para testar a alternância de tema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Claro
              </Button>
              
              <Button 
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Escuro
              </Button>
              
              <Button 
                onClick={() => setTheme('system')}
                variant={theme === 'system' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Persistência */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Teste de Persistência</CardTitle>
            <CardDescription>
              Teste se as preferências são mantidas após recarregar a página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testPersistence}
                size="lg"
                className="w-full"
              >
                🔄 Alternar Tema e Testar Persistência
              </Button>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📋 Como testar:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>Clique no botão acima para alternar o tema</li>
                  <li>Recarregue a página (F5) ou Ctrl+R</li>
                  <li>Verifique se o tema permaneceu o mesmo</li>
                  <li>Feche e reabra o navegador</li>
                  <li>Abra uma nova aba com o site</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(storageTest, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
