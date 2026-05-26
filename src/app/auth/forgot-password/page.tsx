"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { insforgeClient } from "@/lib/insforge-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    const { error: sendError } = await insforgeClient.auth.sendResetPasswordEmail(email.trim())

    setIsLoading(false)

    if (sendError) {
      setError(sendError.message || "No se pudo enviar el correo de recuperación")
      return
    }

    setSent(true)
    setMessage(
      "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-md px-4 pb-16 pt-28 sm:pt-32">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-gray-600">
            Te enviaremos un enlace a tu correo para crear una nueva contraseña.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          {message && <Alert className="mb-4">{message}</Alert>}

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-11"
                  placeholder="nombre@correo.com"
                  required
                />
              </div>
              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
          ) : (
            <Button asChild className="h-11 w-full">
              <Link href="/cuenta">Volver a iniciar sesión</Link>
            </Button>
          )}

          <p className="mt-4 text-center text-sm">
            <Link href="/cuenta" className="font-medium text-gray-800 hover:underline">
              ← Volver a la cuenta
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
