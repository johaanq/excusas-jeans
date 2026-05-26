import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL

function missingAdminKeyResponse() {
  return NextResponse.json(
    {
      error:
        'Falta INSFORGE_ADMIN_API_KEY en el servidor. Agrégala a .env local y en Vercel para crear cuentas de usuario.',
    },
    { status: 503 }
  )
}

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
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY
  if (!baseUrl || !adminKey) return false

  const res = await fetch(
    `${baseUrl}/api/auth/users?search=${encodeURIComponent(email)}&limit=20`,
    { headers: { Authorization: `Bearer ${adminKey}` } }
  )
  if (!res.ok) return false

  const json = await res.json()
  const users = Array.isArray(json?.data) ? json.data : []
  return users.some(
    (user: { id?: string; email?: string }) =>
      user.id === userId && user.email?.toLowerCase() === email.toLowerCase()
  )
}

export async function POST(request: Request) {
  try {
    if (!process.env.INSFORGE_ADMIN_API_KEY) {
      return missingAdminKeyResponse()
    }

    const { userId, nombre, email, telefono, accessToken } = await request.json()

    if (!userId || !nombre || !email) {
      return NextResponse.json({ error: 'userId, nombre y email son requeridos' }, { status: 400 })
    }

    const authorized = accessToken
      ? await verifyAccessToken(accessToken, userId)
      : await verifyUserByEmail(userId, email)

    if (!authorized) {
      return NextResponse.json(
        { error: 'No se pudo verificar la cuenta recién creada. Intenta de nuevo en unos segundos.' },
        { status: 401 }
      )
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
    if (message.includes('INSFORGE_ADMIN_API_KEY')) {
      return missingAdminKeyResponse()
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
