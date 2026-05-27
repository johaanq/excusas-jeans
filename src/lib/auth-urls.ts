import { getAuthEmailRedirectBaseUrl } from './site'

/** Tras hacer clic en el enlace del correo, InsForge redirige a Mi perfil. */
export const EMAIL_VERIFICATION_REDIRECT_PATH = '/perfil'

export function getEmailVerificationRedirectUrl(): string {
  return getAuthRedirectUrl(EMAIL_VERIFICATION_REDIRECT_PATH)
}

function resolveAuthRedirectBase(): string {
  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin
    }
  }
  return getAuthEmailRedirectBaseUrl()
}

/** URL absoluta para redirects de auth (signUp, verificación, reset). */
export function getAuthRedirectUrl(path: string): string {
  const base = resolveAuthRedirectBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
