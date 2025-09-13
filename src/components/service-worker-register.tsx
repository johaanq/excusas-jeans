"use client"

import { useEffect } from 'react'
import { useServiceWorker } from '@/hooks/use-service-worker'

export function ServiceWorkerRegister() {
  const { isSupported, isRegistered, isUpdated } = useServiceWorker()

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('Service Worker registrado exitosamente')
    }
  }, [isSupported, isRegistered])

  useEffect(() => {
    if (isUpdated) {
      console.log('Nueva versión del Service Worker disponible')
      
      // Opcional: Mostrar notificación al usuario
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Nueva versión disponible', {
            body: 'La aplicación se actualizará automáticamente',
            icon: '/logo-excusas.png',
          })
        }
      }
    }
  }, [isUpdated])

  // Este componente no renderiza nada visible
  return null
}
