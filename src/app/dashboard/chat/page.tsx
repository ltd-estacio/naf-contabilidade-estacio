'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  Phone, 
  Video, 
  Bot,
  User,
  MessageSquare,
  CheckCircle
} from 'lucide-react'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  sentAt: string
  type: 'text' | 'bot'
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'bot',
      senderName: 'Assistente NAF',
      content: 'Olá! Sou o assistente virtual do NAF. Posso te ajudar com dúvidas sobre:\n\n• CPF e CNPJ\n• MEI (Microempreendedor Individual)\n• Imposto de Renda\n• ICMS e ISS\n• Legislação fiscal\n\nDigite sua dúvida que vou te orientar!',
      sentAt: new Date().toISOString(),
      type: 'bot'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: session?.user?.name || 'Você',
      content: message,
      sentAt: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')
    setIsTyping(true)

    // Simular resposta da IA
    setTimeout(() => {
      const botResponse = getBotResponse(currentMessage)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'bot',
        senderName: 'Assistente NAF',
        content: botResponse,
        sentAt: new Date().toISOString(),
        type: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('cpf')) {
      return `📋 **Informações sobre CPF:**\n\n**Primeira via (gratuita):**\n• Site: cpf.receita.fazenda.gov.br\n• Documentos: RG + certidão nascimento + comprovante residência\n• Atendimento presencial em São José/SC\n\n**Segunda via (R$ 7,00):**\n• Mesmo site, opção "Emitir comprovante"\n• Válido por 180 dias\n\n**Dúvidas específicas?** Digite "cpf presencial" para endereços em São José.`
    }
    
    if (lowerMessage.includes('mei')) {
      return `🏢 **Sobre MEI (Microempreendedor Individual):**\n\n**Abertura (gratuita):**\n• Site: portaldoempreendedor.gov.br\n• Limite: R$ 81.000/ano\n• Máximo 1 funcionário\n\n**DAS Mensal: R$ 67,00**\n• Vencimento: todo dia 20\n• Inclui INSS + ICMS + ISS\n\n**Declaração anual (DASN-SIMEI):**\n• Prazo: até 31/05\n• Obrigatória mesmo sem faturamento\n\nPrecisa de ajuda específica? Digite "mei das" ou "mei declaração".`
    }
    
    if (lowerMessage.includes('imposto de renda') || lowerMessage.includes('ir ')) {
      return `💰 **Imposto de Renda Pessoa Física:**\n\n**Obrigatório para quem:**\n• Renda anual > R$ 28.559,70\n• Possui bens > R$ 300.000\n• Recebeu rendimentos isentos > R$ 40.000\n\n**Prazo:** até 31/05 de cada ano\n**Site:** receita.fazenda.gov.br\n**Programa:** IRPF 2024\n\n**Documentos principais:**\n• Informe de rendimentos\n• Comprovantes médicos\n• Recibos de aluguéis\n\nDúvidas sobre deduções? Digite "ir deduções".`
    }
    
    if (lowerMessage.includes('icms')) {
      return `🏛️ **ICMS (Imposto Estadual - SC):**\n\n**Para empresas que:**\n• Vendem produtos\n• Fazem transporte\n• Comunicação/energia\n\n**Inscrição Estadual:**\n• SEF/SC: (48) 3665-5000\n• Site: sef.sc.gov.br\n• Endereço: Av. Gov. Gustavo Richard, 99 - Florianópolis\n\n**Posto Fiscal São José:**\n• (48) 3381-5500\n• Av. Acioni Souza Filho, 1950 - Kobrasol\n\nDúvidas sobre inscrição? Digite "icms inscricao".`
    }
    
    if (lowerMessage.includes('iss')) {
      return `🏢 **ISS (Imposto Municipal - São José/SC):**\n\n**Para prestadores de serviços:**\n• Consultorias\n• Serviços técnicos\n• Serviços de limpeza, etc.\n\n**Prefeitura de São José:**\n• Telefone: (48) 3381-9100\n• Email: fazenda@pmsj.sc.gov.br\n• Endereço: Av. Lédio João Martins, 1000 - Kobrasol\n\n**Horário:** 8h às 17h (seg-sex)\n**Site:** pmsj.sc.gov.br\n\nPrecisa do alvará? Digite "alvara sao jose".`
    }
    
    if (lowerMessage.includes('alvara') || lowerMessage.includes('licença')) {
      return `📜 **Alvarás em São José/SC:**\n\n**Alvará de Funcionamento:**\n• Prefeitura: (48) 3381-9100\n• Documentos: planta baixa, contrato locação\n\n**Alvará Sanitário:**\n• Vigilância Sanitária: (48) 3381-9200\n• Para: restaurantes, clínicas, farmácias\n\n**Alvará do Corpo de Bombeiros:**\n• CBMSC São José: (48) 3281-8100\n• Para estabelecimentos com área > 100m²\n\n**Consulta prévia de viabilidade recomendada!**\n\nDúvidas sobre documentos? Digite "documentos alvara".`
    }
    
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone')) {
      return `📞 **Contatos Importantes - São José/SC:**\n\n**Federal:**\n• Receita Federal: (48) 3027-5000\n• INSS: 135\n\n**Estadual:**\n• SEF/SC: (48) 3665-5000\n• JUCESC: (48) 3251-3000\n• Corpo de Bombeiros: (48) 3281-8100\n\n**Municipal:**\n• Prefeitura: (48) 3381-9000\n• Fazenda: (48) 3381-9100\n• Vigilância Sanitária: (48) 3381-9200\n\n**NAF UFSC:**\n• Email: naf@contato.ufsc.br\n• Atendimento: seg-sex 8h às 17h\n\nPrecisa de endereço específico? Digite "endereco" + nome do órgão.`
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu')) {
      return `😊 **De nada! Fico feliz em ajudar!**\n\nSe precisar de mais informações, estou aqui 24h por dia.\n\n**Outras opções:**\n• Digite "guias" para ver guias passo-a-passo\n• Digite "agendamento" para marcar atendimento presencial\n• Digite "menu" para ver todas as opções\n\n**Lembre-se:** Para questões complexas, recomendo agendar um atendimento personalizado com nossos professores e alunos especialistas!`
    }
    
    if (lowerMessage.includes('menu') || lowerMessage.includes('opcoes')) {
      return `📋 **Menu de Opções:**\n\n**Tributos Federais:**\n• cpf - Informações sobre CPF\n• mei - Microempreendedor Individual\n• imposto de renda - IRPF\n\n**Tributos Estaduais (SC):**\n• icms - Imposto sobre circulação\n• inscricao estadual - Registro na SEF\n\n**Tributos Municipais (São José):**\n• iss - Imposto sobre serviços\n• alvara - Licenças e autorizações\n\n**Outros:**\n• contatos - Telefones importantes\n• guias - Tutoriais passo-a-passo\n• agendamento - Atendimento presencial\n\n**Digite qualquer palavra-chave acima!**`
    }
    
    // Resposta padrão
    return `🤔 **Não entendi sua dúvida específica.**\n\n**Posso ajudar com:**\n• CPF (primeira/segunda via)\n• MEI (abertura, DAS, declaração)\n• Imposto de Renda\n• ICMS (inscrição estadual)\n• ISS (impostos municipais)\n• Alvarás e licenças\n\n**Dicas:**\n• Digite palavras-chave como "cpf", "mei", "imposto"\n• Digite "menu" para ver todas as opções\n• Digite "contatos" para telefones importantes\n\n**Para questões complexas,** recomendo agendar um atendimento presencial digitando "agendamento".`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chat Inteligente NAF</h1>
        <p className="text-gray-600">
          Assistente virtual especializado em questões fiscais e contábeis
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistente NAF</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Online 24h - Especialista em questões fiscais
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.senderId === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.type === 'bot'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.senderId === 'bot' ? (
                      <Bot className="h-4 w-4 text-green-600" />
                    ) : msg.senderId === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{msg.senderName}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.sentAt).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Assistente NAF está digitando...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida sobre questões fiscais..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!message.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              💡 Dica: Digite &quot;menu&quot; para ver todas as opções disponíveis
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
