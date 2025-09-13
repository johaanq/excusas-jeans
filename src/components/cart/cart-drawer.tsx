"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingBag, Plus, Minus, Trash2, MessageCircle } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils"
import Image from "next/image"
import { useUserAuth } from "@/contexts/user-auth-context"

export function CartDrawer() {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useUserAuth()
  const [isOpen, setIsOpen] = useState(false)

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
    await openWhatsApp('51934762253', message)
    clearCart()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.producto.id}-${item.color.id}-${item.talla}`}
                    className="flex gap-4 p-4 border border-border rounded-lg"
                  >
                    <div className="w-20 h-20 relative rounded-lg bg-gray-100 flex items-center justify-center">
                      <Image
                        src="/carritoIMG.png"
                        alt="Producto en carrito"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium line-clamp-1">{item.producto.nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.color.nombre} - Talla {item.talla}
                        </p>
                        {item.producto.precio && (
                          <p className="text-sm font-medium">S/{item.producto.precio.toFixed(2)}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.producto.id, item.color.id, item.talla, item.cantidad - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.producto.id, item.color.id, item.talla, item.cantidad + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.producto.id, item.color.id, item.talla)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">S/{getTotalPrice().toFixed(2)}</span>
                </div>

                <Button onClick={handleWhatsAppOrder} className="w-full bg-green-500 hover:bg-green-600" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Pedir por WhatsApp
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
