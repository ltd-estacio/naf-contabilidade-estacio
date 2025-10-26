'use client'

import React, { ReactNode } from 'react'

interface ResponsiveGridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8'
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
}

/**
 * Grid responsivo otimizado para dashboards
 * - Mobile: 1 coluna (exceto cols=6 que usa 2)
 * - Tablet (sm): 2 colunas (ou 3 para cols=6)
 * - Desktop (lg): número especificado de colunas
 */
export default function ResponsiveGrid({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}
