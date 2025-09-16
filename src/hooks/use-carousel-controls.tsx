"use client"

import { useState, useRef, useCallback } from 'react'

export function useCarouselControls() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }, [])

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      // Calcular el ancho de un card basado en el tamaño de pantalla
      const containerWidth = scrollContainerRef.current.clientWidth
      const isMobile = containerWidth < 640
      const isTablet = containerWidth < 768
      const isDesktop = containerWidth < 1024
      
      let cardWidth: number
      if (isMobile) {
        cardWidth = 176 + 16 // w-44 (176px) + gap-4 (16px)
      } else if (isTablet) {
        cardWidth = 192 + 16 // w-48 (192px) + gap-4 (16px)
      } else if (isDesktop) {
        cardWidth = 208 + 16 // w-52 (208px) + gap-4 (16px)
      } else {
        cardWidth = 224 + 16 // w-56 (224px) + gap-4 (16px)
      }
      
      scrollContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      })
    }
  }, [])

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      // Calcular el ancho de un card basado en el tamaño de pantalla
      const containerWidth = scrollContainerRef.current.clientWidth
      const isMobile = containerWidth < 640
      const isTablet = containerWidth < 768
      const isDesktop = containerWidth < 1024
      
      let cardWidth: number
      if (isMobile) {
        cardWidth = 176 + 16 // w-44 (176px) + gap-4 (16px)
      } else if (isTablet) {
        cardWidth = 192 + 16 // w-48 (192px) + gap-4 (16px)
      } else if (isDesktop) {
        cardWidth = 208 + 16 // w-52 (208px) + gap-4 (16px)
      } else {
        cardWidth = 224 + 16 // w-56 (224px) + gap-4 (16px)
      }
      
      scrollContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      })
    }
  }, [])

  return {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    checkScrollButtons,
    scrollLeft,
    scrollRight
  }
}
