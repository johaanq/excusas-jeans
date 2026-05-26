"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Edit, Trash2, Plus, Package } from 'lucide-react'
import { adminQuery } from '@/lib/admin-api'
import { extractStoragePath } from '@/lib/storage-utils'
import { adminDeleteFiles } from '@/lib/admin-storage'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCreateModal } from '@/components/admin/product-create-modal'
import { ProductEditModal } from '@/components/admin/product-edit-modal'
import { useAdminPath } from '@/hooks/use-admin-path'
import { cn } from '@/lib/utils'

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

function getProductPreviewUrl(producto: Producto): string | null {
  if (producto.foto_principal) return producto.foto_principal
  for (const color of producto.colores) {
    if (color.fotos_color?.[0]?.url) return color.fotos_color[0].url
  }
  return null
}

function formatPrecio(value?: number) {
  if (value == null) return '—'
  return `S/ ${value.toLocaleString('es-PE')}`
}

function ProductCard({
  producto,
  isDeleting,
  onEdit,
  onToggleEstado,
  onDelete,
}: {
  producto: Producto
  isDeleting: boolean
  onEdit: (id: string) => void
  onToggleEstado: (id: string, estado: string) => void
  onDelete: (id: string) => void
}) {
  const previewUrl = getProductPreviewUrl(producto)
  const tallasEnStock = producto.tallas.filter((t) => t.en_stock)

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Imagen */}
        <div className="relative aspect-[4/3] w-full shrink-0 bg-slate-100 sm:aspect-square sm:w-36 md:w-40">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center text-slate-400 sm:min-h-0">
              <Package className="h-10 w-10 opacity-40" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute left-2 top-2 sm:hidden">
            <EstadoBadge estado={producto.estado} />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {producto.nombre}
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">/{producto.slug}</p>
            </div>
            <div className="hidden sm:block">
              <EstadoBadge estado={producto.estado} />
            </div>
          </div>

          <dl className="mt-4 flex flex-col text-sm sm:flex-row sm:items-stretch">
            <div className="flex-1 border-b border-slate-200 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
              <dt className="text-xs font-semibold text-slate-500">Precios</dt>
              <dd className="mt-1.5 space-y-0.5 tabular-nums text-slate-800">
                <div>
                  <span className="text-slate-500">Unitario </span>
                  {formatPrecio(producto.precio)}
                </div>
                <div>
                  <span className="text-slate-500">Mayor </span>
                  {formatPrecio(producto.precio_mayor)}
                </div>
              </dd>
            </div>

            <div className="flex-1 border-b border-slate-200 py-3 sm:border-b-0 sm:border-r sm:py-0 sm:px-6">
              <dt className="text-xs font-semibold text-slate-500">Tallas</dt>
              <dd className="mt-1.5 text-slate-800">
                {producto.tallas.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  producto.tallas.map((talla, i) => (
                    <span key={talla.talla}>
                      {i > 0 && ', '}
                      <span className={cn(!talla.en_stock && 'text-slate-400 line-through')}>
                        {talla.talla}
                      </span>
                    </span>
                  ))
                )}
              </dd>
            </div>

            <div className="flex-1 pt-3 sm:pt-0 sm:pl-6">
              <dt className="text-xs font-semibold text-slate-500">Colores</dt>
              <dd className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-slate-800">
                {producto.colores.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  producto.colores.map((color, i) => (
                    <span key={color.id} className="inline-flex items-center gap-2">
                      {i > 0 && <span className="text-slate-300" aria-hidden>|</span>}
                      {color.nombre}
                    </span>
                  ))
                )}
              </dd>
            </div>
          </dl>

          {tallasEnStock.length > 0 && tallasEnStock.length < producto.tallas.length && (
            <p className="mt-2 text-xs text-amber-700">
              {producto.tallas.length - tallasEnStock.length} talla(s) sin stock
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 flex-row gap-2 border-t border-slate-200 p-3 sm:w-36 sm:flex-col sm:border-l sm:border-t-0">
          <Button
            type="button"
            size="sm"
            className="h-9 flex-1 gap-1.5 bg-slate-900 hover:bg-slate-800 sm:w-full"
            onClick={() => onEdit(producto.id)}
          >
            <Edit className="h-4 w-4 shrink-0" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 border-slate-200 sm:w-full"
            onClick={() => onToggleEstado(producto.id, producto.estado)}
          >
            {producto.estado === 'activo' ? 'Desactivar' : 'Activar'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 sm:w-full"
            onClick={() => onDelete(producto.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            {isDeleting ? '…' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const activo = estado === 'activo'
  return (
    <Badge
      className={cn(
        'shrink-0 border-0 text-[11px] font-medium uppercase tracking-wide',
        activo ? 'bg-emerald-600 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-200'
      )}
    >
      {estado}
    </Badge>
  )
}

export function ProductList() {
  const { success, error, ToastContainer } = useToast()
  const { adminPath } = useAdminPath()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editProductId, setEditProductId] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    loadProductos()
  }, [])

  useEffect(() => {
    const id = searchParams.get('edit')
    if (id) {
      setEditProductId(id)
      setEditModalOpen(true)
    }
  }, [searchParams])

  const openEditModal = (id: string) => {
    setEditProductId(id)
    setEditModalOpen(true)
  }

  const handleEditModalOpenChange = (open: boolean) => {
    setEditModalOpen(open)
    if (!open) {
      setEditProductId(null)
      if (searchParams.get('edit')) {
        router.replace(adminPath('/products'), { scroll: false })
      }
    }
  }

  const loadProductos = async () => {
    try {
      const data = await adminQuery<Producto[]>({
        op: 'select',
        table: 'productos',
        select: `*, colores (id, nombre, fotos_color (url)), tallas (talla, en_stock)`,
        order: { column: 'created_at', ascending: false },
      })
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
      const productoData = await adminQuery<{
        foto_principal?: string
        colores?: { fotos_color?: { url: string }[] }[]
        fotos_medidas?: { url: string }[]
      }>({
        op: 'select',
        table: 'productos',
        select: `foto_principal, colores (fotos_color (url)), fotos_medidas (url)`,
        match: { id },
        single: true,
      })

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
          await adminDeleteFiles('productos', imagesToDelete)
        }
      }

      // Eliminar el producto (esto eliminará automáticamente colores, tallas, fotos por CASCADE)
      await adminQuery({
        op: 'delete',
        table: 'productos',
        match: { id },
      })
      
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
      await adminQuery({
        op: 'update',
        table: 'productos',
        data: { estado: nuevoEstado },
        match: { id },
      })
      
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {productos.length} producto{productos.length !== 1 ? "s" : ""} en catálogo
        </p>
        <Button
          type="button"
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Lista de productos */}
      {productos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No hay productos creados</p>
            <p className="text-sm mb-4">Crea tu primer producto para comenzar</p>
            <Button type="button" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo producto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              isDeleting={deletingIds.has(producto.id)}
              onEdit={openEditModal}
              onToggleEstado={toggleEstado}
              onDelete={deleteProducto}
            />
          ))}
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer />
      
      <ProductCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={() => loadProductos()}
      />

      <ProductEditModal
        open={editModalOpen}
        productId={editProductId}
        onOpenChange={handleEditModalOpenChange}
        onUpdated={() => loadProductos()}
      />

      <ConfirmDialogComponent />
    </div>
  )
}
