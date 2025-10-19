import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { TrendingUp, LogOut, Shield, CalendarClock, ArrowRight } from 'lucide-react'

interface NAFHeaderProps {
  user?: { email?: string } | null
  onLogout?: () => void
  className?: string
}

const topNavLinks = [
  { href: '/', label: 'Início', icon: '🏠' },
  { href: '/student-portal', label: 'Portais', icon: '🎓' },
  { href: '/services', label: 'Serviços', icon: '📋' },
  { href: '/naf-login', label: 'Acesso', icon: '🔐' }
]

export default function NAFHeader({ user, onLogout, className = '' }: NAFHeaderProps) {
  return (
    <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-gray-700/50 ${className}`}>
      <div className="w-full px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6">
          {/* Brand & Title Section */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  NAF Contábil
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-slate-600 dark:text-gray-400 font-medium">
                    {user?.email ? `Bem-vindo, ${user.email}` : 'Sistema de Gestão Fiscal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Pills */}
            <nav className="flex flex-wrap justify-center gap-2">
              {topNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-gray-700/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{link.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {link.label}
                    </span>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-100/60 dark:bg-gray-700/60 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">ONLINE</span>
              </div>
              <div className="hidden lg:flex">
                <div className="group relative flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-blue-900/50 dark:bg-blue-950/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Domínio</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-white">naf.ltdestacio.com.br</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Expira em</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-800 dark:text-blue-100">
                      03/05/2026
                      <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                    </span>
                  </div>

                  <div className="absolute inset-x-0 top-full z-10 hidden translate-y-2 overflow-hidden rounded-xl border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-500/20 group-hover:block dark:border-blue-900/50 dark:bg-gray-950/95">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Painel de Domínio</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">Renovação em <span className="text-blue-600 dark:text-blue-400">03/05/2026</span></p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Gerenciado via <span className="font-semibold text-blue-600 dark:text-blue-300">registro.br</span></p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Link href="https://registro.br/painel/" target="_blank" rel="noreferrer">
                          Acessar Registro.br
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {user && onLogout && (
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="border-slate-300 dark:border-gray-600 hover:border-red-300 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
