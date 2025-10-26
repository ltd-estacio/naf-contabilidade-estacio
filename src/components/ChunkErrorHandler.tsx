'use client'

import { useEffect } from 'react'

export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorName = event.error?.name || ''
      const message = event.message || ''

      const isChunkError =
        errorName === 'ChunkLoadError' ||
        errorName === 'LoadChunkError' ||
        message.includes('Loading chunk')

      if (isChunkError) {
        console.warn('Chunk load error detectado, recarregando a página...')
        window.location.reload()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      if (typeof reason === 'object' && reason) {
        const name = (reason as { name?: string }).name || ''
        const message = (reason as { message?: string }).message || ''

        const isChunkError =
          name === 'ChunkLoadError' ||
          name === 'LoadChunkError' ||
          message.includes('Loading chunk')

        if (isChunkError) {
          console.warn('Chunk load error em promessa, recarregando a página...')
          window.location.reload()
        }
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
