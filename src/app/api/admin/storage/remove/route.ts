import { NextResponse } from 'next/server'
import { verifyAdminCredentials } from '@/lib/admin-verify-server'
import { adminStorageRemove } from '@/lib/insforge-admin-storage'

export const runtime = 'nodejs'

type Body = {
  credentials: { username: string; password: string }
  bucket: string
  paths: string[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const { credentials, bucket, paths } = body

    if (!credentials?.username || !credentials?.password || !bucket || !paths?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (!(await verifyAdminCredentials(credentials.username, credentials.password))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    await adminStorageRemove(bucket, paths)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/storage/remove]', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
