/**
 * Subida/borrado de imágenes del panel admin (servidor + INSFORGE_ADMIN_API_KEY).
 * No usar insforgeClient desde el navegador: RLS en storage.objects solo permite project_admin.
 */

import { getAdminCredentials } from '@/lib/admin-api'
import { buildUniquePath } from '@/lib/storage-utils'

export async function adminUploadFile(
  bucket: string,
  file: File,
  basePath: string
): Promise<string> {
  const credentials = getAdminCredentials()
  if (!credentials) {
    throw new Error('Sesión de administrador expirada. Vuelve a iniciar sesión.')
  }

  const uniquePath = buildUniquePath(basePath, file.name)
  const formData = new FormData()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)
  formData.append('bucket', bucket)
  formData.append('path', uniquePath)
  formData.append('file', file)

  const res = await fetch('/api/admin/storage/upload', {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120_000),
  })

  const json = (await res.json()) as { publicUrl?: string; error?: string }
  if (!res.ok) {
    console.error('[admin-storage] upload failed:', json)
    throw new Error(`Error al subir el archivo: ${json.error || 'Error desconocido'}`)
  }

  if (!json.publicUrl) {
    throw new Error('No se recibió la URL pública del archivo')
  }

  return json.publicUrl
}

export async function adminDeleteFiles(bucket: string, filePaths: string[]): Promise<void> {
  if (filePaths.length === 0) return

  const credentials = getAdminCredentials()
  if (!credentials) {
    console.warn('[admin-storage] Sin sesión: no se eliminaron archivos')
    return
  }

  const res = await fetch('/api/admin/storage/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credentials, bucket, paths: filePaths }),
  })

  const json = (await res.json()) as { error?: string }
  if (!res.ok) {
    console.warn('[admin-storage] delete failed:', json.error)
  }
}
