'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Sobre o NAF', href: '/about-naf' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Serviços', href: '/services' },
  { name: 'Agendamento', href: '/schedule' },
  { name: 'Portal do Aluno', href: '/student-portal' },
  { name: 'Login Coordenador', href: '/coordinator-login' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          NAF
        </Link>
        <div className="flex space-x-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                href={link.href}
                key={link.name}
                className={`text-white hover:text-gray-300 ${
                  isActive ? 'font-bold underline' : ''
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
