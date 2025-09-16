"use client"

import { useState, useMemo } from "react"
import { SimpleFeaturedProducts } from "@/components/simple-featured-products"
import { useSupabaseProductos } from "@/hooks/use-supabase-productos"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type SortOption = 'relevancia' | 'precio_asc' | 'precio_desc' | 'recientes' | 'nombre_asc'

export default function CatalogoPage() {
  const { productos, isLoading, error } = useSupabaseProductos()
  const [sortBy, setSortBy] = useState<SortOption>('relevancia')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 20

  // Ordenar productos
  const sortedProductos = useMemo(() => {
    if (!productos) return []
    
    const sorted = [...productos]
    
    switch (sortBy) {
      case 'precio_asc':
        return sorted.sort((a, b) => (a.precio || 0) - (b.precio || 0))
      case 'precio_desc':
        return sorted.sort((a, b) => (b.precio || 0) - (a.precio || 0))
      case 'recientes':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'nombre_asc':
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre))
      default:
        return sorted
    }
  }, [productos, sortBy])

  // Paginación
  const totalPages = Math.ceil(sortedProductos.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProductos = sortedProductos.slice(startIndex, endIndex)

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2"
        >
          1
        </Button>
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        )
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="px-3 py-2"
        >
          {i}
        </Button>
      )
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        )
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2"
        >
          {totalPages}
        </Button>
      )
    }

    return pages
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header del Catálogo */}
      <div className="bg-white pt-20 sm:pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 animate-slide-up delay-200 mb-2">
              Catálogo Completo
            </h1>
            <p className="text-gray-600 text-sm sm:text-base animate-slide-up delay-300">
              {isLoading ? "Cargando..." : `Mostrando ${currentProductos.length} de ${sortedProductos.length} productos`}
            </p>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 animate-slide-up delay-400">
            <span className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white min-w-[180px]"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="recientes">Más recientes</option>
              <option value="nombre_asc">Nombre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <SimpleFeaturedProducts 
          productos={currentProductos}
          isLoading={isLoading}
          error={error || undefined}
        />

        {/* Paginación */}
        {!isLoading && sortedProductos.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 md:mt-16">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {renderPagination()}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
