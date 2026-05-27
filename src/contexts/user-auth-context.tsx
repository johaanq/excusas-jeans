"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { insforgeClient } from '@/lib/insforge-client'
import {
  clearStoredUserSession,
  fetchCurrentAuthUser,
  getStoredUserToken,
  saveStoredUserToken,
} from '@/lib/auth-session'
import { Usuario, LoginData, RegisterData, Carrito } from '@/types/user'
import { AuthActionResult, isEmailVerificationError, isUserAlreadyExistsError } from '@/types/auth'

type AuthUserPayload = {
  id: string
  email: string
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

interface UserAuthContextType {
  user: Usuario | null
  carrito: Carrito | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginData) => Promise<AuthActionResult>
  register: (data: RegisterData) => Promise<AuthActionResult>
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
      if (!getStoredUserToken()) {
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      const authUser = await fetchCurrentAuthUser()

      if (authUser) {
        const { data: userData, error: userError } = await insforgeClient
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
          setIsAuthenticated(true)
          await loadCart(userData.id)
          return
        }

        console.error('Error fetching user data:', userError)
      }

      clearStoredUserSession()
      try {
        await insforgeClient.auth.signOut()
      } catch {
        // sin sesión activa en cookies
      }
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error checking auth:', error)
      clearStoredUserSession()
      try {
        await insforgeClient.auth.signOut()
      } catch {
        // ignorar
      }
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const createUserProfile = async (
    userId: string,
    data: Pick<RegisterData, 'nombre' | 'email' | 'telefono'>,
    accessToken: string | null
  ): Promise<{ ok: boolean; error?: string }> => {
    const profileRes = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        accessToken,
      }),
    })
    const profileJson = await profileRes.json()
    if (profileRes.ok) return { ok: true }

    const msg = (profileJson.error as string) || ''
    const alreadyInDb =
      msg.toLowerCase().includes('duplicate') ||
      msg.toLowerCase().includes('unique') ||
      msg.toLowerCase().includes('ya existe')
    if (alreadyInDb) return { ok: true }

    return { ok: false, error: msg || 'Error al crear perfil de usuario' }
  }

  const finalizeRegistration = async (
    authUser: AuthUserPayload,
    data: RegisterData,
    accessToken: string | null
  ): Promise<AuthActionResult> => {
    const profile = await createUserProfile(authUser.id, data, accessToken)
    if (!profile.ok) {
      return { success: false, error: profile.error }
    }

    if (!authUser.emailVerified) {
      // signUp ya envió el correo con enlace; un resend aquí invalida el token anterior.
      return {
        success: true,
        needsVerification: true,
        email: data.email,
      }
    }

    if (accessToken) {
      saveStoredUserToken(accessToken)
      setUser({
        id: authUser.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        created_at: authUser.createdAt,
        updated_at: authUser.updatedAt,
      })
      setIsAuthenticated(true)
      await loadCart(authUser.id)
    }

    return { success: true }
  }

  const ensureProfileAfterAuthSignup = async (
    data: RegisterData,
    options?: { sendVerificationEmail?: boolean }
  ): Promise<AuthActionResult> => {
    const res = await fetch('/api/user/ensure-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        nombre: data.nombre,
        telefono: data.telefono || null,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, error: json.error || 'No se pudo crear el perfil' }
    }

    if (options?.sendVerificationEmail) {
      await insforgeClient.auth.resendVerificationEmail(data.email)
    }

    return {
      success: true,
      needsVerification: true,
      email: data.email,
    }
  }

  const loadCart = async (userId: string) => {
    try {
      // Obtener o crear carrito
      let carritoData = null
      
      const { data: existingCarrito, error: carritoError } = await insforgeClient
        .from('carritos')
        .select(`
          *,
          items:carrito_items (
            *,
            producto:productos (id, nombre, slug, precio, precio_mayor, foto_principal),
            color:colores (id, nombre, hex, fotos_color (id, url))
          )
        `)
        .eq('usuario_id', userId)
        .single()

      if (carritoError && carritoError.code === 'PGRST116') {
        // No existe carrito, crear uno nuevo
        const { data: newCarrito, error: newCarritoError } = await insforgeClient
          .from('carritos')
          .insert({ usuario_id: userId })
          .select(`
            *,
            items:carrito_items (
              *,
              producto:productos (id, nombre, slug, precio, precio_mayor, foto_principal),
              color:colores (id, nombre, hex, fotos_color (id, url))
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

  const requestEmailVerification = async (email: string): Promise<AuthActionResult> => {
    const { error } = await insforgeClient.auth.resendVerificationEmail(email)
    if (error) {
      return {
        success: false,
        error: error.message || 'No se pudo enviar el código de verificación',
      }
    }
    return {
      success: false,
      needsVerification: true,
      email,
      error: 'Debes verificar tu correo. Te enviamos un enlace; ábrelo y luego inicia sesión.',
    }
  }

  const login = async (data: LoginData): Promise<AuthActionResult> => {
    try {
      const { data: authData, error: authError } = await insforgeClient.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        console.error('Auth error:', authError)
        if (isEmailVerificationError(authError.message)) {
          return requestEmailVerification(data.email)
        }
        return { success: false, error: authError.message }
      }

      if (authData?.user && !authData.user.emailVerified) {
        await insforgeClient.auth.signOut()
        clearStoredUserSession()
        return requestEmailVerification(data.email)
      }

      if (authData?.user && authData?.session) {
        saveStoredUserToken(authData.session.access_token)
        const { data: userData, error: userError } = await insforgeClient
          .from('usuarios')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
          setIsAuthenticated(true)
          await loadCart(userData.id)
          return { success: true }
        }

        console.error('User data error:', userError)
        return {
          success: false,
          error:
            'Tu cuenta existe en el sistema pero falta el perfil. Ve a Registrarse con el mismo correo y contraseña para completarla.',
        }
      }

      return { success: false, error: 'Error al iniciar sesión' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Error inesperado al iniciar sesión' }
    }
  }

  const register = async (data: RegisterData): Promise<AuthActionResult> => {
    try {
      const { data: authData, error: authError } = await insforgeClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { nombre: data.nombre } },
      })

      if (authError) {
        const authErr = authError as { message?: string; statusCode?: number }
        if (isUserAlreadyExistsError(authErr.message ?? '', authErr.statusCode)) {
          const { data: loginData, error: loginError } = await insforgeClient.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          })

          if (loginError) {
            const loginErr = loginError as { message?: string; statusCode?: number }
            if (isEmailVerificationError(loginErr.message ?? '')) {
              return ensureProfileAfterAuthSignup(data, { sendVerificationEmail: true })
            }
            return {
              success: false,
              error:
                'Ya existe una cuenta con este correo. Inicia sesión con tu contraseña o usa «¿Olvidaste tu contraseña?».',
            }
          }

          if (loginData?.user) {
            return finalizeRegistration(
              loginData.user,
              data,
              loginData.session?.access_token ?? null
            )
          }

          return ensureProfileAfterAuthSignup(data, { sendVerificationEmail: true })
        }

        return { success: false, error: authErr.message || 'Error al crear cuenta' }
      }

      if (authData?.requireEmailVerification && !authData.user) {
        return ensureProfileAfterAuthSignup(data)
      }

      if (authData?.user) {
        return finalizeRegistration(
          authData.user,
          data,
          authData.accessToken ?? null
        )
      }

      return { success: false, error: 'Error al crear cuenta' }
    } catch {
      return { success: false, error: 'Error inesperado al registrarse' }
    }
  }

  const logout = async () => {
    try {
      await insforgeClient.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      clearStoredUserSession()
      setUser(null)
      setCarrito(null)
      setIsAuthenticated(false)
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
        const { error } = await insforgeClient
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
      const { error } = await insforgeClient
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
      const { error } = await insforgeClient
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
      const { error } = await insforgeClient
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
      const authUser = await fetchCurrentAuthUser()

      if (authUser) {
        const { data: userData, error: userError } = await insforgeClient
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
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
