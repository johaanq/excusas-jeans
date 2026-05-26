"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Producto } from "@/data/productos"

interface OriginalProductCardProps {
  producto: Producto
}

export const OriginalProductCard = memo(function OriginalProductCard({
  producto,
}: OriginalProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  let mainImage = "/placeholder.svg"

  if (producto.foto_principal?.trim()) {
    mainImage = producto.foto_principal
  } else if (producto.colores?.[0]?.fotos?.[0]?.url) {
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
    <article className="group">
      <Link
        href={`/producto/${producto.slug}`}
        className="relative mb-3 block aspect-[4/5] overflow-hidden rounded-lg bg-stone-100"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-shimmer bg-stone-200" />
        )}
        <Image
          src={imageError ? "/placeholder.svg" : mainImage}
          alt={producto.nombre}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </Link>

      <Link href={`/producto/${producto.slug}`} className="block">
        <h3 className="store-type-name line-clamp-2">{producto.nombre}</h3>
      </Link>

      {producto.precio != null && (
        <p className="store-type-price">S/ {producto.precio.toFixed(2)}</p>
      )}
    </article>
  )
})
