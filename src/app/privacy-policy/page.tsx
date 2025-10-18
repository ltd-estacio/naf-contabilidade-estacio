'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Mail,
  ArrowLeft,
  Calendar,
  Cookie,
  Share2,
  Settings
} from 'lucide-react'
import MainNavigation from '@/components/MainNavigation'

export default function PrivacyPolicy() {
  const dataTypes = [
    {
      icon: UserCheck,
      title: "Dados Pessoais",
      description: "Nome, CPF, RG, endereço, telefone e e-mail",
      color: "bg-blue-100 text-blue-600 dark:text-blue-400"
    },
    {
      icon: FileCheck,
      title: "Dados Acadêmicos",
      description: "Curso, semestre, matrícula e desempenho",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Database,
      title: "Dados de Navegação",
      description: "Logs de acesso, IP e histórico de uso",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Cookie,
      title: "Cookies e Sessões",
      description: "Preferências e dados de sessão",
      color: "bg-orange-100 text-orange-600"
    }
  ]

  const rights = [
    {
      icon: Eye,
      title: "Acesso aos Dados",
      description: "Visualizar quais dados pessoais estão armazenados"
    },
    {
      icon: Settings,
      title: "Correção de Dados",
      description: "Solicitar correção de informações incorretas"
    },
    {
      icon: AlertTriangle,
      title: "Exclusão de Dados",
      description: "Solicitar remoção dos seus dados pessoais"
    },
    {
      icon: Share2,
      title: "Portabilidade",
      description: "Receber seus dados em formato estruturado"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <MainNavigation />

      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Política de Privacidade
            </h1>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            No NAF Contábil, sua privacidade é nossa prioridade. Esta política explica como coletamos,
            usamos e protegemos suas informações pessoais.
          </p>

          <div className="flex items-center justify-center mt-6 space-x-4">
            <Badge variant="outline" className="bg-white dark:bg-gray-950">
              <Calendar className="h-4 w-4 mr-2" />
              Última atualização: 20 de Setembro de 2024
            </Badge>
            <Badge variant="outline" className="bg-white dark:bg-gray-950">
              <FileCheck className="h-4 w-4 mr-2" />
              Versão 2.0
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

            {/* Dados Coletados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Database className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Dados que Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {dataTypes.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Finalidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <UserCheck className="h-6 w-6 mr-3 text-green-600" />
                  Finalidade do Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Prestação de Serviços</h4>
                      <p className="text-gray-600 dark:text-gray-400">Fornecer orientação contábil e fiscal personalizada</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Gestão Acadêmica</h4>
                      <p className="text-gray-600 dark:text-gray-400">Controle de participação e avaliação de estudantes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Comunicação</h4>
                      <p className="text-gray-600 dark:text-gray-400">Envio de notificações e atualizações importantes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Melhoria dos Serviços</h4>
                      <p className="text-gray-600 dark:text-gray-400">Análise de desempenho e otimização da plataforma</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seus Direitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Shield className="h-6 w-6 mr-3 text-purple-600" />
                  Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {rights.map((right, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <right.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{right.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{right.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Lock className="h-6 w-6 mr-3 text-red-600" />
                  Medidas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Proteção Técnica</h4>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• Criptografia SSL/TLS para transmissão de dados</li>
                    <li>• Banco de dados com acesso restrito e monitorado</li>
                    <li>• Backups automáticos e seguros</li>
                    <li>• Controle de acesso baseado em função</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Proteção Organizacional</h4>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                    <li>• Treinamento regular da equipe sobre privacidade</li>
                    <li>• Políticas internas de segurança da informação</li>
                    <li>• Auditoria e monitoramento contínuo</li>
                    <li>• Plano de resposta a incidentes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Retenção de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center dark:bg-gray-900 dark:border-gray-800">
                  <Calendar className="h-6 w-6 mr-3 text-orange-600" />
                  Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Dados de Estudantes Ativos</h4>
                    <p className="text-orange-700 text-sm mt-1">
                      Mantidos durante todo o período de vínculo acadêmico e por até 5 anos após a conclusão.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Dados de Atendimentos</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Preservados por 10 anos para fins acadêmicos e de comprovação de atividades.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Dados de Navegação</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Logs mantidos por 6 meses para fins de segurança e melhoria do sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Contato DPO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg dark:bg-gray-900 dark:border-gray-800">
                  <Mail className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Encarregado de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Prof. Vagner Cordeiro</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Coordenador NAF</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>dpo@naf-contabil.com</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Entrar em Contato
                  </Button>
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
                  <Link href="/terms-of-service">
                    <Button variant="outline" className="w-full justify-start">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Termos de Serviço
                    </Button>
                  </Link>

                  <Link href="/about-naf">
                    <Button variant="outline" className="w-full justify-start">
                      <UserCheck className="h-4 w-4 mr-2" />
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

            {/* Conformidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">Conformidade Legal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      LGPD
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Compliant</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800">
                      <Lock className="h-3 w-3 mr-1" />
                      ISO 27001
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Certified</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD)
                    e outras regulamentações aplicáveis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dúvidas sobre Privacidade?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nossa equipe está disponível para esclarecer qualquer questão sobre o tratamento dos seus dados.
            </p>
            <div className="flex justify-center space-x-4">
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Contatar DPO
              </Button>
              <Button variant="outline">
                <FileCheck className="h-4 w-4 mr-2" />
                Solicitar Dados
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
