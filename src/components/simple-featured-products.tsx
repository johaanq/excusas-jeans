"use client"

import { memo, Suspense } from "react"
import { OriginalProductCard } from "./original-product-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Producto } from "@/data/productos"

interface SimpleFeaturedProductsProps {
  productos?: Producto[]
  isLoading?: boolean
  error?: string
}

// Componente de loading simplificado
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="space-y-3 animate-fade-in-up"
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

export function SimpleFeaturedProducts({ productos, isLoading, error }: SimpleFeaturedProductsProps) {
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
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {productos.map((producto, index) => {
        const delayClass = `delay-${Math.min(index * 100, 1000)}`
        return (
          <div
            key={producto.id}
            className={`animate-slide-up ${delayClass}`}
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
  )
}
