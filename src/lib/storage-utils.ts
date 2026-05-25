/**
 * Utilidades para manejo de archivos en InsForge Storage
 */

/**
 * Genera un nombre de archivo único usando timestamp y ID aleatorio
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}-${randomId}.${fileExtension}`
}

/**
 * Construye una ruta única para el archivo
 */
export function buildUniquePath(basePath: string, originalFileName: string): string {
  const uniqueFileName = generateUniqueFileName(originalFileName)
  const pathParts = basePath.split('/')
  pathParts[pathParts.length - 1] = uniqueFileName
  return pathParts.join('/')
}

/**
 * Sube un archivo a storage con nombre único
 */
export async function uploadFileWithUniqueName(
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (path: string, file: File) => Promise<{ data: { path: string } | null; error: { message: string } | null }>
        getPublicUrl: (path: string) => { data: { publicUrl: string } }
      }
    }
  },
  bucket: string,
  file: File,
  basePath: string
): Promise<string> {
  const uniquePath = buildUniquePath(basePath, file.name)
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniquePath, file)

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Error al subir el archivo: ${error.message}`)
  }

  if (!data) {
    throw new Error('No se recibieron datos del archivo subido')
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Extrae la ruta del storage desde una URL completa
 */
export function extractStoragePath(url: string): string | null {
  try {
    // InsForge: .../api/storage/buckets/productos/objects/[path]
    const insforgeParts = url.split('/api/storage/buckets/productos/objects/')
    if (insforgeParts.length === 2) {
      return decodeURIComponent(insforgeParts[1])
    }
    // Supabase legacy: .../storage/v1/object/public/productos/[path]
    const supabaseParts = url.split('/storage/v1/object/public/productos/')
    if (supabaseParts.length === 2) {
      return supabaseParts[1]
    }
    return null
  } catch (error) {
    console.error('Error extrayendo ruta del storage:', error)
    return null
  }
}

/**
 * Elimina múltiples archivos del storage
 */
export async function deleteFilesFromStorage(
  supabase: {
    storage: {
      from: (bucket: string) => {
        remove: (paths: string[]) => Promise<{ error: { message: string } | null }>
      }
    }
  },
  bucket: string,
  filePaths: string[]
): Promise<void> {
  if (filePaths.length === 0) return

  const { error } = await supabase.storage
    .from(bucket)
    .remove(filePaths)

  if (error) {
    console.warn('Error eliminando archivos del storage:', error)
    // No lanzar error para no interrumpir el flujo principal
  }
}
