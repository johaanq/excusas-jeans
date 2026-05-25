"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { X, Plus, ArrowLeft } from 'lucide-react'
import { adminQuery } from '@/lib/admin-api'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { uploadFileWithUniqueName, extractStoragePath, deleteFilesFromStorage } from '@/lib/storage-utils'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import Link from 'next/link'

interface ProductFormData {
  nombre: string
  precioUnitario: string
  precioMayor: string
  tallas: string[]
  colores: string[]
  fotosProducto: File[]
  fotoMedidas: File | null
  estado: string
}

interface ColorWithPhotos {
  nombre: string
  fotos: File[]
}

interface ExistingData {
  producto: { id: string; nombre: string; precio?: number; precio_mayor?: number; estado: string }
  colores: { id: string; nombre: string; hex: string; fotos_color: { id: string; url: string }[] }[]
  tallas: { id: string; talla: string; en_stock: boolean }[]
  fotosMedidas: { id: string; url: string }[]
}

const TALLAS_DISPONIBLES = ['26', '28', '30', '32', '34']

export function ProductEditForm({ productId }: { productId: string }) {
  const { success, error, ToastContainer } = useToast()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    precioUnitario: '',
    precioMayor: '',
    tallas: [],
    colores: [],
    fotosProducto: [],
    fotoMedidas: null,
    estado: 'activo'
  })
  
  const [colorInput, setColorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [existingData, setExistingData] = useState<ExistingData | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [coloresConFotos, setColoresConFotos] = useState<ColorWithPhotos[]>([])

  const loadProductData = useCallback(async () => {
    try {
      // Cargar datos del producto
      const producto = await adminQuery<{
        id: string
        nombre: string
        precio?: number
        precio_mayor?: number
        estado: string
        colores: { id: string; nombre: string; hex: string; fotos_color: { id: string; url: string }[] }[]
        tallas: { id: string; talla: string; en_stock: boolean }[]
        fotos_medidas: { id: string; url: string }[]
      }>({
        op: 'select',
        table: 'productos',
        select: `*, colores (id, nombre, hex, fotos_color (id, url)), tallas (id, talla, en_stock), fotos_medidas (id, url)`,
        match: { id: productId },
        single: true,
      })

      const existingImages: string[] = []
      producto.colores.forEach((color) => {
        color.fotos_color.forEach((foto) => {
          existingImages.push(foto.url)
        })
      })

      setExistingData({
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          precio_mayor: producto.precio_mayor,
          estado: producto.estado,
        },
        colores: producto.colores,
        tallas: producto.tallas,
        fotosMedidas: producto.fotos_medidas,
      })
      setExistingImages(existingImages)

      // Llenar el formulario con los datos existentes
      setFormData({
        nombre: producto.nombre,
        precioUnitario: producto.precio?.toString() || '',
        precioMayor: producto.precio_mayor?.toString() || '',
        tallas: producto.tallas.map((t: { talla: string }) => t.talla),
        colores: producto.colores.map((c: { nombre: string }) => c.nombre),
        fotosProducto: [],
        fotoMedidas: null,
        estado: producto.estado
      })

    } catch (err) {
      console.error('Error loading product data:', err)
      error('Error al cargar producto', 'No se pudieron cargar los datos del producto')
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    setIsMounted(true)
    loadProductData()
  }, [productId, loadProductData])

  const handleTallaToggle = (talla: string) => {
    setFormData(prev => ({
      ...prev,
      tallas: prev.tallas.includes(talla)
        ? prev.tallas.filter(t => t !== talla)
        : [...prev.tallas, talla]
    }))
  }

  const handleColorAdd = () => {
    if (colorInput.trim() && !formData.colores.includes(colorInput.trim())) {
      const nuevoColor = colorInput.trim()
      setFormData(prev => ({
        ...prev,
        colores: [...prev.colores, nuevoColor]
      }))
      setColoresConFotos(prev => [...prev, { nombre: nuevoColor, fotos: [] }])
      setColorInput('')
    }
  }

  const handleColorRemove = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter(c => c !== color)
    }))
    setColoresConFotos(prev => prev.filter(c => c.nombre !== color))
  }

  const handleFotosProductoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      fotosProducto: [...prev.fotosProducto, ...files]
    }))
  }

  const handleFotoMedidasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      fotoMedidas: file
    }))
  }

  const removeFotoProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotosProducto: prev.fotosProducto.filter((_, i) => i !== index)
    }))
  }

  const handleFotosColorChange = (colorNombre: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setColoresConFotos(prev => 
      prev.map(color => 
        color.nombre === colorNombre 
          ? { ...color, fotos: [...color.fotos, ...files] }
          : color
      )
    )
  }

  const removeFotoColor = (colorNombre: string, index: number) => {
    setColoresConFotos(prev => 
      prev.map(color => 
        color.nombre === colorNombre 
          ? { ...color, fotos: color.fotos.filter((_, i) => i !== index) }
          : color
      )
    )
  }

  const removeExistingFotoColor = async (colorId: string, fotoId: string, fotoUrl: string) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Foto',
      message: '¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      // Eliminar de la base de datos
      await adminQuery({
        op: 'delete',
        table: 'fotos_color',
        match: { id: fotoId },
      })

      const path = extractStoragePath(fotoUrl)
      if (path) {
        await deleteFilesFromStorage(supabase, 'productos', [path])
      }

      await loadProductData()

      success('Foto eliminada', 'La foto ha sido eliminada exitosamente')
    } catch (err) {
      console.error('Error deleting foto:', err)
      error('Error al eliminar foto', 'No se pudo eliminar la foto. Intenta nuevamente.')
    }
  }

  const removeFotoMedidas = async (fotoId: string, fotoUrl: string) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Foto de Medidas',
      message: '¿Estás seguro de que quieres eliminar esta foto de medidas? Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      // Eliminar de la base de datos
      await adminQuery({
        op: 'delete',
        table: 'fotos_medidas',
        match: { id: fotoId },
      })

      const path = extractStoragePath(fotoUrl)
      if (path) {
        await deleteFilesFromStorage(supabase, 'productos', [path])
      }

      // Actualizar estado local - recargar datos del producto
      await loadProductData()

      success('Foto eliminada', 'La foto de medidas ha sido eliminada exitosamente')
    } catch (err) {
      console.error('Error deleting foto medidas:', err)
      error('Error al eliminar foto', 'No se pudo eliminar la foto de medidas. Intenta nuevamente.')
    }
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    return uploadFileWithUniqueName(supabase, 'productos', file, path)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Subir nueva imagen principal si hay fotos nuevas
      let fotoPrincipalUrl = null
      if (formData.fotosProducto.length > 0) {
        const primeraFoto = formData.fotosProducto[0]
        const fileName = `productos/${productId}-principal-${primeraFoto.name}`
        fotoPrincipalUrl = await uploadImage(primeraFoto, fileName)
      }

      // 2. Actualizar el producto
      const updateData: { nombre: string; precio: number | null; precio_mayor: number | null; estado: string; foto_principal?: string } = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precioUnitario) || null,
        precio_mayor: parseFloat(formData.precioMayor) || null,
        estado: formData.estado
      }
      
      // Solo actualizar foto_principal si hay una nueva
      if (fotoPrincipalUrl) {
        updateData.foto_principal = fotoPrincipalUrl
      }

      await adminQuery({
        op: 'update',
        table: 'productos',
        data: updateData,
        match: { id: productId },
      })

      // 3. Actualizar tallas
      await adminQuery({
        op: 'delete',
        table: 'tallas',
        match: { producto_id: productId },
      })

      const tallasData = formData.tallas.map(talla => ({
        producto_id: productId,
        talla,
        en_stock: true
      }))

      await adminQuery({
        op: 'insert',
        table: 'tallas',
        data: tallasData,
      })

      // 4. Actualizar colores
      await adminQuery({
        op: 'delete',
        table: 'colores',
        match: { producto_id: productId },
      })

      // Crear nuevos colores
      for (let i = 0; i < formData.colores.length; i++) {
        const color = formData.colores[i]
        
        const colorRows = await adminQuery<{ id: string }[]>({
          op: 'insert',
          table: 'colores',
          data: {
            producto_id: productId,
            nombre: color,
            hex: '#000000',
          },
          select: '*',
        })
        const colorData = colorRows[0]
        if (!colorData) throw new Error(`Error creando color ${color}`)

        // Subir fotos específicas del color
        const fotosColorData = []
        
        // Agregar fotos específicas del color si las hay
        const colorConFotos = coloresConFotos.find(c => c.nombre === color)
        if (colorConFotos && colorConFotos.fotos.length > 0) {
          for (let j = 0; j < colorConFotos.fotos.length; j++) {
            const file = colorConFotos.fotos[j]
            const fileName = `${productId}/colores/${color.toLowerCase().replace(/[^a-z0-9]/g, '-')}/foto-${j + 1}.jpg`
            
            try {
              const url = await uploadImage(file, fileName)
              fotosColorData.push({
                color_id: colorData.id,
                url
              })
            } catch (error) {
              console.error('Error subiendo foto:', error)
            }
          }
        }
        
        // Agregar fotos restantes del producto (después de la primera que ya se usó como principal)
        const fotosRestantes = formData.fotosProducto.slice(1) // Excluir la primera foto
        const fotosPorColor = Math.floor(fotosRestantes.length / formData.colores.length)
        const inicioIndex = i * fotosPorColor
        const finIndex = i === formData.colores.length - 1 ? fotosRestantes.length : inicioIndex + fotosPorColor
        
        for (let j = inicioIndex; j < finIndex; j++) {
          const file = fotosRestantes[j]
          const fileName = `${productId}/colores/${color.toLowerCase().replace(/[^a-z0-9]/g, '-')}/producto-${j + 1}.jpg`
          
          try {
            const url = await uploadImage(file, fileName)
            fotosColorData.push({
              color_id: colorData.id,
              url
            })
          } catch (error) {
            console.error('Error subiendo foto:', error)
          }
        }

        if (fotosColorData.length > 0) {
          await adminQuery({
            op: 'insert',
            table: 'fotos_color',
            data: fotosColorData,
          })
        }
      }

      // 5. Actualizar foto de medidas si hay una nueva
      if (formData.fotoMedidas) {
        // Eliminar foto de medidas existente
        await adminQuery({
          op: 'delete',
          table: 'fotos_medidas',
          match: { producto_id: productId },
        })

        const fileName = `${productId}/medidas-${formData.fotoMedidas.name}`
        const url = await uploadImage(formData.fotoMedidas, fileName)
        
        await adminQuery({
          op: 'insert',
          table: 'fotos_medidas',
          data: {
            producto_id: productId,
            url,
          },
        })
      }

      success('¡Producto actualizado exitosamente!', `El producto "${formData.nombre}" ha sido actualizado correctamente.`)
      
      // Redirigir a la lista de productos
      window.location.href = '/admin/products'

    } catch (err) {
      console.error('Error updating producto:', err)
      error('Error al actualizar producto', 'No se pudo actualizar el producto. Revisa la consola para más detalles.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Evitar hidratación incorrecta mostrando contenido solo después del mount
  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a productos
      </Link>

      <Card className="border-slate-200/80 p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          Editar: {existingData?.producto?.nombre}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estado del producto */}
          <div>
            <Label htmlFor="estado">Estado del Producto</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Nombre del producto */}
          <div>
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Jeans Clásicos Azul"
              required
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio-unitario">Precio Unitario (S/)</Label>
              <Input
                id="precio-unitario"
                type="number"
                step="0.01"
                min="0"
                value={formData.precioUnitario}
                onChange={(e) => setFormData(prev => ({ ...prev, precioUnitario: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="precio-mayor">Precio por Mayor (S/)</Label>
              <Input
                id="precio-mayor"
                type="number"
                step="0.01"
                min="0"
                value={formData.precioMayor}
                onChange={(e) => setFormData(prev => ({ ...prev, precioMayor: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Tallas */}
          <div>
            <Label>Tallas Disponibles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TALLAS_DISPONIBLES.map(talla => (
                <Button
                  key={talla}
                  type="button"
                  variant={formData.tallas.includes(talla) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTallaToggle(talla)}
                >
                  {talla}
                </Button>
              ))}
            </div>
            {formData.tallas.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Tallas seleccionadas: {formData.tallas.join(', ')}
              </p>
            )}
          </div>

          {/* Colores */}
          <div>
            <Label htmlFor="color">Colores</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="Ej: Azul Óxido"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleColorAdd())}
              />
              <Button type="button" onClick={handleColorAdd} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.colores.length > 0 && (
              <div className="space-y-4 mt-4">
                {formData.colores.map((color, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {color}
                        <button
                          type="button"
                          onClick={() => handleColorRemove(color)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </div>
                    
                    {/* Fotos específicas para este color */}
                    <div>
                      <Label htmlFor={`fotos-${color}`} className="text-sm">
                        Fotos para {color}
                      </Label>
                      <Input
                        id={`fotos-${color}`}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFotosColorChange(color, e)}
                        className="mt-1"
                      />
                      
                      {coloresConFotos.find(c => c.nombre === color)?.fotos && coloresConFotos.find(c => c.nombre === color)!.fotos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {coloresConFotos.find(c => c.nombre === color)?.fotos?.map((file, fileIndex) => (
                            <div key={fileIndex} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`${color} ${fileIndex + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeFotoColor(color, fileIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fotos por Color Existentes */}
          {existingData?.colores.some(color => color.fotos_color && color.fotos_color.length > 0) && (
            <div>
              <Label>Fotos Actuales por Color</Label>
              <div className="space-y-4 mt-2">
                {existingData?.colores.map((color) => (
                  color.fotos_color && color.fotos_color.length > 0 && (
                    <div key={color.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{color.nombre}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {color.fotos_color.map((foto) => (
                          <div key={foto.id} className="relative">
                            <img
                              src={foto.url}
                              alt={`${color.nombre} ${foto.id}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingFotoColor(color.id, foto.id, foto.url)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Fotos del Producto */}
          <div>
            <Label htmlFor="fotos-producto">Nuevas Fotos del Producto (opcional)</Label>
            <div className="mt-2">
              <Input
                id="fotos-producto"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFotosProductoChange}
                className="mb-2"
              />
              
              {formData.fotosProducto.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {formData.fotosProducto.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFotoProducto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fotos de Medidas Existentes */}
          {existingData?.fotosMedidas && existingData.fotosMedidas.length > 0 && (
            <div>
              <Label>Fotos de Medidas Actuales</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {existingData?.fotosMedidas.map((foto) => (
                  <div key={foto.id} className="relative">
                    <img
                      src={foto.url}
                      alt="Foto de medidas"
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFotoMedidas(foto.id, foto.url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nueva Foto de Medidas */}
          <div>
            <Label htmlFor="foto-medidas">Nueva Foto de Medidas (opcional)</Label>
            <Input
              id="foto-medidas"
              type="file"
              accept="image/*"
              onChange={handleFotoMedidasChange}
              className="mt-2"
            />
            
            {formData.fotoMedidas && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData.fotoMedidas)}
                  alt="Preview medidas"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.nombre || !formData.precioUnitario || !formData.precioMayor || formData.tallas.length === 0 || formData.colores.length === 0}
            className="w-full"
          >
            {isSubmitting ? 'Actualizando Producto...' : 'Actualizar Producto'}
          </Button>
        </form>
      </Card>
      
      {/* Toast Container */}
      <ToastContainer />
      
      {/* Confirm Dialog */}
      <ConfirmDialogComponent />
    </div>
  )
}
