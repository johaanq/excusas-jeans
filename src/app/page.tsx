"use client"

import Image from "next/image"
import { HorizontalProductCarousel } from "@/components/horizontal-product-carousel"
import { NavigationArrows } from "@/components/horizontal-product-carousel"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CarouselProvider, useCarouselContext } from "@/contexts/carousel-context"

function HomePageContent() {
  const { featuredProducts, isLoading, error } = useProductos()
  const { scrollLeft, scrollRight, canScrollLeft, canScrollRight } = useCarouselContext()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Image */}
      <section className="relative w-full bg-gray-200 overflow-hidden">
        <div className="relative w-full">
          <Image
            src="/hero1.png"
            alt="Excusas Jeans — tienda de jeans en Perú | excusasjeans.com"
            width={1200}
            height={800}
            className="w-full h-auto object-contain animate-hero-zoom"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
          />
          {/* Overlay sutil para mejor contraste */}
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
      </section>
      
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 md:py-16">

        {/* Productos Destacados */}
        <section className="mb-12 md:mb-20">
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 animate-slide-up delay-200">
                Nuestros Productos
              </h2>
              <NavigationArrows
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
              />
            </div>
          </div>

          <div>
            <HorizontalProductCarousel 
              productos={featuredProducts}
              isLoading={isLoading}
              error={error || undefined}
            />
          </div>
        </section>

        {/* Video Section */}
        <section className="mb-12 md:mb-20">
          {/* Línea separadora */}
          <div className="flex justify-center mb-8">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <video
                src="/video-1-excusas.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg"
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </div>
          
          {/* Texto debajo del video */}
          <div className="flex justify-center mt-4">
            <div className="relative w-full max-w-4xl">
              <p className="text-sm text-gray-400 font-light uppercase absolute right-0">Stretch Semi Cadera</p>
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
