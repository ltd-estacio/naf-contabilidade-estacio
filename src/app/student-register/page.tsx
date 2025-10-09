'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, User, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getSemestersForCourse, getCourseInfo } from '@/config/courseDurations'

interface StudentData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
  document: string
  course: string
  semester: string
  registrationNumber: string
  birthDate: string
  address: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export default function StudentRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calcular ano e semestre atual para cadastro
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentSemester = currentMonth <= 6 ? 1 : 2

  const [formData, setFormData] = useState<StudentData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    document: '',
    course: '',
    semester: '',
    registrationNumber: '',
    birthDate: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  // Semestres disponíveis baseados no curso selecionado
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([])
  const [courseInfo, setCourseInfo] = useState<{duration: number, type: string} | null>(null)

  // Atualizar semestres disponíveis quando o curso mudar
  useEffect(() => {
    if (formData.course) {
      const semesters = getSemestersForCourse(formData.course)
      setAvailableSemesters(semesters)

      const info = getCourseInfo(formData.course)
      setCourseInfo(info)

      // Resetar semestre se não estiver na nova lista
      if (formData.semester && !semesters.includes(formData.semester)) {
        setFormData(prev => ({ ...prev, semester: '' }))
      }
    } else {
      setAvailableSemesters([])
      setCourseInfo(null)
    }
  }, [formData.course])

  const courses = [
    'Ciências Contábeis',
    'Administração',
    'Direito',
    'Economia',
    'Gestão Financeira',
    'Gestão de Recursos Humanos',
    'Marketing',
    'Logística',
    'Gestão Pública',
    'Comércio Exterior',
    'Processos Gerenciais',
    'Análise e Desenvolvimento de Sistemas',
    'Gestão da Tecnologia da Informação',
    'Secretariado Executivo',
    'Turismo',
    'Hotelaria',
    'Gastronomia',
    'Design Gráfico',
    'Publicidade e Propaganda',
    'Jornalismo',
    'Relações Públicas',
    'Psicologia',
    'Serviço Social',
    'Pedagogia',
    'Letras',
    'História',
    'Geografia',
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'Enfermagem',
    'Fisioterapia',
    'Nutrição',
    'Farmácia',
    'Medicina Veterinária',
    'Engenharia Civil',
    'Engenharia Elétrica',
    'Engenharia Mecânica',
    'Engenharia de Produção',
    'Arquitetura e Urbanismo',
    'Outro'
  ]

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  const relationships = [
    'Pai', 'Mãe', 'Irmão(ã)', 'Cônjuge', 'Filho(a)', 'Avô/Avó', 'Tio(a)', 'Primo(a)', 'Amigo(a)', 'Outro'
  ]

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StudentData] as object),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('Preencha todos os campos obrigatórios')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Digite um email válido')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.course || !formData.semester || !formData.registrationNumber) {
      setError('Preencha todos os campos obrigatórios')
      return false
    }
    if (formData.document.replace(/\D/g, '').length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    const { street, number, neighborhood, city, state, zipcode } = formData.address
    if (!street || !number || !neighborhood || !city || !state || !zipcode) {
      setError('Preencha todos os campos de endereço obrigatórios')
      return false
    }
    if (zipcode.replace(/\D/g, '').length !== 8) {
      setError('CEP deve ter 8 dígitos')
      return false
    }
    return true
  }

  const validateStep4 = () => {
    const { name, phone, relationship } = formData.emergencyContact
    if (!name || !phone || !relationship) {
      setError('Preencha todos os campos de contato de emergência')
      return false
    }
    return true
  }

  const nextStep = () => {
    setError('')
    let isValid = false

    switch (step) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      case 4:
        isValid = validateStep4()
        break
      default:
        isValid = true
    }

    if (isValid) {
      if (step === 4) {
        handleSubmit()
      } else {
        setStep(step + 1)
      }
    }
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Adicionar ano e semestre de cadastro
      const registrationData = {
        ...formData,
        registrationYear: currentYear,
        registrationSemester: currentSemester
      }

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/student-login-simple')
        }, 2000)
      } else {
        setError(data.message || 'Erro ao criar conta')
      }
    } catch (error) {
      console.error('Erro durante cadastro de estudante:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center dark:bg-gray-900 dark:border-gray-800">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bem-vindo ao NAF! Você será redirecionado para o login em instantes.
            </p>
            <Button onClick={() => router.push('/student-login-simple')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 dark:text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Dados Pessoais</span>
            <span>Dados Acadêmicos</span>
            <span>Endereço</span>
            <span>Contato Emergência</span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="text-center dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-800">
              Cadastro de Estudante NAF
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
              Passo {step} de 4 - Crie sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 dark:bg-gray-900 dark:border-gray-800">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Dados Pessoais */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Pessoais</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu.email@estudante.edu.br"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirme sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document">CPF</Label>
                    <Input
                      id="document"
                      value={formData.document}
                      onChange={(e) => handleInputChange('document', formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Dados Acadêmicos */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Acadêmicos</h3>

                <div className="space-y-2">
                  <Label htmlFor="course">Curso *</Label>
                  <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semestre Atual *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => handleInputChange('semester', value)}
                    disabled={!formData.course}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.course ? "Selecione seu semestre" : "Selecione um curso primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {courseInfo && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {courseInfo.type} - Duração: {courseInfo.duration} semestres ({courseInfo.duration / 2} anos)
                    </p>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    📅 Cadastro: {currentSemester}º Semestre de {currentYear}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Número de Matrícula *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="Ex: 2024001001"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Endereço */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endereço</h3>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">CEP *</Label>
                  <Input
                    id="zipcode"
                    value={formData.address.zipcode}
                    onChange={(e) => handleInputChange('address.zipcode', formatZipCode(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Logradouro *</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={formData.address.number}
                      onChange={(e) => handleInputChange('address.number', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={formData.address.neighborhood}
                      onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={formData.address.state} onValueChange={(value) => handleInputChange('address.state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Contato de Emergência */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contato de Emergência</h3>

                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Nome Completo *</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    placeholder="Nome do contato de emergência"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Telefone *</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Parentesco *</Label>
                  <Select value={formData.emergencyContact.relationship} onValueChange={(value) => handleInputChange('emergencyContact.relationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((relationship) => (
                        <SelectItem key={relationship} value={relationship}>
                          {relationship}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Anterior
              </Button>

              <Button
                onClick={nextStep}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : step === 4 ? (
                  'Criar Conta'
                ) : (
                  'Próximo'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link href="/student-login-simple" className="text-blue-600 dark:text-blue-400 hover:underline">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
