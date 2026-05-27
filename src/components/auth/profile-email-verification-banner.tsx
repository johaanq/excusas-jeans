"use client"

import { useState } from "react"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { insforgeClient } from "@/lib/insforge-client"

type ProfileEmailVerificationBannerProps = {
  email: string
  variant?: "pending" | "success" | "error"
  errorMessage?: string
  onDismissQuery?: () => void
}

export function ProfileEmailVerificationBanner({
  email,
  variant = "pending",
  errorMessage,
  onDismissQuery,
}: ProfileEmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [localError, setLocalError] = useState("")
  const [resent, setResent] = useState(false)

  if (variant === "success") {
    return (
      <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="ml-2">
          <p className="font-semibold">¡Cuenta verificada!</p>
          <p className="mt-1 text-sm">Tu correo ya está confirmado. Puedes seguir comprando con normalidad.</p>
        </div>
      </Alert>
    )
  }

  if (variant === "error") {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="ml-2 flex-1">
          <p className="font-semibold">No se pudo verificar el correo</p>
          <p className="mt-1 text-sm">
            {errorMessage ||
              "El enlace expiró o ya se usó. Solicita un correo nuevo con el botón de abajo."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isResending}
            onClick={async () => {
              setIsResending(true)
              setLocalError("")
              const { error } = await insforgeClient.auth.resendVerificationEmail(email)
              setIsResending(false)
              if (error) {
                setLocalError(error.message || "No se pudo reenviar el correo.")
                return
              }
              setResent(true)
              onDismissQuery?.()
            }}
          >
            {isResending ? "Enviando..." : "Reenviar correo de verificación"}
          </Button>
          {localError && <p className="mt-2 text-sm">{localError}</p>}
        </div>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-950">
      <Mail className="h-5 w-5 shrink-0 text-amber-700" />
      <div className="ml-2 flex-1">
        <p className="font-semibold">Verifica tu correo</p>
        <p className="mt-1 text-sm">
          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo para activar tu cuenta; después podrás
          comprar sin restricciones.
        </p>
        {resent && (
          <p className="mt-2 text-sm font-medium text-emerald-800">
            Correo reenviado. Revisa tu bandeja de entrada y spam.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-amber-300 bg-white hover:bg-amber-50"
          disabled={isResending}
          onClick={async () => {
            setIsResending(true)
            setLocalError("")
            const { error } = await insforgeClient.auth.resendVerificationEmail(email)
            setIsResending(false)
            if (error) {
              setLocalError(error.message || "No se pudo reenviar el correo.")
              return
            }
            setResent(true)
          }}
        >
          {isResending ? "Enviando..." : "Reenviar correo"}
        </Button>
        {localError && <p className="mt-2 text-sm text-red-700">{localError}</p>}
      </div>
    </Alert>
  )
}
