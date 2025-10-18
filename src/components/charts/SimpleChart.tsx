'use client'

import React from 'react'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface ChartProps {
  data: DataPoint[]
  type: 'bar' | 'pie' | 'line'
  title?: string
  className?: string
  height?: number
}

export function SimpleChart({ data, type, title, className = '', height = 200 }: ChartProps) {
  // Validar se há dados
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-950 rounded-lg p-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        )}
        <div style={{ height: `${height}px` }} className="flex items-center justify-center text-gray-500">
          Sem dados disponíveis
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1) // Garantir mínimo de 1 para evitar -Infinity

  // Estácio-inspired palette (azul como primária)
  const brandBlue = '#0057B8'
  const brandTeal = '#00A3E0'
  const brandNavy = '#003C8F'
  const brandGreen = '#10B981'
  const brandGold = '#F59E0B'
  const brandRed = '#EF4444'
  const brandPurple = '#6D28D9'
  const brandCyan = '#06B6D4'
  const brandLime = '#84CC16'
  const brandPink = '#EC4899'

  const defaultColors = [
    brandBlue, brandTeal, brandGreen, brandGold, brandRed,
    brandPurple, brandCyan, brandLime, brandPink, '#6B7280'
  ]

  const renderBarChart = () => {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || defaultColors[index % defaultColors.length]
                }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativeAngle = 0

    return (
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (item.value / total) * 360
              const startAngle = cumulativeAngle
              const endAngle = cumulativeAngle + angle

              cumulativeAngle += angle

              // Convert angles to radians
              const startRad = (startAngle - 90) * (Math.PI / 180)
              const endRad = (endAngle - 90) * (Math.PI / 180)

              const largeArcFlag = angle > 180 ? 1 : 0
              const radius = 70
              const centerX = 80
              const centerY = 80

              const x1 = centerX + radius * Math.cos(startRad)
              const y1 = centerY + radius * Math.sin(startRad)
              const x2 = centerX + radius * Math.cos(endRad)
              const y2 = centerY + radius * Math.sin(endRad)

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || defaultColors[index % defaultColors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
                />
                <div className="text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    const chartWidth = 300
    const chartHeight = height - 40
    const padding = 20

    const xStep = data.length > 1 ? (chartWidth - 2 * padding) / (data.length - 1) : 0

    const points = data.map((item, index) => {
      const x = padding + index * xStep
      const y = chartHeight - ((item.value / maxValue) * (chartHeight - 2 * padding)) + padding
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="space-y-4">
        <svg width={chartWidth} height={height} className="border rounded">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => {
            const y = chartHeight - ((percent / 100) * maxValue / maxValue) * (chartHeight - 2 * padding) + padding
            return (
              <line
                key={percent}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            )
          })}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={brandBlue}
            strokeWidth="3"
            className="transition-all duration-500"
          />

          {/* Points */}
          {data.map((item, index) => {
            const x = padding + index * xStep
            const y = chartHeight - ((item.value / maxValue) * (chartHeight - 2 * padding)) + padding
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={brandTeal}
                className="hover:r-6 transition-all cursor-pointer"
                title={`${item.label}: ${item.value}`}
              />
            )
          })}
        </svg>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-5">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{item.label}</div>
              <div className="text-blue-600">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-950 rounded-lg p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  )
}

export default SimpleChart
