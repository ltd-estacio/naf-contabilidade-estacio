'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gavel,
  Mail,
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  BookOpen,
  Shield,
  Scale,
  AlertCircle
} from 'lucide-react'
import MainNavigation from '@/components/MainNavigation'

export default function TermsOfService() {
  const userResponsibilities = [
    {
      icon: UserCheck,
      title: "Informações Verdadeiras",
      description: "Fornecer dados pessoais e acadêmicos corretos e atualizados",
      type: "required"
    },
    {
      icon: CheckCircle,
      title: "Uso Adequado",
      description: "Utilizar a plataforma apenas para fins educacionais e profissionais",
      type: "required"
    },
    {
      icon: Shield,
      title: "Confidencialidade",
      description: "Manter sigilo sobre informações de clientes e casos atendidos",
      type: "required"
    },
    {
      icon: Clock,
      title: "Pontualidade",
      description: "Comparecer pontualmente aos atendimentos agendados",
      type: "recommended"
    }
  ]

  const prohibitedActivities = [
    {
      icon: XCircle,
      title: "Uso Comercial Não Autorizado",
      description: "Utilizar a plataforma para fins comerciais próprios",
      severity: "high"
    },
    {
      icon: AlertTriangle,
      title: "Compartilhamento de Credenciais",
      description: "Compartilhar login e senha com terceiros",
      severity: "high"
    },
    {
      icon: XCircle,
      title: "Violação de Dados",
      description: "Acessar ou divulgar informações confidenciais",
      severity: "critical"
    },
    {
      icon: AlertTriangle,
      title: "Comportamento Inadequado",
      description: "Assédio, discriminação ou conduta antiética",
      severity: "critical"
    }
  ]

  const services = [
    {
      title: "Orientação Fiscal",
      description: "Esclarecimentos sobre obrigações tributárias"
    },
    {
      title: "Declaração de IR",
      description: "Auxílio na elaboração da declaração do Imposto de Renda"
    },
    {
      title: "Cadastro MEI",
      description: "Orientação para abertura de Microempreendedor Individual"
    },
    {
      title: "Regularização Fiscal",
      description: "Orientação sobre parcelamentos e certidões"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <MainNavigation />

      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Termos de Serviço
            </h1>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Estes termos definem as condições de uso da plataforma NAF Contábil e estabelecem
            os direitos e deveres de todos os usuários.
          </p>

          <div className="flex items-center justify-center mt-6 space-x-4">
            <Badge variant="outline" className="bg-white dark:bg-gray-950">
              <Calendar className="h-4 w-4 mr-2" />
              Vigência: 20 de Setembro de 2024
            </Badge>
            <Badge variant="outline" className="bg-white dark:bg-gray-950">
              <Scale className="h-4 w-4 mr-2" />
              Versão 3.1
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Definições */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <BookOpen className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Definições e Conceitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-800">NAF (Núcleo de Apoio Contábil e Fiscal)</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Programa de extensão universitária que oferece serviços gratuitos de orientação
                      contábil e fiscal para a comunidade.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-800">Usuário</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Estudante, coordenador ou beneficiário que utiliza a plataforma NAF Contábil.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-800">Plataforma</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Sistema digital NAF Contábil, incluindo website, aplicações e serviços relacionados.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-orange-800">Atendimento</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Sessão de orientação contábil ou fiscal realizada entre estudante e beneficiário.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Serviços Oferecidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Users className="h-6 w-6 mr-3 text-green-600" />
                  Serviços Oferecidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {services.map((service, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">{service.title}</h4>
                      <p className="text-green-700 text-sm mt-1">{service.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Importante:</h4>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                    <li>• Os serviços são prestados por estudantes supervisionados</li>
                    <li>• Não substituem a consultoria de profissionais registrados</li>
                    <li>• Destinados exclusivamente a fins educacionais e sociais</li>
                    <li>• Gratuitos para pessoas de baixa renda comprovada</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Responsabilidades do Usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <UserCheck className="h-6 w-6 mr-3 text-purple-600" />
                  Responsabilidades do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userResponsibilities.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'required'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <Badge
                            variant={item.type === 'required' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {item.type === 'required' ? 'Obrigatório' : 'Recomendado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividades Proibidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                  Atividades Proibidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prohibitedActivities.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        item.severity === 'critical'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <Badge
                            variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {item.severity === 'critical' ? 'Grave' : 'Moderado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Consequências:</h4>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• Suspensão temporária ou permanente da conta</li>
                    <li>• Notificação à coordenação acadêmica</li>
                    <li>• Possíveis sanções disciplinares</li>
                    <li>• Responsabilização civil e criminal, quando aplicável</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitações e Isenções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <AlertCircle className="h-6 w-6 mr-3 text-orange-600" />
                  Limitações de Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Limitações dos Serviços</h4>
                  <ul className="text-orange-700 space-y-1 text-sm">
                    <li>• Os atendimentos têm finalidade exclusivamente educacional</li>
                    <li>• Não substituem consultoria profissional registrada</li>
                    <li>• Estudantes estão em processo de formação</li>
                    <li>• Supervisão acadêmica pode não cobrir todos os aspectos</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Isenção de Responsabilidade</h4>
                  <ul className="text-yellow-700 space-y-1 text-sm">
                    <li>• Decisões baseadas nas orientações são de responsabilidade do usuário</li>
                    <li>• Não nos responsabilizamos por perdas ou danos decorrentes</li>
                    <li>• Recomendamos sempre buscar confirmação profissional</li>
                    <li>• Casos complexos devem ser direcionados a profissionais habilitados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Modificações dos Termos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Calendar className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Alterações destes Termos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento,
                    com notificação prévia através da plataforma.
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Processo de Alteração:</h4>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                      <li>• Notificação com 30 dias de antecedência</li>
                      <li>• Publicação da nova versão na plataforma</li>
                      <li>• Solicitação de aceite para usuários ativos</li>
                      <li>• Manutenção do histórico de versões</li>
                    </ul>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    A continuidade do uso da plataforma após as alterações constitui
                    aceite automático dos novos termos.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Contato Jurídico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg dark:bg-gray-900 dark:border-gray-800">
                  <Gavel className="h-5 w-5 mr-2 text-green-600" />
                  Departamento Jurídico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Dr. Carlos Mendes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assessor Jurídico</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>juridico@naf-contabil.com</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contato Jurídico
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Rápido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">Resumo dos Termos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Serviços gratuitos para fins educacionais</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Uso responsável e ético obrigatório</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Não substitui consultoria profissional</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Uso comercial é proibido</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links Relacionados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">Documentos Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/privacy-policy">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Política de Privacidade
                    </Button>
                  </Link>

                  <Link href="/about-naf">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Sobre o NAF
                    </Button>
                  </Link>

                  <Link href="/faq">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Perguntas Frequentes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Status Legal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">Status Legal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Vigente
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ativos</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800">
                      <Scale className="h-3 w-3 mr-1" />
                      Marco Civil
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Compliance</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <FileText className="h-3 w-3 mr-1" />
                      CDC
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proteção</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Estes termos estão em conformidade com a legislação brasileira
                    e regulamentações educacionais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer de Aceite */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Aceite dos Termos</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ao utilizar a plataforma NAF Contábil, você declara ter lido e concordar
                integralmente com estes Termos de Serviço.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Li e Concordo
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Data do último aceite será registrada para fins de comprovação
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}