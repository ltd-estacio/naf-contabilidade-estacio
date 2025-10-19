'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MainNavigationProps {
  showBrand?: boolean
}

const primaryLinks = [
  { href: '/', label: 'Início' },
  { href: '/naf-scheduling', label: 'Agendar Atendimento' },
  { href: '/eligibility', label: 'Elegibilidade' },
  { href: '/services', label: 'Serviços' },
  { href: '/fiscal-guides', label: 'Guias Fiscais' },
  { href: '/contact', label: 'Contato' }
]

const actionLinks = [
  { href: '/student-login-simple', label: 'Portal do Estudante' },
  { href: '/coordinator-dashboard', label: 'Dashboard Coordenador' }
]

export default function MainNavigation({ showBrand = true }: MainNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="w-full bg-white/85 backdrop-blur shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4">
          <div className={`flex flex-col lg:flex-row lg:items-center ${showBrand ? 'lg:justify-between' : 'lg:justify-center'} gap-4`}>
            {showBrand && (
              <Link href="/" className="flex items-center gap-3 text-gray-900 hover:opacity-80 transition-opacity">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                  <Calculator className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold">NAF Estácio Florianópolis</p>
                  <span className="text-sm text-slate-600">Núcleo de Apoio Contábil e Fiscal</span>
                </div>
              </Link>
            )}

            <nav className={`flex flex-wrap items-center gap-1 ${showBrand ? 'lg:justify-end' : 'lg:justify-center'}`}>
              {primaryLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-start gap-3">
              <Link href="/naf-scheduling" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Agendar Atendimento
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/eligibility" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50">
                  Verificar Elegibilidade
                </Button>
              </Link>
            </div>
            <div className="flex flex-1 flex-col sm:flex-row sm:justify-end gap-2">
              {actionLinks.map(link => (
                <Link key={link.href} href={link.href} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
