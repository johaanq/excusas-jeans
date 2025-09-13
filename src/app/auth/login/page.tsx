"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserAuth } from '@/contexts/user-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useUserAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar si hay un mensaje de éxito
    const successMessage = searchParams.get('message')
    if (successMessage) {
      setMessage(successMessage)
    }

    // Si ya está autenticado, redirigir al inicio
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await login(formData)

      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch {
      setError('Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-3 md:mb-4">
            <img 
              src="/logo-excusas.png" 
              alt="Logo Excusas" 
              className="h-10 w-10 md:h-12 md:w-12 object-contain"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-600">
            Accede a tu cuenta para ver tu carrito guardado
          </p>
        </div>

        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            {message && (
              <Alert>
                {message}
              </Alert>
            )}

            <div>
              <Label htmlFor="email" className="text-sm md:text-base">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
                className="mt-1 text-sm md:text-base"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm md:text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Tu contraseña"
                required
                className="mt-1 text-sm md:text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-sm md:text-base"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <p className="text-xs md:text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/register" className="font-medium text-gray-900 hover:text-gray-700">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-xs md:text-sm text-gray-500 hover:text-gray-700">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
