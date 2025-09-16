"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProductos } from "@/hooks/use-productos"
import { Producto } from "@/data/productos"
import Link from "next/link"
import Image from "next/image"

interface SearchBarProps {
  isScrolled: boolean
}

export function SearchBar({ isScrolled }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Producto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { productos } = useProductos()

  // Cerrar el dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
        setSearchResults([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // Simular delay para mejor UX
    const timeoutId = setTimeout(() => {
      const filtered = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, productos])

  const handleSearchClick = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    inputRef.current?.focus()
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Botón de búsqueda */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSearchClick}
        className={`transition-colors ${
          isScrolled 
            ? 'text-gray-600 hover:text-gray-900' 
            : 'text-white hover:text-gray-200'
        }`}
        title="Buscar productos"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Dropdown de búsqueda */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Buscando...
              </div>
            ) : searchTerm.trim().length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Escribe para buscar productos
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No se encontraron productos con "{searchTerm}"
              </div>
            ) : (
              <div className="py-2">
                {searchResults.slice(0, 6).map((producto) => (
                  <Link
                    key={producto.id}
                    href={`/producto/${producto.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={producto.foto_principal || "/placeholder.svg"}
                        alt={producto.nombre}
                        fill
                        className="object-cover rounded-md"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {producto.nombre}
                      </h4>
                      {producto.precio && (
                        <p className="text-sm text-gray-600">
                          S/ {producto.precio.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
                
                {searchResults.length > 6 && (
                  <div className="p-3 border-t border-gray-100">
                    <Link
                      href={`/buscar?q=${encodeURIComponent(searchTerm)}`}
                      onClick={handleResultClick}
                      className="text-sm text-gray-600 hover:text-gray-900 text-center block"
                    >
                      Ver todos los resultados ({searchResults.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
