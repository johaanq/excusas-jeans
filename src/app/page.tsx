"use client"

import Image from "next/image"
import { HorizontalProductCarousel } from "@/components/horizontal-product-carousel"
import { NavigationArrows } from "@/components/horizontal-product-carousel"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CarouselProvider, useCarouselContext } from "@/contexts/carousel-context"
import { HERO_IMAGE_ALT } from "@/lib/site"
import { HomePromoVideo } from "@/components/home-promo-video"

function HomePageContent() {
  const { featuredProducts, isLoading, error } = useProductos()
  const { scrollLeft, scrollRight, canScrollLeft, canScrollRight } = useCarouselContext()

  return (
    <div className="min-h-screen bg-[var(--store-bg)]">
      <Header />

      <section className="relative w-full overflow-hidden bg-gray-200">
        <div className="relative w-full">
          <Image
            src="/hero1.png"
            alt={HERO_IMAGE_ALT}
            width={1200}
            height={800}
            className="h-auto w-full animate-hero-zoom object-contain"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      <main className="store-container-home py-8 md:py-16">
        <section id="novedades" className="mb-12 scroll-mt-28 md:mb-20 md:scroll-mt-32">
          <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8 md:mb-12">
            <h2 className="store-title text-xl sm:text-2xl md:text-3xl">New Arrivals</h2>
            <NavigationArrows
              scrollLeft={scrollLeft}
              scrollRight={scrollRight}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
            />
          </div>

          <HorizontalProductCarousel
            productos={featuredProducts}
            isLoading={isLoading}
            error={error || undefined}
          />
        </section>

        <section className="mb-12 md:mb-20">
          <div className="mb-6 border-t border-stone-300 md:mb-8" />

          <div className="mx-auto w-full max-w-4xl px-0 sm:px-2">
            <HomePromoVideo />
            <p className="mt-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500 sm:text-sm">
              Stretch Semi Cadera
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <CarouselProvider>
      <HomePageContent />
    </CarouselProvider>
  )
}
