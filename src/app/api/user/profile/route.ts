import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL

async function verifyAccessToken(accessToken: string, userId: string): Promise<boolean> {
  if (!baseUrl) return false
  const res = await fetch(`${baseUrl}/api/auth/sessions/current`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return false
  const json = await res.json()
  return json?.user?.id === userId
}

async function verifyUserByEmail(userId: string, email: string): Promise<boolean> {
  if (!baseUrl) return false
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY
  if (!adminKey) return false
  const res = await fetch(`${baseUrl}/api/auth/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${adminKey}` },
  })
  if (!res.ok) return false
  const json = await res.json()
  const authEmail = json?.email ?? json?.user?.email
  return typeof authEmail === 'string' && authEmail.toLowerCase() === email.toLowerCase()
}

export async function POST(request: Request) {
  try {
    const { userId, nombre, email, telefono, accessToken } = await request.json()

    if (!userId || !nombre || !email) {
      return NextResponse.json({ error: 'userId, nombre y email son requeridos' }, { status: 400 })
    }

    const authorized = accessToken
      ? await verifyAccessToken(accessToken, userId)
      : await verifyUserByEmail(userId, email)

    if (!authorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = getInsforgeAdmin()
    const { data, error } = await admin.database.rpc('crear_perfil_usuario', {
      p_id: userId,
      p_nombre: nombre,
      p_email: email,
      p_telefono: telefono ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
