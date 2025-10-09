import { useState, useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'

interface ChatLinkData {
  id: string
  token: string
  slug: string
  title: string
  description: string | null
  customMessage: string | null
  studentName: string
  createdAt: string
}

interface UseChatLinkReturn {
  isValid: boolean
  isLoading: boolean
  linkData: ChatLinkData | null
  error: string | null
  registerUsage: (userId?: string, conversationId?: number) => Promise<void>
}

export function useChatLink(): UseChatLinkReturn {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [linkData, setLinkData] = useState<ChatLinkData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    validateLink()
  }, [searchParams, pathname])

  const validateLink = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Verificar se há um link na URL
      // Formato 1: /chat?link=CHAT-XXXXXXXX
      const linkToken = searchParams?.get('link')

      // Formato 2: /chat/slug-do-estudante
      let linkSlug: string | null = null
      if (pathname?.startsWith('/chat/') && pathname !== '/chat') {
        linkSlug = pathname.split('/chat/')[1]
      }

      // Se não há link, o chat permanece invisível
      if (!linkToken && !linkSlug) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      // Validar link com a API
      const params = new URLSearchParams()
      if (linkToken) params.set('token', linkToken)
      if (linkSlug) params.set('slug', linkSlug)

      const response = await fetch(`/api/chat/validate-link?${params.toString()}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValid(true)
        setLinkData(data.link)

        // Salvar no localStorage para persistir durante a sessão
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatLink', JSON.stringify({
            token: linkToken || data.link.token,
            slug: linkSlug || data.link.slug,
            validatedAt: new Date().toISOString()
          }))
        }
      } else {
        setIsValid(false)
        setError(data.error || 'Link inválido')
        console.warn('Link inválido:', data.error)
      }
    } catch (err: any) {
      console.error('Erro ao validar link:', err)
      setIsValid(false)
      setError(err.message || 'Erro ao validar link')
    } finally {
      setIsLoading(false)
    }
  }

  const registerUsage = async (userId?: string, conversationId?: number) => {
    if (!linkData) return

    try {
      // Coletar informações do usuário
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''

      // Tentar obter IP (em produção, você pode usar um serviço externo)
      let userIp: string | null = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        userIp = ipData.ip
      } catch {
        // Ignorar erro de IP
      }

      const response = await fetch('/api/chat/validate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkToken: linkData.token,
          linkSlug: linkData.slug,
          userIp,
          userAgent,
          userId,
          conversationId
        })
      })

      if (!response.ok) {
        console.error('Erro ao registrar uso do link')
      }
    } catch (err) {
      console.error('Erro ao registrar uso do link:', err)
    }
  }

  return {
    isValid,
    isLoading,
    linkData,
    error,
    registerUsage
  }
}

// Hook auxiliar para verificar se o chat deve ser exibido
export function useShouldShowChat(): boolean {
  const { isValid, isLoading } = useChatLink()

  // Também verificar se há um link salvo no localStorage (para persistir durante a navegação)
  const [hasStoredLink, setHasStoredLink] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLink = localStorage.getItem('chatLink')
      if (storedLink) {
        try {
          const parsed = JSON.parse(storedLink)
          // Verificar se o link foi validado nas últimas 24 horas
          const validatedAt = new Date(parsed.validatedAt)
          const now = new Date()
          const hoursSinceValidation = (now.getTime() - validatedAt.getTime()) / (1000 * 60 * 60)

          if (hoursSinceValidation < 24) {
            setHasStoredLink(true)
          } else {
            // Link expirou, remover do localStorage
            localStorage.removeItem('chatLink')
          }
        } catch {
          localStorage.removeItem('chatLink')
        }
      }
    }
  }, [])

  return !isLoading && (isValid || hasStoredLink)
}
