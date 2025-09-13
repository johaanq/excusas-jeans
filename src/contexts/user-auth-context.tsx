"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, LoginData, RegisterData, Carrito } from '@/types/user'

interface UserAuthContextType {
  user: Usuario | null
  carrito: Carrito | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  addToCart: (productoId: string, colorId: string, talla: string, cantidad?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateCartItemQuantity: (itemId: string, cantidad: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [carrito, setCarrito] = useState<Carrito | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      // Verificar sesión activa con Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
      
      if (supabaseUser && !error) {
        // Obtener datos del usuario desde nuestra tabla
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', supabaseUser.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
          setIsAuthenticated(true)
          await loadCart(userData.id)
        } else {
          console.error('Error fetching user data:', userError)
          // Limpiar tokens inválidos
          await supabase.auth.signOut()
          localStorage.removeItem('user_token')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        // No hay sesión activa, limpiar estado
        await supabase.auth.signOut()
        localStorage.removeItem('user_token')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      // Limpiar tokens inválidos en caso de error
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error('Error signing out:', signOutError)
      }
      localStorage.removeItem('user_token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()

    // Escuchar cambios en la autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            setUser(null)
            setCarrito(null)
            setIsAuthenticated(false)
            localStorage.removeItem('user_token')
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Usuario se autenticó, obtener datos
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !userError) {
            setUser(userData)
            setIsAuthenticated(true)
            await loadCart(userData.id)
            localStorage.setItem('user_token', session.access_token)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuth])

  const loadCart = async (userId: string) => {
    try {
      // Obtener o crear carrito
      let carritoData = null
      
      const { data: existingCarrito, error: carritoError } = await supabase
        .from('carritos')
        .select(`
          *,
          items:carrito_items (
            *,
            producto:productos (id, nombre, slug, precio, precio_mayor),
            color:colores (id, nombre, hex)
          )
        `)
        .eq('usuario_id', userId)
        .single()

      if (carritoError && carritoError.code === 'PGRST116') {
        // No existe carrito, crear uno nuevo
        const { data: newCarrito, error: newCarritoError } = await supabase
          .from('carritos')
          .insert({ usuario_id: userId })
          .select(`
            *,
            items:carrito_items (
              *,
              producto:productos (id, nombre, slug, precio, precio_mayor),
              color:colores (id, nombre, hex)
            )
          `)
          .single()

        if (newCarrito && !newCarritoError) {
          carritoData = newCarrito
        }
      } else if (existingCarrito) {
        carritoData = existingCarrito
      }

      if (carritoData) {
        setCarrito(carritoData)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        console.error('Auth error:', authError)
        return { success: false, error: authError.message }
      }

      if (authData.user && authData.session) {
        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
          setIsAuthenticated(true)
          await loadCart(userData.id)
          localStorage.setItem('user_token', authData.session.access_token)
          return { success: true }
        } else {
          console.error('User data error:', userError)
          return { success: false, error: 'Error al obtener datos del usuario' }
        }
      }

      return { success: false, error: 'Error al iniciar sesión' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Error inesperado al iniciar sesión' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // Crear registro en nuestra tabla de usuarios
        const { error: userError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono
          })

        if (userError) {
          return { success: false, error: 'Error al crear perfil de usuario' }
        }

        return { success: true }
      }

      return { success: false, error: 'Error al crear cuenta' }
    } catch {
      return { success: false, error: 'Error inesperado al registrarse' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCarrito(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user_token')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const addToCart = async (productoId: string, colorId: string, talla: string, cantidad: number = 1) => {
    if (!user || !carrito) return

    try {
      // Verificar si el item ya existe
      const existingItem = carrito.items?.find(
        item => item.producto_id === productoId && item.color_id === colorId && item.talla === talla
      )

      if (existingItem) {
        // Actualizar cantidad
        await updateCartItemQuantity(existingItem.id, existingItem.cantidad + cantidad)
      } else {
        // Agregar nuevo item
        const { error } = await supabase
          .from('carrito_items')
          .insert({
            carrito_id: carrito.id,
            producto_id: productoId,
            color_id: colorId,
            talla,
            cantidad
          })

        if (!error) {
          await refreshCart()
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('carrito_items')
        .delete()
        .eq('id', itemId)

      if (!error) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const updateCartItemQuantity = async (itemId: string, cantidad: number) => {
    try {
      const { error } = await supabase
        .from('carrito_items')
        .update({ cantidad })
        .eq('id', itemId)

      if (!error) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
    }
  }

  const clearCart = async () => {
    if (!carrito) return

    try {
      const { error } = await supabase
        .from('carrito_items')
        .delete()
        .eq('carrito_id', carrito.id)

      if (!error) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const refreshCart = async () => {
    if (!user) return
    await loadCart(user.id)
  }

  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
      
      if (supabaseUser && !error) {
        // Obtener datos actualizados del usuario desde nuestra tabla
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', supabaseUser.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
          console.log('User data refreshed:', userData)
        } else {
          console.error('Error refreshing user data:', userError)
        }
      }
    } catch {
      console.error('Error refreshing user')
    }
  }

  return (
    <UserAuthContext.Provider value={{
      user,
      carrito,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      refreshCart,
      refreshUser
    }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}
