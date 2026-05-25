import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Catálogo de Jeans | Excusas Jeans',
  description:
    'Catálogo Excusas Jeans: pantalones, jeans mujer y hombre, tallas y colores. Compra en excusasjeans.com. Busca excusas, excusas jeans o jeans en Perú.',
  path: '/catalogo',
  keywords: [
    'catálogo jeans',
    'excusas jeans catálogo',
    'jeans excusas',
    'comprar jeans Perú',
    'excusasjeans',
  ],
})

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return children
}
