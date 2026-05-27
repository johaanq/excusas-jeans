"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useUserAuth } from "@/contexts/user-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  buildProfileVerifyUrl,
  setPendingVerifyEmail,
} from "@/components/auth/auth-verification-gate"

type AuthTab = "login" | "register"

export function UserAuthPanel() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login, register, isAuthenticated } = useUserAuth()

  const [tab, setTab] = useState<AuthTab>("login")
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setHydrated(true)

    const msg = searchParams.get("message")
    if (msg) setMessage(msg)

    const emailParam = searchParams.get("email")
    if (emailParam) {
      setLoginData((p) => ({ ...p, email: emailParam }))
    }

    const t = searchParams.get("tab")
    if (t === "register" || t === "login") setTab(t)
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect")
      if (redirect) router.replace(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    const result = await login(loginData)
    if (result.success) {
      if (result.needsVerification && result.email) {
        setPendingVerifyEmail(result.email)
        router.replace(buildProfileVerifyUrl(result.email))
      } else {
        router.replace(searchParams.get("redirect") || "/")
      }
    } else if (result.needsVerification && result.email) {
      setPendingVerifyEmail(result.email)
      router.replace(buildProfileVerifyUrl(result.email))
    } else {
      setError(result.error || "Error al iniciar sesión")
    }
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }
    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    const nombre = [registerData.nombres, registerData.apellidos]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ")

    if (!nombre) {
      setError("Ingresa tu nombre y apellidos")
      setIsLoading(false)
      return
    }

    const result = await register({
      nombre,
      email: registerData.email,
      password: registerData.password,
    })

    if (result.success) {
      setPendingVerifyEmail(registerData.email)
      router.replace(
        result.needsVerification
          ? buildProfileVerifyUrl(registerData.email)
          : "/perfil"
      )
    } else {
      setError(result.error || "Error al crear la cuenta")
      if (result.emailConflict) {
        setTab("login")
        setLoginData((p) => ({ ...p, email: registerData.email }))
      }
    }
    setIsLoading(false)
  }

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-md" aria-hidden="true">
        <div className="mb-8 text-center">
          <div className="mx-auto h-8 w-40 rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="mb-6 h-12 rounded-lg bg-gray-100" />
        <div className="h-[28rem] animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {tab === "login" ? "Tu cuenta" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {tab === "login"
            ? "Guarda tu carrito y completa tus datos de envío"
            : "Únete para comprar más rápido y seguir tu pedido"}
        </p>
      </div>

      <div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setTab("login")
            setError("")
          }}
          className={cn(
            "flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors",
            tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register")
            setError("")
          }}
          className={cn(
            "flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors",
            tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Registrarse
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {message && <Alert className="mb-4">{message}</Alert>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="login-email">Correo</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={loginData.email}
                onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                className="mt-1.5 h-11"
                placeholder="nombre@correo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="login-password">Contraseña</Label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={loginData.password}
                onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <p className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </div>
            <Button type="submit" disabled={isLoading} className="h-11 w-full text-base">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-nombres">Nombres</Label>
                <Input
                  id="reg-nombres"
                  autoComplete="given-name"
                  value={registerData.nombres}
                  onChange={(e) => setRegisterData((p) => ({ ...p, nombres: e.target.value }))}
                  className="mt-1.5 h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-apellidos">Apellidos</Label>
                <Input
                  id="reg-apellidos"
                  autoComplete="family-name"
                  value={registerData.apellidos}
                  onChange={(e) => setRegisterData((p) => ({ ...p, apellidos: e.target.value }))}
                  className="mt-1.5 h-11"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reg-email">Correo</Label>
              <Input
                id="reg-email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData((p) => ({ ...p, email: e.target.value }))}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div>
              <Label htmlFor="reg-password">Contraseña</Label>
              <PasswordInput
                id="reg-password"
                autoComplete="new-password"
                value={registerData.password}
                onChange={(e) => setRegisterData((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
              <PasswordInput
                id="reg-confirm"
                autoComplete="new-password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="h-11 w-full text-base">
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/catalogo" className="font-medium text-gray-800 underline-offset-4 hover:underline">
          Seguir comprando
        </Link>
      </p>
    </div>
  )
}
