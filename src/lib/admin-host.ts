/**
 * Rutas públicas del panel en admin.excusasjeans.com (sin prefijo /admin).
 * Internamente Next sigue sirviendo desde src/app/admin/* vía middleware rewrite.
 */

const ADMIN_INTERNAL_PREFIX = '/admin'

/** Host del panel en producción (sin protocolo). */
export function getAdminHost(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_HOST?.trim().toLowerCase() ||
    'admin.excusasjeans.com'
  )
}

export function getAdminOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return `https://${getAdminHost()}`
}

export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false
  const hostname = host.split(':')[0].toLowerCase()
  const adminHostname = getAdminHost().split(':')[0]
  return hostname === adminHostname || hostname === 'admin.localhost'
}

/** Normaliza subruta: "products" | "/products" → "/products" o "/" */
export function normalizeAdminSubpath(subpath: string = ''): string {
  if (!subpath || subpath === '/') return '/'
  return subpath.startsWith('/') ? subpath : `/${subpath}`
}

/**
 * Path para <Link> y router: en subdominio /products, en web principal /admin/products.
 */
export function getAdminPath(subpath: string = '', host?: string | null): string {
  const publicPath = normalizeAdminSubpath(subpath)
  if (publicPath === '/login') return '/login'

  const onAdminHost = host != null ? isAdminHost(host) : false

  if (onAdminHost) {
    return publicPath === '/' ? '/' : publicPath
  }

  if (publicPath === '/') return ADMIN_INTERNAL_PREFIX
  return `${ADMIN_INTERNAL_PREFIX}${publicPath}`
}

/** Convierte pathname visible o interno a ruta interna /admin/... */
export function toInternalAdminPath(pathname: string): string {
  if (pathname === '/login' || pathname.startsWith('/api/')) {
    return pathname
  }
  if (pathname === ADMIN_INTERNAL_PREFIX || pathname.startsWith(`${ADMIN_INTERNAL_PREFIX}/`)) {
    return pathname
  }
  if (pathname === '/') return ADMIN_INTERNAL_PREFIX
  return `${ADMIN_INTERNAL_PREFIX}${pathname}`
}

/** Convierte pathname interno a ruta pública (para meta y breadcrumbs). */
export function toPublicAdminPath(pathname: string): string {
  if (pathname === ADMIN_INTERNAL_PREFIX) return '/'
  if (pathname.startsWith(`${ADMIN_INTERNAL_PREFIX}/`)) {
    return pathname.slice(ADMIN_INTERNAL_PREFIX.length) || '/'
  }
  return pathname
}

export function getAdminPathFromHeaders(headers: Headers): (subpath?: string) => string {
  const host = headers.get('host')
  return (subpath = '') => getAdminPath(subpath, host)
}
