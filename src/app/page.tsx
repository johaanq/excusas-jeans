"use client"

import Image from "next/image"
import { HorizontalProductCarousel } from "@/components/horizontal-product-carousel"
import { NavigationArrows } from "@/components/horizontal-product-carousel"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CarouselProvider, useCarouselContext } from "@/contexts/carousel-context"
import { HERO_IMAGE_ALT } from "@/lib/site"

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
        <section className="mb-12 md:mb-20">
          <div className="mb-6 flex items-center justify-between sm:mb-8 md:mb-12">
            <h2 className="store-title">New Arrivals</h2>
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
          <div className="mb-8 flex justify-center">
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <video
                src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/video-1-excusas.mp4"}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
                style={{ pointerEvents: "none" }}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="relative w-full max-w-4xl">
              <p className="absolute right-0 text-sm font-light uppercase text-gray-400">
                Stretch Semi Cadera
              </p>
            </div>
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
