import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from('coordinator_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      // Log da tentativa de login falhada
      await supabase
        .from('coordinator_login_logs')
        .insert({
          user_id: user.id,
          success: false,
          failure_reason: 'Senha inválida',
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || ''
        })

      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'coordinator'
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    )

    // Salvar sessão no banco
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 8)

    await supabase
      .from('coordinator_sessions')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    // Atualizar último login
    await supabase
      .from('coordinator_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Log da tentativa de login bem-sucedida
    await supabase
      .from('coordinator_login_logs')
      .insert({
        user_id: user.id,
        success: true,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || ''
      })

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        lastLogin: user.last_login
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}