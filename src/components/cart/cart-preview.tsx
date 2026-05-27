"use client"

import { memo, useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { CartItemImage } from "@/components/cart/cart-item-image"
import { cn } from "@/lib/utils"

interface CartPreviewProps {
  isScrolled?: boolean
  onOpenCart?: () => void
}

export const CartPreview = memo(function CartPreview({
  isScrolled = false,
  onOpenCart,
}: CartPreviewProps) {
  const { items, totalItems, totalPrice } = useCart()
  const [peek, setPeek] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  const dismiss = useCallback(() => {
    setPeek(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    const onAdded = () => {
      setPeek(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(dismiss, 3500)
    }
    window.addEventListener("cartItemAdded", onAdded)
    return () => {
      window.removeEventListener("cartItemAdded", onAdded)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [dismiss])

  useEffect(() => {
    dismiss()
  }, [pathname, dismiss])

  const lastItem = items[items.length - 1]

  const openCart = () => {
    onOpenCart?.()
    dismiss()
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-10 w-10 transition-colors hover:bg-transparent",
          isScrolled
            ? "text-stone-700 hover:text-stone-900"
            : "text-white hover:text-white/90"
        )}
        onClick={openCart}
        aria-label={`Carrito, ${totalItems} artículos`}
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--store-denim-dark)] px-1 text-[10px] font-bold text-white tabular-nums">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Button>

      {peek && lastItem && (
        <div
          className="cart-peek-panel absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] animate-in fade-in slide-in-from-top-1 rounded-xl border border-stone-200 bg-white p-4 shadow-xl duration-200"
          role="status"
        >
          <div className="flex gap-3">
            <CartItemImage item={lastItem} className="h-16 w-16 shrink-0 rounded-lg" sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Agregado al carrito
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
                {lastItem.producto.nombre}
              </p>
              <p className="mt-1 text-sm font-medium tabular-nums text-stone-600">
                S/ {totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="cart-peek-btn mt-4 flex h-10 w-full items-center justify-center rounded-md bg-[var(--store-denim-dark)] text-sm font-semibold text-white transition-colors hover:bg-[var(--store-denim)]"
          >
            Ver carrito
          </button>
        </div>
      )}
    </div>
  )
})
