import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Para testes - credenciais de desenvolvimento
    if (email === 'student@test.com' && password === 'test123') {
      const token = jwt.sign(
        {
          studentId: 'test-student-123',
          email: 'student@test.com',
          role: 'student'
        },
        process.env.NEXTAUTH_SECRET || 'your-secret-key',
        { expiresIn: '8h' }
      )

      return NextResponse.json({
        message: 'Login realizado com sucesso',
        token,
        student: {
          id: 'test-student-123',
          email: 'student@test.com',
          name: 'João Silva dos Santos',
          course: 'Ciências Contábeis',
          semester: '7º Semestre',
          phone: '(11) 99999-9999',
          registrationNumber: '2021123456',
          specializations: ['Contabilidade Fiscal', 'Contabilidade Tributária'],
          status: 'ATIVO',
          lastLogin: new Date().toISOString()
        }
      })
    }

    // Buscar estudante no Supabase
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'ATIVO')
      .single()

    if (error || !student) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, student.password_hash)

    if (!isValidPassword) {
      // Log da tentativa de login falhada
      await supabaseAdmin
        .from('student_activity_logs')
        .insert({
          student_id: student.id,
          activity_type: 'LOGIN_FAILED',
          activity_data: {
            reason: 'Senha inválida',
            attempted_email: email
          },
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
        studentId: student.id,
        email: student.email,
        role: 'student'
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    )

    // Atualizar último login
    await supabaseAdmin
      .from('students')
      .update({ last_login: new Date().toISOString() })
      .eq('id', student.id)

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      student: {
        id: student.id,
        email: student.email,
        name: student.name,
        course: student.course,
        semester: student.semester,
        phone: student.phone,
        registrationNumber: student.registration_number,
        specializations: student.specializations,
        status: student.status,
        lastLogin: student.last_login
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