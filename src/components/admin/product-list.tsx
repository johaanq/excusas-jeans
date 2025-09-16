"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Edit, Trash2, Eye, Plus, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { extractStoragePath, deleteFilesFromStorage } from '@/lib/storage-utils'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import Link from 'next/link'

interface Producto {
  id: string
  nombre: string
  slug: string
  precio?: number
  precio_mayor?: number
  estado: string
  created_at: string
  foto_principal?: string
  colores: {
    id: string
    nombre: string
    fotos_color: { url: string }[]
  }[]
  tallas: {
    talla: string
    en_stock: boolean
  }[]
}

export function ProductList() {
  const { success, error, ToastContainer } = useToast()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsMounted(true)
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          colores (
            id,
            nombre,
            fotos_color (url)
          ),
          tallas (talla, en_stock)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error loading productos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProducto = async (id: string) => {
    const producto = productos.find(p => p.id === id)
    if (!producto) return

    const confirmed = await showConfirm({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que quieres eliminar "${producto.nombre}"? Esta acción eliminará permanentemente:\n\n• El producto y todos sus datos\n• Todas las imágenes asociadas\n• Colores, tallas y fotos relacionadas\n\nEsta acción NO se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    // Agregar ID a la lista de productos siendo eliminados
    setDeletingIds(prev => new Set(prev).add(id))

    try {
      // Primero obtener todos los datos del producto para eliminar las imágenes
      const { data: productoData } = await supabase
        .from('productos')
        .select(`
          foto_principal,
          colores (
            fotos_color (url)
          ),
          fotos_medidas (url)
        `)
        .eq('id', id)
        .single()

      if (productoData) {
        const imagesToDelete: string[] = []

        // Agregar imagen principal
        if (productoData.foto_principal) {
          const principalPath = extractStoragePath(productoData.foto_principal)
          if (principalPath) {
            imagesToDelete.push(principalPath)
          }
        }

        // Agregar imágenes de colores
        if (productoData.colores) {
          for (const color of productoData.colores) {
            if (color.fotos_color) {
              for (const foto of color.fotos_color) {
                const colorPath = extractStoragePath(foto.url)
                if (colorPath) {
                  imagesToDelete.push(colorPath)
                }
              }
            }
          }
        }

        // Agregar imágenes de medidas
        if (productoData.fotos_medidas) {
          for (const foto of productoData.fotos_medidas) {
            const medidaPath = extractStoragePath(foto.url)
            if (medidaPath) {
              imagesToDelete.push(medidaPath)
            }
          }
        }

        // Eliminar todas las imágenes del storage
        if (imagesToDelete.length > 0) {
          await deleteFilesFromStorage(supabase, 'productos', imagesToDelete)
        }
      }

      // Eliminar el producto (esto eliminará automáticamente colores, tallas, fotos por CASCADE)
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Recargar la lista
      await loadProductos()
      success('Producto eliminado', 'El producto ha sido eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting producto:', err)
      error('Error al eliminar producto', 'No se pudo eliminar el producto. Revisa la consola para más detalles.')
    } finally {
      // Remover ID de la lista de productos siendo eliminados
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }


  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    
    try {
      const { error } = await supabase
        .from('productos')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error
      
      // Recargar la lista
      await loadProductos()
    } catch (err) {
      console.error('Error updating estado:', err)
      error('Error al actualizar producto', 'No se pudo actualizar el estado del producto')
    }
  }

  // Evitar hidratación incorrecta mostrando contenido solo después del mount
  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        </div>
        <Link href="/admin/create">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Button>
        </Link>
      </div>

      {/* Lista de productos */}
      {productos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No hay productos creados</p>
            <p className="text-sm">Crea tu primer producto para comenzar</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {productos.map((producto) => (
            <Card key={producto.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                    <Badge variant={producto.estado === 'activo' ? 'default' : 'secondary'}>
                      {producto.estado}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Precios:</strong>
                      <div>Unitario: S/ {producto.precio || 'No definido'}</div>
                      <div>Mayor: S/ {producto.precio_mayor || 'No definido'}</div>
                    </div>
                    
                    <div>
                      <strong>Tallas:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {producto.tallas.map((talla, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {talla.talla}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Colores:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {producto.colores.map((color, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color.nombre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Imagen de preview */}
                  {(producto.foto_principal || (producto.colores.length > 0 && producto.colores[0].fotos_color.length > 0)) && (
                    <div className="mt-3">
                      <img
                        src={producto.foto_principal || producto.colores[0].fotos_color[0].url}
                        alt={producto.nombre}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Link href={`/producto/${producto.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  
                  <Link href={`/admin/edit/${producto.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEstado(producto.id, producto.estado)}
                    className="w-full"
                  >
                    {producto.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProducto(producto.id)}
                    disabled={deletingIds.has(producto.id)}
                    className="w-full text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingIds.has(producto.id) ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer />
      
      {/* Confirm Dialog */}
      <ConfirmDialogComponent />
    </div>
  )
}
