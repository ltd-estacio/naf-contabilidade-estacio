'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import MainNavigation from '@/components/MainNavigation'
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Phone,
  Clock,
  Calculator,
  Building2,
  FileText,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'geral' | 'mei' | 'cnpj' | 'imposto-renda' | 'atendimento' | 'servicos'
  tags: string[]
}

const faqData: FAQItem[] = [
  // Categoria: Geral
  {
    id: '1',
    question: 'O que é o NAF?',
    answer: 'O NAF (Núcleo de Apoio Fiscal) é um programa de extensão universitária desenvolvido em parceria com a Receita Federal do Brasil, que oferece serviços gratuitos de orientação fiscal e contábil para a comunidade, especialmente microempreendedores e pessoas de baixa renda.',
    category: 'geral',
    tags: ['naf', 'conceito', 'receita federal']
  },
  {
    id: '2',
    question: 'Os serviços do NAF são realmente gratuitos?',
    answer: 'Sim! Todos os serviços prestados pelo NAF são completamente gratuitos. Nosso objetivo é promover a educação fiscal e oferecer apoio à comunidade sem nenhum custo.',
    category: 'geral',
    tags: ['gratuito', 'custo', 'serviços']
  },
  {
    id: '3',
    question: 'Quem pode ser atendido pelo NAF?',
    answer: 'Podem ser atendidos: microempreendedores individuais (MEI), pequenos empresários, pessoas físicas de baixa renda, entidades sem fins lucrativos e qualquer cidadão que necessite de orientação fiscal básica.',
    category: 'geral',
    tags: ['público-alvo', 'quem pode', 'atendimento']
  },

  // Categoria: MEI
  {
    id: '4',
    question: 'Como posso me tornar MEI?',
    answer: 'Para se tornar MEI, você deve: ter faturamento anual até R$ 81.000, exercer atividade permitida para MEI, não ter participação em outra empresa e contratar no máximo 1 funcionário. O cadastro é feito gratuitamente pelo Portal do Empreendedor.',
    category: 'mei',
    tags: ['mei', 'formalização', 'requisitos']
  },
  {
    id: '5',
    question: 'Qual o valor do DAS do MEI?',
    answer: 'O DAS MEI 2024 varia conforme a atividade: R$ 67,00 (Comércio/Indústria), R$ 71,00 (Serviços) ou R$ 72,00 (Comércio e Serviços). Estes valores são atualizados anualmente.',
    category: 'mei',
    tags: ['das', 'valor', 'pagamento', '2024']
  },
  {
    id: '6',
    question: 'O que acontece se eu não pagar o DAS do MEI?',
    answer: 'O não pagamento do DAS pode levar à cobrança de juros e multa, inscrição em dívida ativa, e em casos extremos, ao cancelamento da inscrição MEI. É importante regularizar os débitos o quanto antes.',
    category: 'mei',
    tags: ['das', 'atraso', 'multa', 'cancelamento']
  },

  // Categoria: CNPJ
  {
    id: '7',
    question: 'Quanto tempo demora para abrir um CNPJ?',
    answer: 'O processo de abertura de CNPJ demora em média 15 a 30 dias úteis, dependendo da complexidade da empresa e da documentação apresentada. MEI pode ser aberto no mesmo dia pela internet.',
    category: 'cnpj',
    tags: ['cnpj', 'prazo', 'abertura', 'tempo']
  },
  {
    id: '8',
    question: 'Quais documentos preciso para abrir CNPJ?',
    answer: 'Documentos necessários: CPF e RG dos sócios, comprovante de residência, contrato social, consulta de viabilidade de endereço, e dependendo da atividade, licenças específicas.',
    category: 'cnpj',
    tags: ['cnpj', 'documentos', 'abertura', 'requisitos']
  },

  // Categoria: Imposto de Renda
  {
    id: '9',
    question: 'Sou obrigado a declarar Imposto de Renda?',
    answer: 'É obrigatório declarar se: recebeu rendimentos tributáveis acima de R$ 30.639,90 em 2023, teve rendimentos isentos acima de R$ 200.000, obteve ganho de capital, ou possui bens acima de R$ 800.000.',
    category: 'imposto-renda',
    tags: ['ir', 'obrigatoriedade', 'limite', 'declaração']
  },
  {
    id: '10',
    question: 'Até quando posso entregar a declaração de IR?',
    answer: 'A declaração de Imposto de Renda 2024 (ano-base 2023) deve ser entregue até 31 de maio. Após essa data, há cobrança de multa por atraso.',
    category: 'imposto-renda',
    tags: ['ir', 'prazo', 'entrega', 'multa']
  },
  {
    id: '11',
    question: 'Como sei se vou ter restituição ou imposto a pagar?',
    answer: 'Isso depende do valor retido na fonte versus o imposto calculado na declaração. Se foi retido mais que o devido, você terá restituição. Se foi retido menos, terá imposto a pagar.',
    category: 'imposto-renda',
    tags: ['ir', 'restituição', 'imposto', 'cálculo']
  },

  // Categoria: Atendimento
  {
    id: '12',
    question: 'Como posso agendar um atendimento?',
    answer: 'Você pode agendar pelo nosso site na seção "Agendamento", pelo telefone (48) 98461-4449, ou presencialmente na Estácio Florianópolis. Recomendamos o agendamento online para maior comodidade.',
    category: 'atendimento',
    tags: ['agendamento', 'como agendar', 'contato']
  },
  {
    id: '13',
    question: 'Qual o horário de funcionamento do NAF?',
    answer: 'O NAF funciona de segunda a sexta-feira, das 8h às 18h. Durante o período de Imposto de Renda (março a maio), temos horários estendidos.',
    category: 'atendimento',
    tags: ['horário', 'funcionamento', 'período']
  },
  {
    id: '14',
    question: 'Posso ser atendido online?',
    answer: 'Sim! Oferecemos atendimentos online para muitos serviços. No agendamento, você pode escolher a modalidade presencial ou online, conforme sua preferência e necessidade.',
    category: 'atendimento',
    tags: ['online', 'remoto', 'virtual', 'modalidade']
  },

  // Categoria: Serviços
  {
    id: '15',
    question: 'Quais serviços o NAF oferece?',
    answer: 'Oferecemos: orientação para Declaração de IR, auxílio na formalização MEI, orientação para abertura de CNPJ, consultoria fiscal básica, educação fiscal, orientação trabalhista básica, e apoio em questões tributárias simples.',
    category: 'servicos',
    tags: ['serviços', 'lista', 'oferecemos', 'tipos']
  },
  {
    id: '16',
    question: 'Vocês fazem a declaração de IR para mim?',
    answer: 'Nós oferecemos orientação e auxílio no preenchimento da declaração. O contribuinte permanece responsável pelas informações prestadas, mas nossos estudantes supervisionados ajudam em todo o processo.',
    category: 'servicos',
    tags: ['ir', 'preenchimento', 'ajuda', 'declaração']
  },
  {
    id: '17',
    question: 'O NAF resolve questões complexas de contabilidade?',
    answer: 'O NAF foca em orientações básicas e educação fiscal. Para questões complexas de contabilidade empresarial, recomendamos a contratação de um contador profissional.',
    category: 'servicos',
    tags: ['complexidade', 'limitações', 'contabilidade', 'profissional']
  }
]

const categoryLabels = {
  'geral': 'Geral',
  'mei': 'MEI',
  'cnpj': 'CNPJ',
  'imposto-renda': 'Imposto de Renda',
  'atendimento': 'Atendimento',
  'servicos': 'Serviços'
}

const categoryColors = {
  'geral': 'bg-blue-100 text-blue-700',
  'mei': 'bg-green-100 text-green-700',
  'cnpj': 'bg-purple-100 text-purple-700',
  'imposto-renda': 'bg-orange-100 text-orange-700',
  'atendimento': 'bg-pink-100 text-pink-700',
  'servicos': 'bg-indigo-100 text-indigo-700'
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-950 dark:to-gray-900 dark:from-gray-950 dark:to-gray-900">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-800 dark:to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-gray-950 dark:bg-gray-950/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Encontre respostas rápidas para suas dúvidas sobre nossos serviços
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 dark:text-white">

        {/* Search and Filters */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Busque por palavra-chave ou pergunta..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                  >
                    Todas
                  </Button>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(key)}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Items */}
        <section className="mb-16">
          {filteredFAQ.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
                  Nenhuma pergunta encontrada
                </h3>
                <p className="text-gray-500">
                  Tente ajustar sua busca ou navegar pelas categorias
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQ.map((item) => {
                const isExpanded = expandedItems.includes(item.id)

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between text-left"
                        onClick={() => toggleExpanded(item.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${item.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <Badge className={`${categoryColors[item.category]} text-xs`}>
                              {categoryLabels[item.category]}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 pr-8">
                            {item.question}
                          </h3>
                        </div>
                        <span className="ml-2" aria-hidden="true">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                      {isExpanded && (
                        <div id={`faq-answer-${item.id}`} className="mt-4">
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.answer}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick Categories */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">
              Navegue por Categoria
            </h2>
            <p className="text-lg text-gray-600">
              Encontre rapidamente o que você procura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const categoryCount = faqData.filter(item => item.category === key).length
              const icons = {
                'geral': HelpCircle,
                'mei': Building2,
                'cnpj': FileText,
                'imposto-renda': Calculator,
                'atendimento': Users,
                'servicos': BookOpen
              }
              const IconComponent = icons[key as keyof typeof icons]

              return (
                <button
                  key={key}
                  type="button"
                  className="text-left"
                  onClick={() => setSelectedCategory(key)}
                >
                  <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${categoryColors[key as keyof typeof categoryColors].replace('text-', 'bg-').replace('-700', '-100')}`}>
                        <IconComponent className={`h-8 w-8 ${categoryColors[key as keyof typeof categoryColors].replace('bg-', 'text-').replace('-100', '-600')}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {label}
                      </h3>
                      <p className="text-gray-600">
                        {categoryCount} pergunta{categoryCount !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Não encontrou sua resposta?
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  Nossa equipe está pronta para ajudar você pessoalmente
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-950 dark:bg-gray-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Agende um Atendimento</h3>
                    <p className="opacity-90 text-sm">Orientação personalizada</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-950 dark:bg-gray-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Ligue para nós</h3>
                    <p className="opacity-90 text-sm">(48) 98461-4449</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-950 dark:bg-gray-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Horário</h3>
                    <p className="opacity-90 text-sm">Seg-Sex: 8h às 18h</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/naf-scheduling">
                    <Button size="lg" variant="secondary" className="bg-white dark:bg-gray-950 dark:bg-gray-950 dark:bg-gray-950 text-blue-600 hover:bg-gray-100">
                      <Calendar className="h-5 w-5 mr-2" />
                      Agendar Atendimento
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white dark:bg-gray-950 dark:bg-gray-950 hover:text-blue-600">
                      Ver Todos os Serviços
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  )
}
