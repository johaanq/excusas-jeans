"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserAuth } from '@/contexts/user-auth-context'
import {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
} from '@/components/auth/auth-verification-gate'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, LogOut } from 'lucide-react'
import { insforgeClient } from '@/lib/insforge-client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PEDIDO_ESTADO_LABEL, type Pedido } from '@/types/pedido'

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
  const [showAddressEditor, setShowAddressEditor] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [orders, setOrders] = useState<Pedido[]>([])
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

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const { data, error: loadError } = await insforgeClient
          .from('pedidos')
          .select('id, numero_pedido, estado, total, created_at')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (loadError) {
          setOrdersError('No se pudo cargar el historial de pedidos.')
          return
        }

        setOrders(((data as Partial<Pedido>[] | null) ?? []) as Pedido[])
      } catch {
        setOrdersError('No se pudo cargar el historial de pedidos.')
      } finally {
        setOrdersLoading(false)
      }
    }

    void loadOrders()
  }, [user?.id])

  const firstNames = useMemo(() => {
    const fullName = (user?.nombre || formData.nombre || '').trim()
    if (!fullName) return 'cliente'
    return fullName.split(/\s+/).slice(0, 2).join(' ')
  }, [user?.nombre, formData.nombre])

  const hasAddressData =
    Boolean(formData.provincia) ||
    Boolean(formData.distrito) ||
    Boolean(formData.direccion) ||
    Boolean(formData.empresa_envio) ||
    Boolean(formData.sede_envio)

  const buttonBase =
    'inline-flex items-center gap-2 border border-gray-900 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-900'
  const buttonGhost =
    'inline-flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-800 hover:text-gray-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-900'

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
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 pb-16 pt-28 sm:pt-32">
        <div className="mb-10 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Mi cuenta</p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-[2rem]">
              Bienvenido, {firstNames}
            </h1>
            <p className="mt-2 text-sm text-gray-600">Gestiona tus datos, direcciones y pedidos.</p>
          </div>
          <button type="button" onClick={handleLogout} className={buttonGhost}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        {emailLinkStatus === 'success' && bannerEmail && (
          <p className="mb-6 text-sm text-gray-600">
            Correo verificado para {bannerEmail}.
          </p>
        )}

        {emailLinkStatus === 'error' && bannerEmail && (
          <p className="mb-6 text-sm text-gray-500">
            No se pudo verificar el correo{emailLinkError ? `: ${emailLinkError}` : '.'}
          </p>
        )}

        {showVerificationBanner && emailLinkStatus !== 'error' && bannerEmail && (
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span>Tu correo aún no está verificado: {bannerEmail}</span>
            <button
              type="button"
              onClick={() => router.replace('/perfil', { scroll: false })}
              className="text-sm text-gray-500 underline underline-offset-4"
            >
              Entendido
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="border-b border-gray-200 pb-10">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold text-gray-900">Datos de la cuenta</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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
            </div>
          </section>

          <section className="border-b border-gray-200 pb-10">
            <div className="mb-5 flex flex-row items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Direcciones</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {hasAddressData
                    ? `${formData.provincia}${formData.distrito ? ` · ${formData.distrito}` : ''}`
                    : 'Aún no registras una dirección de envío.'}
                </p>
              </div>
              <button type="button" className={buttonGhost} onClick={() => setShowAddressEditor((prev) => !prev)}>
                {hasAddressData ? (showAddressEditor ? 'Ocultar' : 'Editar dirección') : 'Añadir dirección'}
              </button>
            </div>

            {hasAddressData && !showAddressEditor && (
              <div className="space-y-2 text-sm text-gray-700">
                {formData.provincia === 'Lima' ? (
                  <>
                    <p className="font-medium">{formData.direccion || 'Dirección por completar'}</p>
                    <p>{formData.distrito ? `${formData.distrito}, ` : ''}{formData.provincia}</p>
                    {formData.referencia && <p className="text-gray-500">Ref: {formData.referencia}</p>}
                  </>
                ) : (
                  <>
                    <p className="font-medium">{formData.provincia || 'Provincia por completar'}</p>
                    <p>{formData.empresa_envio || 'Empresa pendiente'}</p>
                    <p>{formData.sede_envio || 'Sede pendiente'}</p>
                  </>
                )}
              </div>
            )}

            {showAddressEditor && (
              <div className="space-y-4 border-t border-gray-200 pt-5">
                <div>
                  <Label htmlFor="provincia">Provincia *</Label>
                  <select
                    id="provincia"
                    value={formData.provincia}
                    onChange={(e) => handleInputChange('provincia', e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                  >
                    <option value="">Selecciona una provincia</option>
                    {PROVINCIAS_PERU.map((provincia) => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                </div>

                {formData.provincia === 'Lima' && (
                  <>
                    <div>
                      <Label htmlFor="distrito">Distrito *</Label>
                      <select
                        id="distrito"
                        value={formData.distrito}
                        onChange={(e) => handleInputChange('distrito', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">Selecciona un distrito</option>
                        {DISTRITOS_LIMA.map((distrito) => (
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

                {formData.provincia && formData.provincia !== 'Lima' && (
                  <>
                    <div>
                      <Label htmlFor="empresa_envio">Empresa de Envío *</Label>
                      <select
                        id="empresa_envio"
                        value={formData.empresa_envio}
                        onChange={(e) => handleInputChange('empresa_envio', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">Selecciona una empresa</option>
                        {EMPRESAS_ENVIO.map((empresa) => (
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
                      <p className="mt-1 text-xs text-gray-500">
                        Especifica la dirección completa de la sede donde se enviará tu pedido
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="pb-4">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold text-gray-900">Historial de pedidos</h2>
            </div>
            <div>
              {ordersLoading ? (
                <p className="text-sm text-gray-500">Cargando pedidos...</p>
              ) : ordersError ? (
                <p className="text-sm text-gray-500">{ordersError}</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-gray-500">Aún no tienes pedidos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-2 border-b border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.numero_pedido}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">S/ {Number(order.total).toFixed(2)}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {PEDIDO_ESTADO_LABEL[order.estado]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Mensajes de estado */}
          {error && <p className="text-sm text-gray-500">{error}</p>}

          {success && <p className="text-sm text-gray-500">{success}</p>}

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className={`${buttonBase} disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400`}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
