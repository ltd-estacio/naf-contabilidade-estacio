'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Users, FileText, UserCheck, Menu } from 'lucide-react'

interface DashboardInlineNavProps {
  className?: string
  triggerClassName?: string
  label?: string
}

interface NavigationSection {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  links: Array<{
    href: string
    label: string
    badge?: string
    description?: string
  }>
}

const sections: NavigationSection[] = [
  {
    title: 'Atalhos',
    icon: Home,
    links: [
      { href: '/', label: 'Início' }
    ]
  },
  {
    title: 'Portais',
    icon: Users,
    links: [
      { href: '/student-portal', label: 'Portal do Estudante', badge: 'Estudante' },
      { href: '/coordinator-dashboard', label: 'Dashboard Coordenador', badge: 'Admin' },
      { href: '/naf-management', label: 'Gestão NAF', badge: 'Gestão' }
    ]
  },
  {
    title: 'Serviços',
    icon: FileText,
    links: [
      { href: '/naf-scheduling', label: 'Agendamento' },
      { href: '/services', label: 'Serviços NAF' },
      { href: '/fiscal-guides', label: 'Guias Fiscais' },
      { href: '/schedule', label: 'Agenda Geral' }
    ]
  },
  {
    title: 'Acesso',
    icon: UserCheck,
    links: [
      { href: '/student-login-simple', label: 'Login Estudante' },
      { href: '/coordinator-login', label: 'Login Coordenador' },
      { href: '/student-register', label: 'Cadastro Estudante' }
    ]
  }
]

const DashboardInlineNav = ({ className = '', triggerClassName = '', label = 'Menu' }: DashboardInlineNavProps) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className={className}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 px-3 ${triggerClassName}`}
          >
            <Menu className="h-4 w-4" />
            <span className="font-medium hidden sm:inline">{label}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-xs p-0">
          <SheetHeader className="px-4 pt-6 pb-4 text-left border-b border-gray-200 dark:border-gray-800">
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Navegação do Portal
            </SheetTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acesse rapidamente as principais áreas do NAF
            </p>
          </SheetHeader>
          <ScrollArea className="h-full">
            <div className="px-4 py-4 space-y-6">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <div key={section.title} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                      {section.title}
                    </div>
                    <div className="space-y-2">
                      {section.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg border transition-all ${
                            isActiveRoute(link.href)
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200'
                              : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 hover:bg-blue-50/60 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <span className="text-sm font-medium">{link.label}</span>
                          {link.badge ? (
                            <Badge variant="outline" className="text-xs">
                              {link.badge}
                            </Badge>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default DashboardInlineNav
