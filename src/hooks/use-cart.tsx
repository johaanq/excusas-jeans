"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
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
  addItem: (producto: Producto, color: Color, talla: string, cantidad?: number) => void
  removeItem: (productId: string, colorId: string, talla: string) => void
  updateQuantity: (productId: string, colorId: string, talla: string, cantidad: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { isAuthenticated, addToCart: addToSupabaseCart, carrito } = useUserAuth()

  // Load cart from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      const savedCart = localStorage.getItem("ecommerce_cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
        }
      }
    }
  }, [isAuthenticated])

  // Load cart from Supabase for authenticated users
  useEffect(() => {
    if (isAuthenticated && carrito?.items) {
      // Convert Supabase cart items to local cart format
      const convertedItems: CartItem[] = carrito.items
        .filter(item => item.producto && item.color)
        .map((item) => {
          // Type guard to ensure producto and color exist
          if (!item.producto || !item.color) {
            throw new Error('Invalid cart item: missing producto or color')
          }
          
          return {
            producto: {
              id: item.producto.id,
              nombre: item.producto.nombre,
              slug: item.producto.slug,
              descripcion: '',
              precio: item.producto.precio,
              precio_mayor: item.producto.precio_mayor,
              estado: 'activo',
              foto_principal: '',
              created_at: '',
              colores: [],
              tallas: [],
              fotos_medidas: []
            },
            color: {
              id: item.color.id,
              producto_id: item.producto_id,
              nombre: item.color.nombre,
              hex: item.color.hex,
              fotos: [],
              created_at: ''
            },
            talla: item.talla,
            cantidad: item.cantidad
          }
        })
      setItems(convertedItems)
    }
  }, [isAuthenticated, carrito])

  // Save cart to localStorage whenever items change (for non-authenticated users)
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      localStorage.setItem("ecommerce_cart", JSON.stringify(items))
    }
  }, [items, isAuthenticated])

  const addItem = async (producto: Producto, color: Color, talla: string, cantidad = 1) => {

    if (isAuthenticated) {
      // For authenticated users, add to Supabase cart
      try {
        await addToSupabaseCart(producto.id, color.id, talla, cantidad)
        // The cart will be updated via the useEffect that watches carrito
        // Dispatch custom event to notify cart preview
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartItemAdded', { 
            detail: { producto, color, talla, cantidad } 
          }))
        }
      } catch (error) {
        console.error('Error adding to Supabase cart:', error)
        alert('Error al agregar al carrito')
      }
    } else {
      // For non-authenticated users, use local storage
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.producto.id === producto.id && item.color.id === color.id && item.talla === talla,
        )

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].cantidad += cantidad
          return updatedItems
        } else {
          // Add new item
          return [...prevItems, { producto, color, talla, cantidad }]
        }
      })
      
      // Dispatch custom event to notify cart preview
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartItemAdded', { 
          detail: { producto, color, talla, cantidad } 
        }))
      }
    }
  }

  const removeItem = (productId: string, colorId: string, talla: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.producto.id === productId && item.color.id === colorId && item.talla === talla),
      ),
    )
  }

  const updateQuantity = (productId: string, colorId: string, talla: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productId, colorId, talla)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.producto.id === productId && item.color.id === colorId && item.talla === talla
          ? { ...item, cantidad }
          : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.producto.precio || 0) * item.cantidad, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
