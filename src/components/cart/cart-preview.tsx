"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, MessageCircle, Eye, CreditCard } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils"
import { WHATSAPP_NUMBER_E164 } from "@/lib/site"
import { useUserAuth } from "@/contexts/user-auth-context"
import Image from "next/image"

interface CartPreviewProps {
  isScrolled?: boolean
  onOpenCart?: () => void
}

export function CartPreview({ isScrolled = false, onOpenCart }: CartPreviewProps) {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useUserAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Mostrar preview cuando se agrega un item
  useEffect(() => {
    const handleCartItemAdded = () => {
      setShowPreview(true)
      setIsVisible(true)
      
      // Auto-hide después de 4 segundos
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setShowPreview(false), 300) // Wait for animation
      }, 4000)
    }

    // Listen for custom cart item added event
    if (typeof window !== 'undefined') {
      window.addEventListener('cartItemAdded', handleCartItemAdded)
      return () => {
        window.removeEventListener('cartItemAdded', handleCartItemAdded)
      }
    }
  }, [])

  // Hide preview when navigating between pages
  useEffect(() => {
    setIsVisible(false)
    setShowPreview(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) return

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

    const message = generateWhatsAppMessage(items, customerInfo)
    await openWhatsApp(WHATSAPP_NUMBER_E164, message)
    clearCart()
    setIsVisible(false)
    setTimeout(() => setShowPreview(false), 300)
  }

  const handleOpenCart = () => {
    if (onOpenCart) {
      onOpenCart()
    }
    setIsVisible(false)
    setTimeout(() => setShowPreview(false), 300)
  }

  const lastItem = items[items.length - 1]

  return (
    <div className="relative">
      {/* Cart Icon - Always visible */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={`relative transition-colors hover:bg-transparent ${
          isScrolled
            ? 'text-gray-600 hover:text-gray-700'
            : 'text-white hover:text-white/90'
        }`}
        onClick={handleOpenCart}
      >
        <ShoppingBag className="h-5 w-5" />
        {getTotalItems() > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {getTotalItems()}
          </Badge>
        )}
      </Button>

      {/* Preview Dropdown - Only show when there are items and showPreview is true */}
      {showPreview && items.length > 0 && (
        <div className={`absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Producto agregado</h3>
            <button 
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => setShowPreview(false), 300)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Last Added Item */}
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 relative rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Image
                src="/carritoIMG.png"
                alt="Producto en carrito"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">{lastItem.producto.nombre}</h4>
              <p className="text-xs text-gray-500">
                {lastItem.color.nombre} - Talla {lastItem.talla}
              </p>
              <p className="text-xs text-gray-500">Cantidad: {lastItem.cantidad}</p>
              {lastItem.producto.precio && (
                <p className="text-sm font-medium text-gray-900">S/{lastItem.producto.precio.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'} en el carrito
              </span>
              <span className="font-semibold text-gray-900">S/{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleOpenCart}
              variant="outline" 
              className="w-full"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Carrito
            </Button>
            
            <Button asChild className="w-full" size="sm">
              <Link href="/checkout">
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar en línea
              </Link>
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Consultar por WhatsApp
            </Button>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
