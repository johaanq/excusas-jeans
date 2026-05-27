"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, User, X } from "lucide-react"
import { useUserAuth } from "@/contexts/user-auth-context"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { CartPreview } from "@/components/cart/cart-preview"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ClientOnly } from "@/components/ui/client-only"
import { SearchBar } from "@/components/search/search-bar"
import { MainNavLinks } from "@/components/store/main-nav-links"
import { StoreSocialLinks } from "@/components/store/store-social-links"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { isAuthenticated, user } = useUserAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (isHomePage) {
        setIsScrolled(scrollTop > 50)
      } else {
        setIsScrolled(true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const closeMobile = () => setIsMobileMenuOpen(false)
  const iconBtnClass = cn(
    "h-10 w-10 transition-colors hover:bg-transparent",
    isScrolled ? "text-stone-700 hover:text-stone-900" : "text-white hover:text-white/90"
  )

  return (
    <>
      <header
        id="main-header"
        className={cn(
          "fixed top-0 z-50 w-full border-b border-transparent transition-all duration-300",
          isScrolled && "header-scrolled border-stone-200/80"
        )}
      >
        <div className="store-container-wide">
          <div className="flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5"
              aria-label="Excusas Jeans — inicio"
            >
              <div className="relative h-9 w-9 md:h-10 md:w-10">
                <Image
                  src="/logo-excusas.png"
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={cn(
                  "text-lg font-bold tracking-tight transition-colors md:text-xl",
                  isScrolled ? "text-stone-900" : "text-white drop-shadow-md"
                )}
              >
                Excusas
              </span>
            </Link>

            <MainNavLinks isScrolled={isScrolled} />

            <div className="flex items-center gap-1 sm:gap-2">
              <StoreSocialLinks isScrolled={isScrolled} className="hidden lg:flex" />

              <SearchBar isScrolled={isScrolled} />

              <ClientOnly fallback={<div className="h-10 w-10 rounded-full bg-stone-200/50" />}>
                <CartPreview isScrolled={isScrolled} onOpenCart={() => setIsCartOpen(true)} />
              </ClientOnly>

              <ClientOnly fallback={<div className="h-10 w-10 rounded-full bg-stone-200/50" />}>
                <Link href={isAuthenticated ? "/perfil" : "/cuenta"}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={iconBtnClass}
                    title={isAuthenticated ? user?.nombre ?? "Mi cuenta" : "Iniciar sesión"}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </ClientOnly>

              <Button
                variant="ghost"
                size="icon"
                className={cn(iconBtnClass, "md:hidden")}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
            aria-label="Cerrar menú"
            onClick={closeMobile}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">Menú</p>
              <Button variant="ghost" size="icon" onClick={closeMobile} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <MainNavLinks isScrolled vertical onNavigate={closeMobile} className="!flex" />

              <div className="mt-6 border-t border-stone-100 pt-6">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-left text-base font-medium text-stone-800"
                  onClick={() => {
                    closeMobile()
                    setIsCartOpen(true)
                  }}
                >
                  Carrito
                  {totalItems > 0 && (
                    <span className="rounded-full bg-[var(--store-denim-dark)] px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                      {totalItems}
                    </span>
                  )}
                </button>
                <Link
                  href={isAuthenticated ? "/perfil" : "/cuenta"}
                  className="mt-2 block rounded-lg px-4 py-3 text-base font-medium text-stone-800 hover:bg-stone-50"
                  onClick={closeMobile}
                >
                  {isAuthenticated ? "Mi perfil" : "Iniciar sesión"}
                </Link>
              </div>
            </div>

            <div className="border-t border-stone-100 p-5 space-y-4">
              <StoreSocialLinks
                isScrolled
                variant="menu"
                onNavigate={closeMobile}
                className="justify-center gap-2"
              />
              <Link
                href="/catalogo"
                className="store-btn-primary text-center block"
                onClick={closeMobile}
              >
                Ver catálogo
              </Link>
            </div>
          </aside>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}

export function Header() {
  return (
    <ClientOnly
      fallback={
        <header className="fixed top-0 z-50 w-full border-b border-stone-100 bg-white/95">
          <div className="store-container-wide">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded bg-stone-200" />
                <div className="h-5 w-20 rounded bg-stone-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 rounded-full bg-stone-200" />
                <div className="h-10 w-10 rounded-full bg-stone-200" />
              </div>
            </div>
          </div>
        </header>
      }
    >
      <HeaderContent />
    </ClientOnly>
  )
}
