"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { StorePage, StorePageHeader } from "@/components/store/store-layout"
import { useProductos } from "@/hooks/use-productos"
import { Producto } from "@/data/productos"
import { Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const searchTerm = searchParams.get("q") || ""
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { productos, isLoading } = useProductos()

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([])
      return
    }

    setIsSearching(true)
    
    // Simular delay para mejor UX
    const timeoutId = setTimeout(() => {
      const filtered = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, productos])

  return (
    <div className="min-h-screen bg-[var(--store-bg)]">
      <Header />

      <main className="pt-20 sm:pt-24 md:pt-28">
        <StorePage>
          <StorePageHeader
            eyebrow="Excusas Jeans"
            title="Búsqueda"
            description={
              !searchTerm.trim()
                ? "Escribe en la barra superior para encontrar modelos"
                : isSearching
                  ? "Buscando…"
                  : `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? "s" : ""} para “${searchTerm}”`
            }
          />
        {!searchTerm.trim() ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Busca productos
            </h2>
            <p className="text-gray-600 mb-6">
              Usa la barra de búsqueda en el header para encontrar productos
            </p>
            <Button asChild className="rounded-lg">
              <Link href="/catalogo">Ver catálogo completo</Link>
            </Button>
          </div>
        ) : isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h2>
            <p className="text-gray-600 mb-6">
              No hay productos que coincidan con &quot;{searchTerm}&quot;. Intenta con otros términos.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-lg">
                <Link href="/catalogo">Ver catálogo completo</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-stone-300"
                onClick={() => window.history.back()}
              >
                Volver
              </Button>
            </div>
          </div>
        ) : (
          <ProductGrid 
            productos={filteredProducts}
            isLoading={isLoading}
            error={undefined}
          />
        )}
        </StorePage>
      </main>
    </div>
  )
}
