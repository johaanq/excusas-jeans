"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { insforgeClient } from "@/lib/insforge-client"
import { mapProductoFromRow, PRODUCTOS_ACTIVE_SELECT, type ProductoRow } from "@/lib/producto-db"
import type { Producto } from "@/data/productos"

interface UseProductosReturn {
  productos: Producto[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  featuredProducts: Producto[]
}

let productosCache: Producto[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000

export function useProductos(): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const fetchProductos = useCallback(async () => {
    try {
      const now = Date.now()
      if (productosCache && now - cacheTimestamp < CACHE_DURATION) {
        setProductos(productosCache)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      const { data: productosData, error: productosError } = await insforgeClient
        .from('productos')
        .select(PRODUCTOS_ACTIVE_SELECT)
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })

      if (productosError) throw productosError

      const productosFormateados =
        productosData?.map((row) => mapProductoFromRow(row as ProductoRow)) ?? []

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
    setIsMounted(true)
    fetchProductos()
  }, [fetchProductos])

  const featuredProducts = useMemo(() => productos.slice(0, 10), [productos])

  return {
    productos,
    isLoading: !isMounted || isLoading,
    error,
    refetch: fetchProductos,
    featuredProducts,
  }
}
