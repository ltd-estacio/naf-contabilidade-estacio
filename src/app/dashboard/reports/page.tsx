'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts'
import * as XLSX from 'xlsx'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface ReportData {
  demands?: unknown[]
  attendances?: unknown[]
  services?: unknown[]
  users?: unknown[]
  stats?: unknown
}

interface DateFilter {
  startDate: string
  endDate: string
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [reportType, setReportType] = useState<string>('demands')
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      })

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }, [reportType, dateFilter])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'COORDINATOR') {
      router.push('/dashboard')
      return
    }

    loadReport()
  }, [session, router, loadReport])

  const exportToExcel = useCallback(() => {
    const workbook = XLSX.utils.book_new()
    
    // Dados principais
    if (reportData.demands) {
      const demandsSheet = XLSX.utils.json_to_sheet(
        reportData.demands.map((demand: unknown) => ({
          'Protocolo': demand.protocolNumber,
          'Usuário': demand.user.name,
          'Email': demand.user.email,
          'Serviço': demand.service.name,
          'Categoria': demand.service.category,
          'Status': demand.status,
          'Prioridade': demand.priority,
          'Data Criação': new Date(demand.createdAt).toLocaleDateString('pt-BR'),
          'Atendimentos': demand.attendances?.length || 0
        }))
      )
      XLSX.utils.book_append_sheet(workbook, demandsSheet, 'Demandas')
    }

    if (reportData.attendances) {
      const attendancesSheet = XLSX.utils.json_to_sheet(
        reportData.attendances.map((att: unknown) => ({
          'ID': att.id,
          'Usuário': att.user.name,
          'Serviço': att.demand.service.name,
          'Horas': att.hours,
          'Validado': att.isValidated ? 'Sim' : 'Não',
          'Data': new Date(att.createdAt).toLocaleDateString('pt-BR'),
          'Observações': att.notes || ''
        }))
      )
      XLSX.utils.book_append_sheet(workbook, attendancesSheet, 'Atendimentos')
    }

    // Estatísticas
    if (reportData.stats) {
      const statsData = Object.entries(reportData.stats).map(([key, value]) => ({
        'Métrica': key,
        'Valor': typeof value === 'object' ? JSON.stringify(value) : value
      }))
      const statsSheet = XLSX.utils.json_to_sheet(statsData)
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas')
    }

    // Download
    const fileName = `NAF_Relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }, [reportData, reportType])

  const downloadPDF = useCallback(async () => {
    const params = new URLSearchParams({
      type: reportType,
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      format: 'pdf'
    })

    window.open(`/api/reports?${params}`, '_blank')
  }, [reportType, dateFilter])

  const renderDemandCharts = () => {
    if (!reportData.stats) return null

    const statusData = Object.entries(reportData.stats.byStatus || {}).map(([status, count]) => ({
      name: status,
      value: count as number,
      fill: COLORS[Object.keys(reportData.stats.byStatus).indexOf(status) % COLORS.length]
    }))

    const priorityData = Object.entries(reportData.stats.byPriority || {}).map(([priority, count]) => ({
      name: priority,
      value: count as number
    }))

    const serviceData = Object.entries(reportData.stats.byService || {}).slice(0, 10).map(([service, count]) => ({
      name: service.length > 20 ? service.substring(0, 20) + '...' : service,
      value: count as number
    }))

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prioridade das Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Serviços Mais Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={serviceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {reportData.stats.monthlyTrend && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendência Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportData.stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderAttendanceCharts = () => {
    if (!reportData.stats) return null

    const userHoursData = Object.entries(reportData.stats.byUser || {}).slice(0, 10).map(([user, hours]) => ({
      name: user.length > 15 ? user.substring(0, 15) + '...' : user,
      hours: hours as number
    }))

    const serviceAttendanceData = Object.entries(reportData.stats.byService || {}).slice(0, 8).map(([service, count]) => ({
      name: service.length > 20 ? service.substring(0, 20) + '...' : service,
      count: count as number
    }))

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Horas por Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceAttendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {serviceAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {reportData.stats.monthlyTrend && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendência Mensal de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#FF8042" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderUsersCharts = () => {
    if (!reportData.stats) return null

    const roleData = Object.entries(reportData.stats.byRole || {}).map(([role, count]) => ({
      name: role,
      value: count as number,
      fill: COLORS[Object.keys(reportData.stats.byRole).indexOf(role) % COLORS.length]
    }))

    const topUsersData = reportData.stats.userActivity?.slice(0, 10).map((user: unknown) => ({
      name: user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name,
      demandas: user.totalDemands,
      horas: user.totalHours
    })) || []

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários por Papel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Usuários Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demandas" fill="#0088FE" name="Demandas" />
                <Bar dataKey="horas" fill="#00C49F" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSummaryCards = () => {
    if (!reportData.stats) return null

    const cards = []

    if (reportType === 'demands') {
      cards.push(
        <Card key="total-demands">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.totalDemands || 0}</div>
          </CardContent>
        </Card>,
        <Card key="avg-resolution">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.averageResolutionTime || 0} dias</div>
          </CardContent>
        </Card>
      )
    }

    if (reportType === 'attendances') {
      cards.push(
        <Card key="total-attendances">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.totalAttendances || 0}</div>
          </CardContent>
        </Card>,
        <Card key="total-hours">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.totalHours || 0}h</div>
          </CardContent>
        </Card>,
        <Card key="validated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Validados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.validatedAttendances || 0}</div>
          </CardContent>
        </Card>
      )
    }

    if (reportType === 'users') {
      cards.push(
        <Card key="total-users">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.totalUsers || 0}</div>
          </CardContent>
        </Card>,
        <Card key="active-users">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.activeUsers || 0}</div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards}
      </div>
    )
  }

  if (!session || session.user.role !== 'COORDINATOR') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas coordenadores podem acessar os relatórios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios NAF</h1>
          <p className="text-muted-foreground">
            Análise completa de dados e estatísticas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            📊 Exportar Excel
          </Button>
          <Button onClick={downloadPDF} variant="outline">
            📄 Baixar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="report-type" className="text-sm font-medium">Tipo de Relatório</label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="demands">Demandas</option>
                <option value="attendances">Atendimentos</option>
                <option value="users">Usuários</option>
                <option value="services">Serviços</option>
                <option value="general">Relatório Geral</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="report-start-date" className="text-sm font-medium">Data Início</label>
              <Input
                id="report-start-date"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="report-end-date" className="text-sm font-medium">Data Fim</label>
              <Input
                id="report-end-date"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={loadReport} disabled={loading} className="w-full">
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      {renderSummaryCards()}

      {/* Gráficos */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando relatório...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {reportType === 'demands' && renderDemandCharts()}
          {reportType === 'attendances' && renderAttendanceCharts()}
          {reportType === 'users' && renderUsersCharts()}
          
          {reportType === 'general' && reportData.stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Usuários:</span>
                      <Badge variant="secondary">{reportData.stats.overview?.totalUsers || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Serviços:</span>
                      <Badge variant="secondary">{reportData.stats.overview?.totalServices || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Demandas:</span>
                      <Badge variant="secondary">{reportData.stats.overview?.totalDemands || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Atendimentos:</span>
                      <Badge variant="secondary">{reportData.stats.overview?.totalAttendances || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {reportData.stats.monthlyTrend && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tendência Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={reportData.stats.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Tabela de Dados Detalhados */}
      {reportData.demands && reportData.demands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demandas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Protocolo</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Usuário</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Serviço</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Prioridade</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.demands.slice(0, 50).map((demand: unknown) => (
                    <tr key={demand.id}>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{demand.protocolNumber}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{demand.user.name}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{demand.service.name}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        <Badge variant={demand.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {demand.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        <Badge variant={demand.priority === 'HIGH' ? 'destructive' : 'outline'}>
                          {demand.priority}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {new Date(demand.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.demands.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Mostrando 50 de {reportData.demands.length} registros. Use a exportação para ver todos.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
