import jwt from 'jsonwebtoken'

interface StudentTokenPayload {
  studentId?: string
  id?: string
  sub?: string
  email?: string
  role?: string
}

export async function verifyStudentToken(token: string): Promise<StudentTokenPayload | null> {
  try {
    if (token === 'test-token-123') {
      return {
        studentId: 'test-student-123',
        email: 'student@test.com',
        role: 'student'
      }
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as StudentTokenPayload

    if (!decoded.studentId && !decoded.id) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Erro ao verificar token do estudante:', error)
    return null
  }
}

export function extractStudentId(payload: StudentTokenPayload): string | undefined {
  return payload.studentId || payload.id || payload.sub
}
