"use client"

import { CatalogGrid } from "@/components/catalog/catalog-grid"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"

export default function CatalogoPage() {
  const { productos, isLoading, error } = useProductos()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="store-container-catalog pt-20 sm:pt-24 md:pt-28 pb-16 md:pb-24">
        <h1 className="sr-only">Catálogo Excusas Jeans</h1>
        <CatalogGrid
          productos={productos}
          isLoading={isLoading}
          error={error || undefined}
        />
      </main>
    </div>
  )
}
