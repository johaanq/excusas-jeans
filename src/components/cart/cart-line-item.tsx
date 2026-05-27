"use client"

import { memo, useCallback } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "@/hooks/use-cart"
import { CartItemImage } from "@/components/cart/cart-item-image"

type Props = {
  item: CartItem
  onUpdateQuantity: (
    productId: string,
    colorId: string,
    talla: string,
    cantidad: number
  ) => void
  onRemove: (productId: string, colorId: string, talla: string) => void
}

function formatSoles(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const CartLineItem = memo(function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
}: Props) {
  const unit = item.producto.precio ?? 0
  const lineTotal = unit * item.cantidad
  const { id: productId } = item.producto
  const { id: colorId } = item.color
  const { talla } = item

  const dec = useCallback(
    () => onUpdateQuantity(productId, colorId, talla, item.cantidad - 1),
    [onUpdateQuantity, productId, colorId, talla, item.cantidad]
  )
  const inc = useCallback(
    () => onUpdateQuantity(productId, colorId, talla, item.cantidad + 1),
    [onUpdateQuantity, productId, colorId, talla, item.cantidad]
  )
  const remove = useCallback(
    () => onRemove(productId, colorId, talla),
    [onRemove, productId, colorId, talla]
  )

  return (
    <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3">
      <CartItemImage item={item} className="h-[4.5rem] w-[3.5rem] sm:h-20 sm:w-[4.5rem]" sizes="72px" />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
              {item.producto.nombre}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {item.color.nombre} · Talla {item.talla}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="shrink-0 rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Quitar del carrito"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50">
            <button
              type="button"
              onClick={dec}
              className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100"
              aria-label="Menos cantidad"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums text-stone-900">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={inc}
              className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100"
              aria-label="Más cantidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold tabular-nums text-[var(--store-denim-dark)]">
            S/ {formatSoles(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  )
})
