'use client'

interface StoredUser {
  [key: string]: unknown
}

const TOKEN_KEY = 'student_token'
const USER_KEY = 'student_user'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null

const COOKIE_TOKEN_KEY = 'student_token'
const COOKIE_USER_KEY = 'student_user'

const getStorage = (): { local: StorageLike; session: StorageLike } => {
  if (typeof window === 'undefined') {
    return { local: null, session: null }
  }

  return {
    local: safeStorage(window.localStorage),
    session: safeStorage(window.sessionStorage)
  }
}

const memoryStore: Record<string, string> = {}

function safeStorage(storage: Storage | undefined): StorageLike {
  try {
    if (!storage) return null
    const testKey = '__naf_storage_test__'
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return storage
  } catch (error) {
    console.warn('[studentSession] Armazenamento indisponível', error)
    return null
  }
}

function readFromStorage(storage: StorageLike, key: string): string | null {
  if (!storage) return null
  try {
    const value = storage.getItem(key)
    if (!value || value === 'undefined' || value === 'null') {
      return null
    }
    return value
  } catch (error) {
    console.warn(`[studentSession] Falha ao ler ${key}`, error)
    return null
  }
}

function writeToStorage(storage: StorageLike, key: string, value: string) {
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch (error) {
    console.warn(`[studentSession] Falha ao salvar ${key}`, error)
  }
}

function removeFromStorage(storage: StorageLike, key: string) {
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch (error) {
    console.warn(`[studentSession] Falha ao remover ${key}`, error)
  }
}

function readFromCookies(): { token: string | null; user: string | null } {
  if (typeof document === 'undefined') {
    return { token: null, user: null }
  }

  const cookies = document.cookie ? document.cookie.split('; ') : []
  let token: string | null = null
  let user: string | null = null

  for (const cookie of cookies) {
    const [rawKey, ...rest] = cookie.split('=')
    const value = rest.join('=')
    if (rawKey === COOKIE_TOKEN_KEY) {
      token = decodeURIComponent(value)
    }
    if (rawKey === COOKIE_USER_KEY) {
      user = decodeURIComponent(value)
    }
  }

  return { token, user }
}

export const studentSession = {
  async save(token: string, user: StoredUser) {
    const serializedUser = JSON.stringify(user)
    const { local, session } = getStorage()

    memoryStore[TOKEN_KEY] = token
    memoryStore[USER_KEY] = serializedUser

    writeToStorage(local, TOKEN_KEY, token)
    writeToStorage(local, USER_KEY, serializedUser)

    writeToStorage(session, TOKEN_KEY, token)
    writeToStorage(session, USER_KEY, serializedUser)

    if (typeof document !== 'undefined') {
      const maxAge = 60 * 60 * 24 * 30 // 30 dias
      document.cookie = `${COOKIE_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`
      document.cookie = `${COOKIE_USER_KEY}=${encodeURIComponent(serializedUser)}; path=/; max-age=${maxAge}; samesite=lax`
    }
  },

  async load(): Promise<{ token: string | null; user: StoredUser | null }> {
    const { local, session } = getStorage()

    const cookieValues = readFromCookies()

    const rawToken =
      readFromStorage(local, TOKEN_KEY) ??
      readFromStorage(session, TOKEN_KEY) ??
      cookieValues.token ??
      memoryStore[TOKEN_KEY] ??
      null

    const rawUser =
      readFromStorage(local, USER_KEY) ??
      readFromStorage(session, USER_KEY) ??
      cookieValues.user ??
      memoryStore[USER_KEY] ??
      null

    let parsedUser: StoredUser | null = null
    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser)
      } catch (error) {
        console.warn('[studentSession] Não foi possível converter usuário salvo', error)
      }
    }

    return { token: rawToken, user: parsedUser }
  },

  async getToken(): Promise<string | null> {
    const { token } = await this.load()
    return token
  },

  async getUser(): Promise<StoredUser | null> {
    const { user } = await this.load()
    return user
  },

  async clear() {
    const { local, session } = getStorage()

    delete memoryStore[TOKEN_KEY]
    delete memoryStore[USER_KEY]

    removeFromStorage(local, TOKEN_KEY)
    removeFromStorage(local, USER_KEY)

    removeFromStorage(session, TOKEN_KEY)
    removeFromStorage(session, USER_KEY)

    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_TOKEN_KEY}=; path=/; max-age=0`
      document.cookie = `${COOKIE_USER_KEY}=; path=/; max-age=0`
    }
  }
}

export default studentSession
