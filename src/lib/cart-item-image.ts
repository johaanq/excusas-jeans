import type { CartItem } from "@/hooks/use-cart"

/** Imagen del ítem: foto del color elegido, luego principal del producto. */
export function getCartItemImageUrl(item: CartItem): string {
  const colorUrl = item.color.fotos?.find((f) => f.url?.trim())?.url
  if (colorUrl) return colorUrl

  const principal = item.producto.foto_principal?.trim()
  if (principal) return principal

  return "/placeholder.svg"
}
