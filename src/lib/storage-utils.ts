/**
 * Utilidades de rutas/URLs para InsForge Storage (sin subida directa desde el cliente).
 */

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}-${randomId}.${fileExtension}`
}

export function buildUniquePath(basePath: string, originalFileName: string): string {
  const uniqueFileName = generateUniqueFileName(originalFileName)
  const pathParts = basePath.split('/')
  pathParts[pathParts.length - 1] = uniqueFileName
  return pathParts.join('/')
}

export function extractStoragePath(url: string): string | null {
  try {
    const insforgeParts = url.split('/api/storage/buckets/productos/objects/')
    if (insforgeParts.length === 2) {
      return decodeURIComponent(insforgeParts[1])
    }
    const legacyParts = url.split('/storage/v1/object/public/productos/')
    if (legacyParts.length === 2) {
      return legacyParts[1]
    }
    return null
  } catch (error) {
    console.error('Error extrayendo ruta del storage:', error)
    return null
  }
}
