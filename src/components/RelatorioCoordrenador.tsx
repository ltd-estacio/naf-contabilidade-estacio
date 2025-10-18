'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Calendar, Users, TrendingUp } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface RelatorioData {
  geradoEm: string
  geradoPor: string
  periodo: string
  resumo: {
    totalUsuarios: number
    totalServicos: number
    totalDemandas: number
    totalAtendimentos: number
    demandasPendentes: number
    atendimentosConcluidos: number
    taxaConclusao: number
  }
  dadosMensais: Array<{
    mes: string
    demandas: number
    atendimentos: number
  }>
  categorias: Record<string, number>
  usuarios: Array<{
    nome: string
    email: string
    papel: string
    telefone: string
    dataCadastro: string
    totalDemandas: number
    totalAtendimentos: number
  }>
  servicos: Array<{
    nome: string
    categoria: string
    duracaoEstimada: string
    totalDemandas: number
  }>
  demandasRecentes: Array<{
    protocolo: string
    titulo: string
    status: string
    cliente: string
    servico: string
    categoria: string
    dataCriacao: string
    usuario: string
  }>
  atendimentosRecentes: Array<{
    protocolo: string
    status: string
    categoria: string
    horas: number
    dataAgendamento: string
    usuario: string
    servico: string
  }>
}

export default function RelatorioCoordrenador() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RelatorioData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reports/coordenador?format=pdf-data')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Erro ao carregar dados')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const gerarPDF = async () => {
    if (!data) return

    setLoading(true)
    
    try {
      const element = document.getElementById('relatorio-content')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const nomeArquivo = `relatorio-naf-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(nomeArquivo)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      setError('Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'CANCELED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Relatório do Coordenador - NAF Contábil
          </CardTitle>
          <CardDescription>
            Relatório completo com estatísticas, usuários e atendimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={carregarDados} 
              disabled={loading}
              variant="outline"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {loading ? 'Carregando...' : 'Carregar Dados em Tempo Real'}
            </Button>
            
            {data && (
              <Button 
                onClick={gerarPDF} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <div id="relatorio-content" className="bg-white dark:bg-gray-950 p-8 space-y-8">
          {/* Cabeçalho do Relatório */}
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NAF - Núcleo de Apoio Contábil Fiscal</h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mt-2">Relatório Gerencial Completo</h2>
            <div className="mt-4 text-sm text-gray-500">
              <p>Gerado em: {new Date(data.geradoEm).toLocaleString('pt-BR')}</p>
              <p>Responsável: {data.geradoPor}</p>
              <p>Período: {data.periodo}</p>
            </div>
          </div>

          {/* Resumo Executivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.resumo.totalUsuarios}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.resumo.totalServicos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Serviços Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{data.resumo.totalDemandas}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total de Demandas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{data.resumo.totalAtendimentos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Atendimentos</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{data.resumo.demandasPendentes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Demandas Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.resumo.atendimentosConcluidos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Atendimentos Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.resumo.taxaConclusao}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Mensais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dadosMensais.map((mes, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="font-medium">{mes.mes}</div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{mes.demandas}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Demandas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{mes.atendimentos}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Atendimentos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Serviços por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Demandas por Categoria de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.categorias).map(([categoria, total]) => (
                  <div key={categoria} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="font-medium">{categoria}</span>
                    <Badge variant="secondary">{total} demandas</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usuários Cadastrados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Cadastrados ({data.usuarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Papel</th>
                      <th className="text-left p-2">Telefone</th>
                      <th className="text-left p-2">Cadastro</th>
                      <th className="text-center p-2">Demandas</th>
                      <th className="text-center p-2">Atendimentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.usuarios.slice(0, 20).map((usuario, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:bg-gray-900">
                        <td className="p-2 font-medium">{usuario.nome}</td>
                        <td className="p-2 text-gray-600 dark:text-gray-400">{usuario.email}</td>
                        <td className="p-2">
                          <Badge variant={usuario.papel === 'COORDINATOR' ? 'default' : usuario.papel === 'TEACHER' ? 'secondary' : 'outline'}>
                            {usuario.papel}
                          </Badge>
                        </td>
                        <td className="p-2">{usuario.telefone}</td>
                        <td className="p-2">{usuario.dataCadastro}</td>
                        <td className="p-2 text-center">{usuario.totalDemandas}</td>
                        <td className="p-2 text-center">{usuario.totalAtendimentos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.usuarios.length > 20 && (
                  <p className="text-center text-gray-500 mt-4">
                    ... e mais {data.usuarios.length - 20} usuários
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demandas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Demandas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.demandasRecentes.map((demanda, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">#{demanda.protocolo}</span>
                      <Badge className={getStatusColor(demanda.status)}>
                        {demanda.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Cliente:</span> {demanda.cliente}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Serviço:</span> {demanda.servico}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Categoria:</span> {demanda.categoria}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Data:</span> {demanda.dataCriacao}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rodapé */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p>NAF - Núcleo de Apoio Contábil Fiscal</p>
            <p>Relatório gerado automaticamente pelo sistema em {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
