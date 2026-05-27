"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserAuth } from '@/contexts/user-auth-context'
import { ProfileEmailVerificationBanner } from '@/components/auth/profile-email-verification-banner'
import {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
} from '@/components/auth/auth-verification-gate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Save, User, MapPin, LogOut } from 'lucide-react'
import { insforgeClient } from '@/lib/insforge-client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface ProfileFormData {
  nombre: string
  email: string
  telefono: string
  dni: string
  provincia: string
  distrito: string
  direccion: string
  referencia: string
  codigo_postal: string
  empresa_envio: string
  sede_envio: string
}

const PROVINCIAS_PERU = [
  'Lima',
  'Arequipa',
  'Cusco',
  'La Libertad',
  'Piura',
  'Lambayeque',
  'Junín',
  'Cajamarca',
  'Puno',
  'Tacna',
  'Ica',
  'Ancash',
  'San Martín',
  'Loreto',
  'Ucayali',
  'Huánuco',
  'Pasco',
  'Huancavelica',
  'Ayacucho',
  'Apurímac',
  'Moquegua',
  'Madre de Dios',
  'Amazonas',
  'Tumbes'
]

const DISTRITOS_LIMA = [
  'Ancón',
  'Ate',
  'Barranco',
  'Breña',
  'Carabayllo',
  'Chaclacayo',
  'Chorrillos',
  'Cieneguilla',
  'Comas',
  'El Agustino',
  'Independencia',
  'Jesús María',
  'La Molina',
  'La Victoria',
  'Lince',
  'Los Olivos',
  'Lurigancho',
  'Lurín',
  'Magdalena del Mar',
  'Miraflores',
  'Pachacámac',
  'Pucusana',
  'Pueblo Libre',
  'Puente Piedra',
  'Punta Hermosa',
  'Punta Negra',
  'Rímac',
  'San Bartolo',
  'San Borja',
  'San Isidro',
  'San Juan de Lurigancho',
  'San Juan de Miraflores',
  'San Luis',
  'San Martín de Porres',
  'San Miguel',
  'Santa Anita',
  'Santa María del Mar',
  'Santa Rosa',
  'Santiago de Surco',
  'Surquillo',
  'Villa El Salvador',
  'Villa María del Triunfo'
]

const EMPRESAS_ENVIO = [
  'Shalom',
  'Marivsur',
  'Flores'
]

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading, emailVerified, refreshUser, logout } = useUserAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const emailLinkStatus = useMemo(() => {
    const type = searchParams.get('insforge_type')
    const status = searchParams.get('insforge_status')
    if (type !== 'verify_email') return null
    if (status === 'success') return 'success' as const
    if (status === 'error') return 'error' as const
    return null
  }, [searchParams])

  const emailLinkError = searchParams.get('insforge_error')
    ? decodeURIComponent(searchParams.get('insforge_error')!)
    : ''

  useEffect(() => {
    if (emailLinkStatus === 'success') {
      void refreshUser()
      setSuccess('¡Correo verificado correctamente!')
      clearPendingVerifyEmail()
      router.replace('/perfil', { scroll: false })
    } else if (emailLinkStatus === 'error') {
      router.replace('/perfil', { scroll: false })
    }
  }, [emailLinkStatus, refreshUser, router])

  const bannerEmail = user?.email || getPendingVerifyEmail(searchParams)

  const showVerificationBanner =
    isAuthenticated && !emailVerified && emailLinkStatus !== 'success' && Boolean(bannerEmail)

  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    codigo_postal: '',
    empresa_envio: '',
    sede_envio: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/cuenta?redirect=/perfil')
      return
    }

    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        dni: user.dni || '',
        provincia: user.provincia || '',
        distrito: user.distrito || '',
        direccion: user.direccion || '',
        referencia: user.referencia || '',
        codigo_postal: user.codigo_postal || '',
        empresa_envio: user.empresa_envio || '',
        sede_envio: user.sede_envio || ''
      })
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar campos relacionados cuando cambia la provincia
    if (field === 'provincia') {
      setFormData(prev => ({
        ...prev,
        provincia: value,
        distrito: '',
        empresa_envio: '',
        sede_envio: ''
      }))
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      if (!user) {
        setError('Usuario no encontrado')
        return
      }

      const { error: updateError } = await insforgeClient
        .from('usuarios')
        .update({
          nombre: formData.nombre,
          telefono: formData.telefono,
          dni: formData.dni,
          provincia: formData.provincia,
          distrito: formData.distrito,
          direccion: formData.direccion,
          referencia: formData.referencia,
          codigo_postal: formData.codigo_postal,
          empresa_envio: formData.empresa_envio,
          sede_envio: formData.sede_envio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Error al actualizar el perfil: ' + updateError.message)
      } else {
        setSuccess('Perfil actualizado exitosamente')
        // Actualizar los datos del usuario en el contexto
        await refreshUser()
      }
    } catch {
      setError('Error inesperado al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[50vh] items-center justify-center pt-24">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 pb-12 pt-28 sm:pt-32">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <User className="h-6 w-6 text-gray-600 sm:h-8 sm:w-8" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Mi Perfil</h1>
              <p className="text-sm text-gray-600 sm:text-base">
                Actualiza tu información personal y dirección de envío
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 self-start"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {emailLinkStatus === 'success' && bannerEmail && (
          <ProfileEmailVerificationBanner email={bannerEmail} variant="success" />
        )}

        {emailLinkStatus === 'error' && bannerEmail && (
          <ProfileEmailVerificationBanner
            email={bannerEmail}
            variant="error"
            errorMessage={emailLinkError}
          />
        )}

        {showVerificationBanner && emailLinkStatus !== 'error' && bannerEmail && (
          <ProfileEmailVerificationBanner
            email={bannerEmail}
            variant="pending"
            onDismissQuery={() => router.replace('/perfil', { scroll: false })}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                </div>

                <div>
                  <Label htmlFor="telefono">Celular *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Ej: 987654321"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    placeholder="Ej: 12345678"
                    maxLength={8}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provincia">Provincia *</Label>
                <select
                  id="provincia"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Selecciona una provincia</option>
                  {PROVINCIAS_PERU.map(provincia => (
                    <option key={provincia} value={provincia}>{provincia}</option>
                  ))}
                </select>
              </div>

              {/* Campos específicos para Lima */}
              {formData.provincia === 'Lima' && (
                <>
                  <div>
                    <Label htmlFor="distrito">Distrito *</Label>
                    <select
                      id="distrito"
                      value={formData.distrito}
                      onChange={(e) => handleInputChange('distrito', e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="">Selecciona un distrito</option>
                      {DISTRITOS_LIMA.map(distrito => (
                        <option key={distrito} value={distrito}>{distrito}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      placeholder="Ej: Av. Principal 123"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="referencia">Referencia</Label>
                    <Textarea
                      id="referencia"
                      value={formData.referencia}
                      onChange={(e) => handleInputChange('referencia', e.target.value)}
                      placeholder="Ej: Frente al parque, casa azul"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo_postal">Código Postal</Label>
                    <Input
                      id="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                      placeholder="Ej: 15001"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {/* Campos para otras provincias */}
              {formData.provincia && formData.provincia !== 'Lima' && (
                <>
                  <div>
                    <Label htmlFor="empresa_envio">Empresa de Envío *</Label>
                    <select
                      id="empresa_envio"
                      value={formData.empresa_envio}
                      onChange={(e) => handleInputChange('empresa_envio', e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="">Selecciona una empresa</option>
                      {EMPRESAS_ENVIO.map(empresa => (
                        <option key={empresa} value={empresa}>{empresa}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="sede_envio">Sede de Envío *</Label>
                    <Input
                      id="sede_envio"
                      value={formData.sede_envio}
                      onChange={(e) => handleInputChange('sede_envio', e.target.value)}
                      placeholder="Ej: Sede Central - Av. Principal 456"
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Especifica la dirección completa de la sede donde se enviará tu pedido
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mensajes de estado */}
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              {success}
            </Alert>
          )}

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
