// Configuración del Service Worker
export const SW_CONFIG = {
  // Nombre del cache
  CACHE_NAME: 'excusas-jeans-v1',
  STATIC_CACHE: 'static-v1',
  DYNAMIC_CACHE: 'dynamic-v1',
  
  // Duración del cache (en milisegundos)
  CACHE_DURATION: {
    STATIC: 7 * 24 * 60 * 60 * 1000, // 7 días
    DYNAMIC: 24 * 60 * 60 * 1000, // 1 día
    IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 días
  },
  
  // Recursos críticos para precachear
  STATIC_ASSETS: [
    '/',
    '/catalogo',
    '/about',
    '/logo-excusas.png',
    '/carritoIMG.png',
    '/placeholder.svg',
  ],
  
  // Patrones de URLs para diferentes estrategias de cache
  CACHE_PATTERNS: {
    // Cache First: Para recursos estáticos
    STATIC: [
      /\.(?:css|js|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
      /\/_next\/static\//,
    ],
    
    // Network First: Para páginas HTML
    PAGES: [
      /^\/$/,
      /^\/catalogo/,
      /^\/about/,
      /^\/producto\//,
    ],
    
    // Stale While Revalidate: Para APIs
    API: [
      /\/api\//,
    ],
  },
  
  // Configuración de notificaciones push
  PUSH_CONFIG: {
    VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_KEY || '',
    DEFAULT_OPTIONS: {
      body: 'Nuevo contenido disponible',
      icon: '/logo-excusas.png',
      badge: '/logo-excusas.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    },
  },
  
  // Configuración de limpieza de cache
  CLEANUP_CONFIG: {
    MAX_ENTRIES: 50,
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
}

// Función para verificar si una URL coincide con un patrón
export function matchesPattern(url: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(url))
}

// Función para determinar la estrategia de cache para una URL
export function getCacheStrategy(url: string): string {
  if (matchesPattern(url, SW_CONFIG.CACHE_PATTERNS.STATIC)) {
    return 'cache-first'
  }
  
  if (matchesPattern(url, SW_CONFIG.CACHE_PATTERNS.PAGES)) {
    return 'network-first'
  }
  
  if (matchesPattern(url, SW_CONFIG.CACHE_PATTERNS.API)) {
    return 'stale-while-revalidate'
  }
  
  return 'network-first'
}

// Función para obtener la duración del cache para un tipo de recurso
export function getCacheDuration(url: string): number {
  if (matchesPattern(url, [/\.(?:png|jpg|jpeg|gif|svg|ico)$/])) {
    return SW_CONFIG.CACHE_DURATION.IMAGES
  }
  
  if (matchesPattern(url, SW_CONFIG.CACHE_PATTERNS.STATIC)) {
    return SW_CONFIG.CACHE_DURATION.STATIC
  }
  
  return SW_CONFIG.CACHE_DURATION.DYNAMIC
}
