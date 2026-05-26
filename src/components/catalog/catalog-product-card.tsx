"use client"

import { useState, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Producto } from "@/data/productos"

type Props = {
  producto: Producto
  priority?: boolean
}

export const CatalogProductCard = memo(function CatalogProductCard({
  producto,
  priority = false,
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  let mainImage = "/placeholder.svg"
  if (producto.foto_principal?.trim()) {
    mainImage = producto.foto_principal
  } else if (producto.colores?.[0]?.fotos?.[0]?.url) {
    mainImage = producto.colores[0].fotos[0].url
  }

  const onLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const onError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  return (
    <article className="group text-center">
      <Link href={`/producto/${producto.slug}`} className="block">
        <div className="catalog-card-image">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 animate-shimmer bg-stone-200" />
          )}
          <Image
            src={imageError ? "/placeholder.svg" : mainImage}
            alt={producto.nombre}
            fill
            priority={priority}
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={onLoad}
            onError={onError}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        <h2 className="catalog-card-name mt-3 line-clamp-2 px-1 md:mt-4">{producto.nombre}</h2>

        {producto.precio != null && (
          <p className="catalog-card-price mt-1.5">S/. {producto.precio.toFixed(2)}</p>
        )}
      </Link>
    </article>
  )
})
