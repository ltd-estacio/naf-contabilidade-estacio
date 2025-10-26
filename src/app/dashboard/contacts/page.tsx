'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  Search,
  ExternalLink,
  Building,
  FileText,
  Calendar,
  Users
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  type: 'federal' | 'estadual' | 'municipal'
  category: string
  phone: string
  email: string
  address: string
  website: string
  description: string
  services: string[]
  workingHours: string
  responsibleFor: string[]
  lastUpdated: string
}

interface ContactStats {
  federal: number
  estadual: number
  municipal: number
  total: number
}

export default function Contacts() {
  const { data: _session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({
    federal: 0,
    estadual: 0,
    municipal: 0,
    total: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dados simulados - em produção viria da API
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Receita Federal - São José/SC',
        type: 'federal',
        category: 'Tributação',
        phone: '(48) 3027-5000',
        email: 'atendimento.sjose@receita.fazenda.gov.br',
        address: 'Rua Felipe Schmidt, 390 - Centro - São José/SC - 88010-001',
        website: 'https://receita.economia.gov.br',
        description: 'Órgão responsável pela administração dos tributos federais, incluindo CPF, CNPJ, Imposto de Renda.',
        services: ['CPF', 'CNPJ', 'Imposto de Renda', 'MEI', 'Declarações'],
        workingHours: 'Segunda a Sexta: 08h às 17h',
        responsibleFor: ['Cadastros federais', 'Tributação federal', 'Fiscalização'],
        lastUpdated: '2024-02-11'
      },
      {
        id: '2',
        name: 'SEF/SC - Secretaria da Fazenda de SC',
        type: 'estadual',
        category: 'Tributação',
        phone: '(48) 3665-5000',
        email: 'greflo@sef.sc.gov.br',
        address: 'Av. Gov. Gustavo Richard, 99 - Centro - Florianópolis/SC',
        website: 'https://www.sef.sc.gov.br',
        description: 'Secretaria estadual responsável pela administração dos tributos estaduais, principalmente ICMS.',
        services: ['ICMS', 'Inscrição Estadual', 'Substituição Tributária', 'NFe'],
        workingHours: 'Segunda a Sexta: 08h às 18h',
        responsibleFor: ['ICMS', 'Cadastro estadual', 'Nota fiscal eletrônica'],
        lastUpdated: '2024-02-10'
      },
      {
        id: '3',
        name: 'Prefeitura de São José',
        type: 'municipal',
        category: 'Administração',
        phone: '(48) 3381-9000',
        email: 'atendimento@pmsj.sc.gov.br',
        address: 'Av. Lédio João Martins, 1000 - Kobrasol - São José/SC',
        website: 'https://www.pmsj.sc.gov.br',
        description: 'Prefeitura municipal responsável pelos serviços locais e tributos municipais.',
        services: ['ISS', 'IPTU', 'Alvará', 'Licenças', 'Inscrição Municipal'],
        workingHours: 'Segunda a Sexta: 08h às 17h',
        responsibleFor: ['Tributos municipais', 'Licenciamento', 'Serviços urbanos'],
        lastUpdated: '2024-02-11'
      },
      {
        id: '4',
        name: 'SEBRAE Santa Catarina',
        type: 'estadual',
        category: 'Apoio Empresarial',
        phone: '(48) 3231-4500',
        email: 'atendimento@sebrae-sc.com.br',
        address: 'Rua Felipe Schmidt, 390 - Centro - Florianópolis/SC',
        website: 'https://sebrae.com.br/sc',
        description: 'Serviço de apoio às micro e pequenas empresas com consultoria e capacitação.',
        services: ['Consultoria MEI', 'Capacitação', 'Plano de Negócios', 'Orientação'],
        workingHours: 'Segunda a Sexta: 08h às 18h',
        responsibleFor: ['Apoio a pequenas empresas', 'Consultoria', 'Capacitação'],
        lastUpdated: '2024-02-09'
      },
      {
        id: '5',
        name: 'Junta Comercial de SC - JUCESC',
        type: 'estadual',
        category: 'Registro',
        phone: '(48) 3251-3000',
        email: 'jucesc@jucesc.sc.gov.br',
        address: 'Rua Tenente Silveira, 160 - Centro - Florianópolis/SC',
        website: 'https://www.jucesc.sc.gov.br',
        description: 'Órgão responsável pelo registro de empresas e atos comerciais em Santa Catarina.',
        services: ['Registro de Empresa', 'Alteração Contratual', 'DBE', 'Certidões'],
        workingHours: 'Segunda a Sexta: 08h às 17h',
        responsibleFor: ['Registro comercial', 'Atos societários', 'Documentos empresariais'],
        lastUpdated: '2024-02-08'
      },
      {
        id: '6',
        name: 'Corpo de Bombeiros - São José',
        type: 'estadual',
        category: 'Segurança',
        phone: '(48) 3281-8100',
        email: 'cbmsaojose@cbm.sc.gov.br',
        address: 'Rua Antônio Carlos Ferreira, 195 - Centro - São José/SC',
        website: 'https://www.cbm.sc.gov.br',
        description: 'Responsável pela prevenção e combate a incêndios, emissão de alvarás de segurança.',
        services: ['Alvará de Segurança', 'Vistoria', 'PPCI', 'Auto de Vistoria'],
        workingHours: 'Segunda a Sexta: 08h às 17h',
        responsibleFor: ['Segurança contra incêndio', 'Vistorias', 'Prevenção'],
        lastUpdated: '2024-02-07'
      },
      {
        id: '7',
        name: 'INSS - Instituto Nacional do Seguro Social',
        type: 'federal',
        category: 'Previdência',
        phone: '135',
        email: 'atendimento@inss.gov.br',
        address: 'Av. Mauro Ramos, 224 - Centro - Florianópolis/SC',
        website: 'https://www.inss.gov.br',
        description: 'Instituto responsável pelos benefícios previdenciários e seguridade social.',
        services: ['Aposentadoria', 'Auxílio', 'Pensão', 'Salário Família', 'BPC'],
        workingHours: 'Segunda a Sexta: 07h às 17h',
        responsibleFor: ['Benefícios previdenciários', 'Contribuições', 'Perícias'],
        lastUpdated: '2024-02-06'
      },
      {
        id: '8',
        name: 'Vigilância Sanitária - São José',
        type: 'municipal',
        category: 'Saúde',
        phone: '(48) 3381-9200',
        email: 'vigilancia@pmsj.sc.gov.br',
        address: 'Rua José Valdomiro Coelho, 85 - Kobrasol - São José/SC',
        website: 'https://www.pmsj.sc.gov.br/vigilancia',
        description: 'Órgão municipal responsável pela vigilância sanitária e licenciamento de estabelecimentos.',
        services: ['Licença Sanitária', 'Vistoria', 'Fiscalização', 'Orientações'],
        workingHours: 'Segunda a Sexta: 08h às 16h',
        responsibleFor: ['Saúde pública', 'Licenciamento sanitário', 'Fiscalização'],
        lastUpdated: '2024-02-05'
      }
    ]

    setContacts(mockContacts)
    setFilteredContacts(mockContacts)

    // Calcular estatísticas
    const federal = mockContacts.filter(c => c.type === 'federal').length
    const estadual = mockContacts.filter(c => c.type === 'estadual').length
    const municipal = mockContacts.filter(c => c.type === 'municipal').length

    setStats({
      federal,
      estadual,
      municipal,
      total: mockContacts.length
    })

    setLoading(false)
  }, [])

  // Filtrar contatos
  useEffect(() => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        contact.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(contact => contact.type === typeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(contact => contact.category === categoryFilter)
    }

    setFilteredContacts(filtered)
  }, [contacts, searchTerm, typeFilter, categoryFilter])

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      federal: { label: 'Federal', variant: 'destructive' as const },
      estadual: { label: 'Estadual', variant: 'default' as const },
      municipal: { label: 'Municipal', variant: 'secondary' as const }
    }
    return typeConfig[type as keyof typeof typeConfig] || { label: type, variant: 'default' as const }
  }

  const categories = Array.from(new Set(contacts.map(c => c.category)))

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando contatos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos dos Órgãos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Informações de contato dos principais órgãos federais, estaduais e municipais
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Órgãos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órgãos Federais</CardTitle>
            <Building className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.federal}</div>
            <p className="text-xs text-muted-foreground">Receita, INSS, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órgãos Estaduais</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estadual}</div>
            <p className="text-xs text-muted-foreground">SEF/SC, JUCESC, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órgãos Municipais</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.municipal}</div>
            <p className="text-xs text-muted-foreground">Prefeitura, Vigilância, etc.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="contact-search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contact-search"
                  placeholder="Nome, serviços ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-scope" className="text-sm font-medium">Esfera</label>
              <select
                id="contact-scope"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="all">Todas as esferas</option>
                <option value="federal">Federal</option>
                <option value="estadual">Estadual</option>
                <option value="municipal">Municipal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-category" className="text-sm font-medium">Categoria</label>
              <select
                id="contact-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Resultados</p>
              <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                {filteredContacts.length} contato(s) encontrado(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getTypeBadge(contact.type).variant}>
                      {getTypeBadge(contact.type).label}
                    </Badge>
                    <Badge variant="outline">{contact.category}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{contact.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informações de Contato */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{contact.phone}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 py-1 text-xs">
                    Ligar
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{contact.email}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 py-1 text-xs">
                    Email
                  </Button>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm flex-1">{contact.address}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 py-1 text-xs">
                    Mapa
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex-1"
                  >
                    {contact.website}
                  </a>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{contact.workingHours}</span>
                </div>
              </div>

              {/* Serviços */}
              <div>
                <h4 className="font-medium text-sm mb-2">Serviços Oferecidos:</h4>
                <div className="flex flex-wrap gap-1">
                  {contact.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responsabilidades */}
              <div>
                <h4 className="font-medium text-sm mb-2">Responsável por:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {contact.responsibleFor.map((responsibility, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <FileText className="h-3 w-3 mr-1" />
                  Guias
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Users className="h-3 w-3 mr-1" />
                  Contato
                </Button>
              </div>

              {/* Última atualização */}
              <div className="text-xs text-gray-400 text-center pt-2 border-t">
                Atualizado em {new Date(contact.lastUpdated).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum contato encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
