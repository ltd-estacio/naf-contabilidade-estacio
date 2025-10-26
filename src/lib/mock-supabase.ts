// Mock do Supabase para desenvolvimento local

// Interfaces para tipagem
interface MockFilter {
  type: 'eq' | 'is' | 'in'
  column: string
  value?: unknown
  values?: unknown[]
}

interface MockData {
  chat_conversations: Map<string, unknown>
  chat_messages: Map<string, unknown[]>
  students: Map<string, unknown>
  student_performance: Map<string, unknown>
  student_activity_logs: Map<string, unknown>
}

class MockSupabaseClient {
  private data: MockData = {
    chat_conversations: new Map(),
    chat_messages: new Map(),
    students: new Map(),
    student_performance: new Map(),
    student_activity_logs: new Map()
  }

  constructor() {
    // Inicializar com alguns dados de teste
    this.data.chat_conversations.set('test-conversation-1', {
      id: 'test-conversation-1',
      user_id: 'user-123',
      user_name: 'Maria Silva',
      user_email: 'maria@email.com',
      status: 'active',
      human_requested: true,
      human_request_timestamp: new Date().toISOString(),
      chat_accepted_by: null,
      chat_accepted_at: null,
      coordinator_id: null,
      created_at: new Date().toISOString()
    })

    this.data.chat_messages.set('test-conversation-1', [
      {
        id: '1',
        conversation_id: 'test-conversation-1',
        content: 'Olá, preciso de ajuda com declaração de IR',
        sender_type: 'user',
        sender_id: 'user-123',
        sender_name: 'Maria Silva',
        is_ai_response: false,
        is_read: true,
        created_at: new Date().toISOString()
      }
    ])
  }

  from(table: string) {
    return new MockTable(table, this.data)
  }
}

class MockTable {
  constructor(private tableName: string, private data: MockData) {}

  select(columns?: string) {
    const query = new MockQuery(this.tableName, this.data, 'select', columns)
    return query
  }

  insert(data: unknown) {
    return new MockQuery(this.tableName, this.data, 'insert', undefined, data)
  }

  update(data: unknown) {
    return new MockQuery(this.tableName, this.data, 'update', undefined, data)
  }

  delete() {
    return new MockQuery(this.tableName, this.data, 'delete')
  }
}

class MockQuery {
  private filters: MockFilter[] = []
  private updateData: Record<string, unknown> | null = null
  private insertData: Record<string, unknown> | null = null
  private isSingle: boolean = false
  private orderBy: { column: string, ascending: boolean } | null = null
  private limitValue: number | null = null

  constructor(
    private tableName: string,
    private data: MockData,
    private operation: string,
    private columns?: string,
    private operationData?: unknown
  ) {
    if (operation === 'insert') {
      this.insertData = operationData as Record<string, unknown> | null
    } else if (operation === 'update') {
      this.updateData = operationData as Record<string, unknown> | null
    }
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  is(column: string, value: unknown) {
    this.filters.push({ type: 'is', column, value })
    return this
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: 'in', column, values })
    return this
  }

  select(columns?: string) {
    this.columns = columns
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = {
      column,
      ascending: options?.ascending !== false
    }
    return this
  }

  limit(count: number) {
    this.limitValue = count
    return this
  }

  range(from: number, to: number) {
    // Para o mock, vamos simular que sempre retorna dados vazios
    // mas com a estrutura correta para funcionar com o sistema de backup
    this.limitValue = to - from + 1
    return this
  }

  then(onfulfilled?: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
    return this.execute().then(onfulfilled, onrejected)
  }

  private async execute() {
    try {
      if (this.tableName === 'chat_conversations') {
        return await this.handleChatConversations()
      } else if (this.tableName === 'chat_messages') {
        return await this.handleChatMessages()
      } else if (this.tableName === 'students') {
        return await this.handleStudents()
      } else if (this.tableName === 'student_performance') {
        return await this.handleStudentPerformance()
      } else if (this.tableName === 'student_activity_logs') {
        return await this.handleStudentActivityLogs()
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  private async handleChatConversations() {
    if (this.operation === 'insert' && this.insertData) {
      // Criar nova conversa
      const conversationId = `conversation-${Date.now()}`
      const conversation = {
        ...(this.insertData as Record<string, unknown>),
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      }

      this.data.chat_conversations.set(conversationId, conversation)
      this.data.chat_messages.set(conversationId, [])
      return { data: conversation, error: null }
    }

    if (this.operation === 'update') {
      // Simular update de conversa
      const idFilter = this.filters.find(f => f.column === 'id')
      if (idFilter && idFilter.value) {
        const conversation = this.data.chat_conversations.get(idFilter.value as string) as Record<string, unknown>
        if (conversation && this.updateData) {
          const updated = {
            ...(conversation as Record<string, unknown>),
            ...(this.updateData as Record<string, unknown>),
            updated_at: new Date().toISOString()
          }
          this.data.chat_conversations.set(idFilter.value as string, updated)
          return { data: updated, error: null }
        }
      }
      return { data: null, error: null }
    }

    if (this.operation === 'select') {
      // Buscar conversas
      const userIdFilter = this.filters.find(f => f.column === 'user_id')
      const coordinatorIdFilter = this.filters.find(f => f.column === 'coordinator_id')
      const statusFilter = this.filters.find(f => f.column === 'status')
      const humanRequestedFilter = this.filters.find(f => f.column === 'human_requested')

      let conversations = Array.from(this.data.chat_conversations.values()) as Array<Record<string, unknown>>

      // Aplicar filtros
      if (userIdFilter) {
        conversations = conversations.filter((c: Record<string, unknown>) => c.user_id === userIdFilter.value)

        // Para buscar conversa por user_id (retornar sempre a mais recente)
        if (conversations.length > 0) {
          // Ordenar por data de criação (mais recente primeiro)
          conversations.sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
            new Date((b.created_at as string) || '').getTime() - new Date((a.created_at as string) || '').getTime()
          )

          if (this.isSingle) {
            // Se tem select específico com mensagens, incluir mensagens
            if (this.columns && this.columns.includes('messages')) {
              (conversations[0] as Record<string, unknown>).messages = this.data.chat_messages.get(conversations[0].id as string) || []
            }
            return { data: conversations[0], error: null }
          }
        } else if (this.isSingle) {
          // Se não encontrou e é single, retornar null
          return { data: null, error: null }
        }
      }
      if (coordinatorIdFilter) {
        conversations = conversations.filter((c: Record<string, unknown>) => c.coordinator_id === coordinatorIdFilter.value)
      }
      if (statusFilter) {
        conversations = conversations.filter((c: Record<string, unknown>) => c.status === statusFilter.value)
      }
      if (humanRequestedFilter) {
        conversations = conversations.filter((c: Record<string, unknown>) => c.human_requested === humanRequestedFilter.value)
      }

      // Filtros especiais para buscar solicitações pendentes de chat humano
      const chatAcceptedByFilter = this.filters.find(f => f.column === 'chat_accepted_by')
      if (chatAcceptedByFilter && chatAcceptedByFilter.type === 'is' && chatAcceptedByFilter.value === null) {
        conversations = conversations.filter((c: Record<string, unknown>) => !c.chat_accepted_by)
      }

      // Se tem select específico com mensagens, incluir mensagens
      if (this.columns && this.columns.includes('messages')) {
        conversations = conversations.map((conv: Record<string, unknown>) => ({
          ...(conv as Record<string, unknown>),
          messages: this.data.chat_messages.get(conv.id as string) || []
        }))
      }

      // Aplicar ordenação
      if (this.orderBy) {
        conversations.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
          const aVal = a[this.orderBy!.column] as string | number
          const bVal = b[this.orderBy!.column] as string | number

          if (aVal < bVal) return this.orderBy!.ascending ? -1 : 1
          if (aVal > bVal) return this.orderBy!.ascending ? 1 : -1
          return 0
        })
      }

      // Aplicar limite
      if (this.limitValue) {
        conversations = conversations.slice(0, this.limitValue)
      }

      return { data: this.isSingle ? conversations[0] || null : conversations, error: null }
    }

    return { data: null, error: null }
  }

  private async handleChatMessages() {
    if (this.operation === 'insert' && this.insertData) {
      // Simular insert de mensagem
      const conversationId = (this.insertData as Record<string, unknown>).conversation_id as string
      if (!this.data.chat_messages.has(conversationId)) {
        this.data.chat_messages.set(conversationId, [])
      }

      const message = {
        ...(this.insertData as Record<string, unknown>),
        id: `message-${Date.now()}`,
        created_at: new Date().toISOString(),
        is_read: (this.insertData as Record<string, unknown>).is_read !== undefined ? (this.insertData as Record<string, unknown>).is_read : false
      }

      this.data.chat_messages.get(conversationId)?.push(message)

      // Atualizar timestamp da conversa
      const conversation = this.data.chat_conversations.get(conversationId) as Record<string, unknown>
      if (conversation) {
        conversation.updated_at = new Date().toISOString()
      }

      return { data: message, error: null }
    }

    if (this.operation === 'select') {
      // Buscar mensagens
      const conversationIdFilter = this.filters.find(f => f.column === 'conversation_id')

      if (conversationIdFilter && conversationIdFilter.value) {
        const messages = this.data.chat_messages.get(conversationIdFilter.value as string) || []
        return { data: messages, error: null }
      }

      // Buscar todas as mensagens se não tem filtro específico
      const allMessages: unknown[] = []
      const messagesCollections = Array.from(this.data.chat_messages.values())
      for (const messages of messagesCollections) {
        allMessages.push(...messages)
      }
      return { data: allMessages, error: null }
    }

    if (this.operation === 'update') {
      // Atualizar mensagem (ex: marcar como lida)
      const idFilter = this.filters.find(f => f.column === 'id')
      const inFilter = this.filters.find(f => f.type === 'in' && f.column === 'id')
      const conversationIdFilter = this.filters.find(f => f.column === 'conversation_id')
      const senderTypeFilter = this.filters.find(f => f.column === 'sender_type')
      const isReadFilter = this.filters.find(f => f.column === 'is_read')

      let updatedCount = 0

      if (idFilter && idFilter.value) {
        // Atualizar mensagem específica por ID
        const messagesCollections = Array.from(this.data.chat_messages.values())
        for (const messages of messagesCollections) {
          const messageIndex = messages.findIndex((m) => (m as Record<string, unknown>).id === idFilter.value)
          if (messageIndex !== -1 && this.updateData) {
            messages[messageIndex] = { ...(messages[messageIndex] as Record<string, unknown>), ...(this.updateData as Record<string, unknown>) }
            updatedCount++
            return { data: messages[messageIndex], error: null }
          }
        }
      }

      if (inFilter && inFilter.values) {
        // Atualizar múltiplas mensagens por IDs
        const messagesCollections = Array.from(this.data.chat_messages.values())
        for (const messages of messagesCollections) {
          for (let i = 0; i < messages.length; i++) {
            if (inFilter.values.includes((messages[i] as Record<string, unknown>).id) && this.updateData) {
              messages[i] = { ...(messages[i] as Record<string, unknown>), ...(this.updateData as Record<string, unknown>) }
              updatedCount++
            }
          }
        }
        return { data: null, error: null, count: updatedCount }
      }

      if (conversationIdFilter && conversationIdFilter.value) {
        // Atualizar mensagens de uma conversa específica
        const messages = this.data.chat_messages.get(conversationIdFilter.value as string)
        if (messages && this.updateData) {
          for (let i = 0; i < messages.length; i++) {
            let shouldUpdate = true
            const message = messages[i] as Record<string, unknown>

            // Verificar filtros adicionais
            if (senderTypeFilter && senderTypeFilter.value && message.sender_type !== senderTypeFilter.value) {
              shouldUpdate = false
            }
            if (isReadFilter && isReadFilter.value !== undefined && message.is_read !== isReadFilter.value) {
              shouldUpdate = false
            }

            if (shouldUpdate) {
              messages[i] = { ...(message as Record<string, unknown>), ...(this.updateData as Record<string, unknown>) }
              updatedCount++
            }
          }
        }
        return { data: null, error: null, count: updatedCount }
      }

      return { data: null, error: null }
    }

    return { data: null, error: null }
  }

  private async handleStudents() {
    if (this.operation === 'insert' && this.insertData) {
      // Simular insert de estudante
      const studentId = `student-${Date.now()}`
      const student = {
        ...(this.insertData as Record<string, unknown>),
        id: studentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Record<string, unknown>

      // Verificar se email já existe
      const studentsArray = Array.from(this.data.students.values()) as Array<Record<string, unknown>>
      if (studentsArray.find((s: Record<string, unknown>) => s.email === student.email)) {
        return { data: null, error: { message: 'Email já cadastrado' } }
      }

      // Verificar se CPF já existe (se fornecido)
      if (student.document) {
        const cleanDocument = (student.document as string).replace(/\D/g, '')
        if (studentsArray.find((s: Record<string, unknown>) => s.document === cleanDocument)) {
          return { data: null, error: { message: 'CPF já cadastrado' } }
        }
      }

      // Verificar se matrícula já existe (se fornecida)
      if (student.registration_number) {
        if (studentsArray.find((s: Record<string, unknown>) => s.registration_number === student.registration_number)) {
          return { data: null, error: { message: 'Número de matrícula já cadastrado' } }
        }
      }

      this.data.students.set(studentId, student)
      return { data: student, error: null }
    }

    if (this.operation === 'select') {
      // Buscar estudante existente
      const emailFilter = this.filters.find(f => f.column === 'email')
      const documentFilter = this.filters.find(f => f.column === 'document')
      const registrationFilter = this.filters.find(f => f.column === 'registration_number')

      if (emailFilter && emailFilter.value) {
        const studentsArray = Array.from(this.data.students.values()) as Array<Record<string, unknown>>
        const student = studentsArray.find((s: Record<string, unknown>) => s.email === emailFilter.value)
        if (student) {
          return { data: student, error: null }
        }
      }

      if (documentFilter && documentFilter.value) {
        const studentsArray = Array.from(this.data.students.values()) as Array<Record<string, unknown>>
        const student = studentsArray.find((s: Record<string, unknown>) => s.document === documentFilter.value)
        if (student) {
          return { data: student, error: null }
        }
      }

      if (registrationFilter && registrationFilter.value) {
        const studentsArray = Array.from(this.data.students.values()) as Array<Record<string, unknown>>
        const student = studentsArray.find((s: Record<string, unknown>) => s.registration_number === registrationFilter.value)
        if (student) {
          return { data: student, error: null }
        }
      }

      return { data: null, error: null }
    }

    return { data: null, error: null }
  }

  private async handleStudentPerformance() {
    if (this.operation === 'insert') {
      // Simular insert de performance do estudante
      const performanceId = `performance-${Date.now()}`
      const performance = {
        ...this.insertData,
        id: performanceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.data.student_performance.set(performanceId, performance)
      return { data: performance, error: null }
    }

    return { data: null, error: null }
  }

  private async handleStudentActivityLogs() {
    if (this.operation === 'insert') {
      // Simular insert de log de atividade
      const logId = `log-${Date.now()}`
      const log = {
        ...this.insertData,
        id: logId,
        created_at: new Date().toISOString()
      }

      this.data.student_activity_logs.set(logId, log)
      return { data: log, error: null }
    }

    return { data: null, error: null }
  }
}

export const mockSupabaseAdmin = new MockSupabaseClient()