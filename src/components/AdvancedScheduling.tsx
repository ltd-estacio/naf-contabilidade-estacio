// Sistema de Agendamento Avançado - NAF Contábil
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Video, Phone, Mail, User, FileText, CheckCircle2, AlertCircle, Plus, Search } from 'lucide-react'

interface Appointment {
  id: string
  protocol: string
  title: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  serviceName: string
  serviceCategory: string
  date: string
  time: string
  endTime?: string
  duration: number
  location?: string
  isOnline: boolean
  meetingUrl?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  assignedTeacher?: string
  description?: string
  requiredDocs?: string[]
  notes?: string
  createdAt: string
  updatedAt?: string
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

export default function AdvancedSchedulingSystem() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dados do formulário de novo agendamento
  const [appointmentForm, setAppointmentForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    isOnline: false,
    meetingUrl: '',
    priority: 'medium',
    description: '',
    requiredDocs: [] as string[]
  })

  // Horários disponíveis para agendamento
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/schedule?startDate=${selectedDate}&endDate=${selectedDate}`)
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  const generateTimeSlots = useCallback(() => {
    const slots: TimeSlot[] = []
    const startHour = 8
    const endHour = 18
    const interval = 30 // minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Verificar se o horário já está ocupado
        const isOccupied = appointments.some(apt => apt.time === time && apt.date === selectedDate)
        const isLunchTime = hour === 12 // Horário de almoço
        
        slots.push({
          time,
          available: !isOccupied && !isLunchTime,
          reason: isOccupied ? 'Ocupado' : isLunchTime ? 'Almoço' : undefined
        })
      }
    }
    setAvailableSlots(slots)
  }, [appointments, selectedDate])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    generateTimeSlots()
  }, [generateTimeSlots])

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentForm,
          type: 'attendance',
          startTime: `${appointmentForm.date}T${appointmentForm.time}:00`,
          endTime: `${appointmentForm.date}T${addMinutes(appointmentForm.time, appointmentForm.duration)}:00`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Agendamento criado com sucesso!')
        setShowNewAppointment(false)
        setAppointmentForm({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          serviceId: '',
          date: '',
          time: '',
          duration: 60,
          location: '',
          isOnline: false,
          meetingUrl: '',
          priority: 'medium',
          description: '',
          requiredDocs: []
        })
        loadAppointments()
      } else {
        alert('Erro ao criar agendamento: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro interno do sistema')
    }
  }

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, type: 'appointment' })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Status atualizado com sucesso!')
        loadAppointments()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.protocol.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Agendamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie agendamentos e atendimentos</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowNewAppointment(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, serviço ou protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{appointment.clientName}</CardTitle>
                  <CardDescription className="text-sm">
                    {appointment.protocol}
                  </CardDescription>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status === 'pending' && 'Pendente'}
                    {appointment.status === 'confirmed' && 'Confirmado'}
                    {appointment.status === 'in_progress' && 'Em Andamento'}
                    {appointment.status === 'completed' && 'Concluído'}
                    {appointment.status === 'cancelled' && 'Cancelado'}
                  </Badge>
                  
                  <Badge className={getPriorityColor(appointment.priority)}>
                    {appointment.priority === 'urgent' && 'Urgente'}
                    {appointment.priority === 'high' && 'Alta'}
                    {appointment.priority === 'medium' && 'Média'}
                    {appointment.priority === 'low' && 'Baixa'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4 mr-2" />
                {appointment.serviceName}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(appointment.date).toLocaleDateString('pt-BR')}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                {appointment.time} ({appointment.duration}min)
              </div>
              
              {appointment.isOnline ? (
                <div className="flex items-center text-sm text-blue-600">
                  <Video className="h-4 w-4 mr-2" />
                  Online
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {appointment.location || 'Presencial'}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {appointment.clientEmail}
              </div>
              
              {appointment.clientPhone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {appointment.clientPhone}
                </div>
              )}
              
              {appointment.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {appointment.description}
                </div>
              )}
              
              {appointment.assignedTeacher && (
                <div className="flex items-center text-sm text-green-600">
                  <User className="h-4 w-4 mr-2" />
                  Professor: {appointment.assignedTeacher}
                </div>
              )}
              
              {/* Ações */}
              <div className="flex gap-2 pt-2">
                {appointment.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Confirmar
                  </Button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                  >
                    Iniciar
                  </Button>
                )}
                
                {appointment.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    Concluir
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou criar um novo agendamento.</p>
        </div>
      )}

      {/* Modal de Novo Agendamento */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointment-client-name" className="block text-sm font-medium mb-2">Nome do Cliente *</label>
                  <Input
                    id="appointment-client-name"
                    value={appointmentForm.clientName}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientName: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="appointment-client-email" className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    id="appointment-client-email"
                    type="email"
                    value={appointmentForm.clientEmail}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="appointment-client-phone" className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    id="appointment-client-phone"
                    value={appointmentForm.clientPhone}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label htmlFor="appointment-service" className="block text-sm font-medium mb-2">Serviço *</label>
                  <select
                    id="appointment-service"
                    value={appointmentForm.serviceId}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    <option value="1">Cadastro CPF</option>
                    <option value="2">Orientação MEI</option>
                    <option value="3">Declaração IR</option>
                    <option value="4">Certidões Negativas</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appointment-date" className="block text-sm font-medium mb-2">Data *</label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="appointment-time" className="block text-sm font-medium mb-2">Horário *</label>
                  <select
                    id="appointment-time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    required
                  >
                    <option value="">Selecione um horário</option>
                    {availableSlots.filter(slot => slot.available).map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appointment-duration" className="block text-sm font-medium mb-2">Duração (min)</label>
                  <select
                    id="appointment-duration"
                    value={appointmentForm.duration}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  >
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appointment-priority" className="block text-sm font-medium mb-2">Prioridade</label>
                  <select
                    id="appointment-priority"
                    value={appointmentForm.priority}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={appointmentForm.isOnline}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, isOnline: e.target.checked }))}
                  />
                  <span className="text-sm font-medium">Atendimento Online</span>
                </label>
              </div>
              
              {appointmentForm.isOnline ? (
                <div>
                  <label htmlFor="appointment-meeting-url" className="block text-sm font-medium mb-2">URL da Reunião</label>
                  <Input
                    id="appointment-meeting-url"
                    value={appointmentForm.meetingUrl}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, meetingUrl: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="appointment-location" className="block text-sm font-medium mb-2">Local do Atendimento</label>
                  <Input
                    id="appointment-location"
                    value={appointmentForm.location}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Sala, laboratório ou local específico"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="appointment-description" className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  id="appointment-description"
                  value={appointmentForm.description}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="Detalhes adicionais sobre o atendimento..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Criar Agendamento
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewAppointment(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
