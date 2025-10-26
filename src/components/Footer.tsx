import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Users,
  BarChart3,
  BookOpen,
  FileText,
  ArrowRight,
  Clock,
  Zap,
  Calculator,
  TrendingUp,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-gray-200 border-t border-white/10 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">NAF Estácio</h3>
                <p className="text-xs text-gray-400">Núcleo de Apoio Contábil e Fiscal</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Orientação fiscal e contábil gratuita para a comunidade. Apoio especializado dos estudantes da Estácio Florianópolis, acompanhados por profissionais experientes.
            </p>
            <div className="mt-6 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                <span>Atendimento híbrido (online e presencial)</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>Mais de 2.000 atendimentos realizados</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span>Equipe multidisciplinar e treinada</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Serviços em Destaque
            </h3>
            <div className="space-y-3">
              {[
                'Declaração de Imposto de Renda',
                'Regularização de CPF/CNPJ',
                'Orientação MEI',
                'Consultoria Fiscal',
                'Guias e Obrigações Mensais'
              ].map((service, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <ArrowRight className="h-3 w-3 mt-1 text-blue-400 flex-shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/services" className="inline-flex items-center text-sm text-blue-400 hover:text-white transition-colors">
                Ver todos os serviços
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Acesso Rápido
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <Link href="/student-login-simple" className="block hover:text-green-400 transition-colors">
                → Portal do Estudante
              </Link>
              <Link href="/coordinator-dashboard" className="block hover:text-green-400 transition-colors">
                → Dashboard Coordenador
              </Link>
              <Link href="/naf-scheduling" className="block hover:text-green-400 transition-colors">
                → Agendar Atendimento
              </Link>
              <Link href="/fiscal-guides" className="block hover:text-green-400 transition-colors">
                → Guias Fiscais
              </Link>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-300">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-400" />
                Painéis Inteligentes
              </h4>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 rounded border border-white/10">Power BI</span>
                <span className="px-2 py-1 rounded border border-white/10">Relatórios Automatizados</span>
                <span className="px-2 py-1 rounded border border-white/10">Exportação CSV/PDF</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-400" />
              Contato
            </h3>
            <div className="space-y-5 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-orange-400 mt-1" />
                <div>
                  <p className="font-semibold text-gray-200">Faculdade Estácio Florianópolis</p>
                  <p className="text-xs text-gray-400">Núcleo de Apoio Fiscal - NAF</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-orange-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="text-sm text-blue-400 font-semibold">(48) 98461-4449</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-orange-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-blue-400">naf@estacio.br</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-orange-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Horário</p>
                  <p className="text-sm text-gray-300">Segunda a sexta, 8h às 17h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-orange-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Equipe</p>
                  <p className="text-sm text-gray-300">Professores, coordenadores e estudantes certificados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} NAF Estácio Florianópolis. Todos os direitos reservados.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Link href="https://www.instagram.com/estacioflorianopolis/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram Estácio Florianópolis" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/school/estacio/?originalSubdomain=br" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Estácio" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://www.facebook.com/br.estacio/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Estácio" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/user/Estacio" target="_blank" rel="noopener noreferrer" aria-label="YouTube Estácio" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/estacio_br?lang=en" target="_blank" rel="noopener noreferrer" aria-label="Perfil no X da Estácio" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Site Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
