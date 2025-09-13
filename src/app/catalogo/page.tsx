"use client"

import { ProductGrid } from "@/components/product-grid"
import { useSupabaseProductos } from "@/hooks/use-supabase-productos"
import { Header } from "@/components/header"

export default function CatalogoPage() {
  const { productos, isLoading, error } = useSupabaseProductos()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header del Catálogo */}
      <div className="bg-gray-50 border-b pt-20 sm:pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Catálogo Completo</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {isLoading ? "Cargando..." : `Mostrando ${productos.length} productos`}
              </p>
            </div>
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
              <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white w-full xs:w-auto min-w-[180px]">
                <option>Relevancia</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Más recientes</option>
                <option>Mejor valorados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <ProductGrid 
          productos={productos}
          isLoading={isLoading}
          error={error || undefined}
        />

        {/* Paginación */}
        {!isLoading && productos.length > 0 && (
          <div className="flex justify-center items-center mt-6 sm:mt-8 md:mt-12 space-x-1 sm:space-x-2 overflow-x-auto pb-2">
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap" disabled>
              Anterior
            </button>
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm bg-gray-900 text-white rounded-md">1</button>
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">2</button>
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">3</button>
            <span className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm text-gray-500">...</span>
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">10</button>
            <button className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
