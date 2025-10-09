import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export interface CoordinatorAuthData {
  userId: string
  email: string
  role: string
}

export async function verifyCoordinatorToken(token: string): Promise<CoordinatorAuthData | null> {
  try {
    // Verificar se o token é válido
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as unknown

    if (!decoded.userId || decoded.role !== 'coordinator') {
      return null
    }

    // Verificar se a sessão existe no banco e não expirou
    const { data: session, error } = await supabase
      .from('coordinator_sessions')
      .select('*')
      .eq('token', token)
      .eq('user_id', decoded.userId)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return null
    }

    // Atualizar último uso da sessão
    await supabase
      .from('coordinator_sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('id', session.id)

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }

  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return null
  }
}

export async function getCoordinatorFromRequest(request: Request): Promise<CoordinatorAuthData | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return await verifyCoordinatorToken(token)
}