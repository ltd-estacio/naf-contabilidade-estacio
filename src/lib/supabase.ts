import { createClient } from '@supabase/supabase-js'
import { mockSupabaseAdmin } from './mock-supabase'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Usar Supabase real se credenciais estiverem configuradas, senão usar mock
const USE_MOCK = !supabaseUrl || !supabaseAnonKey || supabaseAnonKey.trim() === ''

// Log de debug para verificar configuração
console.log('🔧 Supabase config:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  useMock: USE_MOCK,
  environment: process.env.NODE_ENV
})

// Criar clientes Supabase
const safeSupabaseClient = USE_MOCK
  ? mockSupabaseAdmin
  : createClient(supabaseUrl, supabaseAnonKey)

const safeSupabaseAdmin = USE_MOCK || !supabaseServiceKey
  ? (USE_MOCK ? mockSupabaseAdmin : createClient(supabaseUrl, supabaseAnonKey))
  : createClient(supabaseUrl, supabaseServiceKey)

export const supabase = safeSupabaseClient
export const supabaseAdmin = safeSupabaseAdmin

export interface CoordinatorUser {
  id: string
  email: string
  password: string
  created_at: string
  last_login?: string
  is_active: boolean
}

export interface CoordinatorSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}