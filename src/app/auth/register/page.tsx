"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/contexts/user-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useUserAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password
      })

      if (result.success) {
        router.push('/auth/login?message=Cuenta creada exitosamente')
      } else {
        setError(result.error || 'Error al crear la cuenta')
      }
    } catch {
      setError('Error inesperado al registrarse')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8">
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-600">
            Regístrate para guardar tus productos favoritos
          </p>
        </div>

        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <div>
              <Label htmlFor="nombre" className="text-sm md:text-base">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Tu nombre completo"
                required
                className="mt-1 text-sm md:text-base"
              />
            </div>

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
              <Label htmlFor="telefono" className="text-sm md:text-base">Teléfono (Opcional)</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+51 999 999 999"
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
                placeholder="Mínimo 6 caracteres"
                required
                className="mt-1 text-sm md:text-base"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite tu contraseña"
                required
                className="mt-1 text-sm md:text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-sm md:text-base"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <p className="text-xs md:text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-gray-900 hover:text-gray-700">
                Inicia sesión
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
