'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, Send, X, CheckCircle2 } from 'lucide-react'

interface FiscalAppointment {
  id: string
  protocol: string
  service_title: string
  client_name: string
  client_email: string
}

interface FeedbackModalProps {
  appointment: FiscalAppointment
  onClose: () => void
}

export default function FeedbackModal({ appointment, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [serviceQuality, setServiceQuality] = useState(0)
  const [hoverServiceQuality, setHoverServiceQuality] = useState(0)
  const [studentAttention, setStudentAttention] = useState(0)
  const [hoverStudentAttention, setHoverStudentAttention] = useState(0)
  const [problemResolution, setProblemResolution] = useState(0)
  const [hoverProblemResolution, setHoverProblemResolution] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, dê uma avaliação geral')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/fiscal-appointments/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          client_name: appointment.client_name,
          client_email: appointment.client_email,
          rating,
          feedback_text: feedbackText || null,
          service_quality: serviceQuality || null,
          student_attention: studentAttention || null,
          problem_resolution: problemResolution || null,
          would_recommend: wouldRecommend !== null ? wouldRecommend : true,
          additional_comments: additionalComments || null
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao enviar feedback')
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      setError('Erro ao enviar feedback. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onValueChange,
    hover,
    onHoverChange,
    label
  }: {
    value: number
    onValueChange: (value: number) => void
    hover?: number
    onHoverChange?: (value: number) => void
    label: string
  }) => {
    // Se hover > 0, mostra hover. Caso contrário, mostra value
    const displayValue = hover && hover > 0 ? hover : value

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onValueChange(star)}
              onMouseEnter={() => onHoverChange && onHoverChange(star)}
              onMouseLeave={() => onHoverChange && onHoverChange(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= displayValue
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Feedback Enviado!</h3>
            <p className="text-gray-600">
              Obrigado pela sua avaliação! Seu feedback é muito importante para nós.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Avalie o Atendimento</CardTitle>
              <CardDescription>
                Protocolo: {appointment.protocol}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-semibold mb-2">Serviço</h4>
            <p className="text-sm text-gray-600">{appointment.service_title}</p>
          </div>

          {/* Avaliação Geral */}
          <div className="space-y-4">
            <h4 className="font-semibold">Avaliação Geral *</h4>
            <StarRating
              value={rating}
              onValueChange={setRating}
              hover={hoverRating}
              onHoverChange={setHoverRating}
              label="Como você avalia o atendimento de forma geral?"
            />
          </div>

          {/* Avaliações Específicas (Opcionais) */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold">Avaliações Detalhadas (Opcional)</h4>

            <StarRating
              value={serviceQuality}
              onValueChange={setServiceQuality}
              hover={hoverServiceQuality}
              onHoverChange={setHoverServiceQuality}
              label="Qualidade do Serviço"
            />

            <StarRating
              value={studentAttention}
              onValueChange={setStudentAttention}
              hover={hoverStudentAttention}
              onHoverChange={setHoverStudentAttention}
              label="Atenção do Estudante"
            />

            <StarRating
              value={problemResolution}
              onValueChange={setProblemResolution}
              hover={hoverProblemResolution}
              onHoverChange={setHoverProblemResolution}
              label="Resolução do Problema"
            />
          </div>

          {/* Comentário */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seu Feedback (Opcional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Conte-nos sobre sua experiência..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedbackText.length}/1000 caracteres
            </p>
          </div>

          {/* Recomendaria */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Você recomendaria nosso serviço?
            </label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={wouldRecommend === true ? 'default' : 'outline'}
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
              >
                Sim
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? 'default' : 'outline'}
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
              >
                Não
              </Button>
            </div>
          </div>

          {/* Comentários Adicionais */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Comentários Adicionais (Opcional)
            </label>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Algo mais que gostaria de compartilhar..."
              className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {additionalComments.length}/500 caracteres
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Pular
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
