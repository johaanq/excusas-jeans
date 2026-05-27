"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { type Producto } from "@/data/productos"
import { type CartItem } from "@/hooks/use-cart"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils"
import { WHATSAPP_NUMBER_E164 } from "@/lib/site"
import { useCart } from "@/hooks/use-cart"
import { useUserAuth } from "@/contexts/user-auth-context"
import { ClientOnly } from "@/components/ui/client-only"
import { StoreBreadcrumb } from "@/components/store/store-breadcrumb"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

interface ProductDetailProps {
  producto: Producto
}

type GalleryImage = {
  url: string
  alt: string
  type: "principal" | "color"
  colorId: string | null
}

function formatSoles(amount: number) {
  return amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductDetailContent({ producto }: ProductDetailProps) {
  const hasColors = producto.colores.length > 0
  const [selectedColorIndex, setSelectedColorIndex] = useState(hasColors ? 0 : -1)
  const [selectedTalla, setSelectedTalla] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [colorPickedByUser, setColorPickedByUser] = useState(false)
  const [medidasOpen, setMedidasOpen] = useState(false)
  const [notasOpen, setNotasOpen] = useState(false)

  const { addItem } = useCart()
  const { user, isAuthenticated } = useUserAuth()
  const selectedColor = selectedColorIndex >= 0 ? producto.colores[selectedColorIndex] : null

  const allImages = useMemo((): GalleryImage[] => {
    const images: GalleryImage[] = []
    if (producto.foto_principal) {
      images.push({
        url: producto.foto_principal,
        alt: producto.nombre,
        type: "principal",
        colorId: null,
      })
    }
    producto.colores.forEach((color) => {
      color.fotos?.forEach((foto) => {
        images.push({
          url: foto.url,
          alt: `${producto.nombre} — ${color.nombre}`,
          type: "color",
          colorId: color.id,
        })
      })
    })
    return images
  }, [producto])

  const mainImage = allImages[selectedImageIndex]?.url || "/placeholder.svg"
  const displayPrice =
    cantidad >= 4 && producto.precio_mayor ? producto.precio_mayor : producto.precio

  useEffect(() => {
    setSelectedImageIndex(0)
    setColorPickedByUser(false)
    setSelectedColorIndex(producto.colores.length > 0 ? 0 : -1)
    setSelectedTalla("")
    setCantidad(1)
  }, [producto.id, producto.colores.length])

  /** Al cambiar color manualmente, ir a su primera foto; al entrar, quedarse en la imagen 0. */
  useEffect(() => {
    if (!colorPickedByUser || !selectedColor?.fotos?.length) return
    const idx = allImages.findIndex(
      (img) => img.type === "color" && img.colorId === selectedColor.id
    )
    if (idx !== -1) setSelectedImageIndex(idx)
  }, [selectedColor, allImages, colorPickedByUser])

  const selectedTallaObj = producto.tallas.find((t) => t.talla === selectedTalla)
  const isInStock = selectedTallaObj?.en_stock ?? false
  const canPurchase = Boolean(selectedTalla && isInStock && selectedColor)

  const handleAddToCart = async () => {
    if (!canPurchase || !selectedColor) return
    await addItem(
      { ...producto, precio: displayPrice ?? producto.precio },
      selectedColor,
      selectedTalla,
      cantidad
    )
    setCantidad(1)
  }

  const handleWhatsAppOrder = async () => {
    if (!selectedTalla || !selectedColor) return
    const cartItem: CartItem = {
      producto: { ...producto, precio: displayPrice ?? producto.precio },
      color: selectedColor,
      talla: selectedTalla,
      cantidad,
    }
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
      generateWhatsAppMessage([cartItem], customerInfo)
    )
  }

  return (
    <article>
      <StoreBreadcrumb
        className="mb-8 md:mb-10"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo", href: "/catalogo" },
          { label: producto.nombre },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,380px)] lg:gap-12">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          {allImages.length > 1 && (
            <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:w-[4.25rem] md:shrink-0 md:flex-col md:gap-2.5 md:overflow-y-auto md:overflow-x-visible md:p-0.5">
              {allImages.map((image, index) => (
                <button
                  key={`${image.colorId ?? "p"}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-current={selectedImageIndex === index ? "true" : undefined}
                  className={cn(
                    "relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-md bg-stone-100 transition-all md:w-full",
                    selectedImageIndex === index
                      ? "border-2 border-stone-900 shadow-md ring-2 ring-stone-900/15 ring-offset-2 ring-offset-[var(--store-bg)]"
                      : "border border-stone-200 opacity-80 hover:border-stone-400 hover:opacity-100"
                  )}
                >
                  <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative order-1 aspect-[3/4] w-full overflow-hidden rounded-lg bg-stone-100 md:order-2 md:flex-1">
            <Image
              key={`${selectedImageIndex}-${mainImage}`}
              src={mainImage}
              alt={allImages[selectedImageIndex]?.alt ?? producto.nombre}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="store-kicker">Excusas Jeans</p>
          <h1 className="store-title mt-1">{producto.nombre}</h1>
          {producto.descripcion && (
            <p className="store-lead mt-3">{producto.descripcion}</p>
          )}

          <div className="store-section">
            {displayPrice != null && <p className="store-price-lg">S/ {formatSoles(displayPrice)}</p>}
            {producto.precio_mayor && (
              <p className="store-meta mt-2">
                Precio por mayor (4+ unidades del mismo modelo): S/{" "}
                {formatSoles(producto.precio_mayor)}
              </p>
            )}
          </div>

          {hasColors && (
            <div className="store-section">
              <p className="store-label">
                Color
                {selectedColor ? `: ${selectedColor.nombre}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {producto.colores.map((color, index) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setColorPickedByUser(true)
                      setSelectedColorIndex(index)
                    }}
                    className={cn(
                      "store-chip rounded-md",
                      selectedColorIndex === index && "store-chip-active"
                    )}
                  >
                    {color.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="store-section">
            <p className="store-label">Talla</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {producto.tallas.map((talla) => (
                <button
                  key={talla.id}
                  type="button"
                  disabled={!talla.en_stock}
                  onClick={() => setSelectedTalla(talla.talla)}
                  className={cn(
                    "store-chip min-w-[2.75rem] rounded-md tabular-nums",
                    !talla.en_stock && "cursor-not-allowed opacity-40 line-through",
                    selectedTalla === talla.talla &&
                      talla.en_stock &&
                      "store-chip-active"
                  )}
                >
                  {talla.talla}
                </button>
              ))}
            </div>
            {selectedTalla && (
              <p className="store-meta mt-2">{isInStock ? "Disponible" : "Agotado"}</p>
            )}
          </div>

          <div className="store-section">
            <p className="store-label">Cantidad</p>
            <div className="mt-3 inline-flex items-stretch overflow-hidden rounded-md border border-stone-300">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                aria-label="Menos"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-10 min-w-[2.5rem] items-center justify-center border-x border-stone-300 text-sm tabular-nums">
                {cantidad}
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
                onClick={() => setCantidad(cantidad + 1)}
                aria-label="Más"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              className="store-btn-primary gap-2 disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={!canPurchase}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              Agregar al carrito
            </button>
            <button
              type="button"
              className="store-link w-full disabled:opacity-40"
              onClick={handleWhatsAppOrder}
              disabled={!canPurchase}
            >
              Consultar por WhatsApp
            </button>
          </div>

          {producto.fotos_medidas?.length > 0 && (
            <div className="store-section">
              <button
                type="button"
                className="store-accordion-trigger"
                onClick={() => setMedidasOpen((o) => !o)}
              >
                Guía de tallas
                <span className="text-stone-400">{medidasOpen ? "−" : "+"}</span>
              </button>
              {medidasOpen && (
                <div className="relative mt-4 aspect-square max-w-xs overflow-hidden rounded-lg bg-stone-100">
                  <Image
                    src={producto.fotos_medidas[0].url}
                    alt={`Guía de medidas — ${producto.nombre}`}
                    fill
                    className="object-contain p-2"
                    sizes="320px"
                  />
                </div>
              )}
            </div>
          )}

          <div className="store-section">
            <button
              type="button"
              className="store-accordion-trigger"
              onClick={() => setNotasOpen((o) => !o)}
            >
              Información de compra
              <span className="text-stone-400">{notasOpen ? "−" : "+"}</span>
            </button>
            {notasOpen && (
              <ul className="mt-4 list-disc space-y-2 pl-4 text-sm leading-relaxed text-stone-600">
                <li>
                  Precio por mayor desde 4 unidades del mismo modelo (tallas y colores se
                  combinan).
                </li>
                <li>Con 3 modelos distintos aplica solo el descuento vigente.</li>
                <li>Sin cambio de talla o color tras abrir el ojal.</li>
                <li>Confirma talla y color antes de pagar.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 h-4 w-56 rounded bg-stone-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[3/4] rounded-lg bg-stone-100" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-stone-200" />
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-10 w-full rounded-md bg-stone-200" />
        </div>
      </div>
    </div>
  )
}

export function ProductDetail({ producto }: ProductDetailProps) {
  return (
    <ClientOnly fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent producto={producto} />
    </ClientOnly>
  )
}
