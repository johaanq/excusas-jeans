"use client"

import { memo } from "react"
import Image from "next/image"
import { FeaturedProducts } from "@/components/featured-products"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { ArrowRight } from "lucide-react"

// Componente memoizado para el footer
const Footer = memo(function Footer() {
  return (
  <footer className="bg-gray-900 text-white mt-12 md:mt-20">
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 relative">
            <Image 
              src="/logo-excusas.png" 
              alt="Logo Excusas" 
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-lg sm:text-xl">Excusas</span>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-400">
          <a href="/catalogo" className="hover:text-white transition-colors">
            Catálogo
          </a>
          <a href="/about" className="hover:text-white transition-colors">
            Sobre Nosotros
          </a>
          <a 
            href="https://www.instagram.com/excusas.jeans/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a 
            href="https://wa.me/51934762253" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </nav>
      </div>
      
      <div className="border-t border-gray-700 mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 text-center text-xs sm:text-sm text-gray-400">
        <p>&copy; 2024 Excusas Jeans. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
  )
})

export default function HomePage() {
  const { featuredProducts, isLoading, error } = useProductos()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Image */}
      <section className="relative w-full bg-gray-200">
        <div className="relative w-full">
          <Image
            src="/hero1.png"
            alt="Excusas Jeans - Colección Principal"
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 md:mb-12 gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Productos Destacados
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Descubre nuestra selección de jeans más populares
              </p>
            </div>
            <a 
              href="/catalogo" 
              className="group text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:scale-105 transform transition-all text-sm sm:text-base whitespace-nowrap"
            >
              Ver todos los productos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div>
            <FeaturedProducts 
              productos={featuredProducts}
              isLoading={isLoading}
              error={error || undefined}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
