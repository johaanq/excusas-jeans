"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { insforgeClient } from "@/lib/insforge-client"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const status = searchParams.get("insforge_status")
    const type = searchParams.get("insforge_type")
    const linkError = searchParams.get("insforge_error")
    const resetToken = searchParams.get("token")

    if (linkError) {
      setError(decodeURIComponent(linkError))
      return
    }

    if (type === "reset_password" && status === "error") {
      setError("El enlace de recuperación no es válido o expiró. Solicita uno nuevo.")
      return
    }

    if (resetToken) {
      setToken(resetToken)
      return
    }

    if (type === "reset_password" && status !== "ready") {
      setError("Enlace inválido. Solicita un nuevo correo de recuperación.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!token) {
      setError("Falta el token de recuperación. Abre el enlace desde tu correo.")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    const { error: resetError } = await insforgeClient.auth.resetPassword(password, token)
    setIsLoading(false)

    if (resetError) {
      setError(resetError.message || "No se pudo restablecer la contraseña")
      return
    }

    setMessage("Contraseña actualizada. Ya puedes iniciar sesión.")
    setTimeout(() => router.push("/cuenta?message=Contraseña actualizada correctamente"), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-md px-4 pb-16 pt-28 sm:pt-32">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="mt-2 text-sm text-gray-600">Elige una contraseña segura para tu cuenta.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          {message && <Alert className="mb-4">{message}</Alert>}

          {token ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <PasswordInput
                  id="confirm"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </form>
          ) : (
            !message && (
              <Button asChild className="h-11 w-full">
                <Link href="/auth/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            )
          )}

          <p className="mt-4 text-center text-sm">
            <Link href="/cuenta" className="font-medium text-gray-800 hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
