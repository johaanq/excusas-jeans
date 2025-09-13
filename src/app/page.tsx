"use client"

import { memo } from "react"
import Image from "next/image"
import { FeaturedProducts } from "@/components/featured-products"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { HeroCarousel } from "@/components/hero-carousel"
import { ArrowRight } from "lucide-react"

// Imágenes del carrusel hero
const heroImages = [
  {
    src: "/hero1.png",
    alt: "Excusas Jeans - Colección Principal"
  }
  // Aquí puedes agregar más imágenes cuando las tengas
  // {
  //   src: "/hero2.png",
  //   alt: "Excusas Jeans - Nueva Colección"
  // }
]

// Componente memoizado para el footer
const Footer = memo(function Footer() {
  return (
  <footer className="bg-gray-900 text-white mt-12 md:mt-20">
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="h-6 w-6 md:h-8 md:w-8 relative">
            <Image 
              src="/logo-excusas.png" 
              alt="Logo Excusas" 
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-lg md:text-xl">Excusas</span>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
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
      
      <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400">
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

      {/* Carrusel Hero */}
      <HeroCarousel images={heroImages} />
      
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 md:py-16">

        {/* Productos Destacados */}
        <section className="mb-12 md:mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Productos Destacados
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Descubre nuestra selección de jeans más populares
              </p>
            </div>
            <a 
              href="/catalogo" 
              className="group text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:scale-105 transform transition-all text-sm md:text-base"
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
