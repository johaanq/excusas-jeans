"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/ui/safe-image"
// Tabs removed for simplicity
// Dialog removed for simplicity
import { ArrowLeft, Share2, MessageCircle, Plus, Minus, ShoppingCart } from "lucide-react"
import { type Producto } from "@/data/productos"
import { type CartItem } from "@/hooks/use-cart"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { useUserAuth } from "@/contexts/user-auth-context"
import { ClientOnly } from "@/components/ui/client-only"

interface ProductDetailProps {
  producto: Producto
}

function ProductDetailContent({ producto }: ProductDetailProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(-1) // -1 = sin color seleccionado
  const [selectedTalla, setSelectedTalla] = useState<string>("")
  const [cantidad, setCantidad] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0) // Siempre empezar con la foto principal

  const { addItem } = useCart()
  const { user, isAuthenticated } = useUserAuth()
  const selectedColor = selectedColorIndex >= 0 ? producto.colores[selectedColorIndex] : null
  
  // Crear un array con todas las imágenes: foto principal + fotos de todos los colores
  const allImages = useMemo(() => {
    const images = []
    
    // Agregar foto principal primero si existe
    if (producto.foto_principal) {
      images.push({
        url: producto.foto_principal,
        alt: `${producto.nombre} - Imagen principal`,
        type: 'principal',
        colorId: null,
        colorName: 'Principal'
      })
    }
    
    // Agregar fotos de todos los colores
    producto.colores.forEach(color => {
      if (color.fotos && color.fotos.length > 0) {
        color.fotos.forEach((foto, index) => {
          images.push({
            url: foto.url,
            alt: `${producto.nombre} - ${color.nombre} - Foto ${index + 1}`,
            type: 'color',
            colorId: color.id,
            colorName: color.nombre,
            fotoIndex: index
          })
        })
      }
    })
    
    return images
  }, [producto])
  
  // Imagen principal actual
  const mainImage = allImages[selectedImageIndex]?.url || "/placeholder.svg"
  

  // Cuando cambia el color seleccionado, cambiar a la primera foto de ese color
  useEffect(() => {
    if (selectedColor && selectedColor.fotos && selectedColor.fotos.length > 0) {
      // Buscar el índice de la primera foto de este color en allImages
      const colorFirstPhotoIndex = allImages.findIndex(img => 
        img.type === 'color' && img.colorId === selectedColor.id
      )
      
      if (colorFirstPhotoIndex !== -1) {
        setSelectedImageIndex(colorFirstPhotoIndex)
      }
    } else if (selectedColorIndex === -1) {
      // Si no hay color seleccionado, volver a la foto principal
      setSelectedImageIndex(0)
    }
  }, [selectedColor, allImages, selectedColorIndex])

  // Check if selected size is in stock
  const selectedTallaObj = producto.tallas.find((t) => t.talla === selectedTalla)
  const isInStock = selectedTallaObj?.en_stock || false

  const handleAddToCart = async () => {
    if (!selectedTalla || !isInStock || !selectedColor) {
      if (!selectedColor) {
        alert('Por favor selecciona un color antes de agregar al carrito')
      }
      return
    }

    // Crear un producto temporal con el precio correcto según la cantidad
    const productoConPrecioCorrecto = {
      ...producto,
      precio: cantidad >= 4 && producto.precio_mayor ? producto.precio_mayor : producto.precio
    }

    
    await addItem(productoConPrecioCorrecto, selectedColor, selectedTalla, cantidad)
    // Reset form
    setCantidad(1)
    alert('Producto agregado al carrito!')
  }

  const handleWhatsAppOrder = async () => {
    if (!selectedTalla || !selectedColor) {
      if (!selectedColor) {
        alert('Por favor selecciona un color antes de continuar')
      }
      return
    }

    // Crear un producto temporal con el precio correcto según la cantidad
    const productoConPrecioCorrecto = {
      ...producto,
      precio: cantidad >= 4 && producto.precio_mayor ? producto.precio_mayor : producto.precio
    }

    const cartItem: CartItem = {
      producto: productoConPrecioCorrecto,
      color: selectedColor,
      talla: selectedTalla,
      cantidad,
    }

    // Usar información del perfil si está disponible
    const customerInfo = isAuthenticated ? {
      nombre: user?.nombre || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      provincia: user?.provincia || '',
      distrito: user?.distrito || '',
      direccion: user?.direccion || '',
      referencia: user?.referencia || '',
      codigo_postal: user?.codigo_postal || '',
      empresa_envio: user?.empresa_envio || '',
      sede_envio: user?.sede_envio || ''
    } : undefined

    const message = generateWhatsAppMessage([cartItem], customerInfo)
    await openWhatsApp('51934762253', message)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1 inline" />
          Volver al catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Imagen principal grande */}
          <div className="aspect-square relative overflow-hidden rounded-lg border border-border">
            {/* Usar imagen normal para debug */}
            <img
              key={`main-image-${selectedImageIndex}-${mainImage}`}
              src={mainImage}
              alt={allImages[selectedImageIndex]?.alt || `${producto.nombre} - Imagen principal`}
              className="w-full h-full object-cover"
            />
            
            {/* Indicador de imagen actual */}
            {allImages.length > 1 && (
              <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}
            
          </div>

          {/* Thumbnails de todas las imágenes */}
          {allImages.length > 1 && (
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={`${image.colorId || 'principal'}-${index}`}
                    className={`relative aspect-square w-20 h-20 rounded-lg border overflow-hidden flex-shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary scale-105" 
                        : "border-border hover:border-primary"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    title={image.alt}
                  >
                    <SafeImage
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guía de Medidas */}
          {producto.fotos_medidas && producto.fotos_medidas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Guía de Medidas:</h4>
              <div className="aspect-square relative overflow-hidden rounded-lg border border-border max-w-xs">
                <img
                  src={producto.fotos_medidas[0].url}
                  alt={`Guía de medidas - ${producto.nombre}`}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Consulta esta guía para elegir la talla correcta
              </p>
            </div>
          )}

        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{producto.nombre}</h1>
            <p className="text-lg text-muted-foreground">{producto.descripcion}</p>
          </div>

          {/* Precio dinámico */}
          <div className="space-y-2">
            {producto.precio && (
              <div className="text-3xl font-bold text-primary">
                S/{cantidad >= 4 && producto.precio_mayor ? producto.precio_mayor.toFixed(2) : producto.precio.toFixed(2)}
              </div>
            )}
            {cantidad >= 4 && producto.precio_mayor && (
              <div className="text-sm text-green-600 font-medium">
                ✅ Precio por mayor aplicado (4+ unidades)
              </div>
            )}
            {cantidad < 4 && producto.precio_mayor && (
              <div className="text-sm text-muted-foreground">
                💡 Precio por mayor disponible desde 4 unidades
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              Color: {selectedColor ? selectedColor.nombre : "Talla"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {producto.colores.map((color, index) => (
                <Button
                  key={color.id}
                  variant={selectedColorIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedColorIndex(index)}
                  className="min-w-fit"
                >
                  {color.nombre}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedColor ? "Color seleccionado" : "Selecciona un color para ver sus fotos"}
            </p>
          </div>


          {/* Size Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Talla</h3>

            <div className="grid grid-cols-5 gap-2">
              {producto.tallas.map((talla) => (
                <Button
                  key={talla.id}
                  variant={selectedTalla === talla.talla ? "default" : "outline"}
                  className={`${!talla.en_stock ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!talla.en_stock}
                  onClick={() => setSelectedTalla(talla.talla)}
                >
                  {talla.talla}
                  {!talla.en_stock && <span className="ml-1 text-xs">✕</span>}
                </Button>
              ))}
            </div>
            
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Cantidad</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{cantidad}</span>
              <Button variant="outline" size="icon" onClick={() => setCantidad(cantidad + 1)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={!selectedTalla || !isInStock || !selectedColor}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al Carrito
              </Button>

              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                size="lg"
                onClick={handleWhatsAppOrder}
                disabled={!selectedTalla || !isInStock || !selectedColor}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stock Status */}
          {selectedTalla && (
            <div className="p-4 rounded-lg bg-muted/50">
              {isInStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">En stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Agotado en esta talla</span>
                </div>
              )}
            </div>
          )}

          {/* Puntos Importantes */}
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <h3 className="font-semibold mb-4 text-red-600">⚠️ PUNTOS IMPORTANTES</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <p><strong>EL PRECIO POR MAYOR ES A PARTIR DE 4 UNIDADES DE UN SOLO MODELO</strong> (SE COMBINA TALLAS Y COLORES).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <p><strong>SI DESEA 3 MODELOS DIFERENTES SOLO OBTIENES DESCUENTO.</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <p><strong>NO HAY CAMBIO DE TALLA NI COLOR UNA VEZ ABIERTO EL OJAL DE LA PRENDA.</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <p><strong>FIJARSE EN LAS TALLAS Y COLORES QUE SE ESPECIFICAN AL LADO DERECHO.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetail({ producto }: ProductDetailProps) {
  return (
    <ClientOnly fallback={
      <div className="max-w-7xl mx-auto">
        {/* Skeleton loading para el producto */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Skeleton para la imagen */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex gap-2">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Skeleton para la información */}
          <div className="lg:w-1/2 space-y-6">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductDetailContent producto={producto} />
    </ClientOnly>
  )
}
