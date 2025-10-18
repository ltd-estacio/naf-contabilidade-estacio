'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AttendancesPage() {
  const [showNewAttendanceForm, setShowNewAttendanceForm] = useState(false)
  const [userRole] = useState('ALUNO') // Simular usuário logado
  
  const [attendanceForm, setAttendanceForm] = useState({
    category: '',
    theme: '',
    subTheme: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCpf: '',
    clientAddress: '',
    description: '',
    type: 'PRESENCIAL',
    channel: 'PRESENCIAL',
    startDate: '',
    endDate: '',
    requestedHours: '',
    supervisorId: '',
    observations: '',
    documents: []
  })

  const [attendances] = useState([
    {
      id: '1',
      protocol: 'ATD-2025-0001',
      category: 'MEI',
      theme: 'Emissão de Documentos',
      subTheme: 'DAS',
      clientName: 'Ana Maria Silva',
      clientPhone: '+55 11 99999-1234',
      attendant: 'João Silva',
      supervisor: 'Prof. Carlos Costa',
      type: 'ONLINE',
      channel: 'WHATSAPP',
      startDate: '2025-09-04T09:00:00Z',
      endDate: '2025-09-04T10:30:00Z',
      requestedHours: 2,
      validatedHours: 1.5,
      status: 'VALIDADA',
      isValidated: true,
      validatedAt: '2025-09-04T11:00:00Z'
    },
    {
      id: '2',
      protocol: 'ATD-2025-0002',
      category: 'Cadastros',
      theme: 'CPF',
      subTheme: 'Regularização',
      clientName: 'Carlos Santos',
      clientPhone: '+55 11 88888-5678',
      attendant: 'Maria Santos',
      supervisor: 'Prof. Ana Lima',
      type: 'PRESENCIAL',
      channel: 'PRESENCIAL',
      startDate: '2025-09-03T14:00:00Z',
      endDate: '2025-09-03T15:00:00Z',
      requestedHours: 1,
      validatedHours: null,
      status: 'AGUARDANDO_VALIDACAO',
      isValidated: false
    }
  ])

  const categories = [
    { value: 'MEI', label: 'MEI', themes: ['Emissão de Documentos', 'Orientação Fiscal', 'Cadastro'] },
    { value: 'Cadastros', label: 'Cadastros', themes: ['CPF', 'CNPJ', 'Imóveis Rurais'] },
    { value: 'Imposto de Renda', label: 'Imposto de Renda', themes: ['Pessoa Física', 'Orientações', 'Declarações'] },
    { value: 'Certidões', label: 'Certidões', themes: ['Negativas', 'Regularidade', 'Parcelamento'] }
  ]

  const generateProtocol = () => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    const time = String(new Date().getTime()).slice(-4)
    return `ATD-${year}-${month}${day}${time}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Novo atendimento:', attendanceForm)
    alert('Atendimento cadastrado com sucesso! Aguardando validação do professor.')
    setShowNewAttendanceForm(false)
  }

  const validateAttendance = (id: string) => {
    alert(`Atendimento ${id} validado com sucesso!`)
  }

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    return diff.toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 dark:bg-gray-950 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                <span>←</span>
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Cadastro de Atendimentos</h1>
            </div>
            <Button onClick={() => setShowNewAttendanceForm(true)}>
              <span className="mr-2">➕</span>
              Novo Atendimento
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form de Novo Atendimento */}
        {showNewAttendanceForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cadastro de Atendimento Detalhado</CardTitle>
              <CardDescription>
                Protocolo será gerado automaticamente: {generateProtocol()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Categorização */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria *
                    </label>
                    <select
                      id="categorySelect"
                      value={attendanceForm.category}
                      onChange={(e) => setAttendanceForm(prev => ({ 
                        ...prev, 
                        category: e.target.value,
                        theme: '',
                        subTheme: ''
                      }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="themeSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema *
                    </label>
                    <select
                      id="themeSelect"
                      value={attendanceForm.theme}
                      onChange={(e) => setAttendanceForm(prev => ({ 
                        ...prev, 
                        theme: e.target.value,
                        subTheme: ''
                      }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!attendanceForm.category}
                    >
                      <option value="">Selecione um tema</option>
                      {attendanceForm.category && 
                        categories.find(c => c.value === attendanceForm.category)?.themes.map(theme => (
                          <option key={theme} value={theme}>{theme}</option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtema
                    </label>
                    <Input
                      id="subTheme"
                      value={attendanceForm.subTheme}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, subTheme: e.target.value }))}
                      placeholder="Ex: DAS, Regularização..."
                    />
                  </div>
                </div>

                {/* Dados do Cliente */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Dados da Pessoa Atendida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        id="clientName"
                        value={attendanceForm.clientName}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Nome da pessoa atendida"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        id="clientEmail"
                        value={attendanceForm.clientEmail}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefone *
                      </label>
                      <Input
                        id="clientPhone"
                        value={attendanceForm.clientPhone}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="clientCpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CPF
                      </label>
                      <Input
                        id="clientCpf"
                        value={attendanceForm.clientCpf}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, clientCpf: e.target.value }))}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço Completo
                    </label>
                    <Input
                      id="clientAddress"
                      value={attendanceForm.clientAddress}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, clientAddress: e.target.value }))}
                      placeholder="Rua, número, bairro, cidade, estado"
                    />
                  </div>
                </div>

                {/* Detalhes do Atendimento */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Detalhes do Atendimento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="attendanceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Atendimento *
                      </label>
                      <select
                        id="attendanceType"
                        value={attendanceForm.type}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="ONLINE">Online</option>
                        <option value="HIBRIDO">Híbrido</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="attendanceChannel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Canal de Atendimento *
                      </label>
                      <select
                        id="attendanceChannel"
                        value={attendanceForm.channel}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, channel: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email</option>
                        <option value="TELEFONE">Telefone</option>
                        <option value="TEAMS">Teams</option>
                        <option value="ZOOM">Zoom</option>
                        <option value="SISTEMA">Sistema</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data/Hora de Início *
                      </label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={attendanceForm.startDate}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data/Hora de Término
                      </label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={attendanceForm.endDate}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="requestedHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Carga Horária Solicitada *
                      </label>
                      <Input
                        id="requestedHours"
                        type="number"
                        step="0.5"
                        value={attendanceForm.requestedHours}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, requestedHours: e.target.value }))}
                        placeholder="2.0"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Professor Orientador
                    </label>
                    <select
                      id="supervisorId"
                      value={attendanceForm.supervisorId}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, supervisorId: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione o professor orientador</option>
                      <option value="1">Prof. Carlos Costa</option>
                      <option value="2">Prof. Ana Lima</option>
                      <option value="3">Prof. João Santos</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="attendanceDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição Detalhada do Atendimento *
                    </label>
                    <textarea
                      id="attendanceDescription"
                      value={attendanceForm.description}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva detalhadamente o atendimento prestado, orientações dadas, documentos solicitados/analisados, etc."
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="attendanceObservations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Observações Adicionais
                    </label>
                    <textarea
                      id="attendanceObservations"
                      value={attendanceForm.observations}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, observations: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Observações, dificuldades encontradas, próximos passos, etc."
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <Button type="submit">
                    Cadastrar Atendimento
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewAttendanceForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Atendimentos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Atendimentos Registrados</h2>
            <div className="flex space-x-4">
              <Input placeholder="Buscar por protocolo..." className="max-w-xs" />
              <Button variant="outline">🔍 Filtrar</Button>
            </div>
          </div>

          {attendances.map((attendance) => (
            <Card key={attendance.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {attendance.protocol}
                      </span>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        attendance.isValidated 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendance.isValidated ? 'Validado' : 'Aguardando Validação'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800">
                        {attendance.type}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {attendance.channel}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {attendance.category} - {attendance.theme}
                      {attendance.subTheme && ` (${attendance.subTheme})`}
                    </h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!attendance.isValidated && userRole === 'PROFESSOR' && (
                      <Button 
                        size="sm" 
                        onClick={() => validateAttendance(attendance.id)}
                      >
                        ✅ Validar
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      👁️ Ver Detalhes
                    </Button>
                    <Button size="sm" variant="outline">
                      📄 Gerar Certificado
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Cliente:</span>
                    <p className="text-gray-600">{attendance.clientName}</p>
                    <p className="text-gray-500">{attendance.clientPhone}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Atendente:</span>
                    <p className="text-gray-600">{attendance.attendant}</p>
                    <span className="font-medium text-gray-700">Supervisor:</span>
                    <p className="text-gray-600">{attendance.supervisor}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Período:</span>
                    <p className="text-gray-600">
                      {new Date(attendance.startDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-gray-600">
                      {new Date(attendance.startDate).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {attendance.endDate && new Date(attendance.endDate).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Carga Horária:</span>
                    <p className="text-gray-600">
                      Solicitada: {attendance.requestedHours}h
                    </p>
                    {attendance.validatedHours && (
                      <p className="text-green-600">
                        Validada: {attendance.validatedHours}h
                      </p>
                    )}
                    {attendance.endDate && (
                      <p className="text-blue-600">
                        Real: {formatDuration(attendance.startDate, attendance.endDate)}h
                      </p>
                    )}
                  </div>
                </div>
                
                {attendance.isValidated && attendance.validatedAt && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Validado em {new Date(attendance.validatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
