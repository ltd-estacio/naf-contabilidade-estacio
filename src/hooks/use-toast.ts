'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: ToastProps) => {
    const id = (++toastCounter).toString()
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return {
      id,
      dismiss: () => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }
    }
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}