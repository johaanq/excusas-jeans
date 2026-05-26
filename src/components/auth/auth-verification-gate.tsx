"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { insforgeClient } from "@/lib/insforge-client"
import {
  AuthVerificationModal,
  type VerificationModalVariant,
} from "@/components/auth/auth-verification-modal"

const VERIFY_EMAIL_KEY = "excusas_verify_email"

export function buildHomeVerifyUrl(email?: string) {
  const sp = new URLSearchParams()
  sp.set("verify", "pending")
  if (email) sp.set("email", email)
  return `/?${sp.toString()}`
}

export function setPendingVerifyEmail(email: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(VERIFY_EMAIL_KEY, email)
  }
}

function getPendingVerifyEmail(searchParams: URLSearchParams) {
  const fromUrl = searchParams.get("email")
  if (fromUrl) return fromUrl
  if (typeof window === "undefined") return ""
  return sessionStorage.getItem(VERIFY_EMAIL_KEY) ?? ""
}

function clearPendingVerifyEmail() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(VERIFY_EMAIL_KEY)
  }
}

function stripQueryKeys(router: ReturnType<typeof useRouter>, keys: string[]) {
  const sp = new URLSearchParams(window.location.search)
  keys.forEach((k) => sp.delete(k))
  const q = sp.toString()
  router.replace(q ? `${window.location.pathname}?${q}` : window.location.pathname, {
    scroll: false,
  })
}

export function AuthVerificationGate() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [variant, setVariant] = useState<VerificationModalVariant | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendEmail, setResendEmail] = useState("")

  const goHome = useCallback(() => {
    setVariant(null)
    clearPendingVerifyEmail()
    router.replace("/")
  }, [router])

  const closeModal = useCallback(() => {
    setVariant(null)
    setErrorMessage("")
    if (searchParams.get("verify") === "pending") {
      stripQueryKeys(router, ["verify", "email"])
    }
    if (
      searchParams.get("insforge_type") === "verify_email" ||
      searchParams.get("insforge_status")
    ) {
      stripQueryKeys(router, ["insforge_type", "insforge_status", "insforge_error"])
    }
  }, [router, searchParams])

  useEffect(() => {
    const status = searchParams.get("insforge_status")
    const type = searchParams.get("insforge_type")
    const linkError = searchParams.get("insforge_error")
    const verify = searchParams.get("verify")

    if (type === "verify_email") {
      if (status === "success") {
        setVariant("success")
        setErrorMessage("")
        clearPendingVerifyEmail()
        stripQueryKeys(router, ["insforge_type", "insforge_status", "insforge_error", "verify", "email"])
      } else if (status === "error") {
        setVariant("error")
        setErrorMessage(
          linkError
            ? decodeURIComponent(linkError)
            : "El enlace de verificación no es válido o expiró."
        )
        setResendEmail(getPendingVerifyEmail(searchParams))
        stripQueryKeys(router, ["insforge_type", "insforge_status", "insforge_error"])
      }
      return
    }

    if (verify === "pending") {
      setVariant("pending")
      setResendEmail(getPendingVerifyEmail(searchParams))
      return
    }

    setVariant((current) => (current === "pending" ? null : current))
  }, [searchParams, router])

  const handleResend = async () => {
    const email = resendEmail.trim()
    if (!email) {
      setErrorMessage("No hay correo guardado. Regístrate de nuevo o inicia sesión en /cuenta.")
      setVariant("error")
      return
    }
    setIsResending(true)
    const { error } = await insforgeClient.auth.resendVerificationEmail(email)
    setIsResending(false)
    if (error) {
      setErrorMessage(error.message || "No se pudo reenviar el correo.")
      setVariant("error")
      return
    }
    setVariant("pending")
    setErrorMessage("")
  }

  return (
    <AuthVerificationModal
      variant={variant}
      onClose={closeModal}
      errorMessage={errorMessage}
      onSuccessContinue={goHome}
      onResendEmail={handleResend}
      isResending={isResending}
    />
  )
}
