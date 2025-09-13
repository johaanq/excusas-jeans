"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, SupabaseColor, SupabaseFotoColor, SupabaseTalla, SupabaseFotoMedida } from '@/data/productos'

export function useSupabaseProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const fetchProductos = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener productos activos
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select(`
          *,
          colores (
            *,
            fotos_color (*)
          ),
          tallas (*),
          fotos_medidas (*)
        `)
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })

      if (productosError) throw productosError

      // Transformar los datos al formato esperado
      const productosFormateados: Producto[] = productosData?.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        precio_mayor: producto.precio_mayor,
        estado: producto.estado,
        created_at: producto.created_at,
        foto_principal: producto.foto_principal,
        colores: producto.colores?.map((color: SupabaseColor) => ({
          id: color.id,
          producto_id: color.producto_id,
          nombre: color.nombre,
          hex: color.hex,
          fotos: color.fotos_color?.map((foto: SupabaseFotoColor) => ({
            id: foto.id,
            color_id: foto.color_id,
            url: foto.url,
            created_at: foto.created_at
          })) || [],
          created_at: color.created_at
        })) || [],
        tallas: producto.tallas?.map((talla: SupabaseTalla) => ({
          id: talla.id,
          producto_id: talla.producto_id,
          talla: talla.talla,
          en_stock: talla.en_stock,
          created_at: talla.created_at
        })) || [],
        fotos_medidas: producto.fotos_medidas?.map((foto: SupabaseFotoMedida) => ({
          id: foto.id,
          producto_id: foto.producto_id,
          url: foto.url,
          created_at: foto.created_at
        })) || []
      })) || []

      setProductos(productosFormateados)
    } catch (err) {
      console.error('Error fetching productos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const getProductoBySlug = async (slug: string): Promise<Producto | null> => {
    try {
      const { data: productoData, error: productoError } = await supabase
        .from('productos')
        .select(`
          *,
          colores (
            *,
            fotos_color (*)
          ),
          tallas (*),
          fotos_medidas (*)
        `)
        .eq('slug', slug)
        .eq('estado', 'activo')
        .single()

      if (productoError) throw productoError

      if (!productoData) return null

      // Transformar los datos al formato esperado
      const productoFormateado: Producto = {
        id: productoData.id,
        nombre: productoData.nombre,
        slug: productoData.slug,
        descripcion: productoData.descripcion || '',
        precio: productoData.precio,
        precio_mayor: productoData.precio_mayor,
        estado: productoData.estado,
        created_at: productoData.created_at,
        foto_principal: productoData.foto_principal,
        colores: productoData.colores?.map((color: SupabaseColor) => ({
          id: color.id,
          producto_id: color.producto_id,
          nombre: color.nombre,
          hex: color.hex,
          fotos: color.fotos_color?.map((foto: SupabaseFotoColor) => ({
            id: foto.id,
            color_id: foto.color_id,
            url: foto.url,
            created_at: foto.created_at
          })) || [],
          created_at: color.created_at
        })) || [],
        tallas: productoData.tallas?.map((talla: SupabaseTalla) => ({
          id: talla.id,
          producto_id: talla.producto_id,
          talla: talla.talla,
          en_stock: talla.en_stock,
          created_at: talla.created_at
        })) || [],
        fotos_medidas: productoData.fotos_medidas?.map((foto: SupabaseFotoMedida) => ({
          id: foto.id,
          producto_id: foto.producto_id,
          url: foto.url,
          created_at: foto.created_at
        })) || []
      }

      return productoFormateado
    } catch (err) {
      console.error('Error fetching producto by slug:', err)
      return null
    }
  }

  useEffect(() => {
    setIsMounted(true)
    fetchProductos()
  }, [])

  return {
    productos,
    isLoading: !isMounted || isLoading,
    error,
    refetch: fetchProductos,
    getProductoBySlug
  }
}
