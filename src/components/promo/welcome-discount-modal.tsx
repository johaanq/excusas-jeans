"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { WELCOME_DISCOUNT_PERCENT } from "@/lib/welcome-discount"
import { cn } from "@/lib/utils"
import { useUserAuth } from "@/contexts/user-auth-context"

const PROMO_IMAGE = "/promo-registro-5.png"

export function WelcomeDiscountModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isLoading } = useUserAuth()
  const triedInitialOpenRef = useRef(false)

  useEffect(() => {
    try {
      if (triedInitialOpenRef.current) return
      if (isLoading) return
      triedInitialOpenRef.current = true

      // Solo mostrar en recarga/carga inicial de la home.
      if (pathname !== "/") return
      if (isAuthenticated) return

      const t = window.setTimeout(() => setOpen(true), 900)
      return () => window.clearTimeout(t)
    } catch {
      /* ignore */
    }
  }, [pathname, isAuthenticated, isLoading])

  useEffect(() => {
    if (isAuthenticated) setOpen(false)
  }, [isAuthenticated])

  const dismiss = () => {
    setOpen(false)
  }

  const registerHref = `/cuenta?redirect=${encodeURIComponent(pathname || "/")}`

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent
        className={cn(
          "max-h-[min(86vh,34rem)] w-[min(100vw-1.25rem,20rem)] max-w-none gap-0 overflow-y-auto overflow-x-hidden rounded-2xl border-0 p-0 shadow-2xl",
          "sm:w-[22rem]",
          "[&>button]:right-3 [&>button]:top-3 [&>button]:rounded-full [&>button]:bg-white/95 [&>button]:p-2 [&>button]:text-stone-800 [&>button]:opacity-100 [&>button]:shadow-md",
          "[&>button]:hover:bg-white"
        )}
      >
        <DialogTitle className="sr-only">
          {WELCOME_DISCOUNT_PERCENT}% de descuento en tu primera compra
        </DialogTitle>

        <div className="relative aspect-[16/9] sm:aspect-[4/5] w-full shrink-0 bg-stone-200">
          <Image
            src={PROMO_IMAGE}
            alt="Excusas Jeans — moda denim"
            fill
            className="object-cover object-[center_20%]"
            sizes="(max-width: 640px) 88vw, 352px"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/15 to-stone-900/5"
            aria-hidden
          />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Bienvenida
              </p>
              <p className="text-3xl font-bold leading-none tracking-tight text-white">
                {WELCOME_DISCOUNT_PERCENT}%
                <span className="ml-1 text-lg font-semibold">OFF</span>
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              1ª compra
            </span>
          </div>
        </div>

        <div className="bg-white px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Tu primera compra con descuento
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Crea tu cuenta en Excusas Jeans y recibe{" "}
            <strong className="font-semibold text-[var(--store-denim-dark)]">
              {WELCOME_DISCOUNT_PERCENT}% de descuento
            </strong>{" "}
            en tu primer pedido online. Una sola vez por cuenta.
          </p>

          <Link
            href={registerHref}
            onClick={dismiss}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-[var(--store-denim-dark)] text-sm font-semibold text-white transition-colors hover:bg-[var(--store-denim)]"
          >
            Crear cuenta y ahorrar
          </Link>

          <button
            type="button"
            onClick={dismiss}
            className="mt-3 w-full py-1.5 text-center text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            Seguir navegando
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
