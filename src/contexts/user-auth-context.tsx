"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { insforgeClient } from '@/lib/insforge-client'
import { fetchOrCreateUserCart } from '@/lib/cart-client'
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

type AuthUserNameSource = {
  email: string
  user_metadata?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  profile?: Record<string, unknown> | null
}

function nombreFromRecord(record?: Record<string, unknown> | null): string | undefined {
  if (!record) return undefined
  for (const key of ['nombre', 'name'] as const) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function nombreDesdeAuthUser(authUser: AuthUserNameSource): string {
  const meta =
    nombreFromRecord(authUser.user_metadata) ||
    nombreFromRecord(authUser.metadata) ||
    nombreFromRecord(authUser.profile)
  if (meta) return meta
  const local = authUser.email.split('@')[0]?.trim()
  return local || 'Cliente'
}

async function fetchUsuarioRow(
  userId: string,
  accessToken?: string | null
): Promise<Usuario | null> {
  if (accessToken) {
    try {
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.user?.id === userId) return json.user as Usuario
      }
    } catch (err) {
      console.error('fetchUsuarioRow /api/user/me:', err)
    }
  }

  const { data, error } = await insforgeClient
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (data && !error) return data
  return null
}

async function createUserProfile(
  userId: string,
  data: Pick<RegisterData, 'nombre' | 'email' | 'telefono'>,
  accessToken: string | null
): Promise<{ ok: boolean; user?: Usuario; error?: string; status?: number }> {
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
  if (profileRes.ok) {
    const user = profileJson.user as Usuario | undefined
    if (!user?.id) {
      return {
        ok: false,
        error:
          (profileJson.error as string) ||
          'No se pudo confirmar el perfil. Intenta iniciar sesión en unos segundos.',
      }
    }
    return { ok: true, user }
  }

  const msg = (profileJson.error as string) || 'Error al crear perfil de usuario'
  return { ok: false, error: msg, status: profileRes.status }
}

async function repairMissingUsuarioProfile(
  userId: string,
  email: string,
  accessToken: string | null,
  extras: { nombre?: string; telefono?: string | null }
): Promise<Usuario | null> {
  const existing = await fetchUsuarioRow(userId, accessToken)
  if (existing) return existing

  const profile = await createUserProfile(
    userId,
    {
      nombre: extras.nombre || email.split('@')[0] || 'Cliente',
      email,
      telefono: extras.telefono || '',
    },
    accessToken
  )

  if (!profile.ok) {
    console.error('repairMissingUsuarioProfile:', profile.error)
    return null
  }

  if (profile.user) return profile.user

  return fetchUsuarioRow(userId, accessToken)
}

interface UserAuthContextType {
  user: Usuario | null
  carrito: Carrito | null
  isAuthenticated: boolean
  emailVerified: boolean
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
  const [emailVerified, setEmailVerified] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const cartLoadRef = useRef<Promise<void> | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      if (!getStoredUserToken()) {
        setUser(null)
        setIsAuthenticated(false)
        setEmailVerified(true)
        return
      }

      const authUser = await fetchCurrentAuthUser()

      if (authUser) {
        const token = getStoredUserToken()
        let userData = await fetchUsuarioRow(authUser.id, token)

        if (!userData) {
          userData = await repairMissingUsuarioProfile(
            authUser.id,
            authUser.email,
            token,
            { nombre: nombreDesdeAuthUser(authUser) }
          )
        }

        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
          setEmailVerified(authUser.emailVerified ?? false)
          await loadCart(userData.id)
          return
        }

        console.error('No se pudo cargar ni reparar el perfil de usuario')
      }

      clearStoredUserSession()
      try {
        await insforgeClient.auth.signOut()
      } catch {
        // sin sesión activa en cookies
      }
      setUser(null)
      setIsAuthenticated(false)
      setEmailVerified(true)
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
      setEmailVerified(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const finalizeRegistration = async (
    authUser: AuthUserPayload,
    data: RegisterData,
    accessToken: string | null,
    options?: { sendVerificationEmail?: boolean }
  ): Promise<AuthActionResult> => {
    const profile = await createUserProfile(authUser.id, data, accessToken)
    if (!profile.ok) {
      try {
        await insforgeClient.auth.signOut()
      } catch {
        // sin sesión activa
      }
      clearStoredUserSession()
      return { success: false, error: profile.error, emailConflict: profile.status === 409 }
    }

    if (accessToken) {
      saveStoredUserToken(accessToken)
      const userRow =
        profile.user ?? (await fetchUsuarioRow(authUser.id, accessToken))

      if (!userRow) {
        return {
          success: false,
          error:
            'No pudimos completar tu perfil. Intenta iniciar sesión en unos segundos o contacta por WhatsApp.',
        }
      }

      setUser(userRow)
      setIsAuthenticated(true)
      setEmailVerified(authUser.emailVerified ?? false)
      await loadCart(authUser.id)
    }

    if (!authUser.emailVerified) {
      if (options?.sendVerificationEmail) {
        await insforgeClient.auth.resendVerificationEmail(data.email)
      }
      return {
        success: true,
        needsVerification: true,
        email: data.email,
      }
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

    if (data.password) {
      const { data: loginData } = await insforgeClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (loginData?.user) {
        return finalizeRegistration(
          loginData.user,
          data,
          loginData.session?.access_token ?? null,
          { sendVerificationEmail: false }
        )
      }
    }

    return {
      success: true,
      needsVerification: true,
      email: data.email,
    }
  }

  const loadCart = useCallback(async (userId: string) => {
    if (cartLoadRef.current) {
      await cartLoadRef.current
      return
    }

    const task = (async () => {
      try {
        const carritoData = await fetchOrCreateUserCart(userId)
        if (carritoData) setCarrito(carritoData)
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    })()

    cartLoadRef.current = task
    try {
      await task
    } finally {
      cartLoadRef.current = null
    }
  }, [])

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
        const authErr = authError as { message?: string; statusCode?: number }
        if (isEmailVerificationError(authErr.message ?? '')) {
          return requestEmailVerification(data.email)
        }
        return { success: false, error: authErr.message || 'Error al iniciar sesión' }
      }

      if (authData?.user && authData?.session) {
        saveStoredUserToken(authData.session.access_token)

        const token = authData.session.access_token
        let userData = await fetchUsuarioRow(authData.user.id, token)

        if (!userData) {
          userData = await repairMissingUsuarioProfile(
            authData.user.id,
            authData.user.email,
            token,
            { nombre: nombreDesdeAuthUser(authData.user) }
          )
        }

        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
          setEmailVerified(authData.user.emailVerified ?? false)
          await loadCart(userData.id)

          if (!authData.user.emailVerified) {
            return {
              success: true,
              needsVerification: true,
              email: data.email,
            }
          }

          return { success: true }
        }

        console.error('No se pudo cargar el perfil tras iniciar sesión')
        return {
          success: false,
          error:
            'No pudimos completar tu perfil. Intenta de nuevo en unos segundos o contacta por WhatsApp.',
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
              loginData.session?.access_token ?? null,
              { sendVerificationEmail: false }
            )
          }

          return ensureProfileAfterAuthSignup(data, { sendVerificationEmail: true })
        }

        return { success: false, error: authErr.message || 'Error al crear cuenta' }
      }

      if (authData?.user) {
        return finalizeRegistration(
          authData.user,
          data,
          authData.accessToken ?? null,
          { sendVerificationEmail: !(authData.user.emailVerified ?? false) }
        )
      }

      if (authData?.requireEmailVerification) {
        return ensureProfileAfterAuthSignup(data)
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
      setEmailVerified(true)
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
        setEmailVerified(authUser.emailVerified ?? false)
        const token = getStoredUserToken()
        const userData = await fetchUsuarioRow(authUser.id, token)
        if (userData) {
          setUser(userData)
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
      emailVerified,
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
