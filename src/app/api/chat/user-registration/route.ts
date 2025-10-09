import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST - Criar novo usuário via chat
export async function POST(request: NextRequest) {
  try {
    console.log('👤 User Registration - Processando cadastro via chat')

    const {
      conversation_id,
      name,
      email,
      password,
      phone,
      cpf,
      birth_date,
      address,
      city,
      state,
      occupation,
      company,
      income_range,
      preferred_contact,
      service_interest
    } = await request.json()

    // Validações básicas
    if (!conversation_id || !name || !email) {
      return NextResponse.json(
        { error: 'conversation_id, name e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar senha (mínimo 6 caracteres)
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Verificar se email já existe
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('chat_users')
        .select('id, email')
        .eq('email', email)
        .single()

      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Este email já está cadastrado',
            existing_user: true,
            user_id: existingUser.id
          },
          { status: 409 }
        )
      }

      // Hash da senha se foi fornecida
      let passwordHash = null
      if (password) {
        passwordHash = await bcrypt.hash(password, 10)
      }

      // Converter service_interest para array se for string
      let serviceInterestArray = []
      if (service_interest) {
        if (Array.isArray(service_interest)) {
          serviceInterestArray = service_interest
        } else if (typeof service_interest === 'string') {
          serviceInterestArray = [service_interest]
        }
      }

      // Criar novo usuário
      const newUser = {
        id: userId,
        conversation_id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: passwordHash,
        phone: phone?.trim(),
        cpf: cpf?.trim(),
        birth_date,
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        occupation: occupation?.trim(),
        company: company?.trim(),
        income_range,
        preferred_contact: preferred_contact || 'email',
        service_interest: serviceInterestArray,
        registration_source: 'chat',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdUser, error: insertError } = await supabaseAdmin
        .from('chat_users')
        .insert(newUser)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao inserir usuário:', insertError)

        // Mensagens de erro mais específicas
        if (insertError.code === '23505') {
          return NextResponse.json(
            { error: 'Este email já está cadastrado' },
            { status: 409 }
          )
        }

        throw insertError
      }

      // Atualizar conversa com user_id
      await supabaseAdmin
        .from('chat_conversations')
        .update({
          user_id: userId,
          user_registered: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation_id)

      console.log('✅ Usuário criado com sucesso:', userId)

      return NextResponse.json({
        success: true,
        user: createdUser,
        message: 'Usuário cadastrado com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema de fallback:', supabaseError)

      // Hash da senha para fallback
      let passwordHashFallback = null
      if (password) {
        passwordHashFallback = await bcrypt.hash(password, 10)
      }

      // Converter service_interest para array se for string (fallback)
      let serviceInterestArrayFallback = []
      if (service_interest) {
        if (Array.isArray(service_interest)) {
          serviceInterestArrayFallback = service_interest
        } else if (typeof service_interest === 'string') {
          serviceInterestArrayFallback = [service_interest]
        }
      }

      // Fallback: usar sistema local
      const mockUser = {
        id: userId,
        conversation_id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: passwordHashFallback,
        phone: phone?.trim(),
        cpf: cpf?.trim(),
        birth_date,
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        occupation: occupation?.trim(),
        company: company?.trim(),
        income_range,
        preferred_contact: preferred_contact || 'email',
        service_interest: serviceInterestArrayFallback,
        registration_source: 'chat',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Armazenar localmente
      if (!global.chatUsers) {
        global.chatUsers = new Map()
      }
      global.chatUsers.set(userId, mockUser)

      console.log('✅ Usuário criado no sistema local:', userId)

      return NextResponse.json({
        success: true,
        user: mockUser,
        message: 'Usuário cadastrado com sucesso! (modo desenvolvimento)'
      })
    }

  } catch (error) {
    console.error('💥 Erro no cadastro de usuário:', error)

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Detalhes:', error.message)
      console.error('Stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// GET - Buscar usuário por conversation_id ou email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const email = searchParams.get('email')
    const userId = searchParams.get('user_id')
    const all = searchParams.get('all')

    // Se solicitar todos os usuários
    if (all === 'true' || (!conversationId && !email && !userId)) {
      try {
        const { data: users, error } = await supabaseAdmin
          .from('chat_users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        return NextResponse.json({
          success: true,
          users: users || [],
          total: users?.length || 0
        })

      } catch (supabaseError) {
        console.log('Erro do Supabase, usando sistema local:', supabaseError)

        // Fallback: buscar usuários do sistema local
        let users = []
        if (global.chatUsers) {
          users = Array.from(global.chatUsers.values())
          users.sort((a, b) => b.created_at.localeCompare(a.created_at))
        }

        return NextResponse.json({
          success: true,
          users,
          total: users.length
        })
      }
    }

    try {
      let query = supabaseAdmin.from('chat_users').select('*')

      if (userId) {
        query = query.eq('id', userId)
      } else if (email) {
        query = query.eq('email', email.toLowerCase().trim())
      } else if (conversationId) {
        query = query.eq('conversation_id', conversationId)
      }

      const { data: user, error } = await query.single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return NextResponse.json({
        user: user || null,
        found: !!user
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: buscar no sistema local
      if (global.chatUsers) {
        for (const [id, user] of global.chatUsers) {
          if ((userId && user.id === userId) ||
              (email && user.email === email.toLowerCase().trim()) ||
              (conversationId && user.conversation_id === conversationId)) {
            return NextResponse.json({
              user,
              found: true
            })
          }
        }
      }

      return NextResponse.json({
        user: null,
        found: false
      })
    }

  } catch (error) {
    console.error('💥 Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar dados do usuário
export async function PUT(request: NextRequest) {
  try {
    const {
      user_id,
      name,
      email,
      phone,
      cpf,
      birth_date,
      address,
      city,
      state,
      occupation,
      company,
      income_range,
      preferred_contact,
      service_interest
    } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      )
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Adicionar campos que foram fornecidos
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.toLowerCase().trim()
    if (phone) updateData.phone = phone.trim()
    if (cpf) updateData.cpf = cpf.trim()
    if (birth_date) updateData.birth_date = birth_date
    if (address) updateData.address = address.trim()
    if (city) updateData.city = city.trim()
    if (state) updateData.state = state.trim()
    if (occupation) updateData.occupation = occupation.trim()
    if (company) updateData.company = company.trim()
    if (income_range) updateData.income_range = income_range
    if (preferred_contact) updateData.preferred_contact = preferred_contact
    if (service_interest) updateData.service_interest = service_interest

    try {
      const { data: updatedUser, error } = await supabaseAdmin
        .from('chat_users')
        .update(updateData)
        .eq('id', user_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Dados atualizados com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: atualizar no sistema local
      if (global.chatUsers && global.chatUsers.has(user_id)) {
        const existingUser = global.chatUsers.get(user_id)
        const updatedUser = { ...existingUser, ...updateData }
        global.chatUsers.set(user_id, updatedUser)

        return NextResponse.json({
          success: true,
          user: updatedUser,
          message: 'Dados atualizados com sucesso! (modo desenvolvimento)'
        })
      }

      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('💥 Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}