'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Tablet } from 'lucide-react'

/**
 * Indicador visual de breakpoint atual
 * Útil durante desenvolvimento para verificar responsividade
 *
 * Para usar, adicione ao seu layout:
 * import ResponsiveIndicator from '@/components/dev/ResponsiveIndicator'
 *
 * E no JSX (apenas em desenvolvimento):
 * {process.env.NODE_ENV === 'development' && <ResponsiveIndicator />}
 */
export default function ResponsiveIndicator() {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)

    // Set initial width
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getBreakpoint = () => {
    if (windowWidth < 640) return { name: 'Mobile', icon: Smartphone, color: 'bg-red-500', range: '0-639px' }
    if (windowWidth < 1024) return { name: 'Tablet', icon: Tablet, color: 'bg-yellow-500', range: '640-1023px' }
    return { name: 'Desktop', icon: Monitor, color: 'bg-green-500', range: '1024px+' }
  }

  const breakpoint = getBreakpoint()
  const Icon = breakpoint.icon

  // Ocultar em produção
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="flex flex-col gap-2">
        {/* Main Indicator */}
        <div className={`${breakpoint.color} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-mono text-sm`}>
          <Icon className="h-4 w-4" />
          <span className="font-semibold">{breakpoint.name}</span>
          <span className="opacity-80">{windowWidth}px</span>
        </div>

        {/* Detailed Info */}
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs font-mono shadow-lg">
          <div>Range: {breakpoint.range}</div>
          <div className="mt-1 flex gap-2">
            <Badge variant="outline" className="text-[10px] bg-gray-800 border-gray-700">
              {windowWidth < 640 ? '✓' : '○'} sm
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-gray-800 border-gray-700">
              {windowWidth >= 640 && windowWidth < 1024 ? '✓' : '○'} md
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-gray-800 border-gray-700">
              {windowWidth >= 1024 ? '✓' : '○'} lg
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
