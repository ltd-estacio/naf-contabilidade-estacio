'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TimeSlot {
  time: string
  is_available: boolean
  reason?: string | null
  slots_remaining: number
}

interface BlockedInfo {
  isBlocked: boolean
  reason?: string
  type?: 'day' | 'date'
}

interface ImprovedCalendarPickerProps {
  onDateTimeSelect: (date: string, time: string, format: 'presencial' | 'online') => void
  selectedDate?: string
  selectedTime?: string
  selectedFormat?: 'presencial' | 'online'
}

export default function ImprovedCalendarPicker({
  onDateTimeSelect,
  selectedDate = '',
  selectedTime = '',
  selectedFormat = 'presencial',
}: ImprovedCalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [date, setDate] = useState(selectedDate)
  const [time, setTime] = useState(selectedTime)
  const [format, setFormat] = useState<'presencial' | 'online'>(selectedFormat)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [manualDate, setManualDate] = useState('')
  const [blockedInfo, setBlockedInfo] = useState<BlockedInfo>({ isBlocked: false })

  const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  useEffect(() => {
    if (date) {
      console.log('🔍 Carregando horários para:', date)
      loadTimeSlots(date)
    } else {
      console.log('⚠️ Nenhuma data selecionada ainda')
    }
  }, [date])

  useEffect(() => {
    if (date && time && format) {
      console.log('✅ Seleção completa:', { date, time, format })
      onDateTimeSelect(date, time, format)
    }
  }, [date, time, format])

  const loadTimeSlots = async (selectedDate: string) => {
    console.log('📡 Buscando slots para:', selectedDate)
    setLoading(true)
    setBlockedInfo({ isBlocked: false }) // Reset blocked info
    
    try {
      const response = await fetch(`/api/scheduling/availability?date=${selectedDate}`)
      const data = await response.json()
      
      console.log('📥 Resposta da API:', data)
      
      // Verificar se há bloqueios para esta data
      if (data.availability && Array.isArray(data.availability)) {
        const selectedDateObj = new Date(selectedDate + 'T00:00:00')
        const dayOfWeek = selectedDateObj.getDay() // 0=Domingo, 6=Sábado
        
        // Verificar bloqueio por data específica
        const dateBlock = data.availability.find((avail: any) => 
          avail.type === 'blocked' && 
          avail.specific_date === selectedDate &&
          avail.is_active
        )
        
        // Verificar bloqueio por dia da semana
        const dayBlock = data.availability.find((avail: any) => 
          avail.type === 'blocked' && 
          avail.day_of_week === dayOfWeek &&
          !avail.specific_date &&
          avail.is_active
        )
        
        if (dateBlock) {
          console.log('🚫 Data bloqueada:', dateBlock.reason)
          setBlockedInfo({
            isBlocked: true,
            reason: dateBlock.reason || 'Data indisponível para agendamentos',
            type: 'date'
          })
          setTimeSlots([])
          setLoading(false)
          return
        }
        
        if (dayBlock) {
          console.log('🚫 Dia da semana bloqueado:', dayBlock.reason)
          setBlockedInfo({
            isBlocked: true,
            reason: dayBlock.reason || 'Este dia da semana está bloqueado para agendamentos',
            type: 'day'
          })
          setTimeSlots([])
          setLoading(false)
          return
        }
      }
      
      if (data.timeSlots && data.timeSlots.length > 0) {
        console.log(`✅ ${data.timeSlots.length} horários recebidos da API`)
        setTimeSlots(data.timeSlots)
      } else {
        console.log('⚠️ API não retornou slots, usando horários padrão')
        // Fallback: usar horários fixos se a API não retornar slots
        const defaultSlots = [
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ].map(time => ({
          time,
          is_available: true,
          reason: null,
          slots_remaining: 3
        }))
        console.log(`✅ ${defaultSlots.length} horários padrão definidos`)
        setTimeSlots(defaultSlots)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar horários:', error)
      // Em caso de erro, usar horários padrão
      const defaultSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ].map(time => ({
        time,
        is_available: true,
        reason: null,
        slots_remaining: 3
      }))
      console.log(`✅ ${defaultSlots.length} horários padrão (fallback por erro)`)
      setTimeSlots(defaultSlots)
    } finally {
      setLoading(false)
      console.log('✅ Loading concluído')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days of the month
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )
      dateObj.setHours(0, 0, 0, 0)
      
      const isPast = dateObj < today
      const isToday = dateObj.getTime() === today.getTime()
      const dateString = dateObj.toISOString().split('T')[0]
      const isSelected = date === dateString

      days.push({
        day,
        date: dateObj,
        dateString,
        isPast,
        isToday,
        isSelected,
      })
    }

    return days
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (dateString: string) => {
    setDate(dateString)
    setTime('') // Reset time when date changes
  }

  const handleManualDateInput = (value: string) => {
    setManualDate(value)
    // Try to parse dd/mm/yyyy format
    const parts = value.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(dateObj.getTime())) {
        const dateString = dateObj.toISOString().split('T')[0]
        setDate(dateString)
        setCurrentMonth(dateObj)
      }
    }
  }

  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime)
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecione a Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-semibold">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Manual Date Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Ou digite a data (dd/mm/aaaa)
            </label>
            <Input
              type="text"
              placeholder="Ex: 15/03/2025"
              value={manualDate}
              onChange={(e) => handleManualDateInput(e.target.value)}
              className="text-center"
              maxLength={10}
            />
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayInfo, index) => {
              if (!dayInfo) {
                return <div key={`empty-${index}`} />
              }

              const { day, isPast, isToday, isSelected, dateString } = dayInfo

              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateClick(dateString)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-blue-50 cursor-pointer'
                    }
                    ${isToday && !isSelected
                      ? 'border-2 border-blue-500 text-blue-600'
                      : ''
                    }
                    ${isSelected
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-white border border-gray-200'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {date && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Data selecionada:</strong>{' '}
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle>Horários Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando horários...</p>
              </div>
            ) : blockedInfo.isBlocked ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600 mb-2">
                    {blockedInfo.type === 'date' ? 'Data Bloqueada' : 'Dia da Semana Bloqueado'}
                  </p>
                  <p className="text-gray-600">
                    {blockedInfo.reason}
                  </p>
                </div>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    💡 <strong>Dica:</strong> Selecione outra data disponível no calendário para continuar com o agendamento.
                  </p>
                </div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Não há horários disponíveis para esta data
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.is_available && handleTimeSelect(slot.time)}
                    disabled={!slot.is_available}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all
                      ${!slot.is_available
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : time === slot.time
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50'
                      }
                    `}
                    title={slot.reason || undefined}
                  >
                    {slot.time}
                    {slot.is_available && slot.slots_remaining > 0 && (
                      <div className="text-xs mt-1 opacity-75">
                        {slot.slots_remaining} vaga{slot.slots_remaining !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Format Selection */}
      {date && time && (
        <Card>
          <CardHeader>
            <CardTitle>Formato do Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('presencial')}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${format === 'presencial'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <MapPin className={`h-8 w-8 ${
                    format === 'presencial' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    format === 'presencial' ? 'text-blue-900' : 'text-gray-600'
                  }`}>
                    Presencial
                  </span>
                  {format === 'presencial' && (
                    <Badge className="bg-blue-500">Selecionado</Badge>
                  )}
                </div>
              </button>

              <button
                onClick={() => setFormat('online')}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${format === 'online'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <Video className={`h-8 w-8 ${
                    format === 'online' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    format === 'online' ? 'text-blue-900' : 'text-gray-600'
                  }`}>
                    Online
                  </span>
                  {format === 'online' && (
                    <Badge className="bg-blue-500">Selecionado</Badge>
                  )}
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {date && time && format && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-green-900 mb-2">Resumo do Agendamento</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>
                <strong>Data:</strong>{' '}
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </p>
              <p>
                <strong>Horário:</strong> {time}
              </p>
              <p>
                <strong>Formato:</strong>{' '}
                {format === 'presencial' ? 'Presencial' : 'Online'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
