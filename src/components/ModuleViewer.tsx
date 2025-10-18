'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Video,
  FileText,
  Target,
  HelpCircle,
  Download,
  Star,
  Trophy,
  TrendingUp
} from 'lucide-react'

interface ModuleContent {
  type: 'text' | 'video' | 'interactive' | 'quiz' | 'exercise'
  title?: string
  content?: string
  url?: string
  duration?: string
  questions?: unknown[]
  steps?: string[]
  resources?: unknown[]
}

interface Module {
  id: string
  title: string
  description: string
  type: 'video' | 'text' | 'exercise' | 'quiz'
  duration: number
  completed: boolean
  content?: ModuleContent
}

interface ModuleViewerProps {
  moduleId: string
  courseId: string
  onBack: () => void
  onComplete?: (moduleId: string) => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  currentModuleIndex?: number
  totalModules?: number
}

// Dados de conteúdo detalhado para cada módulo
const moduleContentData: { [key: string]: ModuleContent } = {
  'module-1-1-1': {
    type: 'text',
    title: 'O que é Business Intelligence',
    content: `
# Business Intelligence: Transformando Dados em Conhecimento

## Definição
Business Intelligence (BI) é um conjunto de **metodologias, processos, arquiteturas e tecnologias** que transformam dados brutos em informações relevantes e úteis para fins de análise de negócios.

## Componentes Principais

### 1. Coleta de Dados
- Extração de dados de diversas fontes
- Integração de sistemas diferentes
- Qualidade e validação dos dados

### 2. Processamento e Armazenamento
- Data Warehouses
- ETL (Extract, Transform, Load)
- Modelagem dimensional

### 3. Análise e Visualização
- Dashboards interativos
- Relatórios analíticos
- KPIs e métricas

### 4. Tomada de Decisão
- Insights acionáveis
- Análise preditiva
- Monitoramento em tempo real

## Por que BI é Importante?

**Para Organizações:**
- ✅ Decisões baseadas em dados
- ✅ Identificação de tendências
- ✅ Otimização de processos
- ✅ Vantagem competitiva

**Para Profissionais:**
- 📊 Habilidade valorizada no mercado
- 💼 Melhores oportunidades de carreira
- 🎯 Capacidade de gerar insights
- 📈 Contribuição estratégica

## Exemplos Práticos

**Varejo:** Análise de vendas por região, produto e período
**Financeiro:** Monitoramento de indicadores de risco e performance
**RH:** Análise de turnover e produtividade
**Marketing:** ROI de campanhas e comportamento do cliente

---

*Continue para o próximo módulo para conhecer as ferramentas de BI, especialmente o Power BI.*
    `,
    resources: [
      {
        type: 'pdf',
        title: 'Guia Completo de BI',
        url: '/resources/guia-bi.pdf'
      },
      {
        type: 'link',
        title: 'Artigo: O Futuro do BI',
        url: 'https://example.com/futuro-bi'
      }
    ]
  },
  'module-1-1-2': {
    type: 'video',
    title: 'Conhecendo o Power BI',
    content: `
# Microsoft Power BI: Sua Ferramenta de BI

## Visão Geral
O Microsoft Power BI é uma **ferramenta de business intelligence** que permite criar visualizações interativas e relatórios com uma interface simples para usuários finais.

## Componentes do Power BI

### Power BI Desktop
- 🖥️ **Aplicação gratuita** para Windows
- 📊 Criação de relatórios e dashboards
- 🔄 Conexão com múltiplas fontes de dados
- 🎨 Ferramentas de visualização avançadas

### Power BI Service
- ☁️ **Plataforma na nuvem**
- 👥 Colaboração e compartilhamento
- 📱 Acesso via web e mobile
- 🔄 Atualização automática de dados

### Power BI Mobile
- 📱 Aplicativos para iOS e Android
- 📊 Visualização de relatórios em movimento
- 🔔 Alertas e notificações
- 👆 Interação touch-friendly

### Power BI Report Server
- 🏢 **Solução on-premises**
- 🔒 Controle total sobre dados
- 🔐 Segurança empresarial
- 📈 Relatórios paginados

## Vantagens do Power BI

**Facilidade de Uso:**
- Interface intuitiva do tipo drag-and-drop
- Templates prontos para uso
- Galeria de visualizações customizadas

**Integração:**
- Office 365 e Azure
- Centenas de conectores de dados
- APIs para desenvolvimento personalizado

**Custo-Benefício:**
- Versão gratuita disponível
- Licenças acessíveis para empresas
- ROI comprovado

---

*No próximo módulo, vamos explorar a interface do Power BI Desktop em detalhes.*
    `,
    url: 'https://www.youtube.com/embed/yKTSLffVGbk',
    duration: '10:00'
  },
  'module-2-1-1': {
    type: 'text',
    title: 'História e Criação do CPF',
    content: `
# Cadastro de Pessoas Físicas (CPF): História e Importância

## História do CPF

### Criação e Evolução
O CPF foi criado pela **Lei nº 4.862/1965** e regulamentado pelo **Decreto nº 64.567/1969**, tornando-se um dos documentos mais importantes do sistema tributário brasileiro.

## Marcos Históricos

### 1965 - Criação
- 📜 **Lei 4.862/1965** cria o CPF
- 🎯 Objetivo: identificar contribuintes
- 🏛️ Responsabilidade da Receita Federal

### 1969 - Regulamentação
- 📋 **Decreto 64.567/1969**
- 📝 Estabelece procedimentos operacionais
- 🔢 Define estrutura do número

### 1988 - Constitucionalização
- 📜 **Constituição Federal** estabelece o CPF
- ⚖️ Base constitucional sólida
- 🔒 Garantias e direitos

### 2000 - Modernização
- 💻 **Sistemas informatizados**
- 🌐 Serviços online
- 📱 Acesso digital

## Importância Legal

### Base Jurídica
- **Lei 4.862/1965** - Criação do CPF
- **Decreto 64.567/1969** - Regulamentação
- **CF/1988 Art. 145, §1º** - Base constitucional
- **IN RFB 1.548/2015** - Procedimentos atuais

### Função no Sistema Tributário
1. **Identificação Única:** Cada pessoa física tem um número único
2. **Controle Fiscal:** Acompanhamento de obrigações
3. **Arrecadação:** Facilitação do recolhimento de tributos
4. **Cidadania:** Acesso a serviços públicos

## Características do CPF

### Estrutura do Número
- **11 dígitos:** XXX.XXX.XXX-XX
- **9 dígitos:** identificação
- **2 dígitos:** verificadores
- **Algoritmo:** validação automática

### Abrangência
- 🌍 **Nacional:** válido em todo território
- 👶 **Vitalício:** desde o nascimento
- 🔄 **Único:** um por pessoa
- 📋 **Obrigatório:** para diversas atividades

---

*Continue para entender a base legal completa que rege o CPF.*
    `
  },
  'module-3-1-1': {
    type: 'text',
    title: 'Sistema Tributário Brasileiro',
    content: `
# Sistema Tributário Brasileiro e o Imposto de Renda

## Visão Geral do Sistema

### Estrutura Constitucional
O sistema tributário brasileiro está previsto na **Constituição Federal de 1988**, Título VI, Capítulo I, estabelecendo as competências e limitações do poder de tributar.

## Princípios Fundamentais

### 1. Legalidade (Art. 150, I)
- 📜 **"Nullum tributum sine lege"**
- ⚖️ Tributo só pode ser criado por lei
- 🔒 Proteção contra arbitrariedades

### 2. Isonomia (Art. 150, II)
- ⚖️ **Tratamento igual** para contribuintes em situação equivalente
- 🚫 Vedação a discriminações arbitrárias
- 📊 Base para progressividade

### 3. Irretroatividade (Art. 150, III, a)
- ⏮️ **Lei tributária** não retroage
- 🛡️ Proteção da segurança jurídica
- 📅 Vigência prospectiva

### 4. Anterioridade (Art. 150, III, b e c)
- 📅 **Anterioridade anual:** só no exercício seguinte
- 📅 **Anterioridade nonagesimal:** após 90 dias
- ⏰ Proteção do contribuinte

## Espécies Tributárias

### 1. Impostos
- 💰 **Definição:** Tributo não vinculado
- 📊 **IR:** Imposto sobre a Renda
- 🏠 **IPTU:** Imposto Predial e Territorial Urbano
- 🚗 **IPVA:** Imposto sobre Propriedade de Veículos

### 2. Taxas
- 🏛️ **Poder de polícia**
- 🔧 **Serviços específicos**
- 💼 Exemplo: Taxa de fiscalização

### 3. Contribuições
- 🎯 **Finalidade específica**
- 👥 **Sociais:** INSS, FGTS
- 🏢 **Econômicas:** CIDE-Combustíveis

## O Imposto de Renda no Sistema

### Competência
- 🏛️ **União Federal** (Art. 153, III, CF)
- 📋 **Regulamentação:** Lei 9.430/96, RIR/2018
- ⚖️ **Aplicação:** Receita Federal do Brasil

### Características
- 🎯 **Pessoal:** considera situação do contribuinte
- 📈 **Progressivo:** alíquotas crescentes
- 🌍 **Universal:** incide sobre renda mundial
- 📊 **Anual:** período de apuração

### Fato Gerador
- 💰 **Auferir renda:** recebimento de valores
- 📈 **Proventos de qualquer natureza**
- 🗓️ **Base anual:** 1º jan a 31 dez
- 💼 **Disponibilidade econômica**

---

*Prossiga para entender quem deve declarar Imposto de Renda.*
    `
  }
}

// Helper function to extract minimal course data for module lookup
// This ensures consistency with CourseContent.tsx
const getCourseLookupData = () => {
  // This should match the structure from CourseContent.tsx
  return {
    '1': {
      themes: [
        {
          modules: [
            { id: 'module-1-1-1', title: 'O que é Business Intelligence', description: 'Introdução aos conceitos de BI e sua importância no mundo dos negócios.', type: 'text', duration: 20, completed: false },
            { id: 'module-1-1-2', title: 'Conhecendo o Power BI', description: 'Visão geral da ferramenta Microsoft Power BI e seus componentes.', type: 'video', duration: 25, completed: false },
            { id: 'module-1-1-3', title: 'Interface do Power BI Desktop', description: 'Explorando a interface e ferramentas principais do Power BI Desktop.', type: 'text', duration: 20, completed: false },
            { id: 'module-1-1-4', title: 'Configuração do Ambiente', description: 'Como configurar o Power BI Desktop para trabalho eficiente.', type: 'text', duration: 15, completed: false },
            { id: 'module-1-1-5', title: 'Tipos de Dados e Fontes', description: 'Compreendendo diferentes tipos de dados e fontes no Power BI.', type: 'text', duration: 25, completed: false },
            { id: 'module-1-1-6', title: 'Exercício Prático - Primeiro Relatório', description: 'Criando seu primeiro relatório simples no Power BI.', type: 'exercise', duration: 15, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-1-2-1', title: 'Conectando a Fontes de Dados', description: 'Como conectar o Power BI a diferentes fontes de dados.', type: 'video', duration: 30, completed: false },
            { id: 'module-1-2-2', title: 'Power Query Editor', description: 'Introdução ao Power Query Editor para transformação de dados.', type: 'text', duration: 25, completed: false },
            { id: 'module-1-2-3', title: 'Limpeza e Transformação de Dados', description: 'Técnicas para limpar e transformar dados no Power Query.', type: 'video', duration: 35, completed: false },
            { id: 'module-1-2-4', title: 'Criando Relacionamentos', description: 'Como criar e gerenciar relacionamentos entre tabelas.', type: 'text', duration: 20, completed: false },
            { id: 'module-1-2-5', title: 'Modelagem de Dados', description: 'Princípios de modelagem de dados para análise eficiente.', type: 'text', duration: 30, completed: false },
            { id: 'module-1-2-6', title: 'Exercício - Preparação de Dados', description: 'Exercício prático de preparação e modelagem de dados.', type: 'exercise', duration: 20, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-1-3-1', title: 'Tipos de Visualizações', description: 'Conhecendo os diferentes tipos de visualizações disponíveis.', type: 'text', duration: 25, completed: false },
            { id: 'module-1-3-2', title: 'Criando Gráficos Básicos', description: 'Como criar gráficos de barras, linhas e pizza.', type: 'video', duration: 30, completed: false },
            { id: 'module-1-3-3', title: 'Visualizações Avançadas', description: 'Mapas, matrizes e visualizações customizadas.', type: 'video', duration: 35, completed: false },
            { id: 'module-1-3-4', title: 'Filtros e Segmentadores', description: 'Implementando filtros e segmentadores interativos.', type: 'text', duration: 20, completed: false },
            { id: 'module-1-3-5', title: 'Design de Dashboards', description: 'Princípios de design para dashboards eficazes.', type: 'text', duration: 25, completed: false },
            { id: 'module-1-3-6', title: 'Exercício - Dashboard Completo', description: 'Criando um dashboard completo com múltiplas visualizações.', type: 'exercise', duration: 25, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-1-4-1', title: 'Introdução ao DAX', description: 'Conceitos básicos da linguagem DAX.', type: 'text', duration: 30, completed: false },
            { id: 'module-1-4-2', title: 'Criando Medidas Calculadas', description: 'Como criar medidas usando DAX.', type: 'video', duration: 35, completed: false },
            { id: 'module-1-4-3', title: 'Funções de Tempo Inteligente', description: 'Usando funções DAX para análises temporais.', type: 'video', duration: 30, completed: false },
            { id: 'module-1-4-4', title: 'Contexto e Filtros em DAX', description: 'Compreendendo contexto de linha e filtro em DAX.', type: 'text', duration: 25, completed: false },
            { id: 'module-1-4-5', title: 'Análises Avançadas', description: 'Técnicas avançadas de análise com DAX.', type: 'text', duration: 30, completed: false },
            { id: 'module-1-4-6', title: 'Projeto Final - Análise Completa', description: 'Projeto final integrando todos os conceitos aprendidos.', type: 'exercise', duration: 40, completed: false }
          ]
        }
      ]
    },
    '2': {
      themes: [
        {
          modules: [
            { id: 'module-2-1-1', title: 'História e Criação do CPF', description: 'A história e importância do Cadastro de Pessoas Físicas no Brasil.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-1-2', title: 'Base Legal do CPF', description: 'Legislação que rege o Cadastro de Pessoas Físicas.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-1-3', title: 'Obrigatoriedade de Inscrição', description: 'Quando é obrigatório ter CPF e quem deve se inscrever.', type: 'video', duration: 20, completed: false },
            { id: 'module-2-1-4', title: 'Penalidades e Infrações', description: 'Penalidades por não ter CPF ou informações incorretas.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-1-5', title: 'Direitos e Deveres', description: 'Direitos e deveres relacionados ao CPF.', type: 'text', duration: 10, completed: false },
            { id: 'module-2-1-6', title: 'Quiz - Legislação CPF', description: 'Teste seus conhecimentos sobre a legislação do CPF.', type: 'quiz', duration: 15, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-2-2-1', title: 'Inscrição Presencial', description: 'Como fazer inscrição de CPF presencialmente.', type: 'video', duration: 25, completed: false },
            { id: 'module-2-2-2', title: 'Inscrição Online', description: 'Procedimentos para inscrição de CPF pela internet.', type: 'video', duration: 20, completed: false },
            { id: 'module-2-2-3', title: 'Documentação Necessária', description: 'Documentos obrigatórios para cada tipo de inscrição.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-2-4', title: 'Inscrição de Menores', description: 'Procedimentos especiais para inscrição de menores de idade.', type: 'text', duration: 20, completed: false },
            { id: 'module-2-2-5', title: 'Casos Especiais', description: 'Situações especiais na inscrição do CPF.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-2-6', title: 'Exercício - Processo de Inscrição', description: 'Simulação prática de processo de inscrição.', type: 'exercise', duration: 15, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-2-3-1', title: 'Alteração de Dados Cadastrais', description: 'Como alterar informações no CPF.', type: 'video', duration: 20, completed: false },
            { id: 'module-2-3-2', title: 'Atualização de Endereço', description: 'Procedimentos para atualização de endereço.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-3-3', title: 'Correção de Informações', description: 'Como corrigir informações incorretas no CPF.', type: 'video', duration: 25, completed: false },
            { id: 'module-2-3-4', title: 'Uso do e-CAC', description: 'Utilizando o Centro Virtual de Atendimento.', type: 'video', duration: 20, completed: false },
            { id: 'module-2-3-5', title: 'Comprovação de Alterações', description: 'Como comprovar alterações realizadas.', type: 'text', duration: 10, completed: false },
            { id: 'module-2-3-6', title: 'Exercício - Alteração Cadastral', description: 'Prática de alteração de dados cadastrais.', type: 'exercise', duration: 20, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-2-4-1', title: 'CPF Suspenso', description: 'Como regularizar CPF suspenso.', type: 'video', duration: 25, completed: false },
            { id: 'module-2-4-2', title: 'Duplicidade de CPF', description: 'Resolução de problemas de duplicidade.', type: 'text', duration: 20, completed: false },
            { id: 'module-2-4-3', title: 'CPF de Falecidos', description: 'Procedimentos para CPF de pessoas falecidas.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-4-4', title: 'Casos Judiciais', description: 'CPF em casos judiciais e situações especiais.', type: 'text', duration: 20, completed: false },
            { id: 'module-2-4-5', title: 'Atendimento Especializado', description: 'Quando buscar atendimento especializado.', type: 'text', duration: 15, completed: false },
            { id: 'module-2-4-6', title: 'Caso Prático - Regularização', description: 'Estudo de caso prático de regularização.', type: 'exercise', duration: 25, completed: false }
          ]
        }
      ]
    },
    '3': {
      themes: [
        {
          modules: [
            { id: 'module-3-1-1', title: 'Sistema Tributário Brasileiro', description: 'Visão geral do sistema tributário e o papel do IR.', type: 'text', duration: 25, completed: false },
            { id: 'module-3-1-2', title: 'Obrigatoriedade de Declarar', description: 'Quem deve declarar Imposto de Renda.', type: 'video', duration: 20, completed: false },
            { id: 'module-3-1-3', title: 'Prazos e Penalidades', description: 'Prazos para entrega e penalidades por atraso.', type: 'text', duration: 15, completed: false },
            { id: 'module-3-1-4', title: 'Tipos de Declaração', description: 'Declaração completa, simplificada e em conjunto.', type: 'video', duration: 25, completed: false },
            { id: 'module-3-1-5', title: 'Documentos Necessários', description: 'Documentação obrigatória para a declaração.', type: 'text', duration: 20, completed: false },
            { id: 'module-3-1-6', title: 'Quiz - Conceitos Básicos IR', description: 'Teste de conhecimentos sobre conceitos básicos.', type: 'quiz', duration: 15, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-3-2-1', title: 'Rendimentos Tributáveis', description: 'Tipos de rendimentos que devem ser declarados.', type: 'text', duration: 30, completed: false },
            { id: 'module-3-2-2', title: 'Rendimentos Isentos', description: 'Rendimentos que não sofrem tributação.', type: 'text', duration: 25, completed: false },
            { id: 'module-3-2-3', title: 'Deduções Legais', description: 'Deduções permitidas por lei.', type: 'video', duration: 35, completed: false },
            { id: 'module-3-2-4', title: 'Despesas Médicas', description: 'Como deduzir despesas médicas e odontológicas.', type: 'video', duration: 20, completed: false },
            { id: 'module-3-2-5', title: 'Despesas com Educação', description: 'Dedução de despesas com educação.', type: 'text', duration: 20, completed: false },
            { id: 'module-3-2-6', title: 'Exercício - Cálculo de Deduções', description: 'Prática de cálculo de deduções.', type: 'exercise', duration: 25, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-3-3-1', title: 'Declaração de Bens e Direitos', description: 'Como declarar bens móveis e imóveis.', type: 'video', duration: 30, completed: false },
            { id: 'module-3-3-2', title: 'Inclusão de Dependentes', description: 'Quem pode ser incluído como dependente.', type: 'text', duration: 20, completed: false },
            { id: 'module-3-3-3', title: 'Ganho de Capital', description: 'Cálculo e declaração de ganho de capital.', type: 'video', duration: 35, completed: false },
            { id: 'module-3-3-4', title: 'Dívidas e Ônus Reais', description: 'Como informar dívidas e ônus.', type: 'text', duration: 20, completed: false },
            { id: 'module-3-3-5', title: 'Evolução Patrimonial', description: 'Análise da evolução do patrimônio.', type: 'text', duration: 25, completed: false },
            { id: 'module-3-3-6', title: 'Exercício - Declaração de Patrimônio', description: 'Prática de declaração de bens e direitos.', type: 'exercise', duration: 25, completed: false }
          ]
        },
        {
          modules: [
            { id: 'module-3-4-1', title: 'Instalação e Configuração', description: 'Como instalar e configurar o programa IRPF.', type: 'video', duration: 20, completed: false },
            { id: 'module-3-4-2', title: 'Navegação no Programa', description: 'Como navegar pelas funcionalidades do programa.', type: 'video', duration: 25, completed: false },
            { id: 'module-3-4-3', title: 'Importação de Dados', description: 'Como importar dados de declarações anteriores.', type: 'text', duration: 20, completed: false },
            { id: 'module-3-4-4', title: 'Verificação de Inconsistências', description: 'Como identificar e corrigir erros na declaração.', type: 'video', duration: 30, completed: false },
            { id: 'module-3-4-5', title: 'Transmissão da Declaração', description: 'Procedimentos para transmitir a declaração.', type: 'video', duration: 25, completed: false },
            { id: 'module-3-4-6', title: 'Projeto Final - Declaração Completa', description: 'Elaboração de uma declaração completa.', type: 'exercise', duration: 45, completed: false }
          ]
        }
      ]
    }
  }
}

const coursesData = getCourseLookupData()

export default function ModuleViewer({
  moduleId,
  courseId,
  onBack,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  currentModuleIndex = 1,
  totalModules = 1
}: ModuleViewerProps) {
  // Encontrar o módulo baseado no moduleId e courseId
  const findModule = (moduleId: string, courseId: string): Module | null => {
    const course = coursesData[courseId]
    if (!course) {
      return null
    }

    for (const theme of course.themes) {
      const matchedModule = theme.modules.find((m: unknown) => m.id === moduleId)
      if (matchedModule) {
        return matchedModule as Module
      }
    }
    return null
  }

  const [isCompleted, setIsCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showResources, setShowResources] = useState(false)
  const [answers, setAnswers] = useState<{ [key: string]: unknown }>({})
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const currentModule = useMemo(() => findModule(moduleId, courseId), [moduleId, courseId])

  if (!currentModule) {
    return (
      <div className="p-6">
        <Button onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert>
          <AlertDescription>
            Módulo não encontrado. Verifique se o ID do módulo está correto.
            <br />
            <strong>Detalhes:</strong> moduleId={moduleId}, courseId={courseId}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Carregar progresso do módulo quando o componente carrega
  useEffect(() => {
    const loadModuleProgress = async () => {
      try {
        let token = localStorage.getItem('student_token')

        // Mock token para desenvolvimento se não existir
        if (!token) {
          const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50SWQiOiJzdHVkZW50LTEiLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJBbHVubyBUZXN0ZSJ9.mock'
          localStorage.setItem('student_token', mockToken)
          token = mockToken
        }

        // Tentar carregar progresso salvo localmente primeiro
        const savedProgress = localStorage.getItem(`module_progress_${moduleId}`)
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          setIsCompleted(progress.status === 'completed')
          setTimeSpent(progress.time_spent || 0)

          if (progress.status === 'completed') {
            setIsTimerActive(false)
          }
          console.log('📊 Progresso carregado do localStorage:', progress)
        }

        // Tentar buscar do servidor
        const response = await fetch(`/api/modules/progress?moduleId=${moduleId}&courseId=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.progress) {
            setIsCompleted(data.progress.status === 'completed')
            setTimeSpent(data.progress.time_spent || 0)

            // Se já foi concluído, não ativar timer
            if (data.progress.status === 'completed') {
              setIsTimerActive(false)
            }
            console.log('📊 Progresso carregado do servidor:', data.progress)
          }
        } else {
          console.log('⚠️ Servidor indisponível, usando dados locais')
        }
      } catch (error) {
        console.error('Erro ao carregar progresso:', error)
        console.log('⚠️ Usando dados locais por erro na rede')
      }
    }

    loadModuleProgress()
  }, [moduleId, courseId])

  // Timer para rastrear tempo gasto no módulo
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isTimerActive && !isCompleted) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isTimerActive, isCompleted])

  // Função para salvar progresso no banco
  const saveProgress = useCallback(async (status: string, completedAt?: string) => {
    try {
      setIsSaving(true)
      let token = localStorage.getItem('student_token')

      // Mock token para desenvolvimento se não existir
      if (!token) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50SWQiOiJzdHVkZW50LTEiLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJBbHVubyBUZXN0ZSJ9.mock'
        localStorage.setItem('student_token', mockToken)
        token = mockToken
      }

      const progressData = {
        moduleId,
        courseId,
        status,
        timeSpent,
        completedAt: completedAt || (status === 'completed' ? new Date().toISOString() : undefined)
      }

      // Salvar localmente sempre
      localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify({
        status,
        time_spent: timeSpent,
        completed_at: progressData.completedAt,
        updated_at: new Date().toISOString()
      }))

      console.log('💾 Progresso salvo localmente:', progressData)

      // Tentar salvar no servidor
      try {
        const response = await fetch('/api/modules/progress', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(progressData)
        })

        if (response.ok) {
          console.log('✅ Progresso salvo no servidor')
          return true
        } else {
          const errorData = await response.json()
          console.error('❌ Erro ao salvar no servidor:', errorData)
          console.log('✅ Progresso mantido localmente')
          return true // Retorna true porque pelo menos foi salvo localmente
        }
      } catch (networkError) {
        console.error('🌐 Erro de rede ao salvar no servidor:', networkError)
        console.log('✅ Progresso mantido localmente')
        return true // Retorna true porque pelo menos foi salvo localmente
      }
    } catch (error) {
      console.error('💥 Erro geral ao salvar progresso:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [courseId, moduleId, timeSpent])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleComplete = async () => {
    const completedAt = new Date().toISOString()

    // Parar o timer imediatamente
    setIsTimerActive(false)
    setIsCompleted(true)

    // Salvar no banco de dados
    const success = await saveProgress('completed', completedAt)

    if (success) {
      console.log('✅ Módulo concluído e salvo no banco')
      // Callback opcional para o componente pai
      if (onComplete) {
        onComplete(currentModule.id)
      }
    } else {
      console.error('❌ Erro ao salvar conclusão do módulo')
      // Em caso de erro, ainda marcar como concluído localmente
    }
  }

  // Salvar progresso quando o usuário sair da página (opcional)
  useEffect(() => {
    const saveProgressOnUnload = () => {
      if (!isCompleted && timeSpent > 0) {
        // Salvar progresso atual como "in_progress"
        saveProgress('in_progress')
      }
    }

    window.addEventListener('beforeunload', saveProgressOnUnload)
    return () => window.removeEventListener('beforeunload', saveProgressOnUnload)
  }, [isCompleted, saveProgress, timeSpent])

  const moduleContent = moduleContentData[currentModule.id] || {
    type: 'text',
    title: currentModule.title,
    content: `
# ${currentModule.title}

${currentModule.description}

Este módulo está em desenvolvimento. O conteúdo completo será disponibilizado em breve.

## Objetivos de Aprendizagem
- Compreender os conceitos fundamentais
- Aplicar conhecimentos práticos
- Desenvolver habilidades específicas

---

*Continue sua jornada de aprendizado!*
    `
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />
      case 'text':
        return <FileText className="h-5 w-5" />
      case 'exercise':
        return <Target className="h-5 w-5" />
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800'
      case 'text':
        return 'bg-green-100 text-green-800'
      case 'exercise':
        return 'bg-orange-100 text-orange-800'
      case 'quiz':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const renderContent = () => {
    switch (moduleContent.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {moduleContent.url ? (
                <iframe
                  src={moduleContent.url}
                  title={moduleContent.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Vídeo será carregado em breve</p>
                  </div>
                </div>
              )}
            </div>
            {moduleContent.content && (
              <div className="prose prose-lg max-w-none prose-headings:text-blue-900 prose-p:text-gray-700 dark:text-gray-300">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-blue-900 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold text-blue-800 mb-3">{children}</h2>,
                    p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                  }}
                >
                  {moduleContent.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )

      case 'text':
        return (
          <div className="prose prose-lg max-w-none prose-headings:text-blue-900 prose-p:text-gray-700 dark:text-gray-300 prose-strong:text-gray-900 dark:text-white prose-ul:text-gray-700 dark:text-gray-300 prose-ol:text-gray-700 dark:text-gray-300">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-blue-900 mb-6 border-b-2 border-blue-200 pb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold text-blue-800 mb-4 mt-8">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-blue-700 mb-3 mt-6">{children}</h3>,
                p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 rounded-r-lg my-4">{children}</blockquote>,
                code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
              }}
            >
              {moduleContent.content || ''}
            </ReactMarkdown>
          </div>
        )

      case 'exercise':
        return (
          <div className="space-y-6">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Este é um exercício prático. Complete todas as etapas para prosseguir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exercício Prático</h3>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: moduleContent.content?.replace(/\n/g, '<br>') || '' }} />
              </div>

              {moduleContent.steps && (
                <div className="space-y-2">
                  <h4 className="font-medium">Passos a seguir:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {moduleContent.steps.map((step, index) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-6">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Responda às perguntas para testar seu conhecimento.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quiz de Conhecimento</h3>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: moduleContent.content?.replace(/\n/g, '<br>') || '' }} />
              </div>

              {moduleContent.questions && moduleContent.questions.map((question, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">{question.question}</h4>
                    <div className="space-y-2">
                      {question.options?.map((option: string, optionIndex: number) => (
                        <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optionIndex}
                            onChange={(e) => setAnswers({...answers, [index]: parseInt(e.target.value)})}
                            className="text-blue-600"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: moduleContent.content?.replace(/\n/g, '<br>') || '' }} />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="outline" onClick={onBack} className="hover:bg-blue-50 border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentModule.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Módulo {currentModuleIndex} de {totalModules}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentModule.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Tempo: {formatTime(timeSpent)}
                    {isTimerActive && !isCompleted && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1"></div>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getModuleTypeColor(currentModule.type)} text-sm px-3 py-1`}>
                {getModuleIcon(currentModule.type)}
                <span className="ml-2 capitalize">{currentModule.type}</span>
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                  <Trophy className="h-4 w-4 mr-2" />
                  Concluído
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-950/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">{moduleContent.title || currentModule.title}</CardTitle>
                    <CardDescription className="text-blue-100 mt-1">{currentModule.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Tempo gasto</div>
                    <div className="text-lg font-mono text-white">{formatTime(timeSpent)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {renderContent()}

                {/* Recursos Adicionais */}
                {moduleContent.resources && moduleContent.resources.length > 0 && (
                  <div className="border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowResources(!showResources)}
                      className="mb-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Recursos Adicionais ({moduleContent.resources.length})
                    </Button>

                    {showResources && (
                      <div className="space-y-2">
                        {moduleContent.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{resource.title}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progresso */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-950/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progresso do Módulo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Conclusão</span>
                      <span className="font-bold text-blue-600">{isCompleted ? '100%' : '0%'}</span>
                    </div>
                    <Progress value={isCompleted ? 100 : 0} className="h-3" />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
                        <div className="text-xs text-gray-500">Tempo Gasto</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{currentModule.duration}min</div>
                        <div className="text-xs text-gray-500">Duração Est.</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    {!isCompleted ? (
                      <Button
                        onClick={handleComplete}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Trophy className="h-4 w-4 mr-2" />
                            Marcar como Concluído
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center text-green-600 bg-green-50 py-3 rounded-lg border-2 border-green-200">
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="font-medium">Módulo Concluído!</span>
                      </div>
                    )}

                    {/* Status do Timer */}
                    <div className="mt-3 text-xs text-gray-500">
                      {isCompleted ? (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Timer parado - Módulo finalizado</span>
                        </div>
                      ) : isTimerActive ? (
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Timer ativo - Tempo sendo contabilizado</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Timer pausado</span>
                        </div>
                      )}
                    </div>

                    {/* Status de Salvamento */}
                    {isSaving && (
                      <div className="mt-2 text-xs text-blue-600 flex items-center justify-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span>Salvando progresso...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navegação */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-950/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Navegação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {hasPrevious && (
                  <Button variant="outline" onClick={onPrevious} className="w-full hover:bg-indigo-50 border-indigo-200">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Módulo Anterior
                  </Button>
                )}
                {hasNext && (
                  <Button onClick={onNext} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Próximo Módulo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {!hasNext && !hasPrevious && (
                  <div className="text-center text-gray-500 py-4">
                    <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Este é o único módulo disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tempo estimado</span>
                  <span className="font-medium">{currentModule.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tempo gasto</span>
                  <span className="font-medium">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tipo</span>
                  <Badge variant="outline" className="text-xs">
                    {currentModule.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
