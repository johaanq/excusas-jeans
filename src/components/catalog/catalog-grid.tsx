"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { Producto } from "@/data/productos"
import { CatalogProductCard } from "./catalog-product-card"

type Props = {
  productos?: Producto[]
  isLoading?: boolean
  error?: string
}

function CatalogSkeleton() {
  return (
    <div className="catalog-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="catalog-card-image rounded-none" />
          <Skeleton className="mx-auto mt-3 h-3 w-4/5" />
          <Skeleton className="mx-auto mt-2 h-3 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export function CatalogGrid({ productos, isLoading, error }: Props) {
  if (error) {
    return (
      <p className="py-20 text-center text-sm text-stone-600">
        No pudimos cargar el catálogo. Intenta de nuevo en un momento.
      </p>
    )
  }

  if (isLoading) return <CatalogSkeleton />

  if (!productos?.length) {
    return (
      <p className="py-20 text-center text-sm text-stone-500">No hay productos para mostrar.</p>
    )
  }

  return (
    <div className="catalog-grid">
      {productos.map((producto, index) => (
        <CatalogProductCard key={producto.id} producto={producto} priority={index < 8} />
      ))}
    </div>
  )
}
