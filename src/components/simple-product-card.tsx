"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Producto } from "@/data/productos"

interface SimpleProductCardProps {
  producto: Producto
}

export const SimpleProductCard = memo(function SimpleProductCard({ producto }: SimpleProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Usar SOLO la imagen principal del producto, si no hay, usar placeholder
  let mainImage = "/placeholder.svg"
  
  if (producto.foto_principal && producto.foto_principal.trim() !== '') {
    mainImage = producto.foto_principal
  } else if (producto.colores && producto.colores.length > 0 && producto.colores[0].fotos && producto.colores[0].fotos.length > 0) {
    // Fallback a primera imagen del primer color si no hay foto principal
    mainImage = producto.colores[0].fotos[0].url
  }

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  return (
    <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Imagen clickeable */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/5' }}>
        <Link href={`/producto/${producto.slug}`} className="block h-full">
          <div className="relative w-full h-full">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-shimmer"></div>
            )}
            <Image
              src={imageError ? "/placeholder.svg" : mainImage}
              alt={producto.nombre}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
            />
          </div>
        </Link>
      </div>

      {/* Contenido del card */}
      <div className="p-4">
        {/* Nombre */}
        <div className="mb-3">
          <Link href={`/producto/${producto.slug}`}>
            <h3 className="text-base font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 leading-tight">
              {producto.nombre}
            </h3>
          </Link>
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between">
          {producto.precio && (
            <span className="text-lg font-bold text-gray-900">
              S/{producto.precio.toFixed(2)}
            </span>
          )}
          {producto.precio_mayor && producto.precio_mayor !== producto.precio && (
            <span className="text-sm text-gray-500 line-through">
              S/{producto.precio_mayor.toFixed(2)}
            </span>
          )}
        </div>

        {/* Colores disponibles */}
        {producto.colores && producto.colores.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {producto.colores.slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {color.nombre}
                </span>
              ))}
              {producto.colores.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{producto.colores.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
