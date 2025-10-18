import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = "Carregando...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  message = "Ocorreu um erro", 
  onRetry, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  title = "Nenhum item encontrado",
  description = "Não há dados para exibir no momento.",
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-400 text-3xl">📭</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}
