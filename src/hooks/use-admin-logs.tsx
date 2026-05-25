"use client"

import { useState, useCallback } from 'react'
import { adminQuery } from '@/lib/admin-api'
import { useAuth } from '@/contexts/auth-context'

export interface AdminLog {
  id: string
  admin_username: string
  admin_nombre: string
  action: string
  description: string | null
  resource_type: string | null
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface LogFilters {
  admin_id?: string
  action?: string
  limit?: number
  offset?: number
}

export function useAdminLogs() {
  const { getAdminCredentials } = useAuth()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchLogs = useCallback(async (filters: LogFilters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const creds = getAdminCredentials()
      if (!creds) {
        setError('Vuelve a iniciar sesión en el panel admin para ver los logs.')
        setLogs([])
        setTotalCount(0)
        return
      }

      const limit = filters.limit || 50
      const offset = filters.offset || 0

      const rows = await adminQuery<AdminLog[]>({
        table: 'admin_logs',
        op: 'rpc',
        rpc: 'obtener_admin_logs',
        rpcArgs: {
          p_limit: limit,
          p_offset: offset,
          p_admin_id: filters.admin_id || null,
          p_action: filters.action || null,
          p_username: creds.username,
          p_password: creds.password,
        },
      })
      setLogs(rows)
      setTotalCount(rows.length < limit ? offset + rows.length : offset + limit + 1)
    } catch (err) {
      console.error('Error fetching admin logs:', err)
      setError(`Error al cargar los logs: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }, [getAdminCredentials])

  const logAction = useCallback(async (
    adminId: string,
    action: string,
    description?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      // Obtener información del navegador
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
      
      const res = await fetch('/api/admin/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          action,
          description: description ?? null,
          resourceType: resourceType ?? null,
          resourceId: resourceId ?? null,
          userAgent,
          metadata: metadata ?? null,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        console.error('Error logging admin action:', json.error)
      }
    } catch (err) {
      console.error('Error logging admin action:', err)
    }
  }, [])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return '🔐'
      case 'logout':
        return '🚪'
      case 'create_producto':
        return '➕'
      case 'update_producto':
        return '✏️'
      case 'delete_producto':
        return '🗑️'
      case 'create_admin':
        return '👤'
      case 'update_admin':
        return '👤✏️'
      case 'delete_admin':
        return '👤🗑️'
      case 'view_logs':
        return '📋'
      case 'export_data':
        return '📤'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'text-green-600 bg-green-50'
      case 'logout':
        return 'text-gray-600 bg-gray-50'
      case 'create_producto':
        return 'text-blue-600 bg-blue-50'
      case 'update_producto':
        return 'text-yellow-600 bg-yellow-50'
      case 'delete_producto':
        return 'text-red-600 bg-red-50'
      case 'create_admin':
        return 'text-purple-600 bg-purple-50'
      case 'update_admin':
        return 'text-purple-600 bg-purple-50'
      case 'delete_admin':
        return 'text-red-600 bg-red-50'
      case 'view_logs':
        return 'text-indigo-600 bg-indigo-50'
      case 'export_data':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    logs,
    isLoading,
    error,
    totalCount,
    fetchLogs,
    logAction,
    getActionIcon,
    getActionColor,
    formatDate
  }
}
