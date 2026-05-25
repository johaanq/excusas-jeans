import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sobre Nosotros | Excusas Jeans',
  description:
    'Conoce Excusas Jeans: marca de jeans en Perú. Historia, calidad y estilo detrás de excusasjeans.com, excusas y nuestra colección denim.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
