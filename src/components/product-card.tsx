"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye } from "lucide-react"
import type { Producto } from "@/data/productos"

interface ProductCardProps {
  producto: Producto
}

export const ProductCard = memo(function ProductCard({ producto }: ProductCardProps) {
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

  // Check if any size is in stock
  const hasStock = producto.tallas.some((talla) => talla.en_stock)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  return (
    <Card className="group overflow-hidden border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
          <Link href={`/producto/${producto.slug}`} className="block h-full">
            <div className="relative w-full h-full">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-shimmer"></div>
              )}
              <Image
                src={imageError ? "/placeholder.svg" : mainImage}
                alt={producto.nombre}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={false}
              />
            </div>
          </Link>

          {/* Badge de stock */}
          {!hasStock && (
            <Badge variant="destructive" className="absolute top-3 left-3 animate-fade-in-up">
              Agotado
            </Badge>
          )}

          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Link href={`/producto/${producto.slug}`}>
              <Button 
                size="sm" 
                className="bg-white text-gray-900 hover:bg-gray-100 transform scale-90 group-hover:scale-100 transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 flex flex-col flex-grow">
          <div className="flex-grow">
            <Link href={`/producto/${producto.slug}`}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 group-hover:underline text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 flex items-center">
                {producto.nombre}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block h-8 sm:h-10">{producto.descripcion}</p>
          </div>

          <div className="flex items-center justify-between flex-shrink-0">
            {producto.precio && (
              <span className="text-sm sm:text-lg font-bold text-primary">
                S/{producto.precio.toFixed(2)}
              </span>
            )}
            {producto.precio_mayor && producto.precio_mayor !== producto.precio && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                S/{producto.precio_mayor.toFixed(2)}
              </span>
            )}
          </div>

          <Button 
            className="w-full group/btn transition-all duration-300 hover:scale-105 text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0" 
            disabled={!hasStock} 
            asChild={hasStock}
          >
            {hasStock ? (
              <Link href={`/producto/${producto.slug}`}>
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover/btn:animate-pulse" />
                <span className="hidden sm:inline">Ver Producto</span>
                <span className="sm:hidden">Ver</span>
              </Link>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sin Stock</span>
                <span className="sm:hidden">Sin Stock</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})