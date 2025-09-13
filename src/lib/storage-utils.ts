/**
 * Utilidades para manejo de archivos en Supabase Storage
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
 * Sube un archivo a Supabase Storage con nombre único
 */
export async function uploadFileWithUniqueName(
  supabase: any,
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
    // La URL de Supabase Storage tiene el formato:
    // https://[project].supabase.co/storage/v1/object/public/productos/[path]
    const urlParts = url.split('/storage/v1/object/public/productos/')
    if (urlParts.length === 2) {
      return urlParts[1]
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
  supabase: any,
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
