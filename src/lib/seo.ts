import type { Metadata } from 'next'
import {
  DEFAULT_DESCRIPTION,
  getSiteUrl,
  SEO_KEYWORDS,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
} from './site'

type PageSeoOptions = {
  title: string
  description?: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
  ogImage?: string
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  keywords = [...SEO_KEYWORDS],
  noIndex = false,
  ogImage = '/logo-excusas.png',
}: PageSeoOptions): Metadata {
  const siteUrl = getSiteUrl()
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const canonicalUrl = `${siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`

  return {
    title,
    description,
    keywords: [...keywords],
    alternates: {
      canonical: canonicalPath || '/',
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'es_PE',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — excusasjeans.com`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const title = SITE_NAME

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s',
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'shopping',
    icons: {
      icon: '/logo-excusas.png',
      shortcut: '/logo-excusas.png',
      apple: '/logo-excusas.png',
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description: DEFAULT_DESCRIPTION,
      url: siteUrl,
      siteName: SITE_NAME,
      locale: 'es_PE',
      type: 'website',
      images: [
        {
          url: '/logo-excusas.png',
          width: 1200,
          height: 630,
          alt: 'Excusas Jeans — tienda de jeans en Perú',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: DEFAULT_DESCRIPTION,
      images: ['/logo-excusas.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
    },
  }
}

export function buildSiteJsonLd() {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: siteUrl,
        logo: `${siteUrl}/logo-excusas.png`,
        description: DEFAULT_DESCRIPTION,
        sameAs: [] as string[],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'es-PE',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/buscar?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ClothingStore',
        '@id': `${siteUrl}/#store`,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: siteUrl,
        image: `${siteUrl}/logo-excusas.png`,
        description:
          'Tienda de jeans Excusas: excusas, excusas jeans, excusas-jeans y excusasjeans.com. Ropa denim y catálogo actualizado.',
        priceRange: '$$',
        currenciesAccepted: 'PEN',
        areaServed: {
          '@type': 'Country',
          name: 'Perú',
        },
      },
    ],
  }
}

export function buildProductJsonLd(product: {
  nombre: string
  slug: string
  descripcion?: string
  precio?: number | null
  foto_principal?: string | null
}) {
  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/producto/${product.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.nombre} | ${SITE_NAME}`,
    description:
      product.descripcion ||
      `${product.nombre} — jeans Excusas Jeans. Compra en excusasjeans.com.`,
    url,
    image: product.foto_principal || `${siteUrl}/logo-excusas.png`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    ...(product.precio
      ? {
          offers: {
            '@type': 'Offer',
            price: product.precio,
            priceCurrency: 'PEN',
            availability: 'https://schema.org/InStock',
            url,
          },
        }
      : {}),
  }
}
