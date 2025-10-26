'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, ListChecks, ScrollText, Loader2 } from 'lucide-react'

interface AttendanceRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RegistrationData) => Promise<void>
  appointmentId: string
  clientName: string
  serviceTitle: string
}

export interface RegistrationData {
  stepByStep: string
  stages: string
  summary: string
}

export default function AttendanceRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  appointmentId,
  clientName,
  serviceTitle
}: AttendanceRegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    stepByStep: '',
    stages: '',
    summary: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validação
    if (!formData.stepByStep.trim() || !formData.stages.trim() || !formData.summary.trim()) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
      // Limpar formulário após sucesso
      setFormData({
        stepByStep: '',
        stages: '',
        summary: ''
      })
      onClose()
    } catch (err) {
      setError('Erro ao salvar registro. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!submitting) {
      setFormData({
        stepByStep: '',
        stages: '',
        summary: ''
      })
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Registro do Atendimento
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <p className="font-medium text-gray-700">Cliente: {clientName}</p>
            <p className="text-sm text-gray-500">Serviço: {serviceTitle}</p>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Passo a Passo */}
          <div className="space-y-2">
            <Label htmlFor="stepByStep" className="text-base font-semibold flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-blue-600" />
              Passo a Passo do Atendimento
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Descreva detalhadamente cada passo que será realizado neste atendimento
            </p>
            <Textarea
              id="stepByStep"
              value={formData.stepByStep}
              onChange={(e) => setFormData({ ...formData, stepByStep: e.target.value })}
              placeholder="Exemplo:&#10;1. Análise dos documentos do cliente&#10;2. Verificação de pendências no sistema da Receita Federal&#10;3. Preenchimento do formulário específico&#10;4. Revisão dos dados informados&#10;5. Envio e protocolo da solicitação"
              className="min-h-[150px] font-mono text-sm"
              disabled={submitting}
              required
            />
          </div>

          {/* Etapas */}
          <div className="space-y-2">
            <Label htmlFor="stages" className="text-base font-semibold flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-green-600" />
              Etapas do Processo
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Liste as principais etapas e marcos importantes do atendimento
            </p>
            <Textarea
              id="stages"
              value={formData.stages}
              onChange={(e) => setFormData({ ...formData, stages: e.target.value })}
              placeholder="Exemplo:&#10;• Etapa 1: Recepção e triagem da documentação&#10;• Etapa 2: Análise técnica e identificação de requisitos&#10;• Etapa 3: Execução do serviço fiscal&#10;• Etapa 4: Validação e conferência final&#10;• Etapa 5: Entrega e orientações ao cliente"
              className="min-h-[150px] font-mono text-sm"
              disabled={submitting}
              required
            />
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Resumo do Atendimento
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Faça um resumo objetivo do que será realizado e dos objetivos do atendimento
            </p>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Exemplo:&#10;Atendimento fiscal para regularização de CPF do cliente, incluindo análise de pendências, correção de dados cadastrais e emissão de comprovante de situação cadastral. O objetivo é deixar o CPF do cliente regularizado junto à Receita Federal, permitindo que ele possa realizar transações bancárias e emitir documentos."
              className="min-h-[120px] text-sm"
              disabled={submitting}
              required
            />
          </div>

          {/* Informativo */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Importante:</strong> Este registro será salvo e ficará disponível durante todo o atendimento. 
              Você poderá consultá-lo e editá-lo a qualquer momento.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Salvar e Iniciar Atendimento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
