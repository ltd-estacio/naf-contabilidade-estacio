'use client'

import React from 'react'
import MainNavigation from './MainNavigation'

interface PageWithNavigationProps {
  children: React.ReactNode
  showNavigation?: boolean
  className?: string
}

const PageWithNavigation = ({
  children,
  showNavigation = true,
  className = ""
}: PageWithNavigationProps) => {
  return (
    <>
      {showNavigation && <MainNavigation />}
      <div className={className}>
        {children}
      </div>
    </>
  )
}

export default PageWithNavigation