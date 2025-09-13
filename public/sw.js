// Service Worker para cache offline y mejor rendimiento
const CACHE_NAME = 'excusas-jeans-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Recursos críticos para cachear
const STATIC_ASSETS = [
  '/',
  '/catalogo',
  '/about',
  '/logo-excusas.png',
  '/carritoIMG.png',
  '/placeholder.svg',
  '/_next/static/css/',
  '/_next/static/js/',
]

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para recursos estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: Para contenido dinámico
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Para recursos que pueden cambiar
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando recursos estáticos')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Instalación completada')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Error en instalación', error)
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
            })
            .map((cacheName) => {
              console.log('Service Worker: Eliminando cache antiguo', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('Service Worker: Activación completada')
        return self.clients.claim()
      })
  )
})

// Interceptación de requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return
  }

  // Estrategia según el tipo de recurso
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
  } else if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleStaticAssetRequest(request))
  } else if (request.method === 'GET') {
    event.respondWith(handlePageRequest(request))
  }
})

// Manejo de imágenes con cache-first
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Error en handleImageRequest:', error)
    return new Response('Error loading image', { status: 500 })
  }
}

// Manejo de assets estáticos con stale-while-revalidate
async function handleStaticAssetRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })

    return cachedResponse || fetchPromise
  } catch (error) {
    console.error('Error en handleStaticAssetRequest:', error)
    return new Response('Error loading asset', { status: 500 })
  }
}

// Manejo de páginas con network-first
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    
    try {
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      
      return networkResponse
    } catch (error) {
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Fallback para páginas HTML
      if (request.headers.get('accept').includes('text/html')) {
        return cache.match('/') || new Response('Offline', { status: 503 })
      }
      
      throw error
    }
  } catch (error) {
    console.error('Error en handlePageRequest:', error)
    return new Response('Error loading page', { status: 500 })
  }
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Limpieza periódica del cache dinámico
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCaches())
  }
})

async function cleanOldCaches() {
  const cache = await caches.open(DYNAMIC_CACHE)
  const requests = await cache.keys()
  
  // Mantener solo los últimos 50 requests
  if (requests.length > 50) {
    const requestsToDelete = requests.slice(0, requests.length - 50)
    await Promise.all(requestsToDelete.map(request => cache.delete(request)))
  }
}

// Notificaciones push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/logo-excusas.png',
      badge: '/logo-excusas.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})
