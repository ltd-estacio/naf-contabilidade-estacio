'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Users,
  BarChart3,
  BookOpen,
  Calendar,
  Settings,
  FileText,
  Building2,
  GraduationCap,
  UserCheck,
  Home,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface MainNavigationProps {
  showBrand?: boolean
}

const MainNavigation = ({ showBrand = true }: MainNavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dropdowns, setDropdowns] = useState({
    portals: false,
    services: false,
    management: false
  })
  const pathname = usePathname()

  // Detectar scroll para fixar a navegação
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Não fechar se o clique foi dentro de um dropdown ou em um link
      if (target.closest('.nav-dropdown') || target.closest('.dropdown-trigger')) {
        return
      }
      setDropdowns({ portals: false, services: false, management: false })
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const toggleDropdown = (dropdown: keyof typeof dropdowns) => {
    setDropdowns(prev => ({
      portals: false,
      services: false,
      management: false,
      [dropdown]: !prev[dropdown]
    }))
  }

  const closeAllDropdowns = () => {
    setDropdowns({ portals: false, services: false, management: false })
  }

  // Rotas principais organizadas por categoria
  const navigationRoutes = {
    portals: [
      {
        href: '/student-login-simple',
        label: 'Portal do Estudante',
        icon: GraduationCap,
        description: 'Gerencie suas atividades e treinamentos',
        badge: 'Estudante'
      },
      {
        href: '/coordinator-dashboard',
        label: 'Dashboard Coordenador',
        icon: BarChart3,
        description: 'Métricas e análises avançadas',
        badge: 'Admin'
      },
      {
        href: '/fiscal-guides',
        label: 'Guias Fiscais',
        icon: BookOpen,
        description: 'Legislações e procedimentos',
        badge: 'Guias'
      }
    ],
    services: [
      {
        href: '/naf-scheduling',
        label: 'Agendar',
        icon: Calendar,
        description: 'Agendar atendimentos'
      },
      {
        href: '/eligibility',
        label: 'Verificar Elegibilidade',
        icon: UserCheck,
        description: 'Checar se você é elegível'
      },
      {
        href: '/faq',
        label: 'Perguntas Frequentes',
        icon: BookOpen,
        description: 'Dúvidas comuns'
      },
      {
        href: '/about-naf',
        label: 'Sobre o NAF',
        icon: Building2,
        description: 'Conheça o NAF Estácio'
      },
      {
        href: '/services',
        label: 'Serviços',
        icon: FileText,
        description: 'Lista completa de serviços'
      }
    ],
    auth: [
      {
        href: '/student-login-simple',
        label: 'Login Estudante',
        icon: UserCheck,
        description: 'Acesso estudantil'
      },
      {
        href: '/coordinator-login',
        label: 'Login Coordenador',
        icon: Settings,
        description: 'Acesso administrativo'
      },
      {
        href: '/student-register',
        label: 'Cadastro Estudante',
        icon: Users,
        description: 'Novo cadastro'
      }
    ]
  }

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className={`w-full nav-transition ${
        isScrolled
          ? 'fixed top-0 bg-white/95 dark:bg-gray-900/95 nav-backdrop shadow-lg border-b border-gray-200 dark:border-gray-700'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700'
      }`}
      style={{ zIndex: 99999 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-16 ${showBrand ? 'justify-between' : 'justify-center'}`}>
          {/* Logo */}
          {showBrand && (
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">NAF Estácio Florianópolis</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Núcleo de Apoio Fiscal</p>
              </div>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className={`hidden lg:flex items-center space-x-1 ${!showBrand ? 'flex-1 justify-center' : ''}`}>
            {/* Home */}
            <Link href="/">
              <Button
                variant={isActiveRoute('/') && pathname === '/' ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Início
              </Button>
            </Link>

            {/* Portais Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDropdown('portals')
                }}
              >
                <Users className="h-4 w-4" />
                Portais
                <ChevronDown className={`h-3 w-3 transition-transform ${dropdowns.portals ? 'rotate-180' : ''}`} />
              </Button>

              {dropdowns.portals && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-3 nav-dropdown" style={{ zIndex: 9999 }}>
                  {navigationRoutes.portals.map((route) => {
                    const IconComponent = route.icon
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          isActiveRoute(route.href) ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeAllDropdowns()
                        }}
                      >
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{route.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{route.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {route.badge}
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Serviços Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDropdown('services')
                }}
              >
                <FileText className="h-4 w-4" />
                Serviços
                <ChevronDown className={`h-3 w-3 transition-transform ${dropdowns.services ? 'rotate-180' : ''}`} />
              </Button>

              {dropdowns.services && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-3 nav-dropdown" style={{ zIndex: 9999 }}>
                  {navigationRoutes.services.map((route) => {
                    const IconComponent = route.icon
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          isActiveRoute(route.href) ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeAllDropdowns()
                        }}
                      >
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{route.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{route.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Login/Auth Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDropdown('management')
                }}
              >
                <UserCheck className="h-4 w-4" />
                Acesso
                <ChevronDown className={`h-3 w-3 transition-transform ${dropdowns.management ? 'rotate-180' : ''}`} />
              </Button>

              {dropdowns.management && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-3 nav-dropdown" style={{ zIndex: 9999 }}>
                  {navigationRoutes.auth.map((route) => {
                    const IconComponent = route.icon
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          isActiveRoute(route.href) ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeAllDropdowns()
                        }}
                      >
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{route.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{route.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}

            {/* Quick Access Button */}
            <Link href="/naf-scheduling">
              <Button size="sm" className="hidden sm:flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md mobile-menu-enter">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Home */}
              <Link href="/" onClick={() => {setIsMobileMenuOpen(false); closeAllDropdowns()}}>
                <div className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium ${
                  isActiveRoute('/') && pathname === '/'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                  <Home className="h-5 w-5" />
                  Início
                </div>
              </Link>

              {/* Portais */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portais
                </div>
                {navigationRoutes.portals.map((route) => {
                  const IconComponent = route.icon
                  return (
                    <Link key={route.href} href={route.href} onClick={() => {setIsMobileMenuOpen(false); closeAllDropdowns()}}>
                      <div className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm ${
                        isActiveRoute(route.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                        {route.label}
                        {route.badge && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {route.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Serviços */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Serviços
                </div>
                {navigationRoutes.services.map((route) => {
                  const IconComponent = route.icon
                  return (
                    <Link key={route.href} href={route.href} onClick={() => {setIsMobileMenuOpen(false); closeAllDropdowns()}}>
                      <div className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm ${
                        isActiveRoute(route.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                        {route.label}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Acesso */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acesso
                </div>
                {navigationRoutes.auth.map((route) => {
                  const IconComponent = route.icon
                  return (
                    <Link key={route.href} href={route.href} onClick={() => {setIsMobileMenuOpen(false); closeAllDropdowns()}}>
                      <div className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm ${
                        isActiveRoute(route.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                        {route.label}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tema
                </div>
                <div className="px-3 py-3">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default MainNavigation
