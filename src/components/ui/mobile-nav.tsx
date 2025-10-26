'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, Users, Calendar, FileText, Settings, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { href: '/', icon: <Home size={20} />, label: 'Início' },
  { href: '/services', icon: <FileText size={20} />, label: 'Serviços' },
  { href: '/naf-services', icon: <FileText size={20} />, label: 'Serviços NAF' },
  { href: '/about-naf', icon: <Users size={20} />, label: 'Sobre o NAF' },
  { href: '/dashboard', icon: <Settings size={20} />, label: 'Dashboard', roles: ['COORDINATOR', 'TEACHER', 'STUDENT'] },
  { href: '/schedule', icon: <Calendar size={20} />, label: 'Agendamento' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    if (!session?.user?.role) return false
    return item.roles.includes(session.user.role)
  })

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="relative z-50"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">NAF</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Menu</h2>
                {session?.user && (
                  <p className="text-sm text-gray-600">{session.user.name}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <X size={20} />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggleMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:bg-gray-800 transition-colors"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
            {session ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  signOut()
                  toggleMenu()
                }}
              >
                <LogOut size={20} className="mr-3" />
                Sair
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" onClick={toggleMenu}>
                  <Button className="w-full">
                    Cadastrar-se
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600">Logado como:</p>
              <p className="font-medium text-gray-900">{session.user.name}</p>
              <p className="text-sm text-gray-600">{session.user.email}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 text-xs rounded-full">
                {session.user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
