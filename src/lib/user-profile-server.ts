import { getInsforgeAdmin } from '@/lib/insforge-admin'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

export type UsuarioRow = {
  id: string
  nombre: string
  email: string
  telefono?: string | null
  dni?: string | null
  provincia?: string | null
  distrito?: string | null
  direccion?: string | null
  referencia?: string | null
  codigo_postal?: string | null
  empresa_envio?: string | null
  sede_envio?: string | null
  created_at: string
  updated_at: string
}

function parseRecordsArray(json: unknown): UsuarioRow | null {
  if (Array.isArray(json) && json.length > 0) {
    return json[0] as UsuarioRow
  }
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data?: unknown }).data
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as UsuarioRow
    }
  }
  return null
}

async function fetchRecords(filter: string, bearerToken: string): Promise<UsuarioRow | null> {
  if (!baseUrl || !bearerToken) return null
  const url = `${baseUrl}/api/database/records/usuarios?${filter}&select=*`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${bearerToken}`,
  }
  if (anonKey) headers.apikey = anonKey

  const res = await fetch(url, { headers })
  if (!res.ok) return null
  return parseRecordsArray(await res.json())
}

export function isEmailUniqueViolation(message: string): boolean {
  const msg = message.toLowerCase()
  return (
    msg.includes('usuarios_email') ||
    (msg.includes('email') && (msg.includes('unique') || msg.includes('duplicate')))
  )
}

export function isIdUniqueViolation(message: string): boolean {
  const msg = message.toLowerCase()
  if (isEmailUniqueViolation(message)) return false
  return msg.includes('duplicate') || msg.includes('unique') || msg.includes('ya existe')
}

export async function fetchUsuarioByEmail(email: string): Promise<UsuarioRow | null> {
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY
  if (adminKey) {
    const row = await fetchRecords(`email=eq.${encodeURIComponent(email)}`, adminKey)
    if (row) return row
  }
  if (anonKey) {
    return fetchRecords(`email=eq.${encodeURIComponent(email)}`, anonKey)
  }
  return null
}

export function buildFallbackUsuario(
  userId: string,
  nombre: string,
  email: string,
  telefono?: string | null
): UsuarioRow {
  const now = new Date().toISOString()
  return {
    id: userId,
    nombre,
    email,
    telefono: telefono ?? null,
    created_at: now,
    updated_at: now,
  }
}

/** Lee la fila con el JWT del usuario (RLS permite SELECT propio). */
export async function fetchUsuarioWithAccessToken(
  userId: string,
  accessToken: string
): Promise<UsuarioRow | null> {
  if (!baseUrl || !anonKey) return null

  const url = `${baseUrl}/api/database/records/usuarios?id=eq.${encodeURIComponent(userId)}&select=*`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
    },
  })

  if (!res.ok) return null

  return parseRecordsArray(await res.json())
}

export async function fetchUsuarioWithAdmin(userId: string): Promise<UsuarioRow | null> {
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY
  if (baseUrl && adminKey) {
    const row = await fetchRecords(`id=eq.${encodeURIComponent(userId)}`, adminKey)
    if (row) return row
  }

  const admin = getInsforgeAdmin()
  const { data, error } = await admin.database
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as UsuarioRow
}

export async function loadUsuarioAfterCreate(
  userId: string,
  nombre: string,
  email: string,
  telefono: string | null,
  accessToken: string | null
): Promise<UsuarioRow> {
  const persisted = await fetchUsuarioPersisted(userId, accessToken)
  if (persisted) return persisted

  return buildFallbackUsuario(userId, nombre, email, telefono)
}

/** Solo devuelve usuario si existe en BD (sin objeto sintético). */
export async function fetchUsuarioPersisted(
  userId: string,
  accessToken: string | null
): Promise<UsuarioRow | null> {
  if (accessToken) {
    const withToken = await fetchUsuarioWithAccessToken(userId, accessToken)
    if (withToken) return withToken
  }
  return fetchUsuarioWithAdmin(userId)
}

export type ResolveProfileInput = {
  authUserId: string
  nombre: string
  email: string
  telefono: string | null
  accessToken: string | null
  rpcError: { message: string } | null
}

export type ResolveProfileResult =
  | { ok: true; user: UsuarioRow }
  | { ok: false; status: number; error: string }

/** Tras crear_perfil_usuario: resuelve fila en BD o error claro (p. ej. correo ya registrado). */
export async function resolveUsuarioAfterProfileRpc(
  input: ResolveProfileInput
): Promise<ResolveProfileResult> {
  const { authUserId, nombre, email, telefono, accessToken, rpcError } = input

  if (rpcError) {
    if (isEmailUniqueViolation(rpcError.message)) {
      const existing = await fetchUsuarioByEmail(email)
      if (existing && existing.id !== authUserId) {
        return {
          ok: false,
          status: 409,
          error: '__ORPHAN_PROFILE__',
        }
      }
    } else if (!isIdUniqueViolation(rpcError.message)) {
      return { ok: false, status: 400, error: rpcError.message }
    }
  }

  let user =
    (await fetchUsuarioPersisted(authUserId, accessToken)) ??
    (await fetchUsuarioByEmail(email))

  if (user && user.id !== authUserId) {
    return {
      ok: false,
      status: 409,
      error: '__ORPHAN_PROFILE__',
    }
  }

  if (!user && !rpcError) {
    user = buildFallbackUsuario(authUserId, nombre, email, telefono)
  }

  if (!user) {
    return {
      ok: false,
      status: 503,
      error:
        'No pudimos completar tu perfil. Intenta iniciar sesión en unos segundos o contacta por WhatsApp.',
    }
  }

  await ensureCartForUser(user.id)

  return { ok: true, user }
}

/** Quita perfil/carrito antiguo cuando Auth se recreó con el mismo correo. */
export async function removeOrphanUsuarioProfile(oldUserId: string): Promise<void> {
  const admin = getInsforgeAdmin()

  const { data: carts } = await admin.database
    .from('carritos')
    .select('id')
    .eq('usuario_id', oldUserId)

  const cartIds = (carts ?? []).map((c: { id: string }) => c.id)
  for (const cartId of cartIds) {
    await admin.database.from('carrito_items').delete().eq('carrito_id', cartId)
  }

  await admin.database.from('carritos').delete().eq('usuario_id', oldUserId)
  await admin.database.from('usuarios').delete().eq('id', oldUserId)
}

/** Crea carrito vacío tras el perfil (admin; evita FK en el cliente). */
export async function ensureCartForUser(userId: string): Promise<void> {
  const admin = getInsforgeAdmin()
  const { error } = await admin.database.from('carritos').insert({ usuario_id: userId })

  if (!error) return

  const code = (error as { code?: string }).code
  const msg = (error.message || '').toLowerCase()
  if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) return
  if (code === '23503') return

  console.error('ensureCartForUser:', error)
}
