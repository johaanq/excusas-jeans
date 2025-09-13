"use client"

import { memo } from "react"
import Image from "next/image"
import { FeaturedProducts } from "@/components/featured-products"
import { useProductos } from "@/hooks/use-productos"
import { Header } from "@/components/header"
import { ArrowRight } from "lucide-react"


// Componente memoizado para el hero
const HeroSection = memo(function HeroSection() {
  return (
  <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 overflow-hidden">
    {/* Elementos decorativos */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full opacity-20"></div>
    </div>
    
    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          Excusas
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Jeans únicos con estilo urbano y calidad premium
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/catalogo" 
            className="group bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2"
          >
            Ver Catálogo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="/about" 
            className="group border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Conoce nuestra historia
          </a>
        </div>
      </div>
    </div>
  </section>
  )
})

// Componente memoizado para el footer
const Footer = memo(function Footer() {
  return (
  <footer className="bg-gray-900 text-white mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="h-8 w-8 relative">
            <Image 
              src="/logo-excusas.png" 
              alt="Logo Excusas" 
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl">Excusas</span>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
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
      
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
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

      <HeroSection />
      
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-16">

        {/* Productos Destacados */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Productos Destacados
              </h2>
              <p className="text-gray-600">
                Descubre nuestra selección de jeans más populares
              </p>
            </div>
            <a 
              href="/catalogo" 
              className="group text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:scale-105 transform transition-all"
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
