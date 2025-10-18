'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  ArrowLeft,
  GraduationCap,
  Trophy,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  BookOpen,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function AboutNAF() {
  const objectives = [
    {
      icon: GraduationCap,
      title: "Educação Fiscal",
      description: "Promover conhecimento sobre direitos e deveres fiscais",
      color: "bg-blue-100 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Trophy,
      title: "Assistência Gratuita",
      description: "Serviços fiscais sem custo para a população",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: Users,
      title: "Formação Acadêmica",
      description: "Experiência prática para estudantes",
      color: "bg-purple-100 text-purple-600"
    }
  ]

  const assistanceTypes = [
    {
      title: "Pessoas Físicas de Baixa Renda",
      emoji: "👤",
      titleColor: "text-blue-600 dark:text-blue-400",
      description: "Serviços fiscais relacionados ao CPF, imposto de renda, e-Social Doméstico e muito mais",
      tags: ["CPF", "Imposto de Renda", "E-Social Doméstico", "Certidões"],
      borderColor: "border-blue-300"
    },
    {
      title: "Pequenos Proprietários Rurais",
      emoji: "🚜",
      titleColor: "text-green-600",
      description: "Orientação sobre MEI Rural e declaração do imposto territorial rural (DITR)",
      tags: ["MEI Rural", "DITR", "CNIR", "ITR"],
      borderColor: "border-green-300"
    },
    {
      title: "Comércio Exterior",
      emoji: "🌍",
      titleColor: "text-purple-600",
      description: "Apoio a pessoas físicas de baixa renda e MEI em operações de comércio exterior",
      tags: ["Bagagens Internacionais", "Encomendas", "MEI Exportação"],
      borderColor: "border-purple-300"
    },
    {
      title: "MEI e OSC",
      emoji: "🏢",
      titleColor: "text-orange-600",
      description: "Suporte a microempreendedores individuais e organizações da sociedade civil",
      tags: ["CNPJ", "DAS-MEI", "DASN-SIMEI", "OSC"],
      borderColor: "border-orange-300"
    },
    {
      title: "Assistência Integrada",
      emoji: "🤝",
      titleColor: "text-red-600",
      description: "Soluções relacionadas aos fiscos de todas as esferas federativas",
      tags: ["Federal", "Estadual", "Municipal", "Integração"],
      borderColor: "border-red-300"
    }
  ]

  const attendedPublic = [
    {
      title: "Pessoas físicas de baixa renda",
      description: "Indivíduos com renda familiar de até 3 salários mínimos",
      icon: CheckCircle
    },
    {
      title: "Organizações da sociedade civil (OSC)",
      description: "Entidades sem fins lucrativos",
      icon: CheckCircle
    },
    {
      title: "Microempreendedores individuais (MEI)",
      description: "Empreendedores com faturamento até R$ 81.000/ano",
      icon: CheckCircle
    },
    {
      title: "Pequenos proprietários rurais",
      description: "Propriedades rurais de pequeno porte",
      icon: CheckCircle
    }
  ]

  const processSteps = [
    {
      step: "1. Agendamento",
      title: "Agende seu atendimento online ou presencialmente",
      emoji: "📅",
      bgColor: "bg-blue-100"
    },
    {
      step: "2. Triagem",
      title: "Análise da documentação e definição do atendimento",
      emoji: "📋",
      bgColor: "bg-green-100"
    },
    {
      step: "3. Atendimento",
      title: "Estudantes supervisionados realizam o atendimento",
      emoji: "👨‍🎓",
      bgColor: "bg-yellow-100"
    },
    {
      step: "4. Conclusão",
      title: "Validação do professor e entrega dos documentos",
      emoji: "✅",
      bgColor: "bg-purple-100"
    }
  ]

  const communityBenefits = [
    "Acesso gratuito a serviços fiscais de qualidade",
    "Orientação sobre direitos e deveres fiscais",
    "Redução de custos com contadores",
    "Maior proximidade com a Receita Federal"
  ]

  const studentBenefits = [
    "Experiência prática em contabilidade e tributação",
    "Desenvolvimento de habilidades profissionais",
    "Contato direto com casos reais",
    "Responsabilidade social e cidadania"
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section - Blue Background */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            NAF Estácio Florianópolis
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Núcleo de Apoio Contábil e Fiscal
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-4xl mx-auto">
            Programa de educação fiscal da Faculdade Estácio Florianópolis que oferece
            assistência gratuita em serviços fiscais para pessoas físicas de baixa renda,
            microempreendedores individuais, organizações da sociedade civil e pequenos
            proprietários rurais.
          </p>

          <div className="bg-white dark:bg-gray-950/10 backdrop-blur border border-white/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" />
              <span className="font-medium">📞 Contato: (48) 98461-4449</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Ver Serviços Disponíveis
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white dark:bg-gray-950 hover:text-blue-600 dark:text-blue-400">
              Agendar Atendimento
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm">
            <ArrowLeft className="h-4 w-4" />
            ← Voltar ao Dashboard
          </Link>
        </div>

        {/* Objetivo do NAF */}
        <section className="mb-12">
          <Card className="border border-green-200 bg-green-50 dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-8 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 rounded-full p-2">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800">🎯 Objetivo do NAF</h2>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                O NAF tem como principal objetivo promover a educação fiscal e oferecer assistência gratuita e de qualidade em serviços relacionados
                à Receita Federal do Brasil, contribuindo para a formação acadêmica dos estudantes e para o desenvolvimento da cidadania fiscal.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {objectives.map((obj, index) => (
                  <div key={index} className="text-center bg-white dark:bg-gray-950/60 rounded-lg p-6 hover:bg-white dark:bg-gray-950/80 transition-colors">
                    <div className={`w-16 h-16 ${obj.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <obj.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{obj.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{obj.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Formas de Assistência */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Formas de Assistência</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            As instituições de ensino podem definir formatos especializados de atuação do NAF:
          </p>

          {/* Primeira linha - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {assistanceTypes.slice(0, 3).map((type, index) => (
              <Card key={index} className={`${type.borderColor} border-2 bg-white dark:bg-gray-950 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{type.emoji}</span>
                    <h3 className={`text-lg font-bold ${type.titleColor}`}>{type.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{type.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Segunda linha - 2 cards centralizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {assistanceTypes.slice(3, 5).map((type, index) => (
              <Card key={index + 3} className={`${type.borderColor} border-2 bg-white dark:bg-gray-950 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{type.emoji}</span>
                    <h3 className={`text-lg font-bold ${type.titleColor}`}>{type.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{type.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Público Atendido */}
        <section className="mb-12">
          <Card className="border border-yellow-200 bg-yellow-50 dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-8 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">👥</span>
                <h2 className="text-2xl font-bold text-yellow-800">Público Atendido</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attendedPublic.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-950/40 rounded-lg p-4">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Como Funciona o Atendimento */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12">Como Funciona o Atendimento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-24 h-24 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{step.step}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefícios do NAF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Benefícios do NAF</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Para a Comunidade */}
            <div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-6">Para a Comunidade</h3>
              <div className="space-y-4">
                {communityBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Para os Estudantes */}
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-6">Para os Estudantes</h3>
              <div className="space-y-4">
                {studentBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Parceria com a Receita Federal */}
        <section className="mb-12">
          <Card className="bg-blue-600 text-white rounded-xl dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-3xl font-bold mb-8">Parceria com a Receita Federal do Brasil</h2>
              <p className="text-blue-100 mb-12 max-w-4xl mx-auto text-lg leading-relaxed">
                O NAF é uma iniciativa oficial da Receita Federal do Brasil, desenvolvida em parceria com
                instituições de ensino superior, que visa promover a educação fiscal e oferecer
                atendimento gratuito à população.
              </p>

              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="text-6xl mb-3">🏛️</div>
                  <span className="text-lg font-medium">Receita Federal</span>
                </div>
                <div className="text-5xl font-bold text-white">+</div>
                <div className="text-center">
                  <div className="text-6xl mb-3">🎓</div>
                  <span className="text-lg font-medium">Instituições de Ensino</span>
                </div>
                <div className="text-5xl font-bold text-white">=</div>
                <div className="text-center">
                  <div className="text-6xl mb-3">🤝</div>
                  <span className="text-lg font-medium">NAF</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sobre o Projeto */}
        <section className="mb-12">
          <Card className="border border-purple-200 bg-purple-50 dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-3xl font-bold text-purple-600 mb-12">Sobre o Projeto</h2>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Faculdade Estácio Florianópolis</h3>

              <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto text-lg leading-relaxed">
                Este portal foi desenvolvido pela <strong>Faculdade Estácio Florianópolis</strong> como parte do{' '}
                <strong>Projeto do Laboratório de Transformação Digital (LTD)</strong>, pelos alunos do curso de{' '}
                <strong>Sistemas de Informação</strong>.
              </p>

              <div className="mb-12">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Coordenação do Projeto</h4>
                <p className="text-gray-900 dark:text-white font-bold text-xl mb-2">Professor Vagner Cordeiro</p>
                <p className="text-gray-600 dark:text-gray-400">Coordenador do Curso de Sistemas de Informação</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🎓</span>
                    <h5 className="font-bold text-gray-900 dark:text-white">Curso</h5>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Sistemas de Informação</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🔬</span>
                    <h5 className="font-bold text-gray-900 dark:text-white">Laboratório</h5>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Transformação Digital (LTD)</p>
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 rounded-lg p-6 max-w-4xl mx-auto">
                <p className="text-blue-800 text-lg leading-relaxed flex items-center justify-center gap-2">
                  <span className="text-xl">💡</span>
                  Projeto acadêmico desenvolvido para aplicação prática de conhecimentos em desenvolvimento web, gestão
                  de dados e transformação digital no setor público.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="mb-8">
          <Card className="border border-green-200 bg-green-50 dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-8 text-center dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Precisa de Ajuda Fiscal?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nosso NAF está pronto para ajudar você com todos os serviços fiscais.<br />
                Agende seu atendimento gratuito e tire todas as suas dúvidas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/naf-scheduling">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-5 w-5 mr-2" />
                    Agendar Atendimento
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Ver Todos os Serviços
                  </Button>
                </Link>
                <Link href="/fiscal-guides">
                  <Button variant="outline" size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Guias e Orientações
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}