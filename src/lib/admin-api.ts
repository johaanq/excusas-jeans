'use client'

const ADMIN_SESSION_PW_KEY = 'admin_session_pw'

export type AdminCredentials = {
  username: string
  password: string
}

export type AdminQueryPayload = {
  table: string
  op: 'select' | 'insert' | 'update' | 'delete' | 'rpc'
  select?: string
  data?: unknown
  match?: Record<string, string | number | boolean>
  /** Filtro .in() — p. ej. { color_id: ['uuid1', 'uuid2'] } */
  matchIn?: Record<string, (string | number)[]>
  rpc?: string
  rpcArgs?: Record<string, unknown>
  order?: { column: string; ascending?: boolean }
  single?: boolean
}

export async function adminAuthedPost<T = unknown>(url: string, payload: Record<string, unknown>): Promise<T> {
  const credentials = getAdminCredentials()
  if (!credentials) {
    throw new Error('Sesión de administrador expirada. Vuelve a iniciar sesión.')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credentials, ...payload }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Error en operación de administrador')
  }
  return json as T
}

export function getAdminCredentials(): AdminCredentials | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('admin_user')
  const password = sessionStorage.getItem(ADMIN_SESSION_PW_KEY)
  if (!raw || !password) return null
  try {
    const user = JSON.parse(raw) as { username: string }
    if (!user.username) return null
    return { username: user.username, password }
  } catch {
    return null
  }
}

export async function adminQuery<T = unknown>(payload: AdminQueryPayload): Promise<T> {
  const credentials = getAdminCredentials()
  if (!credentials) {
    throw new Error('Sesión de administrador expirada. Vuelve a iniciar sesión.')
  }

  const res = await fetch('/api/admin/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credentials, payload }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Error en operación de administrador')
  }

  return json.data as T
}
