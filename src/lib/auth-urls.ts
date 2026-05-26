import { getAuthEmailRedirectBaseUrl } from './site'

/** Tras hacer clic en el enlace del correo, InsForge redirige al inicio (modal de verificación). */
export const EMAIL_VERIFICATION_REDIRECT_PATH = '/'

export function getEmailVerificationRedirectUrl(): string {
  return getAuthRedirectUrl(EMAIL_VERIFICATION_REDIRECT_PATH)
}

/** URL absoluta para redirects de auth (emails InsForge). Siempre usa NEXT_PUBLIC_APP_URL. */
export function getAuthRedirectUrl(path: string): string {
  const base = getAuthEmailRedirectBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
