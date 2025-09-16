"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Producto } from "@/data/productos"

interface OriginalProductCardProps {
  producto: Producto
}

export const OriginalProductCard = memo(function OriginalProductCard({ producto }: OriginalProductCardProps) {
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
    <div className="group cursor-pointer">
      {/* Imagen clickeable */}
      <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-3" style={{ aspectRatio: '4/5' }}>
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

      {/* Nombre centrado */}
      <div className="text-center mb-2">
        <Link href={`/producto/${producto.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>
      </div>

      {/* Precio centrado */}
      <div className="text-center">
        {producto.precio && (
          <span className="text-sm font-semibold text-gray-900">
            S/{producto.precio.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )
})
