'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatWithRegistration from '@/components/chat/ChatWithRegistration'

interface PageProps {
  params: Promise<{
    token: string
  }>
}

interface AppointmentData {
  id: number
  protocol: string
  service_type: string
  service_title: string
  scheduled_datetime: string
  student_id: string
}

export default function AppointmentPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    validateToken()
  }, [resolvedParams.token])

  const validateToken = async () => {
    try {
      setValidating(true)
      const response = await fetch(`/api/appointments/validate-link?token=${resolvedParams.token}`)
      const data = await response.json()

      if (data.valid) {
        setValid(true)
        setAppointment(data.appointment)
      } else {
        setValid(false)
        setError(data.error || 'Link inválido')
      }
    } catch (err) {
      console.error('Erro ao validar link:', err)
      setValid(false)
      setError('Erro ao validar link')
    } finally {
      setValidating(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-teal-500 to-green-500">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-center">Validando link de atendimento...</p>
        </div>
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 p-4">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-green-500">
      <ChatWithRegistration
        appointmentId={appointment?.id}
        protocol={appointment?.protocol}
        serviceTitle={appointment?.service_title}
      />
    </div>
  )
}
