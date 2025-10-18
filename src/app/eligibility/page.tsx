'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Building2, Sprout, Heart, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function NAFEligibilityPage() {
  const eligibleGroups = [
    {
      icon: Users,
      title: "Pessoas Físicas Hipossuficientes",
      description: "Pessoas com renda familiar mensal de até 5 salários mínimos",
      color: "bg-blue-100 text-blue-600 dark:text-blue-400",
      criteria: [
        "Renda familiar até 5 salários mínimos",
        "Comprovante de renda atualizado",
        "Documentos de identificação válidos",
        "Comprovante de residência"
      ]
    },
    {
      icon: Building2,
      title: "Microempreendedores Individuais (MEI)",
      description: "Empreendedores com faturamento anual até R$ 81.000",
      color: "bg-green-100 text-green-600",
      criteria: [
        "Faturamento anual até R$ 81.000",
        "Máximo de 1 empregado",
        "Atividade permitida no MEI",
        "CNPJ válido ou intenção de abertura"
      ]
    },
    {
      icon: Sprout,
      title: "Pequenos Proprietários Rurais",
      description: "Produtores rurais com área de até 4 módulos fiscais",
      color: "bg-emerald-100 text-emerald-600",
      criteria: [
        "Propriedade rural até 4 módulos fiscais",
        "Exploração em regime familiar",
        "Renda familiar adequada aos critérios",
        "Documentação da propriedade"
      ]
    },
    {
      icon: Heart,
      title: "Organizações da Sociedade Civil",
      description: "Entidades sem fins lucrativos com finalidade social",
      color: "bg-purple-100 text-purple-600",
      criteria: [
        "Registro como entidade sem fins lucrativos",
        "Finalidade de interesse social",
        "Estatuto social atualizado",
        "Certidões de regularidade"
      ]
    }
  ]

  const requiredDocuments = [
    {
      category: "Documentação Pessoal",
      items: [
        "RG ou documento oficial com foto",
        "CPF ou cartão do contribuinte",
        "Comprovante de residência atualizado",
        "Comprovante de renda (últimos 3 meses)"
      ]
    },
    {
      category: "Para MEI/Empresas",
      items: [
        "CNPJ ou documentos para abertura",
        "Contrato social ou requerimento",
        "Faturamento dos últimos 12 meses",
        "Declarações fiscais anteriores"
      ]
    },
    {
      category: "Para Propriedades Rurais",
      items: [
        "Escritura ou documento da propriedade",
        "CNIR (quando aplicável)",
        "ITR dos últimos exercícios",
        "Comprovantes de atividade rural"
      ]
    }
  ]

  const serviceProcess = [
    {
      step: 1,
      title: "Verificação de Elegibilidade",
      description: "Confirmamos se você atende aos critérios para atendimento gratuito",
      icon: CheckCircle,
      color: "bg-blue-500"
    },
    {
      step: 2,
      title: "Agendamento",
      description: "Marcamos horário para atendimento presencial ou virtual",
      icon: AlertCircle,
      color: "bg-green-500"
    },
    {
      step: 3,
      title: "Atendimento Qualificado",
      description: "Estudantes supervisionados por professores prestam orientação",
      icon: Users,
      color: "bg-purple-500"
    },
    {
      step: 4,
      title: "Acompanhamento",
      description: "Monitoramos o progresso até a conclusão do serviço",
      icon: Info,
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NAF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Núcleo de Apoio Contábil Fiscal
                </h1>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/services">
                <Button variant="outline">Serviços</Button>
              </Link>
              <Link href="/schedule">
                <Button>Agendar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Quem Pode Ser Atendido?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            O NAF oferece atendimento gratuito para grupos específicos da população. 
            Conheça os critérios de elegibilidade e documentação necessária.
          </p>
        </div>

        {/* Eligible Groups */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Grupos Elegíveis para Atendimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {eligibleGroups.map((group, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${group.color} flex items-center justify-center flex-shrink-0`}>
                      <group.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl dark:bg-gray-900 dark:border-gray-800">{group.title}</CardTitle>
                      <CardDescription className="mt-2 dark:bg-gray-900 dark:border-gray-800">{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Critérios de Elegibilidade:</h4>
                  <ul className="space-y-2">
                    {group.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Required Documentation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Documentação Necessária
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {requiredDocuments.map((docGroup, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">{docGroup.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {docGroup.items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Service Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Como Funciona o Atendimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceProcess.map((step, index) => (
              <Card key={index} className="text-center dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-400 mb-2">
                    {step.step.toString().padStart(2, '0')}
                  </div>
                  <CardTitle className="text-lg dark:bg-gray-900 dark:border-gray-800">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Important Notice */}
        <section className="mb-16">
          <Card className="border-orange-200 bg-orange-50 dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800 dark:bg-gray-900 dark:border-gray-800">
                <AlertCircle className="h-5 w-5" />
                <span>Informações Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-700 dark:bg-gray-900 dark:border-gray-800">
              <ul className="space-y-2">
                <li>• Todos os atendimentos são gratuitos e não há cobrança de taxa</li>
                <li>• O atendimento é prestado por estudantes supervisionados por professores</li>
                <li>• Não fazemos entrega de declarações prontas, apenas orientação</li>
                <li>• É necessário agendar horário previamente</li>
                <li>• Mantenha sempre seus documentos atualizados</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="py-12 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-3xl font-bold mb-4">
                Pronto para Solicitar Atendimento?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Verifique se você atende aos critérios e agende seu horário
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/schedule">
                  <Button size="lg" variant="secondary" className="bg-white dark:bg-gray-950 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:bg-gray-800">
                    Agendar Atendimento
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white dark:bg-gray-950 hover:text-blue-600 dark:text-blue-400">
                    Ver Serviços Disponíveis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
