"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { ShoppingBag, MessageCircle, CreditCard } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils"
import { WHATSAPP_NUMBER_E164 } from "@/lib/site"
import { useUserAuth } from "@/contexts/user-auth-context"
import { CartLineItem } from "@/components/cart/cart-line-item"

interface CartDrawerProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CartDrawer({ isOpen = false, onOpenChange }: CartDrawerProps) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } =
    useCart()
  const { user, isAuthenticated } = useUserAuth()

  const close = useCallback(() => onOpenChange?.(false), [onOpenChange])

  const handleWhatsAppOrder = useCallback(async () => {
    if (items.length === 0) return
    const customerInfo = isAuthenticated
      ? {
          nombre: user?.nombre || "",
          dni: user?.dni || "",
          telefono: user?.telefono || "",
          provincia: user?.provincia || "",
          distrito: user?.distrito || "",
          direccion: user?.direccion || "",
          referencia: user?.referencia || "",
          codigo_postal: user?.codigo_postal || "",
          empresa_envio: user?.empresa_envio || "",
          sede_envio: user?.sede_envio || "",
        }
      : undefined

    await openWhatsApp(
      WHATSAPP_NUMBER_E164,
      generateWhatsAppMessage(items, customerInfo)
    )
    close()
  }, [items, isAuthenticated, user, close])

  const itemCountLabel = useMemo(() => {
    if (totalItems === 1) return "1 artículo"
    return `${totalItems} artículos`
  }, [totalItems])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-stone-200 px-5 py-4 text-left">
          <SheetTitle className="text-lg font-semibold text-stone-900">
            Tu carrito
          </SheetTitle>
          {totalItems > 0 && (
            <p className="text-sm text-stone-500">{itemCountLabel}</p>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <ShoppingBag className="h-8 w-8 text-stone-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-stone-900">Carrito vacío</p>
              <p className="mt-1 text-sm text-stone-500">
                Explora el catálogo y agrega tus modelos favoritos.
              </p>
            </div>
            <Link
              href="/catalogo"
              onClick={close}
              className="store-btn-primary max-w-xs px-8"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
              {items.map((item) => (
                <CartLineItem
                  key={`${item.producto.id}-${item.color.id}-${item.talla}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>

            <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-5 py-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-stone-600">Total</span>
                <span className="text-xl font-bold tabular-nums text-[var(--store-denim-dark)]">
                  S/ {totalPrice.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={close}
                  className="store-btn-primary inline-flex h-11 items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" aria-hidden />
                  Pagar en línea
                </Link>
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
