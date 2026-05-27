/** Configuración central del sitio (SEO, URLs canónicas, marca). */
export const SITE_NAME = 'Excusas Jeans'
export const SITE_DOMAIN = 'excusasjeans.com'

/** WhatsApp Perú — 931 570 435 */
export const WHATSAPP_NUMBER_E164 = '51931570435'
export const WHATSAPP_NUMBER_DISPLAY = '+51 931 570 435'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_E164}`

/** Correo de contacto comercial (visible en footer y páginas legales). */
export const CONTACT_EMAIL = 'ventasexcusas@gmail.com'

export function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || CONTACT_EMAIL
}

/** Video promocional del home (CDN; el MP4 local está en .vercelignore). */
const DEFAULT_HERO_VIDEO_URL =
  'https://cdn.discordapp.com/attachments/1308284399061696572/1509056475715338351/video-1-excusas.mp4?ex=6a17c9dc&is=6a16785c&hm=bb6f452bfbcaf57196a5becea08e9264cb093a720f5443e291ae2ece230ad5a5'

export function getHeroVideoUrl(): string {
  return process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || DEFAULT_HERO_VIDEO_URL
}

export type StoreLocation = {
  id: string
  label: string
  street: string
  gallery: string
  unit: string
  floor: string
  district: string
}

/** Locales físicos en Gamarra, La Victoria. */
export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: '1',
    label: 'Local 1',
    street: 'Gamarra 465',
    gallery: 'Galería de los Jeans',
    unit: 'Tda. 127',
    floor: 'Primer piso',
    district: 'La Victoria, Lima',
  },
  {
    id: '2',
    label: 'Local 2',
    street: 'Gamarra 939',
    gallery: 'Galería Damero',
    unit: 'Tda. 212',
    floor: 'Segundo piso alto',
    district: 'La Victoria, Lima',
  },
  {
    id: '3',
    label: 'Local 3',
    street: 'Gamarra 465',
    gallery: 'Galería de los Jeans',
    unit: 'Tda. 212',
    floor: 'Segundo piso',
    district: 'La Victoria, Lima',
  },
]

function formatStoreAddress(store: StoreLocation): string {
  return `${store.street}, ${store.gallery}, ${store.unit}, ${store.floor}, ${store.district}`
}

/** Domicilio comercial principal (legal / Culqi). */
export function getBusinessAddress(): string {
  if (process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim()) {
    return process.env.NEXT_PUBLIC_BUSINESS_ADDRESS.trim()
  }
  return formatStoreAddress(STORE_LOCATIONS[0])
}

export const INSTAGRAM_URL = 'https://www.instagram.com/excusas.jeans/'

const DEFAULT_SITE_URL = `https://${SITE_DOMAIN}`

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!url) return DEFAULT_SITE_URL
  return url.replace(/\/$/, '')
}

/** Redirects en correos de auth: siempre producción (el enlace se abre fuera de localhost). */
export function getAuthEmailRedirectBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    return DEFAULT_SITE_URL
  }
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

export const HERO_IMAGE_ALT =
  'Excusas Jeans — tienda de jeans en Perú | excusasjeans.com'
