export interface AuthActionResult {
  success: boolean
  error?: string
  needsVerification?: boolean
  email?: string
  /** Registro: el correo ya tiene perfil en la tienda (usar inicio de sesión). */
  emailConflict?: boolean
}

export function isEmailVerificationError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('verify') ||
    normalized.includes('verif') ||
    normalized.includes('confirm') ||
    normalized.includes('unverified')
  )
}

export function isUserAlreadyExistsError(message: string, statusCode?: number): boolean {
  if (statusCode === 409) return true
  const normalized = message.toLowerCase()
  return (
    normalized.includes('already exists') ||
    normalized.includes('already registered') ||
    normalized.includes('ya existe') ||
    normalized.includes('duplicate') ||
    normalized.includes('email_exists')
  )
}
