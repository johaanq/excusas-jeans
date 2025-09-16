"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

interface AdminFormData {
  username: string
  password: string
  nombre: string
  email: string
}

export function AdminManagement() {
  const { adminUser, logAdminAction } = useAuth()
  const { success, error: showError, ToastContainer } = useToast()
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    password: '',
    nombre: '',
    email: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error: createError } = await supabase
        .rpc('crear_admin', {
          p_username: formData.username,
          p_password: formData.password,
          p_nombre: formData.nombre,
          p_email: formData.email || null
        })

      if (createError) {
        showError('Error al crear administrador', createError.message)
      } else {
        success('Administrador creado', `El administrador "${formData.nombre}" ha sido creado exitosamente`)
        
        // Registrar creación de admin en logs
        await logAdminAction(
          'create_admin',
          `Creó nuevo administrador: ${formData.nombre} (@${formData.username})`,
          'admin',
          data,
          { username: formData.username, email: formData.email }
        )
        
        setFormData({
          username: '',
          password: '',
          nombre: '',
          email: ''
        })
      }
    } catch (err) {
      showError('Error inesperado', 'No se pudo crear el administrador. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <UserPlus className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">
            Crear Nuevo Administrador
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin2"
                required
              />
            </div>

            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@excusas.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña segura"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creando...' : 'Crear Administrador'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Información de Seguridad</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Las contraseñas se almacenan con hash bcrypt</li>
            <li>• Solo administradores activos pueden iniciar sesión</li>
            <li>• Los usernames deben ser únicos</li>
            <li>• Se recomienda usar contraseñas seguras</li>
          </ul>
        </div>
      </Card>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
