"use client"

import { memo, Suspense } from "react"
import { ProductCard } from "./product-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Producto } from "@/data/productos"


interface FeaturedProductsProps {
  productos?: Producto[]
  isLoading?: boolean
  error?: string
}

// Componente de loading mejorado con animaciones
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div 
        key={i} 
        className="space-y-4 animate-fade-in-up"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="aspect-square w-full rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full animate-shimmer" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4 animate-shimmer" />
          <Skeleton className="h-4 w-1/2 animate-shimmer" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded animate-shimmer" />
            <Skeleton className="h-8 w-20 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    ))}
  </div>
  )
})

// Componente de error mejorado
const ErrorState = memo(function ErrorState({ error }: { error: string }) {
  return (
  <div className="text-center py-16 animate-fade-in-up">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
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

// Componente de estado vacío mejorado
const EmptyState = memo(function EmptyState() {
  return (
  <div className="text-center py-16 animate-fade-in-up">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
    <p className="text-gray-600 mb-4">Pronto tendremos nuevos productos para ti</p>
    <a 
      href="/catalogo" 
      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-block"
    >
      Ver catálogo completo
    </a>
  </div>
  )
})

export function FeaturedProducts({ productos, isLoading, error }: FeaturedProductsProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {productos.map((producto, index) => (
        <div
          key={producto.id}
          className="animate-fade-in-up hover-lift"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg animate-shimmer" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 animate-shimmer" />
                <Skeleton className="h-4 w-1/2 animate-shimmer" />
              </div>
            </div>
          }>
            <ProductCard producto={producto} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}
