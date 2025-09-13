"use client"

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdated: boolean
  registration: ServiceWorkerRegistration | null
}

export function useServiceWorker(): ServiceWorkerState {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdated: false,
    registration: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }))

        // Verificar si hay una actualización disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdated: true }))
              }
            })
          }
        })

        // Escuchar cambios en el Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

      } catch (error) {
        console.error('Error registrando Service Worker:', error)
      }
    }

    registerServiceWorker()
  }, [])

  return state
}

// Hook para manejar actualizaciones del Service Worker
export function useServiceWorkerUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const handleUpdateFound = () => {
      setIsUpdateAvailable(true)
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        handleUpdateFound()
      }
    })

    // Verificar si hay una actualización disponible al cargar
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        handleUpdateFound()
      }
    })
  }, [])

  const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return

    setIsUpdating(true)

    try {
      const registration = await navigator.serviceWorker.ready
      
      if (registration.waiting) {
        // Enviar mensaje al Service Worker para que se active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Error actualizando Service Worker:', error)
      setIsUpdating(false)
    }
  }

  return {
    isUpdateAvailable,
    isUpdating,
    updateServiceWorker,
  }
}

// Hook para limpiar cache del Service Worker
export function useServiceWorkerCache() {
  const clearCache = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Enviar mensaje al Service Worker para limpiar cache
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAN_CACHE' })
      }

      // También limpiar cache del navegador
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )

      console.log('Cache limpiado exitosamente')
    } catch (error) {
      console.error('Error limpiando cache:', error)
    }
  }

  const getCacheSize = async (): Promise<number> => {
    if (!('serviceWorker' in navigator)) return 0

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        totalSize += requests.length
      }

      return totalSize
    } catch (error) {
      console.error('Error obteniendo tamaño del cache:', error)
      return 0
    }
  }

  return {
    clearCache,
    getCacheSize,
  }
}
