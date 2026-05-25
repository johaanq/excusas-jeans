import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Buscar Jeans y Productos',
  description:
    'Busca jeans, pantalones y modelos Excusas en excusasjeans.com. Encuentra excusas, excusas jeans y tu talla ideal.',
  path: '/buscar',
})

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return children
}
