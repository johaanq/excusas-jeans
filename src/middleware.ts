import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getAdminOrigin,
  isAdminHost,
  isAdminPanelPath,
  toInternalAdminPath,
} from '@/lib/admin-host'

const PUBLIC_FILE = /\.(.*)$/

/** En local (npm run dev) no redirigir /admin ni /login al subdominio de producción. */
function redirectAdminToSubdomain(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const onAdmin = isAdminHost(host)

  if (PUBLIC_FILE.test(pathname) && !pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // ——— Subdominio admin.excusasjeans.com ———
  if (onAdmin) {
    if (pathname === '/login' || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Tienda (/catalogo, /producto, etc.) solo en el dominio principal
    if (!isAdminPanelPath(pathname)) {
      const storeBase =
        process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') ||
        'https://excusasjeans.com'
      const dest = new URL(pathname, storeBase)
      dest.search = request.nextUrl.search
      return NextResponse.redirect(dest)
    }

    // Quitar /admin de la barra de direcciones si alguien lo escribe
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const publicPath = pathname.replace(/^\/admin/, '') || '/'
      return NextResponse.redirect(new URL(publicPath, request.url))
    }

    // Servir panel: / → /admin, /products → /admin/products
    const internal = toInternalAdminPath(pathname)
    if (internal !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = internal
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  }

  // ——— Tienda principal (solo producción): no exponer /admin ———
  if (redirectAdminToSubdomain()) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/login', getAdminOrigin()))
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const publicPath = pathname.replace(/^\/admin/, '') || '/'
      return NextResponse.redirect(new URL(publicPath, getAdminOrigin()))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
