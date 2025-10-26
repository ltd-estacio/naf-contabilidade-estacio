'use client'

import { useState } from 'react'
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'

interface PasswordChangeProps {
  userEmail: string
  userType: 'student' | 'coordinator'
}

export default function PasswordChangeForm({ userEmail, userType }: PasswordChangeProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Email form
  const [newEmail, setNewEmail] = useState('')

  const validatePasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const strength = Object.values(requirements).filter(Boolean).length
    return { requirements, strength }
  }

  const passwordStrength = validatePasswordStrength(passwordData.newPassword)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validações
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Todos os campos são obrigatórios' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres' })
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'A nova senha deve ser diferente da senha atual' })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          userType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha')
      }

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!newEmail) {
      setMessage({ type: 'error', text: 'Digite o novo e-mail' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setMessage({ type: 'error', text: 'E-mail inválido' })
      return
    }

    if (newEmail === userEmail) {
      setMessage({ type: 'error', text: 'O novo e-mail deve ser diferente do atual' })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: userEmail,
          newEmail,
          userType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar e-mail')
      }

      setMessage({ 
        type: 'success', 
        text: 'Um e-mail de confirmação foi enviado para o novo endereço. Verifique sua caixa de entrada.' 
      })
      setNewEmail('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar e-mail' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Segurança da Conta</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie suas credenciais de acesso
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LockIcon className="inline w-5 h-5 mr-2" />
            Alterar Senha
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <MailIcon className="inline w-5 h-5 mr-2" />
            Alterar E-mail
          </button>
        </div>

        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Formulário de Senha */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual *
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha atual"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.strength
                            ? passwordStrength.strength <= 2
                              ? 'bg-red-500'
                              : passwordStrength.strength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className={passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Uma letra maiúscula
                    </div>
                    <div className={passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Uma letra minúscula
                    </div>
                    <div className={passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Um número
                    </div>
                    <div className={passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Um caractere especial
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="mt-2 text-xs text-red-600">As senhas não coincidem</p>
              )}
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        )}

        {/* Formulário de E-mail */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailChange} className="p-6 space-y-6">
            {/* E-mail Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail Atual
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Novo E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo E-mail *
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu novo e-mail"
                  required
                />
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Você receberá um e-mail de confirmação no novo endereço</li>
                    <li>Clique no link de confirmação para concluir a alteração</li>
                    <li>Após a confirmação, use o novo e-mail para fazer login</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Enviando...' : 'Alterar E-mail'}
            </button>
          </form>
        )}
      </div>

      {/* Dicas de Segurança */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Dicas de Segurança</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Use senhas únicas para cada conta</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Nunca compartilhe sua senha com outras pessoas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Altere sua senha regularmente (a cada 3-6 meses)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Use um gerenciador de senhas para maior segurança</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
