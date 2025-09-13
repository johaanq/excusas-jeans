"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { X, Plus, Upload, Image as ImageIcon, LogOut, Home, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { uploadFileWithUniqueName } from '@/lib/storage-utils'
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

interface ExistingData {
  producto: any
  colores: any[]
  tallas: any[]
  fotosMedidas: any[]
}

const TALLAS_DISPONIBLES = ['26', '28', '30', '32', '34']

export function ProductEditForm({ productId }: { productId: string }) {
  const { logout } = useAuth()
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

  useEffect(() => {
    setIsMounted(true)
    loadProductData()
  }, [productId])

  const loadProductData = async () => {
    try {
      // Cargar datos del producto
      const { data: producto, error: productoError } = await supabase
        .from('productos')
        .select(`
          *,
          colores (
            id,
            nombre,
            hex,
            fotos_color (id, url)
          ),
          tallas (id, talla, en_stock),
          fotos_medidas (id, url)
        `)
        .eq('id', productId)
        .single()

      if (productoError) throw productoError

      // Cargar imágenes existentes
      const existingImages: string[] = []
      producto.colores.forEach((color: any) => {
        color.fotos_color.forEach((foto: any) => {
          existingImages.push(foto.url)
        })
      })

      setExistingData(producto)
      setExistingImages(existingImages)

      // Llenar el formulario con los datos existentes
      setFormData({
        nombre: producto.nombre,
        precioUnitario: producto.precio?.toString() || '',
        precioMayor: producto.precio_mayor?.toString() || '',
        tallas: producto.tallas.map((t: any) => t.talla),
        colores: producto.colores.map((c: any) => c.nombre),
        fotosProducto: [],
        fotoMedidas: null,
        estado: producto.estado
      })

    } catch (error) {
      console.error('Error loading product data:', error)
      alert('Error al cargar los datos del producto')
    } finally {
      setIsLoading(false)
    }
  }

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
      setFormData(prev => ({
        ...prev,
        colores: [...prev.colores, colorInput.trim()]
      }))
      setColorInput('')
    }
  }

  const handleColorRemove = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter(c => c !== color)
    }))
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
      const updateData: any = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precioUnitario) || null,
        precio_mayor: parseFloat(formData.precioMayor) || null,
        estado: formData.estado
      }
      
      // Solo actualizar foto_principal si hay una nueva
      if (fotoPrincipalUrl) {
        updateData.foto_principal = fotoPrincipalUrl
      }

      const { error: productoError } = await supabase
        .from('productos')
        .update(updateData)
        .eq('id', productId)

      if (productoError) throw productoError

      // 3. Actualizar tallas
      // Primero eliminar tallas existentes
      await supabase
        .from('tallas')
        .delete()
        .eq('producto_id', productId)

      // Crear nuevas tallas
      const tallasData = formData.tallas.map(talla => ({
        producto_id: productId,
        talla,
        en_stock: true
      }))

      const { error: tallasError } = await supabase
        .from('tallas')
        .insert(tallasData)

      if (tallasError) throw tallasError

      // 4. Actualizar colores
      // Primero eliminar colores existentes (esto también eliminará las fotos)
      await supabase
        .from('colores')
        .delete()
        .eq('producto_id', productId)

      // Crear nuevos colores
      for (let i = 0; i < formData.colores.length; i++) {
        const color = formData.colores[i]
        
        const { data: colorData, error: colorError } = await supabase
          .from('colores')
          .insert({
            producto_id: productId,
            nombre: color,
            hex: '#000000'
          })
          .select()
          .single()

        if (colorError) throw colorError

        // Subir fotos del color (fotos restantes del producto, después de la primera que ya se usó como principal)
        const fotosColorData = []
        
        // Agregar fotos restantes del producto (después de la primera que ya se usó como principal)
        const fotosRestantes = formData.fotosProducto.slice(1) // Excluir la primera foto
        const fotosPorColor = Math.floor(fotosRestantes.length / formData.colores.length)
        const inicioIndex = i * fotosPorColor
        const finIndex = i === formData.colores.length - 1 ? fotosRestantes.length : inicioIndex + fotosPorColor
        
        for (let j = inicioIndex; j < finIndex; j++) {
          const file = fotosRestantes[j]
          const fileName = `${productId}/${colorData.id}/producto-${j + 1}-${file.name}`
          
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
          const { error: fotosError } = await supabase
            .from('fotos_color')
            .insert(fotosColorData)

          if (fotosError) throw fotosError
        }
      }

      // 5. Actualizar foto de medidas si hay una nueva
      if (formData.fotoMedidas) {
        // Eliminar foto de medidas existente
        await supabase
          .from('fotos_medidas')
          .delete()
          .eq('producto_id', productId)

        // Subir nueva foto de medidas
        const fileName = `${productId}/medidas-${formData.fotoMedidas.name}`
        const url = await uploadImage(formData.fotoMedidas, fileName)
        
        const { error: medidasError } = await supabase
          .from('fotos_medidas')
          .insert({
            producto_id: productId,
            url
          })

        if (medidasError) throw medidasError
      }

      alert('Producto actualizado exitosamente!')
      
      // Redirigir a la lista de productos
      window.location.href = '/admin/products'

    } catch (error) {
      console.error('Error updating producto:', error)
      alert('Error al actualizar el producto. Revisa la consola para más detalles.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Evitar hidratación incorrecta mostrando contenido solo después del mount
  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con navegación */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a productos</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
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

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Editar Producto: {existingData?.producto?.nombre}</h2>
        
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
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.colores.map((color, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {color}
                    <button
                      type="button"
                      onClick={() => handleColorRemove(color)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Imágenes existentes */}
          {existingImages.length > 0 && (
            <div>
              <Label>Imágenes Actuales</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Imagen existente ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Las nuevas imágenes reemplazarán las existentes
              </p>
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

          {/* Foto de Medidas */}
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
    </div>
  )
}
