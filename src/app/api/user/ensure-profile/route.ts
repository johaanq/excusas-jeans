import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL

async function findAuthUserByEmail(email: string) {
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY
  if (!baseUrl || !adminKey) return null

  const res = await fetch(
    `${baseUrl}/api/auth/users?search=${encodeURIComponent(email)}&limit=10`,
    { headers: { Authorization: `Bearer ${adminKey}` } }
  )
  if (!res.ok) return null

  const json = await res.json()
  const users = Array.isArray(json?.data) ? json.data : []
  return (
    users.find(
      (user: { email?: string }) => user.email?.toLowerCase() === email.toLowerCase()
    ) ?? null
  )
}

export async function POST(request: Request) {
  try {
    if (!process.env.INSFORGE_ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Falta INSFORGE_ADMIN_API_KEY en el servidor.' },
        { status: 503 }
      )
    }

    const { email, nombre, telefono } = await request.json()
    if (!email || !nombre) {
      return NextResponse.json({ error: 'email y nombre son requeridos' }, { status: 400 })
    }

    const authUser = await findAuthUserByEmail(email)
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No se encontró la cuenta en Auth. Espera unos segundos e intenta de nuevo.' },
        { status: 404 }
      )
    }

    const admin = getInsforgeAdmin()
    const { error } = await admin.database.rpc('crear_perfil_usuario', {
      p_id: authUser.id,
      p_nombre: nombre,
      p_email: email,
      p_telefono: telefono ?? null,
    })

    if (error) {
      const msg = error.message.toLowerCase()
      const alreadyExists =
        msg.includes('duplicate') || msg.includes('unique') || msg.includes('ya existe')
      if (!alreadyExists) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      userId: authUser.id,
      emailVerified: authUser.emailVerified ?? false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
