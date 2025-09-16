"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useCarouselControls } from '@/hooks/use-carousel-controls'

interface CarouselContextType {
  scrollContainerRef: React.RefObject<HTMLDivElement>
  canScrollLeft: boolean
  canScrollRight: boolean
  checkScrollButtons: () => void
  scrollLeft: () => void
  scrollRight: () => void
}

const CarouselContext = createContext<CarouselContextType | null>(null)

interface CarouselProviderProps {
  children: ReactNode
}

export function CarouselProvider({ children }: CarouselProviderProps) {
  const controls = useCarouselControls()
  
  return (
    <CarouselContext.Provider value={controls}>
      {children}
    </CarouselContext.Provider>
  )
}

export function useCarouselContext() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarouselContext must be used within a CarouselProvider')
  }
  return context
}
