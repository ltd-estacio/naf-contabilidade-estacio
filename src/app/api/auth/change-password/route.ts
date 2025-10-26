import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  let requestBody: any = {}
  
  try {
    requestBody = await request.json()
    const { userId, userEmail, userType, currentPassword, newPassword } = requestBody

    // Validações
    if (!userId || !userEmail || !userType || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Se estiver usando Supabase Auth
    // Verificar senha atual fazendo login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    })

    if (authError) {
      console.error('Erro ao verificar senha atual:', authError)
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      )
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    // Registrar alteração no histórico
    await supabase.from('password_changes').insert({
      user_id: userId,
      user_email: userEmail,
      user_type: userType,
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    
    // Registrar falha no histórico
    try {
      await supabase.from('password_changes').insert({
        user_id: requestBody?.userId || 'unknown',
        user_email: requestBody?.userEmail || 'unknown',
        user_type: requestBody?.userType || 'unknown',
        success: false
      })
    } catch (logError) {
      console.error('Erro ao registrar falha:', logError)
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para atualizar apenas o email/login
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newEmail, password } = body

    if (!userId || !newEmail || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar senha antes de alterar email
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: body.currentEmail,
      password: password
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Atualizar email
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (updateError) {
      console.error('Erro ao atualizar email:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email atualizado com sucesso. Verifique seu novo email para confirmar a alteração.'
    })

  } catch (error) {
    console.error('Erro ao alterar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
