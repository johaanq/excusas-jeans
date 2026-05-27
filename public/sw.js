// Service Worker - cache ligero (sin rutas inválidas ni respuestas 206)
const STATIC_CACHE = 'excusas-static-v2'
const DYNAMIC_CACHE = 'excusas-dynamic-v2'

const STATIC_ASSETS = [
  '/logo-excusas.png',
  '/placeholder.svg',
]

const SKIP_CACHE_PATHS = [
  '/login',
  '/admin',
  '/auth',
  '/api',
  '/_next/webpack-hmr',
]

function shouldSkipRequest(request, url) {
  if (request.method !== 'GET') return true
  if (url.origin !== self.location.origin) return true
  if (SKIP_CACHE_PATHS.some((path) => url.pathname.startsWith(path))) return true
  if (url.pathname.startsWith('/_next/')) return true
  if (request.destination === 'video' || request.destination === 'audio') return true
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url.pathname)) return true
  return false
}

function canCacheResponse(response) {
  if (!response || !response.ok) return false
  if (response.status === 206) return false
  if (response.type === 'opaque') return false
  return true
}

async function safeCachePut(cache, request, response) {
  if (!canCacheResponse(response)) return
  try {
    await cache.put(request, response.clone())
  } catch (err) {
    console.warn('Service Worker: no se pudo cachear', request.url, err)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset)
            if (canCacheResponse(res)) await cache.put(asset, res)
          } catch {
            // ignorar assets que fallen en dev
          }
        })
      )
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (shouldSkipRequest(request, url)) return

  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigateRequest(request))
  }
})

async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    await safeCachePut(cache, request, response)
    return response
  } catch {
    return cached || new Response('', { status: 504 })
  }
}

async function handleNavigateRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)

  try {
    const response = await fetch(request)
    await safeCachePut(cache, request, response)
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    const fallback = await cache.match('/')
    return fallback || new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
