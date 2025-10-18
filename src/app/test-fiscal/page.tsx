'use client'

import React from 'react'
import FiscalAppointmentsSection from '@/components/FiscalAppointmentsSection'

export default function TestFiscalPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Teste - Solicitações de Agendamento Fiscal
        </h1>
        <FiscalAppointmentsSection />
      </div>
    </div>
  )
}