"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Mail, CheckCircle2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type VerificationModalVariant = "pending" | "success" | "error"

type AuthVerificationModalProps = {
  variant: VerificationModalVariant | null
  onClose: () => void
  errorMessage?: string
  onSuccessContinue?: () => void
  onResendEmail?: () => void
  isResending?: boolean
}

export function AuthVerificationModal({
  variant,
  onClose,
  errorMessage,
  onSuccessContinue,
  onResendEmail,
  isResending = false,
}: AuthVerificationModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (variant) {
      setVisible(true)
      return
    }
    setVisible(false)
  }, [variant])

  useEffect(() => {
    if (variant !== "success" || !onSuccessContinue) return
    const timer = window.setTimeout(() => {
      onSuccessContinue()
    }, 2800)
    return () => window.clearTimeout(timer)
  }, [variant, onSuccessContinue])

  if (!variant) return null

  const config = {
    pending: {
      icon: Mail,
      iconClass: "text-emerald-700",
      title: "Revisa tu correo",
      description:
        "Revisa tu correo y abre el enlace de verificación. Puedes seguir en tu perfil mientras tanto.",
      primaryLabel: "Entendido",
      primaryAction: onClose,
    },
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      title: "¡Cuenta verificada!",
      description: "Tu correo ya está confirmado.",
      primaryLabel: "Continuar",
      primaryAction: onSuccessContinue ?? onClose,
    },
    error: {
      icon: AlertCircle,
      iconClass: "text-red-600",
      title: "No se pudo verificar",
      description:
        errorMessage ||
        "El enlace expiró o ya se usó (Gmail a veces lo abre automáticamente). Pide un correo nuevo.",
      primaryLabel: "Cerrar",
      primaryAction: onClose,
    },
  }[variant]

  const Icon = config.icon

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={variant === "success" ? undefined : onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all duration-300 sm:p-8",
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo-excusas.png"
            alt="Excusas Jeans"
            width={48}
            height={48}
            className="mb-4 object-contain"
          />
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50",
              variant === "success" && "bg-emerald-50"
            )}
          >
            <Icon className={cn("h-6 w-6", config.iconClass)} />
          </div>
          <h2
            id="verification-modal-title"
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            {config.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{config.description}</p>
          <Button
            type="button"
            className="mt-6 h-11 w-full"
            onClick={config.primaryAction}
          >
            {config.primaryLabel}
          </Button>
          {variant === "error" && onResendEmail && (
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-11 w-full"
              disabled={isResending}
              onClick={onResendEmail}
            >
              {isResending ? "Enviando..." : "Reenviar correo de verificación"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
