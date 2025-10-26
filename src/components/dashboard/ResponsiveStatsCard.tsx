'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from 'lucide-react'

interface ResponsiveStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'from-green-500 to-emerald-600',
    text: 'text-green-600',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    text: 'text-orange-600',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    text: 'text-red-600',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400'
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    text: 'text-indigo-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400'
  }
}

export default function ResponsiveStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}: ResponsiveStatsCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-current overflow-hidden group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${colors.icon}`} />
          </div>
          {trend && (
            <div className={`text-right ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <div className="text-sm sm:text-base font-semibold">
                {trend.positive ? '+' : ''}{trend.value}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{trend.label}</div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
            {title}
          </h3>
          <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${colors.text} dark:text-white`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
