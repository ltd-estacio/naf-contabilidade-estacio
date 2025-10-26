'use client'

import React from 'react'
import NAFChatWidget from './NAFChatWidget'

interface Message {
  id: string
  content: string
  sender_type: 'user' | 'assistant' | 'coordinator' | 'system'
  sender_name: string
  timestamp: string
  isRegistrationStep?: boolean
  registrationData?: unknown
}

interface RegistrationStep {
  step: number
  field: string
  question: string
  placeholder: string
  type: 'text' | 'email' | 'phone' | 'select' | 'date'
  options?: string[]
  validation?: (value: string) => boolean
  errorMessage?: string
}

interface UserData {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  birth_date?: string
  address?: string
  city?: string
  state?: string
  occupation?: string
  company?: string
  income_range?: string
  preferred_contact?: string
  service_interest?: string[]
}

const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    step: 1,
    field: 'name',
    question: 'Qual é o seu nome completo?',
    placeholder: 'Ex: João Silva Santos',
    type: 'text',
    validation: (value) => value.trim().length >= 3,
    errorMessage: 'Nome deve ter pelo menos 3 caracteres'
  },
  {
    step: 2,
    field: 'email',
    question: 'Qual é o seu e-mail?',
    placeholder: 'Ex: joao@exemplo.com',
    type: 'email',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: 'Digite um e-mail válido'
  },
  {
    step: 3,
    field: 'phone',
    question: 'Qual é o seu telefone/WhatsApp?',
    placeholder: 'Ex: (48) 99999-9999',
    type: 'phone',
    validation: (value) => value.replace(/\D/g, '').length >= 10,
    errorMessage: 'Digite um telefone válido'
  },
  {
    step: 4,
    field: 'cpf',
    question: 'Qual é o seu CPF?',
    placeholder: 'Ex: 123.456.789-00',
    type: 'text',
    validation: (value) => value.replace(/\D/g, '').length === 11,
    errorMessage: 'Digite um CPF válido'
  },
  {
    step: 5,
    field: 'city',
    question: 'Em qual cidade você mora?',
    placeholder: 'Ex: Florianópolis',
    type: 'text',
    validation: (value) => value.trim().length >= 2,
    errorMessage: 'Digite uma cidade válida'
  },
  {
    step: 6,
    field: 'occupation',
    question: 'Qual é a sua profissão/ocupação?',
    placeholder: 'Ex: Contador, Empresário, Estudante',
    type: 'text',
    validation: (value) => value.trim().length >= 2,
    errorMessage: 'Digite uma profissão válida'
  },
  {
    step: 7,
    field: 'income_range',
    question: 'Qual é a sua faixa de renda mensal?',
    placeholder: 'Selecione uma opção',
    type: 'select',
    options: [
      'Até R$ 1.412 (1 salário mínimo)',
      'R$ 1.413 a R$ 2.824 (1-2 salários)',
      'R$ 2.825 a R$ 4.236 (2-3 salários)',
      'R$ 4.237 a R$ 7.060 (3-5 salários)',
      'R$ 7.061 a R$ 14.120 (5-10 salários)',
      'Acima de R$ 14.120 (10+ salários)',
      'Prefiro não informar'
    ]
  },
  {
    step: 8,
    field: 'service_interest',
    question: 'Qual serviço você tem mais interesse?',
    placeholder: 'Selecione uma opção',
    type: 'select',
    options: [
      'Declaração de Imposto de Renda',
      'Abertura de MEI',
      'Consultoria Contábil',
      'Planejamento Tributário',
      'Regularização de CPF',
      'Orientação Empresarial',
      'Outros serviços'
    ]
  }
]

interface ChatWithRegistrationProps {
  conversationId: string
  onUserRegistered?: (userData: UserData) => void
  onAppointmentScheduled?: (appointment: unknown) => void
}

export function ChatWithRegistration({
  conversationId,
  onUserRegistered,
  onAppointmentScheduled
}: ChatWithRegistrationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<UserData>({})
  const [isRegistered, setIsRegistered] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mensagem inicial de boas-vindas
    addSystemMessage(
      '👋 Olá! Seja bem-vindo(a) ao NAF Contábil!\n\n' +
      'Sou seu assistente virtual e estou aqui para ajudá-lo com:\n' +
      '• Serviços contábeis e fiscais\n' +
      '• Agendamento de consultorias\n' +
      '• Orientações tributárias\n\n' +
      'Para oferecer um atendimento personalizado, gostaria de conhecê-lo melhor. Você gostaria de se cadastrar?'
    )
  }, [])

  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender_type: 'system',
      sender_name: 'Assistente NAF',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender_type: 'user',
      sender_name: 'Você',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, message])
  }

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender_type: 'assistant',
      sender_name: 'Assistente NAF',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, message])
  }

  const startRegistration = () => {
    setIsRegistering(true)
    setCurrentStep(0)
    addAssistantMessage(
      '✨ **Vamos começar seu cadastro!**\n\n' +
      'Farei algumas perguntas para conhecê-lo melhor. Todas as informações são seguras e serão usadas apenas para oferecer o melhor atendimento.\n\n' +
      REGISTRATION_STEPS[0].question
    )
  }

  const handleRegistrationStep = async (answer: string) => {
    const step = REGISTRATION_STEPS[currentStep]

    // Validar resposta
    if (step.validation && !step.validation(answer)) {
      setError(step.errorMessage || 'Resposta inválida')
      return
    }

    setError('')

    // Armazenar resposta
    setUserData(prev => ({
      ...prev,
      [step.field]: answer
    }))

    // Adicionar mensagem do usuário
    addUserMessage(answer)

    // Próximo passo ou finalizar
    if (currentStep < REGISTRATION_STEPS.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      setTimeout(() => {
        addAssistantMessage(
          `✅ Perfeito!\n\n${REGISTRATION_STEPS[nextStep].question}`
        )
      }, 1000)
    } else {
      // Finalizar cadastro
      await completeRegistration({ ...userData, [step.field]: answer })
    }
  }

  const completeRegistration = async (finalUserData: UserData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/user-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          ...finalUserData
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(true)
        setIsRegistering(false)
        setUserData(finalUserData)

        addAssistantMessage(
          '🎉 **Cadastro concluído com sucesso!**\n\n' +
          `Olá, ${finalUserData.name}! Agora posso oferecer um atendimento personalizado.\n\n` +
          '**O que gostaria de fazer agora?**\n' +
          '• 💬 Conversar com um especialista\n' +
          '• 📅 Agendar uma consultoria\n' +
          '• ❓ Fazer uma pergunta rápida\n\n' +
          'Digite sua escolha ou me diga como posso ajudar!'
        )

        onUserRegistered?.(finalUserData)
      } else {
        setError(data.error || 'Erro ao cadastrar usuário')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    if (isRegistering) {
      handleRegistrationStep(inputValue)
      setInputValue('')
      return
    }

    addUserMessage(inputValue)
    setInputValue('')

    // Processar mensagem
    if (!isRegistered) {
      // Verificar se quer se cadastrar
      if (inputValue.toLowerCase().includes('sim') ||
          inputValue.toLowerCase().includes('cadastr') ||
          inputValue.toLowerCase().includes('quero')) {
        startRegistration()
      } else {
        addAssistantMessage(
          'Entendo! Você pode usar nossos serviços sem cadastro, mas com o cadastro oferecemos:\n\n' +
          '✅ Atendimento personalizado\n' +
          '✅ Histórico de conversas\n' +
          '✅ Agendamento de consultorias\n' +
          '✅ Acompanhamento de processos\n\n' +
          'Se mudar de ideia, é só me avisar! Como posso ajudá-lo hoje?'
        )
      }
    } else {
      // Usuário cadastrado - processar comandos
      if (inputValue.toLowerCase().includes('agendar') ||
          inputValue.toLowerCase().includes('consultor') ||
          inputValue.toLowerCase().includes('horário')) {
        setShowScheduleDialog(true)
        addAssistantMessage(
          '📅 **Vamos agendar sua consultoria!**\n\n' +
          'Abri o formulário de agendamento para você escolher a melhor data e horário.'
        )
      } else {
        // Resposta geral
        addAssistantMessage(
          'Entendi sua mensagem! Como você já está cadastrado, posso:\n\n' +
          '• 📞 Conectá-lo com um especialista\n' +
          '• 📅 Agendar uma consultoria\n' +
          '• 💡 Dar orientações rápidas\n\n' +
          'O que prefere fazer?'
        )
      }
    }
  }

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime || !serviceType) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/chat/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.email, // Usando email como identificador
          conversation_id: conversationId,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          service_type: serviceType,
          service_description: serviceDescription
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowScheduleDialog(false)
        setSuccess('Agendamento realizado com sucesso!')

        addAssistantMessage(
          '✅ **Agendamento confirmado!**\n\n' +
          `📅 **Data:** ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}\n` +
          `🕐 **Horário:** ${selectedTime}\n` +
          `💼 **Serviço:** ${serviceType}\n\n` +
          'Você receberá uma confirmação e lembrete. Até breve!'
        )

        onAppointmentScheduled?.(data.appointment)
      } else {
        setError(data.error || 'Erro ao agendar')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return format(new Date(time), 'HH:mm', { locale: ptBR })
  }

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const serviceTypes = [
    'Declaração de Imposto de Renda',
    'Abertura de MEI',
    'Consultoria Contábil',
    'Planejamento Tributário',
    'Regularização de CPF',
    'Orientação Empresarial',
    'Outros serviços'
  ]

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Status do usuário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Chat NAF Contábil
            {isRegistered && (
              <Badge variant="secondary" className="ml-2">
                <User className="h-3 w-3 mr-1" />
                Cadastrado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Área de mensagens */}
          <ScrollArea className="h-[400px] mb-4 border rounded-lg p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender_type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.sender_type === 'system'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'user' && <User className="h-3 w-3" />}
                      {message.sender_type !== 'user' && <Bot className="h-3 w-3" />}
                      <span className="text-xs font-medium">
                        {message.sender_name}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Botões de ação rápida */}
          {!isRegistering && (
            <div className="flex flex-wrap gap-2 mb-4">
              {!isRegistered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startRegistration}
                  className="flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Fazer Cadastro
                </Button>
              )}
              {isRegistered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                  className="flex items-center gap-1"
                >
                  <ScheduleIcon className="h-3 w-3" />
                  Agendar Consultoria
                </Button>
              )}
            </div>
          )}

          {/* Input de mensagem */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isRegistering
                  ? REGISTRATION_STEPS[currentStep]?.placeholder || 'Digite sua resposta...'
                  : 'Digite sua mensagem...'
              }
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de agendamento */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agendar Consultoria
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seleção de data */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data da Consultoria</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Selecione uma data'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Seleção de horário */}
            <div>
              <label className="text-sm font-medium mb-2 block">Horário</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de serviço */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Serviço</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição adicional */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descrição adicional (opcional)
              </label>
              <Textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Descreva detalhes sobre sua necessidade..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button
                onClick={handleScheduleAppointment}
                disabled={loading || !selectedDate || !selectedTime || !serviceType}
                className="flex-1"
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}