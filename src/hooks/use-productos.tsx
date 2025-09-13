"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Producto, SupabaseColor, SupabaseFotoColor, SupabaseTalla, SupabaseFotoMedida } from "@/data/productos"

interface UseProductosReturn {
  productos: Producto[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  featuredProducts: Producto[]
}

// Cache simple para evitar llamadas innecesarias
let productosCache: Producto[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useProductos(): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductos = useCallback(async () => {
    try {
      // Verificar cache primero
      const now = Date.now()
      if (productosCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setProductos(productosCache)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      // Obtener productos activos desde Supabase
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
        foto_principal: producto.foto_principal,
        created_at: producto.created_at,
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

      // Actualizar cache
      productosCache = productosFormateados
      cacheTimestamp = now
      setProductos(productosFormateados)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos")
      console.error("Error fetching productos:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  // Memoizar productos destacados para evitar recálculos
  const featuredProducts = useMemo(() => {
    return productos.slice(0, 4)
  }, [productos])

  return {
    productos,
    isLoading,
    error,
    refetch: fetchProductos,
    featuredProducts,
  }
}
