"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminUser {
  id: string
  username: string
  nombre: string
  email?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  adminUser: AdminUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  getAdminCredentials: () => { username: string; password: string } | null
  logAdminAction: (action: string, description?: string, resourceType?: string, resourceId?: string, metadata?: Record<string, unknown>) => Promise<void>
}

const ADMIN_SESSION_PW_KEY = 'admin_session_pw'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la página
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const adminData = localStorage.getItem('admin_user')
      
      if (token && adminData) {
        // Solo verificar que los datos existen, no hacer consulta a DB
        const userData = JSON.parse(adminData)
        setAdminUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // Limpiar datos en caso de error
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      setAdminUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()

      if (!res.ok) {
        console.error('Error verifying admin credentials:', json.error)
        return false
      }

      const adminData = json.data
      if (adminData) {
        const userData: AdminUser = {
          id: adminData.id,
          username: adminData.username,
          nombre: adminData.nombre,
          email: adminData.email
        }

        // Generar token simple para mantener sesión
        const token = btoa(`${username}:${Date.now()}`)
        
        // Guardar en localStorage
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        sessionStorage.setItem(ADMIN_SESSION_PW_KEY, password)
        
        setAdminUser(userData)
        setIsAuthenticated(true)

        // Registrar login en logs (sin await para no bloquear)
        logAdminAction('login', `Inicio de sesión exitoso para ${userData.nombre}`).catch(console.error)
        
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    // Registrar logout en logs antes de limpiar la sesión (sin await)
    if (adminUser) {
      logAdminAction('logout', `Cierre de sesión para ${adminUser.nombre}`).catch(console.error)
    }
    
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    sessionStorage.removeItem(ADMIN_SESSION_PW_KEY)
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  const getAdminCredentials = (): { username: string; password: string } | null => {
    if (!adminUser) return null
    const password = sessionStorage.getItem(ADMIN_SESSION_PW_KEY)
    if (!password) return null
    return { username: adminUser.username, password }
  }

  const logAdminAction = async (
    action: string,
    description?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!adminUser) return

    try {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
      
      await fetch('/api/admin/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          action,
          description: description ?? null,
          resourceType: resourceType ?? null,
          resourceId: resourceId ?? null,
          userAgent,
          metadata: metadata ?? null,
        }),
      })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, adminUser, login, logout, getAdminCredentials, logAdminAction }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
