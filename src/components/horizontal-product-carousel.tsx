"use client"

import { memo, Suspense } from "react"
import { OriginalProductCard } from "./original-product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Producto } from "@/data/productos"
import { useCarouselContext } from "@/contexts/carousel-context"

// Componente para solo las flechas de navegación
export const NavigationArrows = memo(function NavigationArrows({ 
  scrollLeft, 
  scrollRight, 
  canScrollLeft, 
  canScrollRight 
}: {
  scrollLeft: () => void
  scrollRight: () => void
  canScrollLeft: boolean
  canScrollRight: boolean
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className="border-stone-300 bg-white shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={scrollRight}
        disabled={!canScrollRight}
        className="border-stone-300 bg-white shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
})

interface HorizontalProductCarouselProps {
  productos?: Producto[]
  isLoading?: boolean
  error?: string
}

// Componente de loading simplificado para carousel horizontal
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className="flex-shrink-0 w-44 sm:w-48 md:w-52 lg:w-56 space-y-3 animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Skeleton className="w-full rounded-lg animate-shimmer" style={{ aspectRatio: '4/5' }} />
          <Skeleton className="h-4 w-3/4 mx-auto animate-shimmer" />
          <Skeleton className="h-3 w-1/2 mx-auto animate-shimmer" />
        </div>
      ))}
    </div>
  )
})

// Componente de error simplificado
const ErrorState = memo(function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar productos</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
})

// Componente de estado vacío simplificado
const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
      <p className="text-gray-600">Pronto tendremos nuevos productos para ti</p>
    </div>
  )
})

export function HorizontalProductCarousel({ productos, isLoading, error }: HorizontalProductCarouselProps) {
  const { scrollContainerRef, checkScrollButtons } = useCarouselContext()


  if (error) {
    return <ErrorState error={error} />
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!productos || productos.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative">
      {/* Contenedor de scroll */}
      <div
        ref={scrollContainerRef}
        className="-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-4 pl-1 pr-4 scrollbar-hide sm:gap-4"
        onScroll={checkScrollButtons}
      >
        {productos.map((producto, index) => {
          const delayClass = `delay-${Math.min(index * 100, 1000)}`
          return (
            <div
              key={producto.id}
              className={`flex-shrink-0 w-44 sm:w-48 md:w-52 lg:w-56 animate-slide-up ${delayClass}`}
            >
              <Suspense fallback={
                <div className="space-y-3">
                  <Skeleton className="w-full rounded-lg animate-shimmer" style={{ aspectRatio: '4/5' }} />
                  <Skeleton className="h-4 w-3/4 mx-auto animate-shimmer" />
                  <Skeleton className="h-3 w-1/2 mx-auto animate-shimmer" />
                </div>
              }>
                <OriginalProductCard producto={producto} />
              </Suspense>
            </div>
          )
        })}
      </div>
    </div>
  )
}
