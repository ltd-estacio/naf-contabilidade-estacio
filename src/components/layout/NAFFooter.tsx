'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShieldCheck,
  Database,
  Award,
  Calendar,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Users,
  Globe
} from 'lucide-react'

interface FooterProps {
  className?: string
}

export default function NAFFooter({ className = '' }: FooterProps) {
  return (
    <footer className={`relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 text-white ${className}`}>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand & Mission */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">NAF Contábil</h3>
                  <p className="text-sm text-blue-200">Sistema de Gestão</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Núcleo de Apoio Contábil e Fiscal comprometido com a excelência
                na prestação de serviços à comunidade, promovendo educação fiscal
                e desenvolvimento profissional.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Sistema Online • Seguro • Confiável</span>
              </div>
            </div>

            {/* Quick Access */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Acesso Rápido</h4>
              <div className="space-y-3">
                {[
                  { icon: Calendar, label: 'Agendar Atendimento', href: '/schedule' },
                  { icon: FileText, label: 'Serviços Disponíveis', href: '/services' },
                  { icon: Users, label: 'Portal do Estudante', href: '/student-portal' },
                  { icon: MessageCircle, label: 'Central de Ajuda', href: '/help' },
                  { icon: Globe, label: 'Site Institucional', href: '/' }
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Contato</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Email</p>
                    <p className="text-sm text-white font-medium">naf@estacio.br</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Telefone</p>
                    <p className="text-sm text-white font-medium">(48) 98461-4449</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Endereço</p>
                    <p className="text-sm text-white font-medium">
                      Campus Universitário<br />
                      Florianópolis - SC, 01000-000
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Atendimento</p>
                    <p className="text-sm text-white font-medium">
                      Segunda a Sexta<br />
                      08:00 às 18:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status & Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Sistema</h4>
              <div className="space-y-4">
                {/* Status Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-200">Status do Sistema</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-300">Operacional</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-200">Banco de Dados</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-300">Conectado</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-200">Última Atualização</span>
                    <span className="text-blue-100">{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Version Info */}
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-center text-blue-200">
                    <p className="font-medium">NAF Contábil v1.0.0</p>
                    <p className="mt-1">Build: {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Copyright & Legal */}
              <div className="flex flex-col lg:flex-row items-center gap-4 text-center lg:text-left">
                <p className="text-xs text-blue-200">
                  © {new Date().getFullYear()} NAF Contábil. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-300">
                  <button
                    onClick={() => alert('📋 Termos de Uso\n\nEste sistema segue as diretrizes da Receita Federal e normas de compliance fiscal.')}
                    className="hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => alert('🔒 Política de Privacidade\n\nTodos os dados são protegidos conforme LGPD e diretrizes institucionais.')}
                    className="hover:text-white transition-colors"
                  >
                    Privacidade
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => alert('⚖️ Compliance\n\nSistema em conformidade com RFB, CFC e normativas educacionais.')}
                    className="hover:text-white transition-colors"
                  >
                    Compliance
                  </button>
                </div>
              </div>

              {/* Credits & Performance */}
              <div className="flex items-center gap-6 text-xs text-blue-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span>Certificado SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span>Supabase Cloud</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span>ISO 27001</span>
                </div>
              </div>
            </div>

            {/* Institutional Credits */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-xs text-blue-300/70">
                Desenvolvido em parceria com{' '}
                <span className="font-medium text-blue-200">Receita Federal do Brasil</span>{' '}
                e{' '}
                <span className="font-medium text-blue-200">Instituições de Ensino Superior</span>
              </p>
              <div className="flex items-center justify-center gap-8 mt-2 text-xs text-blue-400/50">
                <span>🏛️ Governo Federal</span>
                <span>🎓 Educação Superior</span>
                <span>📊 Tecnologia Avançada</span>
                <span>🔒 Segurança Máxima</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}