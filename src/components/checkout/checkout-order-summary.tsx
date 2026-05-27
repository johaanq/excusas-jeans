"use client"

import { memo } from "react"
import type { CartItem } from "@/hooks/use-cart"
import { CartItemImage } from "@/components/cart/cart-item-image"

type Props = {
  items: CartItem[]
  subtotal: number
  discountAmount?: number
  shippingCost: number | null
  shippingMethod: string | null
  shippingNote: string | null
}

export const CheckoutOrderSummary = memo(function CheckoutOrderSummary({
  items,
  subtotal,
  discountAmount = 0,
  shippingCost,
  shippingMethod,
  shippingNote,
}: Props) {
  const envio = shippingCost ?? 0
  const total =
    shippingCost != null
      ? Math.max(0, subtotal - discountAmount + envio)
      : Math.max(0, subtotal - discountAmount)

  return (
    <aside className="rounded-lg bg-stone-100/80 p-5 sm:p-6 lg:sticky lg:top-6">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={`${item.producto.id}-${item.color.id}-${item.talla}`}
            className="flex gap-3"
          >
            <div className="relative shrink-0">
              <CartItemImage item={item} className="h-16 w-16 rounded-md" sizes="64px" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-semibold text-white tabular-nums">
                {item.cantidad}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-900">
                {item.producto.nombre}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                {item.color.nombre} / {item.talla}
              </p>
              <p className="mt-1 text-sm font-medium tabular-nums text-stone-800">
                S/ {((item.producto.precio ?? 0) * item.cantidad).toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-stone-200/80 pt-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span className="tabular-nums text-stone-900">S/ {subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Descuento primera compra (5%)</span>
            <span className="tabular-nums">− S/ {discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 text-stone-600">
          <span className="min-w-0">Envío</span>
          <span className="shrink-0 text-right tabular-nums text-stone-900">
            {shippingCost != null ? `S/ ${shippingCost.toFixed(2)}` : "—"}
          </span>
        </div>
        {shippingMethod && (
          <p className="text-xs leading-relaxed text-stone-500">{shippingMethod}</p>
        )}
        {shippingNote && (
          <p className="text-xs leading-relaxed text-stone-500">{shippingNote}</p>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-stone-200/80 pt-4">
        <span className="text-sm text-stone-600">Total</span>
        <span className="text-xl font-semibold tabular-nums tracking-tight text-stone-900">
          PEN S/ {total.toFixed(2)}
        </span>
      </div>

      <p className="mt-3 text-center text-[11px] text-stone-500">
        Tu pago está protegido con encriptación segura
      </p>
    </aside>
  )
})
