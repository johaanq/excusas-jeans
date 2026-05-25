"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(username, password)
      if (success) {
        router.push("/admin")
      } else {
        setError("Usuario o contraseña incorrectos")
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel marca */}
      <div className="relative hidden w-[45%] overflow-hidden bg-[#0c0c0c] lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/hero1.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 p-10 xl:p-14">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo-excusas.png" alt="Excusas Jeans" width={44} height={44} className="rounded-md" />
            <span className="text-lg font-semibold tracking-wide text-white">Excusas Jeans</span>
          </Link>
        </div>

        <div className="relative z-10 px-10 pb-14 xl:px-14">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Acceso interno</p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-white xl:text-4xl">
            Gestión de catálogo y pedidos
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Panel reservado al equipo. Los clientes ingresan desde la tienda.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 flex-col justify-center bg-[#fafafa] px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-10 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo-excusas.png" alt="Excusas" width={36} height={36} />
              <span className="font-semibold text-gray-900">Excusas Jeans</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ingresar al panel</h1>
            <p className="mt-2 text-sm text-gray-500">Usa las credenciales que te asignó el administrador.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-12 border-gray-300 bg-white text-base"
                placeholder="ej. admin"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contraseña
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-300 bg-white pr-12 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-gray-900 text-base font-semibold hover:bg-gray-800"
            >
              {isLoading ? "Verificando..." : "Entrar al panel"}
            </Button>
          </form>

          <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-8 text-sm text-gray-500">
            <Link href="/" className="font-medium text-gray-700 hover:text-gray-900">
              ← Volver a la tienda
            </Link>
            <Link href="/cuenta" className="text-gray-500 hover:text-gray-700">
              ¿Eres cliente? Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
