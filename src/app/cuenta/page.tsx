"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserAuthPanel } from "@/components/auth/user-auth-panel"

function CuentaContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pb-16 pt-28 sm:pt-32">
        <UserAuthPanel />
      </main>
      <Footer />
    </div>
  )
}

export default function CuentaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        </div>
      }
    >
      <CuentaContent />
    </Suspense>
  )
}
