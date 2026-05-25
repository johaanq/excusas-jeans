/** Configuración central del sitio (SEO, URLs canónicas, marca). */
export const SITE_NAME = 'Excusas Jeans'
export const SITE_DOMAIN = 'excusasjeans.com'

const DEFAULT_SITE_URL = `https://${SITE_DOMAIN}`

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!url) return DEFAULT_SITE_URL
  return url.replace(/\/$/, '')
}

/** Variantes de marca que queremos asociar en buscadores. */
export const SITE_ALTERNATE_NAMES = [
  'Excusas Jeans',
  'Excusas',
  'excusas jeans',
  'excusas-jeans',
  'excusasjeans',
  'excusasjeans.com',
  'jeans Excusas',
  'tienda Excusas Jeans',
  'ropa jeans Perú',
  'jeans Perú',
] as const

export const SEO_KEYWORDS = [
  'excusas jeans',
  'excusas',
  'jeans',
  'excusas-jeans',
  'excusasjeans',
  'excusasjeans.com',
  'tienda de jeans',
  'jeans mujer',
  'jeans hombre',
  'jeans Perú',
  'ropa jeans',
  'moda jeans',
  'comprar jeans',
  'catálogo jeans',
  'Excusas Jeans Perú',
  'jeans al por mayor',
  'jeans mayorista',
] as const

export const DEFAULT_DESCRIPTION =
  'Excusas Jeans (excusasjeans.com): tienda online de jeans y moda en Perú. Catálogo de pantalones, tallas y colores. Compra por WhatsApp. Busca excusas, excusas jeans o jeans en un solo lugar.'
