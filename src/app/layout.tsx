import type React from "react"
import { GeistMono } from "geist/font/mono"
import { brandFont } from "@/lib/brand-font"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/hooks/use-cart"
import { AuthProvider } from "@/contexts/auth-context"
import { UserAuthProvider } from "@/contexts/user-auth-context"
import { AuthVerificationProvider } from "@/components/auth/auth-verification-provider"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { JsonLd } from "@/components/seo/json-ld"
import { buildRootMetadata, buildSiteJsonLd } from "@/lib/seo"
import "./globals.css"

export const metadata = buildRootMetadata()

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/logo-excusas.png" as="image" type="image/png" />
        <link rel="preload" href="/carritoIMG.png" as="image" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://wa.me" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="prefetch" href="/catalogo" />
        <link rel="prefetch" href="/about" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        <JsonLd data={buildSiteJsonLd()} />
      </head>
      <body className={`font-sans ${brandFont.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <UserAuthProvider>
            <AuthVerificationProvider>
              <CartProvider>
                <Suspense fallback={null}>{children}</Suspense>
                <ServiceWorkerRegister />
              </CartProvider>
            </AuthVerificationProvider>
          </UserAuthProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
