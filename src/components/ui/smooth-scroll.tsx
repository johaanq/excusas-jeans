"use client"

import { useEffect } from 'react'

interface SmoothScrollProps {
  children: React.ReactNode
  className?: string
}

export function SmoothScroll({ children, className }: SmoothScrollProps) {
  useEffect(() => {
    // Habilitar scroll suave en el navegador
    document.documentElement.style.scrollBehavior = 'smooth'
    
    return () => {
      // Limpiar al desmontar
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return <div className={className}>{children}</div>
}

// Hook para scroll suave programático
export function useSmoothScroll() {
  const scrollTo = (elementId: string, offset = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return { scrollTo, scrollToTop }
}
