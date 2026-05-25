"use client"

import { useState } from 'react'
import { useUserAuth } from '@/contexts/user-auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ClientOnly } from '@/components/ui/client-only'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, User, LogIn } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { generateWhatsAppMessage, openWhatsApp } from '@/lib/utils'

interface CartDrawerEnhancedProps {
  isScrolled?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CartDrawerEnhanced({ isScrolled = false, isOpen: externalIsOpen, onOpenChange }: CartDrawerEnhancedProps) {
  const { user, carrito, isAuthenticated, removeFromCart, updateCartItemQuantity, clearCart } = useUserAuth()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen

  const getTotalItems = () => {
    return carrito?.items?.reduce((total, item) => total + item.cantidad, 0) || 0
  }

  const getTotalPrice = () => {
    return carrito?.items?.reduce((total, item) => {
      const precio = item.producto?.precio || 0
      return total + (precio * item.cantidad)
    }, 0) || 0
  }

  const handleWhatsAppClick = async () => {
    // Cerrar el carrito primero
    setIsOpen(false)
    
    setTimeout(async () => {
      // Convertir items del carrito al formato esperado por generateWhatsAppMessage
      const items = carrito?.items?.map(item => ({
        producto: item.producto,
        color: item.color,
        talla: item.talla,
        cantidad: item.cantidad
      })) || []

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

      // Generar mensaje con información del cliente
      const message = generateWhatsAppMessage(items, customerInfo)
      
      // Abrir WhatsApp con la función mejorada
      const phoneNumber = '51934762253'
      await openWhatsApp(phoneNumber, message)
    }, 300)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      updateCartItemQuantity(itemId, newQuantity)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Mi Carrito</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Estado de autenticación */}
          <ClientOnly fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <User className="w-12 h-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Inicia sesión para guardar tu carrito</h3>
              <p className="text-sm text-gray-600 text-center">
                Con una cuenta podrás guardar tus productos favoritos y acceder a ellos desde cualquier dispositivo.
              </p>
              <div className="flex space-x-2">
                <Link href="/cuenta">
                  <Button size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto py-4">
                {!carrito?.items || carrito.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Agrega productos para comenzar tu compra
                    </p>
                    <Link href="/catalogo">
                      <Button onClick={() => setIsOpen(false)}>
                        Ver Catálogo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carrito.items.map((item) => {
                      return (
                        <Card key={item.id} className="p-4">
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                            <div className="w-20 h-20 relative rounded-lg bg-gray-100 flex items-center justify-center">
                              <Image
                                src="/carritoIMG.png"
                                alt="Producto en carrito"
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                            </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.producto?.nombre}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Color: {item.color?.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              Talla: {item.talla}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              S/ {item.producto?.precio}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <span className="text-sm font-medium w-8 text-center">
                                {item.cantidad}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Resumen y acciones */}
              {carrito?.items && carrito.items.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-lg font-bold">S/ {getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={handleWhatsAppClick}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Consultar por WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={clearCart}
                      className="w-full"
                    >
                      Vaciar Carrito
                    </Button>
                  </div>
                </div>
              )}
            </>
            )}
          </ClientOnly>
        </div>
      </SheetContent>
      </Sheet>
    </>
  )
}
