import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        message: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Find user in Supabase
    const { data: user, error } = await supabase
      .from('coordinator_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({
        message: 'Credenciais inválidas'
      }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({
        message: 'Credenciais inválidas'
      }, { status: 401 })
    }

    // Update last login
    await supabase
      .from('coordinator_users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'coordinator'
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '8h' }
    )

    // Save session to database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 8)

    await supabase
      .from('coordinator_sessions')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    // Log successful login
    await supabase
      .from('coordinator_login_logs')
      .insert({
        user_id: user.id,
        login_time: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: true
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
    console.error('Login error:', error)

    return NextResponse.json({
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}