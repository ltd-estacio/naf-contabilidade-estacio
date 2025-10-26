'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Trash2, Edit2, CheckCircle, XCircle, Save, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface AvailabilityConfig {
  id: string
  type: 'available' | 'blocked'
  specific_date?: string
  day_of_week?: number
  start_time: string
  end_time: string
  reason?: string
  max_appointments?: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

interface SchedulingSettings {
  id: string
  min_advance_hours: number
  max_advance_days: number
  default_start_time: string
  default_end_time: string
  slot_duration_minutes: number
  default_working_days: number[]
  blocked_dates: string[]
  send_confirmation_email: boolean
  send_reminder_email: boolean
  reminder_hours_before: number
}

const WEEKDAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

export default function SchedulingAvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<AvailabilityConfig[]>([])
  const [settings, setSettings] = useState<SchedulingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    type: 'available' as 'available' | 'blocked',
    dateType: 'specific' as 'specific' | 'recurring',
    specific_date: '',
    day_of_week: '',
    start_time: '08:00',
    end_time: '17:00',
    max_appointments: '1',
    reason: '',
  })

  useEffect(() => {
    loadAvailabilities()
    loadSettings()
  }, [])

  const loadAvailabilities = async () => {
    try {
      const response = await fetch('/api/scheduling/availability')
      const data = await response.json()
      if (data.availability) {
        setAvailabilities(data.availability)
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/scheduling/settings')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        type: formData.type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        reason: formData.reason || null,
        created_by: 'coordinator', // TODO: Pegar do usuário logado
      }

      if (formData.type === 'available') {
        payload.max_appointments = parseInt(formData.max_appointments)
      }

      if (formData.dateType === 'specific') {
        payload.specific_date = formData.specific_date
        payload.day_of_week = null // Garantir que day_of_week seja null
      } else {
        payload.day_of_week = parseInt(formData.day_of_week)
        payload.specific_date = null // Garantir que specific_date seja null
      }

      const url = editingId
        ? '/api/scheduling/availability'
        : '/api/scheduling/availability'
      
      const method = editingId ? 'PUT' : 'POST'
      
      if (editingId) {
        payload.id = editingId
      }

      console.log('📤 Enviando para API:', method, url)
      console.log('📦 Payload:', JSON.stringify(payload, null, 2))

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      console.log('📥 Resposta da API:', {
        status: response.status,
        ok: response.ok,
        data
      })

      if (response.ok) {
        alert(editingId ? 'Configuração atualizada!' : 'Configuração criada!')
        setIsModalOpen(false)
        resetForm()
        loadAvailabilities()
      } else {
        const errorMsg = data.error || 'Erro desconhecido'
        const details = data.details ? `\n\nDetalhes: ${data.details}` : ''
        alert(`Erro: ${errorMsg}${details}`)
        console.error('❌ Erro da API:', data)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config: AvailabilityConfig) => {
    setEditingId(config.id)
    setFormData({
      type: config.type,
      dateType: config.specific_date ? 'specific' : 'recurring',
      specific_date: config.specific_date || '',
      day_of_week: config.day_of_week?.toString() || '',
      start_time: config.start_time,
      end_time: config.end_time,
      max_appointments: config.max_appointments?.toString() || '1',
      reason: config.reason || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return

    try {
      const response = await fetch(`/api/scheduling/availability?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Configuração excluída!')
        loadAvailabilities()
      } else {
        alert('Erro ao excluir configuração')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir configuração')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      type: 'available',
      dateType: 'specific',
      specific_date: '',
      day_of_week: '',
      start_time: '08:00',
      end_time: '17:00',
      max_appointments: '1',
      reason: '',
    })
  }

  const handleUpdateSettings = async (updatedSettings: Partial<SchedulingSettings>) => {
    try {
      const response = await fetch('/api/scheduling/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedSettings,
          updated_by: 'coordinator', // TODO: Pegar do usuário logado
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Configurações atualizadas!')
        setSettings(data.settings)
        setIsSettingsOpen(false)
      } else {
        alert(`Erro: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      alert('Erro ao atualizar configurações')
    }
  }

  const availableConfigs = availabilities.filter((a) => a.type === 'available' && a.is_active)
  const blockedConfigs = availabilities.filter((a) => a.type === 'blocked' && a.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Disponibilidade</h2>
          <p className="text-gray-600">Configure horários disponíveis e bloqueios de agendamento</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Globais
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configurações Globais de Agendamento</DialogTitle>
                <DialogDescription>
                  Defina as configurações padrão do sistema de agendamento
                </DialogDescription>
              </DialogHeader>
              {settings && (
                <SettingsForm settings={settings} onSave={handleUpdateSettings} />
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Configuração
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Configuração' : 'Nova Configuração'}
                </DialogTitle>
                <DialogDescription>
                  Configure horários disponíveis ou bloqueios para agendamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'available' | 'blocked') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <Select
                    value={formData.dateType}
                    onValueChange={(value: 'specific' | 'recurring') =>
                      setFormData({ ...formData, dateType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific">Data Específica</SelectItem>
                      <SelectItem value="recurring">Dia da Semana (Recorrente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.dateType === 'specific' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Data</label>
                    <Input
                      type="date"
                      value={formData.specific_date}
                      onChange={(e) =>
                        setFormData({ ...formData, specific_date: e.target.value })
                      }
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">Dia da Semana</label>
                    <Select
                      value={formData.day_of_week}
                      onValueChange={(value) =>
                        setFormData({ ...formData, day_of_week: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora Início</label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora Fim</label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {formData.type === 'available' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Máximo de Atendimentos por Horário
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.max_appointments}
                      onChange={(e) =>
                        setFormData({ ...formData, max_appointments: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observações {formData.type === 'blocked' && '(Motivo do bloqueio)'}
                  </label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder={
                      formData.type === 'blocked'
                        ? 'Ex: Feriado, Reunião, etc.'
                        : 'Observações opcionais'
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Available Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Horários Disponíveis ({availableConfigs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableConfigs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum horário disponível configurado
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableConfigs.map((config) => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Horários Bloqueados ({blockedConfigs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedConfigs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum horário bloqueado configurado
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {blockedConfigs.map((config) => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Config Card Component
function ConfigCard({
  config,
  onEdit,
  onDelete,
}: {
  config: AvailabilityConfig
  onEdit: (config: AvailabilityConfig) => void
  onDelete: (id: string) => void
}) {
  const isAvailable = config.type === 'available'
  const dateLabel = config.specific_date
    ? new Date(config.specific_date + 'T00:00:00').toLocaleDateString('pt-BR')
    : WEEKDAYS.find((d) => d.value === config.day_of_week)?.label

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isAvailable
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <Calendar className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <Badge variant={isAvailable ? 'default' : 'destructive'}>
            {config.specific_date ? 'Data Específica' : 'Recorrente'}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(config)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(config.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-semibold">{dateLabel}</p>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>
            {config.start_time} - {config.end_time}
          </span>
        </div>
        {isAvailable && config.max_appointments && (
          <p className="text-sm text-gray-600">
            Máx: {config.max_appointments} atendimento(s) por horário
          </p>
        )}
        {config.reason && (
          <p className="text-sm text-gray-600 italic mt-2">{config.reason}</p>
        )}
      </div>
    </div>
  )
}

// Settings Form Component
function SettingsForm({
  settings,
  onSave,
}: {
  settings: SchedulingSettings
  onSave: (settings: Partial<SchedulingSettings>) => void
}) {
  const [formData, setFormData] = useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Antecedência Mínima (horas)
          </label>
          <Input
            type="number"
            min="1"
            value={formData.min_advance_hours}
            onChange={(e) =>
              setFormData({
                ...formData,
                min_advance_hours: parseInt(e.target.value),
              })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Tempo mínimo para agendar antes do horário
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Antecedência Máxima (dias)
          </label>
          <Input
            type="number"
            min="1"
            value={formData.max_advance_days}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_advance_days: parseInt(e.target.value),
              })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo de dias futuros para agendamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Hora Padrão Início</label>
          <Input
            type="time"
            value={formData.default_start_time}
            onChange={(e) =>
              setFormData({ ...formData, default_start_time: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Hora Padrão Fim</label>
          <Input
            type="time"
            value={formData.default_end_time}
            onChange={(e) =>
              setFormData({ ...formData, default_end_time: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Duração do Slot (min)
          </label>
          <Select
            value={formData.slot_duration_minutes.toString()}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                slot_duration_minutes: parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">60 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.send_confirmation_email}
            onChange={(e) =>
              setFormData({
                ...formData,
                send_confirmation_email: e.target.checked,
              })
            }
          />
          <span className="text-sm">Enviar email de confirmação</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.send_reminder_email}
            onChange={(e) =>
              setFormData({
                ...formData,
                send_reminder_email: e.target.checked,
              })
            }
          />
          <span className="text-sm">Enviar email de lembrete</span>
        </label>
        {formData.send_reminder_email && (
          <div className="ml-6">
            <Input
              type="number"
              min="1"
              value={formData.reminder_hours_before}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reminder_hours_before: parseInt(e.target.value),
                })
              }
              className="w-32"
            />
            <p className="text-xs text-gray-500 mt-1">Horas antes do agendamento</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
