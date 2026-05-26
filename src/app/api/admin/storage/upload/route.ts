import { NextResponse } from 'next/server'
import { verifyAdminCredentials } from '@/lib/admin-verify-server'
import { adminStorageUpload } from '@/lib/insforge-admin-storage'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')
    const bucket = String(formData.get('bucket') ?? '')
    const path = String(formData.get('path') ?? '')
    const file = formData.get('file')

    if (!username || !password || !bucket || !path || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Datos de subida incompletos' }, { status: 400 })
    }

    if (!(await verifyAdminCredentials(username, password))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const contentType =
      file instanceof File && file.type ? file.type : 'application/octet-stream'

    const publicUrl = await adminStorageUpload(bucket, path, file, contentType)

    return NextResponse.json({ publicUrl, path })
  } catch (err) {
    console.error('[admin/storage/upload]', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
