"use client"

import { Suspense } from "react"
import { AuthVerificationGate } from "@/components/auth/auth-verification-gate"

export function AuthVerificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AuthVerificationGate />
      </Suspense>
    </>
  )
}
