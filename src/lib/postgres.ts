import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    // Tentar obter a URL do banco de dados do ambiente
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL não configurada. Usando dados mock.')
      return null
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    pool.on('error', (err) => {
      console.error('Erro no pool do PostgreSQL:', err)
      pool = null
    })
  }

  return pool
}

export async function query(text: string, params?: any[]) {
  const pool = getPool()

  if (!pool) {
    throw new Error('Pool de conexão não disponível')
  }

  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Erro na query:', error)
    throw error
  }
}
