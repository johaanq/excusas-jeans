import { insforge, INSFORGE_BASE_URL } from './insforge'

const USER_TOKEN_KEY = 'user_token'

export function getStoredUserToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_TOKEN_KEY)
}

export function saveStoredUserToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_TOKEN_KEY, token)
  insforge.setAccessToken(token)
}

export function clearStoredUserSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_TOKEN_KEY)
  insforge.setAccessToken(null)
}

/** Valida el JWT guardado sin llamar a /api/auth/refresh (evita 401 en consola). */
export async function fetchCurrentAuthUser(): Promise<{
  id: string
  email: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
} | null> {
  const token = getStoredUserToken()
  if (!token) return null

  insforge.setAccessToken(token)

  const res = await fetch(`${INSFORGE_BASE_URL}/api/auth/sessions/current`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null

  const json = await res.json()
  const user = json?.user
  if (!user?.id) return null

  return user
}
