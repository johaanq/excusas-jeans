"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { useProductos } from "@/hooks/use-productos"
import { Producto } from "@/data/productos"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header de búsqueda */}
      <div className="bg-gray-50 border-b pt-20 sm:pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/catalogo"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver al catálogo</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Resultados de búsqueda
                </h1>
              </div>
              {searchTerm && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {isSearching ? (
                    "Buscando..."
                  ) : (
                    `Mostrando ${filteredProducts.length} resultado${filteredProducts.length !== 1 ? 's' : ''} para "${searchTerm}"`
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {!searchTerm.trim() ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Busca productos
            </h2>
            <p className="text-gray-600 mb-6">
              Usa la barra de búsqueda en el header para encontrar productos
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Ver catálogo completo
            </Link>
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
              No hay productos que coincidan con "{searchTerm}". Intenta con otros términos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Ver catálogo completo
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid 
            productos={filteredProducts}
            isLoading={false}
            error={undefined}
          />
        )}
      </main>
    </div>
  )
}
