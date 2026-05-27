"use client"

import type React from "react"
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react"
import type { Producto, Color } from "@/data/productos"
import { useUserAuth } from "@/contexts/user-auth-context"

export interface CartItem {
  producto: Producto
  color: Color
  talla: string
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (producto: Producto, color: Color, talla: string, cantidad?: number) => void
  removeItem: (productId: string, colorId: string, talla: string) => void
  updateQuantity: (productId: string, colorId: string, talla: string, cantidad: number) => void
  clearCart: () => void
  /** @deprecated Usar totalItems */
  getTotalItems: () => number
  /** @deprecated Usar totalPrice */
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { isAuthenticated, addToCart: addToServerCart, carrito } = useUserAuth()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.cantidad, 0),
    [items]
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + (item.producto.precio ?? 0) * item.cantidad, 0),
    [items]
  )

  useEffect(() => {
    if (typeof window === "undefined" || isAuthenticated) return
    const savedCart = localStorage.getItem("ecommerce_cart")
    if (!savedCart) return
    try {
      setItems(JSON.parse(savedCart))
    } catch {
      localStorage.removeItem("ecommerce_cart")
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !carrito?.items) return

    const converted: CartItem[] = carrito.items
      .filter((item) => item.producto && item.color)
      .map((item) => {
        const colorRow = item.color as {
          id: string
          nombre: string
          hex: string
          fotos_color?: { id: string; url: string }[]
        }

        return {
          producto: {
            id: item.producto!.id,
            nombre: item.producto!.nombre,
            slug: item.producto!.slug,
            descripcion: "",
            precio: item.producto!.precio,
            precio_mayor: item.producto!.precio_mayor,
            estado: "activo",
            foto_principal:
              (item.producto as { foto_principal?: string }).foto_principal ?? "",
            created_at: "",
            colores: [],
            tallas: [],
            fotos_medidas: [],
          },
          color: {
            id: colorRow.id,
            producto_id: item.producto_id,
            nombre: colorRow.nombre,
            hex: colorRow.hex,
            fotos:
              colorRow.fotos_color?.map((f) => ({
                id: f.id,
                color_id: colorRow.id,
                url: f.url,
                created_at: "",
              })) ?? [],
            created_at: "",
          },
          talla: item.talla,
          cantidad: item.cantidad,
        }
      })

    setItems(converted)
  }, [isAuthenticated, carrito])

  useEffect(() => {
    if (typeof window === "undefined" || isAuthenticated) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem("ecommerce_cart", JSON.stringify(items))
    }, 400)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [items, isAuthenticated])

  const dispatchAdded = useCallback(
    (producto: Producto, color: Color, talla: string, cantidad: number) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cartItemAdded", {
            detail: { producto, color, talla, cantidad },
          })
        )
      }
    },
    []
  )

  const addItem = useCallback(
    async (producto: Producto, color: Color, talla: string, cantidad = 1) => {
      if (isAuthenticated) {
        try {
          await addToServerCart(producto.id, color.id, talla, cantidad)
          dispatchAdded(producto, color, talla, cantidad)
        } catch (error) {
          console.error("Error adding to server cart:", error)
          alert("Error al agregar al carrito")
        }
        return
      }

      setItems((prev) => {
        const idx = prev.findIndex(
          (i) =>
            i.producto.id === producto.id &&
            i.color.id === color.id &&
            i.talla === talla
        )
        if (idx > -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], cantidad: next[idx].cantidad + cantidad }
          return next
        }
        return [...prev, { producto, color, talla, cantidad }]
      })
      dispatchAdded(producto, color, talla, cantidad)
    },
    [isAuthenticated, addToServerCart, dispatchAdded]
  )

  const removeItem = useCallback((productId: string, colorId: string, talla: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.producto.id === productId &&
            item.color.id === colorId &&
            item.talla === talla
          )
      )
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, colorId: string, talla: string, cantidad: number) => {
      if (cantidad <= 0) {
        removeItem(productId, colorId, talla)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.producto.id === productId &&
          item.color.id === colorId &&
          item.talla === talla
            ? { ...item, cantidad }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems: () => totalItems,
      getTotalPrice: () => totalPrice,
    }),
    [
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
