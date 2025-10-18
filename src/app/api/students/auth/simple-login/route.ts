import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
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

    // Buscar estudante do Supabase
    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select('id, email, password_hash, name, phone, document, course, semester, university, registration_number, specializations, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'ATIVO')
      .limit(1)

    if (error) {
      console.error('Erro ao buscar estudante no Supabase:', error)
      return NextResponse.json(
        { message: 'Erro ao buscar dados do estudante' },
        { status: 500 }
      )
    }

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const dbStudent = students[0]

    // Verificar senha
    const passwordMatch = dbStudent.password_hash
      ? await bcrypt.compare(password, dbStudent.password_hash)
      : false

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Atualizar último login
    await supabaseAdmin
      .from('students')
      .update({ last_login: new Date().toISOString() })
      .eq('id', dbStudent.id)

    // Gerar token JWT
    const token = jwt.sign(
      {
        studentId: dbStudent.id,
        email: dbStudent.email,
        role: 'student'
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    )

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      student: {
        id: dbStudent.id,
        email: dbStudent.email,
        name: dbStudent.name,
        course: dbStudent.course,
        semester: dbStudent.semester,
        phone: dbStudent.phone,
        registrationNumber: dbStudent.registration_number,
        specializations: dbStudent.specializations || [],
        status: dbStudent.status
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