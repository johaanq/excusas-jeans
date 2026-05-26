/**
 * Subida a InsForge Storage con API key de admin (solo servidor).
 */

type UploadStrategy = {
  method: 'presigned' | 'direct'
  uploadUrl?: string
  key?: string
  fields?: Record<string, string>
  confirmRequired?: boolean
  confirmUrl?: string
}

function getStorageConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL?.replace(/\/$/, '')
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY?.trim()
  if (!baseUrl || !adminKey) {
    throw new Error('Faltan NEXT_PUBLIC_INSFORGE_URL o INSFORGE_ADMIN_API_KEY')
  }
  return { baseUrl, adminKey }
}

function resolveApiUrl(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  return `${baseUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export function getPublicObjectUrl(bucket: string, objectPath: string): string {
  const { baseUrl } = getStorageConfig()
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/')
  return `${baseUrl}/api/storage/buckets/${bucket}/objects/${encoded}`
}

async function uploadPresigned(
  bucket: string,
  baseUrl: string,
  adminKey: string,
  strategy: UploadStrategy,
  file: Blob,
  contentType: string,
  fallbackPath: string
): Promise<string> {
  if (!strategy.uploadUrl) {
    throw new Error('Estrategia presigned sin uploadUrl')
  }

  const formData = new FormData()
  if (strategy.fields) {
    for (const [key, value] of Object.entries(strategy.fields)) {
      formData.append(key, value)
    }
  }
  formData.append('file', file)

  const uploadRes = await fetch(strategy.uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    const detail = await uploadRes.text()
    throw new Error(detail || `Presigned upload failed: ${uploadRes.status}`)
  }

  if (strategy.confirmRequired && strategy.confirmUrl) {
    const confirmRes = await fetch(resolveApiUrl(baseUrl, strategy.confirmUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        size: file.size,
        contentType: contentType || 'application/octet-stream',
      }),
    })
    if (!confirmRes.ok) {
      const detail = await confirmRes.text()
      throw new Error(detail || `Upload confirm failed: ${confirmRes.status}`)
    }
  }

  return getPublicObjectUrl(bucket, strategy.key ?? fallbackPath)
}

export async function adminStorageUpload(
  bucket: string,
  path: string,
  file: Blob,
  contentType: string
): Promise<string> {
  const { baseUrl, adminKey } = getStorageConfig()
  const auth = { Authorization: `Bearer ${adminKey}` }

  const strategyRes = await fetch(`${baseUrl}/api/storage/buckets/${bucket}/upload-strategy`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: path,
      contentType: contentType || 'application/octet-stream',
      size: file.size,
    }),
  })

  if (!strategyRes.ok) {
    const detail = await strategyRes.text()
    throw new Error(detail || `upload-strategy: ${strategyRes.status}`)
  }

  const strategy = (await strategyRes.json()) as UploadStrategy

  if (strategy.method === 'presigned') {
    return uploadPresigned(bucket, baseUrl, adminKey, strategy, file, contentType, path)
  }

  if (strategy.method === 'direct') {
    const formData = new FormData()
    formData.append('file', file)

    const objectUrl = `${baseUrl}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(path)}`
    const uploadRes = await fetch(objectUrl, {
      method: 'PUT',
      headers: auth,
      body: formData,
    })

    if (!uploadRes.ok) {
      const detail = await uploadRes.text()
      throw new Error(detail || `direct upload: ${uploadRes.status}`)
    }

    return getPublicObjectUrl(bucket, path)
  }

  throw new Error(`Método de subida no soportado: ${strategy.method}`)
}

export async function adminStorageRemove(bucket: string, paths: string[]): Promise<void> {
  const { baseUrl, adminKey } = getStorageConfig()
  const auth = { Authorization: `Bearer ${adminKey}` }

  for (const path of paths) {
    const res = await fetch(
      `${baseUrl}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(path)}`,
      { method: 'DELETE', headers: auth }
    )
    if (!res.ok) {
      const detail = await res.text()
      throw new Error(detail || `delete: ${res.status}`)
    }
  }
}
