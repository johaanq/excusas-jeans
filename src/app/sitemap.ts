import type { MetadataRoute } from 'next'
import { insforge } from '@/lib/insforge'
import { getSiteUrl } from '@/lib/site'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/catalogo', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/buscar', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/ayuda/contacto', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/ayuda/preguntas-frecuentes', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/ayuda/terminos-condiciones', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  try {
    const { data: productos } = await insforge.database
      .from('productos')
      .select('slug, updated_at')
      .eq('estado', 'activo')

    for (const p of productos ?? []) {
      if (!p.slug) continue
      entries.push({
        url: `${siteUrl}/producto/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch {
    // Sitemap estático si la BD no responde en build
  }

  return entries
}
