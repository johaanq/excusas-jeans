"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

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
  logAdminAction: (action: string, description?: string, resourceType?: string, resourceId?: string, metadata?: any) => Promise<void>
}

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
      const { data, error } = await supabase
        .rpc('verificar_admin_credenciales', {
          p_username: username,
          p_password: password
        })

      if (error) {
        console.error('Error verifying admin credentials:', error)
        return false
      }

      if (data && data.length > 0) {
        const adminData = data[0]
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
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  const logAdminAction = async (
    action: string,
    description?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ) => {
    if (!adminUser) return

    try {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
      
      await supabase.rpc('registrar_admin_log', {
        p_admin_id: adminUser.id,
        p_action: action,
        p_description: description || null,
        p_resource_type: resourceType || null,
        p_resource_id: resourceId || null,
        p_ip_address: null,
        p_user_agent: userAgent,
        p_metadata: metadata || null
      })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, adminUser, login, logout, logAdminAction }}>
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
