'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CoordinatorDashboard from '@/components/CoordinatorDashboard'
import AdvancedScheduling from '@/components/AdvancedScheduling'
import PowerBIAdvanced from '@/components/PowerBIAdvanced'
import CoordinatorReportsCenter from '@/components/coordinator/CoordinatorReportsCenter'
import NotificationSystem from '@/components/NotificationSystem'
import PerformanceAnalytics from '@/components/PerformanceAnalytics'
import SystemManagement from '@/components/SystemManagement'
import UserManagement from '@/components/UserManagement'
import { BarChart3, FileText, Users, TrendingUp, Zap, Settings, Calendar } from 'lucide-react'

interface CoordinatorClientProps {
  session: unknown
}

export default function CoordinatorClient({ session }: CoordinatorClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Coordenador</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bem-vindo, {session.user.name}! Aqui você tem acesso a relatórios completos e integração com Power BI.
          </p>
        </div>
        <NotificationSystem />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="powerbi" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Power BI
          </TabsTrigger>
          <TabsTrigger value="relatorio" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CoordinatorDashboard />
        </TabsContent>

        <TabsContent value="scheduling">
          <AdvancedScheduling />
        </TabsContent>

        <TabsContent value="powerbi">
          <PowerBIAdvanced />
        </TabsContent>

        <TabsContent value="relatorio">
          <CoordinatorReportsCenter />
        </TabsContent>

        <TabsContent value="usuarios">
          <UserManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="configuracoes">
          <SystemManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
