"use client"

import { memo } from "react"
import Image from "next/image"
import type { CartItem } from "@/hooks/use-cart"
import { getCartItemImageUrl } from "@/lib/cart-item-image"
import { cn } from "@/lib/utils"

type Props = {
  item: CartItem
  className?: string
  sizes?: string
}

export const CartItemImage = memo(function CartItemImage({
  item,
  className,
  sizes = "80px",
}: Props) {
  const src = getCartItemImageUrl(item)

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-stone-100",
        className
      )}
    >
      <Image
        src={src}
        alt={item.producto.nombre}
        fill
        className="object-cover"
        sizes={sizes}
        loading="lazy"
      />
    </div>
  )
})
