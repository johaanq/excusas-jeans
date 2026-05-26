"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/** Compatibilidad: /auth/verify → inicio con modal de verificación. */
function VerifyRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (!params.has("verify") && !params.has("insforge_status")) {
      params.set("verify", "pending")
    }
    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        </div>
      }
    >
      <VerifyRedirect />
    </Suspense>
  )
}
