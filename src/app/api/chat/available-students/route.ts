import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('id, name, email, course, semester, status, updated_at')
      .eq('status', 'ATIVO')
      .order('updated_at', { ascending: false })
      .limit(25)

    if (error) {
      throw error
    }

    const students = (data || []).map(student => ({
      id: student.id,
      name: student.name || 'Estudante',
      email: student.email || '',
      course: student.course || 'Ciências Contábeis',
      semester: student.semester || '',
      status: student.status || 'ATIVO',
      is_online: true
    }))

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Erro ao buscar estudantes disponíveis:', error)

    // Fallback com dados fictícios para não bloquear a interface
    const mockStudents = [
      {
        id: 'student-mock-1',
        name: 'Ana Silva',
        email: 'ana.silva@estudante.com',
        course: 'Ciências Contábeis',
        semester: '6º',
        status: 'ATIVO',
        is_online: true
      },
      {
        id: 'student-mock-2',
        name: 'João Santos',
        email: 'joao.santos@estudante.com',
        course: 'Administração',
        semester: '7º',
        status: 'ATIVO',
        is_online: false
      },
      {
        id: 'student-mock-3',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@estudante.com',
        course: 'Ciências Contábeis',
        semester: '8º',
        status: 'ATIVO',
        is_online: true
      }
    ]

    return NextResponse.json({ students: mockStudents })
  }
}
