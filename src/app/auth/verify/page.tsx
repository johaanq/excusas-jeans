"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { insforge } from "@/lib/insforge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    const { data, error: verifyError } = await insforge.auth.verifyEmail({ email, otp })

    if (verifyError) {
      setError(verifyError.message || "Código inválido")
      setIsLoading(false)
      return
    }

    if (data?.accessToken) {
      localStorage.setItem("user_token", data.accessToken)
    }

    setMessage("Correo verificado. Ya puedes iniciar sesión.")
    setTimeout(() => router.push("/cuenta?message=Correo verificado correctamente"), 1500)
    setIsLoading(false)
  }

  const handleResend = async () => {
    setError("")
    const origin = window.location.origin
    const { error: resendError } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${origin}/cuenta`,
    })
    if (resendError) {
      setError(resendError.message || "No se pudo reenviar el correo")
    } else {
      setMessage("Se envió un nuevo código a tu correo.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-md px-4 pb-16 pt-28 sm:pt-32">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verificar correo</h1>
          <p className="mt-2 text-sm text-gray-600">Ingresa el código de 6 dígitos que enviamos a tu email.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          {message && <Alert className="mb-4">{message}</Alert>}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div>
              <Label htmlFor="otp">Código de verificación</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1.5 h-11 text-center text-lg tracking-widest"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <button type="button" onClick={handleResend} className="font-medium text-gray-800 hover:underline">
              Reenviar código
            </button>
            <Link href="/cuenta" className="text-gray-500 hover:text-gray-700">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyContent />
    </Suspense>
  )
}
