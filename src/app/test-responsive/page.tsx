'use client'

import React, { useState } from 'react'
import ResponsiveDashboardLayout from '@/components/layout/ResponsiveDashboardLayout'
import ResponsiveStatsCard from '@/components/dashboard/ResponsiveStatsCard'
import ResponsiveGrid from '@/components/dashboard/ResponsiveGrid'
import ResponsiveIndicator from '@/components/dev/ResponsiveIndicator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  BarChart3,
  Users,
  Calendar,
  FileText,
  Settings,
  MessageCircle,
  Award,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  BookOpen,
  Database,
  Zap
} from 'lucide-react'

export default function TestResponsive() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 3 },
    { id: 'users', label: 'Usuários', icon: Users, badge: 12 },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, badge: 5 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  const handleLogout = () => {
    alert('Logout clicado!')
  }

  return (
    <>
      <ResponsiveIndicator />
      <ResponsiveDashboardLayout
      title="Teste de Responsividade"
      subtitle="Dashboard Profissional e Elegante"
      userEmail="usuario@teste.com"
      userName="Usuário Teste"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      notifications={7}
      headerActions={
        <>
          <Button variant="default" size="sm" className="hidden sm:inline-flex">
            <Zap className="h-4 w-4 mr-2" />
            Ação Rápida
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo ao Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Aqui está uma visão geral de suas métricas e atividades
          </p>
        </div>

        {/* Stats Grid - 4 columns */}
        <ResponsiveGrid cols={4}>
          <ResponsiveStatsCard
            title="Total de Atendimentos"
            value="1,234"
            subtitle="Este mês"
            icon={Activity}
            color="blue"
            trend={{ value: 12, label: 'vs mês anterior', positive: true }}
          />
          <ResponsiveStatsCard
            title="Taxa de Conclusão"
            value="94%"
            subtitle="Meta: 90%"
            icon={CheckCircle}
            color="green"
            trend={{ value: 3, label: 'vs semana passada', positive: true }}
          />
          <ResponsiveStatsCard
            title="Tempo Médio"
            value="45min"
            subtitle="Por atendimento"
            icon={Clock}
            color="purple"
            trend={{ value: -5, label: 'melhor que antes', positive: true }}
          />
          <ResponsiveStatsCard
            title="Satisfação"
            value="4.8"
            subtitle="De 5.0 estrelas"
            icon={Award}
            color="orange"
            trend={{ value: 0.3, label: 'aumento', positive: true }}
          />
        </ResponsiveGrid>

        {/* Two Column Layout */}
        <ResponsiveGrid cols={2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Desempenho Semanal
              </CardTitle>
              <CardDescription>Atendimentos dos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span className="text-gray-600 dark:text-gray-400">{20 + index * 5} atendimentos</span>
                    </div>
                    <Progress value={40 + index * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Metas e Objetivos
              </CardTitle>
              <CardDescription>Progresso atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Atendimentos do Mês</span>
                    <Badge variant="default" className="bg-blue-100 text-blue-700">1,234 / 1,500</Badge>
                  </div>
                  <Progress value={82} className="h-3" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">82% concluído</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfação do Cliente</span>
                    <Badge variant="default" className="bg-green-100 text-green-700">4.8 / 5.0</Badge>
                  </div>
                  <Progress value={96} className="h-3" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">96% da meta</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Treinamentos Concluídos</span>
                    <Badge variant="default" className="bg-purple-100 text-purple-700">8 / 10</Badge>
                  </div>
                  <Progress value={80} className="h-3" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">80% concluído</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Three Column Layout */}
        <ResponsiveGrid cols={3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Novo atendimento agendado', time: '5 min atrás', icon: Calendar, color: 'text-blue-600' },
                  { title: 'Relatório gerado', time: '1 hora atrás', icon: FileText, color: 'text-green-600' },
                  { title: 'Mensagem recebida', time: '2 horas atrás', icon: MessageCircle, color: 'text-purple-600' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <activity.icon className={`h-5 w-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Treinamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Declaração IRPF', progress: 100, color: 'bg-green-500' },
                  { title: 'Abertura de MEI', progress: 75, color: 'bg-blue-500' },
                  { title: 'Nota Fiscal', progress: 45, color: 'bg-orange-500' }
                ].map((training, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1">{training.title}</span>
                      <Badge variant="outline" className="ml-2">{training.progress}%</Badge>
                    </div>
                    <Progress value={training.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Novo Treinamento
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Ver Relatórios
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Full Width Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tabela Responsiva</CardTitle>
            <CardDescription>Exemplo de conteúdo que se adapta a diferentes tamanhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2 hidden sm:table-cell">Cliente</th>
                    <th className="text-left p-2">Serviço</th>
                    <th className="text-left p-2 hidden md:table-cell">Data</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2">#{1000 + i}</td>
                      <td className="p-2 hidden sm:table-cell">Cliente {i}</td>
                      <td className="p-2">IRPF</td>
                      <td className="p-2 hidden md:table-cell">10/10/2025</td>
                      <td className="p-2">
                        <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                          {i % 2 === 0 ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Testando Responsividade</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redimensione a janela para ver o layout se adaptar automaticamente
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <Badge variant="outline" className="bg-white dark:bg-gray-900">📱 Mobile: 0-640px</Badge>
                <Badge variant="outline" className="bg-white dark:bg-gray-900">📱 Tablet: 640-1024px</Badge>
                <Badge variant="outline" className="bg-white dark:bg-gray-900">💻 Desktop: 1024px+</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveDashboardLayout>
    </>
  )
}
