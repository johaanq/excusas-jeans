import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/hooks/use-cart"
import { AuthProvider } from "@/contexts/auth-context"
import { UserAuthProvider } from "@/contexts/user-auth-context"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import "./globals.css"

export const metadata: Metadata = {
  title: "Catálogo Excusas Jeans - Moda y Estilo",
  description: "Descubre nuestra colección de jeans y ropa moderna",
  generator: "v0.app",
  keywords: ["jeans", "moda", "ropa", "estilo", "Excusas Jeans"],
  authors: [{ name: "Excusas Jeans" }],
  creator: "Excusas Jeans",
  publisher: "Excusas Jeans",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://excusas-jeans.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Excusas Jeans - Moda y Estilo",
    description: "Descubre nuestra colección de jeans únicos con estilo urbano y calidad premium",
    url: 'https://excusas-jeans.vercel.app',
    siteName: 'Excusas Jeans',
    images: [
      {
        url: '/logo-excusas.png',
        width: 1200,
        height: 630,
        alt: 'Excusas Jeans Logo',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Excusas Jeans - Moda y Estilo",
    description: "Descubre nuestra colección de jeans únicos con estilo urbano y calidad premium",
    images: ['/logo-excusas.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Preload recursos críticos */}
        <link rel="preload" href="/logo-excusas.png" as="image" type="image/png" />
        <link rel="preload" href="/carritoIMG.png" as="image" type="image/png" />
        
        {/* Preconnect a dominios externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://wa.me" />
        
        {/* DNS prefetch para mejor rendimiento */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Prefetch páginas importantes */}
        <link rel="prefetch" href="/catalogo" />
        <link rel="prefetch" href="/about" />
        
        {/* Meta tags adicionales para rendimiento */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <UserAuthProvider>
            <CartProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <ServiceWorkerRegister />
            </CartProvider>
          </UserAuthProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
