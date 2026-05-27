import { NextResponse } from 'next/server'
import { fetchUsuarioWithAccessToken } from '@/lib/user-profile-server'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL

async function getAuthUserFromToken(accessToken: string) {
  if (!baseUrl) return null
  const res = await fetch(`${baseUrl}/api/auth/sessions/current`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.user as { id: string; email: string } | null
}

export async function GET(request: Request) {
  try {
    if (!process.env.INSFORGE_ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Falta INSFORGE_ADMIN_API_KEY en el servidor.' },
        { status: 503 }
      )
    }

    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const authUser = await getAuthUserFromToken(accessToken)
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const user = await fetchUsuarioWithAccessToken(authUser.id, accessToken)

    if (!user) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
