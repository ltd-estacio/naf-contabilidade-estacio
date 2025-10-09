import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const dynamic = 'force-dynamic'

async function verifyStudentToken(token: string): Promise<unknown> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.studentId && !decoded.id && decoded.role !== 'student') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

// GET - Buscar perfil completo do estudante
export async function GET(request: NextRequest) {
  try {
    console.log('👤 Student Profile - Buscando perfil do estudante')

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const studentId = studentAuth.studentId || studentAuth.id

    // 1. Buscar dados completos do estudante
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('❌ Erro ao buscar estudante:', studentError)
      return NextResponse.json(
        { message: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar horários disponíveis do estudante
    const { data: availability, error: availabilityError } = await supabaseAdmin
      .from('student_availability')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)

    if (availabilityError) {
      console.error('❌ Erro ao buscar disponibilidade:', availabilityError)
    }

    // 3. Buscar estatísticas adicionais
    const { data: attendanceStats, error: statsError } = await supabaseAdmin
      .from('attendances')
      .select('status, client_satisfaction_rating')
      .eq('student_id', studentId)

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError)
    }

    // 4. Calcular estatísticas do perfil
    const totalAttendances = attendanceStats?.length || 0
    const completedAttendances = attendanceStats?.filter(a => a.status === 'CONCLUIDO').length || 0
    const avgRating = attendanceStats?.filter(a => a.client_satisfaction_rating)
      .reduce((sum, a, _, arr) => {
        const total = sum + (a.client_satisfaction_rating || 0)
        return arr.length > 0 ? total / arr.length : 0
      }, 0) || 0

    // 5. Formatar horários disponíveis
    const formattedAvailability = availability?.map(slot => ({
      id: slot.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: slot.is_active
    })) || []

    const result = {
      profile: {
        id: student.id,
        email: student.email,
        name: student.name,
        phone: student.phone,
        document: student.document,
        course: student.course,
        semester: student.semester,
        university: student.university,
        registration_number: student.registration_number,
        birth_date: student.birth_date,
        address: student.address,
        emergency_contact: student.emergency_contact,
        specializations: student.specializations || [],
        available_hours: student.available_hours || [],
        status: student.status,
        profile_picture_url: student.profile_picture_url,
        created_at: student.created_at,
        updated_at: student.updated_at,
        last_login: student.last_login
      },
      availability: formattedAvailability,
      stats: {
        totalAttendances,
        completedAttendances,
        avgRating: Math.round(avgRating * 10) / 10,
        successRate: totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0
      }
    }

    console.log('✅ Perfil do estudante carregado:', {
      name: student.name,
      course: student.course,
      totalAttendances,
      avgRating: avgRating.toFixed(1)
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro ao buscar perfil:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Atualizar perfil do estudante
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Student Profile - Atualizando perfil do estudante')

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const studentId = studentAuth.studentId || studentAuth.id
    const body = await request.json()

    const {
      name,
      phone,
      document,
      course,
      semester,
      university,
      registration_number,
      birth_date,
      address,
      emergency_contact,
      specializations,
      available_hours,
      profile_picture_url,
      password
    } = body

    // Preparar dados para atualização
    const updateData: unknown = {
      updated_at: new Date().toISOString()
    }

    // Adicionar campos opcionais se fornecidos
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (document) updateData.document = document
    if (course) updateData.course = course
    if (semester) updateData.semester = semester
    if (university) updateData.university = university
    if (registration_number) updateData.registration_number = registration_number
    if (birth_date) updateData.birth_date = birth_date
    if (address) updateData.address = address
    if (emergency_contact) updateData.emergency_contact = emergency_contact
    if (specializations) updateData.specializations = specializations
    if (available_hours) updateData.available_hours = available_hours
    if (profile_picture_url) updateData.profile_picture_url = profile_picture_url

    // Atualizar senha se fornecida
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        )
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      updateData.password_hash = hashedPassword
    }

    // Atualizar no banco de dados
    const { data: updatedStudent, error: updateError } = await supabaseAdmin
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar estudante:', updateError)
      return NextResponse.json(
        { message: 'Erro ao atualizar perfil', error: updateError.message },
        { status: 500 }
      )
    }

    // Retornar perfil atualizado (sem a senha hash)
    const { password_hash: _passwordHash, ...profileData } = updatedStudent

    console.log('✅ Perfil atualizado com sucesso:', updatedStudent.name)

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      profile: profileData
    })

  } catch (error) {
    console.error('💥 Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Atualizar horários de disponibilidade
export async function POST(request: NextRequest) {
  try {
    console.log('⏰ Student Profile - Atualizando horários de disponibilidade')

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const studentAuth = await verifyStudentToken(token)

    if (!studentAuth) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    const studentId = studentAuth.studentId || studentAuth.id
    const body = await request.json()
    const { availability } = body

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { message: 'availability deve ser um array' },
        { status: 400 }
      )
    }

    // Primeiro, desativar todos os horários existentes
    const { error: deactivateError } = await supabaseAdmin
      .from('student_availability')
      .update({ is_active: false })
      .eq('student_id', studentId)

    if (deactivateError) {
      console.error('❌ Erro ao desativar horários:', deactivateError)
      return NextResponse.json(
        { message: 'Erro ao atualizar horários' },
        { status: 500 }
      )
    }

    // Inserir novos horários
    const newAvailability = availability.map(slot => ({
      student_id: studentId,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: true
    }))

    const { data: insertedAvailability, error: insertError } = await supabaseAdmin
      .from('student_availability')
      .insert(newAvailability)
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir horários:', insertError)
      return NextResponse.json(
        { message: 'Erro ao inserir novos horários', error: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ Horários de disponibilidade atualizados:', newAvailability.length, 'slots')

    return NextResponse.json({
      message: 'Horários de disponibilidade atualizados com sucesso',
      availability: insertedAvailability
    })

  } catch (error) {
    console.error('💥 Erro ao atualizar disponibilidade:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) },
      { status: 500 }
    )
  }
}
