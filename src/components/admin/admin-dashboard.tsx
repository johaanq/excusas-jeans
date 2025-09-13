"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus, Package, Users, LogOut, Home, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface Stats {
  totalProductos: number
  productosActivos: number
  productosInactivos: number
  totalUsuarios: number
}

export function AdminDashboard() {
  const { logout } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
    totalUsuarios: 0
  })
  const [recentProducts, setRecentProducts] = useState<{ id: string; nombre: string; estado: string; precio?: number; precio_mayor?: number; created_at: string; colores: { nombre: string }[]; tallas: { talla: string }[] }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Cargar estadísticas
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('id, estado')

      if (productosError) throw productosError

      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id')

      if (usuariosError) throw usuariosError

      // Cargar productos recientes
      const { data: recentProductsData, error: recentError } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          estado,
          precio,
          precio_mayor,
          created_at,
          colores (nombre),
          tallas (talla)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentError) throw recentError

      setStats({
        totalProductos: productos?.length || 0,
        productosActivos: productos?.filter(p => p.estado === 'activo').length || 0,
        productosInactivos: productos?.filter(p => p.estado === 'inactivo').length || 0,
        totalUsuarios: usuarios?.length || 0
      })

      setRecentProducts(recentProductsData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Evitar hidratación incorrecta mostrando contenido solo después del mount
  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona tu tienda de jeans desde aquí</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <Home className="w-5 h-5" />
            <span className="font-medium">Ver sitio</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="text-gray-700 font-medium">Administrador</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProductos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productosActivos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productosInactivos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link href="/admin/create">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Producto
              </Button>
            </Link>
            
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Gestionar Productos
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Productos Recientes</h3>
          {recentProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay productos creados aún</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((producto) => (
                <div key={producto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{producto.nombre}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={producto.estado === 'activo' ? 'default' : 'secondary'} className="text-xs">
                        {producto.estado}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        S/ {producto.precio || 'No definido'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Link href={`/admin/edit/${producto.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
