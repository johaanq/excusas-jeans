"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { adminQuery } from '@/lib/admin-api'
import { useAuth } from '@/contexts/auth-context'
import { adminUploadFile } from '@/lib/admin-storage'
import { useToast } from '@/components/ui/toast'
import { useAdminPath } from '@/hooks/use-admin-path'

interface ProductFormData {
  nombre: string
  precioUnitario: string
  precioMayor: string
  tallas: string[]
  colores: string[]
  fotosProducto: File[]
  fotoMedidas: File | null
}

interface ColorWithPhotos {
  nombre: string
  fotos: File[]
}

const TALLAS_DISPONIBLES = ['26', '28', '30', '32', '34']

const INITIAL_FORM: ProductFormData = {
  nombre: '',
  precioUnitario: '',
  precioMayor: '',
  tallas: [],
  colores: [],
  fotosProducto: [],
  fotoMedidas: null,
}

type ProductFormProps = {
  embedded?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ embedded = false, onSuccess, onCancel }: ProductFormProps) {
  const { logAdminAction, adminUser } = useAuth()
  const { success, error, ToastContainer } = useToast()
  const { adminPath } = useAdminPath()
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM)
  
  const [colorInput, setColorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coloresConFotos, setColoresConFotos] = useState<ColorWithPhotos[]>([])

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

  const uploadImage = async (file: File, path: string): Promise<string> => {
    return adminUploadFile('productos', file, path)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar datos del formulario
      console.log('Form data:', formData)
      console.log('Colores con fotos:', coloresConFotos)
      
      if (!formData.nombre.trim()) {
        throw new Error('El nombre del producto es requerido')
      }
      
      if (!formData.precioUnitario || parseFloat(formData.precioUnitario) <= 0) {
        throw new Error('El precio unitario debe ser mayor a 0')
      }
      
      if (!formData.precioMayor || parseFloat(formData.precioMayor) <= 0) {
        throw new Error('El precio por mayor debe ser mayor a 0')
      }
      
      if (formData.tallas.length === 0) {
        throw new Error('Debe seleccionar al menos una talla')
      }
      
      if (formData.colores.length === 0) {
        throw new Error('Debe agregar al menos un color')
      }
      
      const coloresSinFotos = formData.colores.filter((color) => {
        const colorConFotos = coloresConFotos.find((c) => c.nombre === color)
        return !colorConFotos || colorConFotos.fotos.length === 0
      })

      if (coloresSinFotos.length > 0) {
        throw new Error(`Los siguientes colores no tienen fotos: ${coloresSinFotos.join(', ')}`)
      }
      // Crear slug del nombre
      const slug = formData.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      

      // 1. Imagen principal: foto del producto o la primera foto del primer color
      let fotoPrincipalUrl: string | null = null
      if (formData.fotosProducto.length > 0) {
        fotoPrincipalUrl = await uploadImage(formData.fotosProducto[0], `${slug}/principal.jpg`)
      } else {
        const primerColor = formData.colores[0]
        const fotosPrimerColor = coloresConFotos.find((c) => c.nombre === primerColor)?.fotos
        if (fotosPrimerColor?.[0]) {
          fotoPrincipalUrl = await uploadImage(fotosPrimerColor[0], `${slug}/principal.jpg`)
        }
      }

      // 2. Crear el producto
      const productoData = {
        nombre: formData.nombre,
        slug,
        descripcion: '',
        precio: parseFloat(formData.precioUnitario) || null,
        precio_mayor: parseFloat(formData.precioMayor) || null,
        estado: 'activo',
        foto_principal: fotoPrincipalUrl
      }
      
      const productoRows = await adminQuery<{ id: string }[]>({
        op: 'insert',
        table: 'productos',
        data: productoData,
        select: '*',
      })
      const producto = productoRows[0]
      if (!producto) {
        throw new Error('Error creando producto: respuesta vacía')
      }
      

      // 3. Crear las tallas
      const tallasData = formData.tallas.map(talla => ({
        producto_id: producto.id,
        talla,
        en_stock: true
      }))

      await adminQuery({
        op: 'insert',
        table: 'tallas',
        data: tallasData,
      })

      // 4. Crear los colores y subir sus fotos
      for (let i = 0; i < formData.colores.length; i++) {
        const color = formData.colores[i]
        
        // Crear el color
        const colorDataToInsert = {
          producto_id: producto.id,
          nombre: color,
          hex: '#000000' // Color por defecto, se puede mejorar después
        }
        console.log('Color data to insert:', colorDataToInsert)
        
        const colorRows = await adminQuery<{ id: string }[]>({
          op: 'insert',
          table: 'colores',
          data: colorDataToInsert,
          select: '*',
        })
        const colorData = colorRows[0]
        if (!colorData) {
          throw new Error(`Error creando color ${color}`)
        }

        // Subir fotos específicas del color (fotos del formulario + fotos restantes del producto)
        const colorConFotos = coloresConFotos.find(c => c.nombre === color)
        const fotosColorData = []
        
        // Agregar fotos específicas del color si las hay
        if (colorConFotos && colorConFotos.fotos.length > 0) {
          for (let j = 0; j < colorConFotos.fotos.length; j++) {
            const file = colorConFotos.fotos[j]
            const fileName = `${slug}/colores/${color.toLowerCase().replace(/[^a-z0-9]/g, '-')}/foto-${j + 1}.jpg`
            
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
          const fileName = `${slug}/colores/${color.toLowerCase().replace(/[^a-z0-9]/g, '-')}/producto-${j + 1}.jpg`
          
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

      // 5. Subir foto de medidas
      if (formData.fotoMedidas) {
        const fileName = `${slug}/medidas.jpg`
        const url = await uploadImage(formData.fotoMedidas, fileName)
        
        await adminQuery({
          op: 'insert',
          table: 'fotos_medidas',
          data: {
            producto_id: producto.id,
            url,
          },
        })
      }

      const nombreCreado = formData.nombre
      const logMeta = {
        nombre: nombreCreado,
        precio: formData.precioUnitario,
        precio_mayor: formData.precioMayor,
        tallas: formData.tallas,
        colores: formData.colores,
      }

      if (adminUser) {
        await logAdminAction(
          'create_producto',
          `Creó nuevo producto: ${nombreCreado}`,
          'producto',
          producto.id,
          logMeta
        )
      }

      setFormData(INITIAL_FORM)
      setColoresConFotos([])
      setColorInput('')

      success('¡Producto creado!', `"${nombreCreado}" se agregó al catálogo.`)

      if (onSuccess) {
        onSuccess()
      } else {
        setTimeout(() => {
          window.location.href = adminPath('/products')
        }, 1500)
      }

    } catch (err) {
      console.error('Error creando producto:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      })
      
      // Mostrar mensaje más específico
      let errorMessage = 'Error al crear el producto.'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err)
      }
      
      error('Error al crear producto', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Fotos del Producto */}
          <div>
            <Label htmlFor="fotos-producto">Fotos del Producto (opcional)</Label>
            <p className="text-xs text-gray-500 mt-1">
              Si ya subiste fotos por color, no es obligatorio. La primera foto del primer color se usará
              como imagen principal del catálogo.
            </p>
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
            <Label htmlFor="foto-medidas">Foto de Medidas</Label>
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

          {/* Validación de imágenes */}
          {formData.colores.length > 0 && coloresConFotos.some(c => c.fotos.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Imágenes requeridas por color
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Debes subir al menos una imagen para cada color del producto.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={embedded ? "flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end" : ""}>
            {embedded && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.nombre ||
                !formData.precioUnitario ||
                !formData.precioMayor ||
                formData.tallas.length === 0 ||
                formData.colores.length === 0 ||
                coloresConFotos.some((c) => c.fotos.length === 0)
              }
              className={embedded ? "sm:min-w-[160px]" : "w-full"}
            >
              {isSubmitting ? "Creando…" : "Crear producto"}
            </Button>
          </div>
        </form>
  )

  return (
    <div>
      {embedded ? (
        formContent
      ) : (
        <Card className="border-slate-200/80 p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Datos del producto</h2>
          {formContent}
        </Card>
      )}
      <ToastContainer />
    </div>
  )
}
