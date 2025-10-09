import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST - Login de usuário do chat
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Chat User Login - Processando login')

    const { email, password } = await request.json()

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    try {
      // Buscar usuário no Supabase
      const { data: user, error } = await supabaseAdmin
        .from('chat_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'E-mail não encontrado' },
          { status: 404 }
        )
      }

      // Verificar senha
      if (!user.password) {
        return NextResponse.json(
          { error: 'Usuário sem senha cadastrada. Entre em contato para redefinir.' },
          { status: 400 }
        )
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Senha incorreta' },
          { status: 401 }
        )
      }

      // Login bem-sucedido - retornar dados do usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user

      console.log('✅ Login realizado com sucesso:', user.id)

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        message: 'Login realizado com sucesso!'
      })

    } catch (supabaseError) {
      console.log('Erro do Supabase, usando sistema local:', supabaseError)

      // Fallback: verificar no sistema local
      if (global.chatUsers) {
        for (const [id, user] of global.chatUsers) {
          if (user.email === email.toLowerCase().trim()) {
            // Verificar senha
            if (!user.password) {
              return NextResponse.json(
                { error: 'Usuário sem senha cadastrada' },
                { status: 400 }
              )
            }

            const passwordMatch = await bcrypt.compare(password, user.password)

            if (!passwordMatch) {
              return NextResponse.json(
                { error: 'Senha incorreta' },
                { status: 401 }
              )
            }

            // Login bem-sucedido
            const { password: _, ...userWithoutPassword } = user

            return NextResponse.json({
              success: true,
              user: userWithoutPassword,
              message: 'Login realizado com sucesso! (modo desenvolvimento)'
            })
          }
        }
      }

      // Usuário não encontrado
      return NextResponse.json(
        { error: 'E-mail não encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('💥 Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
